/**
 * ATS Analyzer API - Test Examples
 * 
 * This file demonstrates how the ATS analyzer API works
 * with example requests and responses.
 */

// ============================================
// EXAMPLE 1: Basic Resume Analysis
// ============================================

/**
 * REQUEST
 */
const basicRequest = {
  method: 'POST',
  url: '/api/analyze-ats',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    resumeText: `
John Doe
john.doe@email.com | (555) 123-4567
LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 5+ years of experience developing scalable web applications. 
Proficient in JavaScript, React, and Node.js. Proven track record of delivering high-quality solutions 
and leading cross-functional teams.

EXPERIENCE
Senior Software Engineer at Tech Company (2020-Present)
- Led development of microservices architecture, improving system performance by 40%
- Implemented CI/CD pipeline using Docker and Kubernetes, reducing deployment time by 60%
- Managed team of 5 engineers and mentored 3 junior developers
- Achieved 99.9% uptime for production systems serving 100K+ users

Software Engineer at StartUp Inc (2018-2020)
- Developed React components using modern JavaScript and TypeScript
- Built REST APIs using Node.js and Express.js
- Optimized database queries, reducing query time by 35%

EDUCATION
B.S. Computer Science | State University | 2018

SKILLS
Programming Languages: JavaScript, Python, TypeScript, Java
Frontend: React, Vue.js, CSS, HTML5
Backend: Node.js, Express.js, Django, MongoDB, PostgreSQL
Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD (Jenkins, GitLab CI)
Other Tools: Git, Jira, Agile/Scrum
    `,
    jobDescriptionText: null
  }
};

/**
 * RESPONSE (Expected ~ 82% score)
 */
const basicResponse = {
  score: 82,
  overallAssessment: "Good job! Your resume is well-structured with some room for improvement to maximize ATS compatibility.",
  
  summary: `📊 **Resume Overview**: 380 words
⏱️ **Experience**: Approximately 5+ years
📋 **Sections Included**: Experience, Education, Skills, Summary
📞 **Contact Info**: Email, Phone, LinkedIn
🔧 **Key Skills Found**: javascript, react, node.js, python, kubernetes`,

  contentPresent: [
    "Contact Information",
    "Professional Summary/Objective",
    "Work Experience",
    "Education",
    "Skills Section",
    "LinkedIn Profile",
    "Quantified Results",
    "Action Verbs",
    "Bullet Point Formatting"
  ],

  contentAbsent: [
    "Portfolio/Projects",
    "Certifications"
  ],

  strengths: [
    {
      title: "Strong Action Verbs",
      description: "Used 8 powerful action verbs that demonstrate leadership and initiative"
    },
    {
      title: "Quantified Achievements",
      description: "Included measurable results and metrics that demonstrate impact"
    },
    {
      title: "Industry Keywords",
      description: "Resume contains relevant industry-specific keywords for ATS optimization"
    },
    {
      title: "Well-Structured Format",
      description: "Resume has clear sections that ATS systems can easily parse"
    },
    {
      title: "Complete Contact Information",
      description: "Professional contact details are clearly presented"
    }
  ],

  improvements: [
    {
      title: "Add Certifications Section",
      description: "Include any professional certifications or credentials. Examples: AWS Certified Solutions Architect, Kubernetes Administrator, Google Cloud Professional. This demonstrates continued professional development.",
      priority: "medium"
    },
    {
      title: "Add Projects or Achievements Section",
      description: "Include notable projects that demonstrate your capabilities. For each project provide: Project name, your role, technologies used, and key result/impact. Example sections: GitHub projects, personal portfolio, open-source contributions.",
      priority: "medium"
    }
  ],

  keywords: [
    { word: "JavaScript", found: true, importance: "critical" },
    { word: "React", found: true, importance: "critical" },
    { word: "Node.js", found: true, importance: "critical" },
    { word: "AWS", found: true, importance: "important" },
    { word: "Docker", found: true, importance: "important" },
    { word: "Leadership", found: true, importance: "important" },
    { word: "Project Management", found: false, importance: "important" },
    { word: "Kubernetes", found: true, importance: "critical" },
    { word: "CI/CD", found: true, importance: "important" }
  ],

  jobDescriptionKeywords: [],

  sectionScores: [
    { section: "Experience", score: 100, feedback: "Section detected and properly formatted" },
    { section: "Education", score: 100, feedback: "Section detected and properly formatted" },
    { section: "Skills", score: 100, feedback: "Section detected and properly formatted" },
    { section: "Summary", score: 100, feedback: "Section detected and properly formatted" },
    { section: "Projects", score: 0, feedback: "Missing projects section - consider adding it" }
  ],

  formatAnalysis: [
    {
      aspect: "Contact Email",
      status: "good",
      message: "Email address detected"
    },
    {
      aspect: "Phone Number",
      status: "good",
      message: "Phone number detected"
    },
    {
      aspect: "Resume Length",
      status: "good",
      message: "Good length (380 words)"
    },
    {
      aspect: "LinkedIn Profile",
      status: "good",
      message: "LinkedIn profile included"
    },
    {
      aspect: "Bullet Points",
      status: "good",
      message: "Good use of bullet points for readability"
    }
  ]
};


// ============================================
// EXAMPLE 2: Analysis with Job Description
// ============================================

const jobMatchRequest = {
  resumeText: basicRequest.body.resumeText,
  jobDescriptionText: `
Senior Full Stack Engineer

We are looking for a Senior Full Stack Engineer with:

Requirements:
- 5+ years of professional software development experience
- Strong proficiency in JavaScript/TypeScript
- Experience with React and modern frontend frameworks
- Backend experience with Node.js and REST APIs
- Database design and optimization skills (SQL and NoSQL)
- Experience with AWS or other cloud platforms
- Docker and containerization knowledge
- Agile/Scrum methodology experience
- Leadership and mentoring experience

Preferred:
- Kubernetes experience
- CI/CD pipeline implementation
- Microservices architecture
- GraphQL experience
- Open source contributions
- Published technical writing
  `
};

/**
 * Response includes jobDescriptionKeywords extracted from JD
 */
const jobMatchResponse = {
  ...basicResponse,
  jobDescriptionKeywords: [
    { word: "javascript", found: true, importance: "critical" },
    { word: "typescript", found: true, importance: "critical" },
    { word: "react", found: true, importance: "critical" },
    { word: "node.js", found: true, importance: "critical" },
    { word: "aws", found: true, importance: "critical" },
    { word: "docker", found: true, importance: "critical" },
    { word: "kubernetes", found: true, importance: "important" },
    { word: "rest api", found: true, importance: "important" },
    { word: "sql", found: true, importance: "important" },
    { word: "nosql", found: true, importance: "important" },
    { word: "agile", found: false, importance: "important" },
    { word: "scrum", found: false, importance: "important" },
    { word: "microservices", found: true, importance: "important" }
  ]
};


// ============================================
// EXAMPLE 3: Low-Scoring Resume
// ============================================

const lowScoreResume = `
Jane Smith
jane.smith@email.com

EXPERIENCE
Worked at Company A
Did various tasks related to software development

Worked at Company B
Responsible for coding and testing

EDUCATION
Bachelor's Degree in Computer Science

SKILLS
coding, testing, development
`;

/**
 * RESPONSE (Expected ~ 35% score)
 */
const lowScoreResponse = {
  score: 35,
  overallAssessment: "Your resume requires significant improvements for ATS compatibility. Follow our recommendations carefully.",

  summary: `📊 **Resume Overview**: 65 words
📋 **Sections Included**: Experience, Education, Skills
📞 **Contact Info**: Email`,

  contentPresent: [
    "Contact Information"
  ],

  contentAbsent: [
    "Phone Number",
    "LinkedIn Profile",
    "Professional Summary/Objective",
    "Quantified Results",
    "Strong Action Verbs",
    "Proper Bullet Point Formatting"
  ],

  improvements: [
    {
      title: "Add Powerful Action Verbs",
      description: "Replace weak verbs with strong action verbs. Instead of 'Responsible for X', say 'Led X', 'Achieved X', or 'Implemented X'. Examples: Achieved, Delivered, Implemented, Led, Managed, Developed, Created, Improved, Increased, Reduced, Optimized, Launched, Designed, Built, Analyzed.",
      priority: "high"
    },
    {
      title: "Add Quantifiable Metrics",
      description: "Include numbers and percentages to demonstrate impact. Instead of 'Improved sales', say 'Increased sales by 35%' or 'Generated $500K in revenue'. Use metrics like: %, $, numbers of projects, team size, years.",
      priority: "high"
    },
    {
      title: "Expand Resume Content",
      description: "Your resume is too brief (only 65 words). Aim for 300-600 words. Add more detail about your experience, achievements, and skills. Include specific projects, accomplishments, and measurable results.",
      priority: "high"
    },
    {
      title: "Add Professional Summary/Objective",
      description: "Include a 2-3 line professional summary at the top highlighting your key strengths and career goals. Example: 'Results-driven software engineer with 5+ years of experience developing web applications. Skilled in React, Node.js, and AWS with proven track record of delivering high-quality solutions.'",
      priority: "high"
    },
    {
      title: "Use Bullet Points for Readability",
      description: "Format achievements and responsibilities as bullet points rather than paragraphs. This improves ATS parsing and makes content scannable.",
      priority: "high"
    },
    {
      title: "Include Industry Keywords",
      description: "Add relevant technical and soft skills keywords. Research job descriptions in your field and mirror industry terminology.",
      priority: "high"
    }
  ]
};


// ============================================
// SCORING ALGORITHM REFERENCE
// ============================================

/**
 * Total Score Calculation:
 * 
 * Component              | Max Points | Details
 * ─────────────────────────────────────────────────────────────
 * Keyword Analysis       | 30         | Industry-specific keywords
 * Action Verbs           | 15         | Words like "Achieved", "Led", etc.
 * Section Structure      | 20         | Proper resume sections
 * Quantified Results     | 15         | Numbers, percentages, metrics
 * Format & Presentation  | 10         | Email, phone, length, LinkedIn, bullets
 * Content Quality        | 10         | Metrics + action verbs quality
 * ─────────────────────────────────────────────────────────────
 * TOTAL                  | 100        | Final ATS Compatibility %
 */

// ============================================
// API TESTING INSTRUCTIONS
// ============================================

/**
 * To test the API locally:
 * 
 * 1. Using cURL:
 *    curl -X POST http://localhost:3000/api/analyze-ats \
 *      -H "Content-Type: application/json" \
 *      -d '{"resumeText":"..."}'
 * 
 * 2. Using JavaScript Fetch:
 *    const response = await fetch('/api/analyze-ats', {
 *      method: 'POST',
 *      headers: { 'Content-Type': 'application/json' },
 *      body: JSON.stringify({
 *        resumeText: 'your resume text here',
 *        jobDescriptionText: null
 *      })
 *    });
 *    const data = await response.json();
 * 
 * 3. Using Postman:
 *    - Create new POST request
 *    - URL: http://localhost:3000/api/analyze-ats
 *    - Body (raw JSON):
 *      {
 *        "resumeText": "your resume text"
 *      }
 */

// ============================================
// IMPROVEMENT PRIORITIES EXPLAINED
// ============================================

/**
 * HIGH Priority:
 * - Directly impacts ATS parsing and scoring
 * - Missing can result in resume rejection
 * - Examples: No contact info, no relevant skills, too short
 * 
 * MEDIUM Priority:
 * - Improves resume quality and ATS score
 * - Helps with recruiter experience
 * - Examples: Missing LinkedIn, no projects section
 * 
 * LOW Priority:
 * - Nice to have enhancements
 * - Minor ATS impact
 * - Examples: Additional certifications, portfolio links
 */

module.exports = {
  basicRequest,
  basicResponse,
  jobMatchRequest,
  jobMatchResponse,
  lowScoreResume,
  lowScoreResponse
};
