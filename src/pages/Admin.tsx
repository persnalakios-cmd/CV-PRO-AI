import { useState } from "react";
import { UploadCloud, Code, Plus, Trash2 } from "lucide-react";
import { useResumeStore } from "../store/resumeStore";
import { TemplateData } from "../types";
import { v4 as uuidv4 } from "uuid";

export default function Admin() {
  const { templates, addTemplate, fetchTemplates } = useResumeStore();
  const [htmlContent, setHtmlContent] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [layoutType, setLayoutType] = useState("one-column");

  const [message, setMessage] = useState("");

  const handleUploadHTML = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
       setHtmlContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddTemplate = async () => {
    if (!templateName || !htmlContent) {
      setMessage("Please furnish name and HTML code.");
      return;
    }

    setIsProcessing(true);
    setMessage("Analyzing and converting Template using AI...");

    try {
       // Import dynamically to avoid top-level issues if any
       const { convertHtmlTemplate } = await import("../ai/geminiClient");
       const dynamicTemplateData = await convertHtmlTemplate(htmlContent);

       const newTemplate: TemplateData = {
         id: uuidv4(),
         name: templateName,
         html_cleaned: htmlContent, 
         html_template: dynamicTemplateData.html_template,
         layout_type: dynamicTemplateData.layout || layoutType,
         dark_mode_supported: true,
         sections: dynamicTemplateData.sections,
         css_variables: dynamicTemplateData.css_variables,
         is_dynamic: dynamicTemplateData.is_dynamic
       };

       await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTemplate)
       });
       await fetchTemplates(); // Refresh from backend
       setMessage("Template added successfully!");
       setTemplateName("");
       setHtmlContent("");
    } catch (e) {
       console.error(e);
       setMessage("Failed to process or save template.");
    } finally {
       setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === 'minimal-1' || id === 'modern-2') {
       setMessage("Cannot delete default templates.");
       return;
    }
    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      await fetchTemplates();
      setMessage("Template deleted.");
    } catch (e) {
      setMessage("Failed to delete template.");
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
        <p className="text-muted-foreground mt-1">Manage resume templates and system settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><Code className="mr-2 h-5 w-5 text-primary" /> Upload New Template</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Template Name</label>
                <input 
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary" 
                  placeholder="e.g. Modern Developer"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Layout Type</label>
                <select 
                  value={layoutType}
                  onChange={(e) => setLayoutType(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="one-column">One Column</option>
                  <option value="two-column">Two Column</option>
                  <option value="creative">Creative</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Upload HTML File</label>
                <div className="border border-dashed rounded-md p-4 text-center hover:bg-muted/50 transition-colors relative">
                   <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                   <span className="text-sm font-medium text-primary">Browse file</span>
                   <input 
                     type="file" 
                     accept=".html" 
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                     onChange={handleUploadHTML}
                   />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleAddTemplate}
                  disabled={isProcessing}
                  className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-md font-medium transition-colors flex justify-center items-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Plus className="mr-2 h-4 w-4" /> {isProcessing ? "Converting..." : "Add Template to System"}
                </button>
              </div>

              {message && <p className="text-sm text-green-600 font-medium text-center">{message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm overflow-hidden flex flex-col h-[500px]">
             <h2 className="text-xl font-semibold mb-4">HTML Preview</h2>
             <textarea 
               value={htmlContent}
               onChange={e => setHtmlContent(e.target.value)}
               className="flex-1 w-full border border-border rounded-md p-3 font-mono text-xs bg-muted/30 whitespace-pre focus:outline-none"
               placeholder="HTML code will appear here...&#10;&#10;Use placeholders like:&#10;{{name}}&#10;{{role}}&#10;{{summary}}&#10;{{experience}}&#10;{{skills}}"
             />
          </div>
        </div>
      </div>
      
      <div className="mt-8">
         <h2 className="text-xl font-semibold mb-4">Available Templates ({templates.length})</h2>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {templates.map(t => (
               <div key={t.id} className="border p-4 rounded-lg bg-card shadow-sm relative group">
                  <h3 className="font-semibold text-sm truncate pr-6">{t.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">{t.layout_type}</p>
                  {t.id !== 'minimal-1' && t.id !== 'modern-2' && (
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Template"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
