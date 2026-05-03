import { FileText, Sun, Moon, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useResumeStore } from "../../store/resumeStore";
import { useEffect } from "react";

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useResumeStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2 font-bold text-lg">
            <div className="bg-primary text-primary-foreground p-1 rounded-md">
              <FileText size={20} />
            </div>
            <span>CV Pro AI</span>
          </Link>
          <div className="hidden md:flex items-center space-x-1 text-sm font-medium">
            <Link to="/build" className="px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">Builder</Link>
            <Link to="/analyze" className="px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">Analyzer</Link>
            <Link to="/dashboard" className="px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link to="/admin" className="p-2 rounded-md hover:bg-muted text-muted-foreground hidden sm:flex" title="Admin Panel">
             <LayoutDashboard size={18} />
          </Link>
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
