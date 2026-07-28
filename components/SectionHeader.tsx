interface SectionHeaderProps {
  title: string;
  className?: string;
}

export default function SectionHeader({
  title,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`mb-4 flex flex-col items-center ${className}`}>
      <h2 className="mb-1 text-4xl font-bold text-white">{title}</h2>
      <div className="h-1 w-20 bg-blue-600" />
    </div>
  );
}
