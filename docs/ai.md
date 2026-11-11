# AI Decision & Generation Layer

The application utilizes a dual-engine AI architecture:

## 1. Zero-Prompt Structured Decisions (Laya)
- Handles deterministic classification, screening question mapping, role classification, and skill extraction.
- Guarantees strict output types without conversational hallucinations.
- Highly resilient fallback logic ensuring local execution even if external models are unreachable.

## 2. Generative Text Synthesis (Ollama)
- Used for CV-to-job fit reviews during auto-apply cycles and for drafting personalized cover letters aligned with the candidate's actual CV text.
- Fit reviews include a score, recommendation, rationale, matched/missing skills, and concerns. Ollama failures are shown as unavailable and require candidate review; they are not reported as successful model assessments.
- Prompting enforces strict adherence to truthful candidate history:
  - Never fabricate metrics or achievements.
  - Omit missing details rather than inventing them.
  - Professional, direct tone without buzzword bloat.
