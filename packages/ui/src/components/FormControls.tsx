import React from "react";
import { AlertCircle } from "lucide-react";

// Work around cross-package @types/react mismatches by treating icons as ElementType
const IconAlertCircle: React.ElementType = (AlertCircle as unknown as React.ElementType);

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  helpText?: string;
}

export const FormField = ({ label, required, error, children, helpText }: FormFieldProps) => (
  <div>
    <label className="block text-sm font-semibold text-slate-900 mb-2.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div>{children}</div>
    {error && (
      <div className="flex items-start gap-2 mt-2">
        <IconAlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-red-600">{error}</p>
      </div>
    )}
    {helpText && !error && <p className="text-xs text-slate-500 mt-2">{helpText}</p>}
  </div>
);

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  error?: boolean;
  variant?: "primary" | "default";
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ error, disabled, variant = "default", ...props }: TextInputProps, ref: React.ForwardedRef<HTMLInputElement>) => (
    <input
      ref={ref}
      disabled={disabled}
      {...props}
      className={`w-full px-4 py-3 rounded-lg transition-all ${variant === "primary" ? "text-base font-semibold" : "text-sm font-medium"}
        ${
          error
            ? "bg-red-50 text-slate-900 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            : variant === "primary"
              ? "bg-emerald-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              : "bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        }
        ${disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50" : ""}
      `}
    />
  )
);
TextInput.displayName = "TextInput";

export interface SelectInputProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  error?: boolean;
  children: React.ReactNode;
}

export const SelectInput = React.forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ error, disabled, children, ...props }: SelectInputProps, ref: React.ForwardedRef<HTMLSelectElement>) => (
  <select
    ref={ref}
    disabled={disabled}
    {...props}
    className={`w-full px-4 py-3 rounded-lg transition-all text-sm font-medium appearance-none bg-right
      ${
        error
          ? "bg-red-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          : "bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      }
      ${disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50" : ""}
    `}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23334155' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 0.75rem center",
      backgroundSize: "16px 16px",
      paddingRight: "2.5rem",
    }}
  >
    {children}
  </select>
  )
);
SelectInput.displayName = "SelectInput";

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  error?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, disabled, ...props }: TextAreaProps, ref: React.ForwardedRef<HTMLTextAreaElement>) => (
  <textarea
    ref={ref}
    disabled={disabled}
    {...props}
    className={`w-full px-4 py-3 rounded-lg transition-all text-sm font-medium resize-none
      ${
        error
          ? "bg-red-50 text-slate-900 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          : "bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      }
      ${disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50" : ""}
    `}
  />
  )
);
TextArea.displayName = "TextArea";
