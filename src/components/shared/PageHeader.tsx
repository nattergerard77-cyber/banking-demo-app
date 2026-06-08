interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-main">{title}</h1>
      {description && <p className="text-text-secondary mt-1">{description}</p>}
    </div>
  );
}
