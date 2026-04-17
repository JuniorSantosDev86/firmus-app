export type PrivacySurfaceLevel = "public" | "internal" | "sensitive";

export type PrivacyDataSurface = {
  id: string;
  area: string;
  level: PrivacySurfaceLevel;
  processingPurpose: string;
};

export type PrivacyFoundationStatus = {
  version: string;
  lastReviewedAt: string | null;
  retentionPolicyDefined: boolean;
  dsrProcessPrepared: boolean;
  incidentResponsePrepared: boolean;
  legalBasisDocumented: boolean;
  dataSurfaces: PrivacyDataSurface[];
};
