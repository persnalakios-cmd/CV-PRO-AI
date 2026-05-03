import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const DB_FILE = path.join(__dirname, "templates.json");

// Helper to init/load DB
async function loadDB() {
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveDB(data: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Templates API
  app.get("/api/templates", async (req, res) => {
    const templates = await loadDB();
    res.json(templates);
  });

  app.post("/api/templates", async (req, res) => {
    const newTemplate = req.body;
    const templates = await loadDB();
    const existingIndex = templates.findIndex((t: any) => t.id === newTemplate.id);
    if (existingIndex >= 0) {
      templates[existingIndex] = newTemplate;
    } else {
      templates.push(newTemplate);
    }
    await saveDB(templates);
    res.json({ success: true, template: newTemplate });
  });

  app.delete("/api/templates/:id", async (req, res) => {
    const templates = await loadDB();
    const newTemplates = templates.filter((t: any) => t.id !== req.params.id);
    await saveDB(newTemplates);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
