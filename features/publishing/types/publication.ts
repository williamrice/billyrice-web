export const PublicationStatus = {
  Draft: "DRAFT",
  Published: "PUBLISHED",
} as const;

export type PublicationStatus =
  (typeof PublicationStatus)[keyof typeof PublicationStatus];

export const publicationStatusOptions = [
  { value: PublicationStatus.Draft, label: "Draft" },
  { value: PublicationStatus.Published, label: "Published" },
] as const;
