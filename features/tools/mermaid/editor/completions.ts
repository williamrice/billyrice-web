export type MermaidCompletion = {
  label: string;
  detail: string;
  insertText: string;
};

export const mermaidStarterCompletions: MermaidCompletion[] = [
  { label: "flowchart", detail: "Flowchart", insertText: "flowchart LR\n    ${1:A}[${2:Start}] --> ${3:B}[${4:Finish}]" },
  { label: "sequenceDiagram", detail: "Sequence diagram", insertText: "sequenceDiagram\n    participant ${1:A}\n    participant ${2:B}\n    ${1:A}->>${2:B}: ${3:Message}" },
  { label: "classDiagram", detail: "Class diagram", insertText: "classDiagram\n    class ${1:Example} {\n        +${2:method}()\n    }" },
  { label: "stateDiagram-v2", detail: "State diagram", insertText: "stateDiagram-v2\n    [*] --> ${1:Active}\n    ${1:Active} --> [*]" },
  { label: "erDiagram", detail: "Entity relationship diagram", insertText: "erDiagram\n    ${1:CUSTOMER} ||--o{ ${2:ORDER} : places" },
  { label: "journey", detail: "User journey", insertText: "journey\n    title ${1:Journey}\n    section ${2:Step}\n      ${3:Action}: 5: ${4:User}" },
  { label: "gantt", detail: "Gantt chart", insertText: "gantt\n    title ${1:Plan}\n    dateFormat YYYY-MM-DD\n    section ${2:Work}\n    ${3:Task} :${4:2026-01-01}, ${5:7d}" },
  { label: "pie", detail: "Pie chart", insertText: "pie showData\n    title ${1:Breakdown}\n    \"${2:One}\" : ${3:60}\n    \"${4:Two}\" : ${5:40}" },
  { label: "quadrantChart", detail: "Quadrant chart", insertText: "quadrantChart\n    title ${1:Priorities}\n    x-axis ${2:Low} --> ${3:High}\n    y-axis ${4:Low} --> ${5:High}\n    ${6:Item}: [0.5, 0.5]" },
  { label: "requirementDiagram", detail: "Requirement diagram", insertText: "requirementDiagram\n    requirement ${1:example} {\n        id: ${2:1}\n        text: ${3:Requirement}\n        risk: low\n        verifymethod: test\n    }" },
  { label: "gitGraph", detail: "Git graph", insertText: "gitGraph\n    commit\n    branch ${1:feature}\n    checkout ${1:feature}\n    commit" },
  { label: "mindmap", detail: "Mind map", insertText: "mindmap\n  root((${1:Topic}))\n    ${2:Branch}\n      ${3:Detail}" },
  { label: "timeline", detail: "Timeline", insertText: "timeline\n    title ${1:History}\n    ${2:2026} : ${3:Event}" },
  { label: "zenuml", detail: "ZenUML sequence diagram", insertText: "zenuml\n    @Actor ${1:User}\n    ${1:User}->${2:System}: ${3:Request}" },
  { label: "sankey-beta", detail: "Sankey diagram", insertText: "sankey-beta\n${1:Source},${2:Target},${3:10}" },
  { label: "xychart-beta", detail: "XY chart", insertText: "xychart-beta\n    title \"${1:Chart}\"\n    x-axis [${2:1, 2, 3}]\n    line [${3:2, 4, 3}]" },
  { label: "block-beta", detail: "Block diagram", insertText: "block-beta\n    columns 2\n    ${1:A}[\"${2:Start}\"]\n    ${3:B}[\"${4:Finish}\"]\n    ${1:A} --> ${3:B}" },
  { label: "packet-beta", detail: "Packet diagram", insertText: "packet-beta\n    0-7: \"${1:Header}\"\n    8-15: \"${2:Payload}\"" },
  { label: "kanban", detail: "Kanban board", insertText: "kanban\n  ${1:todo}[${2:Todo}]\n    ${3:item}[${4:Task}]" },
  { label: "architecture-beta", detail: "Architecture diagram", insertText: "architecture-beta\n    service ${1:api}(server)[${2:API}]" },
  { label: "radar-beta", detail: "Radar chart", insertText: "radar-beta\n    axis ${1:a}[${2:Quality}]\n    curve ${3:item}[${4:Item}] { ${1:a}: ${5:5} }" },
  { label: "treemap-beta", detail: "Treemap", insertText: "treemap-beta\n\"${1:Group}\"\n  \"${2:Item}\": ${3:10}" },
  { label: "C4Context", detail: "C4 context diagram", insertText: "C4Context\n    Person(${1:user}, \"${2:User}\")\n    System(${3:system}, \"${4:System}\")\n    Rel(${1:user}, ${3:system}, \"${5:Uses}\")" },
];

const commonCompletions: MermaidCompletion[] = [
  { label: "title", detail: "Diagram title", insertText: "title ${1:Diagram title}" },
  { label: "accTitle", detail: "Accessible title", insertText: "accTitle: ${1:Diagram title}" },
  { label: "accDescr", detail: "Accessible description", insertText: "accDescr: ${1:Describe the diagram}" },
  { label: "comment", detail: "Comment", insertText: "%% ${1:Comment}" },
];

const contextualCompletions: Record<string, MermaidCompletion[]> = {
  flowchart: ["subgraph", "direction", "classDef", "click"].map((label) => ({ label, detail: "Flowchart keyword", insertText: `${label} \${1}` })),
  sequenceDiagram: ["participant", "actor", "loop", "alt", "opt", "par", "critical", "break", "rect", "note"].map((label) => ({ label, detail: "Sequence keyword", insertText: `${label} \${1}` })),
  classDiagram: ["class", "namespace", "direction", "note"].map((label) => ({ label, detail: "Class keyword", insertText: `${label} \${1}` })),
  "stateDiagram-v2": ["state", "direction", "note", "choice", "fork", "join"].map((label) => ({ label, detail: "State keyword", insertText: `${label} \${1}` })),
  erDiagram: [{ label: "entity", detail: "ER entity", insertText: "${1:ENTITY} {\n    string ${2:id}\n}" }],
  gantt: ["dateFormat", "axisFormat", "section", "excludes", "todayMarker"].map((label) => ({ label, detail: "Gantt keyword", insertText: `${label} \${1}` })),
};

export function getMermaidCompletions(source: string) {
  const firstLine = source.split("\n").find((line) => line.trim() && !line.trim().startsWith("%%"))?.trim();
  if (!firstLine) return mermaidStarterCompletions;
  const alias = firstLine.startsWith("graph ")
    ? "flowchart"
    : firstLine === "stateDiagram" ? "stateDiagram-v2" : undefined;
  const type = alias ?? Object.keys(contextualCompletions).find((candidate) => firstLine.startsWith(candidate));
  return [...commonCompletions, ...(type ? contextualCompletions[type] : [])];
}
