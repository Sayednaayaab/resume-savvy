# ATS Analyzer API - Quick Reference

## Response Fields At a Glance

### Primary Metrics

| Field | Type | Example | Usage |
|-------|------|---------|-------|
| `score` | number | 82 | Main ATS compatibility percentage |
| `overallAssessment` | string | "Good job! Your resume..." | Human-readable summary |

### Content Overview

| Field | Type | Example | Usage |
|-------|------|---------|-------|
| `summary` | string | "📊 **Resume Overview**: 380 words..." | Quick resume snapshot |
| `contentPresent` | string[] | ["Contact Info", "Skills"] | What's in the resume |
| `contentAbsent` | string[] | ["LinkedIn", "Certifications"] | What's missing |

### Improvements & Feedback

| Field | Type | Schema | Usage |
|-------|------|--------|-------|
| `improvements` | array | `{title, description, priority}` | Actionable recommendations |
| `strengths` | array | `{title, description}` | What's working well |

### Keyword Analysis

| Field | Type | Schema | Usage |
|-------|------|--------|-------|
| `keywords` | array | `{word, found, importance}` | Standard keywords found/missing |
| `jobDescriptionKeywords` | array | `{word, found, importance}` | JD-specific keywords (if provided) |

### Technical Analysis

| Field | Type | Schema | Usage |
|-------|------|--------|-------|
| `sectionScores` | array | `{section, score, feedback}` | Individual section evaluation |
| `formatAnalysis` | array | `{aspect, status, message}` | Format quality checks |

---

## Response Examples

### Minimal Response (Low Score)
```json
{
  "score": 25,
  "overallAssessment": "Requires significant improvements",
  "summary": "📊 Resume has only 80 words",
  "contentPresent": ["Contact Information"],
  "contentAbsent": ["Professional Summary", "Skills", "LinkedIn"],
  "improvements": [5 high-priority items],
  "strengths": [],
  "keywords": [mostly false],
  "sectionScores": [mostly 0 scores],
  "formatAnalysis": [mostly warnings/errors]
}
```

### Strong Response (High Score)
```json
{
  "score": 88,
  "overallAssessment": "Excellent! ATS optimization is great",
  "summary": "Resume contains 450 words with 5+ years experience",
  "contentPresent": [9 items],
  "contentAbsent": [1-2 items],
  "improvements": [1-2 medium priority items],
  "strengths": [3-5 items],
  "keywords": [mostly true with critical importance],
  "sectionScores": [mostly 100 scores],
  "formatAnalysis": [mostly good status]
}
```

---

## Field Details

### `score` (0-100)
```
80-100: Excellent (will pass most ATS systems)
70-79:  Good (strong resume, minor improvements)
50-69:  Fair (needs work for ATS compatibility)
<50:    Poor (requires significant improvements)
```

### `improvements` Array

Each item has:
```typescript
{
  title: string;              // "Add Action Verbs"
  description: string;        // "Replace weak verbs with strong action verbs..."
  priority: "high" | "medium" | "low";
}
```

**High Priority**: Directly affects ATS compatibility and score
**Medium Priority**: Improves quality and recruiter experience
**Low Priority**: Nice-to-have enhancements

### `keywords` Array

Each item has:
```typescript
{
  word: string;               // "React"
  found: boolean;             // true = in resume, false = missing
  importance: "critical" | "important" | "nice-to-have";
}
```

### `contentPresent` & `contentAbsent` Arrays

Arrays of strings representing resume sections:
```javascript
contentPresent: [
  "Contact Information",
  "Professional Summary",
  "Work Experience",
  "Skills Section",
  "Quantified Results"
]

contentAbsent: [
  "LinkedIn Profile",
  "Certifications",
  "Projects Section"
]
```

### `sectionScores` Array

Each item evaluates a resume section:
```typescript
{
  section: string;            // "Experience", "Education", etc.
  score: 0-100;              // Percentage score for that section
  feedback: string;          // "Section detected and proper"
}
```

### `formatAnalysis` Array

Technical quality checks:
```typescript
{
  aspect: string;            // "Email", "Phone", "Length", etc.
  status: "good" | "warning" | "error";
  message: string;           // Specific feedback
}
```

---

## Display Recommendations

### Score Display
```typescript
if (result.score >= 80) {
  // Show "Excellent" with green color
  showBadge('Excellent', 'success');
} else if (result.score >= 60) {
  // Show "Good" with yellow/warning color
  showBadge('Good', 'warning');
} else {
  // Show "Needs Work" with red color
  showBadge('Needs Work', 'error');
}
```

### Improvements Display Strategy
```typescript
// Show high-priority first
const highPriority = result.improvements.filter(i => i.priority === 'high');
const mediumPriority = result.improvements.filter(i => i.priority === 'medium');

// Limit to top 3-5 per category
highPriority.slice(0, 3).forEach(displayImprovement);
```

### Content Status Display
```typescript
// Show what's present (green checkmarks)
result.contentPresent.forEach(item => {
  showItem('✓', item, 'success');
});

// Show what's missing (red X marks)
result.contentAbsent.forEach(item => {
  showItem('✗', item, 'error');
});
```

### Keyword Highlighting
```typescript
// Highlight found keywords in green
result.keywords.filter(k => k.found).forEach(kw => {
  highlightKeyword(kw.word, 'success');
});

// Show missing keywords in red
result.keywords.filter(k => !k.found).forEach(kw => {
  showMissingKeyword(kw.word, 'error');
});
```

---

## API Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Analysis completed |
| 400 | Bad Request | Missing resumeText |
| 405 | Not Allowed | Using GET instead of POST |
| 500 | Server Error | Processing failed |

### Error Response Format
```json
{
  "error": "Failed to analyze resume",
  "message": "resumeText is required"
}
```

---

## Common Data Points to Extract

### For Dashboard Display
```javascript
const dashboard = {
  overallScore: result.score,
  assessment: result.overallAssessment,
  keyStrengths: result.strengths.slice(0, 3),
  topImprovements: result.improvements
    .filter(i => i.priority === 'high')
    .slice(0, 3)
};
```

### For Comparison Analysis
```javascript
const comparison = {
  completeness: result.contentPresent.length,
  missingItems: result.contentAbsent.length,
  criticalKeywordsFound: result.keywords
    .filter(k => k.importance === 'critical' && k.found).length,
  criticalKeywordsMissing: result.keywords
    .filter(k => k.importance === 'critical' && !k.found).length
};
```

### For Job Matching
```javascript
const jobMatch = {
  requiredSkillsFound: result.jobDescriptionKeywords
    ?.filter(k => k.found && k.importance === 'critical').length || 0,
  requiredSkillsMissing: result.jobDescriptionKeywords
    ?.filter(k => !k.found && k.importance === 'critical').length || 0,
  matchPercentage: (requiredSkillsFound / (requiredSkillsFound + requiredSkillsMissing)) * 100
};
```

---

## Common Use Cases

### 1. Show Simple Score
```typescript
<ScoreDisplay score={result.score} assessment={result.overallAssessment} />
```

### 2. Show Improvement Items
```typescript
{result.improvements.map(imp => (
  <ImprovementCard {...imp} />
))}
```

### 3. Show Content Completeness
```typescript
<ContentStatus present={result.contentPresent} absent={result.contentAbsent} />
```

### 4. Show Job Match
```typescript
{result.jobDescriptionKeywords && (
  <JobMatchPanel keywords={result.jobDescriptionKeywords} />
)}
```

### 5. Show Quick Summary
```typescript
<pre>{result.summary}</pre>
```

---

## Performance Tips

1. **Cache results**: Store analysis for same resume text
2. **Debounce**: Prevent multiple API calls for repeated uploads
3. **Progressive loading**: Show score first, details later
4. **Lazy load**: Display improvements below the fold
5. **Minimize re-renders**: Use React memo for improvement cards

---

## Troubleshooting

### Score seems low
- Check for missing keywords
- Look for weak action verbs
- Verify section structure
- Ensure quantified results

### Job keywords not extracted
- Verify JD has clear "Skills" section
- Check JD has 20+ words (too short = no extraction)
- Ensure section contains actual skill names

### Missing content not detected
- Check section header capitalization
- Verify syntax: "Skills" vs "skill"
- Resume format might not be parsed correctly

### Contact info not found
- Email must be valid format
- Phone must be standard format
- LinkedIn must be full URL

---

## API Rate Limits

- **Vercel**: 1000 requests/month (free tier), unlimited (pro)
- **Local**: No limits
- **Custom Server**: Configure based on deployment

---

## Support Resources

1. **BACKEND_SETUP.md** - Complete backend docs
2. **INTEGRATION_GUIDE.md** - Developer integration
3. **ATS_ANALYZER_README.md** - Full reference
4. **ANALYZE_ATS_EXAMPLES.js** - Code examples

---

## Quick Start Template

```typescript
// 1. Call the API
const response = await fetch('/api/analyze-ats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    resumeText: resumeContent,
    jobDescriptionText: jobDescription || null
  })
});

// 2. Get the result
const result = await response.json();

// 3. Display score
console.log(`Score: ${result.score}%`);

// 4. Show improvements
result.improvements.forEach(imp => {
  console.log(`[${imp.priority}] ${imp.title}`);
});

// 5. Show summary
console.log(result.summary);
```

---

**Last Updated**: February 2026
**API Version**: 2.0
