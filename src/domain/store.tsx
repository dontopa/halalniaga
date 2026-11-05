import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { scoreAssessment } from './compliance';
import { getActiveLang } from '@/i18n/lang';
import {
  ASSESSMENT_QUESTIONS,
  createInitialState,
  TRAINING_MODULES,
} from './seed';
import type {
  AppState,
  Area,
  AssessmentValue,
  Product,
  Purchase,
  Supplier,
  SupplierCategory,
  TrainingProgress,
} from './types';

const STORAGE_KEY = 'halalniaga.state.v1';

const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = createInitialState();
    // Merge so a state saved by an older build still boots with new seed data.
    return {
      ...base,
      ...parsed,
      vendor: { ...base.vendor, ...parsed.vendor },
    };
  } catch {
    return createInitialState();
  }
};

const persist = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable in private mode; the demo still works in memory.
  }
};

interface AppContextValue {
  state: AppState;
  completeQuiz: (moduleId: string, score: number) => void;
  addPurchase: (input: {
    supplierId: string;
    productId: string;
    quantity: number;
    receiptNo?: string;
    purchasedAt?: string;
    evidencePhoto?: string;
    halalStampSeen?: boolean;
    sourceNote?: string;
  }) => void;
  addManualPurchase: (input: {
    supplierName: string;
    area: Area;
    address: string;
    productName: string;
    category: SupplierCategory;
    unit: string;
    price: number;
    quantity: number;
    receiptNo?: string;
    evidencePhoto?: string;
    halalStampSeen?: boolean;
    sourceNote?: string;
  }) => void;
  submitAssessment: (answers: Record<string, AssessmentValue>) => number;
  dismissAlert: (alertId: string) => void;
  toggleSavedSupplier: (supplierId: string) => void;
  addPost: (body: string) => void;
  sendMentorMessage: (body: string) => void;
  recordInspection: () => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    persist(state);
  }, [state]);

  const completeQuiz = useCallback((moduleId: string, score: number) => {
    const module = TRAINING_MODULES.find((m) => m.id === moduleId);
    if (!module) return;
    setState((current) => {
      const existing = current.training.find((t) => t.moduleId === moduleId);
      const passed = score >= 80;
      const updated: TrainingProgress = existing
        ? {
            ...existing,
            attempts: existing.attempts + 1,
            bestScore: Math.max(existing.bestScore ?? 0, score),
            completedAt:
              passed && !existing.completedAt
                ? new Date().toISOString()
                : existing.completedAt,
          }
        : {
            moduleId,
            attempts: 1,
            bestScore: score,
            completedAt: passed ? new Date().toISOString() : null,
          };
      return {
        ...current,
        training: existing
          ? current.training.map((t) =>
              t.moduleId === moduleId ? updated : t,
            )
          : [...current.training, updated],
      };
    });
  }, []);

  const addPurchase = useCallback(
    (input: {
      supplierId: string;
      productId: string;
      quantity: number;
      receiptNo?: string;
      purchasedAt?: string;
      evidencePhoto?: string;
      halalStampSeen?: boolean;
      sourceNote?: string;
    }) => {
      setState((current) => {
        const supplier = current.suppliers.find(
          (s) => s.id === input.supplierId,
        );
        const product = current.products.find(
          (p) => p.id === input.productId,
        );
        if (!supplier || !product) return current;
        const now = new Date();
        const purchase: Purchase = {
          id: `pur-${now.getTime()}`,
          supplierId: supplier.id,
          productId: product.id,
          quantity: input.quantity,
          unit: product.unit,
          amount: Math.round(product.price * input.quantity * 100) / 100,
          purchasedAt: input.purchasedAt ?? now.toISOString(),
          receiptNo:
            input.receiptNo?.trim() ||
            `HN-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(
              current.purchases.length + 1,
            ).padStart(3, '0')}`,
          verifiedSource:
            supplier.status === 'certified' || supplier.status === 'verified',
          evidencePhoto: input.evidencePhoto,
          halalStampSeen: input.halalStampSeen,
          sourceNote: input.sourceNote,
        };
        return {
          ...current,
          purchases: [purchase, ...current.purchases],
        };
      });
    },
    [],
  );

  const addManualPurchase = useCallback(
    (input: {
      supplierName: string;
      area: Area;
      address: string;
      productName: string;
      category: SupplierCategory;
      unit: string;
      price: number;
      quantity: number;
      receiptNo?: string;
      evidencePhoto?: string;
      halalStampSeen?: boolean;
      sourceNote?: string;
    }) => {
      setState((current) => {
        const now = new Date();
        const stamp = now.getTime();
        const supplierName = input.supplierName.trim();
        const productName = input.productName.trim();
        if (!supplierName || !productName) return current;

        const existingSupplier = current.suppliers.find(
          (supplier) =>
            supplier.manual &&
            supplier.area === input.area &&
            supplier.name.toLowerCase() === supplierName.toLowerCase(),
        );
        const supplier: Supplier = existingSupplier ?? {
          id: `sup-manual-${stamp}`,
          name: supplierName,
          shortName: supplierName.slice(0, 22),
          area: input.area,
          address: input.address.trim() || input.area,
          categories: [input.category],
          distanceKm: 0,
          status: 'pending',
          certificateNo: null,
          issuedOn: null,
          validUntil: null,
          rating: 0,
          reviewCount: 0,
          tags: ['Added by vendor'],
          accent: '#8a6a3f',
          manual: true,
          sourceNote: input.sourceNote,
        };
        const existingProduct = current.products.find(
          (item) =>
            item.supplierId === supplier.id &&
            item.name.toLowerCase() === productName.toLowerCase(),
        );
        const product: Product = existingProduct ?? {
          id: `prd-manual-${stamp}`,
          supplierId: supplier.id,
          name: productName,
          category: input.category,
          unit: input.unit,
          price: input.price,
          halalStatus: 'pending',
          barcode: '',
          certificateRef: null,
        };
        const purchase: Purchase = {
          id: `pur-${stamp}`,
          supplierId: supplier.id,
          productId: product.id,
          quantity: input.quantity,
          unit: input.unit,
          amount: Math.round(input.price * input.quantity * 100) / 100,
          purchasedAt: now.toISOString(),
          receiptNo:
            input.receiptNo?.trim() ||
            `HN-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(
              current.purchases.length + 1,
            ).padStart(3, '0')}`,
          verifiedSource: false,
          evidencePhoto: input.evidencePhoto,
          halalStampSeen: input.halalStampSeen,
          sourceNote: input.sourceNote,
        };
        return {
          ...current,
          suppliers: existingSupplier
            ? current.suppliers
            : [supplier, ...current.suppliers],
          products: existingProduct
            ? current.products
            : [product, ...current.products],
          purchases: [purchase, ...current.purchases],
        };
      });
    },
    [],
  );

  const submitAssessment = useCallback(
    (answers: Record<string, AssessmentValue>) => {
      const score = scoreAssessment(answers, ASSESSMENT_QUESTIONS);
      setState((current) => ({
        ...current,
        assessments: [
          {
            id: `asm-${Date.now()}`,
            completedAt: new Date().toISOString(),
            answers,
            score,
          },
          ...current.assessments,
        ],
      }));
      return score;
    },
    [],
  );

  const dismissAlert = useCallback((alertId: string) => {
    setState((current) =>
      current.dismissedAlerts.includes(alertId)
        ? current
        : {
            ...current,
            dismissedAlerts: [...current.dismissedAlerts, alertId],
          },
    );
  }, []);

  const toggleSavedSupplier = useCallback((supplierId: string) => {
    setState((current) => ({
      ...current,
      savedSupplierIds: current.savedSupplierIds.includes(supplierId)
        ? current.savedSupplierIds.filter((id) => id !== supplierId)
        : [...current.savedSupplierIds, supplierId],
    }));
  }, []);

  const addPost = useCallback((body: string) => {
    const text = body.trim();
    if (!text) return;
    setState((current) => ({
      ...current,
      posts: [
        {
          id: `post-${Date.now()}`,
          author: current.vendor.owner,
          role: `${getActiveLang() === 'ms' ? 'Peniaga' : 'Vendor'} · ${current.vendor.stall}`,
          area: current.vendor.area,
          body: text,
          createdAt: new Date().toISOString(),
          likes: 0,
        },
        ...current.posts,
      ],
    }));
  }, []);

  const sendMentorMessage = useCallback((body: string) => {
    const text = body.trim();
    if (!text) return;
    setState((current) => {
      const now = Date.now();
      const reply = mentorReply(text);
      return {
        ...current,
        mentorMessages: [
          ...current.mentorMessages,
          {
            id: `msg-${now}`,
            role: 'vendor',
            body: text,
            sentAt: new Date().toISOString(),
          },
          {
            id: `msg-${now + 1}`,
            role: 'mentor',
            body: reply,
            sentAt: new Date(now + 60_000).toISOString(),
          },
        ],
      };
    });
  }, []);

  const recordInspection = useCallback(() => {
    setState((current) => ({
      ...current,
      vendor: {
        ...current.vendor,
        inspections: [
          ...current.vendor.inspections,
          {
            id: `insp-${Date.now()}`,
            inspectedAt: new Date().toISOString(),
            officer: 'Hafiz Roslan, Programme Officer',
            score: 91,
            findings: [
              'One unlabelled container of prepped sambal in the chiller.',
            ],
            passed: true,
          },
        ],
      },
    }));
  }, []);

  const resetDemo = useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
    persist(fresh);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      completeQuiz,
      addPurchase,
      addManualPurchase,
      submitAssessment,
      dismissAlert,
      toggleSavedSupplier,
      addPost,
      sendMentorMessage,
      recordInspection,
      resetDemo,
    }),
    [
      state,
      completeQuiz,
      addPurchase,
      addManualPurchase,
      submitAssessment,
      dismissAlert,
      toggleSavedSupplier,
      addPost,
      sendMentorMessage,
      recordInspection,
      resetDemo,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const mentorReply = (message: string): string => {
  const text = message.toLowerCase();
  if (
    text.includes('certificate') ||
    text.includes('expired') ||
    text.includes('sijil') ||
    text.includes('tamat tempoh')
  ) {
    return 'Check the certificate scope, not just the company name. If it has lapsed, pause that product line and ask the supplier for a renewed certificate naming the product. Record the date you paused — an inspector will want to see the decision trail.';
  }
  if (
    text.includes('chiller') ||
    text.includes('storage') ||
    text.includes('cold') ||
    text.includes('peti sejuk') ||
    text.includes('sejuk') ||
    text.includes('simpan')
  ) {
    return 'Use the bottom shelf for raw meat, the middle for cooked food, and a separate basket for drinks. Label every container with the date it was opened. Keep a simple thermometer log twice a day — a photo on your phone is enough.';
  }
  if (
    text.includes('board') ||
    text.includes('knife') ||
    text.includes('contamination') ||
    text.includes('papan') ||
    text.includes('pisau') ||
    text.includes('cemar')
  ) {
    return 'Colour-code the basics: red for raw meat, green for produce, white for cooked food. At a busy stall, the board colour is faster than thinking about it. Clean and sanitise between tasks, not just at the end of service.';
  }
  if (
    text.includes('inspection') ||
    text.includes('visit') ||
    text.includes('pemeriksaan') ||
    text.includes('lawatan')
  ) {
    return 'Before a visit: file the last 30 days of receipts, label open containers, and put your training certificates where they can be seen. The officer is checking consistency, not perfection — show them how you correct an issue.';
  }
  return 'That is a good question. For your stall, the practical first step is to write down what you currently do for source, storage and separation, then fix the weakest link. I can review a short checklist with you — send me a photo of your prep area and chiller layout.';
};

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
};
