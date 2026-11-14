// Persistent Business Memory Store for Monavi Collection
// Persists verified business facts, working assumptions, temporary notes, competitor dossiers, and campaign history across CLI sessions.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from '../brand.ts';
import type { BusinessMemory, CompetitorAuditResult, ApprovalRequest } from './types.ts';

const MEMORY_PATH = path.join(ROOT, 'brand', 'business-memory.json');
const APPROVALS_PATH = path.join(ROOT, 'brand', 'pending-approvals.json');

const DEFAULT_MEMORY: BusinessMemory = {
  verifiedFacts: {
    brandName: 'Monavi Collection',
    wordmark: 'MONAVI',
    descriptor: 'COLLECTION',
    tagline: 'Wear Your Story',
    storeType: 'Premium Indian Fashion Boutique (Bridal, Festive, Ladies, Men\'s, Kids)',
    market: 'India & Global Indian Diaspora',
    contact: {
      instagram: '@monavicollection',
      facebook: 'MonaviCollectionOfficial',
      whatsapp: '+91 98765 43210',
      phone: '+91 98765 43210',
      website: 'https://monavicollection.in',
      address: 'Heritage Fashion Enclave, New Delhi, India',
      storeHours: 'Monday - Sunday: 10:30 AM - 08:30 PM IST'
    },
    verifiedPriceRanges: {
      'kurta-pajama': '₹2,499 - ₹8,999',
      'sherwani': '₹14,999 - ₹45,000',
      'nehru-jacket': '₹2,999 - ₹7,499',
      'mens-shirt': '₹1,499 - ₹3,499',
      'lehenga': '₹18,999 - ₹85,000',
      'saree': '₹3,999 - ₹24,999',
      'anarkali': '₹4,499 - ₹16,999',
      'sharara': '₹5,999 - ₹19,999',
      'kids-ethnic-set': '₹1,999 - ₹5,499'
    },
    coreCollections: ['bridal', 'festive', 'ladies', 'mens', 'kids', 'everyday'],
    lastUpdated: new Date().toISOString()
  },
  workingAssumptions: {
    targetDemographics: [
      'Modern Indian families seeking festive & wedding elegance',
      'Grooms & brides aged 24-34 valuing authentic handcraft and tailored fits',
      'Working men aged 25-45 looking for crisp ethnic and smart-casual attire',
      'Mothers shopping for children\'s comfortable festive wear'
    ],
    coreCustomerMotivations: [
      'Authentic fabric feel (pure silk, Banarasi brocade, breathable linen)',
      'Photogenic wedding appearance without exaggerated stiffness',
      'Comfortable all-day wear for long Indian celebrations',
      'Direct personal consultation via WhatsApp'
    ],
    bestsellingCategories: ['kurta-pajama', 'sherwani', 'bridal-lehenga', 'saree'],
    aestheticPreference: 'High-contrast editorial luxury, clean architectural negative space, warm royal palettes, authentic human models',
    averageOrderCycleDays: 14,
    lastUpdated: new Date().toISOString()
  },
  temporaryNotes: [],
  competitorDossiers: {},
  campaignHistory: []
};

/**
 * Loads persistent business memory.
 */
export function loadBusinessMemory(): BusinessMemory {
  if (!existsSync(MEMORY_PATH)) {
    saveBusinessMemory(DEFAULT_MEMORY);
    return DEFAULT_MEMORY;
  }
  try {
    const raw = readFileSync(MEMORY_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_MEMORY,
      ...parsed,
      verifiedFacts: { ...DEFAULT_MEMORY.verifiedFacts, ...(parsed.verifiedFacts || {}) },
      workingAssumptions: { ...DEFAULT_MEMORY.workingAssumptions, ...(parsed.workingAssumptions || {}) },
      temporaryNotes: parsed.temporaryNotes || [],
      competitorDossiers: parsed.competitorDossiers || {},
      campaignHistory: parsed.campaignHistory || []
    };
  } catch {
    return DEFAULT_MEMORY;
  }
}

/**
 * Saves persistent business memory to brand/business-memory.json safely.
 */
export function saveBusinessMemory(memory: BusinessMemory): void {
  // Strip any accidental secrets or credentials before saving
  const sanitized = JSON.parse(JSON.stringify(memory));
  writeFileSync(MEMORY_PATH, JSON.stringify(sanitized, null, 2), 'utf8');
}

/**
 * Loads pending approvals requiring owner authorization.
 */
export function loadPendingApprovals(): ApprovalRequest[] {
  if (!existsSync(APPROVALS_PATH)) return [];
  try {
    const raw = readFileSync(APPROVALS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves pending approvals to brand/pending-approvals.json.
 */
export function savePendingApprovals(approvals: ApprovalRequest[]): void {
  writeFileSync(APPROVALS_PATH, JSON.stringify(approvals, null, 2), 'utf8');
}

/**
 * Adds an approval request to the queue.
 */
export function queueApprovalRequest(req: Omit<ApprovalRequest, 'id' | 'createdAt' | 'status'>): ApprovalRequest {
  const existing = loadPendingApprovals();
  const newReq: ApprovalRequest = {
    ...req,
    id: `appr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  existing.push(newReq);
  savePendingApprovals(existing);
  return newReq;
}

/**
 * Resolves an approval request (approves or rejects).
 */
export function resolveApprovalRequest(id: string, decision: 'approved' | 'rejected'): ApprovalRequest | null {
  const list = loadPendingApprovals();
  const target = list.find(a => a.id === id);
  if (!target) return null;
  target.status = decision;
  savePendingApprovals(list.filter(a => a.id !== id)); // Move out of pending
  return target;
}

/**
 * Updates competitor dossier in memory.
 */
export function saveCompetitorDossier(dossier: CompetitorAuditResult): void {
  const mem = loadBusinessMemory();
  const key = dossier.handleOrName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  mem.competitorDossiers[key] = dossier;
  saveBusinessMemory(mem);
}

/**
 * Records a campaign in history.
 */
export function recordCampaign(entry: BusinessMemory['campaignHistory'][0]): void {
  const mem = loadBusinessMemory();
  const existingIdx = mem.campaignHistory.findIndex(c => c.slug === entry.slug);
  if (existingIdx >= 0) {
    mem.campaignHistory[existingIdx] = entry;
  } else {
    mem.campaignHistory.unshift(entry);
  }
  // Keep last 50 campaigns
  if (mem.campaignHistory.length > 50) {
    mem.campaignHistory = mem.campaignHistory.slice(0, 50);
  }
  saveBusinessMemory(mem);
}

/**
 * Finds verified price for garment if available.
 */
export function getVerifiedPriceRange(garmentKey: string): string | null {
  const mem = loadBusinessMemory();
  return mem.verifiedFacts.verifiedPriceRanges[garmentKey] || null;
}
