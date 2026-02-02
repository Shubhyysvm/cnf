import React from "react";

export interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
}

export const PrimaryCard = ({ children, className = "" }: AdminCardProps) => (
  <div className={`rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow ${className}`}>{children}</div>
);

export const SecondaryCard = ({ children, className = "" }: AdminCardProps) => (
  <div className={`rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow ${className}`}>{children}</div>
);

export const MetaCard = ({ children, className = "" }: AdminCardProps) => (
  <div className={`rounded-lg bg-white shadow ${className}`}>{children}</div>
);
