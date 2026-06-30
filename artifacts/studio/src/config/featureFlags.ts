export const featureFlags = {
  publicHomepage: true,
  studioShell: true,
  statusPage: true,
  proofDashboard: true,
  proofStudioDraft: true,

  realChainReads: false,
  membershipLive: false,
  sourceRegistryLive: false,
  recognitionLive: false,
  founderControls: false,
  adminTogglesFuture: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export const isEnabled = (flag: FeatureFlag): boolean => featureFlags[flag];
