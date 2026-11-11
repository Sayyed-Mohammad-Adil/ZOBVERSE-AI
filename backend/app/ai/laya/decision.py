import logging
from typing import List, Dict, Any, Optional
import re
from app.core.config import settings

logger = logging.getLogger(__name__)

class LayaDecisionService:
    def __init__(self):
        self.enabled = settings.LAYA_ENABLED
        self.laya = None
        if self.enabled:
            try:
                import laya
                self.laya = laya
                logger.info(f"Laya initialized with version: {getattr(laya, '__version__', 'unknown')}")
            except Exception as e:
                logger.warning(f"Could not load laya: {e}. Falling back to rule-based engine.")

    async def classify_job_role(self, description: str) -> Dict[str, Any]:
        """Classify job role and category."""
        text = description.lower()
        if any(w in text for w in ["frontend", "react", "vue", "angular", "css", "html"]):
            return {"role": "Frontend Developer", "category": "Engineering", "confidence": 0.9}
        elif any(w in text for w in ["backend", "python", "fastapi", "django", "node", "golang", "java", "sql"]):
            return {"role": "Backend Developer", "category": "Engineering", "confidence": 0.92}
        elif any(w in text for w in ["full stack", "fullstack"]):
            return {"role": "Full Stack Developer", "category": "Engineering", "confidence": 0.95}
        elif any(w in text for w in ["devops", "kubernetes", "docker", "aws", "terraform", "sre", "ci/cd"]):
            return {"role": "DevOps Engineer", "category": "Infrastructure", "confidence": 0.88}
        elif any(w in text for w in ["data scientist", "machine learning", "ai engineer", "deep learning", "nlp"]):
            return {"role": "AI/ML Engineer", "category": "Data & AI", "confidence": 0.91}
        elif any(w in text for w in ["product manager", "scrum", "agile", "roadmap"]):
            return {"role": "Product Manager", "category": "Product", "confidence": 0.85}
        return {"role": "Software Engineer", "category": "Engineering", "confidence": 0.75}

    async def classify_seniority(self, description: str) -> Dict[str, Any]:
        """Classify job seniority level."""
        text = description.lower()
        if any(w in text for w in ["principal", "staff", "director", "vp", "head of"]):
            return {"seniority": "Lead / Staff", "confidence": 0.92}
        elif any(w in text for w in ["senior", "sr.", "lead", "architect", "5+ years", "6+ years", "7+ years", "8+ years"]):
            return {"seniority": "Senior", "confidence": 0.9}
        elif any(w in text for w in ["intern", "internship", "junior", "jr.", "entry level", "associate", "graduate"]):
            return {"seniority": "Junior / Entry", "confidence": 0.88}
        return {"seniority": "Mid-Level", "confidence": 0.8}

    async def classify_work_mode(self, text: str) -> Dict[str, Any]:
        """Classify work mode into Remote, Hybrid, or Onsite."""
        lower = text.lower()
        if "remote" in lower or "work from home" in lower or "anywhere" in lower:
            return {"mode": "Remote", "confidence": 0.95}
        elif "hybrid" in lower or "flexible" in lower:
            return {"mode": "Hybrid", "confidence": 0.9}
        return {"mode": "Onsite", "confidence": 0.75}

    async def classify_screening_question(self, question: str) -> Dict[str, Any]:
        """Classify screening question type."""
        q = question.lower()
        if any(w in q for w in ["salary", "compensation", "ctc", "expected", "pay", "rate"]):
            return {"category": "SALARY", "confidence": 0.98}
        elif any(w in q for w in ["notice", "start date", "availability", "join", "how soon"]):
            return {"category": "NOTICE_PERIOD", "confidence": 0.95}
        elif any(w in q for w in ["visa", "sponsorship", "authorized", "citizenship", "work permit", "green card"]):
            return {"category": "WORK_AUTHORIZATION", "confidence": 0.98}
        elif any(w in q for w in ["experience", "years", "how long", "worked with"]):
            return {"category": "EXPERIENCE", "confidence": 0.9}
        elif any(w in q for w in ["python", "react", "sql", "aws", "docker", "code", "architecture"]):
            return {"category": "TECHNICAL", "confidence": 0.92}
        return {"category": "BEHAVIORAL", "confidence": 0.8}

    async def classify_job_relevance(self, job_data: dict, preferences: dict) -> Dict[str, Any]:
        """Classify if a job meets candidate preferences."""
        reasons = []
        score = 80.0
        
        # Check salary
        job_min = job_data.get("salary_min")
        pref_min = preferences.get("minimum_salary")
        if job_min and pref_min and job_min < pref_min:
            reasons.append(f"Salary {job_min} below minimum {pref_min}")
            score -= 30.0
            
        # Check work mode
        pref_remote = preferences.get("remote_only")
        job_mode = job_data.get("work_mode", "")
        if pref_remote and "remote" not in job_mode.lower():
            reasons.append("Non-remote role while remote-only is requested")
            score -= 40.0
            
        is_relevant = score >= 60.0
        return {
            "relevant": is_relevant,
            "relevance_score": max(0.0, min(100.0, score)),
            "reasons": reasons,
            "confidence": 0.88
        }

    async def extract_skills(self, text: str) -> List[str]:
        """Extract standardized skills list from text."""
        if not text:
            return []

        SKILLS_CANONICAL = {
            # Programming languages
            "python": "Python", "javascript": "JavaScript", "typescript": "TypeScript",
            "golang": "Go", "go": "Go", "rust": "Rust", "java": "Java",
            "c++": "C++", "cpp": "C++", "c#": "C#", "csharp": "C#", ".net": ".NET", "dotnet": ".NET",
            "ruby": "Ruby", "php": "PHP", "swift": "Swift", "kotlin": "Kotlin",
            "sql": "SQL", "shell": "Shell", "bash": "Bash", "html": "HTML", "css": "CSS",

            # Web & Frameworks
            "react": "React", "react.js": "React", "reactjs": "React",
            "next.js": "Next.js", "nextjs": "Next.js",
            "vue": "Vue", "vue.js": "Vue", "vuejs": "Vue", "angular": "Angular", "svelte": "Svelte",
            "node.js": "Node.js", "nodejs": "Node.js", "node": "Node.js",
            "express": "Express", "express.js": "Express", "nestjs": "NestJS",
            "fastapi": "FastAPI", "django": "Django", "flask": "Flask",
            "spring boot": "Spring Boot", "spring": "Spring Boot", "rails": "Ruby on Rails", "ruby on rails": "Ruby on Rails",
            "laravel": "Laravel", "graphql": "GraphQL", "rest api": "REST API", "rest": "REST API", "restful": "REST API",
            "tailwind": "Tailwind CSS", "tailwind css": "Tailwind CSS", "bootstrap": "Bootstrap",
            "electron": "Electron", "react native": "React Native", "flutter": "Flutter",
            "websockets": "WebSockets", "websocket": "WebSockets", "socket.io": "Socket.IO",

            # Databases & Stores
            "postgresql": "PostgreSQL", "postgres": "PostgreSQL", "mysql": "MySQL",
            "mongodb": "MongoDB", "mongo": "MongoDB", "redis": "Redis",
            "elasticsearch": "Elasticsearch", "opensearch": "Elasticsearch",
            "sqlite": "SQLite", "dynamodb": "DynamoDB", "cassandra": "Cassandra",
            "firebase": "Firebase", "supabase": "Supabase", "nosql": "NoSQL",

            # Cloud, Infrastructure & DevOps
            "docker": "Docker", "kubernetes": "Kubernetes", "k8s": "Kubernetes",
            "aws": "AWS", "amazon web services": "AWS", "azure": "Azure",
            "gcp": "GCP", "google cloud": "GCP", "cloud": "Cloud",
            "ci/cd": "CI/CD", "cicd": "CI/CD", "git": "Git", "github": "GitHub", "gitlab": "GitLab",
            "linux": "Linux", "terraform": "Terraform", "ansible": "Ansible",
            "microservices": "Microservices", "serverless": "Serverless", "devops": "DevOps",

            # AI / ML & Data
            "machine learning": "Machine Learning", "deep learning": "Deep Learning",
            "ai": "AI", "artificial intelligence": "AI", "generative ai": "Generative AI",
            "pytorch": "PyTorch", "tensorflow": "TensorFlow", "nlp": "NLP", "llm": "LLM",
            "pandas": "Pandas", "numpy": "NumPy", "scikit-learn": "Scikit-Learn",
            "kafka": "Kafka", "rabbitmq": "RabbitMQ", "spark": "Spark",
            "airflow": "Airflow", "snowflake": "Snowflake", "bigquery": "BigQuery",

            # Testing & Quality
            "playwright": "Playwright", "selenium": "Selenium", "cypress": "Cypress",
            "pytest": "Pytest", "jest": "Jest", "unit testing": "Unit Testing",

            # Process & Architecture
            "agile": "Agile", "scrum": "Scrum", "system design": "System Design",
            "distributed systems": "Distributed Systems"
        }

        text_lower = text.lower()
        found = set()

        for k, canonical in SKILLS_CANONICAL.items():
            if any(char in k for char in [" ", ".", "+", "#", "-", "/"]):
                if k in text_lower:
                    found.add(canonical)
            else:
                pattern = r'\b' + re.escape(k) + r'\b'
                if re.search(pattern, text_lower):
                    if k == "go" and not re.search(r'\b(golang|go developer|go engineer|go programming|go backend)\b', text_lower):
                        continue
                    if k == "ai" and not re.search(r'\b(ai|artificial intelligence|generative ai|ai engineer|ai developer)\b', text_lower):
                        continue
                    if k == "rest" and not re.search(r'\b(rest api|restful|rest apis|rest services)\b', text_lower):
                        continue
                    if k == "node" and not re.search(r'\b(node\.?js|node developer|node backend)\b', text_lower):
                        continue
                    found.add(canonical)

        return sorted(list(found))

    async def extract_skills_from_job(self, title: str, description: str, requirements: Optional[str] = None) -> List[str]:
        """Extract skills that are explicitly present in source job text."""
        combined = f"{title} {description} {requirements or ''}"
        return await self.extract_skills(combined)


