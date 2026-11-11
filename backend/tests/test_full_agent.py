import pytest
import httpx
from httpx import ASGITransport
from app.main import app
from app.ai.laya.decision import LayaDecisionService
import uuid

@pytest.mark.asyncio
async def test_api_root_and_health():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res_root = await client.get("/")
        assert res_root.status_code == 200
        assert res_root.json() == {"message": "ZOBVERSE AI API v1"}

        res_health = await client.get("/health")
        assert res_health.status_code == 200
        assert res_health.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_auth_registration_and_login():
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register new user
        reg_res = await client.post(
            "/api/v1/auth/register",
            json={"email": unique_email, "password": "SecurePassword123!"}
        )
        assert reg_res.status_code == 200, reg_res.text
        user_data = reg_res.json()
        assert user_data["email"] == unique_email
        user_id = user_data["id"]

        # 2. Duplicate registration check
        dup_res = await client.post(
            "/api/v1/auth/register",
            json={"email": unique_email, "password": "AnotherPassword"}
        )
        assert dup_res.status_code == 400

        # 3. Login
        login_res = await client.post(
            "/api/v1/auth/login",
            data={"username": unique_email, "password": "SecurePassword123!"}
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        assert token is not None

        # 4. /auth/me check
        me_res = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_res.status_code == 200
        assert me_res.json()["id"] == user_id

        # Teardown
        from sqlalchemy import text
        from app.core.database import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            await session.execute(text("DELETE FROM audit_logs WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": user_id})
            await session.commit()

@pytest.mark.asyncio
async def test_laya_decision_service():
    service = LayaDecisionService()
    
    # Role classification
    role = await service.classify_job_role("Senior Python Backend Engineer with FastAPI, PostgreSQL and Redis")
    assert role["role"] == "Backend Developer"
    assert role["confidence"] > 0.8

    # Work mode classification
    mode = await service.classify_work_mode("Fully remote work from anywhere globally")
    assert mode["mode"] == "Remote"

    # Skill extraction
    skills = await service.extract_skills("Requires proficiency in Python, React, Docker, and PostgreSQL.")
    assert "Python" in skills
    assert "React" in skills
    assert "Docker" in skills

    # Screening question classification
    q_cat = await service.classify_screening_question("What is your expected salary CTC?")
    assert q_cat["category"] == "SALARY"

@pytest.mark.asyncio
async def test_settings_and_job_sources():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        sources_res = await client.get("/api/v1/settings/job-sources")
        assert sources_res.status_code == 200
        sources = sources_res.json()
        assert len(sources) >= 2
        names = [s["id"] for s in sources]
        assert "linkedin" in names
        assert "jobicy" in names

        ai_res = await client.get("/api/v1/settings/ai")
        assert ai_res.status_code == 200
        ai_data = ai_res.json()
        assert "ollama_url" in ai_data
        assert "laya_enabled" in ai_data

@pytest.mark.asyncio
async def test_profile_and_preferences_lifecycle():
    unique_email = f"profile_test_{uuid.uuid4().hex[:8]}@example.com"
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        reg = await client.post("/api/v1/auth/register", json={"email": unique_email, "password": "Password123!"})
        assert reg.status_code == 200
        user_id = reg.json()["id"]
        login = await client.post(
            "/api/v1/auth/login",
            data={"username": unique_email, "password": "Password123!"},
        )
        auth_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

        # Profile default get & update
        prof_get = await client.get(f"/api/v1/profile/{user_id}")
        assert prof_get.status_code == 200

        prof_put = await client.put(
            f"/api/v1/profile/{user_id}",
            json={
                "first_name": "Alex",
                "last_name": "Dev",
                "current_role": "Backend Engineer",
                "skills": ["Python", "PostgreSQL", "FastAPI"],
                "total_experience_years": 5
            }
        )
        assert prof_put.status_code == 200
        updated_prof = prof_put.json()
        assert updated_prof["first_name"] == "Alex"
        assert "Python" in updated_prof["skills"]

        # Preferences default get & update
        pref_get = await client.get(f"/api/v1/preferences/{user_id}")
        assert pref_get.status_code == 200

        pref_put = await client.put(
            f"/api/v1/preferences/{user_id}",
            json={
                "target_salary": 140000,
                "minimum_salary": 110000,
                "currency": "USD",
                "remote_only": True,
                "daily_application_limit": 15,
                "automation_mode": "Assisted"
            }
        )
        assert pref_put.status_code == 200
        updated_pref = pref_put.json()
        assert updated_pref["target_salary"] == 140000
        assert updated_pref["remote_only"] is True

        # Check analytics for this user
        analytics_res = await client.get(
            f"/api/v1/analytics/{user_id}",
            headers=auth_headers,
        )
        assert analytics_res.status_code == 200
        analytics_data = analytics_res.json()
        assert analytics_data["profile_completion"] >= 50

        # Teardown
        from sqlalchemy import text
        from app.core.database import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            await session.execute(text("DELETE FROM candidate_preferences WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM candidate_profiles WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM audit_logs WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": user_id})
            await session.commit()

@pytest.mark.asyncio
async def test_resume_upload_parse_and_management():
    unique_email = f"resume_test_{uuid.uuid4().hex[:8]}@example.com"
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        reg = await client.post("/api/v1/auth/register", json={"email": unique_email, "password": "Password123!"})
        user_id = reg.json()["id"]
        # Upload a resume
        resume_content = b"""
        John Doe
        john.doe@example.com | 555-123-4567 | linkedin.com/in/johndoe | github.com/johndoe
        Senior Backend Engineer with 6 years experience in Python, FastAPI, Docker, and PostgreSQL.
        """
        files = {"file": ("john_doe_resume.txt", resume_content, "text/plain")}
        upload_res = await client.post(f"/api/v1/resumes/?user_id={user_id}", files=files)
        assert upload_res.status_code == 200, upload_res.text
        resume_data = upload_res.json()
        assert resume_data["is_default"] is True
        resume_id = resume_data["id"]

        # Check list resumes
        list_res = await client.get(f"/api/v1/resumes/{user_id}")
        assert list_res.status_code == 200
        resumes = list_res.json()
        assert len(resumes) >= 1

        # Check that user profile was enriched from CV
        prof_res = await client.get(f"/api/v1/profile/{user_id}")
        assert prof_res.status_code == 200
        prof = prof_res.json()
        assert "Python" in (prof.get("skills") or "")

        # Teardown
        from sqlalchemy import text
        from app.core.database import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            await session.execute(text("DELETE FROM resumes WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM candidate_profiles WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM audit_logs WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": user_id})
            await session.commit()

@pytest.mark.asyncio
async def test_job_application_lifecycle_and_state_machine():
    unique_email = f"app_test_{uuid.uuid4().hex[:8]}@example.com"
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        reg = await client.post("/api/v1/auth/register", json={"email": unique_email, "password": "Password123!"})
        user_id = reg.json()["id"]
        login = await client.post(
            "/api/v1/auth/login",
            data={"username": unique_email, "password": "Password123!"},
        )
        auth_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

        profile_res = await client.post(
            f"/api/v1/profile/{user_id}",
            json={
                "first_name": "Test",
                "last_name": "Candidate",
                "current_role": "Python Engineer",
                "skills": ["Python", "Distributed Systems"],
                "total_experience_years": 6,
            },
        )
        assert profile_res.status_code == 200

        # 1. Trigger background job discovery
        scan_res = await client.post(
            "/api/v1/workers/scan",
            headers=auth_headers,
        )
        assert scan_res.status_code == 200

        # 2. Directly insert a verified test job into DB
        from app.models.job import Job
        from app.core.database import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            test_ext_id = f"test_job_{uuid.uuid4().hex[:8]}"
            job = Job(
                source="LINKEDIN",
                external_job_id=test_ext_id,
                title="Staff Python Engineer",
                company="Test Execution Corp",
                location="Remote",
                work_mode="Remote",
                description="Looking for an exceptional Staff Python Engineer to design distributed systems.",
                salary_min=160000,
                salary_max=210000,
                salary_currency="USD"
            )
            session.add(job)
            await session.commit()
            await session.refresh(job)
            job_id = job.id

        # 3. Prepare application
        prep_res = await client.post(f"/api/v1/applications/prepare?job_id={job_id}&user_id={user_id}")
        assert prep_res.status_code == 200
        prep_data = prep_res.json()
        assert prep_data["status"] == "READY"
        app_id = prep_data["application_id"]

        # 4. Advance State: READY -> APPLIED
        app_res1 = await client.put(f"/api/v1/applications/{app_id}", json={"status": "APPLIED"})
        assert app_res1.status_code == 200
        assert app_res1.json()["status"] == "APPLIED"

        # 5. Advance State: APPLIED -> INTERVIEW
        app_res2 = await client.put(f"/api/v1/applications/{app_id}", json={"status": "INTERVIEW", "notes": "Interview set for Tuesday"})
        assert app_res2.status_code == 200
        assert app_res2.json()["status"] == "INTERVIEW"

        # 6. Advance State: INTERVIEW -> OFFER
        app_res3 = await client.put(f"/api/v1/applications/{app_id}", json={"status": "OFFER", "notes": "Offer letter received!"})
        assert app_res3.status_code == 200
        assert app_res3.json()["status"] == "OFFER"

        # 7. Check that duplicate application creation is blocked
        dup_app = await client.post(f"/api/v1/applications/?user_id={user_id}", json={"job_id": job_id})
        assert dup_app.status_code == 400
        assert "Duplicate application prohibited" in dup_app.json()["detail"]

        # Teardown test artifacts so live database is not polluted
        from sqlalchemy import text
        async with AsyncSessionLocal() as session:
            await session.execute(text("DELETE FROM applications WHERE job_id = :jid OR user_id = :uid"), {"jid": job_id, "uid": user_id})
            await session.execute(text("DELETE FROM jobs WHERE id = :jid"), {"jid": job_id})
            await session.execute(text("DELETE FROM candidate_profiles WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM audit_logs WHERE user_id = :uid"), {"uid": user_id})
            await session.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": user_id})
            await session.commit()
