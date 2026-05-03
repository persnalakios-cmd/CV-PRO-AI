import React from "react";
import { ResumeData, TemplateData } from "../types";

interface Props {
  resume: ResumeData;
  template?: TemplateData;
}

export default function ResumePreview({ resume, template }: Props) {
  const htmlTemplateToUse = template?.html_template || template?.html_cleaned;

  if (htmlTemplateToUse && htmlTemplateToUse.trim() !== '') {
    // Inject custom HTML template, replacing placeholders
    let html = htmlTemplateToUse;
    
    // Replace scalars
    html = html.replace(/\{\{name\}\}/gi, resume.name || '');
    html = html.replace(/\{\{role\}\}/gi, resume.role || '');
    html = html.replace(/\{\{title\}\}/gi, resume.role || '');
    html = html.replace(/\{\{summary\}\}/gi, resume.summary || '');
    
    if (resume.profilePhoto) {
      html = html.replace(/\{\{profilePhoto\}\}/gi, resume.profilePhoto);
    } else {
      html = html.replace(/\{\{profilePhoto\}\}/gi, '');
    }

    // For Skills: create a simple comma joined string or bulleted list if user used {{skills}}
    const skillsHtml = resume.skills?.map(s => `<span class="skill-pill" style="display:inline-block;background:#eee;padding:2px 8px;border-radius:4px;margin:2px;font-size:12px;">${s}</span>`).join('') || '';
    html = html.replace(/\{\{skills\}\}/gi, skillsHtml);

    // For Experience
    const expHtml = resume.experience?.map(exp => `
      <div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
           <strong>${exp.role || ''}</strong>
           <span style="font-size:0.85em;color:#666;">${exp.startDate || ''} - ${exp.endDate || ''}</span>
        </div>
        <div style="font-weight:500;font-size:0.9em;margin-bottom:4px;">${exp.company || ''}</div>
        <ul style="margin:0;padding-left:20px;font-size:0.9em;">
          ${(exp.description || []).map(d => `<li>${d}</li>`).join('')}
        </ul>
      </div>
    `).join('') || '';
    html = html.replace(/\{\{experience\}\}/gi, expHtml);

    // For Education
    const eduHtml = resume.education?.map(edu => `
      <div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
           <strong>${edu.institution || ''}</strong>
           <span style="font-size:0.85em;color:#666;">${edu.year || ''}</span>
        </div>
        <div style="font-weight:500;font-size:0.9em;margin-bottom:4px;">${edu.degree || ''}</div>
      </div>
    `).join('') || '';
    html = html.replace(/\{\{education\}\}/gi, eduHtml);

    return <div dangerouslySetInnerHTML={{ __html: html }} className="prose max-w-none w-full h-full pb-8" />;
  }

  // Fallback to the built-in minimal template if no HTML template
  return (
    <div className="w-full">
      <div className="border-b-2 border-black pb-4 mb-4 flex items-center space-x-6">
        {resume.profilePhoto && (
          <img src={resume.profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" />
        )}
        <div>
          <h1 className="text-4xl font-serif font-bold uppercase tracking-wider">{resume.name}</h1>
          <p className="text-xl text-gray-700 mt-1">{resume.role}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm leading-relaxed">{resume.summary}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 mb-3 pb-1">Experience</h2>
        <div className="space-y-4">
          {resume.experience?.map((exp, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-900">{exp.role}</h3>
                <span className="text-xs font-medium text-gray-500">{exp.startDate} - {exp.endDate}</span>
              </div>
              <p className="font-medium text-sm text-gray-700 mb-2">{exp.company}</p>
              <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                {exp.description?.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 mb-3 pb-1">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {resume.skills?.map((skill, idx) => (
            <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-semibold rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
