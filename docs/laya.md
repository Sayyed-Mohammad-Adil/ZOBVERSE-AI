# Laya Integration

`laya` is installed via `pip install laya` and serves as the structured decision backbone for the agent.

## Core Capabilities

1. **Job Relevance Classification (`classify_job_relevance`)**:
   - Compares candidate skills, years of experience, and preferred roles against a target Job Description.
   - Returns a structured boolean decision (`is_relevant`), match score (0-100), and specific justification.
2. **Seniority & Work Mode Classification**:
   - Maps raw job text to canonical levels: `ENTRY`, `MID`, `SENIOR`, `STAFF`, `LEAD`, `EXECUTIVE`.
   - Normalizes locations to `REMOTE`, `HYBRID`, or `ONSITE`.
3. **Screening Question Categorization (`classify_screening_question`)**:
   - Classifies application questions into `TECHNICAL`, `BEHAVIORAL`, or `LOGISTICS`.
   - Identifies whether the question asks for factual metrics present in the candidate profile or requires subjective human input.
