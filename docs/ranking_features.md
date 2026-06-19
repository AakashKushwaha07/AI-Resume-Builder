# Candidate Discovery and Resume Ranking Features

This project now includes an Intelligent Candidate Discovery and Ranking Engine in addition to the original resume-to-job matcher.

## What The Ranking Feature Does

The ranking feature lets a user paste a job description and rank either:

- A structured candidate dataset in `.json` or `.jsonl` format.
- Multiple resume files in `.pdf` or `.docx` format.

The output is a ranked table with score and explainable reasoning. The UI also provides a CSV download.

## Frontend Workflow

Open the **Candidate Ranker** tab inside the Resume Intelligence section.

There are two modes:

- **JSON Dataset**: Upload a candidate `.json` or `.jsonl` file, paste the job description, choose top N, and click **Rank Candidates**.
- **Resume PDFs**: Upload multiple PDF/DOCX resumes one by one or in batches, paste the job description, choose top N, and click **Rank Resumes**.

The UI shows the top ranked results and allows downloading a CSV.

## Backend APIs

### `POST /api/rank-candidates`

Ranks structured candidate profiles.

Form fields:

- `candidates`: `.json` or `.jsonl` candidate file.
- `job_description`: target job description text.
- `top_n`: number of candidates to return, capped at 100.

CSV output columns:

```csv
candidate_id,rank,score,reasoning
```

### `POST /api/rank-resumes`

Ranks multiple uploaded resume files.

Form fields:

- `resumes`: one or more `.pdf` / `.docx` files.
- `job_description`: target job description text.
- `top_n`: number of resumes to return, capped at 100.

CSV output columns:

```csv
filename,rank,score,reasoning
```

## Ranking Logic

The ranking code lives in:

```text
backend/utils/candidate_ranker.py
```

The ranker is deterministic and CPU-friendly. It does not call hosted LLM APIs during ranking.

For structured candidate data, it considers:

- AI, ML, retrieval, ranking, and vector search skill matches.
- Career history and production evidence.
- Current title and industry fit.
- Ranking/evaluation signals such as NDCG, MRR, MAP, and A/B testing.
- Years of experience fit.
- Location and relocation fit.
- Redrob behavioral signals such as recruiter response rate, notice period, profile completeness, and activity.
- Consistency penalties for suspicious or weak-fit profiles.

For PDF/DOCX resumes, it considers:

- Job-description token overlap.
- AI/retrieval/ranking keyword evidence.
- Production and shipping evidence.
- Ranking/evaluation terms.
- Detected years of experience.
- Weak-title penalties.
- Whether enough readable text was extracted.

## Explainability

Each ranked row includes a `reasoning` field. The reasoning references facts such as matched keywords, detected experience, production evidence, JD overlap, behavioral signals where available, and concerns such as low readable text.

## Limitations

- Scanned image-only PDFs may not rank well because OCR is not currently implemented.
- Resume ranking is based on deterministic text features rather than local semantic embeddings.
- Very large resume batches are processed in a normal request/response cycle; background jobs would be better for production-scale batches.
