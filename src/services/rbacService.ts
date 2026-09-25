import { NavigationPage, UserRole, UserSession } from '../types';

export const USER_ROLES_CONFIG: Record<UserRole, {
  role: UserRole;
  title: string;
  badgeColor: string;
  avatarIcon: string;
  description: string;
  allowedPages: NavigationPage[];
  canViewCostPrices: boolean;
  canViewProfitMargins: boolean;
  canViewSalaries: boolean;
  canManageSettings: boolean;
  canManageBackups: boolean;
}> = {
  gerant: {
    role: 'gerant',
    title: 'Gérant / Administrateur',
    badgeColor: 'bg-[#e4fc65] text-slate-950 font-black',
    avatarIcon: '👑',
    description: 'Accès total & illimité : marges bénéficiaires, audit fiscal G50, salaires CNAS et backups cloud.',
    allowedPages: [
      'overview',
      'pos',
      'invoices',
      'fiscal_ledger',
      'carrier_tracking',
      'cloud_backups',
      'expenses',
      'workers',
      'inventory',
      'clients',
      'schedule',
      'financials',
      'settings'
    ],
    canViewCostPrices: true,
    canViewProfitMargins: true,
    canViewSalaries: true,
    canManageSettings: true,
    canManageBackups: true
  },
  caissier: {
    role: 'caissier',
    title: 'Caissier (Vente Comptoir)',
    badgeColor: 'bg-amber-400 text-slate-950 font-black',
    avatarIcon: '🛒',
    description: 'Accès strict au terminal POS et tickets de caisse 80mm. Marges et coûts d\'achats strictement masqués.',
    allowedPages: ['pos'],
    canViewCostPrices: false,
    canViewProfitMargins: false,
    canViewSalaries: false,
    canManageSettings: false,
    canManageBackups: false
  },
  magasinier: {
    role: 'magasinier',
    title: 'Magasinier (Gestion Stock & BL)',
    badgeColor: 'bg-sky-400 text-slate-950 font-black',
    avatarIcon: '📦',
    description: 'Gestion des entrées/sorties de stock, seuils d\'alerte, scan code-barres et expéditions Bons de Livraison.',
    allowedPages: ['inventory', 'invoices', 'carrier_tracking'],
    canViewCostPrices: false,
    canViewProfitMargins: false,
    canViewSalaries: false,
    canManageSettings: false,
    canManageBackups: false
  },
  comptable: {
    role: 'comptable',
    title: 'Comptable (Fiscalité G50 & CNAS)',
    badgeColor: 'bg-emerald-400 text-slate-950 font-black',
    avatarIcon: '📑',
    description: 'Accès aux factures officielles, registre fiscal G50, avoirs, charges d\'exploitation et états de paie CNAS.',
    allowedPages: ['invoices', 'fiscal_ledger', 'expenses', 'workers', 'financials', 'clients'],
    canViewCostPrices: true,
    canViewProfitMargins: true,
    canViewSalaries: true,
    canManageSettings: false,
    canManageBackups: true
  }
};

export const SAMPLE_USERS: UserSession[] = [
  {
    id: 'usr-1',
    username: 'gerant',
    name: 'Yacine Mansouri',
    role: 'gerant',
    roleTitle: 'Directeur Général & Fondateur',
    email: 'direction@atlas-algerie.dz',
    wilaya: '16 - Alger',
    avatarColor: 'bg-slate-900 text-[#e4fc65]',
    avatarIcon: '👑',
    loginTimestamp: '2026-09-22 08:30'
  },
  {
    id: 'usr-2',
    username: 'caissier',
    name: 'Karim Belkacem',
    role: 'caissier',
    roleTitle: 'Caissier Caisse Centrale 01',
    email: 'caisse01@atlas-algerie.dz',
    wilaya: '16 - Alger',
    avatarColor: 'bg-amber-500 text-white',
    avatarIcon: '🛒',
    loginTimestamp: '2026-09-22 08:45'
  },
  {
    id: 'usr-3',
    username: 'magasinier',
    name: 'Sofiane Haddad',
    role: 'magasinier',
    roleTitle: 'Chef Magasinier Dépôt Principal',
    email: 'stock@atlas-algerie.dz',
    wilaya: '16 - Alger',
    avatarColor: 'bg-sky-500 text-white',
    avatarIcon: '📦',
    loginTimestamp: '2026-09-22 08:15'
  },
  {
    id: 'usr-4',
    username: 'comptable',
    name: 'Amina Bouzid',
    role: 'comptable',
    roleTitle: 'Comptable Agréée & Fiscaliste G50',
    email: 'compta@atlas-algerie.dz',
    wilaya: '31 - Oran',
    avatarColor: 'bg-emerald-600 text-white',
    avatarIcon: '📑',
    loginTimestamp: '2026-09-22 07:50'
  }
];

export function isPageAllowed(page: NavigationPage, role: UserRole): boolean {
  return USER_ROLES_CONFIG[role].allowedPages.includes(page);
}

export function maskConfidentialValue(value: number | string, canView: boolean, unit: string = 'DA'): string {
  if (canView) {
    if (typeof value === 'number') {
      return `${value.toLocaleString('fr-DZ')} ${unit}`;
    }
    return String(value);
  }
  return '•••••• (Confidentiel)';
}
