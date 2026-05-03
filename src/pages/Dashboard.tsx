import { Link } from "react-router-dom";
import { Plus, FileText, Trash2, Edit2 } from "lucide-react";
import { useResumeStore } from "../store/resumeStore";

export default function Dashboard() {
  const { resumes, deleteResume, setCurrentResumeId } = useResumeStore();

  return (
    <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Resumes</h1>
          <p className="text-muted-foreground mt-1">Manage and edit your saved resumes.</p>
        </div>
        <Link 
          to="/build"
          onClick={() => setCurrentResumeId(null)} 
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center border-2 border-dashed border-border rounded-xl p-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No resumes yet</h3>
          <p className="text-muted-foreground mb-4">Create your first ATS-optimized resume to get started.</p>
          <Link 
            to="/build" 
            onClick={() => setCurrentResumeId(null)}
            className="text-primary hover:underline font-medium"
          >
            Start building →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {resumes.map(resume => (
            <div key={resume.id} className="group relative border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm flex flex-col h-64">
              <div className="bg-muted p-4 flex-1 flex flex-col justify-center items-center text-center relative border-b">
                 <FileText className="h-10 w-10 text-muted-foreground mb-2 opacity-20 group-hover:opacity-100 transition-opacity text-primary" />
                 <h3 className="font-semibold px-2 truncate max-w-full">{resume.name}</h3>
                 <p className="text-xs text-muted-foreground px-2 truncate max-w-full">{resume.role}</p>
                 
                 <div className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      to="/build" 
                      onClick={() => setCurrentResumeId(resume.id)}
                      className="bg-primary text-primary-foreground p-2 rounded-full mx-1 shadow-md hover:scale-105 transition-transform"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button 
                      onClick={() => deleteResume(resume.id)}
                      className="bg-destructive text-destructive-foreground p-2 rounded-full mx-1 shadow-md hover:scale-105 transition-transform"
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
              </div>
              <div className="p-3 text-xs text-muted-foreground flex justify-between items-center">
                <span>{resume.experienceLevel}</span>
                <span className="capitalize">{resume.layout?.replace('-', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
