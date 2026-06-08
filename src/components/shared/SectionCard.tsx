import React from 'react';
export default function SectionCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
      <h2 className="text-lg font-semibold text-main mb-4">{title}</h2>
      {children}
    </div>
  );
}
