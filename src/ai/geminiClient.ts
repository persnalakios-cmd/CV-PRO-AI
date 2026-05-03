import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });

export async function generateResumeData(input: {
  name: string;
  role: string;
  experienceLevel: string;
  skills: string;
  workHistory: string;
}) {
  const prompt = `
  Generate a professional resume based on the following input:
  Name: ${input.name}
  Role: ${input.role}
  Experience Level: ${input.experienceLevel}
  Skills: ${input.skills}
  Work History: ${input.workHistory}

  RULES STRICTLY ENFORCED:
  - Summary: 4-5 lines, each line <= 15 words, NO generic phrases.
  - Experience: 3-5 bullet points per job. Each bullet <= 18 words, MUST start with action verb and include a result or metric.
  - Skills: Maximum 10-12 skills total.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                role: { type: Type.STRING },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING },
                description: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            }
          },
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "experience", "skills"]
      }
    }
  });

  if (!response.text) throw new Error("No text from AI");
  return JSON.parse(response.text.trim());
}

export async function analyzeResume(base64Document: string | null, mimeType: string, textContent: string | null = null) {
  const prompt = `
  Analyze this resume document.
  1. Extract the core information carefully: Name, Summary, Experience, Skills, Education.
  2. Evaluate the ATS score (0-100).
  3. List up to 5 issues and up to 5 improvements.
  4. Provide rewrites for weak bullet points.
  5. DETECT THE LAYOUT AND DESIGN: Identify if it is one-column or two-column, basic colors used, and general style so we can recreate it.
  `;

  let parts: Array<any> = [{ text: prompt }];

  if (base64Document && mimeType) {
    parts.unshift({ inlineData: { data: base64Document, mimeType } });
  } else if (textContent) {
    parts.unshift({ text: "Resume Content:\n" + textContent });
  } else {
    throw new Error("No document provided");
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          extractedData: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              summary: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    startDate: { type: Type.STRING },
                    endDate: { type: Type.STRING },
                    description: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    institution: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    year: { type: Type.STRING }
                  }
                }
              }
            }
          },
          ats_score: { type: Type.NUMBER },
          issues: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          rewrites: {
             type: Type.ARRAY,
             items: {
               type: Type.OBJECT,
               properties: {
                 original: { type: Type.STRING },
                 improved: { type: Type.STRING }
               }
             }
          },
          detectedDesign: {
             type: Type.OBJECT,
             properties: {
               layout: { type: Type.STRING, description: "e.g., 'one-column' or 'two-column'" },
               sectionsOrder: { type: Type.ARRAY, items: { type: Type.STRING } },
               primaryColor: { type: Type.STRING }
             }
          }
        },
        required: ["extractedData", "ats_score", "issues", "improvements", "rewrites", "detectedDesign"]
      }
    }
  });

  if (!response.text) throw new Error("No text from AI");
  return JSON.parse(response.text.trim());
}

export async function convertHtmlTemplate(rawHtml: string) {
  const prompt = `
  You are an expert frontend developer.
  Analyze the following HTML resume template and return a dynamic template JSON.
  
  Instructions:
  1. Detect the layout type (e.g., "one-column", "two-column").
  2. Map all static text to dynamic placeholders:
     - {{name}}, {{role}} (or {{title}}), {{summary}}, {{profilePhoto}}
     - For Lists (Experience, Education, Skills): Remove the static repeated elements and replace the ENTIRE list container content with the placeholder: {{experience}}, {{education}}, {{skills}}. 
       (Our view engine will inject the mapped HTML list inside).
  3. Support CSS variables for theming internally (dark mode compatible).
  4. Ensure the returned HTML has these placeholders securely in place.
  5. The output must strictly follow the JSON structure.

  Original HTML:
  ${rawHtml}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          layout: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
               type: Type.OBJECT,
               properties: {
                 type: { type: Type.STRING },
                 editable: { type: Type.BOOLEAN }
               }
            }
          },
          html_template: { type: Type.STRING },
          is_dynamic: { type: Type.BOOLEAN }
        },
        required: ["layout", "sections", "html_template", "is_dynamic"]
      }
    }
  });

  if (!response.text) throw new Error("No text from AI");
  return JSON.parse(response.text.trim());
}

export async function chatEditResume(currentJson: any, request: string) {
  const prompt = `
  Current Resume JSON:
  ${JSON.stringify(currentJson, null, 2)}
  
  User Request: "${request}"
  
  Update ONLY the requested sections while keeping the overall structure intact. Make the requested improvements (e.g., more professional, add metrics, improve summary).
  Return the completely updated JSON object.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          experience: {
            type: Type.ARRAY,
            items: {
               type: Type.OBJECT,
               properties: {
                 company: { type: Type.STRING },
                 role: { type: Type.STRING },
                 startDate: { type: Type.STRING },
                 endDate: { type: Type.STRING },
                 description: { type: Type.ARRAY, items: { type: Type.STRING } }
               }
            }
          },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                institution: { type: Type.STRING },
                degree: { type: Type.STRING },
                year: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) throw new Error("No text from AI");
  return JSON.parse(response.text.trim());
}

