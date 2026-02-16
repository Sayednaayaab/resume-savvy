# ATS Analyzer Backend Setup Guide

## Overview

This document explains the complete ATS Resume Analyzer backend system that provides:
- **Total Score in Percentage** - Comprehensive scoring algorithm
- **Content Analysis** - What's present and absent in the resume
- **Resume Summary** - Quick overview of resume composition
- **Points of Improvement** - Detailed, actionable suggestions for optimization

## API Endpoint

### URL
```
POST /api/analyze-ats
```

### Request Format
```json
{
  "resumeText": "string (required) - The extracted text from the resume",
  "jobDescriptionText": "string (optional) - Job description for targeted analysis"
}
```

### Response Format
```json
{
  "score": 85,
  "overallAssessment": "string",
  "strengths": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "improvements": [
    {
      "title": "string",
      "description": "string with examples and actionable steps",
      "priority": "high|medium|low"
    }
  ],
  "keywords": [
    {
      "word": "string",
      "found": "boolean",
      "importance": "critical|important|nice-to-have"
    }
  ],
  "jobDescriptionKeywords": [
    {
      "word": "string",
      "found": "boolean",
      "importance": "critical|important|nice-to-have"
    }
  ],
  "sectionScores": [
    {
      "section": "string",
      "score": "number",
      "feedback": "string"
    }
  ],
  "formatAnalysis": [
    {
      "aspect": "string",
      "status": "good|warning|error",
      "message": "string"
    }
  ],
  "summary": "string - Resume overview with key metrics",
  "contentPresent": ["string"] - Array of content sections found in resume,
  "contentAbsent": ["string"] - Array of missing content sections
}
```

## Scoring Breakdown

The ATS Compatibility Score is calculated from 6 key components:

### 1. **Keyword Analysis** (30 points maximum)
- Scans for industry-specific keywords
- Checks for technical skills, tools, and methodologies
- Evaluates general professional competencies

**Keywords Categories:**
- **Tech**: JavaScript, Python, React, AWS, Docker, Kubernetes, etc.
- **Management**: Leadership, Project Management, Strategic Planning, etc.
- **Marketing**: Digital Marketing, SEO, Content Strategy, Analytics, etc.
- **General**: Communication, Problem Solving, Team Collaboration, etc.

### 2. **Action Verbs** (15 points maximum)
- Counts usage of strong action verbs at the start of achievements
- Examples: Achieved, Delivered, Implemented, Led, Managed, Developed, Created, Improved, Increased, Reduced, Optimized, Launched, Designed, Built, Analyzed

**Target:** Minimum 5 action verbs for optimal score

### 3. **Section Structure** (20 points maximum)
- Checks for proper resume sections
- Critical sections: Experience, Education, Skills
- Bonus sections: Summary, Projects, Certifications, Achievements

**Required Sections:**
- ✓ Experience / Work History (4 points)
- ✓ Education / Degree / University (4 points)
- ✓ Skills Section (4 points)
- ✓ Professional Summary (2 points)
- ✓ Projects / Portfolio (2 points)
- ✓ Certifications (2 points)
- ✓ Achievements / Awards (2 points)

### 4. **Quantified Achievements** (15 points maximum)
- Looks for numbers, percentages, and metrics
- Pattern matching for: percentages (%), currency ($), year counts, project/client counts

**Target:** At least 3 quantified results

### 5. **Format & Presentation** (10 points maximum)
- **Email Address** (2 points) - Valid email format
- **Phone Number** (2 points) - Proper phone formatting
- **Resume Length** (3 points) - Ideal range: 300-600 words
- **LinkedIn Profile** (1 point) - LinkedIn URL included
- **Bullet Points** (2 points) - Proper use of bullet formatting

### 6. **Content Quality** (10 points maximum)
- **Metrics Present** (5 points) - 3+ quantified results
- **Strong Action Verbs** (5 points) - 5+ action verbs found

## Content Analysis Features

### 1. Resume Summary
Provides a quick overview including:
- Total word count
- Estimated years of experience
- Sections included in the resume
- Contact information completeness
- Key skills identified

### 2. Content Present
Tracks successfully detected content:
- Contact Information
- Professional Summary/Objective
- Work Experience
- Education
- Skills Section
- LinkedIn Profile
- Portfolio/Projects
- Certifications
- Quantified Results
- Action Verbs
- Bullet Point Formatting

### 3. Content Absent
Lists missing elements that could improve the resume:
- Missing contact information
- Lack of professional summary
- No dedicated skills section
- Missing quantified results
- Insufficient action verbs
- No LinkedIn profile
- Inadequate bullet point usage

## Detailed Improvement Suggestions

Each improvement includes:
1. **Clear Title** - What needs to be improved
2. **Specific Description** - Why it matters with concrete examples
3. **Priority Level** - High/Medium/Low
4. **Actionable Steps** - What to do about it

### High Priority Improvements
- Add powerful action verbs
- Add quantifiable metrics
- Include industry keywords
- Proper section structure
- Complete contact information
- Dedicated skills section
- Appropriate content length

### Medium Priority Improvements
- Add LinkedIn profile URL
- Use bullet points
- Add professional summary
- Create projects/achievements section
- Optimize formatting

## Job Description Matching

When a job description is provided:
1. Extracts skills and requirements from the JD
2. Identifies critical keywords specific to the role
3. Compares resume against these requirements
4. Highlights missing keywords that should be added
5. Provides targeted improvement suggestions

## Implementation Details

### Technology Stack
- **Runtime**: Node.js (Serverless - Vercel compatible)
- **Frontend**: React + TypeScript
- **File Processing**: 
  - PDF: pdf.js (pdf-parse)
  - DOCX: Mammoth.js
  - TXT: FileReader API
- **API**: RESTful with JSON payload

### File Size Handling
- Maximum resume size: ~10MB (typical)
- Text extraction is performed client-side
- Only text content is sent to the API (privacy-respecting)

## Frontend Integration

### Usage Example
```typescript
const analyzeResume = async () => {
  const response = await fetch('/api/analyze-ats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText: extractedText,
      jobDescriptionText: jobDesc || null
    })
  });

  const result = await response.json();
  // Use result.score, result.summary, result.contentPresent, etc.
};
```

### Display Components
- **Score Card** - Large displaying percentage score
- **Resume Summary** - Overview of resume content
- **Content Status** - Present (green) / Absent (red) indicators
- **Strengths** - What's working well
- **Improvements** - Prioritized action items
- **Format Analysis** - Technical aspects
- **Keywords** - Critical/Important/Nice-to-have
- **Job-Specific Keywords** - When JD is provided

## Performance Metrics

- **Analysis Time**: < 1 second typical
- **API Response**: < 500ms
- **File Processing**: < 3 seconds (depends on file size)

## Error Handling

The API gracefully handles:
- Missing resume text
- Malformed job descriptions
- Empty files
- Invalid text extraction
- Network errors

**Example Error Response:**
```json
{
  "error": "Failed to analyze resume",
  "message": "resumeText is required"
}
```

## Future Enhancements

Potential features to consider:
1. Machine learning-based keyword extraction
2. Role-specific scoring benchmarks
3. Industry comparison metrics
4. Resume template suggestions
5. Competitive analysis against similar roles
6. Real-time ATS database updates
7. Integration with job boards API
8. Resume rewrite suggestions with AI

## Testing the API

### Test Resume Example
```
Resume: John Doe | john@email.com | (555) 123-4567
LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Results-driven software engineer with 7+ years of experience building 
scalable web applications using React, Node.js, and AWS.

EXPERIENCE
Senior Software Engineer at Tech Company (2020-Present)
- Led development of microservices architecture, improving system performance by 40%
- Implemented CI/CD pipeline using Docker and Kubernetes, reducing deployment time by 60%
- Managed team of 5 engineers and mentored 3 junior developers

EDUCATION
B.S. Computer Science | University Name | 2016

SKILLS
Languages: JavaScript, Python, TypeScript
Frontend: React, Vue, Angular
Backend: Node.js, Django, Express
Cloud: AWS, GCP, Azure
...
```

**Expected Score**: 78-85% (High quality resume)

## Support & Troubleshooting

### Issue: Score seems low
- Check if all sections are properly labeled
- Ensure action verbs are at the start of bullet points
- Add more quantified metrics
- Include more industry keywords

### Issue: Job description keywords not extracted
- Ensure job description has clear "Skills" or "Requirements" section
- Use common section headers (Skills, Requirements, Qualifications)
- Consider copy-pasting the relevant sections

### Issue: Missing content detection
- Some resume formats may not be parsed correctly
- Try re-uploading in a different format (PDF vs DOCX)
- Ensure section headers match common naming conventions

## API Deployment

This API is configured for **Vercel Serverless Functions**:
- Place in `/api` directory
- Uses standard Node.js `module.exports` format
- Automatically scalable
- No server management needed

For other platforms, the core `analyzeResumeContent()` function can be adapted.

## License & Terms

This ATS analyzer provides insights based on common ATS practices but doesn't guarantee resume acceptance by specific systems, as each company's ATS has different requirements.

---

**Last Updated**: February 2026
**Version**: 2.0
