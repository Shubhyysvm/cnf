import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

// Work around cross-package @types/react mismatches by treating icons as ElementType
const IconChevronDown: React.ElementType = (ChevronDown as unknown as React.ElementType);
const IconChevronRight: React.ElementType = (ChevronRight as unknown as React.ElementType);

export interface AdminSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  collapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  variant?: "primary" | "secondary" | "meta";
  summaryContent?: React.ReactNode;
}

export const AdminSection = ({
  title,
  description,
  children,
  action,
  collapsible,
  isOpen,
  onToggle,
  variant = "secondary",
  summaryContent,
}: AdminSectionProps) => {
  const headerBg = variant === "primary" ? "bg-white" : variant === "secondary" ? "bg-slate-50" : "bg-white";
  const contentPadding = variant === "primary" ? "py-8" : "py-6";
  const contentId = `section-content-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;

  const toggleWithKeys = (e: { key: string; preventDefault: () => void }) => {
    if (!onToggle) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <>
      <div className={`${headerBg} px-8 py-6 flex items-center justify-between rounded-t-xl`}>
        <div className="flex items-start gap-3 min-w-0">
          {collapsible && (
            <button
              type="button"
              aria-label={isOpen ? "Collapse section" : "Expand section"}
              aria-controls={contentId}
              aria-expanded={!!isOpen}
              onClick={onToggle}
              onKeyDown={toggleWithKeys}
              className="p-1.5 rounded-md hover:bg-emerald-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {isOpen ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h3 className={`${variant === "primary" ? "text-xl" : "text-lg"} font-semibold text-slate-900 truncate`}>{title}</h3>
            {description && <p className="text-sm text-slate-600 mt-1 truncate">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {summaryContent && collapsible && isOpen === false && (
            <div className="hidden sm:block text-sm text-slate-500 truncate max-w-[280px]">{summaryContent}</div>
          )}
          {action && <div className="hidden sm:block">{action}</div>}
        </div>
      </div>
      {(!collapsible || isOpen) && (
        <div id={contentId} className={`px-8 ${contentPadding} bg-white`}>
          {children}
        </div>
      )}
    </>
  );
};
