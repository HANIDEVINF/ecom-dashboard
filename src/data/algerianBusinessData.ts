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
  Worker 
} from '../types';

export const ALGERIA_WILAYAS = [
  "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna", 
  "06 - Béjaïa", "07 - Biskra", "08 - Béchar", "09 - Blida", "10 - Bouira", 
  "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", 
  "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda", 
  "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine", 
  "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla", 
  "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arréridj", "35 - Boumerdès", 
  "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela", 
  "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma", 
  "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - Timimoun", "50 - Bordj Badji Mokhtar", 
  "51 - Ouled Djellal", "52 - Béni Abbès", "53 - In Salah", "54 - In Guezzam", "55 - Touggourt", 
  "56 - Djanet", "57 - El M'Ghair", "58 - El Meniaa"
];

export const INITIAL_BUSINESS_SETTINGS: BusinessSettings = {
  companyName: "Atlas Solutions & Commerce Algérie",
  legalForm: "SARL",
  rcNumber: "16/00-0982341B22",
  nif: "002216090123847",
  nis: "099216010045291",
  ai: "16023910245",
  wilaya: "16 - Alger",
  address: "Lot N° 14, Zone d'Activité Dar El Beïda, Alger, Algérie",
  phone: "+213 (0) 23 78 45 12 / +213 550 12 34 56",
  email: "direction@atlas-algerie.dz",
  currency: "DZD",
  currencySymbol: "DA",
  defaultLanguage: "fr",
  alarmSoundEnabled: true,
  defaultStockThreshold: 5
};

export const INITIAL_WORKERS: Worker[] = [
  {
    id: "wrk-1",
    name: "Yacine Mansouri",
    role: "Responsable Logistique & Expéditions",
    phone: "+213 551 23 45 67",
    wilaya: "16 - Alger",
    status: "working",
    clockInTime: "08:00 AM",
    shiftStartedAt: Date.now() - 3.5 * 3600 * 1000,
    hoursWorkedThisMonth: 154,
    monthlySalaryDZD: 85000,
    hourlyRateDZD: 500,
    payFrequency: "monthly",
    paymentDueDate: "30/09/2026",
    paymentStatus: "paid",
    lastPaidAmountDZD: 85000,
    lastPaidDate: "31/08/2026",
    cnasNumber: "16-892341-01"
  },
  {
    id: "wrk-2",
    name: "Amina Bouzid",
    role: "Comptable & Gestionnaire de Stocks",
    phone: "+213 662 34 56 78",
    wilaya: "31 - Oran",
    status: "working",
    clockInTime: "08:30 AM",
    shiftStartedAt: Date.now() - 3 * 3600 * 1000,
    hoursWorkedThisMonth: 142,
    monthlySalaryDZD: 72000,
    hourlyRateDZD: 450,
    payFrequency: "monthly",
    paymentDueDate: "30/09/2026",
    paymentStatus: "pending",
    lastPaidAmountDZD: 72000,
    lastPaidDate: "31/08/2026",
    cnasNumber: "31-482910-09"
  },
  {
    id: "wrk-3",
    name: "Karim Belkacem",
    role: "Chauffeur & Livreur 58 Wilayas",
    phone: "+213 773 45 67 89",
    wilaya: "19 - Sétif",
    status: "working",
    clockInTime: "07:15 AM",
    shiftStartedAt: Date.now() - 4.2 * 3600 * 1000,
    hoursWorkedThisMonth: 168,
    monthlySalaryDZD: 65000,
    hourlyRateDZD: 400,
    payFrequency: "monthly",
    paymentDueDate: "30/09/2026",
    paymentStatus: "pending",
    lastPaidAmountDZD: 65000,
    lastPaidDate: "31/08/2026",
    cnasNumber: "19-781203-14"
  },
  {
    id: "wrk-4",
    name: "Sofiane Haddad",
    role: "Technicien Maintenance & Support",
    phone: "+213 554 56 78 90",
    wilaya: "25 - Constantine",
    status: "off_shift",
    clockInTime: undefined,
    hoursWorkedThisMonth: 128,
    monthlySalaryDZD: 58000,
    hourlyRateDZD: 380,
    payFrequency: "monthly",
    paymentDueDate: "30/09/2026",
    paymentStatus: "pending",
    lastPaidAmountDZD: 58000,
    lastPaidDate: "31/08/2026",
    cnasNumber: "25-391048-22"
  },
  {
    id: "wrk-5",
    name: "Meriem Cherif",
    role: "Déléguée Commerciale Grands Comptes",
    phone: "+213 665 67 89 01",
    wilaya: "09 - Blida",
    status: "working",
    clockInTime: "09:00 AM",
    shiftStartedAt: Date.now() - 2.5 * 3600 * 1000,
    hoursWorkedThisMonth: 150,
    monthlySalaryDZD: 95000,
    hourlyRateDZD: 600,
    payFrequency: "monthly",
    paymentDueDate: "30/09/2026",
    paymentStatus: "paid",
    lastPaidAmountDZD: 95000,
    lastPaidDate: "31/08/2026",
    cnasNumber: "09-601928-05"
  },
  {
    id: "wrk-6",
    name: "Reda Zerrouki",
    role: "Magasinier & Contrôle Qualité",
    phone: "+213 776 78 90 12",
    wilaya: "23 - Annaba",
    status: "on_break",
    clockInTime: "08:00 AM",
    shiftStartedAt: Date.now() - 3.5 * 3600 * 1000,
    hoursWorkedThisMonth: 135,
    monthlySalaryDZD: 52000,
    hourlyRateDZD: 350,
    payFrequency: "monthly",
    paymentDueDate: "30/09/2026",
    paymentStatus: "pending",
    lastPaidAmountDZD: 52000,
    lastPaidDate: "31/08/2026",
    cnasNumber: "23-102938-11"
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "inv-1",
    name: {
      fr: "PC Portable Pro Core i7 / 16GB RAM / 512GB SSD",
      en: "Pro Laptop Core i7 / 16GB RAM / 512GB SSD",
      ar: "حاسوب محمول احترافي Core i7 / 16GB / 512GB SSD"
    },
    sku: "TECH-DZ-01",
    category: "Informatique",
    stockQty: 3, // Below alarm of 5!
    unit: "pcs",
    minStockAlert: 5,
    alarmActive: true,
    costPriceDZD: 98000,
    sellingPriceDZD: 128000,
    supplier: "Grossiste El Eulma IT",
    wilayaOrigin: "19 - Sétif",
    lastRestocked: "10/09/2026"
  },
  {
    id: "inv-2",
    name: {
      fr: "Onduleur Hybride 3000VA Stabilisé Anti-Coupure",
      en: "Hybrid UPS 3000VA Surge Protected",
      ar: "مغذي طاقة احتياطي هجين 3000VA لحماية الأجهزة"
    },
    sku: "ELEC-DZ-88",
    category: "Électricité & Protection",
    stockQty: 2, // Below alarm of 4!
    unit: "pcs",
    minStockAlert: 4,
    alarmActive: true,
    costPriceDZD: 44000,
    sellingPriceDZD: 59000,
    supplier: "Sarl Électro Kouba",
    wilayaOrigin: "16 - Alger",
    lastRestocked: "05/09/2026"
  },
  {
    id: "inv-3",
    name: {
      fr: "Bobines Papier Thermique TPE / CIB (Carton de 50)",
      en: "Thermal Paper Rolls for POS/CIB (Box of 50)",
      ar: "لفافات ورق حراري لأجهزة الدفع CIB (صندوق 50)"
    },
    sku: "CONS-DZ-12",
    category: "Consommables CIB",
    stockQty: 38,
    unit: "carton",
    minStockAlert: 10,
    alarmActive: false,
    costPriceDZD: 3200,
    sellingPriceDZD: 4600,
    supplier: "Papeterie Centrale d'Oran",
    wilayaOrigin: "31 - Oran",
    lastRestocked: "18/09/2026"
  },
  {
    id: "inv-4",
    name: {
      fr: "Écran Moniteur 27'' IPS Full HD Antireflet",
      en: "27'' IPS Full HD Anti-Glare Monitor",
      ar: "شاشة كمبيوتر 27 بوصة IPS عالية الدقة ضد الانعكاس"
    },
    sku: "DISP-DZ-99",
    category: "Informatique",
    stockQty: 14,
    unit: "pcs",
    minStockAlert: 4,
    alarmActive: false,
    costPriceDZD: 29000,
    sellingPriceDZD: 38500,
    supplier: "Grossiste IT Hydra",
    wilayaOrigin: "16 - Alger",
    lastRestocked: "12/09/2026"
  },
  {
    id: "inv-5",
    name: {
      fr: "Lecteur Code-barres Sans Fil 2D & QR Code",
      en: "Wireless 2D & QR Code Barcode Scanner",
      ar: "قارئ باركود لاسلكي للرموز ثنائية الأبعاد QR"
    },
    sku: "SCAN-DZ-40",
    category: "Équipements Point de Vente",
    stockQty: 2, // Below alarm of 5!
    unit: "pcs",
    minStockAlert: 5,
    alarmActive: true,
    costPriceDZD: 11500,
    sellingPriceDZD: 17000,
    supplier: "EURL POS Constantine",
    wilayaOrigin: "25 - Constantine",
    lastRestocked: "01/09/2026"
  },
  {
    id: "inv-6",
    name: {
      fr: "Câble Réseau Cuivre Blindé CAT6 305 Mètres",
      en: "CAT6 Shielded Copper Network Cable 305m",
      ar: "كابل شبكة نحاسي محمي CAT6 بطول 305 متر"
    },
    sku: "NET-DZ-06",
    category: "Réseaux & Câblage",
    stockQty: 18,
    unit: "rouleau",
    minStockAlert: 5,
    alarmActive: false,
    costPriceDZD: 13500,
    sellingPriceDZD: 18900,
    supplier: "Câblerie Algérienne de Blida",
    wilayaOrigin: "09 - Blida",
    lastRestocked: "15/09/2026"
  }
];

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: "cli-1",
    name: "Mohamed Amine Larbi",
    company: "Sarl El Mordjene Distribution",
    wilaya: "16 - Alger",
    phone: "+213 550 99 88 77",
    email: "direction@elmordjene.dz",
    nif: "001816099238472",
    nis: "099116049281048",
    rcNumber: "16/00-0891234B21",
    totalOrders: 28,
    totalRevenueDZD: 3850000,
    outstandingBalanceDZD: 180000,
    discountTier: 10,
    notes: "Client VIP, livraison prioritaire sur Alger et Boumerdès. Règlements par virement BNA.",
    customPricingEnabled: true,
    status: "vip"
  },
  {
    id: "cli-2",
    name: "Fatima Zohra Touati",
    company: "EURL Bahia Tech & Solutions",
    wilaya: "31 - Oran",
    phone: "+213 661 44 33 22",
    email: "contact@bahiatech.dz",
    nif: "099231002381204",
    nis: "099231010092814",
    rcNumber: "31/00-0192847B20",
    totalOrders: 19,
    totalRevenueDZD: 2450000,
    outstandingBalanceDZD: 0,
    discountTier: 5,
    notes: "Partenaire régional Oran, paiement toujours à l'heure via BaridiMob ou CIB.",
    customPricingEnabled: true,
    status: "vip"
  },
  {
    id: "cli-3",
    name: "Belkacem Benali",
    company: "Établissement Benali & Frères",
    wilaya: "19 - Sétif",
    phone: "+213 770 12 90 84",
    email: "benali.freres@gmail.com",
    totalOrders: 14,
    totalRevenueDZD: 1780000,
    outstandingBalanceDZD: 95000,
    discountTier: 0,
    notes: "Commandes régulières de consommables CIB et câbles réseau.",
    customPricingEnabled: false,
    status: "active"
  },
  {
    id: "cli-4",
    name: "Abdelkader Rahmani",
    company: "Numidia Transport & Logistique",
    wilaya: "25 - Constantine",
    phone: "+213 552 87 65 43",
    email: "logistique@numidia-dz.com",
    nif: "001925010029384",
    totalOrders: 32,
    totalRevenueDZD: 5400000,
    outstandingBalanceDZD: 0,
    discountTier: 12,
    notes: "Grand compte transporteur. Contrat annuel de maintenance informatique.",
    customPricingEnabled: true,
    status: "vip"
  },
  {
    id: "cli-5",
    name: "Dr. Samira Khelifi",
    company: "Pharmacie Centrale de la Mitidja",
    wilaya: "09 - Blida",
    phone: "+213 663 21 09 87",
    email: "mitidja.pharma@yahoo.fr",
    totalOrders: 9,
    totalRevenueDZD: 920000,
    outstandingBalanceDZD: 45000,
    discountTier: 3,
    notes: "Équipement caisse et lecteurs code-barres pour officines.",
    customPricingEnabled: false,
    status: "active"
  }
];

export const INITIAL_BENTO_DATA_ALGERIA: BentoDashboardData = {
  user: "Directeur Général",
  businessName: "Atlas Solutions & Commerce Algérie",
  wilaya: "16 - Alger",
  hours_worked: 184,
  tasks_completed: 42,
  productive_hours: 680,
  efficiency_score: "98.7%",
  total_revenue_dzd: 4850000, // 4.85 Million DA this month
  net_profit_dzd: 1420000, // 1.42 Million DA
  total_stock_value_dzd: 3890000, // 3.89 Million DA in stock
  payroll_due_dzd: 427000, // 427,000 DA monthly payroll
  active_workers_count: 4, // currently clocked in
  low_stock_alarms_count: 3, // active alarms!
  weekly_output: [
    { day: "Dim", hours: 8, target: 8, revenueDZD: 720000 },
    { day: "Lun", hours: 9, target: 8, revenueDZD: 950000 },
    { day: "Mar", hours: 7, target: 8, revenueDZD: 680000 },
    { day: "Mer", hours: 8.5, target: 8, revenueDZD: 840000 },
    { day: "Jeu", hours: 8, target: 8, revenueDZD: 920000 },
    { day: "Ven", hours: 0, target: 0, revenueDZD: 0 },
    { day: "Sam", hours: 4, target: 4, revenueDZD: 420000 }
  ],
  monthly_progress: [
    { month: "Juillet 2026", percentage: 88, targetAchievedDZD: "3 900 000 DA" },
    { month: "Août 2026", percentage: 94, targetAchievedDZD: "4 350 000 DA" },
    { month: "Septembre 2026 (En cours)", percentage: 76, targetAchievedDZD: "4 850 000 DA" }
  ],
  last_notes: [
    {
      id: "op-1",
      type: "Livraison 15 PC Pro Sarl El Mordjene",
      date: "21.09.2026",
      status: "100%",
      statusPercent: 100,
      duration: "1 920 000 DA",
      category: "sales",
      amountDZD: 1920000
    },
    {
      id: "op-2",
      type: "Virement Salaires Équipe Septembre",
      date: "20.09.2026",
      status: "70%",
      statusPercent: 70,
      duration: "427 000 DA",
      category: "dev",
      amountDZD: 427000
    },
    {
      id: "op-3",
      type: "Réapprovisionnement Câblerie Blida",
      date: "19.09.2026",
      status: "90%",
      statusPercent: 90,
      duration: "243 000 DA",
      category: "logistics",
      amountDZD: 243000
    }
  ]
};

export const INITIAL_FINANCIALS_ALGERIA: FinancialData = {
  metrics: {
    monthly_revenue: {
      date: "Septembre 2026",
      amountDZD: 4850000,
      formattedDZD: "4 850 000 DA",
      label: "Chiffre d'Affaires Mensuel",
      subtitle: "+18.4% vs Août 2026"
    },
    net_margin: {
      percentage: "29.2%",
      amountDZD: 1420000,
      formattedDZD: "1 420 000 DA"
    },
    payroll_budget: {
      date: "Échéance: 30/09/2026",
      amountDZD: 427000,
      formattedDZD: "427 000 DA",
      label: "Masse Salariale Nette",
      subtitle: "6 employés (4 en attente, 2 réglés)"
    },
    cash_in_bank_dzd: 6420000,
    baridimob_balance_dzd: 1180000
  },
  events: [
    {
      id: "fin-dz-1",
      date_badge: "30 SEP",
      title: "Règlement des Salaires des Employés (Septembre)",
      desc: "Virements bancaires CCP / BNA pour 6 collaborateurs (427 000 DA)",
      status: "Prévu",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      amountDZD: 427000,
      type: "payroll"
    },
    {
      id: "fin-dz-2",
      date_badge: "25 SEP",
      title: "Encaissement Facture N° 2026-088 (Numidia Transport)",
      desc: "Règlement par virement CIB bancaire direct (+1 250 000 DA)",
      status: "Confirmé",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      amountDZD: 1250000,
      type: "invoice"
    },
    {
      id: "fin-dz-3",
      date_badge: "20 OCT",
      title: "Déclaration Fiscale Mensuelle G50 (TVA 19% + TAP)",
      desc: "Direction Générale des Impôts (DGI) - Centre des Impôts Dar El Beïda",
      status: "Fiscalité",
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      type: "tax"
    },
    {
      id: "fin-dz-4",
      date_badge: "15 OCT",
      title: "Cotisation CNAS Trimestrielle (Sécurité Sociale)",
      desc: "Déclaration et télérèglement des cotisations patronales & salariales",
      status: "Social",
      badge: "bg-purple-50 text-purple-700 border-purple-200",
      type: "tax"
    }
  ]
};

export const INITIAL_SCHEDULES_ALGERIA: ScheduleEvent[] = [
  {
    id: "sch-dz-1",
    time: "09:00 AM - 10:30 AM",
    title: "Pointage & Réunion Matinale de Chantier / Équipe",
    location: "Salle de réunion Dar El Beïda • Présentiel & Visioconférence",
    status: "Upcoming",
    status_color: "bg-slate-100 text-slate-700 border-slate-200",
    dayIndex: 0,
    attendees: ["Yacine Mansouri", "Amina Bouzid", "Direction"]
  },
  {
    id: "sch-dz-2",
    time: "11:00 AM - 01:00 PM",
    title: "Livraison & Installation chez Sarl El Mordjene",
    location: "Parc d'Activité Sidi Moussa, Alger (Camion N° 02)",
    status: "In Progress",
    status_color: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
    dayIndex: 0,
    attendees: ["Karim Belkacem", "Sofiane Haddad"],
    clientName: "Sarl El Mordjene",
    orderValueDZD: 1920000
  },
  {
    id: "sch-dz-3",
    time: "02:30 PM - 03:30 PM",
    title: "Contrôle d'Inventaire & Niveaux d'Alarmes Stock",
    location: "Dépôt Principal Bâtiment B",
    status: "Scheduled",
    status_color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dayIndex: 0,
    attendees: ["Reda Zerrouki", "Amina Bouzid"]
  },
  {
    id: "sch-dz-4",
    time: "04:00 PM - 05:00 PM",
    title: "Présentation Devis & Négociation EURL Bahia Tech",
    location: "Appel Visio • Bureau Oran",
    status: "Upcoming",
    status_color: "bg-amber-50 text-amber-700 border-amber-200",
    dayIndex: 0,
    clientName: "EURL Bahia Tech",
    orderValueDZD: 850000
  }
];

export const INITIAL_INBOX_ALGERIA: InboxAlertItem[] = [
  {
    id: "inb-1",
    type: "stock_alarm",
    title: "⚠️ ALERTE STOCK CRITIQUE : PC Portable Pro",
    desc: "Le stock de PC Portables est descendu à 3 unités (seuil fixé par le propriétaire : 5 unités). Veuillez réapprovisionner auprès du grossiste.",
    time: "Il y a 10 min",
    unread: true,
    priority: "high"
  },
  {
    id: "inb-2",
    type: "stock_alarm",
    title: "⚠️ ALERTE STOCK : Onduleur Hybride 3000VA",
    desc: "Il ne reste que 2 onduleurs disponibles en stock (seuil d'alarme : 4 unités). Risque de rupture pour les prochaines commandes.",
    time: "Il y a 35 min",
    unread: true,
    priority: "high"
  },
  {
    id: "inb-3",
    type: "payroll_alert",
    title: "Pointage Équipe : Karim Belkacem a démarré sa tournée",
    desc: "Le chauffeur a pointé son départ à 07:15 AM avec le camion N° 02 pour la livraison Sétif - Constantine.",
    time: "Il y a 1 heure",
    unread: true
  },
  {
    id: "inb-4",
    type: "deposit",
    title: "Encaissement BaridiMob Reçu : 180 000 DA",
    desc: "Virement instantané reçu de Sarl El Mordjene sur le compte RIP / CCP de l'entreprise. Solde mis à jour.",
    time: "Hier",
    unread: false
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-2026-0042",
    number: "FAC-2026-0042",
    type: "facture",
    date: "2026-09-18",
    dueDate: "2026-10-18",
    clientId: "cl-1",
    clientName: "Sarl El Mordjene Agro",
    clientCompany: "Sarl El Mordjene Agro-Industrie",
    clientWilaya: "09 - Blida",
    clientNif: "001909012398412",
    clientNis: "099009023412091",
    clientRc: "09/00-1289382B19",
    clientAddress: "Zone Industrielle Ben Boulaïd, Blida",
    items: [
      {
        productId: "inv-2",
        productName: "Onduleur Hybride 3000VA Stabilisé Anti-Coupure",
        sku: "ELEC-DZ-88",
        quantity: 2,
        unitPriceDZD: 59000,
        totalDZD: 118000
      },
      {
        productId: "inv-1",
        productName: "PC Portable Pro Core i7 / 16GB RAM / 512GB SSD",
        sku: "TECH-DZ-01",
        quantity: 1,
        unitPriceDZD: 128000,
        totalDZD: 128000
      }
    ],
    subtotalHT: 246000,
    tvaRate: 0.19,
    tvaAmountDZD: 46740,
    discountDZD: 0,
    totalTTC: 292740,
    paymentMethod: "virement_cib",
    status: "payee",
    notes: "Facture acquittée par virement bancaire BNA. Marchandise livrée conforme."
  },
  {
    id: "inv-2026-0043",
    number: "FAC-2026-0043",
    type: "facture",
    date: "2026-09-19",
    dueDate: "2026-10-19",
    clientId: "cl-2",
    clientName: "EURL Bahia Tech Solutions",
    clientCompany: "EURL Bahia Tech Solutions",
    clientWilaya: "31 - Oran",
    clientNif: "002031094857123",
    clientNis: "099131010098432",
    clientRc: "31/00-0876123B20",
    clientAddress: "Boulevard de l'ALN, Oran",
    items: [
      {
        productId: "inv-3",
        productName: "Caméra Surveillance IP 4K Vision Nocturne",
        sku: "SEC-DZ-4K",
        quantity: 4,
        unitPriceDZD: 22000,
        totalDZD: 88000
      }
    ],
    subtotalHT: 88000,
    tvaRate: 0.19,
    tvaAmountDZD: 16720,
    discountDZD: 5000,
    totalTTC: 99720,
    paymentMethod: "baridimob",
    status: "payee",
    notes: "Règlement instantané via BaridiMob. Livraison express Yalidine."
  },
  {
    id: "bl-2026-0019",
    number: "BL-2026-0019",
    type: "bon_livraison",
    date: "2026-09-20",
    clientId: "cl-3",
    clientName: "Ets Khenchela BTP & Matériaux",
    clientCompany: "Ets Khenchela BTP & Matériaux",
    clientWilaya: "40 - Khenchela",
    clientNif: "001840019283741",
    clientAddress: "Route de Batna, Khenchela",
    items: [
      {
        productId: "inv-4",
        productName: "Rouleau Câble Réseau Blindé Cat6 FTP 305m",
        sku: "CAB-CAT6-305",
        quantity: 5,
        unitPriceDZD: 16500,
        totalDZD: 82500
      }
    ],
    subtotalHT: 82500,
    tvaRate: 0,
    tvaAmountDZD: 0,
    discountDZD: 0,
    totalTTC: 82500,
    paymentMethod: "cheque",
    status: "en_attente",
    notes: "Bon de livraison accompagnant le transporteur. Chèque remis à la réception."
  },
  {
    id: "pro-2026-0008",
    number: "PRO-2026-0008",
    type: "proforma",
    date: "2026-09-21",
    dueDate: "2026-10-21",
    clientId: "cl-4",
    clientName: "Clinique Privée El Azhar",
    clientCompany: "Clinique Privée El Azhar",
    clientWilaya: "16 - Alger",
    clientNif: "001616098234129",
    clientAddress: "Dely Ibrahim, Alger",
    items: [
      {
        productId: "inv-1",
        productName: "PC Portable Pro Core i7 / 16GB RAM / 512GB SSD",
        sku: "TECH-DZ-01",
        quantity: 3,
        unitPriceDZD: 128000,
        totalDZD: 384000
      },
      {
        productId: "inv-2",
        productName: "Onduleur Hybride 3000VA Stabilisé Anti-Coupure",
        sku: "ELEC-DZ-88",
        quantity: 3,
        unitPriceDZD: 59000,
        totalDZD: 177000
      }
    ],
    subtotalHT: 561000,
    tvaRate: 0.19,
    tvaAmountDZD: 106590,
    discountDZD: 20000,
    totalTTC: 647590,
    paymentMethod: "virement_cib",
    status: "en_attente",
    notes: "Facture proforma pour accord de direction et bon de commande."
  }
];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: "exp-1",
    date: "2026-09-02",
    category: "loyer",
    title: "Loyer Local Commercial & Entrepôt (Mois Septembre)",
    amountDZD: 120000,
    paymentMethod: "virement_cib",
    paidTo: "Propriétaire Immobilière Dar El Beïda",
    notes: "Virement bancaire compte BNA",
    receiptRef: "VIR-BNA-8921"
  },
  {
    id: "exp-2",
    date: "2026-09-08",
    category: "sonelgaz",
    title: "Facture Sonelgaz Électricité Moyenne Tension & Gaz",
    amountDZD: 38500,
    paymentMethod: "especes",
    paidTo: "Société de Distribution Sonelgaz El Harrach",
    notes: "Paiement en espèces au guichet Sonelgaz",
    receiptRef: "SON-2026-0934"
  },
  {
    id: "exp-3",
    date: "2026-09-12",
    category: "transport_livraison",
    title: "Expéditions Colis & Fret 58 Wilayas (Yalidine Express)",
    amountDZD: 24800,
    paymentMethod: "especes",
    paidTo: "Yalidine Express Agence Bab Ezzouar",
    notes: "Bordereau de 18 colis expédiés vers Oran, Sétif et Constantine",
    receiptRef: "YAL-BL-4421"
  },
  {
    id: "exp-4",
    date: "2026-09-15",
    category: "fournisseurs",
    title: "Achat Lot Câbles & Matériel Réseau auprès du Grossiste",
    amountDZD: 196000,
    paymentMethod: "virement_cib",
    paidTo: "Grossiste El Eulma IT Import",
    notes: "Bon de commande N° BC-9941 acquitté",
    receiptRef: "FAC-EUL-882"
  },
  {
    id: "exp-5",
    date: "2026-09-17",
    category: "impots_cnas",
    title: "Cotisations Trimestrielles CNAS Déclaration Salaires",
    amountDZD: 68000,
    paymentMethod: "cheque",
    paidTo: "Caisse Nationale des Assurances Sociales (CNAS Alger)",
    notes: "Bordereau déclaratif trimestriel salariés",
    receiptRef: "CNAS-CHQ-102"
  },
  {
    id: "exp-6",
    date: "2026-09-19",
    category: "materiel",
    title: "Fournitures de bureau, rubans d'emballage & étiquettes code-barres",
    amountDZD: 14500,
    paymentMethod: "baridimob",
    paidTo: "Papeterie & Emballage Algiers Pro",
    notes: "Paiement instantané BaridiMob",
    receiptRef: "BM-TX-99014"
  }
];

export const FLASK_MONGODB_ALGERIA_BACKEND = `# backend/app.py - Enterprise Algeria Backend (Flask + Localhost MongoDB)
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# MongoDB Localhost Connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["algeria_biz_db"]

# Collections
workers_col = db["workers"]
inventory_col = db["inventory"]
clients_col = db["clients"]
financials_col = db["financials"]
bento_col = db["bento_data"]
settings_col = db["settings"]

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "currency": "DZD",
        "business": "Atlas Solutions & Commerce Algérie",
        "mongo": "connected",
        "timestamp": datetime.utcnow().isoformat()
    })

# --- WORKERS & ATTENDANCE ---
@app.route("/api/workers", methods=["GET", "POST"])
def manage_workers():
    if request.method == "POST":
        data = request.json
        data["created_at"] = datetime.utcnow()
        result = workers_col.insert_one(data)
        return jsonify({"success": True, "id": str(result.inserted_id)}), 201
    return jsonify(list(workers_col.find({}, {"_id": 0})))

@app.route("/api/workers/<worker_id>/clock", methods=["POST"])
def clock_worker(worker_id):
    worker = workers_col.find_one({"id": worker_id})
    if not worker:
        return jsonify({"error": "Worker not found"}), 404
    
    current_status = worker.get("status", "off_shift")
    new_status = "off_shift" if current_status == "working" else "working"
    clock_time = datetime.now().strftime("%I:%M %p") if new_status == "working" else None
    
    workers_col.update_one(
        {"id": worker_id},
        {"$set": {"status": new_status, "clockInTime": clock_time}}
    )
    return jsonify({"success": True, "new_status": new_status, "clock_time": clock_time})

@app.route("/api/workers/<worker_id>/pay", methods=["POST"])
def pay_worker(worker_id):
    workers_col.update_one(
        {"id": worker_id},
        {"$set": {
            "paymentStatus": "paid", 
            "lastPaidDate": datetime.now().strftime("%d/%m/%Y")
        }}
    )
    return jsonify({"success": True, "message": "Salary payment recorded in DZD"})

# --- INVENTORY & ALARMS ---
@app.route("/api/inventory", methods=["GET", "POST"])
def manage_inventory():
    if request.method == "POST":
        data = request.json
        data["alarmActive"] = data.get("stockQty", 0) <= data.get("minStockAlert", 5)
        inventory_col.insert_one(data)
        return jsonify({"success": True}), 201
    return jsonify(list(inventory_col.find({}, {"_id": 0})))

@app.route("/api/inventory/<item_id>/alarm", methods=["PUT"])
def set_alarm_threshold(item_id):
    new_threshold = request.json.get("minStockAlert", 5)
    item = inventory_col.find_one({"id": item_id})
    if not item:
        return jsonify({"error": "Item not found"}), 404
    
    alarm_active = item.get("stockQty", 0) <= new_threshold
    inventory_col.update_one(
        {"id": item_id},
        {"$set": {"minStockAlert": new_threshold, "alarmActive": alarm_active}}
    )
    return jsonify({"success": True, "minStockAlert": new_threshold, "alarmActive": alarm_active})

@app.route("/api/inventory/<item_id>/restock", methods=["POST"])
def restock_item(item_id):
    qty = request.json.get("quantity", 10)
    inventory_col.update_one(
        {"id": item_id},
        {"$inc": {"stockQty": qty}, "$set": {"lastRestocked": datetime.now().strftime("%d/%m/%Y")}}
    )
    item = inventory_col.find_one({"id": item_id})
    alarm_active = item.get("stockQty", 0) <= item.get("minStockAlert", 5)
    inventory_col.update_one({"id": item_id}, {"$set": {"alarmActive": alarm_active}})
    return jsonify({"success": True, "new_qty": item.get("stockQty")})

# --- CLIENTS ---
@app.route("/api/clients", methods=["GET", "POST"])
def manage_clients():
    if request.method == "POST":
        clients_col.insert_one(request.json)
        return jsonify({"success": True}), 201
    return jsonify(list(clients_col.find({}, {"_id": 0})))

# --- FINANCIALS & STATS ---
@app.route("/api/financials", methods=["GET"])
def get_financials():
    return jsonify(financials_col.find_one({}, {"_id": 0}))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
`;
