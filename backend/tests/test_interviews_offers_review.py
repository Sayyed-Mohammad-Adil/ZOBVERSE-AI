import pytest
import httpx
from httpx import ASGITransport
from app.main import app
from datetime import datetime, timedelta
import uuid

@pytest.mark.asyncio
async def test_interviews_lifecycle():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Register a test user
        email = f"interview_test_{uuid.uuid4().hex[:6]}@example.com"
        reg = await client.post("/api/v1/auth/register", json={"email": email, "password": "Password123!"})
        user_id = reg.json()["id"]

        # Create interview
        interview_date = (datetime.utcnow() + timedelta(days=2)).isoformat()
        res = await client.post(
            f"/api/v1/interviews/{user_id}",
            json={
                "company": "Stripe",
                "role": "Senior Backend Engineer",
                "interview_date": interview_date,
                "round": "Technical Screening",
                "interviewer": "Engineering Lead",
                "notes": "Discuss distributed systems and Python async patterns"
            }
        )
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["company"] == "Stripe"
        assert data["round"] == "Technical Screening"
        interview_id = data["id"]

        # List interviews
        list_res = await client.get(f"/api/v1/interviews/{user_id}")
        assert list_res.status_code == 200
        assert len(list_res.json()) >= 1

        # Update interview
        up_res = await client.put(
            f"/api/v1/interviews/{interview_id}",
            json={"feedback": "Passed screening with strong recommendation", "next_step": "System Design Round"}
        )
        assert up_res.status_code == 200
        assert up_res.json()["feedback"] == "Passed screening with strong recommendation"

        # Teardown
        from sqlalchemy import text
        from app.core.database import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            await session.execute(text("DELETE FROM interviews WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM audit_logs WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": user_id})
            await session.commit()

@pytest.mark.asyncio
async def test_offers_lifecycle():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        email = f"offer_test_{uuid.uuid4().hex[:6]}@example.com"
        reg = await client.post("/api/v1/auth/register", json={"email": email, "password": "Password123!"})
        user_id = reg.json()["id"]

        # Create offer
        res = await client.post(
            f"/api/v1/offers/{user_id}",
            json={
                "company": "GitHub",
                "role": "Staff Platform Engineer",
                "base_salary": 185000.0,
                "bonus": None,
                "equity": "$80,000 RSUs / 4 yrs",
                "currency": "USD",
                "location": "Remote",
                "work_mode": None,
                "status": "PENDING",
                "notes": "401k match and unlimited PTO"
            }
        )
        assert res.status_code == 200, res.text
        offer_data = res.json()
        assert offer_data["base_salary"] == 185000.0
        assert offer_data["bonus"] is None
        assert offer_data["work_mode"] is None
        offer_id = offer_data["id"]

        # List offers
        list_res = await client.get(f"/api/v1/offers/{user_id}")
        assert list_res.status_code == 200
        assert len(list_res.json()) >= 1

        # Update status
        up_res = await client.put(
            f"/api/v1/offers/{offer_id}",
            json={"status": "ACCEPTED"}
        )
        assert up_res.status_code == 200
        assert up_res.json()["status"] == "ACCEPTED"

        # Teardown
        from sqlalchemy import text
        from app.core.database import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            await session.execute(text("DELETE FROM offers WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM audit_logs WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": user_id})
            await session.commit()

@pytest.mark.asyncio
async def test_review_queue_and_csv_import():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        email = f"review_test_{uuid.uuid4().hex[:6]}@example.com"
        reg = await client.post("/api/v1/auth/register", json={"email": email, "password": "Password123!"})
        user_id = reg.json()["id"]

        # Test CSV application import
        csv_content = "company,role,url,status\nAcme Corp,Senior Python Dev,https://acme.com/job,APPLIED\nGlobex,Go Engineer,https://globex.com/job,INTERVIEW\n"
        import_res = await client.post(
            f"/api/v1/applications/import-csv?user_id={user_id}",
            files={"file": ("history.csv", csv_content.encode("utf-8"), "text/csv")}
        )
        assert import_res.status_code == 200, import_res.text
        assert import_res.json()["imported"] == 2

        # Check applications list
        apps_res = await client.get(f"/api/v1/applications/{user_id}")
        assert apps_res.status_code == 200
        assert len(apps_res.json()) == 2
        assert all(app["job_source"] == "CSV_IMPORT" for app in apps_res.json())

        # Imported application history is not presented as an open job listing.
        jobs_res = await client.get("/api/v1/jobs/?limit=500")
        assert jobs_res.status_code == 401

        # Test Review Queue
        review_res = await client.get(f"/api/v1/review/{user_id}")
        assert review_res.status_code == 200
        assert isinstance(review_res.json(), list)

        # Teardown test artifacts so live database is not polluted
        from sqlalchemy import text
        from app.core.database import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            await session.execute(text("DELETE FROM applications WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM jobs WHERE company IN ('Acme Corp', 'Globex')"))
            await session.execute(text("DELETE FROM audit_logs WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": user_id})
            await session.commit()


@pytest.mark.asyncio
async def test_job_search_is_scoped_to_discovering_user():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        accounts = []
        for _ in range(2):
            email = f"job_scope_{uuid.uuid4().hex[:8]}@example.com"
            registration = await client.post(
                "/api/v1/auth/register",
                json={"email": email, "password": "Password123!"},
            )
            assert registration.status_code == 200
            user_id = registration.json()["id"]
            login = await client.post(
                "/api/v1/auth/login",
                data={"username": email, "password": "Password123!"},
            )
            assert login.status_code == 200
            accounts.append(
                (user_id, {"Authorization": f"Bearer {login.json()['access_token']}"})
            )

        from app.core.database import AsyncSessionLocal
        from app.models.job import Job
        from app.models.user_job import UserJob

        owner_id = accounts[0][0]
        async with AsyncSessionLocal() as session:
            job = Job(
                source="LINKEDIN",
                external_job_id=f"scope_test_{uuid.uuid4().hex}",
                company="Isolated Listing",
                title="Python Engineer",
                description="Listing used to verify account-scoped search.",
            )
            session.add(job)
            await session.flush()
            session.add(UserJob(user_id=owner_id, job_id=job.id))
            await session.commit()
            job_id = job.id

        owner_results = await client.get(
            "/api/v1/jobs/?query=Isolated%20Listing",
            headers=accounts[0][1],
        )
        other_results = await client.get(
            "/api/v1/jobs/?query=Isolated%20Listing",
            headers=accounts[1][1],
        )
        cross_user_results = await client.get(
            f"/api/v1/jobs/?user_id={accounts[0][0]}",
            headers=accounts[1][1],
        )
        other_job_detail = await client.get(
            f"/api/v1/jobs/{job_id}",
            headers=accounts[1][1],
        )
        other_worker_logs = await client.get(
            f"/api/v1/workers/logs/{accounts[0][0]}",
            headers=accounts[1][1],
        )

        assert owner_results.status_code == 200
        assert [job["id"] for job in owner_results.json()] == [job_id]
        assert other_results.status_code == 200
        assert other_results.json() == []
        assert cross_user_results.status_code == 403
        assert other_job_detail.status_code == 404
        assert other_worker_logs.status_code == 403

        from sqlalchemy import text
        async with AsyncSessionLocal() as session:
            await session.execute(text("DELETE FROM jobs WHERE id = :id"), {"id": job_id})
            for user_id, _ in accounts:
                await session.execute(
                    text("DELETE FROM users WHERE id = :id"), {"id": user_id}
                )
            await session.commit()
