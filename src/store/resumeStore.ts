import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ResumeData, TemplateData } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ResumeStore {
  darkMode: boolean;
  toggleDarkMode: () => void;
  resumes: ResumeData[];
  currentResumeId: string | null;
  templates: TemplateData[];
  setCurrentResumeId: (id: string | null) => void;
  createResume: (data: Partial<ResumeData>) => string;
  updateResume: (id: string, data: Partial<ResumeData>) => void;
  deleteResume: (id: string) => void;
  addTemplate: (template: TemplateData) => void;
  fetchTemplates: () => Promise<void>;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      resumes: [],
      currentResumeId: null,
      templates: [
        {
          id: 'minimal-1',
          name: 'Minimal Classic',
          html_cleaned: '',
          layout_type: 'one-column',
          dark_mode_supported: true
        },
        {
          id: 'modern-2',
          name: 'Modern Split',
          html_cleaned: '',
          layout_type: 'two-column',
          dark_mode_supported: true
        }
      ],
      fetchTemplates: async () => {
        try {
          const res = await fetch("/api/templates");
          const dbTemplates = await res.json();
          set((state) => {
            // Merge with defaults
            const defaults = state.templates.filter(t => t.id === 'minimal-1' || t.id === 'modern-2');
            const merged = [...defaults];
            dbTemplates.forEach((t: TemplateData) => {
               if(t.id !== 'minimal-1' && t.id !== 'modern-2') merged.push(t);
            });
            return { templates: merged };
          });
        } catch (e) {
          console.error("Failed to fetch templates:", e);
        }
      },
      setCurrentResumeId: (id) => set({ currentResumeId: id }),
      createResume: (data) => {
        const newId = uuidv4();
        const newResume: ResumeData = {
          id: newId,
          name: data.name || '',
          role: data.role || '',
          experienceLevel: data.experienceLevel || 'Entry Level',
          summary: data.summary || '',
          experience: data.experience || [],
          skills: data.skills || [],
          education: data.education || [],
          profilePhoto: data.profilePhoto,
          layout: data.layout || 'minimal-1'
        };
        set((state) => ({ resumes: [...state.resumes, newResume], currentResumeId: newId }));
        return newId;
      },
      updateResume: (id, data) => set((state) => ({
        resumes: state.resumes.map(r => r.id === id ? { ...r, ...data } : r)
      })),
      deleteResume: (id) => set((state) => ({
        resumes: state.resumes.filter(r => r.id !== id),
        currentResumeId: state.currentResumeId === id ? null : state.currentResumeId
      })),
      addTemplate: (template) => set((state) => ({ templates: [...state.templates, template] })),
    }),
    {
      name: 'resume-builder-storage',
    }
  )
);
