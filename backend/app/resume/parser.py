import os
import sys
import re
import csv
import logging
from typing import Dict, Any, List, Optional

# Ensure backend root is on sys.path for IDEs and nested imports
_backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

try:
    from app.ai.laya.decision import LayaDecisionService
except ImportError:
    from ai.laya.decision import LayaDecisionService

import shutil
import subprocess
import json
from datetime import date

logger = logging.getLogger(__name__)


def _explicit_experience_years(text: str) -> Optional[int]:
    """Extract a stated overall experience duration, not a skill-specific duration."""
    patterns = (
        r"\b(?:total|overall|professional|work)\s+experience"
        r"(?:\s*\(\s*(?:years?|yrs?)\s*\)|\s+(?:years?|yrs?))?"
        r"\s*[:\-]\s*(\d+(?:\.\d+)?)",
        r"\bexperience\s*(?:(?:\(\s*(?:years?|yrs?)\s*\))|(?:years?|yrs?))?"
        r"\s*[:\-]\s*(\d+(?:\.\d+)?)",
        r"\b(\d+(?:\.\d+)?)\+?\s+(?:years?|yrs?)\s+(?:of\s+)?"
        r"(?:(?:professional|overall|industry|work)\s+)?experience\b",
    )
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                years = int(float(match.group(1)))
            except ValueError:
                continue
            if 0 <= years <= 60:
                return years
    return None


def _experience_section(text: str) -> str:
    lines = text.splitlines()
    start = None
    for index, line in enumerate(lines):
        if re.fullmatch(
            r"\s*(?:professional\s+experience|work\s+experience|"
            r"employment\s+history|experience)\s*:?\s*",
            line,
            re.IGNORECASE,
        ):
            start = index + 1
            break
    if start is None:
        return ""

    end = len(lines)
    next_section = re.compile(
        r"^\s*(?:education|academic|skills|technical skills|projects|"
        r"certifications|awards|languages|volunteer|publications|references)"
        r"\s*:?\s*$",
        re.IGNORECASE,
    )
    for index in range(start, len(lines)):
        if next_section.fullmatch(lines[index]):
            end = index
            break
    return "\n".join(lines[start:end])


def _experience_years_from_history(text: str, today: Optional[date] = None) -> Optional[int]:
    """Calculate non-overlapping full years from date ranges in a work-history section."""
    section = _experience_section(text)
    if not section:
        return None

    month_names = (
        r"Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
        r"Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|"
        r"Nov(?:ember)?|Dec(?:ember)?|0?[1-9]|1[0-2]"
    )
    date_pattern = re.compile(
        rf"(?P<start_month>{month_names})?\s*[,./-]?\s*"
        r"(?P<start_year>(?:19|20)\d{2})\s*"
        r"(?:-|–|—|\bto\b)\s*"
        rf"(?P<end_month>{month_names})?\s*[,./-]?\s*"
        r"(?P<end_year>(?:19|20)\d{2}|present|current|now)\b",
        re.IGNORECASE,
    )
    month_numbers = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
    }

    def month_number(value: Optional[str]) -> int:
        if not value:
            return 1
        if value.isdigit():
            return int(value)
        return month_numbers[value[:3].lower()]

    today = today or date.today()
    current_month = today.year * 12 + today.month - 1
    intervals: list[tuple[int, int]] = []
    for match in date_pattern.finditer(section):
        start = (
            int(match.group("start_year")) * 12
            + month_number(match.group("start_month")) - 1
        )
        end_year = match.group("end_year")
        end = (
            current_month
            if end_year.lower() in {"present", "current", "now"}
            else int(end_year) * 12 + month_number(match.group("end_month")) - 1
        )
        if start <= end and end <= current_month:
            intervals.append((start, end))

    if not intervals:
        return None

    intervals.sort()
    start, end = intervals[0]
    total_months = 0
    for next_start, next_end in intervals[1:]:
        if next_start <= end:
            end = max(end, next_end)
        else:
            total_months += end - start
            start, end = next_start, next_end
    total_months += end - start
    return min(total_months // 12, 60)


class LightOCRService:
    """Interface to @arcships/light-ocr engine for offline local document vision."""

    def __init__(self):
        self._binary_path = self._find_binary()

    def _find_binary(self) -> Optional[str]:
        path_bin = shutil.which("light-ocr")
        if path_bin:
            return path_bin

        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        local_bin = os.path.join(base_dir, "frontend", "node_modules", ".bin", "light-ocr")
        if os.path.exists(local_bin) and os.access(local_bin, os.X_OK):
            return local_bin

        return None

    def is_available(self) -> bool:
        return self._binary_path is not None

    def get_version(self) -> Dict[str, Any]:
        if not self._binary_path:
            return {"status": "unavailable", "error": "light-ocr binary not found"}
        try:
            res = subprocess.run(
                [self._binary_path, "info", "--version"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            if res.returncode == 0:
                return json.loads(res.stdout.strip())
            return {"status": "error", "code": res.returncode, "stderr": res.stderr}
        except Exception as e:
            logger.error(f"Error checking light-ocr version: {e}")
            return {"status": "error", "error": str(e)}

    def get_diagnostics(self) -> Dict[str, Any]:
        if not self._binary_path:
            return {"status": "unavailable"}
        try:
            res = subprocess.run(
                [self._binary_path, "doctor", "--json"],
                capture_output=True,
                text=True,
                timeout=15,
            )
            if res.returncode == 0:
                return json.loads(res.stdout.strip())
            return {"status": "error", "stderr": res.stderr}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def extract_text(self, file_path: str) -> tuple[str, float]:
        """
        Extract text from an image (PNG, JPEG, etc.) or PDF using light-ocr.
        Returns (extracted_text, average_confidence).
        """
        if not self._binary_path:
            logger.warning("light-ocr binary not available; skipping OCR")
            return ("", 0.0)

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found for OCR: {file_path}")

        try:
            cmd = [
                self._binary_path,
                file_path,
                "--provider",
                "cpu",
                "--format",
                "json",
            ]
            res = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60,
            )

            if res.returncode != 0:
                cmd_fallback = [
                    self._binary_path,
                    file_path,
                    "--provider",
                    "cpu",
                    "--format",
                    "text",
                ]
                res_fallback = subprocess.run(
                    cmd_fallback,
                    capture_output=True,
                    text=True,
                    timeout=60,
                )
                if res_fallback.returncode == 0:
                    return (res_fallback.stdout.strip(), 0.85)
                logger.error(f"light-ocr failed on {file_path}: {res.stderr}")
                return ("", 0.0)

            raw_out = res.stdout.strip()
            if not raw_out:
                return ("", 0.0)

            lines_text: List[str] = []
            confidences: List[float] = []

            try:
                doc = json.loads(raw_out)
                if isinstance(doc, dict):
                    pages = doc.get("pages", [])
                    if isinstance(pages, list) and pages:
                        for page in pages:
                            for item in page.get("lines", []):
                                t = item.get("text", "").strip()
                                if t:
                                    lines_text.append(t)
                                c = item.get("confidence")
                                if c is not None:
                                    confidences.append(float(c))
                    elif "lines" in doc and isinstance(doc["lines"], list):
                        for item in doc["lines"]:
                            t = item.get("text", "").strip()
                            if t:
                                lines_text.append(t)
                            c = item.get("confidence")
                            if c is not None:
                                confidences.append(float(c))
            except json.JSONDecodeError:
                pass

            if not lines_text:
                for line in raw_out.splitlines():
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        data = json.loads(line)
                        if "lines" in data and isinstance(data["lines"], list):
                            for item in data["lines"]:
                                t = item.get("text", "").strip()
                                if t:
                                    lines_text.append(t)
                                c = item.get("confidence")
                                if c is not None:
                                    confidences.append(float(c))
                        elif "text" in data:
                            lines_text.append(data["text"])
                            if "confidence" in data:
                                confidences.append(float(data["confidence"]))
                    except json.JSONDecodeError:
                        lines_text.append(line)

            full_text = "\n".join(lines_text).strip()
            avg_conf = sum(confidences) / len(confidences) if confidences else 0.95
            return (full_text, round(avg_conf, 3))

        except Exception as e:
            logger.error(f"light-ocr execution exception on {file_path}: {e}")
            return ("", 0.0)

# Embedded singleton
light_ocr = LightOCRService()

class ResumeParser:
    def __init__(self):
        self.laya = LayaDecisionService()

    def extract_text_and_links(self, file_path: str) -> tuple[str, list[str]]:
        """Extract text and embedded hyperlink annotations from PDF, DOCX, CSV, Image, or text files."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        ext = file_path.rsplit(".", 1)[-1].lower()
        links: list[str] = []
        
        # 1. Scanned Image Resumes (PNG, JPG, WebP)
        if ext in ["png", "jpg", "jpeg", "webp", "bmp", "tiff"]:
            try:
                logger.info(f"Image resume detected ({ext}). Running Light-OCR (PP-OCRv6)...")
                ocr_text, conf = light_ocr.extract_text(file_path)
                logger.info(f"Light-OCR completed for {file_path}: {len(ocr_text)} chars, conf={conf}")
                url_pattern = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')
                found_urls = url_pattern.findall(ocr_text)
                return (ocr_text.strip(), found_urls)
            except Exception as e:
                logger.error(f"Error running Light-OCR on image {file_path}: {e}")
                return ("", [])

        # 2. PDF Documents (selectable text or scanned fallback)
        elif ext == "pdf":
            try:
                from pypdf import PdfReader
                reader = PdfReader(file_path)
                text_pages = []
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_pages.append(page_text)
                    # Extract PDF clickable hyperlink annotations (/Annots -> /A -> /URI)
                    if "/Annots" in page:
                        try:
                            annots_obj = page["/Annots"]
                            annots_list = annots_obj.get_object() if hasattr(annots_obj, "get_object") else annots_obj
                            if isinstance(annots_list, (list, tuple)):
                                for annot in annots_list:
                                    try:
                                        obj = annot.get_object() if hasattr(annot, "get_object") else annot
                                        if hasattr(obj, "__contains__") and "/A" in obj and "/URI" in obj["/A"]:
                                            uri = str(obj["/A"]["/URI"]).strip()
                                            if uri:
                                                links.append(uri)
                                    except Exception:
                                        pass
                        except Exception:
                            pass

                extracted_pdf_text = "\n".join(text_pages).strip()

                # If text extraction yielded almost nothing, the PDF is a scanned image!
                if len(extracted_pdf_text) < 30 and light_ocr.is_available():
                    logger.info(f"PDF {file_path} appears scanned (len={len(extracted_pdf_text)}). Engaging Light-OCR...")
                    ocr_text, conf = light_ocr.extract_text(file_path)
                    if ocr_text:
                        logger.info(f"Light-OCR successfully extracted scanned PDF text ({len(ocr_text)} chars, conf={conf})")
                        extracted_pdf_text = ocr_text
                        # Extract any URLs in OCR output
                        url_pattern = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')
                        links.extend(url_pattern.findall(ocr_text))
                elif len(extracted_pdf_text) < 30:
                    logger.warning(
                        "PDF %s contains no extractable text and OCR is unavailable",
                        file_path,
                    )

                return (extracted_pdf_text, links)
            except Exception as e:
                logger.error(f"Error reading PDF {file_path}: {e}")
                if light_ocr.is_available():
                    logger.info("Attempting OCR fallback for PDF %s", file_path)
                    ocr_text, _ = light_ocr.extract_text(file_path)
                    if ocr_text:
                        url_pattern = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')
                        return (ocr_text.strip(), url_pattern.findall(ocr_text))
                return ("", [])
                
        elif ext in ["doc", "docx"]:
            try:
                import docx
                doc = docx.Document(file_path)
                para_text = "\n".join([p.text for p in doc.paragraphs if p.text]).strip()
                try:
                    for rel in doc.part.rels.values():
                        if "hyperlink" in getattr(rel, "reltype", "") and getattr(rel, "target_ref", None):
                            links.append(str(rel.target_ref).strip())
                except Exception:
                    pass
                return (para_text, links)
            except Exception as e:
                logger.error(f"Error reading DOCX {file_path}: {e}")
                return ("", [])

        elif ext == "csv":
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                return (content.strip(), [])
            except Exception as e:
                logger.error(f"Error reading CSV {file_path}: {e}")
                return ("", [])
                
        else: # Default to plaintext / markdown
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return (f.read().strip(), [])
            except Exception as e:
                logger.error(f"Error reading text file {file_path}: {e}")
                return ("", [])

    def extract_text(self, file_path: str) -> str:
        """Extract text from PDF, DOCX, CSV, or text files."""
        text, _ = self.extract_text_and_links(file_path)
        return text

    def parse_csv(self, file_path: str) -> Dict[str, Any]:
        """Parse structured candidate details from a CSV file (tabular or key-value)."""
        data: Dict[str, Any] = {
            "first_name": None,
            "last_name": None,
            "current_role": None,
            "total_experience_years": None,
            "skills": [],
            "phone": None,
            "email": None,
            "location": None,
            "linkedin_url": None,
            "github_url": None,
            "portfolio_url": None,
            "summary": None,
            "parsed_text": ""
        }

        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                lines = [line.strip() for line in f if line.strip()]

            if not lines:
                return data

            data["parsed_text"] = "\n".join(lines)

            # Check if this is a Key-Value CSV (2 columns: Field/Key, Value)
            sample_reader = list(csv.reader(lines[:5]))
            is_key_value = False
            if len(sample_reader) > 1 and all(1 <= len(row) <= 2 for row in sample_reader):
                first_cell = sample_reader[0][0].strip().lower() if sample_reader[0] else ""
                if first_cell in ["field", "key", "attribute", "parameter", "name", "first name", "role"]:
                    is_key_value = True

            if is_key_value:
                # Key-value mode
                kv_dict = {}
                for row in csv.reader(lines):
                    if len(row) >= 2:
                        k = row[0].strip().lower().replace("_", " ")
                        v = row[1].strip()
                        if k not in ["field", "key", "attribute"]:
                            kv_dict[k] = v
                self._map_dict_to_candidate_data(kv_dict, data)
            else:
                # Tabular header mode
                reader = csv.DictReader(lines)
                first_row = next(reader, None)
                if first_row:
                    norm_row = {
                        k.strip().lower().replace("_", " "): v.strip()
                        for k, v in first_row.items()
                        if k and v
                    }
                    self._map_dict_to_candidate_data(norm_row, data)

        except Exception as e:
            logger.error(f"Error parsing candidate CSV {file_path}: {e}")

        return data

    def _map_dict_to_candidate_data(self, source: Dict[str, str], data: Dict[str, Any]):
        """Map flexible CSV keys to standard candidate profile fields."""
        for k, v in source.items():
            k_clean = k.strip().lower()
            val = str(v).strip()
            if not val:
                continue

            # First name
            if k_clean in ["first name", "firstname", "fname", "given name"]:
                data["first_name"] = val

            # Last name
            elif k_clean in ["last name", "lastname", "lname", "surname", "family name"]:
                data["last_name"] = val

            # Full name (fallback if first/last not explicitly given)
            elif k_clean in ["name", "full name", "fullname", "candidate name", "candidate"]:
                parts = val.split()
                if not data["first_name"] and parts:
                    data["first_name"] = parts[0]
                if not data["last_name"] and len(parts) > 1:
                    data["last_name"] = " ".join(parts[1:])

            # Role
            elif k_clean in ["role", "current role", "job title", "title", "position", "designation", "target role"]:
                data["current_role"] = val

            # Experience
            elif k_clean in ["experience", "total experience", "experience years", "experience (years)", "years of experience", "yoe", "exp"]:
                explicit_years = _explicit_experience_years(f"Experience: {val}")
                if explicit_years is not None:
                    data["total_experience_years"] = explicit_years
                else:
                    exp_match = re.fullmatch(r"\s*(\d+(?:\.\d+)?)\s*\+?\s*", val)
                    if exp_match:
                        years = int(float(exp_match.group(1)))
                        if years <= 60:
                            data["total_experience_years"] = years

            # Skills
            elif k_clean in ["skills", "technical skills", "technologies", "tech stack", "tools", "competencies", "key skills"]:
                # Split comma, semicolon or pipe
                items = [s.strip() for s in re.split(r'[,|;]', val) if s.strip()]
                data["skills"] = list(dict.fromkeys(items))

            # Contact
            elif k_clean in ["email", "email address", "mail", "contact email"]:
                data["email"] = val
            elif k_clean in ["phone", "phone number", "mobile", "mobile number", "contact", "contact number", "tel"]:
                data["phone"] = val
            elif k_clean in ["location", "city", "country", "address", "current location", "city, country"]:
                data["location"] = val

            # URLs
            elif k_clean in ["linkedin", "linkedin url", "linkedin profile"]:
                data["linkedin_url"] = val
            elif k_clean in ["github", "github url", "github profile"]:
                data["github_url"] = val
            elif k_clean in ["portfolio", "portfolio url", "website", "personal website", "blog"]:
                data["portfolio_url"] = val

            # Summary
            elif k_clean in ["summary", "professional summary", "about", "about me", "bio", "overview", "description", "profile summary"]:
                data["summary"] = val

    async def parse_resume(self, file_path: str) -> Dict[str, Any]:
        """Parse raw resume/CV/CSV file into structured candidate profile fields."""
        ext = file_path.rsplit(".", 1)[-1].lower() if "." in file_path else ""

        # If CSV file, parse via specialized tabular/key-value parser
        if ext == "csv":
            csv_result = self.parse_csv(file_path)
            # If skills were missing in CSV, try extracting with Laya from text
            if not csv_result.get("skills") and csv_result.get("parsed_text"):
                csv_result["skills"] = await self.laya.extract_skills(csv_result["parsed_text"])
            if not csv_result.get("current_role") and csv_result.get("parsed_text"):
                role_dec = await self.laya.classify_job_role(csv_result["parsed_text"])
                csv_result["current_role"] = role_dec.get("role")
            return csv_result

        raw_text, annot_links = self.extract_text_and_links(file_path)
        if not raw_text:
            return {
                "first_name": None,
                "last_name": None,
                "parsed_text": "",
                "skills": [],
                "current_role": None,
                "total_experience_years": None,
                "email": None,
                "phone": None,
                "location": None,
                "linkedin_url": None,
                "github_url": None,
                "portfolio_url": None,
                "summary": None,
            }

        # 1. Contact & URL Extraction (Email, Phone, Links, Location)
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text)
        email = email_match.group(0) if email_match else None

        phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', raw_text)
        phone = phone_match.group(0) if phone_match else None

        # Extract all potential URLs from annotations AND regex matches in raw text
        text_urls = re.findall(
            r'(?:https?://[^\s|•,\)\]]+|(?:www\.)?[a-zA-Z0-9_\-]+\.(?:vercel\.app|online|dev|io|me|app|site|tech|com|org)[^\s|•,\)\]]*|github\.com/[A-Za-z0-9_\-]+|linkedin\.com/in/[A-Za-z0-9_\-]+)',
            raw_text,
            re.IGNORECASE
        )
        all_url_candidates = list(dict.fromkeys(annot_links + text_urls))

        linkedin = None
        github = None
        portfolio = None

        for link in all_url_candidates:
            l_clean = str(link).strip().rstrip("/")
            if l_clean.startswith("mailto:"):
                if not email:
                    email = l_clean.replace("mailto:", "").strip()
                continue

            if not l_clean.startswith("http://") and not l_clean.startswith("https://"):
                l_url = f"https://{l_clean}"
            else:
                l_url = l_clean

            lower = l_url.lower()

            if ("linkedin.com/in/" in lower or "linkedin.com/profile/" in lower) and not linkedin:
                linkedin = l_url
            elif ("github.com/" in lower) and not github:
                if not any(bad in lower for bad in ["github.com/login", "github.com/pricing", "github.com/about", "github.com/join"]):
                    github = l_url
            elif not portfolio:
                if any(ext in lower for ext in [".vercel.app", ".online", ".dev", ".io", ".me", ".app", ".site", ".tech", ".space", ".xyz"]):
                    if not any(bad in lower for bad in ["linkedin", "github", "npmjs", "w3.org", "google.com", "apple.com", "microsoft.com", "twitter.com", "x.com"]):
                        portfolio = l_url

        # Location regex (space only inside words to prevent capturing across newlines)
        loc_match = re.search(r'\b([A-Z][a-zA-Z ]{2,25},\s*(?:[A-Z]{2}|USA|UK|India|Canada|Germany|France|Remote|United States|United Kingdom))\b', raw_text)
        location = loc_match.group(1).strip() if loc_match else None

        # 2. Candidate Name Extraction
        first_name = None
        last_name = None

        explicit_name = re.search(r'(?:Candidate Name|Name):\s*([A-Za-z\s\.\-]+)', raw_text, re.IGNORECASE)
        if explicit_name:
            full_cand_name = explicit_name.group(1).strip().title()
            parts = full_cand_name.split()
            if parts:
                first_name = parts[0]
                last_name = " ".join(parts[1:]) if len(parts) > 1 else None
        else:
            # Fallback: scan top 5 non-empty lines for candidate's name
            non_empty_lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
            for line in non_empty_lines[:4]:
                if any(bad in line.lower() for bad in ["curriculum", "resume", "vitae", "summary", "profile", "contact", "@", "http", "phone", "page 1", "senior", "developer", "engineer"]):
                    continue
                words = line.split()
                if 1 < len(words) <= 5:
                    if not re.search(r'[@:/0-9|•]', line):
                        titled = [w.title() for w in words]
                        first_name = titled[0]
                        last_name = " ".join(titled[1:])
                        break

        # 3. Current Role extraction
        current_role = None
        explicit_role = re.search(r'(?:Current Role|Role|Title|Position):\s*([^\n|]+)', raw_text, re.IGNORECASE)
        if explicit_role:
            current_role = explicit_role.group(1).strip()
        else:
            # Check line right after name
            non_empty_lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
            for l in non_empty_lines[1:4]:
                if any(w in l.lower() for w in ["engineer", "developer", "architect", "lead", "manager", "scientist", "analyst"]):
                    if not re.search(r'[@:]', l) and len(l) < 90:
                        # If multiple titles separated by pipe/bullet, take primary title
                        primary = re.split(r'[|•/]', l)[0].strip()
                        if primary:
                            current_role = primary
                            break

        # 4. Prefer a stated overall duration; otherwise total non-overlapping
        # employment dates, never unrelated dates such as education years.
        experience_years = _explicit_experience_years(raw_text)
        if experience_years is None:
            experience_years = _experience_years_from_history(raw_text)

        # 5. Skills extraction
        # A) Explicit skills section
        extracted_skills = []
        skills_sec_match = re.search(r'(?:TECHNICAL\s+SKILLS|SKILLS|CORE\s+COMPETENCIES|TECHNOLOGIES)[\s:]*\n([^\n]+(?:\n[^\n]+){0,4})', raw_text, re.IGNORECASE)
        if skills_sec_match:
            sec_text = skills_sec_match.group(1)
            # Split items
            items = re.split(r'[,|;•\*\n]', sec_text)
            for item in items:
                clean_item = re.sub(r'^[A-Za-z\s]+:', '', item).strip() # remove labels like 'Languages:'
                if 1 < len(clean_item) < 30 and not re.search(r'[@/]', clean_item):
                    extracted_skills.append(clean_item)

        # B) Laya standardized skills scanner
        laya_skills = await self.laya.extract_skills(raw_text)
        combined_skills = list(dict.fromkeys(extracted_skills + laya_skills))

        # 6. Summary extraction
        summary = None
        sum_sec_match = re.search(r'(?:PROFESSIONAL\s+SUMMARY|SUMMARY|ABOUT\s+ME|PROFILE)[\s:]*\n([^\n]+(?:\n[^\n]+){0,2})', raw_text, re.IGNORECASE)
        if sum_sec_match:
            summary = " ".join([l.strip() for l in sum_sec_match.group(1).splitlines() if l.strip()])
        else:
            lines = [line.strip() for line in raw_text.splitlines() if len(line.strip()) > 40 and not any(w in line.lower() for w in ["@", "http", "phone", "linkedin", "github"])]
            summary = lines[0] if lines else None

        return {
            "first_name": first_name,
            "last_name": last_name,
            "parsed_text": raw_text,
            "skills": combined_skills,
            "current_role": current_role,
            "total_experience_years": experience_years,
            "email": email,
            "phone": phone,
            "location": location,
            "linkedin_url": linkedin,
            "github_url": github,
            "portfolio_url": portfolio,
            "summary": summary
        }
