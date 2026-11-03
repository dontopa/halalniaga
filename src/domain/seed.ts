import { scoreAssessment } from './compliance';
import type {
  AppState,
  AssessmentQuestion,
  AssessmentRecord,
  AssessmentValue,
  CommunityPost,
  HalalStatus,
  MentorMessage,
  Product,
  Purchase,
  Supplier,
  SupplierCategory,
  TrainingModule,
  TrainingProgress,
  VendorProfile,
} from './types';

const anchor = new Date();

const atNoon = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  return copy;
};

export const daysAgo = (days: number): string =>
  atNoon(new Date(anchor.getTime() - days * 86_400_000)).toISOString();

export const daysAhead = (days: number): string =>
  atNoon(new Date(anchor.getTime() + days * 86_400_000)).toISOString();

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'aq-equipment',
    prompt: 'Raw meat and ready-to-eat food use separate boards, knives and containers.',
    help: 'Cross-contamination is the most common avoidable halal risk in small kitchens.',
    weight: 3,
    critical: true,
  },
  {
    id: 'aq-suppliers',
    prompt: 'Every main ingredient comes from a supplier whose halal status I can show.',
    help: 'A supplier certificate, a verified programme record, or a signed declaration all count.',
    weight: 3,
  },
  {
    id: 'aq-records',
    prompt: 'My purchase records and receipts for the last 30 days are complete.',
    help: 'Records make it possible to trace an ingredient back to its source.',
    weight: 2,
  },
  {
    id: 'aq-slaughter',
    prompt: 'Chicken, beef and mutton are sourced from halal-slaughtered animals.',
    help: 'The supplier must be able to evidence the source and method of slaughter.',
    weight: 3,
  },
  {
    id: 'aq-storage',
    prompt: 'Raw ingredients are stored covered, labelled and at the correct temperature.',
    help: 'Separate raw and cooked food, and keep chilled stock below 4°C.',
    weight: 2,
  },
  {
    id: 'aq-ingredients',
    prompt: 'I check the halal status of sauces, stock cubes, flavourings and additives.',
    help: 'Ambiguous ingredients such as gelatine, emulsifiers and alcohol-based flavourings need checking.',
    weight: 2,
  },
  {
    id: 'aq-training',
    prompt: 'Everyone handling food at my stall has completed basic halal handling guidance.',
    help: 'This includes part-time helpers and family members.',
    weight: 2,
  },
  {
    id: 'aq-cleanliness',
    prompt: 'The stall is clean, pest-free and hand-washing facilities are available.',
    help: 'Cleanliness underpins every other halal control.',
    weight: 1,
  },
];

const assessmentAnswers: Record<string, AssessmentValue> = {
  'aq-equipment': 'yes',
  'aq-suppliers': 'yes',
  'aq-records': 'yes',
  'aq-slaughter': 'yes',
  'aq-storage': 'no',
  'aq-ingredients': 'partial',
  'aq-training': 'yes',
  'aq-cleanliness': 'yes',
};

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'mod-foundations',
    order: 1,
    title: 'Halal foundations for food vendors',
    summary:
      'What halal actually covers — from ingredients and slaughter to handling, storage and trust.',
    durationMin: 18,
    topics: ['Halal and haram', 'Toyyib quality', 'Your responsibilities', 'Myth-busting'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Which statement best describes halal food?',
        options: [
          'Food that contains no pork or alcohol only',
          'Food that is lawful, clean and safe across the whole supply chain',
          'Food prepared by a Muslim vendor',
          'Food with a halal logo on the packaging',
        ],
        answer: 1,
        explanation:
          'Halal covers source, slaughter, ingredients, handling, storage and hygiene — not only the absence of pork and alcohol.',
      },
      {
        id: 'q2',
        prompt: 'A Malaysian halal certificate is issued by:',
        options: [
          'Any restaurant owner',
          'The local council only',
          'JAKIM or a recognised state Islamic authority',
          'The supplier’s customers',
        ],
        answer: 2,
        explanation:
          'The Malaysian Halal Certification (SPHM) is issued by JAKIM or a recognised MAIN/JAIN. HALALNiaga recognition is not a halal certificate.',
      },
      {
        id: 'q3',
        prompt: 'A product carries a foreign halal logo. What should you do?',
        options: [
          'Assume it is recognised in Malaysia',
          'Check whether the certifier is recognised by JAKIM',
          'Ignore it — only local logos matter',
          'Rely on the shop assistant’s opinion',
        ],
        answer: 1,
        explanation:
          'Foreign halal certificates must be issued by a certifier recognised by JAKIM to be treated as halal certification in Malaysia.',
      },
    ],
  },
  {
    id: 'mod-meat',
    order: 2,
    title: 'Meat, poultry and the slaughter question',
    summary:
      'How to verify the source of chicken, beef and mutton, and what evidence to keep.',
    durationMin: 22,
    topics: ['Halal slaughter', 'Supplier evidence', 'Frozen vs fresh', 'Red flags'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Which document is the strongest evidence of a halal meat source?',
        options: [
          'A handwritten note from the driver',
          'A valid halal certificate covering the slaughterhouse and product',
          'A receipt with no supplier details',
          'A verbal assurance from the seller',
        ],
        answer: 1,
        explanation:
          'A valid certificate that names the product and slaughterhouse is the strongest evidence. Keep it with the purchase record.',
      },
      {
        id: 'q2',
        prompt: 'Frozen chicken with no label and no supplier reference should be:',
        options: [
          'Used quickly before it spoils',
          'Accepted if it looks fresh',
          'Treated as unverified until the source is evidenced',
          'Mixed with certified chicken to save cost',
        ],
        answer: 2,
        explanation:
          'Without a traceable source it cannot be treated as halal-verified, even if it looks and smells normal.',
      },
      {
        id: 'q3',
        prompt: 'Why is cross-contamination a halal issue?',
        options: [
          'It changes the price of the dish',
          'It can transfer non-halal substances onto halal food',
          'It only matters for pork',
          'It affects the colour of the meat',
        ],
        answer: 1,
        explanation:
          'Physical transfer of non-halal material — through boards, knives, oil or hands — makes halal food non-halal.',
      },
    ],
  },
  {
    id: 'mod-ingredients',
    order: 3,
    title: 'Ingredients, additives and hidden risks',
    summary:
      'Read labels with confidence: emulsifiers, gelatine, flavourings and alcohol carriers.',
    durationMin: 20,
    topics: ['E-numbers', 'Gelatine', 'Alcohol in flavourings', 'Label reading'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Gelatine in a dessert is a halal concern because:',
        options: [
          'It always contains alcohol',
          'It may be derived from pork or non-halal-slaughtered animals',
          'It is always plant-based',
          'It is banned in Malaysia',
        ],
        answer: 1,
        explanation:
          'Gelatine can come from pork or from animals not slaughtered according to halal requirements. Check for a recognised halal certificate.',
      },
      {
        id: 'q2',
        prompt: 'An emulsifier listed as E471 may be a concern because:',
        options: [
          'It is always haram',
          'Its source (animal or plant) is not clear from the code alone',
          'It is only used in drinks',
          'It changes the taste',
        ],
        answer: 1,
        explanation:
          'E471 can be plant- or animal-derived. If the source is unclear, verify with the manufacturer or choose a certified product.',
      },
      {
        id: 'q3',
        prompt: 'Alcohol used as a carrier in a flavouring is:',
        options: [
          'Always permissible in any amount',
          'A matter to verify with the manufacturer and halal authority',
          'Only a problem in drinks',
          'The same as ethanol used for cleaning',
        ],
        answer: 1,
        explanation:
          'The ruling depends on the source, quantity and purpose. Do not assume — verify with the manufacturer and current halal guidance.',
      },
    ],
  },
  {
    id: 'mod-cross-contamination',
    order: 4,
    title: 'Separating equipment and preventing contamination',
    summary:
      'A practical colour-coding and workflow system that works in a small stall.',
    durationMin: 16,
    topics: ['Colour coding', 'Workflow order', 'Shared oil', 'Cleaning'],
    quiz: [
      {
        id: 'q1',
        prompt: 'The safest workflow when preparing raw and cooked food is:',
        options: [
          'Cooked food first, then raw food on the same board',
          'Raw food first, clean and sanitise, then cooked food',
          'Use the same board and wipe it with a cloth',
          'Prepare both at the same time',
        ],
        answer: 1,
        explanation:
          'Work from the least contaminated to the most contaminated, and clean and sanitise between tasks.',
      },
      {
        id: 'q2',
        prompt: 'A simple way to keep tools separate is:',
        options: [
          'Use one knife for everything',
          'Colour-code boards and knives by food type',
          'Rinse tools in the same sink',
          'Store all tools together',
        ],
        answer: 1,
        explanation:
          'Colour-coded equipment makes separation visible and easy to maintain during a busy service.',
      },
      {
        id: 'q3',
        prompt: 'Shared frying oil should be:',
        options: [
          'Reused indefinitely',
          'Changed on a schedule and kept free of non-halal contamination',
          'Topped up with fresh oil only',
          'Filtered once a month',
        ],
        answer: 1,
        explanation:
          'Oil can carry contamination. Use a documented change schedule and never fry non-halal items in halal oil.',
      },
    ],
  },
  {
    id: 'mod-storage',
    order: 5,
    title: 'Storage, labelling and temperature control',
    summary:
      'Keep ingredients identifiable, covered and cold — and know when to discard.',
    durationMin: 15,
    topics: ['Temperature zones', 'Labelling', 'FIFO', 'Waste'],
    quiz: [
      {
        id: 'q1',
        prompt: 'Chilled raw poultry should be stored at:',
        options: ['Below 4°C', 'Below 15°C', 'Room temperature', 'Below 25°C'],
        answer: 0,
        explanation:
          'Chilled high-risk food should be kept at 4°C or below. Frozen food should stay at -18°C or below.',
      },
      {
        id: 'q2',
        prompt: 'FIFO means:',
        options: [
          'Freeze It For Overnight',
          'First In, First Out',
          'Food Inspection For Operators',
          'Fresh Ingredients First Only',
        ],
        answer: 1,
        explanation:
          'First In, First Out: use older stock first, and label opening dates so nothing is used past its safe life.',
      },
      {
        id: 'q3',
        prompt: 'A container of unknown sauce left in the chiller overnight should be:',
        options: [
          'Used if it smells fine',
          'Labelled and used the next day',
          'Discarded if it cannot be identified and dated',
          'Given to staff',
        ],
        answer: 2,
        explanation:
          'Unidentified, undated food cannot be verified as halal or safe, so it should be discarded.',
      },
    ],
  },
  {
    id: 'mod-records',
    order: 6,
    title: 'Records, traceability and customer trust',
    summary:
      'How to keep a 30-second purchase log that stands up to a spot check.',
    durationMin: 14,
    topics: ['Receipts', 'Digital records', 'QR transparency', 'Inspection prep'],
    quiz: [
      {
        id: 'q1',
        prompt: 'A useful purchase record includes:',
        options: [
          'Only the amount paid',
          'Supplier, product, quantity, date and source reference',
          'The supplier’s phone number only',
          'A photo of the packaging only',
        ],
        answer: 1,
        explanation:
          'Four fields make an ingredient traceable: who supplied it, what it was, how much, and when.',
      },
      {
        id: 'q2',
        prompt: 'The HALALNiaga QR code tells customers:',
        options: [
          'That the stall holds a JAKIM halal certificate',
          'The vendor’s programme status, training and verification record',
          'The vendor’s bank details',
          'Nothing useful',
        ],
        answer: 1,
        explanation:
          'The QR shows programme participation and evidence — it is not a JAKIM halal certificate.',
      },
      {
        id: 'q3',
        prompt: 'A supplier’s certificate expires tomorrow. You should:',
        options: [
          'Keep buying until someone complains',
          'Ask for the renewed certificate and pause until it is confirmed',
          'Assume renewal is automatic',
          'Remove the supplier from your records',
        ],
        answer: 1,
        explanation:
          'Pause purchases tied to the expiring certificate until the renewal is confirmed, then update the record.',
      },
    ],
  },
];

const suppliers: Supplier[] = [
  {
    id: 'sup-sri-tanjung',
    name: 'Sri Tanjung Poultry Sdn Bhd',
    shortName: 'Sri Tanjung',
    area: 'Kota Kinabalu',
    address: 'Lot 12, Inanam Industrial Estate, Kota Kinabalu',
    categories: ['Poultry & meat'],
    distanceKm: 6.4,
    status: 'certified',
    certificateNo: 'JAKIM/MS1500/2024/1182',
    issuedOn: daysAgo(510),
    validUntil: daysAhead(24),
    rating: 4.8,
    reviewCount: 126,
    tags: ['Fresh daily', 'Wet market', 'Halal slaughter evidence'],
    accent: '#0f6b52',
  },
  {
    id: 'sup-borneo-meats',
    name: 'Borneo Halal Meats',
    shortName: 'Borneo Meats',
    area: 'Kota Kinabalu',
    address: 'Block C, Kolombong Commercial Centre, Kota Kinabalu',
    categories: ['Poultry & meat'],
    distanceKm: 9.1,
    status: 'certified',
    certificateNo: 'JAKIM/MS1500/2023/0874',
    issuedOn: daysAgo(380),
    validUntil: daysAhead(205),
    rating: 4.6,
    reviewCount: 89,
    tags: ['Beef & mutton', 'Wet market', 'Vacuum packed'],
    accent: '#7a3b2e',
  },
  {
    id: 'sup-sabah-fresh',
    name: 'Sabah Fresh Produce',
    shortName: 'Sabah Fresh',
    area: 'Kota Kinabalu',
    address: 'Pasar Besar Kota Kinabalu, Stall 44',
    categories: ['Produce'],
    distanceKm: 2.1,
    status: 'verified',
    certificateNo: 'HN-SRC-2025-0149',
    issuedOn: daysAgo(190),
    validUntil: daysAhead(95),
    rating: 4.7,
    reviewCount: 211,
    tags: ['Market-direct', 'Wet market', 'Daily harvest'],
    accent: '#3f7d20',
  },
  {
    id: 'sup-kinabalu-dairy',
    name: 'Kinabalu Dairy & Eggs',
    shortName: 'Kinabalu Dairy',
    area: 'Kota Kinabalu',
    address: 'Jalan Tuaran, Mile 5, Kota Kinabalu',
    categories: ['Dairy & eggs'],
    distanceKm: 7.8,
    status: 'certified',
    certificateNo: 'JAKIM/MS1500/2024/2031',
    issuedOn: daysAgo(240),
    validUntil: daysAhead(320),
    rating: 4.5,
    reviewCount: 74,
    tags: ['Grade A eggs', 'Wet market', 'Chilled delivery'],
    accent: '#b07d2b',
  },
  {
    id: 'sup-sazarah',
    name: 'Sazarah Dry Goods & Spices',
    shortName: 'Sazarah Foods',
    area: 'Kota Kinabalu',
    address: 'Putatan Central Market, Kota Kinabalu',
    categories: ['Dry goods', 'Sauces & condiments'],
    distanceKm: 11.2,
    status: 'verified',
    certificateNo: 'HN-SRC-2025-0221',
    issuedOn: daysAgo(355),
    validUntil: daysAhead(12),
    rating: 4.4,
    reviewCount: 58,
    tags: ['Bulk spices', 'Local importer', 'Product-level records'],
    accent: '#8a5a12',
  },
  {
    id: 'sup-papar-valley',
    name: 'Papar Valley Sauces',
    shortName: 'Papar Valley',
    area: 'Kota Kinabalu',
    address: 'Kampung Kawang, Papar',
    categories: ['Sauces & condiments'],
    distanceKm: 24.6,
    status: 'certified',
    certificateNo: 'JAKIM/MS1500/2024/1550',
    issuedOn: daysAgo(300),
    validUntil: daysAhead(150),
    rating: 4.9,
    reviewCount: 44,
    tags: ['Small-batch', 'No alcohol', 'Farm-to-bottle'],
    accent: '#a33b2a',
  },
  {
    id: 'sup-tawau-sea',
    name: 'Tawau Sea Harvest',
    shortName: 'Tawau Sea Harvest',
    area: 'Tawau',
    address: 'Kawasan Perindustrian Tawau, Sabah',
    categories: ['Seafood'],
    distanceKm: 482,
    status: 'expired',
    certificateNo: 'JAKIM/MS1500/2022/0419',
    issuedOn: daysAgo(760),
    validUntil: daysAgo(9),
    rating: 4.2,
    reviewCount: 31,
    tags: ['Frozen seafood', 'Wet market', 'Bulk supply'],
    accent: '#1c5f7a',
  },
  {
    id: 'sup-sandakan-spice',
    name: 'Sandakan Spice House',
    shortName: 'Sandakan Spice',
    area: 'Sandakan',
    address: 'Bandar Indah, Sandakan',
    categories: ['Dry goods'],
    distanceKm: 316,
    status: 'pending',
    certificateNo: null,
    issuedOn: null,
    validUntil: null,
    rating: 4.0,
    reviewCount: 12,
    tags: ['Awaiting verification'],
    accent: '#6b5b3e',
  },
];

interface ProductSeed {
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

const productSeeds: ProductSeed[] = [
  {
    id: 'prd-chicken-whole',
    supplierId: 'sup-sri-tanjung',
    name: 'Fresh whole chicken',
    category: 'Poultry & meat',
    unit: 'kg',
    price: 11.8,
    halalStatus: 'certified',
    barcode: '9551001000017',
    certificateRef: 'JAKIM/MS1500/2024/1182',
  },
  {
    id: 'prd-chicken-breast',
    supplierId: 'sup-sri-tanjung',
    name: 'Boneless chicken breast',
    category: 'Poultry & meat',
    unit: 'kg',
    price: 16.5,
    halalStatus: 'certified',
    barcode: '9551001000024',
    certificateRef: 'JAKIM/MS1500/2024/1182',
  },
  {
    id: 'prd-beef-brisket',
    supplierId: 'sup-borneo-meats',
    name: 'Beef brisket',
    category: 'Poultry & meat',
    unit: 'kg',
    price: 32.4,
    halalStatus: 'certified',
    barcode: '9551001000031',
    certificateRef: 'JAKIM/MS1500/2023/0874',
  },
  {
    id: 'prd-mutton',
    supplierId: 'sup-borneo-meats',
    name: 'Mutton curry cut',
    category: 'Poultry & meat',
    unit: 'kg',
    price: 38.9,
    halalStatus: 'certified',
    barcode: '9551001000048',
    certificateRef: 'JAKIM/MS1500/2023/0874',
  },
  {
    id: 'prd-kangkung',
    supplierId: 'sup-sabah-fresh',
    name: 'Kangkung (water spinach)',
    category: 'Produce',
    unit: 'kg',
    price: 4.2,
    halalStatus: 'verified',
    barcode: '9551002000018',
    certificateRef: 'HN-SRC-2025-0149',
  },
  {
    id: 'prd-tomato',
    supplierId: 'sup-sabah-fresh',
    name: 'Local tomatoes',
    category: 'Produce',
    unit: 'kg',
    price: 5.4,
    halalStatus: 'verified',
    barcode: '9551002000025',
    certificateRef: 'HN-SRC-2025-0149',
  },
  {
    id: 'prd-shallot',
    supplierId: 'sup-sabah-fresh',
    name: 'Shallots',
    category: 'Produce',
    unit: 'kg',
    price: 6.1,
    halalStatus: 'verified',
    barcode: '9551002000032',
    certificateRef: 'HN-SRC-2025-0149',
  },
  {
    id: 'prd-eggs',
    supplierId: 'sup-kinabalu-dairy',
    name: 'Grade A chicken eggs',
    category: 'Dairy & eggs',
    unit: 'tray (30)',
    price: 14.2,
    halalStatus: 'certified',
    barcode: '9551003000015',
    certificateRef: 'JAKIM/MS1500/2024/2031',
  },
  {
    id: 'prd-milk',
    supplierId: 'sup-kinabalu-dairy',
    name: 'Fresh full-cream milk',
    category: 'Dairy & eggs',
    unit: 'litre',
    price: 7.8,
    halalStatus: 'certified',
    barcode: '9551003000022',
    certificateRef: 'JAKIM/MS1500/2024/2031',
  },
  {
    id: 'prd-rice',
    supplierId: 'sup-sazarah',
    name: 'Premium fragrant rice',
    category: 'Dry goods',
    unit: '10 kg',
    price: 42.0,
    halalStatus: 'verified',
    barcode: '9551004000011',
    certificateRef: 'HN-SRC-2025-0221',
  },
  {
    id: 'prd-cooking-oil',
    supplierId: 'sup-sazarah',
    name: 'Refined palm cooking oil',
    category: 'Dry goods',
    unit: '5 kg',
    price: 28.5,
    halalStatus: 'verified',
    barcode: '9551004000028',
    certificateRef: 'HN-SRC-2025-0221',
  },
  {
    id: 'prd-curry-powder',
    supplierId: 'sup-sazarah',
    name: 'House curry powder',
    category: 'Dry goods',
    unit: '500 g',
    price: 9.4,
    halalStatus: 'verified',
    barcode: '9551004000035',
    certificateRef: 'HN-SRC-2025-0221',
  },
  {
    id: 'prd-chilli-sauce',
    supplierId: 'sup-papar-valley',
    name: 'Small-batch chilli sauce',
    category: 'Sauces & condiments',
    unit: 'bottle (340 ml)',
    price: 8.9,
    halalStatus: 'certified',
    barcode: '9551005000012',
    certificateRef: 'JAKIM/MS1500/2024/1550',
  },
  {
    id: 'prd-soy-sauce',
    supplierId: 'sup-papar-valley',
    name: 'Naturally brewed soy sauce',
    category: 'Sauces & condiments',
    unit: 'bottle (600 ml)',
    price: 12.6,
    halalStatus: 'certified',
    barcode: '9551005000029',
    certificateRef: 'JAKIM/MS1500/2024/1550',
  },
  {
    id: 'prd-frozen-prawn',
    supplierId: 'sup-tawau-sea',
    name: 'Frozen tiger prawns',
    category: 'Seafood',
    unit: 'kg',
    price: 41.5,
    halalStatus: 'expired',
    barcode: '9551006000013',
    certificateRef: 'JAKIM/MS1500/2022/0419',
  },
  {
    id: 'prd-sandakan-pepper',
    supplierId: 'sup-sandakan-spice',
    name: 'White peppercorns',
    category: 'Dry goods',
    unit: '500 g',
    price: 18.0,
    halalStatus: 'pending',
    barcode: '9551007000010',
    certificateRef: null,
  },
];

export const PRODUCTS: Product[] = productSeeds;

const purchaseSeeds: Array<[string, string, number, number]> = [
  // [supplierId, productId, quantity, daysAgo]
  ['sup-sri-tanjung', 'prd-chicken-whole', 6, 3],
  ['sup-sabah-fresh', 'prd-kangkung', 4, 4],
  ['sup-sabah-fresh', 'prd-tomato', 5, 4],
  ['sup-kinabalu-dairy', 'prd-eggs', 2, 8],
  ['sup-sazarah', 'prd-rice', 1, 12],
  ['sup-sri-tanjung', 'prd-chicken-breast', 4, 16],
  ['sup-borneo-meats', 'prd-beef-brisket', 3, 21],
  ['sup-papar-valley', 'prd-chilli-sauce', 6, 27],
  ['sup-sabah-fresh', 'prd-shallot', 4, 33],
  ['sup-kinabalu-dairy', 'prd-milk', 6, 38],
  ['sup-sazarah', 'prd-cooking-oil', 1, 46],
  ['sup-borneo-meats', 'prd-mutton', 2, 58],
  ['sup-sri-tanjung', 'prd-chicken-whole', 5, 74],
  ['sup-sandakan-spice', 'prd-sandakan-pepper', 2, 19],
  ['sup-tawau-sea', 'prd-frozen-prawn', 2, 65],
  ['sup-sazarah', 'prd-curry-powder', 3, 88],
  ['sup-sabah-fresh', 'prd-kangkung', 5, 102],
  ['sup-papar-valley', 'prd-soy-sauce', 4, 118],
];

const purchases: Purchase[] = purchaseSeeds.map(
  ([supplierId, productId, quantity, ago], index) => {
    const product = PRODUCTS.find((p) => p.id === productId)!;
    const supplier = suppliers.find((s) => s.id === supplierId)!;
    const verifiedSource =
      supplier.status === 'certified' || supplier.status === 'verified';
    return {
      id: `pur-${String(index + 1).padStart(3, '0')}`,
      supplierId,
      productId,
      quantity,
      unit: product.unit,
      amount: Math.round(product.price * quantity * 100) / 100,
      purchasedAt: daysAgo(ago),
      receiptNo: `HN-${new Date(anchor.getTime() - ago * 86_400_000)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '')}-${String(index + 1).padStart(3, '0')}`,
      verifiedSource,
    };
  },
);

const training: TrainingProgress[] = TRAINING_MODULES.map((module, index) => {
  const scores = [100, 90, 85, 95, 80, 88];
  return {
    moduleId: module.id,
    completedAt: daysAgo(210 - index * 18),
    bestScore: scores[index],
    attempts: index % 3 === 0 ? 2 : 1,
  };
});

const latestAssessmentRecord: AssessmentRecord = {
  id: 'asm-current',
  completedAt: daysAgo(31),
  answers: assessmentAnswers,
  score: scoreAssessment(assessmentAnswers, ASSESSMENT_QUESTIONS),
};

const vendor: VendorProfile = {
  id: 'vnd-kak-nur',
  name: 'Dapur Kak Nur',
  owner: 'Nurul Huda binti Ahmad',
  stall: 'Stall 7, Tanjung Aru Food Court',
  area: 'Kota Kinabalu',
  category: 'Nasi campur & local favourites',
  tagline: 'Home-style Sabah cooking, sourced with care.',
  joinedAt: daysAgo(243),
  qrSlug: 'dapur-kak-nur',
  phone: '+60 13-882 4417',
  inspections: [
    {
      id: 'insp-2026-02',
      inspectedAt: daysAgo(264),
      officer: 'Hafiz Roslan, Programme Officer',
      score: 88,
      findings: [
        'Hand-washing basin had no soap at the time of visit.',
        'Receipts for two vegetable purchases were not filed.',
      ],
      passed: true,
    },
    {
      id: 'insp-2025-08',
      inspectedAt: daysAgo(451),
      officer: 'Hafiz Roslan, Programme Officer',
      score: 82,
      findings: ['Raw and cooked boards were stored together.'],
      passed: true,
    },
  ],
};

const posts: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'Aisyah Rahman',
    role: 'Caterer · Likas',
    area: 'Kota Kinabalu',
    body: 'Sharing a small win: Sri Tanjung now sends the slaughterhouse certificate with every invoice. My inspection last week took 20 minutes because everything was already filed.',
    createdAt: daysAgo(1),
    likes: 34,
  },
  {
    id: 'post-2',
    author: 'Daniel Tan',
    role: 'Kopitiam owner · Gaya Street',
    area: 'Kota Kinabalu',
    body: 'Question for the group — do you keep separate fryers for fish and chicken? I run a small stall and I am trying to work out a practical setup without buying twice the equipment.',
    createdAt: daysAgo(2),
    likes: 18,
  },
  {
    id: 'post-3',
    author: 'Hafiz Roslan',
    role: 'Programme officer',
    area: 'Kota Kinabalu',
    body: 'Reminder: certificate checks are now product-level, not just company-level. If a supplier changes product lines, ask for the updated certificate scope.',
    createdAt: daysAgo(4),
    likes: 51,
  },
  {
    id: 'post-4',
    author: 'Rohana Yusof',
    role: 'Night market vendor · Api-Api',
    area: 'Kota Kinabalu',
    body: 'The QR sticker changed how customers talk to me. They scan, see the training record, and ask fewer suspicious questions. It feels good to be trusted.',
    createdAt: daysAgo(6),
    likes: 67,
  },
  {
    id: 'post-5',
    author: 'Jefri Sulaiman',
    role: 'Food truck · UMS',
    area: 'Kota Kinabalu',
    body: 'Looking for a verified egg supplier around Sepanggar. Kinabalu Dairy is good but the delivery window clashes with my prep time.',
    createdAt: daysAgo(8),
    likes: 12,
  },
];

const mentorMessages: MentorMessage[] = [
  {
    id: 'msg-1',
    role: 'mentor',
    body: 'Assalamualaikum Kak Nur. I saw your last self-assessment — storage temperature was the only amber item. Want me to walk you through a simple chiller checklist?',
    sentAt: daysAgo(2),
  },
  {
    id: 'msg-2',
    role: 'vendor',
    body: 'Waalaikumussalam. Yes please. My chiller is small and I share it with drinks. I am not sure how to arrange it.',
    sentAt: daysAgo(2),
  },
  {
    id: 'msg-3',
    role: 'mentor',
    body: 'Keep raw meat on the bottom shelf, cooked food above it, and drinks in a separate basket. Label everything with the date it was opened. I can send a one-page layout you can stick on the door.',
    sentAt: daysAgo(1),
  },
];

export const createInitialState = (): AppState => ({
  vendor,
  suppliers,
  products: PRODUCTS,
  purchases,
  training,
  assessments: [latestAssessmentRecord],
  posts,
  mentorMessages,
  savedSupplierIds: ['sup-sri-tanjung', 'sup-sabah-fresh'],
  dismissedAlerts: [],
});

export const DEMO_REFERENCE_DATE = anchor;
