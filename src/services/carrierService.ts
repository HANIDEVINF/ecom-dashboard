import { AlgerianCarrier, CarrierShipment, CarrierTrackingEvent, ParcelStatus } from '../types';

export interface CarrierConfig {
  id: AlgerianCarrier;
  name: string;
  fullName: string;
  logo: string;
  coverage: string;
  prefix: string;
  supportedTypes: ('domicile' | 'stop_desk')[];
  basePriceDomicileDZD: number;
  basePriceStopDeskDZD: number;
  apiEndpoint: string;
  webhookPath: string;
}

export const ALGERIAN_CARRIERS: Record<AlgerianCarrier, CarrierConfig> = {
  yalidine: {
    id: 'yalidine',
    name: 'Yalidine Express',
    fullName: 'Yalidine Fast Logistics Algérie (58 Wilayas)',
    logo: '🔴',
    coverage: '58 Wilayas • Réseau National + Centres Stop-Desk',
    prefix: 'YAL',
    supportedTypes: ['domicile', 'stop_desk'],
    basePriceDomicileDZD: 650,
    basePriceStopDeskDZD: 400,
    apiEndpoint: 'https://api.yalidine.app/v1/parcels',
    webhookPath: '/api/carriers/webhook/yalidine'
  },
  zr_express: {
    id: 'zr_express',
    name: 'ZR Express',
    fullName: 'ZR Express & Cargo Services (Oran, Alger, Sétif)',
    logo: '🟡',
    coverage: 'Réseau Rapide Ouest & Centre Algérien',
    prefix: 'ZR',
    supportedTypes: ['domicile', 'stop_desk'],
    basePriceDomicileDZD: 600,
    basePriceStopDeskDZD: 380,
    apiEndpoint: 'https://api.zrexpress.dz/v2/shipments',
    webhookPath: '/api/carriers/webhook/zr_express'
  },
  procolis: {
    id: 'procolis',
    name: 'Procolis Algérie',
    fullName: 'Procolis Messagerie & Colis Express Est & Centre',
    logo: '🔵',
    coverage: '48 Wilayas • Hub Central Constantine & Alger',
    prefix: 'PRO',
    supportedTypes: ['domicile', 'stop_desk'],
    basePriceDomicileDZD: 620,
    basePriceStopDeskDZD: 390,
    apiEndpoint: 'https://procolis.com/api/parcels/create',
    webhookPath: '/api/carriers/webhook/procolis'
  },
  maystro: {
    id: 'maystro',
    name: 'Maystro Delivery',
    fullName: 'Maystro Last-Mile & E-commerce Delivery (Grand Alger & Nord)',
    logo: '🟢',
    coverage: 'Alger, Blida, Boumerdès, Tipaza & Grandes Villes',
    prefix: 'MAY',
    supportedTypes: ['domicile'],
    basePriceDomicileDZD: 500,
    basePriceStopDeskDZD: 350,
    apiEndpoint: 'https://app.maystro-delivery.com/api/v1/orders',
    webhookPath: '/api/carriers/webhook/maystro'
  }
};

/**
 * Calculates national carrier shipping rates by wilaya category
 */
export function calculateCarrierFee(
  carrier: AlgerianCarrier,
  wilayaCode: string,
  deliveryType: 'domicile' | 'stop_desk'
): number {
  const cfg = ALGERIAN_CARRIERS[carrier];
  const base = deliveryType === 'stop_desk' ? cfg.basePriceStopDeskDZD : cfg.basePriceDomicileDZD;
  const codeNum = parseInt(wilayaCode, 10) || 16;

  // Wilaya distance weighting (South / Sahara wilayas cost more)
  const southWilayas = [1, 11, 30, 32, 33, 37, 39, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58];
  const highPlateaus = [3, 5, 7, 8, 12, 14, 17, 19, 20, 28, 34, 40, 41, 43, 45];

  if (southWilayas.includes(codeNum)) {
    return base + 500;
  } else if (highPlateaus.includes(codeNum)) {
    return base + 200;
  }
  // Coastal & Central wilayas
  return base;
}

export function generateTrackingNumber(carrier: AlgerianCarrier): string {
  const cfg = ALGERIAN_CARRIERS[carrier];
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `${cfg.prefix}-DZ-${year}-${randomSuffix}`;
}

export function createShipment(
  carrier: AlgerianCarrier,
  documentNumber: string,
  recipientName: string,
  recipientPhone: string,
  wilayaStr: string,
  commune: string,
  deliveryAddress: string,
  deliveryType: 'domicile' | 'stop_desk',
  codAmountDZD: number,
  stopDeskOffice?: string
): CarrierShipment {
  const wilayaParts = wilayaStr.split(' - ');
  const wilayaCode = wilayaParts[0] || '16';
  const wilayaName = wilayaParts[1] || wilayaStr;
  const trackingNumber = generateTrackingNumber(carrier);
  const shippingFeeDZD = calculateCarrierFee(carrier, wilayaCode, deliveryType);
  const now = new Date().toISOString();

  const initialHistory: CarrierTrackingEvent[] = [
    {
      status: 'en_preparation',
      timestamp: now,
      hubLocation: `Dépôt Vendeur (Wilaya ${wilayaCode})`,
      note: 'Colis étiqueté et prêt pour l\'enlèvement par le transporteur.'
    }
  ];

  return {
    id: `shp-${Date.now()}`,
    carrier,
    trackingNumber,
    documentNumber,
    recipientName,
    recipientPhone,
    wilayaCode,
    wilayaName,
    commune: commune || 'Centre',
    deliveryAddress,
    deliveryType,
    stopDeskOffice: deliveryType === 'stop_desk' ? stopDeskOffice || `Bureau Yalidine ${wilayaName}` : undefined,
    codAmountDZD,
    shippingFeeDZD,
    status: 'en_preparation',
    history: initialHistory,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Simulates carrier status webhook notification progression
 */
export function simulateCarrierWebhookProgress(currentShipment: CarrierShipment): {
  updatedShipment: CarrierShipment;
  eventMessage: string;
} {
  const statusFlow: ParcelStatus[] = [
    'en_preparation',
    'expedie',
    'en_centre_transit',
    'en_livraison',
    'livre',
    'encaisse'
  ];

  const currentIndex = statusFlow.indexOf(currentShipment.status);
  const nextIndex = Math.min(statusFlow.length - 1, currentIndex + 1);
  const nextStatus = statusFlow[nextIndex];
  const now = new Date().toISOString();

  const notesMap: Record<ParcelStatus, { hub: string; note: string }> = {
    en_preparation: {
      hub: 'Dépôt Expéditeur',
      note: 'Colis conditionné avec bordereau de transport.'
    },
    expedie: {
      hub: `Hub Central ${ALGERIAN_CARRIERS[currentShipment.carrier].name}`,
      note: 'Pris en charge par le camion de ramassage.'
    },
    en_centre_transit: {
      hub: `Centre de Tri Régional (${currentShipment.wilayaName})`,
      note: 'Colis trié et orienté vers le centre de distribution local.'
    },
    en_livraison: {
      hub: `Agence Locale ${currentShipment.wilayaName}`,
      note: currentShipment.deliveryType === 'stop_desk' 
        ? 'Disponible au bureau Stop-Desk pour retrait client.' 
        : 'Colis remis au livreur de tournée, livraison en cours.'
    },
    livre: {
      hub: currentShipment.commune,
      note: 'Colis remis au destinataire avec succès.'
    },
    encaisse: {
      hub: `Direction Financière ${ALGERIAN_CARRIERS[currentShipment.carrier].name}`,
      note: `Montant contre-remboursement de ${(currentShipment.codAmountDZD).toLocaleString('fr-DZ')} DA encaissé et viré sur le compte CCP/BaridiMob.`
    },
    echec_livraison: {
      hub: currentShipment.commune,
      note: 'Destinataire injoignable, nouvelle tentative programmée.'
    },
    retourne: {
      hub: 'Hub Central',
      note: 'Colis retourné à l\'expéditeur après 3 tentatives infructueuses.'
    }
  };

  const newEvent: CarrierTrackingEvent = {
    status: nextStatus,
    timestamp: now,
    hubLocation: notesMap[nextStatus].hub,
    note: notesMap[nextStatus].note
  };

  const updatedShipment: CarrierShipment = {
    ...currentShipment,
    status: nextStatus,
    updatedAt: now,
    history: [newEvent, ...currentShipment.history]
  };

  return {
    updatedShipment,
    eventMessage: `Webhook ${ALGERIAN_CARRIERS[currentShipment.carrier].name} : ${newEvent.note}`
  };
}
