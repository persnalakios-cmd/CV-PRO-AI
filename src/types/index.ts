export interface ResumeData {
  id: string;
  name: string;
  role: string;
  experienceLevel: string;
  summary: string;
  experience: Experience[];
  skills: string[];
  education: Education[];
  profilePhoto?: string;
  layout: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

export interface AnalysisResult {
  ats_score: number;
  issues: string[];
  improvements: string[];
  rewrites: Array<{ original: string; improved: string }>;
  detectedDesign?: {
    layout: string;
    sectionsOrder: string[];
    primaryColor: string;
  };
}

export interface TemplateData {
  id: string;
  name: string;
  html_cleaned?: string;
  html_template?: string;
  layout_type: string;
  dark_mode_supported: boolean;
  sections?: Array<{ type: string; editable: boolean }>;
  css_variables?: Record<string, string>;
  is_dynamic?: boolean;
}
