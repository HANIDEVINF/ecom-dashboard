import { 
  BentoDashboardData, 
  BusinessSettings, 
  ClientProfile, 
  ExpenseItem,
  FinancialData, 
  InboxAlertItem, 
  InventoryItem, 
  Invoice,
  ScheduleEvent, 
  Worker, 
  AppLanguage 
} from '../types';
import { 
  INITIAL_BENTO_DATA_ALGERIA, 
  INITIAL_BUSINESS_SETTINGS, 
  INITIAL_CLIENTS, 
  INITIAL_EXPENSES,
  INITIAL_FINANCIALS_ALGERIA, 
  INITIAL_INBOX_ALGERIA, 
  INITIAL_INVENTORY, 
  INITIAL_INVOICES,
  INITIAL_SCHEDULES_ALGERIA, 
  INITIAL_WORKERS 
} from '../data/algerianBusinessData';

const STORAGE_KEYS = {
  SETTINGS: 'dz_biz_settings_v2',
  WORKERS: 'dz_biz_workers_v2',
  INVENTORY: 'dz_biz_inventory_v2',
  CLIENTS: 'dz_biz_clients_v2',
  BENTO: 'dz_biz_bento_v2',
  FINANCIALS: 'dz_biz_financials_v2',
  SCHEDULES: 'dz_biz_schedules_v2',
  INBOX: 'dz_biz_inbox_v2',
  LANG: 'dz_biz_lang_v2',
  INVOICES: 'dz_biz_invoices_v2',
  EXPENSES: 'dz_biz_expenses_v2'
};

// Generic storage helpers
export function getStoredData<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`dz_biz_${key}_v2`);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`dz_biz_${key}_v2`, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

// Play professional gentle audio chime for stock alarm
export const playAlarmChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35); // A4
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.warn("Audio chime not allowed or supported:", e);
  }
};

// Currency formatter
export const formatDZD = (amount: number, lang: AppLanguage = 'fr'): string => {
  if (isNaN(amount) || amount === undefined || amount === null) return "0 DA";
  
  if (lang === 'ar') {
    return `${amount.toLocaleString('ar-DZ')} د.ج`;
  } else if (lang === 'en') {
    return `${amount.toLocaleString('en-US')} DZD`;
  } else {
    // French: space as thousands separator
    return `${amount.toLocaleString('fr-FR').replace(/\u202F/g, ' ')} DA`;
  }
};

// Local storage helpers with fallback
export const storageService = {
  getSettings: (): BusinessSettings => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_BUSINESS_SETTINGS;
    } catch {
      return INITIAL_BUSINESS_SETTINGS;
    }
  },
  saveSettings: (settings: BusinessSettings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  },

  getWorkers: (): Worker[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKERS);
      return saved ? JSON.parse(saved) : INITIAL_WORKERS;
    } catch {
      return INITIAL_WORKERS;
    }
  },
  saveWorkers: (workers: Worker[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
    } catch (e) {
      console.error(e);
    }
  },

  getInventory: (): InventoryItem[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      const items: InventoryItem[] = saved ? JSON.parse(saved) : INITIAL_INVENTORY;
      return items.map(it => ({
        ...it,
        alarmActive: it.stockQty <= it.minStockAlert
      }));
    } catch {
      return INITIAL_INVENTORY;
    }
  },
  saveInventory: (inventory: InventoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    } catch (e) {
      console.error(e);
    }
  },

  getClients: (): ClientProfile[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  },
  saveClients: (clients: ClientProfile[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (e) {
      console.error(e);
    }
  },

  getBentoData: (): BentoDashboardData => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BENTO);
      return saved ? JSON.parse(saved) : INITIAL_BENTO_DATA_ALGERIA;
    } catch {
      return INITIAL_BENTO_DATA_ALGERIA;
    }
  },
  saveBentoData: (bento: BentoDashboardData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.BENTO, JSON.stringify(bento));
    } catch (e) {
      console.error(e);
    }
  },

  getFinancials: (): FinancialData => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FINANCIALS);
      return saved ? JSON.parse(saved) : INITIAL_FINANCIALS_ALGERIA;
    } catch {
      return INITIAL_FINANCIALS_ALGERIA;
    }
  },
  saveFinancials: (fin: FinancialData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.FINANCIALS, JSON.stringify(fin));
    } catch (e) {
      console.error(e);
    }
  },

  getSchedules: (): ScheduleEvent[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULES_ALGERIA;
    } catch {
      return INITIAL_SCHEDULES_ALGERIA;
    }
  },
  saveSchedules: (sch: ScheduleEvent[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(sch));
    } catch (e) {
      console.error(e);
    }
  },

  getInbox: (): InboxAlertItem[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INBOX);
      return saved ? JSON.parse(saved) : INITIAL_INBOX_ALGERIA;
    } catch {
      return INITIAL_INBOX_ALGERIA;
    }
  },
  saveInbox: (inbox: InboxAlertItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(inbox));
    } catch (e) {
      console.error(e);
    }
  },

  getLanguage: (): AppLanguage => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG) as AppLanguage;
      return saved && ['fr', 'en', 'ar'].includes(saved) ? saved : 'fr';
    } catch {
      return 'fr';
    }
  },
  saveLanguage: (lang: AppLanguage) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, lang);
    } catch (e) {
      console.error(e);
    }
  },

  getInvoices: (): Invoice[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  },
  saveInvoices: (invoices: Invoice[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    } catch (e) {
      console.error(e);
    }
  },

  getExpenses: (): ExpenseItem[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  },
  saveExpenses: (expenses: ExpenseItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error(e);
    }
  },

  resetAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.WORKERS);
      localStorage.removeItem(STORAGE_KEYS.INVENTORY);
      localStorage.removeItem(STORAGE_KEYS.CLIENTS);
      localStorage.removeItem(STORAGE_KEYS.BENTO);
      localStorage.removeItem(STORAGE_KEYS.FINANCIALS);
      localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
      localStorage.removeItem(STORAGE_KEYS.INBOX);
      localStorage.removeItem(STORAGE_KEYS.INVOICES);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    } catch (e) {
      console.error(e);
    }
  }
};

// ==========================================
// EXCEL / CSV ACCOUNTING EXPORT GENERATORS
// ==========================================
// Trigger browser file download with UTF-8 BOM for flawless Excel opening
function triggerCsvDownload(csvContent: string, fileName: string) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 1. Journal des Ventes (Conforme G50 : TVA 19% & TAP)
export function exportSalesJournalCSV(invoices: Invoice[], companyName: string = 'Entreprise Algérie') {
  const headers = [
    "Date",
    "N° Facture / BL",
    "Type Document",
    "Client",
    "Wilaya",
    "NIF Client",
    "Montant HT (DA)",
    "Taux TVA",
    "Montant TVA (DA)",
    "Remise (DA)",
    "Montant TTC (DA)",
    "Mode de Règlement",
    "Statut"
  ];

  const rows = invoices.map(inv => [
    `"${inv.date}"`,
    `"${inv.number}"`,
    `"${inv.type.toUpperCase()}"`,
    `"${inv.clientName.replace(/"/g, '""')}"`,
    `"${inv.clientWilaya || ''}"`,
    `"${inv.clientNif || ''}"`,
    inv.subtotalHT.toString(),
    `"${(inv.tvaRate * 100).toFixed(0)}%"`,
    inv.tvaAmountDZD.toString(),
    inv.discountDZD.toString(),
    inv.totalTTC.toString(),
    `"${inv.paymentMethod}"`,
    `"${inv.status}"`
  ]);

  const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerCsvDownload(csv, `Journal_Ventes_G50_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.csv`);
}

// 2. État d'Inventaire & Valorisation du Stock
export function exportInventoryCSV(inventory: InventoryItem[]) {
  const headers = [
    "Code SKU",
    "Désignation Produit (FR)",
    "Désignation (AR)",
    "Catégorie",
    "Quantité en Stock",
    "Unité",
    "Seuil Alerte",
    "Statut Alerte",
    "Prix Achat Unitaire (DA)",
    "Prix Vente Unitaire (DA)",
    "Valeur Totale Achat (DA)",
    "Valeur Totale Vente (DA)",
    "Fournisseur",
    "Wilaya Provenance"
  ];

  const rows = inventory.map(item => {
    const valAchat = item.stockQty * item.costPriceDZD;
    const valVente = item.stockQty * item.sellingPriceDZD;
    return [
      `"${item.sku}"`,
      `"${item.name.fr.replace(/"/g, '""')}"`,
      `"${item.name.ar.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      item.stockQty.toString(),
      `"${item.unit}"`,
      item.minStockAlert.toString(),
      item.alarmActive ? '"ALERTE RUPTURE"' : '"NORMAL"',
      item.costPriceDZD.toString(),
      item.sellingPriceDZD.toString(),
      valAchat.toString(),
      valVente.toString(),
      `"${item.supplier.replace(/"/g, '""')}"`,
      `"${item.wilayaOrigin || ''}"`
    ];
  });

  const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerCsvDownload(csv, `Etat_Stocks_Valorisation_${dateStr}.csv`);
}

// 3. Journal de Paie & Suivi CNAS Salariés
export function exportPayrollCSV(workers: Worker[]) {
  const headers = [
    "ID Employé",
    "Nom & Prénom",
    "Poste / Rôle",
    "N° CNAS",
    "Wilaya",
    "Heures ce Mois",
    "Salaire Net Mensuel (DA)",
    "Taux Horaire (DA)",
    "Date Échéance Paie",
    "Statut Règlement"
  ];

  const rows = workers.map(w => [
    `"${w.id}"`,
    `"${w.name.replace(/"/g, '""')}"`,
    `"${w.role.replace(/"/g, '""')}"`,
    `"${w.cnasNumber || 'Non renseigné'}"`,
    `"${w.wilaya}"`,
    w.hoursWorkedThisMonth.toString(),
    w.monthlySalaryDZD.toString(),
    w.hourlyRateDZD.toString(),
    `"${w.paymentDueDate}"`,
    `"${w.paymentStatus.toUpperCase()}"`
  ]);

  const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerCsvDownload(csv, `Bordereau_Paie_Salaires_CNAS_${dateStr}.csv`);
}

// 4. Journal des Dépenses & Charges d'Exploitation
export function exportExpensesCSV(expenses: ExpenseItem[]) {
  const headers = [
    "Date",
    "Réf Pièce / Reçu",
    "Catégorie Charge",
    "Libellé / Désignation",
    "Montant Décaissé (DA)",
    "Mode de Paiement",
    "Bénéficiaire",
    "Notes"
  ];

  const rows = expenses.map(exp => [
    `"${exp.date}"`,
    `"${exp.receiptRef || ''}"`,
    `"${exp.category.toUpperCase()}"`,
    `"${exp.title.replace(/"/g, '""')}"`,
    exp.amountDZD.toString(),
    `"${exp.paymentMethod}"`,
    `"${(exp.paidTo || '').replace(/"/g, '""')}"`,
    `"${(exp.notes || '').replace(/"/g, '""')}"`
  ]);

  const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerCsvDownload(csv, `Journal_Depenses_Charges_${dateStr}.csv`);
}

