import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useResumeStore } from "./store/resumeStore";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Builder from "./pages/Builder";
import Analyzer from "./pages/Analyzer";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";

export default function App() {
  const fetchTemplates = useResumeStore(state => state.fetchTemplates);
  
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="build" element={<Builder />} />
          <Route path="analyze" element={<Analyzer />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

