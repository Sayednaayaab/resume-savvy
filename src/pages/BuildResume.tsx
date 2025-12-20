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
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Linkedin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResumeData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
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
  const [resumeData, setResumeData] = useState<ResumeData>({
    personal: {
      fullName: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/johndoe',
      summary: 'Experienced software engineer with 5+ years of expertise in building scalable web applications.',
    },
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        duration: '2020 - Present',
        description: 'Led development of microservices architecture, improving system performance by 40%.',
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
  });

  const handlePersonalChange = (field: keyof typeof resumeData.personal, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal" className="gap-1">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Personal</span>
                  </TabsTrigger>
                  <TabsTrigger value="experience" className="gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span className="hidden sm:inline">Experience</span>
                  </TabsTrigger>
                  <TabsTrigger value="education" className="gap-1">
                    <GraduationCap className="w-4 h-4" />
                    <span className="hidden sm:inline">Education</span>
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="gap-1">
                    <Award className="w-4 h-4" />
                    <span className="hidden sm:inline">Skills</span>
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pt-6">
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
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={resumeData.personal.linkedin}
                      onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      rows={4}
                      value={resumeData.personal.summary}
                      onChange={(e) => handlePersonalChange('summary', e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="experience" className="space-y-4 mt-0">
                  {resumeData.experience.map((exp, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Job Title</Label>
                          <Input value={exp.title} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label>Company</Label>
                          <Input value={exp.company} readOnly />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input value={exp.duration} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea rows={3} value={exp.description} readOnly />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    + Add Experience
                  </Button>
                </TabsContent>

                <TabsContent value="education" className="space-y-4 mt-0">
                  {resumeData.education.map((edu, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border space-y-4">
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input value={edu.degree} readOnly />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>School</Label>
                          <Input value={edu.school} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label>Year</Label>
                          <Input value={edu.year} readOnly />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    + Add Education
                  </Button>
                </TabsContent>

                <TabsContent value="skills" className="space-y-4 mt-0">
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add a skill..." />
                    <Button variant="outline">Add</Button>
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
                className="aspect-[8.5/11] bg-card p-6 text-sm"
                style={{ borderLeft: `4px solid ${currentTemplate?.color}` }}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="text-center border-b border-border pb-4">
                    <h2 className="text-xl font-bold" style={{ color: currentTemplate?.color }}>
                      {resumeData.personal.fullName}
                    </h2>
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
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
                  </div>

                  {/* Summary */}
                  <div>
                    <h3 className="font-semibold text-xs uppercase tracking-wider mb-1" style={{ color: currentTemplate?.color }}>
                      Summary
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {resumeData.personal.summary}
                    </p>
                  </div>

                  {/* Experience */}
                  <div>
                    <h3 className="font-semibold text-xs uppercase tracking-wider mb-2" style={{ color: currentTemplate?.color }}>
                      Experience
                    </h3>
                    {resumeData.experience.map((exp, index) => (
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

                  {/* Education */}
                  <div>
                    <h3 className="font-semibold text-xs uppercase tracking-wider mb-2" style={{ color: currentTemplate?.color }}>
                      Education
                    </h3>
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <p className="font-medium text-xs">{edu.degree}</p>
                          <p className="text-xs text-muted-foreground">{edu.school}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{edu.year}</span>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
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
