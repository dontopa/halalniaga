/**
 * Ubiquitous language for HALALNiaga.
 *
 * The domain is deliberately small: a Vendor maintains a record of Purchases
 * from Suppliers, completes Training, performs self-Assessments, and earns a
 * programme Tier. "Certified" always refers to an actual halal certificate
 * held by a supplier or product — never to the programme itself.
 */

export type HalalStatus = 'certified' | 'verified' | 'pending' | 'expired';

export type Tier = 'learner' | 'verified' | 'monitored';

export type Area =
  | 'Kota Kinabalu'
  | 'Sandakan'
  | 'Tawau'
  | 'Keningau'
  | 'Lahad Datu';

export type SupplierCategory =
  | 'Poultry & meat'
  | 'Seafood'
  | 'Dry goods'
  | 'Produce'
  | 'Dairy & eggs'
  | 'Sauces & condiments';

export interface Supplier {
  id: string;
  name: string;
  shortName: string;
  area: Area;
  address: string;
  categories: SupplierCategory[];
  distanceKm: number;
  status: HalalStatus;
  certificateNo: string | null;
  issuedOn: string | null;
  validUntil: string | null;
  rating: number;
  reviewCount: number;
  tags: string[];
  accent: string;
  image?: string;
  lat?: number;
  lng?: number;
  manual?: boolean;
  sourceNote?: string;
}

export interface Product {
  id: string;
  supplierId: string;
  name: string;
  category: SupplierCategory;
  unit: string;
  price: number;
  halalStatus: HalalStatus;
  barcode: string;
  certificateRef: string | null;
}

export interface Purchase {
  id: string;
  supplierId: string;
  productId: string;
  quantity: number;
  unit: string;
  amount: number;
  purchasedAt: string;
  receiptNo: string;
  verifiedSource: boolean;
  evidencePhoto?: string;
  halalStampSeen?: boolean;
  sourceNote?: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface TrainingModule {
  id: string;
  order: number;
  title: string;
  summary: string;
  durationMin: number;
  topics: string[];
  quiz: QuizQuestion[];
}

export interface TrainingProgress {
  moduleId: string;
  completedAt: string | null;
  bestScore: number | null;
  attempts: number;
}

export type AssessmentValue = 'yes' | 'partial' | 'no' | 'na';

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  help: string;
  weight: number;
  critical?: boolean;
}

export interface AssessmentRecord {
  id: string;
  completedAt: string;
  answers: Record<string, AssessmentValue>;
  score: number;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertKind =
  | 'certificate'
  | 'assessment'
  | 'supplier'
  | 'training';

export interface HalalAlert {
  id: string;
  severity: AlertSeverity;
  kind: AlertKind;
  title: string;
  detail: string;
  dueAt: string | null;
  resolvedAt: string | null;
}

export interface Inspection {
  id: string;
  inspectedAt: string;
  officer: string;
  score: number;
  findings: string[];
  passed: boolean;
}

export interface VendorProfile {
  id: string;
  name: string;
  owner: string;
  stall: string;
  area: Area;
  category: string;
  tagline: string;
  coverImage: string;
  joinedAt: string;
  qrSlug: string;
  phone: string;
  inspections: Inspection[];
}

export interface CommunityPost {
  id: string;
  author: string;
  role: string;
  area: Area;
  body: string;
  createdAt: string;
  likes: number;
}

export interface MentorMessage {
  id: string;
  role: 'mentor' | 'vendor';
  body: string;
  sentAt: string;
}

export interface AppState {
  vendor: VendorProfile;
  suppliers: Supplier[];
  products: Product[];
  purchases: Purchase[];
  training: TrainingProgress[];
  assessments: AssessmentRecord[];
  posts: CommunityPost[];
  mentorMessages: MentorMessage[];
  savedSupplierIds: string[];
  dismissedAlerts: string[];
}

export interface ComplianceSnapshot {
  score: number;
  tier: Tier;
  nextTier: Tier | null;
  trainingPct: number;
  sourcingPct: number;
  assessmentPct: number;
  monitoringPct: number;
  modulesCompleted: number;
  modulesTotal: number;
  verifiedPurchaseShare: number;
  latestAssessment: AssessmentRecord | null;
  latestInspection: Inspection | null;
  gaps: string[];
  tierProgress: number;
}

export const TIER_META: Record<
  Tier,
  { label: string; short: string; blurb: string; accent: string }
> = {
  learner: {
    label: 'HALALNiaga Participant',
    short: 'Participant',
    blurb: 'Core halal training completed and assessed.',
    accent: 'sky',
  },
  verified: {
    label: 'HALALNiaga Verification',
    short: 'Verification',
    blurb: 'Training, verified sourcing and self-assessment in place.',
    accent: 'emerald',
  },
  monitored: {
    label: 'HALALNiaga Monitoring',
    short: 'Monitoring',
    blurb: 'Independently inspected and re-assessed on a rolling cycle.',
    accent: 'amber',
  },
};
