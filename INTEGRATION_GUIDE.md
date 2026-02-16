# ATS Analyzer Backend - Developer Integration Guide

## Quick Start

### 1. Understanding the Response Structure

When you call the `/api/analyze-ats` endpoint, you get a comprehensive analysis object:

```typescript
interface AnalysisResult {
  score: number;                          // 0-100 percentage
  overallAssessment: string;              // Human-readable summary
  summary: string;                        // Quick resume overview
  contentPresent: string[];               // What's in the resume
  contentAbsent: string[];                // What's missing
  strengths: Array<{
    title: string;
    description: string;
  }>;
  improvements: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  keywords: Array<{
    word: string;
    found: boolean;
    importance: 'critical' | 'important' | 'nice-to-have';
  }>;
  jobDescriptionKeywords?: Array<{
    word: string;
    found: boolean;
    importance: 'critical' | 'important' | 'nice-to-have';
  }>;
  sectionScores: Array<{
    section: string;
    score: number;
    feedback: string;
  }>;
  formatAnalysis: Array<{
    aspect: string;
    status: 'good' | 'warning' | 'error';
    message: string;
  }>;
}
```

### 2. Frontend Integration

```typescript
// Call the API
const analyzeResume = async (resumeText: string, jobDesc?: string) => {
  const response = await fetch('/api/analyze-ats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText: resumeText,
      jobDescriptionText: jobDesc || null
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json() as AnalysisResult;
};

// Use the results
const result = await analyzeResume(extractedText);

// Display score
console.log(`Score: ${result.score}%`);

// Show summary
console.log(result.summary);

// List improvements
result.improvements.forEach(imp => {
  console.log(`[${imp.priority}] ${imp.title}`);
  console.log(`  ${imp.description}`);
});
```

### 3. Key Features Breakdown

#### A. Overall Score (0-100%)
- **80-100%**: Excellent ATS optimization
- **70-79%**: Good optimization with minor improvements
- **50-69%**: Needs optimization
- **< 50%**: Requires significant work

#### B. Resume Summary
The `summary` field provides a quick overview:
```
📊 **Resume Overview**: 380 words
⏱️ **Experience**: Approximately 5+ years
📋 **Sections Included**: Experience, Education, Skills, Summary
📞 **Contact Info**: Email, Phone, LinkedIn
🔧 **Key Skills Found**: javascript, react, node.js
```

#### C. Content Analysis
Two key arrays help understand what's complete:
- `contentPresent`: Things the resume has ✓
- `contentAbsent`: Things the resume is missing ✗

#### D. Detailed Improvements
Each improvement includes:
- **Title**: Quick summary of what to fix
- **Description**: Detailed explanation with examples
- **Priority**: High/Medium/Low importance

```typescript
// Prioritize by importance
const highPriority = result.improvements.filter(i => i.priority === 'high');
const mediumPriority = result.improvements.filter(i => i.priority === 'medium');
const lowPriority = result.improvements.filter(i => i.priority === 'low');
```

#### E. Keyword Analysis
Identify which keywords are present/missing:
- **Critical**: Must-have keywords
- **Important**: Strongly recommended
- **Nice-to-have**: Bonus keywords

```typescript
// Find missing critical keywords
const missingCritical = result.keywords.filter(
  k => k.importance === 'critical' && !k.found
);
```

### 4. Job Description Matching

When a job description is provided, the API:

1. Extracts skills from the JD
2. Compares with resume content
3. Returns `jobDescriptionKeywords` array

```typescript
// See what skills from JD are missing in resume
const missingDemandedSkills = result.jobDescriptionKeywords?.filter(
  k => !k.found && k.importance === 'critical'
);

// Tell user which skills to add
missingDemandedSkills?.forEach(skill => {
  console.log(`Add skill: ${skill.word}`);
});
```

### 5. Format Analysis

Technical aspects of the resume:

```typescript
result.formatAnalysis.forEach(format => {
  console.log(`${format.aspect}: ${format.status}`);
  console.log(`  Message: ${format.message}`);
  // status: 'good' | 'warning' | 'error'
});
```

### 6. Common Use Cases

#### Use Case 1: Simple Score Display
```tsx
<div className="text-6xl font-bold">{result.score}%</div>
<p className="text-secondary">{result.overallAssessment}</p>
```

#### Use Case 2: Quick Summary
```tsx
<pre className="text-sm">{result.summary}</pre>
```

#### Use Case 3: Improvement Checklist
```tsx
{result.improvements.map(imp => (
  <ChecklistItem
    title={imp.title}
    priority={imp.priority}
    description={imp.description}
  />
))}
```

#### Use Case 4: Resume Completeness
```tsx
<div>
  <h3>What's Present</h3>
  {result.contentPresent.map(item => (
    <Badge key={item} variant="outline" className="bg-green-50">
      ✓ {item}
    </Badge>
  ))}
  
  <h3>What's Missing</h3>
  {result.contentAbsent.map(item => (
    <Badge key={item} variant="outline" className="bg-red-50">
      ✗ {item}
    </Badge>
  ))}
</div>
```

#### Use Case 5: Detailed Report
```tsx
<Accordion>
  <AccordionItem>
    <h3>Score Breakdown</h3>
    {result.sectionScores.map(section => (
      <div>
        <span>{section.section}</span>
        <Progress value={section.score} />
        <p>{section.feedback}</p>
      </div>
    ))}
  </AccordionItem>
  
  <AccordionItem>
    <h3>Recommended Actions</h3>
    {result.improvements
      .filter(i => i.priority === 'high')
      .map(imp => <ActionItem key={imp.title} {...imp} />)
    }
  </AccordionItem>
</Accordion>
```

### 7. Error Handling

```typescript
try {
  const result = await analyzeResume(text, jobDesc);
  console.log(`Analysis score: ${result.score}%`);
} catch (error) {
  if (error instanceof Error) {
    console.error('Analysis failed:', error.message);
    // Handle specific errors:
    // - Missing resumeText
    // - Invalid format
    // - Server error
  }
}
```

### 8. Performance Considerations

- **Process text client-side**: Extract PDF/DOCX text on frontend
- **Send only text**: Don't send binary files to API
- **Debounce multiple analyses**: If user uploads multiple files
- **Cache results**: Store result if analyzing same text again

```typescript
// Good: Extract text on client, send text to API
const text = await extractPdfText(file);
const result = await analyzeResume(text);

// Bad: Try to send file directly
const result = await analyzeResume(file); // Won't work
```

### 9. Testing

#### Test with a Complete Resume
```javascript
const goodResume = `
John Doe | john@email.com | (555) 123-4567
LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 7+ years building web applications.

EXPERIENCE
Senior Engineer at TechCorp (2020-Present)
- Led microservices project, improving performance by 45%
- Managed team of 4 engineers
- Implemented CI/CD pipeline, reducing deployment time by 60%

SKILLS
JavaScript, React, Node.js, Python, AWS, Docker, Kubernetes
`;

fetch('/api/analyze-ats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ resumeText: goodResume })
})
.then(r => r.json())
.then(result => console.log('Score:', result.score)); // Should be 75+%
```

#### Test with a Bare Resume
```javascript
const minimumResume = "John Doe\njohn@email.com\nSoftware Developer";

fetch('/api/analyze-ats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ resumeText: minimumResume })
})
.then(r => r.json())
.then(result => console.log('Score:', result.score)); // Should be 20-30%
```

### 10. Advanced Customization

If you need to modify the scoring algorithm:

**Edit `/api/analyze-ats.js`:**
- `industryKeywords`: Add your own keywords
- `actionVerbs`: Customize action verbs list
- Scoring weights: Adjust point allocations
- Analysis functions: Modify `analyzeResumeContent()`

```javascript
// Example: Change tech keywords weight
const techScore = Math.min(techKeywordCount * 3, 40); // Was 30 points

// Example: Add new section requirement
if (!text.includes('certifications')) {
  absent.push('Certifications'); // Adds to contentAbsent
}
```

### 11. Deployment

#### For Vercel:
```bash
npm run build
vercel deploy
# API auto-deployed from /api directory
```

#### For other platforms:
The core `analyzeResumeContent()` function is framework-agnostic. You can:
1. Extract the function
2. Wrap it in your preferred framework (Express, Flask, etc.)
3. Deploy to your server

```javascript
// Express example
app.post('/api/analyze-ats', (req, res) => {
  const { resumeText, jobDescriptionText } = req.body;
  const result = analyzeResumeContent(resumeText, jobDescriptionText);
  res.json(result);
});
```

---

## Summary

The ATS Analyzer backend provides comprehensive resume analysis with:
- ✅ Percentage-based compatibility score
- ✅ Content present/absent tracking
- ✅ Resume summary overview
- ✅ Detailed, actionable improvement suggestions
- ✅ Keyword analysis with job description matching
- ✅ Format and structure evaluation
- ✅ Strengths and positive feedback

Use this data to build powerful resume optimization tools for your users!
