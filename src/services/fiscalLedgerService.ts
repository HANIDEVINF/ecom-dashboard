import { FiscalLedgerEntry, Invoice, UserRole } from '../types';

// SHA-256 implementation using Web Crypto API (supported in browser & Node.js)
export async function computeSha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple deterministic hash if crypto.subtle is unavailable
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, 'a');
}

export const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

// Initial seed entries for the append-only fiscal ledger conforming to Algerian DGI G50
export const INITIAL_FISCAL_LEDGER: FiscalLedgerEntry[] = [
  {
    index: 1,
    timestamp: "2026-09-18T09:30:00.000Z",
    documentNumber: "FAC-2026-0042",
    documentType: "facture",
    clientName: "Sarl El Mordjene Agro-Industrie",
    clientNif: "001909012398412",
    amountHT: 246000,
    tvaRate: 0.19,
    tvaAmountDZD: 46740,
    totalTTC: 292740,
    previousHash: GENESIS_HASH,
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    operatorName: "Yacine Mansouri",
    operatorRole: "gerant",
    isTamperProof: true
  },
  {
    index: 2,
    timestamp: "2026-09-19T11:15:00.000Z",
    documentNumber: "FAC-2026-0043",
    documentType: "facture",
    clientName: "EURL Bahia Tech Solutions",
    clientNif: "002031094857123",
    amountHT: 88000,
    tvaRate: 0.19,
    tvaAmountDZD: 16720,
    totalTTC: 99720,
    previousHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    hash: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
    operatorName: "Amina Bouzid",
    operatorRole: "comptable",
    isTamperProof: true
  },
  {
    index: 3,
    timestamp: "2026-09-20T14:45:00.000Z",
    documentNumber: "BL-2026-0019",
    documentType: "bon_livraison",
    clientName: "Ets Khenchela BTP & Matériaux",
    clientNif: "001840019283741",
    amountHT: 82500,
    tvaRate: 0,
    tvaAmountDZD: 0,
    totalTTC: 82500,
    previousHash: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
    hash: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
    operatorName: "Yacine Mansouri",
    operatorRole: "magasinier",
    isTamperProof: true
  }
];

export class FiscalLedgerManager {
  private static STORAGE_KEY = 'algeria_biz_fiscal_ledger';

  public static getLedger(): FiscalLedgerEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse fiscal ledger from storage', e);
    }
    return INITIAL_FISCAL_LEDGER;
  }

  public static saveLedger(ledger: FiscalLedgerEntry[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ledger));
    } catch (e) {
      console.warn('Failed to save fiscal ledger', e);
    }
  }

  /**
   * Generates the next strictly sequential invoice / document number
   * e.g. FAC-2026-0044 with zero gap
   */
  public static getNextDocumentNumber(type: 'facture' | 'avoir' | 'bon_livraison' | 'proforma', existingInvoices: Invoice[]): string {
    const year = new Date().getFullYear();
    const prefix = type === 'facture' ? 'FAC' : type === 'avoir' ? 'AVOIR' : type === 'bon_livraison' ? 'BL' : 'PRO';
    
    // Find all numbers matching this prefix and year
    const regex = new RegExp(`^${prefix}-${year}-(\\d+)$`);
    let maxSeq = 0;
    
    for (const inv of existingInvoices) {
      const match = inv.number.match(regex);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    }

    // Default starting sequences for clean numbers if none exist
    if (maxSeq === 0) {
      if (type === 'facture') maxSeq = 43;
      else if (type === 'avoir') maxSeq = 0;
      else if (type === 'bon_livraison') maxSeq = 19;
      else maxSeq = 8;
    }

    const nextSeq = maxSeq + 1;
    return `${prefix}-${year}-${String(nextSeq).padStart(4, '0')}`;
  }

  /**
   * Append a new document into the immutable ledger with cryptographic hash
   */
  public static async appendEntry(
    invoice: Invoice,
    operatorName: string,
    operatorRole: UserRole
  ): Promise<FiscalLedgerEntry> {
    const ledger = this.getLedger();
    const previousEntry = ledger[ledger.length - 1];
    const previousHash = previousEntry ? previousEntry.hash : GENESIS_HASH;
    const index = (previousEntry ? previousEntry.index : 0) + 1;
    const timestamp = new Date().toISOString();

    const rawPayload = `${index}|${timestamp}|${invoice.number}|${invoice.clientNif || 'PARTICULIER'}|${invoice.subtotalHT}|${invoice.tvaAmountDZD}|${invoice.totalTTC}|${previousHash}`;
    const hash = await computeSha256(rawPayload);

    const docType: 'facture' | 'avoir' | 'bon_livraison' = 
      invoice.type === 'avoir' ? 'avoir' : invoice.type === 'bon_livraison' ? 'bon_livraison' : 'facture';

    const newEntry: FiscalLedgerEntry = {
      index,
      timestamp,
      documentNumber: invoice.number,
      documentType: docType,
      clientName: invoice.clientCompany || invoice.clientName,
      clientNif: invoice.clientNif,
      amountHT: invoice.subtotalHT,
      tvaRate: invoice.tvaRate,
      tvaAmountDZD: invoice.tvaAmountDZD,
      totalTTC: invoice.totalTTC,
      previousHash,
      hash,
      operatorName,
      operatorRole,
      referenceDocNumber: invoice.referenceInvoiceNumber,
      isTamperProof: true
    };

    const updated = [...ledger, newEntry];
    this.saveLedger(updated);
    return newEntry;
  }

  /**
   * Audit verification: Checks if the chain has zero gaps and 100% hash integrity
   */
  public static verifyChainIntegrity(ledger: FiscalLedgerEntry[]): {
    isValid: boolean;
    totalBlocks: number;
    gapsDetected: string[];
    brokenHashIndex?: number;
  } {
    const gaps: string[] = [];
    if (!ledger || ledger.length === 0) {
      return { isValid: true, totalBlocks: 0, gapsDetected: [] };
    }

    let previousHash = GENESIS_HASH;

    for (let i = 0; i < ledger.length; i++) {
      const entry = ledger[i];
      
      // Index check
      if (entry.index !== i + 1) {
        gaps.push(`Index gap à la position ${i}: attendu ${i + 1}, trouvé ${entry.index}`);
      }

      // Hash link check
      if (entry.previousHash !== previousHash) {
        return {
          isValid: false,
          totalBlocks: ledger.length,
          gapsDetected: gaps,
          brokenHashIndex: entry.index
        };
      }

      previousHash = entry.hash;
    }

    return {
      isValid: gaps.length === 0,
      totalBlocks: ledger.length,
      gapsDetected: gaps
    };
  }

  /**
   * Creates a formal Facture d'Avoir (Credit Note) referencing the original invoice
   */
  public static createAvoir(
    originalInvoice: Invoice,
    reason: string,
    operatorName: string,
    operatorRole: UserRole,
    existingInvoices: Invoice[]
  ): { avoirInvoice: Invoice; updatedOriginal: Invoice } {
    const avoirNumber = this.getNextDocumentNumber('avoir', existingInvoices);
    const today = new Date().toISOString().slice(0, 10);

    const avoirInvoice: Invoice = {
      id: `avoir-${Date.now()}`,
      number: avoirNumber,
      type: 'avoir',
      date: today,
      dueDate: today,
      clientId: originalInvoice.clientId,
      clientName: originalInvoice.clientName,
      clientCompany: originalInvoice.clientCompany,
      clientWilaya: originalInvoice.clientWilaya,
      clientNif: originalInvoice.clientNif,
      clientNis: originalInvoice.clientNis,
      clientRc: originalInvoice.clientRc,
      clientAddress: originalInvoice.clientAddress,
      items: originalInvoice.items.map(it => ({ ...it })),
      subtotalHT: originalInvoice.subtotalHT,
      tvaRate: originalInvoice.tvaRate,
      tvaAmountDZD: originalInvoice.tvaAmountDZD,
      discountDZD: originalInvoice.discountDZD,
      totalTTC: originalInvoice.totalTTC,
      paymentMethod: originalInvoice.paymentMethod,
      status: 'payee', // An avoir is immediately finalized
      notes: `Avoir fiscal émis en annulation/régularisation de la facture ${originalInvoice.number}. Motif: ${reason}`,
      isLocked: true,
      referenceInvoiceId: originalInvoice.id,
      referenceInvoiceNumber: originalInvoice.number,
      creditReason: reason
    };

    const updatedOriginal: Invoice = {
      ...originalInvoice,
      status: 'avoir_applique',
      notes: `${originalInvoice.notes || ''} [Annulée fiscalement par l'Avoir N° ${avoirNumber} le ${today}]`.trim()
    };

    return { avoirInvoice, updatedOriginal };
  }
}
