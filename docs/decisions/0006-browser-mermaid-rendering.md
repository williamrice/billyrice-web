# ADR 0006: Render Mermaid diagrams in the browser

## Status

Accepted

## Context

The public tools area needs an interactive Mermaid source editor, immediate
preview, and portable source/SVG exports. Sending arbitrary diagram source to a
server-side browser or image-rendering service would add a second execution
boundary, operational dependencies, and a larger abuse surface.

Saved diagrams are owner-authored application content, but anonymous visitors
must be able to use the renderer without creating database records. Public
sharing must not expose private diagrams or revision history.

## Decision

Import Mermaid only from the client editor and render with `mermaid.render`.
Initialize it with automatic startup disabled, strict security, locked security
configuration, bounded source and edge counts, and suppressed error rendering.
Do not bind Mermaid's optional interaction callbacks. The strict renderer's
sanitized SVG is the only markup inserted into the preview and exported.

Store anonymous working state in versioned browser local storage. Persist only
through owner-authorized server actions. PostgreSQL stores the current diagram,
immutable full revisions, and former-slug redirects. Optimistic revision
numbers prevent silent overwrites from multiple tabs.

Public shared URLs expose the current saved source as an editable local copy.
They are `noindex` and do not expose history. Private records resolve only for
the owner.

## Consequences

- Preview and export require JavaScript, but the tool needs browser interaction
  by definition.
- The application does not need Puppeteer, a worker, or an image-rendering API.
- PNG/PDF export and collaborative editing remain out of scope.
- Mermaid upgrades require rerunning malicious-input, rendering, and export
  regression tests because the sanitizer and diagram parsers are part of the
  security boundary.
