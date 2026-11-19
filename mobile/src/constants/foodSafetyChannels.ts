/**
 * SERPENTIS Food Safety Action System
 * Official Government Complaint Channels & Citizen Guidance Reference
 * 
 * NOTE: SERPENTIS is an independent civic reporting platform and does NOT
 * claim automated integration or submission to government portals.
 * These links and hotlines are provided to assist citizens in lodging
 * formal, legally binding grievances with competent statutory authorities.
 */

export interface OfficialChannel {
  id: string;
  name: string;
  authority: string;
  description: string;
  url?: string;
  phone?: string;
  recommendedFor: string;
  badge: string;
}

export const OFFICIAL_FOOD_SAFETY_CHANNELS: OfficialChannel[] = [
  {
    id: 'fssai_foscos',
    name: 'FSSAI Food Safety Connect',
    authority: 'Food Safety and Standards Authority of India (FSSAI)',
    description:
      'Official statutory portal for lodging consumer grievances regarding adulteration, contaminated food, expired packaging, and unlicensed food business operators (FBOs).',
    url: 'https://foscos.fssai.gov.in/',
    phone: '1800112100',
    recommendedFor: 'Hygiene violations, foreign contaminants, expired stock, adulteration',
    badge: 'Statutory Regulator',
  },
  {
    id: 'nch_consumer',
    name: 'National Consumer Helpline (NCH)',
    authority: 'Department of Consumer Affairs, Govt. of India',
    description:
      'Toll-free national grievance helpline and portal for consumer trade disputes, billing overcharges, stale food delivery complaints, and refund refusals.',
    url: 'https://consumerhelpline.gov.in/',
    phone: '1915',
    recommendedFor: 'Food delivery disputes, overcharging, refused refunds, restaurant billing',
    badge: 'Consumer Rights',
  },
  {
    id: 'ingram_portal',
    name: 'INGRAM Integrated Grievance Portal',
    authority: 'National Consumer Dispute Redressal Portal',
    description:
      'Centralized web portal for tracking consumer complaints across commercial food establishments, e-commerce food vendors, and cloud kitchens.',
    url: 'https://consumerhelpline.gov.in/user/signup.php',
    recommendedFor: 'Formal online docket registration and multi-stage tracking',
    badge: 'Grievance Redressal',
  },
];

export const FILING_EVIDENCE_CHECKLIST = [
  'Tax invoice, receipt, or digital order screenshot (ensure personal payment card digits are cropped or redacted)',
  'Clear photographs of the contaminated food, foreign object, or unhygienic conditions',
  'Packaging photos showing brand name, batch number, manufactured date, and expiry date (for packaged goods)',
  'Date, approximate time, and GPS/street address of the food business establishment',
  'Medical prescription or diagnostic report if hospitalization or acute food poisoning occurred',
];

export const OFFICIAL_GOVERNMENT_DISCLAIMER =
  'SERPENTIS is an independent community awareness and civic reporting platform. SERPENTIS is NOT a government agency or statutory food enforcement authority. Logging an incident on SERPENTIS informs community members and generates an organized evidence dossier, but it does NOT constitute an official government complaint. To seek statutory inspection, vendor fines, or regulatory prosecution, you must lodge your complaint through authorized government channels (e.g., FSSAI / FoSCoS or NCH 1915) using the official links provided.';
