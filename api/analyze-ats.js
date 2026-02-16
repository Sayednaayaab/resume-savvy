// API endpoint for ATS Resume Analysis
// This handles resume analysis on the backend

const industryKeywords = {
  tech: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Git', 'REST API', 'SQL'],
  management: [],
  marketing: ['Digital Marketing', 'SEO', 'SEM', 'Content Marketing', 'Social Media', 'Analytics', 'Campaign Management', 'Brand Strategy', 'Market Research', 'Email Marketing', 'CRM', 'Lead Generation', 'Conversion Rate', 'A/B Testing'],
  general: ['Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Critical Thinking', 'Adaptability', 'Innovation', 'Results-driven', 'Detail-oriented', 'Customer Focus']
};

const actionVerbs = ['Achieved', 'Delivered', 'Implemented', 'Led', 'Managed', 'Developed', 'Created', 'Improved', 'Increased', 'Reduced', 'Optimized', 'Launched', 'Designed', 'Built', 'Analyzed', 'Streamlined', 'Spearheaded', 'Orchestrated', 'Pioneered', 'Transformed'];

// Extract key information from resume
function extractResumeContent(text) {
  const lowerText = text.toLowerCase();
  
  // Extract contact information
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+/i);
  
  // Extract sections
  const sections = {
    experience: lowerText.includes('experience') || lowerText.includes('work history'),
    education: lowerText.includes('education') || lowerText.includes('degree') || lowerText.includes('university'),
    skills: lowerText.includes('skills') || lowerText.includes('technical skills'),
    projects: lowerText.includes('projects') || lowerText.includes('portfolio'),
    certifications: lowerText.includes('certifications') || lowerText.includes('certified'),
    achievements: lowerText.includes('achievements') || lowerText.includes('awards'),
    summary: lowerText.includes('summary') || lowerText.includes('objective') || lowerText.includes('professional summary')
  };
  
  // Count years of experience
  const yearsMatch = text.match(/(\d+)\+?\s+(years?|yrs?)/gi);
  const estimatedExperience = yearsMatch ? yearsMatch[0].match(/\d+/)[0] : null;
  
  // Extract some common skills
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node.js', 'aws', 'sql', 'mongodb',
    'leadership', 'project management', 'communication', 'teamwork', 'analytical',
    'problem solving', 'marketing', 'sales', 'data analysis', 'excel'
  ];
  
  const foundSkills = commonSkills.filter(skill => lowerText.includes(skill));
  const wordCount = text.split(/\s+/).length;
  
  return {
    hasEmail: !!emailMatch,
    hasPhone: !!phoneMatch,
    hasLinkedIn: !!linkedinMatch,
    sections,
    estimatedExperience,
    foundSkills,
    wordCount
  };
}

// Generate resume summary
function generateResumeSummary(text, contentAnalysis) {
  const lines = [];
  
  // Word count
  lines.push(`📊 **Resume Overview**: ${contentAnalysis.wordCount} words`);
  
  // Experience level
  if (contentAnalysis.estimatedExperience) {
    lines.push(`⏱️ **Experience**: Approximately ${contentAnalysis.estimatedExperience}+ years`);
  }
  
  // Sections present
  const presentSections = Object.entries(contentAnalysis.sections)
    .filter(([_, present]) => present)
    .map(([section, _]) => section.charAt(0).toUpperCase() + section.slice(1));
  
  lines.push(`📋 **Sections Included**: ${presentSections.join(', ') || 'None detected'}`);
  
  // Contact info
  const contactParts = [];
  if (contentAnalysis.hasEmail) contactParts.push('Email');
  if (contentAnalysis.hasPhone) contactParts.push('Phone');
  if (contentAnalysis.hasLinkedIn) contactParts.push('LinkedIn');
  
  lines.push(`📞 **Contact Info**: ${contactParts.length > 0 ? contactParts.join(', ') : 'Incomplete'}`);
  
  // Skills
  if (contentAnalysis.foundSkills.length > 0) {
    lines.push(`🔧 **Key Skills Found**: ${contentAnalysis.foundSkills.slice(0, 5).join(', ')}`);
  }
  
  return lines.join('\n');
}

// Analyze content present and absent
function analyzeContentGaps(text, contentAnalysis) {
  const present = [];
  const absent = [];
  
  // Required sections
  const requiredSections = {
    'Contact Information': contentAnalysis.hasEmail && contentAnalysis.hasPhone,
    'Professional Summary/Objective': contentAnalysis.sections.summary,
    'Work Experience': contentAnalysis.sections.experience,
    'Education': contentAnalysis.sections.education,
    'Skills Section': contentAnalysis.sections.skills,
    'LinkedIn Profile': contentAnalysis.hasLinkedIn,
    'Portfolio/Projects': contentAnalysis.sections.projects,
    'Certifications': contentAnalysis.sections.certifications
  };
  
  Object.entries(requiredSections).forEach(([item, exists]) => {
    if (exists) {
      present.push(item);
    } else {
      absent.push(item);
    }
  });
  
  // Check for content quality
  const contentQuality = [];
  
  const hasMetrics = /\d+%|\$[\d,]+|\d+\+?(?:\s+(?:projects?|clients?|team))/gi.test(text);
  if (hasMetrics) {
    present.push('Quantified Results');
  } else {
    absent.push('Quantified Results (numbers, percentages, metrics)');
  }
  
  const hasActionVerbs = /achieved|delivered|implemented|led|managed|developed|created|improved|increased/i.test(text);
  if (hasActionVerbs) {
    present.push('Action Verbs');
  } else {
    absent.push('Strong Action Verbs');
  }
  
  const hasBulletPoints = /[•\-\*]/.test(text);
  if (hasBulletPoints) {
    present.push('Bullet Point Formatting');
  } else {
    absent.push('Bullet Point Formatting');
  }
  
  return { present, absent };
}

// Deep section-level analysis functions
function analyzeContactSection(text) {
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\S+/i);
  const websiteMatch = text.match(/https?:\/\/\S+|www\.\S+/i);
  
  let score = 0;
  const details = [];
  
  if (emailMatch) { score += 25; details.push('Email found'); }
  else { details.push('Missing email'); }
  
  if (phoneMatch) { score += 25; details.push('Phone found'); }
  else { details.push('Missing phone'); }
  
  if (linkedinMatch) { score += 25; details.push('LinkedIn profile found'); }
  else { details.push('Missing LinkedIn profile'); }
  
  if (websiteMatch && !linkedinMatch) { score += 15; details.push('Portfolio/website found'); }
  
  // Deduct if contact info is at bottom instead of top
  const firstFewLines = text.split('\n').slice(0, 3).join('\n').toLowerCase();
  if (!firstFewLines.includes('email') && !firstFewLines.includes('@') && emailMatch) {
    score = Math.max(0, score - 10);
    details.push('Contact info not at top of resume');
  }
  
  return { score: Math.min(score, 100), details, found: { email: !!emailMatch, phone: !!phoneMatch, linkedin: !!linkedinMatch } };
}

function analyzeSummarySection(text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  const details = [];
  const maxScore = 100;
  
  const summaryMatch = text.match(/(?:professional\s+summary|objective|about)[\s\S]{0,200}/i);
  
  if (!summaryMatch) {
    details.push('No professional summary/objective found');
    return { score: 0, details, exists: false };
  }
  
  details.push('Professional summary found');
  score += 15;
  
  const summaryText = summaryMatch[0];
  const summaryLength = summaryText.split(/\s+/).length;
  
  if (summaryLength >= 20 && summaryLength <= 50) {
    score += 25;
    details.push('Optimal summary length (20-50 words)');
  } else if (summaryLength < 10) {
    details.push('Summary too brief - add more details');
  } else if (summaryLength > 100) {
    score += 5;
    details.push('Summary is longer than recommended');
  } else {
    score += 15;
    details.push('Summary length acceptable');
  }
  
  // Check for keywords in summary
  const keywordCount = [...industryKeywords.tech, ...industryKeywords.general].filter(kw => 
    lowerText.substring(0, Math.min(300, lowerText.length)).toLowerCase().includes(kw.toLowerCase())
  ).length;
  
  if (keywordCount >= 3) {
    score += 20;
    details.push('Contains industry keywords');
  } else if (keywordCount > 0) {
    score += 10;
    details.push('Some keywords present in summary');
  } else {
    details.push('No industry keywords in summary');
  }
  
  // Check for action verbs
  const hasActionVerb = actionVerbs.some(verb => summaryText.toLowerCase().includes(verb.toLowerCase()));
  if (hasActionVerb) {
    score += 20;
    details.push('Contains action verbs');
  } else {
    details.push('Add action verbs to summary');
  }
  
  // Check for results/metrics
  const hasMetrics = /\d+%|\$[\d,]+K?M?|[0-9]+\+/.test(summaryText);
  if (hasMetrics) {
    score += 15;
    details.push('Includes quantified results');
  } else {
    details.push('Consider adding metrics to summary');
  }
  
  return { score: Math.min(score, 100), details, exists: true };
}

function analyzeExperienceSection(text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  const details = [];
  
  // Check for experience section
  const experienceMatch = text.match(/(?:work\s+experience|experience|employment history)[\s\S]{0,2000}/i);
  if (!experienceMatch) {
    details.push('No work experience section found');
    return { score: 0, details, exists: false, jobCount: 0 };
  }
  
  details.push('Work experience section found');
  score += 15;
  
  const experienceText = experienceMatch[0];
  
  // Count job entries (usually start with job title or company name)
  const jobEntries = (experienceText.match(/(?:engineer|manager|developer|analyst|designer|coordinator|assistant|specialist|lead|director|director|supervisor)/gi) || []).length;
  const companyMatches = (experienceText.match(/(?:company|at\s+|co\.|inc|ltd|llc|corp)/gi) || []).length;
  
  const estimatedJobs = Math.max(jobEntries, companyMatches) > 0 ? Math.ceil((Math.max(jobEntries, companyMatches)) / 1.5) : 0;
  
  if (estimatedJobs >= 3) {
    score += 20;
    details.push(`Multiple positions found (${estimatedJobs}+)`);
  } else if (estimatedJobs >= 1) {
    score += 15;
    details.push(`${estimatedJobs} position(s) found`);
  } else {
    details.push('Limited job experience shown');
  }
  
  // Count action verbs in experience
  const actionVerbCount = actionVerbs.filter(verb => 
    experienceText.toLowerCase().includes(verb.toLowerCase())
  ).length;
  
  if (actionVerbCount >= 10) {
    score += 25;
    details.push(`Strong action verbs used (${actionVerbCount})`);
  } else if (actionVerbCount >= 5) {
    score += 15;
    details.push(`Good action verbs (${actionVerbCount})`);
  } else if (actionVerbCount > 0) {
    score += 10;
    details.push(`Limited action verbs (${actionVerbCount})`);
  } else {
    details.push('No strong action verbs found');
  }
  
  // Count quantified achievements
  const metrics = experienceText.match(/\d+%|\$[\d,]+K?M?|\d+\+?\s+(?:years?|months?|projects?|clients?|team members?)/gi) || [];
  if (metrics.length >= 5) {
    score += 25;
    details.push(`Many metrics (${metrics.length}) showing impact`);
  } else if (metrics.length >= 3) {
    score += 15;
    details.push(`Good metrics (${metrics.length}) showing results`);
  } else if (metrics.length > 0) {
    score += 10;
    details.push(`Some metrics (${metrics.length}) present`);
  } else {
    details.push('No quantified achievements - add metrics');
  }
  
  return { score: Math.min(score, 100), details, exists: true, jobCount: estimatedJobs, actionVerbCount };
}

function analyzeEducationSection(text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  const details = [];
  
  const eduMatch = text.match(/(?:education|degree|university|school|college)[\s\S]{0,500}/i);
  if (!eduMatch) {
    details.push('No education section found');
    return { score: 0, details, exists: false, degrees: [] };
  }
  
  details.push('Education section found');
  score += 20;
  
  const eduText = eduMatch[0];
  
  // Check for degree types
  const degrees = [];
  const degreePatterns = {
    'bachelor': /b\.?s\.?|bachelor|undergrad/gi,
    'master': /m\.?s\.?|m\.?a\.?|master|graduate/gi,
    'phd': /phd|ph\.?d|doctorate/gi,
    'associate': /associate|a\.?a\.?|a\.?s\.?/gi
  };
  
  for (const [degreeType, pattern] of Object.entries(degreePatterns)) {
    if (pattern.test(eduText)) {
      score += 20;
      degrees.push(degreeType);
      details.push(`${degreeType} degree found`);
    }
  }
  
  // Check for university name
  const universityMatch = eduText.match(/(university|college|school|institute|academy)\s+(?:of\s+)?[\w\s]+/i);
  if (universityMatch) {
    score += 15;
    details.push('University/institution listed');
  } else {
    details.push('University/institution not clearly listed');
  }
  
  // Check for graduation date
  const dateMatch = eduText.match(/(?:20\d{2}|19\d{2}|graduation|graduated)/i);
  if (dateMatch) {
    score += 15;
    details.push('Graduation date included');
  } else {
    details.push('Graduation date missing');
  }
  
  // Check for GPA (if present and good)
  const gpaMatch = eduText.match(/(?:gpa|g\.p\.a)[:\s]+([0-4]\.\d{1,2})/i);
  if (gpaMatch) {
    const gpa = parseFloat(gpaMatch[1]);
    if (gpa >= 3.5) {
      score += 15;
      details.push(`Good GPA listed (${gpa})`);
    } else {
      details.push(`GPA listed (${gpa})`);
    }
  }
  
  return { score: Math.min(score, 100), details, exists: true, degrees };
}

function analyzeSkillsSection(text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  const details = [];
  
  const skillsMatch = text.match(/(?:skills|technical skills|competencies|languages|tools)[\s\S]{0,800}/i);
  if (!skillsMatch) {
    details.push('No dedicated skills section found');
    return { score: 0, details, exists: false, skillCount: 0 };
  }
  
  details.push('Skills section found');
  score += 20;
  
  const skillsText = skillsMatch[0];
  
  // Count unique skills mentioned
  const allKeywords = [...industryKeywords.tech, ...industryKeywords.management, ...industryKeywords.marketing, ...industryKeywords.general];
  const foundSkills = allKeywords.filter(keyword => 
    skillsText.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (foundSkills.length >= 15) {
    score += 30;
    details.push(`Extensive skills listed (${foundSkills.length}+)`);
  } else if (foundSkills.length >= 10) {
    score += 20;
    details.push(`Good variety of skills (${foundSkills.length})`);
  } else if (foundSkills.length >= 5) {
    score += 15;
    details.push(`Moderate skills (${foundSkills.length})`);
  } else {
    details.push(`Limited skills shown (${foundSkills.length})`);
  }
  
  // Check for skill categories
  const hasCategories = /(?:technical|soft|languages|tools|frameworks|databases)/i.test(skillsText);
  if (hasCategories) {
    score += 15;
    details.push('Skills are well-organized by category');
  } else {
    details.push('Consider organizing skills by category');
  }
  
  // Check for proficiency levels
  const hasProficiency = /(?:expert|advanced|intermediate|beginner|proficient|fluent)/i.test(skillsText);
  if (hasProficiency) {
    score += 15;
    details.push('Proficiency levels specified');
  } else {
    details.push('Add proficiency levels to skills');
  }
  
  // Check for both technical and soft skills
  const hasTechnical = allKeywords.filter(k => skillsText.toLowerCase().includes(k.toLowerCase())).length > 0;
  const hasSoft = ['communication', 'leadership', 'teamwork', 'problem solving', 'analytical'].some(s => 
    skillsText.toLowerCase().includes(s.toLowerCase())
  );
  
  if (hasTechnical && hasSoft) {
    score += 15;
    details.push('Mix of technical and soft skills');
  } else {
    details.push('Add both technical and soft skills');
  }
  
  return { score: Math.min(score, 100), details, exists: true, skillCount: foundSkills.length };
}

function analyzeAchievementsSection(text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  const details = [];
  
  const hasAchievements = /(?:achievements|awards|honors|recognition|certifications|published)/i.test(lowerText);
  
  if (!hasAchievements) {
    details.push('No achievements/awards section');
    return { score: 0, details, exists: false };
  }
  
  details.push('Achievements section found');
  score += 15;
  
  // Count metrics in achievements
  const metrics = (text.match(/\d+%|\$[\d,]+K?M?|\d+\+?\s+(?:years?|months?|projects?|clients?|awards?)/gi) || []).length;
  
  if (metrics >= 5) {
    score += 35;
    details.push(`Strong achievement metrics (${metrics})`);
  } else if (metrics >= 3) {
    score += 25;
    details.push('Good metrics in achievements');
  } else {
    score += 15;
    details.push('Add quantified metrics to achievements');
  }
  
  return { score: Math.min(score, 100), details, exists: true };
}

function analyzeFormatting(text) {
  let score = 0;
  const details = [];
  
  // Check for consistent spacing
  const lines = text.split('\n').filter(l => l.trim());
  const avgLineLength = lines.reduce((sum, l) => sum + l.length, 0) / lines.length;
  
  if (avgLineLength >= 40 && avgLineLength <= 100) {
    score += 15;
    details.push('Good line length and spacing');
  } else {
    details.push('Consider adjusting spacing/line length');
  }
  
  // Check for bullet points
  const bulletCount = (text.match(/[•\-\*]/g) || []).length;
  if (bulletCount > 10) {
    score += 20;
    details.push(`Good use of bullet points (${bulletCount})`);
  } else if (bulletCount > 3) {
    score += 10;
    details.push('Some bullet point formatting');
  } else {
    details.push('Add more bullet points for clarity');
  }
  
  // Check for consistency
  const allCaps = (text.match(/\b[A-Z][A-Z]+\b/g) || []).length;
  const hasConsistentFormatting = allCaps < lines.length * 0.3;
  if (hasConsistentFormatting) {
    score += 15;
    details.push('Consistent formatting throughout');
  } else {
    details.push('Reduce excessive capitalization');
  }
  
  // Check for readability
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 600) {
    score += 20;
    details.push(`Optimal length (${wordCount} words)`);
  } else if (wordCount < 150) {
    details.push(`Resume too short (${wordCount} words)`);
  } else if (wordCount > 800) {
    score += 10;
    details.push(`Resume quite long (${wordCount} words)`);
  }
  
  return { score: Math.min(score, 100), details };
}

// Analyze Job Description Keywords
function analyzeJobDescriptionMatch(resumeText, jobDescriptionText) {
  const lowerResumeText = resumeText.toLowerCase();
  
  const extractSkillsFromJobDescription = (text) => {
    const lowerText = text.toLowerCase();
    const skillsSectionPatterns = [
      /skills?[:\s]*(required|needed|preferred)?[:\s]*/gi,
      /requirements?[:\s]*/gi,
      /qualifications?[:\s]*/gi,
      /technical skills?[:\s]*/gi,
      /key skills?[:\s]*/gi,
      /competencies?[:\s]*/gi,
      /what you'll need[:\s]*/gi,
      /what we look for[:\s]*/gi,
      /experience with[:\s]*/gi
    ];

    let skillsText = '';
    for (const pattern of skillsSectionPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        const sections = text.split(pattern);
        if (sections.length > 1) {
          const sectionContent = sections.slice(1).join(' ').substring(0, 2000);
          skillsText += sectionContent + ' ';
        }
      }
    }

    if (!skillsText.trim()) {
      skillsText = text;
    }

    const skillPatterns = [
      /\b(javascript|python|java|c\+\+|c#|php|ruby|go|golang|rust|swift|kotlin|typescript|scala|perl|r|matlab|dart|lua)\b/gi,
      /\b(html|css|sass|scss|less|react|angular|vue|jquery|bootstrap|tailwind|webpack|babel|npm|yarn)\b/gi,
      /\b(sql|mysql|postgresql|mongodb|redis|cassandra|elasticsearch|oracle|sqlite|dynamodb)\b/gi,
      /\b(aws|azure|gcp|google cloud|heroku|digitalocean|linode|vercel|netlify)\b/gi,
      /\b(docker|kubernetes|jenkins|gitlab|github actions|circleci|travis|terraform|ansible|puppet|chef)\b/gi,
      /\b(git|svn|mercurial|bitbucket|github|gitlab)\b/gi,
      /\b(linux|windows|macos|ubuntu|centos|debian|redhat|fedora)\b/gi,
      /\b(agile|scrum|kanban|tdd|bdd|ci\/cd|devops|microservices|rest api|graphql|oauth|jwt)\b/gi,
      /\b(excel|word|powerpoint|outlook|sharepoint|salesforce|sap|oracle erp|jira|confluence|slack|teams)\b/gi,
      /\b(tableau|power bi|looker|qlik|pandas|numpy|tensorflow|pytorch|scikit-learn|matplotlib|seaborn)\b/gi,
      /\b(figma|sketch|adobe|photoshop|illustrator|indesign|xd|zeplin|invision|maze)\b/gi,
      /\b(jira|trello|asana|monday|basecamp|clickup|notion|microsoft project)\b/gi
    ];

    const extractedSkills = [];
    for (const pattern of skillPatterns) {
      const matches = skillsText.match(pattern);
      if (matches) {
        extractedSkills.push(...matches);
      }
    }

    const delimiters = /[,;•\-\*\n\r]+/;
    const rawTerms = skillsText.split(delimiters).map(term => term.trim()).filter(term => term.length > 0);

    const potentialSkills = rawTerms.filter(term => {
      const lowerTerm = term.toLowerCase();
      return (
        lowerTerm.length > 2 &&
        lowerTerm.length < 30 &&
        !/\b(and|or|the|a|an|in|on|at|to|for|of|with|by|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|must|shall|we|you|they|he|she|it|this|that|these|those|i|me|my|your|his|her|its|our|their|us|them|who|what|where|when|why|how|which|all|any|both|each|few|many|most|some|such|no|nor|not|only|own|same|so|than|too|very|just|but|also|even|though|although|while|if|unless|until|before|after|since|because|experience|required|preferred|strong|excellent|good|knowledge|skills|ability|proven|demonstrated|years|months|degree|bachelor|master|phd|certification|license)\b/.test(lowerTerm) &&
        /[a-zA-Z]/.test(lowerTerm)
      );
    });

    const allSkills = [...extractedSkills, ...potentialSkills]
      .map(skill => skill.toLowerCase().trim())
      .filter(skill => skill.length > 2)
      .filter((skill, index, arr) => arr.indexOf(skill) === index)
      .slice(0, 25);

    return allSkills;
  };

  const extractedSkills = extractSkillsFromJobDescription(jobDescriptionText);
  const jobKeywords = [];
  
  extractedSkills.forEach(skill => {
    const found = lowerResumeText.includes(skill.toLowerCase());
    jobKeywords.push({
      word: skill,
      found: found,
      importance: found ? 'critical' : 'critical'
    });
  });
  
  return jobKeywords;
}

// Generate detailed roadmap to 100% ATS score
// Analyze detailed ATS score - Cake Resume AI style (more generous, realistic scoring)
function analyzeDetailedATSScore(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const words = text.split(/\s+/);
  const lowerText = text.toLowerCase();
  
  // Start with base score of 70 (most resumes deserve decent score if they have basic content)
  let atsScore = 70;
  let scoreDetails = [];
  
  // 1. STRUCTURE & SECTIONS (up to +15 points)
  let structureScore = 0;
  const hasExperience = /(?:work\s+experience|experience|employment|professional\s+history)/i.test(text);
  const hasEducation = /(?:education|degree|university|college)/i.test(text);
  const hasSkills = /(?:skills|technical\s+skills|competencies|tools)/i.test(text);
  const hasContact = /[\w.-]+@[\w.-]+\.\w+|(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasSummary = /(?:professional\s+summary|objective|about\s+me|executive\s+summary)/i.test(text);
  
  if (hasContact) { structureScore += 3; scoreDetails.push('✓ Contact information present'); }
  if (hasSummary) { structureScore += 2; scoreDetails.push('✓ Professional summary included'); }
  if (hasExperience) { structureScore += 4; scoreDetails.push('✓ Work experience section'); }
  if (hasEducation) { structureScore += 3; scoreDetails.push('✓ Education section'); }
  if (hasSkills) { structureScore += 3; scoreDetails.push('✓ Skills section'); }
  
  structureScore = Math.min(structureScore, 15);
  atsScore += structureScore;
  
  // 2. CONTENT QUALITY (up to +12 points)
  let contentScore = 0;
  
  // Check for action verbs
  const actionVerbs = ['achieved', 'delivered', 'implemented', 'led', 'managed', 'developed', 'created', 'improved', 'increased', 'reduced', 'optimized', 'launched', 'designed', 'built', 'analyzed', 'streamlined'];
  const actionVerbCount = actionVerbs.filter(verb => lowerText.includes(verb)).length;
  
  if (actionVerbCount >= 8) { 
    contentScore += 5; 
    scoreDetails.push(`✓ Excellent action verbs (${actionVerbCount})`); 
  } else if (actionVerbCount >= 5) { 
    contentScore += 4; 
    scoreDetails.push(`✓ Good action verbs (${actionVerbCount})`); 
  } else if (actionVerbCount >= 2) {
    contentScore += 2;
    scoreDetails.push(`△ Some action verbs (${actionVerbCount})`);
  }
  
  // Check for metrics/quantified results
  const metrics = text.match(/\d+%|\$[\d,]+K?M?|\d+\+?\s+(?:years?|months?|projects?|clients?|team)/gi) || [];
  if (metrics.length >= 8) { 
    contentScore += 4; 
    scoreDetails.push(`✓ Strong metrics (${metrics.length})`); 
  } else if (metrics.length >= 5) { 
    contentScore += 3; 
    scoreDetails.push(`✓ Good metrics (${metrics.length})`); 
  } else if (metrics.length >= 2) {
    contentScore += 1;
    scoreDetails.push(`△ Some metrics (${metrics.length})`);
  }
  
  // Check for bullet points
  const bulletCount = (text.match(/[•\-\*]/g) || []).length;
  if (bulletCount > 10) { 
    contentScore += 3; 
    scoreDetails.push(`✓ Good formatting (${bulletCount} bullets)`); 
  } else if (bulletCount > 3) {
    contentScore += 1;
    scoreDetails.push(`△ Limited bullets (${bulletCount})`);
  }
  
  contentScore = Math.min(contentScore, 12);
  atsScore += contentScore;
  
  // 3. SKILLS & KEYWORDS (up to +8 points)
  let skillsScore = 0;
  const techKeywords = ['javascript', 'python', 'java', 'react', 'node.js', 'aws', 'docker', 'sql', 'angular', 'vue', 'typescript', 'c#', 'php', 'ruby', 'go'];
  const softSkwords = ['leadership', 'communication', 'teamwork', 'problem solving', 'project management', 'organization', 'analytical', 'strategic'];
  
  const foundTech = techKeywords.filter(k => lowerText.includes(k)).length;
  const foundSoft = softSkwords.filter(k => lowerText.includes(k.toLowerCase())).length;
  const totalRelevantSkills = foundTech + foundSoft;
  
  if (totalRelevantSkills >= 10) { 
    skillsScore += 8; 
    scoreDetails.push(`✓ Extensive relevant skills (${totalRelevantSkills})`); 
  } else if (totalRelevantSkills >= 7) { 
    skillsScore += 6; 
    scoreDetails.push(`✓ Good skill coverage (${totalRelevantSkills})`); 
  } else if (totalRelevantSkills >= 4) { 
    skillsScore += 4; 
    scoreDetails.push(`△ Moderate skills (${totalRelevantSkills})`);
  } else if (totalRelevantSkills >= 2) {
    skillsScore += 2;
    scoreDetails.push(`△ Limited skills (${totalRelevantSkills})`);
  }
  
  skillsScore = Math.min(skillsScore, 8);
  atsScore += skillsScore;
  
  // 4. FORMATTING & SPELLING (up to -5 penalty points)
  let formattingPenalty = 0;
  
  // Check for major spelling issues
  const commonMisspellings = ['recieve', 'occured', 'seperate', 'definately', 'thier', 'becuase', 'comming'];
  const misspellings = commonMisspellings.filter(word => new RegExp(`\\b${word}\\b`, 'gi').test(text));
  
  if (misspellings.length === 0) {
    scoreDetails.push('✓ Clean spelling');
  } else if (misspellings.length <= 2) {
    formattingPenalty += 1;
    scoreDetails.push(`△ Minor spelling issues`);
  } else {
    formattingPenalty += 2;
    scoreDetails.push(`✗ Multiple spelling errors`);
  }
  
  // Check for excessive caps
  const allCapsWords = (text.match(/\b[A-Z]{3,}\b/g) || []).length;
  const allCapsRatio = (allCapsWords / words.length) * 100;
  if (allCapsRatio > 20) {
    formattingPenalty += 1;
    scoreDetails.push(`△ Too many capitals`);
  } else {
    scoreDetails.push('✓ Proper capitalization');
  }
  
  atsScore -= formattingPenalty;
  
  // 5. RESUME LENGTH 
  const wordCount = words.length;
  if (wordCount < 200) {
    atsScore -= 3;
    scoreDetails.push(`✗ Resume too short (${wordCount} words)`);
  } else if (wordCount > 1000) {
    atsScore -= 2;
    scoreDetails.push(`△ Resume quite long (${wordCount} words)`);
  } else {
    scoreDetails.push(`✓ Good length (${wordCount} words)`);
  }
  
  // Final score normalization (ensure between 0-100)
  atsScore = Math.max(0, Math.min(100, Math.round(atsScore)));
  
  return {
    detailedATSScore: atsScore,
    scoreRating: atsScore >= 85 ? 'Excellent' : atsScore >= 75 ? 'Very Good' : atsScore >= 65 ? 'Good' : atsScore >= 55 ? 'Fair' : 'Needs Work',
    componentBreakdown: {
      structure: {
        name: 'Structure & Sections',
        points: structureScore,
        description: 'Presence of key resume sections (contact, experience, education, skills)'
      },
      content: {
        name: 'Content Quality',
        points: contentScore,
        description: 'Action verbs, metrics, and formatting'
      },
      skills: {
        name: 'Skills & Keywords',
        points: skillsScore,
        description: 'Relevant technical and soft skills'
      },
      formatting: {
        name: 'Formatting & Spelling',
        penalty: formattingPenalty,
        description: 'Spelling, grammar, and capitalization'
      }
    },
    details: scoreDetails,
    baselineScore: 70,
    baselineReason: 'Base score given for having resume structure',
    recommendations: scoreDetails.filter(d => d.startsWith('✗') || d.startsWith('△')).slice(0, 5)
  };
}

function generateSuggestionsSection(sectionImprovements, currentScore) {
  if (!sectionImprovements || sectionImprovements.length === 0) {
    return {
      totalSuggestions: 0,
      highPriorityCount: 0,
      mediumPriorityCount: 0,
      lowPriorityCount: 0,
      suggestionsGrouped: {
        high: [],
        medium: [],
        low: []
      },
      estimatedScoreImprovement: 0,
      projectedScore: currentScore
    };
  }

  // Group improvements by priority
  const groupedByPriority = {
    high: sectionImprovements.filter(s => s.priority === 'high'),
    medium: sectionImprovements.filter(s => s.priority === 'medium'),
    low: sectionImprovements.filter(s => s.priority === 'low')
  };

  // Calculate total potential score improvement
  const sectionWeights = {
    'Work Experience': 0.3,
    'Skills': 0.2,
    'Education': 0.15,
    'Professional Summary': 0.1,
    'Achievements/Awards': 0.1,
    'Formatting & Length': 0.1,
    'Contact Information': 0.05,
    'Job Match': 0.1
  };

  let totalPotentialImprovement = 0;

  const formatSuggestionsGroup = (improvements) => {
    return improvements.map((improvement, index) => {
      const weight = sectionWeights[improvement.section] || 0.08;
      const percentageIncrease = improvement.scoreImpactPercentage || 5;
      const scoreIncrement = (percentageIncrease * weight * 100) / 100;
      totalPotentialImprovement += scoreIncrement;

      return {
        order: index + 1,
        title: improvement.title,
        section: improvement.section,
        description: improvement.description,
        impact: improvement.impact || 'Improves ATS compatibility',
        percentageIncrease: `+${parseFloat(scoreIncrement.toFixed(1))}%`,
        whatToAdd: improvement.whatToAdd || [improvement.description],
        estimatedTimeMinutes: improvement.priority === 'high' ? 15 : improvement.priority === 'medium' ? 10 : 5,
        difficultyLevel: improvement.priority === 'high' ? 'easy' : improvement.priority === 'medium' ? 'moderate' : 'quick'
      };
    });
  };

  return {
    currentScore: currentScore,
    totalSuggestions: sectionImprovements.length,
    highPriorityCount: groupedByPriority.high.length,
    mediumPriorityCount: groupedByPriority.medium.length,
    lowPriorityCount: groupedByPriority.low.length,
    suggestionsGrouped: {
      high: formatSuggestionsGroup(groupedByPriority.high),
      medium: formatSuggestionsGroup(groupedByPriority.medium),
      low: formatSuggestionsGroup(groupedByPriority.low)
    },
    estimatedScoreImprovement: parseFloat(totalPotentialImprovement.toFixed(1)),
    projectedScore: Math.min(100, currentScore + totalPotentialImprovement),
    summary: `By implementing all ${sectionImprovements.length} suggestions, you could improve your score from ${currentScore}% to ${Math.min(100, currentScore + totalPotentialImprovement)}% (+${parseFloat(totalPotentialImprovement.toFixed(1))}%)`
  };
}

function generateRoadmapTo100Percent(sectionScoresDetailed, sectionImprovements, currentScore) {
  const sectionWeights = {
    'Work Experience': 0.3,
    'Skills': 0.2,
    'Education': 0.15,
    'Professional Summary': 0.1,
    'Achievements/Awards': 0.1,
    'Formatting & Length': 0.1,
    'Contact Information': 0.05
  };
  
  // Calculate score impact for each improvement
  const improvementsWithDetails = sectionImprovements.map(improvement => {
    const sectionName = improvement.section;
    const weight = sectionWeights[sectionName] || 0.08;
    const potentialGain = improvement.scoreImpactPercentage || 5;
    const scoreIncrement = (potentialGain * weight * 100) / 100;
    
    return {
      step: 0,
      title: improvement.title,
      section: improvement.section,
      priority: improvement.priority,
      currentImpactScore: currentScore,
      scoreIncrementPercentage: parseFloat(scoreIncrement.toFixed(2)),
      projectedScoreAfter: 0,
      description: improvement.description,
      whatToAdd: improvement.whatToAdd || [improvement.description]
    };
  });
  
  // Sort by priority and impact
  improvementsWithDetails.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.scoreIncrementPercentage - a.scoreIncrementPercentage;
  });
  
  // Calculate projected scores
  let cumulativeScore = currentScore;
  const roadmap = improvementsWithDetails.map((improvement, index) => {
    cumulativeScore = Math.min(100, cumulativeScore + improvement.scoreIncrementPercentage);
    return {
      step: index + 1,
      title: improvement.title,
      section: improvement.section,
      priority: improvement.priority,
      description: improvement.description,
      currentScore: parseFloat((cumulativeScore - improvement.scoreIncrementPercentage).toFixed(2)),
      scoreIncrementPercentage: improvement.scoreIncrementPercentage,
      projectedScoreAfter: parseFloat(cumulativeScore.toFixed(2)),
      whatToAdd: improvement.whatToAdd,
      estimatedTimeInMinutes: improvement.priority === 'high' ? 15 : improvement.priority === 'medium' ? 10 : 5
    };
  });
  
  return {
    currentScore: currentScore,
    targetScore: 100,
    scoreGapToClose: parseFloat((100 - currentScore).toFixed(2)),
    totalImprovementSteps: roadmap.length,
    roadmapSteps: roadmap.slice(0, 15),
    estimatedTimeToComplete: Math.sum ? roadmap.reduce((sum, step) => sum + step.estimatedTimeInMinutes, 0) : roadmap.length * 12,
    summary: `Follow these ${roadmap.length} improvements in order to reach 100% ATS score. High priority items should be completed first.`
  };
}

function analyzeResumeContent(text, jobDescriptionText) {
  const lowerText = text.toLowerCase();
  let totalScore = 0;
  let maxScore = 0;
  
  // Extract and analyze content
  const contentAnalysis = extractResumeContent(text);
  const contentGaps = analyzeContentGaps(text, contentAnalysis);
  
  // Deep section analysis
  const sectionAnalysis = {
    contact: analyzeContactSection(text),
    summary: analyzeSummarySection(text),
    experience: analyzeExperienceSection(text),
    education: analyzeEducationSection(text),
    skills: analyzeSkillsSection(text),
    achievements: analyzeAchievementsSection(text),
    formatting: analyzeFormatting(text)
  };
  
  // Calculate section-based scores
  const sectionScoresDetailed = [
    {
      section: 'Contact Information',
      score: sectionAnalysis.contact.score,
      feedback: sectionAnalysis.contact.details,
      weight: 0.05,
      criticalSection: true
    },
    {
      section: 'Professional Summary',
      score: sectionAnalysis.summary.score,
      feedback: sectionAnalysis.summary.details,
      weight: 0.1,
      present: sectionAnalysis.summary.exists
    },
    {
      section: 'Work Experience',
      score: sectionAnalysis.experience.score,
      feedback: sectionAnalysis.experience.details,
      weight: 0.3,
      jobCount: sectionAnalysis.experience.jobCount,
      actionVerbCount: sectionAnalysis.experience.actionVerbCount,
      present: sectionAnalysis.experience.exists
    },
    {
      section: 'Education',
      score: sectionAnalysis.education.score,
      feedback: sectionAnalysis.education.details,
      weight: 0.15,
      degrees: sectionAnalysis.education.degrees,
      present: sectionAnalysis.education.exists
    },
    {
      section: 'Skills',
      score: sectionAnalysis.skills.score,
      feedback: sectionAnalysis.skills.details,
      weight: 0.2,
      skillCount: sectionAnalysis.skills.skillCount,
      present: sectionAnalysis.skills.exists
    },
    {
      section: 'Achievements/Awards',
      score: sectionAnalysis.achievements.score,
      feedback: sectionAnalysis.achievements.details,
      weight: 0.1,
      present: sectionAnalysis.achievements.exists
    },
    {
      section: 'Formatting & Length',
      score: sectionAnalysis.formatting.score,
      feedback: sectionAnalysis.formatting.details,
      weight: 0.1
    }
  ];
  
  // Calculate weighted score
  let weightedTotal = 0;
  let weightCount = 0;
  
  for (const section of sectionScoresDetailed) {
    weightedTotal += section.score * section.weight;
    weightCount += section.weight;
  }
  
  const finalScore = Math.round(weightedTotal / weightCount);
  
  // Helper function to generate specific additions for improvements
  function generateSpecificAdditions(title) {
    const additions = {
      'Add Professional Email': ['Add professional email: firstname.lastname@domain.com', 'Ensure email is professionally formatted', 'Monitor email regularly for recruiter messages'],
      'Add Phone Number': ['Add phone in format: (XXX) XXX-XXXX', 'Use a number you check regularly', 'Ensure voicemail greeting is professional'],
      'Add LinkedIn Profile': ['Add LinkedIn URL: linkedin.com/in/yourname', 'Complete your LinkedIn profile', 'Use LinkedIn short URL for cleaner formatting'],
      'Add Professional Summary': ['Add 2-3 sentence summary highlighting years of experience, key skills, and career goals', 'Position between contact info and experience', 'Include 5-7 industry keywords relevant to your target role'],
      'Enhance Your Summary': ['Expand summary to 2-3 sentences with specific metrics and achievements', 'Add quantifiable results (e.g., "delivered 10 projects")', 'Include industry-specific keywords matching job postings'],
      'Create Work Experience Section': ['Create section: "PROFESSIONAL EXPERIENCE" or "WORK EXPERIENCE"', 'For each role: Job Title | Company | Location | Dates', 'Add 3-5 bullet points per position with quantified achievements'],
      'Use Stronger Action Verbs': ['Replace weak words with: Achieved, Led, Implemented, Managed, Delivered, Optimized, Transformed', 'Start every bullet with an action verb', 'Avoid: "Responsible for", "Helped with", "Involved in"'],
      'Add Quantified Results': ['Add metrics to each achievement: percentages, dollars, numbers', 'Example: "Increased sales 35% ($2M revenue)" instead of "Improved sales"', 'Include: effiency gains, team size, customer metrics, projects delivered'],
      'Create Dedicated Skills Section': ['Create section: "SKILLS" or "TECHNICAL SKILLS"', 'Organize into categories: Languages, Frameworks, Tools, Soft Skills', 'List 15-20 skills relevant to target roles'],
      'Expand Skills List': ['Identify 5-10 missing skills from past experience or job descriptions', 'Add technical tools you\'ve used professionally', 'Include certifications and key soft skills'],
      'Add Education Section': ['Create section: "EDUCATION"', 'Format: Degree Abbreviation, Major - University, Year', 'Example: "B.S. Computer Science - Stanford University, 2020"'],
      'Complete Education Details': ['Add graduation date if missing', 'Include degree type (B.S., M.S., Ph.D.) if not specified', 'Add GPA if 3.5 or higher'],
      'Add Achievements/Awards': ['Create section: "AWARDS" or "ACHIEVEMENTS"', 'List: Employee of Month, Certifications, Publications, Internal Awards', 'Format: Award Name - Organization, Year'],
      'Improve Resume Formatting': ['Use consistent font (Arial, Calibri, Helvetica)', 'Use bullet points (•) consistently', 'Keep margins 0.5-1 inch', 'Use bold for headers and company names']
    };
    return additions[title] || ['Implement this improvement to increase ATS compatibility'];
  }

  // Helper function to calculate section score impact
  function calculateScoreImpact(improvement, section) {
    const impactMap = {
      'Add Professional Email': 5,
      'Add Phone Number': 5,
      'Add LinkedIn Profile': 3,
      'Add Professional Summary': 8,
      'Enhance Your Summary': 6,
      'Create Work Experience Section': 12,
      'Use Stronger Action Verbs': 8,
      'Add Quantified Results': 10,
      'Create Dedicated Skills Section': 12,
      'Expand Skills List': 8,
      'Add Education Section': 10,
      'Complete Education Details': 6,
      'Add Achievements/Awards': 8,
      'Improve Resume Formatting': 5
    };
    return impactMap[improvement] || 3;
  }

  // Generate section-based improvements
  const sectionImprovements = [];
  
  // Contact section improvements
  if (!sectionAnalysis.contact.found.email) {
    sectionImprovements.push({
      section: 'Contact Information',
      title: 'Add Professional Email',
      description: 'Include a professional email address at the top of your resume. Use format: firstname.lastname@domain.com',
      priority: 'high',
      impact: 'Critical - recruiters need to contact you',
      scoreImpactPercentage: calculateScoreImpact('Add Professional Email'),
      whatToAdd: generateSpecificAdditions('Add Professional Email')
    });
  }
  
  if (!sectionAnalysis.contact.found.phone) {
    sectionImprovements.push({
      section: 'Contact Information',
      title: 'Add Phone Number',
      description: 'Include your phone number. Format preferred: (XXX) XXX-XXXX',
      priority: 'high',
      impact: 'Critical - alternative contact method',
      scoreImpactPercentage: calculateScoreImpact('Add Phone Number'),
      whatToAdd: generateSpecificAdditions('Add Phone Number')
    });
  }
  
  if (!sectionAnalysis.contact.found.linkedin) {
    sectionImprovements.push({
      section: 'Contact Information',
      title: 'Add LinkedIn Profile',
      description: 'Include your LinkedIn URL. Format: linkedin.com/in/yourprofile',
      priority: 'medium',
      impact: 'Enhances credibility and networking',
      scoreImpactPercentage: calculateScoreImpact('Add LinkedIn Profile'),
      whatToAdd: generateSpecificAdditions('Add LinkedIn Profile')
    });
  }
  
  // Summary improvements
  if (!sectionAnalysis.summary.exists) {
    sectionImprovements.push({
      section: 'Professional Summary',
      title: 'Add Professional Summary',
      description: 'Write a 2-3 sentence professional summary highlighting your key skills, experience level, and career goals. Position it right after contact info.',
      priority: 'high',
      impact: 'Creates immediate first impression',
      scoreImpactPercentage: calculateScoreImpact('Add Professional Summary'),
      whatToAdd: generateSpecificAdditions('Add Professional Summary')
    });
  } else if (sectionAnalysis.summary.score < 50) {
    sectionImprovements.push({
      section: 'Professional Summary',
      title: 'Enhance Your Summary',
      description: 'Your summary needs more detail. Include: years of experience, key achievements, specific skills, and measurable results. Add industry keywords.',
      priority: 'high',
      impact: 'Better screening by ATS and recruiters',
      scoreImpactPercentage: calculateScoreImpact('Enhance Your Summary'),
      whatToAdd: generateSpecificAdditions('Enhance Your Summary')
    });
  }
  
  // Experience improvements
  if (!sectionAnalysis.experience.exists) {
    sectionImprovements.push({
      section: 'Work Experience',
      title: 'Create Work Experience Section',
      description: 'List your professional experience with job titles, companies, dates, and bullet-point accomplishments. Most recent first.',
      priority: 'high',
      impact: 'Most important section for ATS',
      scoreImpactPercentage: calculateScoreImpact('Create Work Experience Section'),
      whatToAdd: generateSpecificAdditions('Create Work Experience Section')
    });
  } else if (sectionAnalysis.experience.actionVerbCount < 5) {
    sectionImprovements.push({
      section: 'Work Experience',
      title: 'Use Stronger Action Verbs',
      description: 'Start bullet points with power verbs like: Managed, Developed, Implemented, Achieved, Led, Increased, Optimized, Designed.',
      priority: 'high',
      impact: 'Increases ATS matching and readability',
      scoreImpactPercentage: calculateScoreImpact('Use Stronger Action Verbs'),
      whatToAdd: generateSpecificAdditions('Use Stronger Action Verbs')
    });
  }
  
  if (sectionAnalysis.experience.exists && sectionAnalysis.experience.score < 70) {
    sectionImprovements.push({
      section: 'Work Experience',
      title: 'Add Quantified Results',
      description: 'Replace vague statements with metrics. Example: Instead of "improved sales", write "increased sales by 25% ($2M revenue)".',
      priority: 'high',
      impact: 'Demonstrates measurable impact',
      scoreImpactPercentage: calculateScoreImpact('Add Quantified Results'),
      whatToAdd: generateSpecificAdditions('Add Quantified Results')
    });
  }
  
  // Education improvements
  if (!sectionAnalysis.education.exists) {
    sectionImprovements.push({
      section: 'Education',
      title: 'Add Education Section',
      description: 'Include degree type, field of study, institution name, graduation date. Format: Degree Name, Major/Field - University Name (Year)',
      priority: 'high',
      impact: 'Required by most ATS systems',
      scoreImpactPercentage: calculateScoreImpact('Add Education Section'),
      whatToAdd: generateSpecificAdditions('Add Education Section')
    });
  } else if (sectionAnalysis.education.score < 50) {
    sectionImprovements.push({
      section: 'Education',
      title: 'Complete Education Details',
      description: 'Add graduation date and degree type (B.S., M.S., etc). If GPA is 3.5+, include it.',
      priority: 'medium',
      impact: 'Provides required educational background',
      scoreImpactPercentage: calculateScoreImpact('Complete Education Details'),
      whatToAdd: generateSpecificAdditions('Complete Education Details')
    });
  }
  
  // Skills improvements
  if (!sectionAnalysis.skills.exists) {
    sectionImprovements.push({
      section: 'Skills',
      title: 'Create Dedicated Skills Section',
      description: 'List 15-20 relevant skills. Organize by category: Technical Skills, Programming Languages, Tools, Soft Skills.',
      priority: 'high',
      impact: 'Critical for keyword matching',
      scoreImpactPercentage: calculateScoreImpact('Create Dedicated Skills Section'),
      whatToAdd: generateSpecificAdditions('Create Dedicated Skills Section')
    });
  } else if (sectionAnalysis.skills.skillCount < 8) {
    sectionImprovements.push({
      section: 'Skills',
      title: 'Expand Skills List',
      description: `Add more relevant skills. You have ${sectionAnalysis.skills.skillCount} keywords. Aim for 15-20 industry-relevant skills.`,
      priority: 'medium',
      impact: 'Increases keyword matching rate',
      scoreImpactPercentage: calculateScoreImpact('Expand Skills List'),
      whatToAdd: generateSpecificAdditions('Expand Skills List')
    });
  }
  
  // Formatting improvements
  if (sectionAnalysis.formatting.score < 60) {
    sectionImprovements.push({
      section: 'Formatting',
      title: 'Improve Resume Formatting',
      description: 'Use consistent fonts, bullet points, and white space. Keep to 1 page for 0-5 years, 2 pages for 5+ years.',
      priority: 'medium',
      impact: 'Better ATS parsing and readability',
      scoreImpactPercentage: calculateScoreImpact('Improve Resume Formatting'),
      whatToAdd: generateSpecificAdditions('Improve Resume Formatting')
    });
  }
  
  // Keyword analysis from current content
  const keywordAnalysis = [];
  const priorityKeywords = industryKeywords.tech.concat(industryKeywords.management);
  
  for (const keyword of priorityKeywords.slice(0, 30)) {
    const found = lowerText.includes(keyword.toLowerCase());
    keywordAnalysis.push({
      word: keyword,
      found: found,
      importance: found ? 'critical' : 'important'
    });
  }
  
  // Job description matching (if provided)
  let jobKeywordAnalysis = [];
  if (jobDescriptionText) {
    jobKeywordAnalysis = analyzeJobDescriptionMatch(text, jobDescriptionText);
    
    // Add JD-specific improvements
    const missingKeywords = jobKeywordAnalysis.filter(kw => !kw.found && kw.importance === 'critical').slice(0, 5);
    if (missingKeywords.length > 0) {
      sectionImprovements.push({
        section: 'Job Match',
        title: `Add Missing Job Requirements (${missingKeywords.length})`,
        description: `This job posting emphasizes: ${missingKeywords.map(k => k.word).join(', ')}. Add these keywords where relevant in your experience.`,
        priority: 'high',
        impact: 'Critical for passing initial ATS screening'
      });
    }
  }
  
  // Generate overall assessment
  let overallAssessment = '';
  if (finalScore >= 90) {
    overallAssessment = `Excellent Resume (${finalScore}%) - Your resume is well-optimized for ATS systems and clearly communicates your qualifications. Strong across all sections with good keyword density and quantified achievements.`;
  } else if (finalScore >= 80) {
    overallAssessment = `Very Good Resume (${finalScore}%) - Your resume is competitive and ATS-friendly. Focus on the highlighted improvements to move to the excellent range.`;
  } else if (finalScore >= 70) {
    overallAssessment = `Good Resume (${finalScore}%) - Your resume covers essential sections but needs improvements in keyword optimization and achievement quantification.`;
  } else if (finalScore >= 60) {
    overallAssessment = `Acceptable Resume (${finalScore}%) - Your resume has the basic structure but is missing key elements. Prioritize adding critical keywords and quantified results.`;
  } else {
    overallAssessment = `Needs Work (${finalScore}%) - Your resume is missing critical sections and content. Start by adding contact info, professional summary, and action verbs to experience.`;
  }
  
  // Create comprehensive summary
  const summary = generateResumeSummary(text, contentAnalysis);
  
  // Generate roadmap to 100% score
  const roadmapToHundred = generateRoadmapTo100Percent(sectionScoresDetailed, sectionImprovements, finalScore);
  
  // Generate comprehensive suggestions section with percentage increases
  const suggestionsSection = generateSuggestionsSection(sectionImprovements, finalScore);
  
  // Generate comprehensive ATS analysis
  const atsAnalysis = {
    overallATSScore: finalScore,
    atsCompatibility: finalScore >= 80 ? 'Excellent' : finalScore >= 70 ? 'Good' : finalScore >= 60 ? 'Fair' : 'Poor',
    atsReadability: {
      score: sectionAnalysis.formatting.score,
      status: sectionAnalysis.formatting.score >= 70 ? 'Good' : 'Needs Improvement',
      details: sectionAnalysis.formatting.details,
      tips: [
        'Use standard fonts (Arial, Calibri, Times New Roman)',
        'Maintain consistent formatting throughout',
        'Use bullet points for easy parsing',
        'Avoid graphics, tables, and complex layouts',
        'Keep resume to 1-2 pages'
      ]
    },
    keywordMatching: {
      score: (keywordAnalysis.filter(k => k.found).length / keywordAnalysis.length * 100).toFixed(0),
      foundKeywords: keywordAnalysis.filter(k => k.found).length,
      totalKeywordsCovered: keywordAnalysis.length,
      matchPercentage: `${(keywordAnalysis.filter(k => k.found).length / keywordAnalysis.length * 100).toFixed(0)}%`,
      analysis: keywordAnalysis.map(kw => ({
        keyword: kw.word,
        found: kw.found,
        importance: kw.importance,
        recommendation: !kw.found ? `Add "${kw.word}" to your resume if relevant to your experience` : 'Present in resume'
      }))
    },
    sectionCompletion: {
      totalSections: sectionScoresDetailed.length,
      completedSections: sectionScoresDetailed.filter(s => s.present !== false && s.score > 0).length,
      incompleteSections: sectionScoresDetailed.filter(s => s.present === false || s.score === 0).map(s => s.section),
      completionPercentage: `${Math.round((sectionScoresDetailed.filter(s => s.present !== false && s.score > 0).length / sectionScoresDetailed.length) * 100)}%`,
      sectionBreakdown: sectionScoresDetailed.map(s => ({
        section: s.section,
        score: s.score,
        status: s.score >= 70 ? 'Excellent' : s.score >= 50 ? 'Good' : s.score > 0 ? 'Needs Work' : 'Missing',
        weight: `${(s.weight * 100).toFixed(0)}%`,
        feedback: s.feedback
      }))
    },
    contactInformation: {
      score: sectionAnalysis.contact.score,
      status: sectionAnalysis.contact.score >= 70 ? 'Complete' : 'Incomplete',
      hasEmail: sectionAnalysis.contact.found.email,
      hasPhone: sectionAnalysis.contact.found.phone,
      hasLinkedIn: sectionAnalysis.contact.found.linkedin,
      missing: [
        !sectionAnalysis.contact.found.email ? 'Professional email' : null,
        !sectionAnalysis.contact.found.phone ? 'Phone number' : null,
        !sectionAnalysis.contact.found.linkedin ? 'LinkedIn profile' : null
      ].filter(Boolean),
      recommendations: [
        sectionAnalysis.contact.found.email ? '✓ Email found' : '✗ Add professional email address',
        sectionAnalysis.contact.found.phone ? '✓ Phone found' : '✗ Add phone number',
        sectionAnalysis.contact.found.linkedin ? '✓ LinkedIn found' : '✗ Add LinkedIn profile URL'
      ]
    },
    contentQuality: {
      actionVerbCount: actionVerbs.filter(verb => text.toLowerCase().includes(verb.toLowerCase())).length,
      totalMetrics: (text.match(/\d+%|\$[\d,]+K?M?|\d+\+?\s+(?:years?|months?|projects?|clients?|team)/gi) || []).length,
      hasQuantifiedResults: (text.match(/\d+%|\$[\d,]+/) || []).length > 0,
      bulletPointUsage: (text.match(/[•\-\*]/g) || []).length,
      analysis: {
        actionVerbs: `${actionVerbs.filter(verb => text.toLowerCase().includes(verb.toLowerCase())).length} strong action verbs used - ${actionVerbs.filter(verb => text.toLowerCase().includes(verb.toLowerCase())).length >= 5 ? 'Good' : 'Add more'}`,
        metrics: `${(text.match(/\d+%|\$[\d,]+K?M?|\d+\+?\s+(?:years?|months?|projects?|clients?|team)/gi) || []).length} quantified metrics - ${(text.match(/\d+%|\$[\d,]+K?M?|\d+\+?\s+(?:years?|months?|projects?|clients?|team)/gi) || []).length >= 5 ? 'Excellent' : 'Needs improvement'}`,
        formatting: `${(text.match(/[•\-\*]/g) || []).length} bullet points - ${(text.match(/[•\-\*]/g) || []).length > 10 ? 'Well formatted' : 'Could improve'}`
      },
      improvements: [
        actionVerbs.filter(verb => text.toLowerCase().includes(verb.toLowerCase())).length < 5 ? 'Use more action verbs' : null,
        (text.match(/\d+%|\$[\d,]+/) || []).length === 0 ? 'Add quantified metrics' : null,
        (text.match(/[•\-\*]/g) || []).length < 5 ? 'Use more bullet points' : null
      ].filter(Boolean)
    },
    resumeLength: {
      wordCount: text.split(/\s+/).length,
      lineCount: text.split('\n').length,
      status: contentAnalysis.wordCount >= 300 && contentAnalysis.wordCount <= 800 ? 'Optimal' : contentAnalysis.wordCount < 300 ? 'Too Short' : 'Too Long',
      recommendation: contentAnalysis.wordCount < 300 ? 'Add more details about your experience' : contentAnalysis.wordCount > 800 ? 'Consider condensing to fit on 2 pages' : 'Good length for ATS'
    },
    jobDescriptionMatch: jobKeywordAnalysis.length > 0 ? {
      matchedKeywords: jobKeywordAnalysis.filter(k => k.found).length,
      totalRequiredKeywords: jobKeywordAnalysis.length,
      matchPercentage: `${Math.round((jobKeywordAnalysis.filter(k => k.found).length / jobKeywordAnalysis.length) * 100)}%`,
      matchScore: Math.round((jobKeywordAnalysis.filter(k => k.found).length / jobKeywordAnalysis.length) * 100),
      missingKeywords: jobKeywordAnalysis.filter(k => !k.found).slice(0, 10).map(k => k.word),
      presentKeywords: jobKeywordAnalysis.filter(k => k.found).slice(0, 10).map(k => k.word),
      analysis: `Your resume matches ${Math.round((jobKeywordAnalysis.filter(k => k.found).length / jobKeywordAnalysis.length) * 100)}% of the job requirements.`
    } : null,
    atsParsingIssues: {
      issues: [],
      warnings: [],
      recommendations: [
        'Avoid using headers and footers',
        'Do not use graphics or images',
        'Avoid using tables - use proper text formatting instead',
        'Use standard section headers (EXPERIENCE, EDUCATION, SKILLS)',
        'Keep formatting simple and consistent',
        'Use standard fonts only'
      ],
      checklist: {
        'Simple text format (no graphics)': !contentAnalysis.wordCount ? 'Notice' : 'Verified',
        'Standard section headers': /(?:experience|education|skills|summary|objective)/i.test(text) ? 'Verified' : 'Warning',
        'Contact info present and clear': sectionAnalysis.contact.found.email && sectionAnalysis.contact.found.phone ? 'Verified' : 'Warning',
        'Consistent formatting': sectionAnalysis.formatting.score >= 70 ? 'Verified' : 'Needs attention',
        'Proper use of bullet points': (text.match(/[•\-\*]/g) || []).length > 5 ? 'Verified' : 'Could improve'
      }
    }
  };
  
  // Generate detailed ATS score components
  const detailedATSAnalysis = analyzeDetailedATSScore(text);
  
  return {
    score: finalScore,
    detailedATSScore: detailedATSAnalysis.detailedATSScore,
    detailedATSAnalysis: detailedATSAnalysis,
    scoreBreakdown: sectionScoresDetailed,
    overallAssessment,
    summary,
    contentPresent: contentGaps.present,
    contentAbsent: contentGaps.absent,
    sectionScores: sectionScoresDetailed,
    sectionImprovements: sectionImprovements,
    atsAnalysis: atsAnalysis,
    suggestionsSection: suggestionsSection,
    strengths: [
      {
        title: 'Strong Sections',
        description: `Top performing sections: ${sectionScoresDetailed
          .filter(s => s.score >= 70)
          .map(s => s.section)
          .join(', ') || 'Review needed'}`
      },
      ...sectionScoresDetailed
        .filter(s => s.score >= 75)
        .map(s => ({
          title: `${s.section}: ${s.score}%`,
          description: s.feedback.slice(0, 2).join('. ')
        }))
    ],
    improvements: sectionImprovements.slice(0, 10),
    roadmapTo100: roadmapToHundred,
    keywords: keywordAnalysis,
    jobDescriptionKeywords: jobKeywordAnalysis.length > 0 ? jobKeywordAnalysis : undefined,
    formatAnalysis: [
      {
        aspect: 'Contact Information',
        status: sectionAnalysis.contact.found.email && sectionAnalysis.contact.found.phone ? 'good' : 'warning',
        message: sectionAnalysis.contact.found.email && sectionAnalysis.contact.found.phone 
          ? 'All required contact details present' 
          : 'Missing email or phone'
      },
      {
        aspect: 'Work Experience',
        status: sectionAnalysis.experience.exists ? 'good' : 'error',
        message: sectionAnalysis.experience.exists ? `${sectionAnalysis.experience.jobCount} positions found` : 'No experience listed'
      },
      {
        aspect: 'Education',
        status: sectionAnalysis.education.exists ? 'good' : 'warning',
        message: sectionAnalysis.education.exists ? `${sectionAnalysis.education.degrees.length} degree(s) found` : 'Education section recommended'
      },
      {
        aspect: 'Skills Listed',
        status: sectionAnalysis.skills.skillCount >= 8 ? 'good' : sectionAnalysis.skills.skillCount > 0 ? 'warning' : 'error',
        message: sectionAnalysis.skills.skillCount > 0 ? `${sectionAnalysis.skills.skillCount} skills found` : 'Add a dedicated skills section'
      },
      {
        aspect: 'Length',
        status: contentAnalysis.wordCount >= 300 && contentAnalysis.wordCount <= 800 ? 'good' : contentAnalysis.wordCount < 300 ? 'warning' : 'warning',
        message: `${contentAnalysis.wordCount} words - ${contentAnalysis.wordCount <= 600 ? 'Optimal (1 page)' : contentAnalysis.wordCount <= 800 ? 'Slightly long (2 pages)' : 'Too long - consider condensing'}`
      }
    ]
  };
}

const analyzeHandler = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resumeText, jobDescriptionText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: 'resumeText is required' });
    }

    const result = analyzeResumeContent(resumeText, jobDescriptionText);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze resume',
      message: error.message 
    });
  }
};

export default analyzeHandler;
