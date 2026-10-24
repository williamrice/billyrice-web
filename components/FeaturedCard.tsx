export const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col p-4 bg-accent rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-4 mb-3">
        <div className="bg-primary/15 p-3 rounded-full text-primary shrink-0">
          {icon}
        </div>
        <h4 className="text-lg font-semibold text-foreground">{title}</h4>
      </div>
      <p className="text-muted-foreground text-left">{description}</p>
    </div>
  );
};
