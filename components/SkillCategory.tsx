import { Skill } from "@/lib/types";

export const SkillCategory = ({
  title,
  skills,
}: {
  title: string;
  skills: Skill[];
}) => {
  return (
    <div className="bg-secondary rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-border">
      <div className="bg-primary-emphasis text-primary-foreground text-center py-3">
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <div className="p-6 flex flex-wrap justify-center gap-2">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="flex min-w-20 flex-col items-center gap-2 rounded-lg border border-border bg-card p-3 text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <skill.icon className="size-7" aria-hidden="true" />
            <span className="text-center text-xs font-medium">{skill.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
