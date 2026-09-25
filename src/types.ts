export type AppLanguage = 'fr' | 'en' | 'ar';

export type NavigationPage = 
  | 'overview' 
  | 'pos'
  | 'invoices'
  | 'fiscal_ledger'
  | 'carrier_tracking'
  | 'cloud_backups'
  | 'expenses'
  | 'workers' 
  | 'inventory' 
  | 'clients' 
  | 'schedule' 
  | 'financials' 
  | 'settings';

export type DashboardTab = 'Dashboard' | 'Dashboard 1' | 'Dashboard 2';

export interface WeeklyOutputDay {
  day: string;
  hours: number;
  target: number;
  revenueDZD?: number;
}

export interface LastNoteItem {
  id: string;
  type: string;
  date: string;
  status: string;
  statusPercent: number;
  duration: string;
  category: 'design' | 'dev' | 'marketing' | 'sales' | 'logistics';
  amountDZD?: number;
}

export interface MonthlyProgress {
  month: string;
  percentage: number;
  targetAchievedDZD?: string;
}

export interface BentoDashboardData {
  user: string;
  businessName: string;
  wilaya: string;
  hours_worked: number;
  tasks_completed: number;
  productive_hours: number;
  efficiency_score: string;
  total_revenue_dzd: number;
  net_profit_dzd: number;
  total_stock_value_dzd: number;
  payroll_due_dzd: number;
  active_workers_count: number;
  low_stock_alarms_count: number;
  weekly_output: WeeklyOutputDay[];
  last_notes: LastNoteItem[];
  monthly_progress: MonthlyProgress[];
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  wilaya: string;
  status: 'working' | 'on_break' | 'off_shift';
  clockInTime?: string;
  shiftStartedAt?: number;
  hoursWorkedThisMonth: number;
  monthlySalaryDZD: number;
  hourlyRateDZD: number;
  payFrequency: 'monthly' | 'hourly';
  paymentDueDate: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  lastPaidAmountDZD?: number;
  lastPaidDate?: string;
  cnasNumber?: string; // Algerian Social Security
}

export type WorkerProfile = Worker;

export interface InventoryItem {
  id: string;
  name: {
    fr: string;
    en: string;
    ar: string;
  };
  sku: string;
  barcode?: string;
  category: string;
  stockQty: number;
  unit: string; // 'pcs' | 'carton' | 'kg' | 'lot'
  minStockAlert: number; // Set by the owner
  alarmActive: boolean; // stockQty <= minStockAlert
  costPriceDZD: number;
  sellingPriceDZD: number;
  supplier: string;
  wilayaOrigin?: string;
  lastRestocked: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  company: string;
  wilaya: string; // 58 wilayas d'Algérie
  phone: string;
  email: string;
  nif?: string;
  nis?: string;
  rcNumber?: string;
  totalOrders: number;
  totalRevenueDZD: number;
  outstandingBalanceDZD: number;
  discountTier: number; // percentage
  notes: string;
  customPricingEnabled: boolean;
  status: 'active' | 'vip' | 'prospect' | 'inactive';
}

export interface BusinessSettings {
  companyName: string;
  legalForm: 'SARL' | 'EURL' | 'SPA' | 'SNC' | 'Auto-entrepreneur';
  rcNumber: string;
  nif: string;
  nis: string;
  ai: string;
  wilaya: string;
  address: string;
  phone: string;
  email: string;
  currency: 'DZD';
  currencySymbol: 'DA' | 'د.ج';
  defaultLanguage: AppLanguage;
  alarmSoundEnabled: boolean;
  defaultStockThreshold: number;
}

export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  location: string;
  status: 'Upcoming' | 'In Progress' | 'Scheduled' | 'Completed';
  status_color: string;
  dayIndex: number;
  attendees?: string[];
  clientName?: string;
  orderValueDZD?: number;
}

export interface ScheduleDay {
  dayName: string;
  dayNum: number;
  dateStr: string;
  isToday?: boolean;
}

export interface FinancialMetricItem {
  date: string;
  amountDZD: number;
  formattedDZD: string;
  label: string;
  subtitle: string;
}

export interface FinancialData {
  metrics: {
    monthly_revenue: FinancialMetricItem;
    net_margin: { percentage: string; amountDZD: number; formattedDZD: string };
    payroll_budget: FinancialMetricItem;
    cash_in_bank_dzd: number;
    baridimob_balance_dzd: number;
  };
  events: Array<{
    id: string;
    date_badge: string;
    title: string;
    desc: string;
    status: string;
    badge: string;
    amountDZD?: number;
    type: 'invoice' | 'tax' | 'payroll' | 'supplier';
  }>;
}

export interface InboxAlertItem {
  id: string;
  type: 'trade' | 'advisor' | 'statement' | 'deposit' | 'stock_alarm' | 'payroll_alert';
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  priority?: 'high' | 'normal';
}

export interface InspectedElementInfo {
  id: string;
  name: string;
  description: string;
  tag: string;
  parent: string;
  classes: string;
  dimensions: { width: number; height: number; x: number; y: number };
  dataSnippet?: Record<string, unknown> | unknown[];
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPriceDZD: number;
  totalDZD: number;
}

export type InvoiceType = 'facture' | 'bon_livraison' | 'proforma' | 'avoir';

export type UserRole = 'gerant' | 'caissier' | 'magasinier' | 'comptable';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  email: string;
  phone?: string;
  wilaya: string;
  avatarColor: string;
  avatarIcon: string;
  lastLogin?: string;
  createdAt: string;
  isCustom?: boolean;
}

export interface UserSession {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  email: string;
  wilaya: string;
  avatarColor: string;
  avatarIcon?: string;
  loginTimestamp?: string;
  token?: string;
}

export type AlgerianCarrier = 'yalidine' | 'zr_express' | 'procolis' | 'maystro';

export type ParcelStatus = 
  | 'en_preparation' 
  | 'expedie' 
  | 'en_centre_transit' 
  | 'en_livraison' 
  | 'livre' 
  | 'echec_livraison' 
  | 'retourne' 
  | 'encaisse';

export interface CarrierTrackingEvent {
  status: ParcelStatus;
  timestamp: string;
  hubLocation: string;
  note: string;
}

export interface CarrierShipment {
  id: string;
  carrier: AlgerianCarrier;
  trackingNumber: string;
  documentNumber: string; // Associated FAC or BL
  recipientName: string;
  recipientPhone: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  deliveryAddress: string;
  deliveryType: 'domicile' | 'stop_desk';
  stopDeskOffice?: string;
  codAmountDZD: number; // Cash on delivery (Montant contre-remboursement)
  shippingFeeDZD: number;
  status: ParcelStatus;
  history: CarrierTrackingEvent[];
  createdAt: string;
  updatedAt: string;
  barcodeUrl?: string;
}

export interface FiscalLedgerEntry {
  index: number;
  timestamp: string;
  documentNumber: string; // FAC-2026-0001, AVOIR-2026-0001, etc.
  documentType: 'facture' | 'avoir' | 'bon_livraison';
  clientName: string;
  clientNif?: string;
  amountHT: number;
  tvaRate: number;
  tvaAmountDZD: number;
  totalTTC: number;
  previousHash: string;
  hash: string;
  operatorName: string;
  operatorRole: UserRole;
  referenceDocNumber?: string; // For Avoirs
  isTamperProof: boolean;
}

export interface CloudDbStatus {
  engine: 'mongodb_atlas' | 'postgresql' | 'hybrid_vault';
  connected: boolean;
  clusterUri: string;
  databaseName: string;
  tenantId: string;
  activePoolConnections: number;
  latencyMs: number;
  lastBackupTimestamp: string;
  nextScheduledBackup: string;
  encryptionMode: 'AES-256-GCM (En-Transit & Au Repos)';
  totalRecords: {
    invoices: number;
    fiscalLedger: number;
    inventory: number;
    clients: number;
    workers: number;
    expenses: number;
  };
}

export interface DatabaseBackupRecord {
  id: string;
  filename: string;
  timestamp: string;
  sizeBytes: number;
  formattedSize: string;
  checksumSha256: string;
  encryption: 'AES-256-GCM';
  recordCount: number;
  status: 'verified' | 'completed' | 'restoring';
  tenantId: string;
  backupType: 'automatic_daily' | 'manual_snapshot';
}

export interface Invoice {
  id: string;
  number: string; // e.g. "FAC-2026-0042", "BL-2026-0018", "AVOIR-2026-0001"
  type: InvoiceType;
  date: string;
  dueDate?: string;
  clientId?: string;
  clientName: string;
  clientCompany?: string;
  clientWilaya?: string;
  clientNif?: string;
  clientNis?: string;
  clientRc?: string;
  clientAddress?: string;
  items: InvoiceItem[];
  subtotalHT: number;
  tvaRate: number; // 0.19 for 19% or 0 for exempt
  tvaAmountDZD: number;
  discountDZD: number;
  totalTTC: number;
  paymentMethod: 'especes' | 'baridimob' | 'virement_cib' | 'cheque';
  status: 'payee' | 'en_attente' | 'annulee' | 'avoir_applique';
  notes?: string;
  // Fiscal immutability & G50 audit fields
  isLocked?: boolean;
  referenceInvoiceId?: string;
  referenceInvoiceNumber?: string;
  creditReason?: string;
  fiscalHash?: string;
  previousFiscalHash?: string;
  ledgerIndex?: number;
  // Algerian carrier shipment embedded in delivery slips
  carrierShipment?: CarrierShipment;
}

export type ExpenseCategory = 
  | 'loyer' 
  | 'sonelgaz' 
  | 'transport_livraison' 
  | 'fournisseurs' 
  | 'impots_cnas' 
  | 'salaires' 
  | 'materiel' 
  | 'autre';

export interface ExpenseItem {
  id: string;
  date: string;
  category: ExpenseCategory;
  title: string;
  amountDZD: number;
  paymentMethod: 'especes' | 'baridimob' | 'virement_cib' | 'cheque';
  paidTo?: string;
  notes?: string;
  receiptRef?: string;
}

