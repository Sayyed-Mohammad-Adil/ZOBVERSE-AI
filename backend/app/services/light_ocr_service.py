import os
import shutil
import subprocess
import json
import logging
from typing import Tuple, List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class LightOCRService:
    """Interface to @arcships/light-ocr engine for offline local document vision."""

    def __init__(self):
        self._binary_path = self._find_binary()

    def _find_binary(self) -> Optional[str]:
        # 1. Check PATH
        path_bin = shutil.which("light-ocr")
        if path_bin:
            return path_bin

        # 2. Check local frontend node_modules
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

    def extract_text(self, file_path: str) -> Tuple[str, float]:
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
            # Run light-ocr with JSON format to get lines and confidence
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
                # Fallback to plain text format
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

            # Parse lines from output (single JSON object or streaming JSONL)
            lines_text: List[str] = []
            confidences: List[float] = []

            # 1. Try parsing whole output as single JSON document
            try:
                doc = json.loads(raw_out)
                if isinstance(doc, dict):
                    # Multi-page or single-page document structure
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

            # 2. If lines_text is still empty, parse line-by-line (streaming JSONL)
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
                        # plain text line fallback
                        lines_text.append(line)

            full_text = "\n".join(lines_text).strip()
            avg_conf = sum(confidences) / len(confidences) if confidences else 0.95
            return (full_text, round(avg_conf, 3))

        except Exception as e:
            logger.error(f"light-ocr execution exception on {file_path}: {e}")
            return ("", 0.0)

# Global singleton
light_ocr = LightOCRService()
