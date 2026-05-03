import { Link } from "react-router-dom";
import { Zap, Bot, LayoutTemplate, FileSearch } from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl space-y-8"
      >
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-4">
          <Zap size={14} className="mr-1 fill-current" /> Auto ATS-Optimized
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground">
          Craft your perfect resume <br className="hidden sm:block" />
          <span className="text-primary">in minutes, not hours.</span>
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Use the power of AI to build, analyze, and optimize your resume. 
          Get past Applicant Tracking Systems and land your dream job.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            to="/build" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-8 w-full sm:w-auto"
          >
            <Bot className="mr-2 h-5 w-5" /> Start Building
          </Link>
          <Link 
            to="/analyze" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-12 px-8 w-full sm:w-auto"
          >
            <FileSearch className="mr-2 h-5 w-5" /> Analyze My CV
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mt-24">
        <FeatureCard 
          icon={<Bot size={24} />}
          title="AI Content Generation"
          desc="Type basic inputs and let Gemini Pro write ATS-friendly summaries and action-driven bullet points."
        />
        <FeatureCard 
          icon={<LayoutTemplate size={24} />}
          title="20+ Modern Templates"
          desc="Choose from a variety of clean, minimal, and corporate templates designed to stand out."
        />
        <FeatureCard 
          icon={<FileSearch size={24} />}
          title="Smart Analysis"
          desc="Upload your existing CV for a comprehensive ATS score, issue detection, and instant improvements."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-start text-left p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="p-3 bg-primary/10 text-primary rounded-lg mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
