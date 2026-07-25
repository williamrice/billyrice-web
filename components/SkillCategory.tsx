import { Skill } from "@/lib/types";

export const SkillCategory = ({
  title,
  skills,
}: {
  title: string;
  skills: Skill[];
}) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-700">
      <div className="bg-blue-800 text-white text-center py-3">
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <div className="p-6 flex flex-wrap justify-center gap-2">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="flex min-w-20 flex-col items-center gap-2 rounded-lg border border-gray-600 bg-gray-900 p-3 text-gray-200 transition-colors hover:border-blue-500 hover:text-blue-300"
          >
            <skill.icon className="size-7" aria-hidden="true" />
            <span className="text-center text-xs font-medium">{skill.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
