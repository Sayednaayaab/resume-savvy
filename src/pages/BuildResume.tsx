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
import { useAuth } from '@/contexts/AuthContext';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

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

// Predefined skills database
const SKILLS_DATABASE = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB',
  'Perl', 'Lua', 'Haskell', 'Clojure', 'Elixir', 'Erlang', 'Dart', 'Objective-C', 'Visual Basic', 'Assembly', 'Fortran', 'COBOL',
  'Pascal', 'Delphi', 'Ada', 'Lisp', 'Scheme', 'Prolog', 'Julia', 'F#', 'Groovy', 'Bash', 'PowerShell', 'VBA',

  // Web Technologies
  'HTML', 'CSS', 'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Next.js', 'Nuxt.js', 'Svelte', 'Django', 'Flask', 'Spring Boot', 'Laravel',
  'Ruby on Rails', 'ASP.NET', 'JSP', 'Servlets', 'Symfony', 'CodeIgniter', 'CakePHP', 'Zend Framework', 'Meteor', 'Ember.js', 'Backbone.js',
  'jQuery', 'Bootstrap', 'Tailwind CSS', 'Material-UI', 'Ant Design', 'Chakra UI', 'Styled Components', 'Sass', 'Less', 'Webpack', 'Vite',
  'Parcel', 'Gulp', 'Grunt', 'Babel', 'ESLint', 'Prettier', 'TypeScript', 'Flow', 'CoffeeScript',

  // Databases
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Firebase', 'DynamoDB', 'Cassandra',
  'MariaDB', 'CouchDB', 'Couchbase', 'Neo4j', 'ArangoDB', 'Elasticsearch', 'Solr', 'InfluxDB', 'TimescaleDB', 'ClickHouse',
  'BigQuery', 'Redshift', 'Snowflake', 'Databricks', 'Hive', 'Impala', 'Presto', 'Druid', 'Pinot', 'Kudu',

  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'Terraform', 'Ansible',
  'Puppet', 'Chef', 'SaltStack', 'CircleCI', 'Travis CI', 'Bitbucket Pipelines', 'Azure DevOps', 'AWS CodePipeline',
  'Google Cloud Build', 'Helm', 'Istio', 'Linkerd', 'Consul', 'Vault', 'Prometheus', 'Grafana', 'ELK Stack', 'Splunk',
  'Nagios', 'Zabbix', 'New Relic', 'Datadog', 'AWS Lambda', 'Azure Functions', 'Google Cloud Functions',

  // Tools & Frameworks
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence', 'Slack', 'Figma', 'Adobe XD', 'Sketch', 'Postman', 'Swagger',
  'Insomnia', 'SoapUI', 'Charles Proxy', 'Wireshark', 'Burp Suite', 'OWASP ZAP', 'SonarQube', 'Snyk', 'Dependabot',
  'npm', 'yarn', 'pnpm', 'Maven', 'Gradle', 'pip', 'conda', 'Composer', 'Bundler', 'Cargo', 'NuGet',

  // Data Science & ML
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Jupyter', 'Tableau', 'Power BI', 'Apache Spark', 'Hadoop',
  'Keras', 'MXNet', 'Caffe', 'Theano', 'Chainer', 'Fast.ai', 'XGBoost', 'LightGBM', 'CatBoost', 'H2O.ai', 'KNIME',
  'RapidMiner', 'Weka', 'Orange', 'Alteryx', 'SAS', 'SPSS', 'RStudio', 'Matplotlib', 'Seaborn', 'Plotly', 'D3.js',
  'Bokeh', 'ggplot2', 'Shiny', 'Streamlit', 'Gradio', 'Dash', 'Panel', 'Voila',

  // Mobile Development
  'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Xamarin', 'Ionic', 'Cordova',
  'PhoneGap', 'Capacitor', 'NativeScript', 'Expo', 'SwiftUI', 'UIKit', 'Android Jetpack', 'Kotlin Multiplatform',
  'Unity', 'Unreal Engine', 'Cocos2d-x', 'Corona SDK', 'Appcelerator', 'Framework7', 'Onsen UI',

  // Testing
  'Jest', 'Mocha', 'Cypress', 'Selenium', 'JUnit', 'TestNG', 'Postman Testing',
  'Karma', 'Jasmine', 'Chai', 'Enzyme', 'React Testing Library', 'Cucumber', 'SpecFlow', 'Behave', 'Robot Framework',
  'Appium', 'Detox', 'Calabash', 'EarlGrey', 'XCUITest', 'Espresso', 'UI Automator', 'MonkeyRunner', 'LoadRunner',
  'JMeter', 'Gatling', 'Locust', 'Artillery', 'k6', 'Newman', 'RestAssured', 'Supertest', 'Axios Mock Adapter',

  // Operating Systems
  'Linux', 'Windows', 'macOS', 'Ubuntu', 'CentOS', 'Red Hat', 'Debian', 'Fedora', 'Arch Linux', 'Manjaro', 'Kali Linux',
  'Android', 'iOS', 'Windows Server', 'FreeBSD', 'OpenBSD', 'NetBSD', 'Solaris', 'AIX', 'HP-UX',

  // Networking
  'TCP/IP', 'HTTP/HTTPS', 'DNS', 'DHCP', 'VPN', 'Firewall', 'Load Balancing', 'CDN', 'Network Security', 'Wireshark',
  'tcpdump', 'nmap', 'Wireshark', 'Cisco', 'Juniper', 'Palo Alto', 'Fortinet', 'Check Point', 'MikroTik',

  // Security
  'Cybersecurity', 'Penetration Testing', 'Ethical Hacking', 'OWASP', 'NIST', 'ISO 27001', 'GDPR', 'HIPAA', 'PCI DSS',
  'SIEM', 'IDS/IPS', 'Endpoint Protection', 'Zero Trust', 'OAuth', 'JWT', 'SAML', 'Kerberos', 'SSL/TLS', 'PKI',
  'Cryptography', 'Hashing', 'Encryption', 'Digital Signatures', 'Blockchain Security', 'IoT Security',

  // Version Control
  'Git', 'SVN', 'Mercurial', 'Perforce', 'CVS', 'Git Flow', 'GitHub Flow', 'Trunk Based Development', 'Semantic Versioning',

  // Containerization & Orchestration
  'Docker', 'Podman', 'LXC', 'Kubernetes', 'Docker Swarm', 'Nomad', 'Mesos', 'OpenShift', 'Rancher', 'Amazon ECS',
  'Azure Container Instances', 'Google Kubernetes Engine', 'Helm', 'Kustomize', 'Docker Compose', 'Podman Compose',

  // Monitoring & Observability
  'Prometheus', 'Grafana', 'ELK Stack', 'Splunk', 'Datadog', 'New Relic', 'Dynatrace', 'AppDynamics', 'SolarWinds',
  'Nagios', 'Zabbix', 'Icinga', 'Sensu', 'Telegraf', 'InfluxDB', 'Jaeger', 'Zipkin', 'OpenTelemetry', 'APM',

  // APIs & Microservices
  'REST APIs', 'GraphQL', 'gRPC', 'SOAP', 'WebSockets', 'WebRTC', 'JSON-RPC', 'XML-RPC', 'OpenAPI', 'Swagger',
  'Postman', 'Insomnia', 'Microservices', 'Service Mesh', 'API Gateway', 'Kong', 'Apigee', 'AWS API Gateway',
  'Azure API Management', 'Google API Gateway', 'Event-Driven Architecture', 'CQRS', 'Saga Pattern',

  // Blockchain & Web3
  'Ethereum', 'Solidity', 'Web3.js', 'Ethers.js', 'Truffle', 'Hardhat', 'Ganache', 'MetaMask', 'IPFS', 'Filecoin',
  'Bitcoin', 'Hyperledger', 'Corda', 'Quorum', 'Chainlink', 'Polkadot', 'Cosmos', 'Avalanche', 'Solana', 'Cardano',
  'NFT', 'DeFi', 'Smart Contracts', 'Cryptocurrency', 'Blockchain Development', 'DApp Development',

  // IoT & Embedded Systems
  'Arduino', 'Raspberry Pi', 'ESP32', 'ESP8266', 'STM32', 'AVR', 'PIC', 'ARM Cortex', 'FPGA', 'Verilog', 'VHDL',
  'MQTT', 'CoAP', 'LoRa', 'Zigbee', 'Bluetooth', 'WiFi', 'Cellular IoT', 'Edge Computing', 'Real-time Systems',
  'Embedded Linux', 'FreeRTOS', 'Zephyr', 'Contiki', 'RIOT OS', 'mbed OS',

  // Game Development
  'Unity', 'Unreal Engine', 'Godot', 'GameMaker', 'Construct', 'Phaser', 'Babylon.js', 'Three.js', 'Cocos2d-x',
  'SFML', 'SDL', 'OpenGL', 'DirectX', 'Vulkan', 'Blender', 'Maya', '3ds Max', 'ZBrush', 'Substance Painter',

  // Big Data & Analytics
  'Hadoop', 'Spark', 'Kafka', 'Storm', 'Flink', 'Beam', 'Samza', 'Kinesis', 'Pub/Sub', 'Event Hubs', 'BigQuery',
  'Redshift', 'Snowflake', 'Databricks', 'Presto', 'Trino', 'Druid', 'Pinot', 'ClickHouse', 'TimescaleDB',
  'Apache Airflow', 'Prefect', 'Dagster', 'Luigi', 'Azkaban', 'Oozie', 'Sqoop', 'Flume', 'NiFi',

  // AI & Machine Learning
  'Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Reinforcement Learning',
  'Neural Networks', 'Convolutional Neural Networks', 'Recurrent Neural Networks', 'Transformers', 'BERT', 'GPT',
  'OpenAI API', 'Hugging Face', 'spaCy', 'NLTK', 'OpenCV', 'Pillow', 'Scikit-image', 'TensorFlow Serving',
  'TorchServe', 'MLflow', 'Kubeflow', 'SageMaker', 'Vertex AI', 'Azure ML', 'AutoML',

  // Soft Skills
  'Project Management', 'Agile', 'Scrum', 'Kanban', 'Leadership', 'Team Collaboration', 'Communication', 'Problem Solving',
  'Critical Thinking', 'Time Management', 'Adaptability', 'Creativity', 'Emotional Intelligence', 'Conflict Resolution',
  'Mentoring', 'Coaching', 'Public Speaking', 'Presentation Skills', 'Negotiation', 'Stakeholder Management',

  // Design
  'UI/UX Design', 'Graphic Design', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Wireframing',
  'Figma', 'Sketch', 'Adobe XD', 'InVision', 'Framer', 'Principle', 'After Effects', 'Premiere Pro', 'Photoshop',
  'Illustrator', 'InDesign', 'Lightroom', 'Blender', 'Cinema 4D', 'User Experience Research', 'Usability Testing',
  'Design Systems', 'Accessibility', 'Responsive Design', 'Mobile Design', 'Web Design', 'Print Design',

  // Other Technical Skills
  'REST APIs', 'GraphQL', 'Microservices', 'Serverless', 'Blockchain', 'IoT', 'Cybersecurity', 'Network Administration',
  'System Administration', 'Database Administration', 'Performance Optimization', 'Code Review', 'Technical Writing',
  'Documentation', 'Requirements Analysis', 'System Design', 'Architecture Design', 'Technical Leadership',
  'DevOps', 'Site Reliability Engineering', 'Platform Engineering', 'Infrastructure as Code', 'Configuration Management',

  // Additional Programming Languages
  'Zig', 'Nim', 'Crystal', 'V', 'Odin',

  // Additional Web Technologies
  'SolidJS', 'Qwik', 'Astro', 'Remix', 'SvelteKit', 'Fresh',

  // Additional Databases
  'CockroachDB', 'TiDB', 'YugabyteDB', 'PlanetScale', 'Neon', 'Supabase',

  // Additional Cloud & DevOps
  'Vercel', 'Netlify', 'Fly.io', 'Railway', 'Render',

  // Additional Tools & Frameworks
  'Biome', 'Turborepo', 'Nx', 'Lerna',

  // Additional Testing
  'Vitest', 'Playwright', 'Puppeteer',

  // Additional Mobile Development
  'Expo Router',

  // Additional Data Science & ML
  'Polars', 'Dask', 'dbt',

  // Additional Operating Systems
  'WSL2',

  // Additional Networking
  'Cloudflare', 'Fastly',

  // Additional Security
  'OAuth 2.0', 'OpenID Connect', 'WireGuard', 'OpenVPN',

  // Additional Version Control
  'GitOps',

  // Additional Containerization & Orchestration
  'Podman', 'Buildah',

  // Additional Monitoring & Observability
  'Tempo', 'Cortex', 'Loki',

  // Additional APIs & Microservices
  'tRPC', 'GraphQL Yoga', 'Hasura',

  // Additional Blockchain & Web3
  'Foundry', 'The Graph', 'Arweave'
];

const BuildResume = () => {
  const { toast } = useToast();
  const { incrementResumeCreated, user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [newSkill, setNewSkill] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
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

  const handleSkillInputChange = (value: string) => {
    setNewSkill(value);
    if (value.trim() || showSkillSuggestions) {
      const filtered = SKILLS_DATABASE.filter(skill =>
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !resumeData.skills.includes(skill)
      ).slice(0, 8); // Limit to 8 suggestions
      setFilteredSkills(filtered);
      setShowSkillSuggestions(true);
    } else {
      setFilteredSkills([]);
      setShowSkillSuggestions(false);
    }
  };

  const handleSkillInputFocus = () => {
    const filtered = SKILLS_DATABASE.filter(skill =>
      !resumeData.skills.includes(skill)
    ).slice(0, 8); // Show first 8 available skills
    setFilteredSkills(filtered);
    setShowSkillSuggestions(true);
  };

  const selectSkill = (skill: string) => {
    setNewSkill(skill);
    setFilteredSkills([]);
    setShowSkillSuggestions(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
      setFilteredSkills([]);
      setShowSkillSuggestions(false);
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

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById('resume-preview') as HTMLElement;
      if (!element) {
        toast({
          title: "Error",
          description: "Could not find resume content to export.",
          variant: "destructive",
        });
        return;
      }

      // Temporarily set fixed dimensions for PDF generation
      const originalHeight = element.style.height;
      const originalOverflow = element.style.overflow;
      element.style.height = '11in';
      element.style.width = '8.5in';
      element.style.overflow = 'visible';

      const opt = {
        margin: 0.5,
        filename: `${resumeData.personal.fullName.replace(/\s+/g, '_')}_resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, allowTaint: true, useCORS: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      } as any;

      await html2pdf().set(opt).from(element).save();

      // Restore original styles
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;

      incrementResumeCreated(user?.email || '');
      toast({
        title: "Download Complete",
        description: "Your resume PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error('PDF Download Error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDOCX = async () => {
    console.log('Starting DOCX download...');
    try {
      console.log('Creating document children...');
      const children: any[] = [];

      console.log('Adding header...');

      // Header with name
      children.push(new Paragraph({
        text: resumeData.personal.fullName,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }));

      // Contact info
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `Email: ${resumeData.personal.email} | ` }),
          new TextRun({ text: `Phone: ${resumeData.personal.phone} | ` }),
          new TextRun({ text: `Location: ${resumeData.personal.location}` }),
        ],
        alignment: AlignmentType.CENTER,
      }));

      // Social links
      if (resumeData.personal.linkedin || resumeData.personal.github) {
        const socialChildren = [];
        if (resumeData.personal.linkedin) {
          socialChildren.push(new TextRun({ text: `LinkedIn: ${resumeData.personal.linkedin} | ` }));
        }
        if (resumeData.personal.github) {
          socialChildren.push(new TextRun({ text: `GitHub: ${resumeData.personal.github}` }));
        }
        children.push(new Paragraph({
          children: socialChildren,
          alignment: AlignmentType.CENTER,
        }));
      }

      // Summary
      if (resumeData.personal.summary) {
        children.push(new Paragraph({
          text: "SUMMARY",
          heading: HeadingLevel.HEADING_2,
        }));
        children.push(new Paragraph({
          text: resumeData.personal.summary,
        }));
      }

      // Experience
      const validExperience = resumeData.experience.filter(exp => exp.title && exp.title.trim());
      if (validExperience.length > 0) {
        children.push(new Paragraph({
          text: "EXPERIENCE",
          heading: HeadingLevel.HEADING_2,
        }));
        validExperience.forEach(exp => {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: exp.title, bold: true }),
              new TextRun({ text: ` at ${exp.company}` }),
              new TextRun({ text: ` (${exp.duration})`, italics: true }),
            ],
          }));
          if (exp.description) {
            children.push(new Paragraph({
              text: exp.description,
            }));
          }
          children.push(new Paragraph({ text: "" })); // Empty line
        });
      }

      // Projects
      const validProjects = resumeData.projects.filter(p => p.name && p.name.trim());
      if (validProjects.length > 0) {
        children.push(new Paragraph({
          text: "PROJECTS",
          heading: HeadingLevel.HEADING_2,
        }));
        validProjects.forEach(project => {
          const projectChildren = [new TextRun({ text: project.name, bold: true })];
          if (project.repoLink) {
            projectChildren.push(new TextRun({ text: ` (${project.repoLink})` }));
          }
          children.push(new Paragraph({
            children: projectChildren,
          }));
          if (project.description) {
            children.push(new Paragraph({
              text: project.description,
            }));
          }
          if (project.technologies) {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: `Technologies: ${project.technologies}`, italics: true }),
              ],
            }));
          }
          children.push(new Paragraph({ text: "" })); // Empty line
        });
      }

      // Education
      const validEducation = resumeData.education.filter(edu => edu.degree && edu.degree.trim());
      if (validEducation.length > 0) {
        children.push(new Paragraph({
          text: "EDUCATION",
          heading: HeadingLevel.HEADING_2,
        }));
        validEducation.forEach(edu => {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: edu.degree, bold: true }),
              new TextRun({ text: ` - ${edu.school}` }),
              new TextRun({ text: ` (${edu.year})`, italics: true }),
            ],
          }));
        });
      }

      // Skills
      if (resumeData.skills.length > 0) {
        children.push(new Paragraph({
          text: "SKILLS",
          heading: HeadingLevel.HEADING_2,
        }));
        children.push(new Paragraph({
          text: resumeData.skills.join(', '),
        }));
      }

      // Hobbies
      if (resumeData.hobbies.length > 0) {
        children.push(new Paragraph({
          text: "INTERESTS",
          heading: HeadingLevel.HEADING_2,
        }));
        children.push(new Paragraph({
          text: resumeData.hobbies.join(', '),
        }));
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.personal.fullName.replace(/\s+/g, '_')}_resume.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      incrementResumeCreated(user?.email || '');
      toast({
        title: "Download Complete",
        description: "Your resume DOCX has been downloaded successfully.",
      });
    } catch (error) {
      console.error('DOCX Download Error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your DOCX. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    try {
      const element = document.getElementById('resume-preview') as HTMLElement;
      if (!element) {
        toast({
          title: "Error",
          description: "Could not find resume content to preview.",
          variant: "destructive",
        });
        return;
      }

      // Create a new window for preview
      const previewWindow = window.open('', '_blank', 'width=800,height=600');
      if (!previewWindow) {
        toast({
          title: "Error",
          description: "Could not open preview window. Please allow popups for this site.",
          variant: "destructive",
        });
        return;
      }

      // Clone the element and prepare it for printing
      const clonedElement = element.cloneNode(true) as HTMLElement;
      clonedElement.style.width = '8.5in';
      clonedElement.style.height = '11in';
      clonedElement.style.margin = '0';
      clonedElement.style.padding = '0.5in';
      clonedElement.style.boxSizing = 'border-box';
      clonedElement.style.fontSize = '12px';

      // Create HTML content for the new window
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Resume Preview - ${resumeData.personal.fullName}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              background: white;
            }
            .print-button {
              position: fixed;
              top: 10px;
              right: 10px;
              padding: 10px 20px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
            }
            .print-button:hover {
              background: #0056b3;
            }
            @media print {
              .print-button { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">Print Resume</button>
          ${clonedElement.outerHTML}
        </body>
        </html>
      `;

      previewWindow.document.write(htmlContent);
      previewWindow.document.close();

      toast({
        title: "Preview Opened",
        description: "Resume preview opened in a new window.",
      });
    } catch (error) {
      console.error('Preview Error:', error);
      toast({
        title: "Preview Failed",
        description: "There was an error opening the preview. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    try {
      // Create CSV content
      let csvContent = "Section,Details\n";

      // Personal Information
      csvContent += `"Personal Information","Name: ${resumeData.personal.fullName}"\n`;
      csvContent += `,"Email: ${resumeData.personal.email}"\n`;
      csvContent += `,"Phone: ${resumeData.personal.phone}"\n`;
      csvContent += `,"Location: ${resumeData.personal.location}"\n`;
      if (resumeData.personal.linkedin) csvContent += `,"LinkedIn: ${resumeData.personal.linkedin}"\n`;
      if (resumeData.personal.github) csvContent += `,"GitHub: ${resumeData.personal.github}"\n`;
      if (resumeData.personal.summary) csvContent += `,"Summary: ${resumeData.personal.summary.replace(/"/g, '""')}"\n`;

      // Experience
      resumeData.experience.filter(exp => exp.title).forEach((exp, index) => {
        csvContent += `"Experience ${index + 1}","Title: ${exp.title}"\n`;
        csvContent += `,"Company: ${exp.company}"\n`;
        csvContent += `,"Duration: ${exp.duration}"\n`;
        csvContent += `,"Description: ${exp.description.replace(/"/g, '""')}"\n`;
      });

      // Education
      resumeData.education.filter(edu => edu.degree).forEach((edu, index) => {
        csvContent += `"Education ${index + 1}","Degree: ${edu.degree}"\n`;
        csvContent += `,"School: ${edu.school}"\n`;
        csvContent += `,"Year: ${edu.year}"\n`;
      });

      // Skills
      if (resumeData.skills.length > 0) {
        csvContent += `"Skills","${resumeData.skills.join(', ')}"\n`;
      }

      // Projects
      resumeData.projects.filter(p => p.name).forEach((project, index) => {
        csvContent += `"Project ${index + 1}","Name: ${project.name}"\n`;
        csvContent += `,"Description: ${project.description.replace(/"/g, '""')}"\n`;
        csvContent += `,"Technologies: ${project.technologies}"\n`;
        if (project.repoLink) csvContent += `,"Repository: ${project.repoLink}"\n`;
        if (project.liveLink) csvContent += `,"Live Demo: ${project.liveLink}"\n`;
      });

      // Hobbies
      if (resumeData.hobbies.length > 0) {
        csvContent += `"Hobbies","${resumeData.hobbies.join(', ')}"\n`;
      }

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.personal.fullName.replace(/\s+/g, '_')}_resume_data.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Your resume data has been exported to CSV successfully.",
      });
    } catch (error) {
      console.error('CSV Export Error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data to CSV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

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
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleDownloadDOCX}>
            <Download className="w-4 h-4 mr-2" />
            Download DOCX
          </Button>
          <Button variant="gradient" onClick={handleDownloadPDF}>
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
                  <div className="relative">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill..."
                        value={newSkill}
                        onChange={(e) => handleSkillInputChange(e.target.value)}
                        onFocus={handleSkillInputFocus}
                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button variant="outline" onClick={addSkill}>Add</Button>
                    </div>
                    {showSkillSuggestions && filteredSkills.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                        {filteredSkills.map((skill, index) => (
                          <button
                            key={index}
                            onClick={() => selectSkill(skill)}
                            className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
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
                id="resume-preview"
                className="bg-card p-6 text-sm"
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