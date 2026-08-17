import type * as Monaco from "monaco-editor";
import { getMermaidCompletions } from "./completions";

export const MERMAID_LANGUAGE_ID = "mermaid";

let registered = false;

// Adapted from the MIT-licensed Mermaid Live Editor Monaco language support:
// https://github.com/mermaid-js/mermaid-live-editor/blob/master/src/lib/util/monacoExtra.ts
export function registerMermaidLanguage(monaco: typeof Monaco) {
  if (registered) return;
  registered = true;

  monaco.languages.register({ id: MERMAID_LANGUAGE_ID });
  monaco.languages.setLanguageConfiguration(MERMAID_LANGUAGE_ID, {
    comments: { lineComment: "%%" },
    brackets: [["{", "}"], ["[", "]"], ["(", ")"]],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
    ],
  });
  monaco.languages.setMonarchTokensProvider(MERMAID_LANGUAGE_ID, {
    ignoreCase: false,
    tokenizer: {
      root: [
        [/^\s*%%.*$/, "comment"],
        [/^\s*(?:flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|quadrantChart|requirementDiagram|gitGraph|C4\w+|mindmap|timeline|zenuml|sankey-beta|xychart-beta|block-beta|packet-beta|kanban|architecture-beta|radar-beta|treemap-beta)\b/, "type.identifier"],
        [/\b(?:subgraph|end|direction|participant|actor|loop|alt|else|opt|par|and|critical|option|break|rect|note|class|namespace|state|section|dateFormat|axisFormat|excludes|todayMarker|title|accTitle|accDescr|requirement|element|relationship|service|group|junction)\b/, "keyword"],
        [/(?:-->|---|-.->|==>|--x|--o|->>|-->>|-x|-\)|\|--|\}o|\|o|o\{)/, "operator"],
        [/"(?:[^"\\]|\\.)*"/, "string"],
        [/\b\d+(?:\.\d+)?\b/, "number"],
        [/[{}()[\]]/, "delimiter.bracket"],
        [/[A-Za-z_][\w-]*/, "identifier"],
      ],
    },
  });
  monaco.languages.registerCompletionItemProvider(MERMAID_LANGUAGE_ID, {
    triggerCharacters: [" ", ":"],
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      const documentIsBlank = !model.getValue().trim();
      return {
        suggestions: getMermaidCompletions(model.getValue()).map((completion) => ({
          label: completion.label,
          detail: completion.detail,
          kind: documentIsBlank
            ? monaco.languages.CompletionItemKind.Snippet
            : monaco.languages.CompletionItemKind.Keyword,
          insertText: completion.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        })),
      };
    },
  });
}
