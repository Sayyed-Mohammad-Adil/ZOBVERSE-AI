from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "ZOBVERSE AI API v1"}

def test_auth_login_invalid():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "notfound@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_jobs_skills_summary():
    response = client.get("/api/v1/jobs/skills/summary")
    assert response.status_code == 401

def test_jobs_search_skill_wise():
    assert client.get("/api/v1/jobs/?skills=Python").status_code == 401

def test_jobs_search_without_trailing_slash_does_not_redirect():
    response = client.get(
        "/api/v1/jobs?skills=Python",
        follow_redirects=False,
    )

    assert response.status_code == 401
    assert response.headers.get("location") is None
