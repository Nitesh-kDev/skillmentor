import React from 'react';
import { X, ExternalLink, Code, CheckCircle2 } from 'lucide-react';

export default function OpenApiDocsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const swaggerUrl = import.meta.env.VITE_SWAGGER_URL || (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '/swagger-ui.html') : 'http://localhost:8080/swagger-ui.html');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[700px]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800">SkillMentor OpenAPI / Swagger Docs</h3>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={swaggerUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Swagger UI iframe */}
        <div className="flex-1 bg-slate-100">
          <iframe
            src={swaggerUrl}
            title="Swagger UI API Docs"
            className="w-full h-full border-none"
          />
        </div>

      </div>
    </div>
  );
}
