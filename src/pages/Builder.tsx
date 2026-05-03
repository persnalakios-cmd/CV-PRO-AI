import { useState } from "react";
import { Bot, Sparkles, Download, FileText, Send, LayoutTemplate } from "lucide-react";
import { generateResumeData, chatEditResume } from "../ai/geminiClient";
import { useResumeStore } from "../store/resumeStore";
import { exportToPDF } from "../utils/pdfExport";
import ResumePreview from "../components/ResumePreview";
import { ResumeData } from "../types";

export default function Builder() {
  const { currentResumeId, resumes, templates, createResume, updateResume } = useResumeStore();
  const currentResume = resumes.find(r => r.id === currentResumeId);
  const activeTemplate = templates.find(t => t.id === currentResume?.layout);

  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    experienceLevel: "Entry Level",
    skills: "",
    workHistory: "",
    profilePhoto: ""
  });

  const [chatMessage, setChatMessage] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateResumeData(formData);
      const newResumeId = createResume({ ...formData, ...result });
    } catch (error) {
      console.error(error);
      alert("Failed to generate resume");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChatEdit = async () => {
    if (!currentResume || !chatMessage.trim()) return;
    setIsChatting(true);
    try {
      const { profilePhoto, ...resumeToEdit } = currentResume;
      const updatedJson = await chatEditResume(resumeToEdit, chatMessage);
      updateResume(currentResume.id, updatedJson);
      setChatMessage("");
    } catch (err) {
      console.error(err);
      alert("Failed to update resume");
    } finally {
      setIsChatting(false);
    }
  };

  if (currentResume) {
    return (
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-muted/20">
        {/* Left Side: Preview */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center">
           <div className="flex flex-col sm:flex-row justify-between w-full max-w-3xl mb-4 gap-4">
              <div className="flex items-center space-x-4">
                 <h2 className="text-xl font-bold">Resume Preview</h2>
                 
                 <div className="flex items-center bg-background border px-3 py-1.5 rounded-md text-sm shadow-sm">
                   <LayoutTemplate size={16} className="text-muted-foreground mr-2" />
                   <select 
                      value={currentResume.layout}
                      onChange={(e) => updateResume(currentResume.id, { layout: e.target.value })}
                      className="bg-transparent focus:outline-none font-medium"
                   >
                     {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                     ))}
                   </select>
                 </div>
              </div>
              
              <button 
                onClick={() => exportToPDF("resume-preview", `${currentResume.name.replace(/\s+/g, "_")}_Resume.pdf`)}
                className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
                title="Download PDF"
              >
                <Download size={18} /> <span>Export PDF</span>
              </button>
           </div>
           
           <div id="resume-preview" className="w-full max-w-3xl bg-white text-black p-10 shadow-lg print-exact min-h-[842px]">
              <ResumePreview resume={currentResume} template={activeTemplate} />
           </div>
        </div>

        {/* Right Side: Chat Editor */}
        <div className="w-full md:w-96 border-l bg-card flex flex-col h-[calc(100vh-3.5rem)] sticky top-14">
           <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold flex items-center"><Sparkles className="h-4 w-4 mr-2 text-primary" /> AI Assistant</h3>
              <p className="text-xs text-muted-foreground mt-1">Ask me to rewrite sections, add metrics, or change the tone.</p>
           </div>
           
           <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="bg-primary/10 text-foreground p-3 rounded-lg text-sm rounded-tl-none inline-block border border-primary/20">
                Here's your generated resume! What would you like to change?
              </div>
           </div>

           <div className="p-4 border-t bg-background">
             <div className="flex space-x-2">
               <input 
                 type="text" 
                 value={chatMessage}
                 onChange={(e) => setChatMessage(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleChatEdit()}
                 placeholder="e.g. Make summary more punchy..."
                 className="flex-1 bg-muted border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-md px-3 py-2 text-sm outline-none transition-all"
               />
               <button 
                 onClick={handleChatEdit}
                 disabled={isChatting || !chatMessage.trim()}
                 className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-md disabled:opacity-50 transition-colors"
               >
                 {isChatting ? <span className="animate-spin text-lg">⚙</span> : <Send size={18} />}
               </button>
             </div>
           </div>
        </div>
      </div>
    );
  }

  // Initial Form View
  return (
    <div className="flex-1 flex flex-col items-center p-6 max-w-3xl mx-auto w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Build Your AI Resume</h1>
        <p className="text-muted-foreground">Fill in the core details, and let AI structure and write the perfect resume.</p>
      </div>

      <div className="w-full space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Profile Photo (Optional)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={async (e) => {
               const file = e.target.files?.[0];
               if (file) {
                 const { fileToBase64 } = await import("../utils/fileUtils");
                 const b64 = await fileToBase64(file);
                 setFormData({...formData, profilePhoto: `data:${file.type};base64,${b64}`});
               }
            }}
            className="w-full border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" 
              placeholder="John Doe" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Role</label>
            <input 
              value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" 
              placeholder="Software Engineer" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Experience Level</label>
          <select 
            value={formData.experienceLevel} onChange={e => setFormData({...formData, experienceLevel: e.target.value})}
            className="w-full border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option>Entry Level</option>
            <option>Mid Level</option>
            <option>Senior Level</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Core Skills</label>
          <input 
            value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})}
            className="w-full border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" 
            placeholder="React, Node.js, Python, Project Management..." 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Work History (Brief description or pasted text)</label>
          <textarea 
            value={formData.workHistory} onChange={e => setFormData({...formData, workHistory: e.target.value})}
            className="w-full border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[150px]" 
            placeholder="Worked at Google from 2020 to 2023 as Frontend Dev. Built new features. Worked at StartupInc as Junior Dev before that." 
          />
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={isGenerating || !formData.name || !formData.role}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-md transition-all flex items-center justify-center disabled:opacity-70"
        >
          {isGenerating ? (
            <span className="flex items-center"><Bot className="animate-pulse mr-2" /> Generating...</span>
          ) : (
            <span className="flex items-center"><Sparkles className="mr-2" /> Generate ATS-Optimized Resume</span>
          )}
        </button>
      </div>
    </div>
  );
}
