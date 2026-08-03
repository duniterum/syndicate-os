// lib/clipboard.ts — ONE copy path, ONE honest answer.
//
// Two silent-failure shapes were shipping side by side (2026-08-03 seven-hat
// audit): `navigator.clipboard?.writeText(…)` short-circuits past .then AND
// .catch when the API is absent — an embedded webview withholding it — and an
// empty `.catch(() => {})` swallows every refusal. Both end in a dead click:
// the member presses Copy and NOTHING happens or is said.
//
// This helper answers TRUE or FALSE for both shapes, so a caller can always
// say something honest. The discipline was first written inline in
// AddSynToWallet; this is its one authority (TWIN SEARCH).
//
// SCOPE, stated: adopted by the surfaces this session owns (ShareSurface,
// PressKit, AddSynToWallet). The ~12 pre-session `navigator.clipboard?.`
// call sites are a separate, deliberate sweep — they are NOT silently
// changed here.

export async function copyText(value: string): Promise<boolean> {
  const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
  if (!clipboard) return false;
  try {
    await clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
