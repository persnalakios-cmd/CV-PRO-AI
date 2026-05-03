import { useState, useRef } from "react";
import { UploadCloud, File, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { analyzeResume } from "../ai/geminiClient";
import { AnalysisResult } from "../types";
import { fileToBase64 } from "../utils/fileUtils";

export default function Analyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }
    
    setError("");
    setIsAnalyzing(true);
    setResult(null);

    try {
      if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) {
        // Handle DOCX using mammoth
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        // Limit text to ~20,000 characters to prevent token limits
        const text = result.value.slice(0, 20000);
        const res = await analyzeResume(null, "", text);
        setResult(res);
      } else {
        // PDF or Image
        const base64 = await fileToBase64(file);
        const res = await analyzeResume(base64, file.type);
        setResult(res);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center p-6 max-w-5xl mx-auto w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Resume Analyzer</h1>
        <p className="text-muted-foreground">Upload your resume for instant ATS analysis and improvement suggestions.</p>
      </div>

      {!result && !isAnalyzing && (
        <div 
          className="w-full max-w-xl border-2 border-dashed border-border rounded-xl p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">Click to upload or drag and drop</h3>
          <p className="text-sm text-muted-foreground">PDF, DOCX, or Image (max 5MB)</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
            accept="application/pdf,image/png,image/jpeg,.docx"
          />
        </div>
      )}

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <div className="animate-spin text-primary">
            <RefreshCw size={32} />
          </div>
          <p className="font-medium animate-pulse">Analyzing your resume with AI...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 text-red-500 rounded-md flex items-center space-x-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="md:col-span-1 space-y-6">
            <div className="p-6 rounded-xl border bg-card shadow-sm text-center">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">ATS Score</h3>
              <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-muted">
                <span className="text-4xl font-bold">{result.ats_score}</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {result.ats_score > 80 ? 'Excellent! Highly optimized.' : result.ats_score > 60 ? 'Good, but has room for improvement.' : 'Needs significant changes.'}
              </p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-xl border bg-card shadow-sm">
              <h3 className="text-lg font-semibold flex items-center mb-4 text-red-500">
                <AlertCircle className="mr-2 h-5 w-5" /> Critical Issues
              </h3>
              <ul className="space-y-3">
                {result.issues.map((issue, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2 text-red-500 shrink-0">•</span>
                    <span className="text-sm text-card-foreground">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-xl border bg-card shadow-sm">
              <h3 className="text-lg font-semibold flex items-center mb-4 text-primary">
                <CheckCircle className="mr-2 h-5 w-5" /> Improvements
              </h3>
              <ul className="space-y-3">
                {result.improvements.map((improvement, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2 text-primary shrink-0">•</span>
                    <span className="text-sm text-card-foreground">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {(result.rewrites && result.rewrites.length > 0) && (
              <div className="p-6 rounded-xl border bg-card shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Suggested Rewrites</h3>
                <div className="space-y-4">
                  {result.rewrites.map((rw: any, i: number) => (
                    <div key={i} className="p-4 rounded-md bg-muted/50 border space-y-2">
                       <p className="text-xs font-semibold text-red-500">Original:</p>
                       <p className="text-sm text-muted-foreground italic">"{rw.original}"</p>
                       <p className="text-xs font-semibold text-green-500 pt-2">Improved:</p>
                       <p className="text-sm font-medium">"{rw.improved}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.detectedDesign && (
              <div className="p-6 rounded-xl border bg-card shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Detected Design (Layout Clone)</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium text-muted-foreground">Layout Type:</span> <span className="capitalize">{result.detectedDesign.layout.replace('-', ' ')}</span></p>
                  <p className="text-sm"><span className="font-medium text-muted-foreground">Primary Color:</span> {result.detectedDesign.primaryColor || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium text-muted-foreground">Section Order:</span> {result.detectedDesign.sectionsOrder?.join(' → ')}</p>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setResult(null)} 
              className="w-full h-12 rounded-md bg-secondary border text-secondary-foreground font-medium hover:bg-muted transition-colors"
            >
              Analyze Another Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
