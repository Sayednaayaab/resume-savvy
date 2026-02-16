# ATS Analyzer API Documentation

## Overview
The ATS (Applicant Tracking System) Analyzer has been improved with backend API endpoints for better reliability and scalability. The analysis is now handled by the server rather than client-side processing.

## API Endpoints

### 1. `/api/analyze-ats` (POST)
Analyzes a resume and returns an ATS compatibility score with detailed feedback.

**Request Body:**
```json
{
  "resumeText": "string (required) - Full text of the resume",
  "jobDescriptionText": "string (optional) - Text of the job description to match against"
}
```

**Response:**
```json
{
  "score": number (0-100),
  "overallAssessment": "string - Summary of resume quality",
  "strengths": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "improvements": [
    {
      "title": "string",
      "description": "string",
      "priority": "high|medium|low"
    }
  ],
  "keywords": [
    {
      "word": "string",
      "found": boolean,
      "importance": "critical|important|nice-to-have"
    }
  ],
  "jobDescriptionKeywords": [...],
  "sectionScores": [
    {
      "section": "string",
      "score": number,
      "feedback": "string"
    }
  ],
  "formatAnalysis": [
    {
      "aspect": "string",
      "status": "good|warning|error",
      "message": "string"
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/analyze-ats \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "John Doe\nExperienced Software Engineer...",
    "jobDescriptionText": "Looking for Senior Developer with 5+ years experience..."
  }'
```

### 2. `/api/extract-text` (POST)
Extracts text from resume files (PDF, DOCX, TXT).

**Request Body:**
- Form data with `file` field containing the resume file

**Response:**
```json
{
  "text": "string - Extracted text from the file"
}
```

## How It Works

1. **Client-side File Handling:**
   - Users upload resume and optional job description files
   - Text is extracted locally using PDF.js, Mammoth, or FileReader
   - Text is sent to the server API

2. **Server-side Analysis:**
   - `/api/analyze-ats` endpoint processes the resume text
   - Analyzes keywords, action verbs, formatting, structure
   - Compares against job description if provided
   - Returns comprehensive scoring and recommendations

3. **Results Display:**
   - Component displays formatted results with visual indicators
   - Shows score, strengths, improvements, and keyword analysis

## Analysis Categories

The ATS analyzer evaluates:
- **Keywords** (30 points) - Industry-specific and job-relevant keywords
- **Action Verbs** (15 points) - Strong action words that demonstrate impact
- **Section Structure** (20 points) - Presence of standard resume sections
- **Quantified Achievements** (15 points) - Numbers, percentages, metrics
- **Format Quality** (10 points) - Contact info, length, bullet points, LinkedIn
- **Content Quality** (10 points) - Metrics and action verbs combined

## Features

✅ Comprehensive ATS score (0-100%)
✅ Job-specific keyword matching
✅ Section analysis and formatting checks
✅ Strength identification
✅ Prioritized improvement suggestions
✅ Support for PDF, DOCX, and TXT files
✅ CORS enabled for cross-origin requests
✅ Error handling and validation

## Deployment

The APIs are serverless functions compatible with:
- Vercel Functions
- AWS Lambda
- Google Cloud Functions
- Any Node.js serverless platform

## Testing

Start the development server:
```bash
npm run dev
```

The frontend component automatically calls the `/api/analyze-ats` endpoint when users click "Analyze Resume".

## Error Handling

The API returns proper HTTP status codes:
- `200` - Success
- `400` - Bad request (missing required fields)
- `405` - Method not allowed
- `500` - Server error

Error responses include:
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```
