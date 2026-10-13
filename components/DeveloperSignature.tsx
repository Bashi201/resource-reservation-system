import React from "react";
import { ExternalLink, Sparkles, Code2 } from "lucide-react";

export function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

interface DeveloperSignatureProps {
  variant?: "footer" | "sidebar" | "login" | "card";
  isCollapsed?: boolean;
  className?: string;
}

export function DeveloperSignature({
  variant = "footer",
  isCollapsed = false,
  className = "",
}: DeveloperSignatureProps) {
  const GITHUB_URL = "https://github.com/Bashi201";
  const DEVELOPER_NAME = "Bhashitha Wanasinghe";

  // 1. Sidebar variant
  if (variant === "sidebar") {
    if (isCollapsed) {
      return (
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          title={`Developed by ${DEVELOPER_NAME} (GitHub)`}
          className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200/80 hover:border-indigo-200 transition-all duration-200 group ${className}`}
        >
          <GitHubIcon className="w-4 h-4 text-slate-700 group-hover:text-indigo-600 transition-colors" />
        </a>
      );
    }

    return (
      <div
        className={`p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/80 hover:border-indigo-200/90 transition-all duration-200 group/sig shadow-2xs ${className}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <Code2 className="w-3 h-3 text-indigo-500" />
            <span>Developer</span>
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/60">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Author</span>
          </span>
        </div>

        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between group text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
          title={`Visit ${DEVELOPER_NAME}'s GitHub Profile`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-indigo-600 transition-colors">
              <GitHubIcon className="w-3.5 h-3.5" />
            </div>
            <span className="truncate text-[12px]">{DEVELOPER_NAME}</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-600 shrink-0 transition-colors" />
        </a>
      </div>
    );
  }

  // 2. Login Page footer variant (dark / glassmorphic context)
  if (variant === "login") {
    return (
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-medium backdrop-blur-xs transition-all duration-200 group ${className}`}
        title={`Developed by ${DEVELOPER_NAME}`}
      >
        <GitHubIcon className="w-3.5 h-3.5 text-blue-200 group-hover:text-white transition-colors" />
        <span className="text-[11px] sm:text-xs">
          Developed by <strong className="font-bold text-white">{DEVELOPER_NAME}</strong>
        </span>
        <ExternalLink className="w-3 h-3 text-blue-300 group-hover:text-white transition-colors" />
      </a>
    );
  }

  // 3. Diagnostics & Settings Card variant
  if (variant === "card") {
    return (
      <div
        className={`bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 rounded-2xl p-6 border border-indigo-100/80 shadow-xs space-y-4 ${className}`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-indigo-100/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <GitHubIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Lead Software Engineer &amp; Architect
              </h3>
              <p className="text-xs text-indigo-700 font-medium">
                Full-Stack Technical Assessment
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            <Sparkles className="w-3 h-3" />
            <span>Author Signature</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Developed By
            </span>
            <span className="text-base font-extrabold text-slate-900">
              {DEVELOPER_NAME}
            </span>
          </div>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-indigo-600 text-white shadow-xs transition-all duration-200 group cursor-pointer"
          >
            <GitHubIcon className="w-4 h-4" />
            <span>View GitHub Profile</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-colors" />
          </a>
        </div>
      </div>
    );
  }

  // 4. Default Universal Footer variant (AppShell)
  return (
    <div className={`inline-flex items-center gap-2 text-xs text-slate-500 ${className}`}>
      <span>Developed by</span>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-bold text-slate-800 hover:text-indigo-600 bg-slate-100/80 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 px-2.5 py-1 rounded-lg transition-all duration-200 group shadow-2xs"
        title={`Visit ${DEVELOPER_NAME}'s GitHub`}
      >
        <GitHubIcon className="w-3.5 h-3.5 text-slate-700 group-hover:text-indigo-600 transition-colors" />
        <span>{DEVELOPER_NAME}</span>
        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
      </a>
    </div>
  );
}
