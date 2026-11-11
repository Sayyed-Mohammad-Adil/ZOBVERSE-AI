import sys
from datetime import date
from types import SimpleNamespace

import pytest

from app.resume import parser as resume_parser


class FakePage:
    def __init__(self, text):
        self.text = text

    def extract_text(self):
        return self.text


class FakeOCR:
    def __init__(self, text):
        self.text = text
        self.called = False

    def is_available(self):
        return True

    def extract_text(self, _file_path):
        self.called = True
        return self.text, 0.91


def test_scanned_pdf_uses_ocr_when_pdf_text_layer_is_empty(monkeypatch, tmp_path):
    pdf_path = tmp_path / "scanned.pdf"
    pdf_path.write_bytes(b"%PDF-test")
    monkeypatch.setitem(
        sys.modules,
        "pypdf",
        SimpleNamespace(PdfReader=lambda _path: SimpleNamespace(pages=[FakePage("")])),
    )
    ocr = FakeOCR("Adil Mohammad\nPython FastAPI")
    monkeypatch.setattr(resume_parser, "light_ocr", ocr)

    text, links = resume_parser.ResumeParser().extract_text_and_links(str(pdf_path))

    assert text == "Adil Mohammad\nPython FastAPI"
    assert links == []
    assert ocr.called


def test_pdf_reader_error_still_attempts_ocr(monkeypatch, tmp_path):
    pdf_path = tmp_path / "unreadable.pdf"
    pdf_path.write_bytes(b"%PDF-test")

    def fail_reader(_path):
        raise ValueError("unreadable text layer")

    monkeypatch.setitem(sys.modules, "pypdf", SimpleNamespace(PdfReader=fail_reader))
    ocr = FakeOCR("Name: Adil\nhttps://example.com")
    monkeypatch.setattr(resume_parser, "light_ocr", ocr)

    text, links = resume_parser.ResumeParser().extract_text_and_links(str(pdf_path))

    assert text == "Name: Adil\nhttps://example.com"
    assert links == ["https://example.com"]
    assert ocr.called


def test_experience_prefers_explicit_overall_duration():
    assert resume_parser._explicit_experience_years(
        "8+ years of professional experience; 3 years using Python"
    ) == 8
    assert resume_parser._explicit_experience_years("Experience: 5 years") == 5
    assert resume_parser._explicit_experience_years("6 yrs of experience") == 6
    assert resume_parser._explicit_experience_years(
        "3 years of Python experience"
    ) is None


def test_experience_history_ignores_education_and_unions_overlapping_roles():
    text = """Education
2012 - 2016
Work Experience
Jan 2018 - Dec 2020
Jan 2020 - Dec 2022
Education
"""

    assert resume_parser._experience_years_from_history(
        text, today=date(2024, 1, 1)
    ) == 4


def test_experience_history_does_not_infer_from_unlabeled_resume_dates():
    assert resume_parser._experience_years_from_history(
        "Education\n2010 - 2014\nGraduated 2014",
        today=date(2024, 1, 1),
    ) is None


@pytest.mark.asyncio
async def test_resume_parser_does_not_invent_a_role(tmp_path):
    resume_path = tmp_path / "resume.txt"
    resume_path.write_text("Adil Mohammad\nPython, FastAPI, PostgreSQL", encoding="utf-8")

    parsed = await resume_parser.ResumeParser().parse_resume(str(resume_path))

    assert parsed["current_role"] is None
