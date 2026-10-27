/** Keep the active case in the globe's map placard unless a different case is hovered. */
export function resolveMapPlacard<T extends { id: string }>(
  selected: T | null,
  hovered: T | null
): { incident: T; isPreview: boolean } | null {
  const incident = hovered ?? selected;
  if (!incident) return null;

  return {
    incident,
    isPreview: hovered !== null && hovered.id !== selected?.id,
  };
}
