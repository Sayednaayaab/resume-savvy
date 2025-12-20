import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Download, 
  Eye, 
  Palette,
  Check,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  FolderGit2,
  Heart,
  Trash2,
  Plus,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  name: string;
  description: string;
  technologies: string;
  repoLink: string;
  liveLink: string;
}

interface ResumeData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    summary: string;
  };
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  skills: string[];
  projects: Project[];
  hobbies: string[];
}

const templates = [
  { id: 'professional', name: 'Professional', color: '#1E3A8A', popular: true },
  { id: 'modern', name: 'Modern', color: '#0891B2', popular: false },
  { id: 'creative', name: 'Creative', color: '#7C3AED', popular: false },
  { id: 'executive', name: 'Executive', color: '#1F2937', popular: true },
  { id: 'minimal', name: 'Minimal', color: '#6B7280', popular: false },
];

const BuildResume: React.FC = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [newSkill, setNewSkill] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [resumeData, setResumeData] = useState<ResumeData>({
    personal: {
      fullName: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
      summary: 'Experienced software engineer with 5+ years of expertise in building scalable web applications. Passionate about clean code, performance optimization, and creating intuitive user experiences.',
    },
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        duration: '2020 - Present',
        description: 'Led development of microservices architecture, improving system performance by 40%. Mentored junior developers and conducted code reviews.',
      },
    ],
    education: [
      {
        degree: 'B.S. Computer Science',
        school: 'Stanford University',
        year: '2018',
      },
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
    projects: [
      {
        name: 'E-Commerce Platform',
        description: 'Full-stack e-commerce solution with payment integration',
        technologies: 'React, Node.js, MongoDB, Stripe',
        repoLink: 'github.com/johndoe/ecommerce',
        liveLink: '',
      },
    ],
    hobbies: ['Open Source Contributing', 'Tech Blogging', 'Hiking'],
  });

  const handlePersonalChange = (field: keyof typeof resumeData.personal, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const handleExperienceChange = (index: number, field: keyof typeof resumeData.experience[0], value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', duration: '', description: '' }]
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleEducationChange = (index: number, field: keyof typeof resumeData.education[0], value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', school: '', year: '' }]
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleProjectChange = (index: number, field: keyof Project, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) => 
        i === index ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', technologies: '', repoLink: '', liveLink: '' }]
    }));
  };

  const removeProject = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addHobby = () => {
    if (newHobby.trim() && !resumeData.hobbies.includes(newHobby.trim())) {
      setResumeData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, newHobby.trim()]
      }));
      setNewHobby('');
    }
  };

  const removeHobby = (hobbyToRemove: string) => {
    setResumeData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(hobby => hobby !== hobbyToRemove)
    }));
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your resume is being generated as PDF.",
    });
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Build Your Resume</h1>
          <p className="text-muted-foreground mt-1">
            Create a professional, ATS-optimized resume in minutes
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="gradient" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor Section */}
        <div className="space-y-6">
          {/* Template Selection */}
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Choose Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`relative p-2 rounded-lg border-2 transition-all ${
                      selectedTemplate === template.id
                        ? 'border-primary shadow-md'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div 
                      className="aspect-[3/4] rounded bg-muted flex items-center justify-center"
                      style={{ backgroundColor: template.color + '10' }}
                    >
                      <FileText className="w-6 h-6" style={{ color: template.color }} />
                    </div>
                    <p className="text-xs font-medium mt-1 text-center">{template.name}</p>
                    {selectedTemplate === template.id && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Tabs */}
          <Card className="border-0 shadow-card">
            <Tabs defaultValue="personal" className="w-full">
              <CardHeader className="pb-0">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="personal" className="gap-1 text-xs px-2">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">Personal</span>
                  </TabsTrigger>
                  <TabsTrigger value="experience" className="gap-1 text-xs px-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="hidden md:inline">Experience</span>
                  </TabsTrigger>
                  <TabsTrigger value="education" className="gap-1 text-xs px-2">
                    <GraduationCap className="w-4 h-4" />
                    <span className="hidden md:inline">Education</span>
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="gap-1 text-xs px-2">
                    <FolderGit2 className="w-4 h-4" />
                    <span className="hidden md:inline">Projects</span>
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="gap-1 text-xs px-2">
                    <Award className="w-4 h-4" />
                    <span className="hidden md:inline">Skills</span>
                  </TabsTrigger>
                  <TabsTrigger value="hobbies" className="gap-1 text-xs px-2">
                    <Heart className="w-4 h-4" />
                    <span className="hidden md:inline">Hobbies</span>
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Personal Tab */}
                <TabsContent value="personal" className="space-y-4 mt-0">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={resumeData.personal.fullName}
                        onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={resumeData.personal.email}
                        onChange={(e) => handlePersonalChange('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={resumeData.personal.phone}
                        onChange={(e) => handlePersonalChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={resumeData.personal.location}
                        onChange={(e) => handlePersonalChange('location', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="flex items-center gap-1">
                        <Linkedin className="w-3 h-3" /> LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        value={resumeData.personal.linkedin}
                        onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                        placeholder="linkedin.com/in/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="github" className="flex items-center gap-1">
                        <Github className="w-3 h-3" /> GitHub
                      </Label>
                      <Input
                        id="github"
                        value={resumeData.personal.github}
                        onChange={(e) => handlePersonalChange('github', e.target.value)}
                        placeholder="github.com/username"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      rows={4}
                      value={resumeData.personal.summary}
                      onChange={(e) => handlePersonalChange('summary', e.target.value)}
                      placeholder="Write a compelling summary about your professional background, key achievements, and career goals..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Tip: Include keywords from your target job descriptions
                    </p>
                  </div>
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience" className="space-y-4 mt-0">
                  {resumeData.experience.map((exp, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border space-y-4 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Job Title</Label>
                          <Input 
                            value={exp.title} 
                            onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                            placeholder="Senior Software Engineer"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Company</Label>
                          <Input 
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            placeholder="Tech Corp"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input 
                          value={exp.duration}
                          onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                          placeholder="2020 - Present"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          rows={3} 
                          value={exp.description}
                          onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                          placeholder="Describe your key responsibilities and achievements..."
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={addExperience}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="space-y-4 mt-0">
                  {resumeData.education.map((edu, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border space-y-4 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => removeEducation(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input 
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          placeholder="B.S. Computer Science"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>School</Label>
                          <Input 
                            value={edu.school}
                            onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                            placeholder="Stanford University"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Year</Label>
                          <Input 
                            value={edu.year}
                            onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                            placeholder="2018"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={addEducation}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </Button>
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-4 mt-0">
                  {resumeData.projects.map((project, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border space-y-4 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => removeProject(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="space-y-2">
                        <Label>Project Name</Label>
                        <Input 
                          value={project.name}
                          onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                          placeholder="E-Commerce Platform"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          rows={2}
                          value={project.description}
                          onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                          placeholder="Brief description of the project..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Technologies Used</Label>
                        <Input 
                          value={project.technologies}
                          onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                          placeholder="React, Node.js, MongoDB"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            <Github className="w-3 h-3" /> Repository Link
                          </Label>
                          <Input 
                            value={project.repoLink}
                            onChange={(e) => handleProjectChange(index, 'repoLink', e.target.value)}
                            placeholder="github.com/user/repo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Live Demo Link
                          </Label>
                          <Input 
                            value={project.liveLink}
                            onChange={(e) => handleProjectChange(index, 'liveLink', e.target.value)}
                            placeholder="yourproject.com"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={addProject}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </TabsContent>

                {/* Skills Tab */}
                <TabsContent value="skills" className="space-y-4 mt-0">
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-2"
                      >
                        {skill}
                        <button 
                          onClick={() => removeSkill(skill)}
                          className="hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a skill..." 
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button variant="outline" onClick={addSkill}>Add</Button>
                  </div>
                </TabsContent>

                {/* Hobbies Tab */}
                <TabsContent value="hobbies" className="space-y-4 mt-0">
                  <p className="text-sm text-muted-foreground">
                    Adding hobbies can help show your personality and make you more memorable to recruiters.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.hobbies.map((hobby, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium flex items-center gap-2"
                      >
                        {hobby}
                        <button 
                          onClick={() => removeHobby(hobby)}
                          className="hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a hobby or interest..." 
                      value={newHobby}
                      onChange={(e) => setNewHobby(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addHobby()}
                    />
                    <Button variant="outline" onClick={addHobby}>Add</Button>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="border-0 shadow-card overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Live Preview
              </CardTitle>
              <CardDescription>
                Using {currentTemplate?.name} template
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Resume Preview */}
              <div 
                className="aspect-[8.5/11] bg-card p-6 text-sm overflow-y-auto"
                style={{ borderLeft: `4px solid ${currentTemplate?.color}` }}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="text-center border-b border-border pb-3">
                    <h2 className="text-xl font-bold" style={{ color: currentTemplate?.color }}>
                      {resumeData.personal.fullName}
                    </h2>
                    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {resumeData.personal.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {resumeData.personal.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {resumeData.personal.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      {resumeData.personal.linkedin && (
                        <span className="flex items-center gap-1">
                          <Linkedin className="w-3 h-3" />
                          {resumeData.personal.linkedin}
                        </span>
                      )}
                      {resumeData.personal.github && (
                        <span className="flex items-center gap-1">
                          <Github className="w-3 h-3" />
                          {resumeData.personal.github}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {resumeData.personal.summary && (
                    <div>
                      <h3 className="font-semibold text-xs uppercase tracking-wider mb-1" style={{ color: currentTemplate?.color }}>
                        Summary
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {resumeData.personal.summary}
                      </p>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience.length > 0 && resumeData.experience.some(exp => exp.title) && (
                    <div>
                      <h3 className="font-semibold text-xs uppercase tracking-wider mb-2" style={{ color: currentTemplate?.color }}>
                        Experience
                      </h3>
                      {resumeData.experience.filter(exp => exp.title).map((exp, index) => (
                        <div key={index} className="mb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-xs">{exp.title}</p>
                              <p className="text-xs text-muted-foreground">{exp.company}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{exp.duration}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects.length > 0 && resumeData.projects.some(p => p.name) && (
                    <div>
                      <h3 className="font-semibold text-xs uppercase tracking-wider mb-2" style={{ color: currentTemplate?.color }}>
                        Projects
                      </h3>
                      {resumeData.projects.filter(p => p.name).map((project, index) => (
                        <div key={index} className="mb-2">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-xs">{project.name}</p>
                            {project.repoLink && (
                              <span className="text-xs text-primary flex items-center gap-0.5">
                                <Github className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{project.description}</p>
                          {project.technologies && (
                            <p className="text-xs text-muted-foreground/70 mt-0.5">
                              Tech: {project.technologies}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {resumeData.education.length > 0 && resumeData.education.some(edu => edu.degree) && (
                    <div>
                      <h3 className="font-semibold text-xs uppercase tracking-wider mb-2" style={{ color: currentTemplate?.color }}>
                        Education
                      </h3>
                      {resumeData.education.filter(edu => edu.degree).map((edu, index) => (
                        <div key={index} className="flex justify-between">
                          <div>
                            <p className="font-medium text-xs">{edu.degree}</p>
                            <p className="text-xs text-muted-foreground">{edu.school}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  {resumeData.skills.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-xs uppercase tracking-wider mb-2" style={{ color: currentTemplate?.color }}>
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {resumeData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ backgroundColor: currentTemplate?.color + '15', color: currentTemplate?.color }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hobbies */}
                  {resumeData.hobbies.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-xs uppercase tracking-wider mb-2" style={{ color: currentTemplate?.color }}>
                        Interests
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {resumeData.hobbies.join(' • ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BuildResume;