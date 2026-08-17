# ADR 0007: Use Monaco with Mermaid-native diagnostics

## Status

Accepted

## Context

The public Mermaid workbench needs source highlighting, precise error feedback,
completion suggestions, and a resizable workspace. Mermaid does not publish a
production-ready language server. Independent language-server implementations
remain experimental, while available CodeMirror Mermaid grammars cover only a
subset of the diagram types supported by the installed Mermaid release.

## Decision

Use Monaco as a client-only editor and keep Mermaid's parser and renderer as the
syntax authority. Adapt the MIT-licensed Mermaid Live Editor Monarch tokenizer
for highlighting. Convert Mermaid parser locations into Monaco model markers,
and provide curated local snippets for diagram starters and common keywords.
Do not present these suggestions as a full language server.

Load Monaco only from Mermaid routes. Bundle the npm package locally and copy
its versioned editor worker to an application-owned public path during install,
development, and production builds. Do not load editor code or workers from a
CDN.

Use `react-resizable-panels` for the desktop source/preview workspace. Store a
validated, versioned layout locally, while keeping the smaller-screen layout
stacked and expanded.

The rendering boundary from ADR 0006 is unchanged: Mermaid runs with strict,
locked configuration and no interaction callbacks. Monaco performs editing and
presentation only; it does not render diagrams or accept arbitrary Mermaid
configuration.

## Consequences

- Mermaid routes have a larger client payload, isolated behind a dynamic editor
  import.
- Diagnostics report the first parser error because that is what Mermaid
  exposes reliably.
- Completion covers supported starters and common contexts, but not semantic
  navigation, rename, hover, or formatting.
- Monaco and Mermaid upgrades require editor-worker, parser-location, rendering,
  and production-build regression checks.
