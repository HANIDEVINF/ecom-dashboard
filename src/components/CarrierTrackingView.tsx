import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  Package, 
  MapPin, 
  Search, 
  CheckCircle2, 
  Clock, 
  Plus, 
  RefreshCw, 
  DollarSign, 
  Building, 
  Phone, 
  User, 
  ArrowRight,
  ExternalLink,
  Zap,
  Filter,
  Check,
  X
} from 'lucide-react';
import { AlgerianCarrier, AppLanguage, CarrierShipment, Invoice, ParcelStatus } from '../types';
import { ALGERIAN_CARRIERS, calculateCarrierFee, createShipment, simulateCarrierWebhookProgress } from '../services/carrierService';
import { ALGERIA_WILAYAS } from '../data/algerianBusinessData';
import { formatDZD } from '../services/apiService';

interface CarrierTrackingViewProps {
  invoices: Invoice[];
  language: AppLanguage;
  onLinkShipmentToInvoice?: (invoiceNumber: string, shipment: CarrierShipment) => void;
}

const INITIAL_DEMO_SHIPMENTS: CarrierShipment[] = [
  {
    id: 'shp-101',
    carrier: 'yalidine',
    trackingNumber: 'YAL-DZ-2026-89412',
    documentNumber: 'BL-2026-0019',
    recipientName: 'Ets Khenchela BTP & Matériaux',
    recipientPhone: '+213 661 24 55 89',
    wilayaCode: '40',
    wilayaName: 'Khenchela',
    commune: 'Kaïs',
    deliveryAddress: 'Zone d\'Activité Industrielle N° 12, Kaïs',
    deliveryType: 'domicile',
    codAmountDZD: 82500,
    shippingFeeDZD: 850,
    status: 'en_livraison',
    history: [
      {
        status: 'en_livraison',
        timestamp: '2026-09-21T08:30:00.000Z',
        hubLocation: 'Centre Distribution Yalidine Khenchela',
        note: 'Colis confié au livreur de secteur pour distribution finale.'
      },
      {
        status: 'en_centre_transit',
        timestamp: '2026-09-20T22:15:00.000Z',
        hubLocation: 'Hub Régional Est Constantine',
        note: 'Tri automatisé effectué, acheminé vers l\'agence de Khenchela.'
      },
      {
        status: 'expedie',
        timestamp: '2026-09-20T16:00:00.000Z',
        hubLocation: 'Centre Expéditeur Alger Ouest',
        note: 'Prise en charge par le camion de ligne express.'
      },
      {
        status: 'en_preparation',
        timestamp: '2026-09-20T14:45:00.000Z',
        hubLocation: 'Dépôt Vendeur Alger',
        note: 'Colis étiqueté et prêt pour l\'enlèvement.'
      }
    ],
    createdAt: '2026-09-20T14:45:00.000Z',
    updatedAt: '2026-09-21T08:30:00.000Z'
  },
  {
    id: 'shp-102',
    carrier: 'zr_express',
    trackingNumber: 'ZR-DZ-2026-55102',
    documentNumber: 'FAC-2026-0043',
    recipientName: 'EURL Bahia Tech Solutions',
    recipientPhone: '+213 550 18 90 22',
    wilayaCode: '31',
    wilayaName: 'Oran',
    commune: 'Es Sénia',
    deliveryAddress: 'Centre d\'Affaires Maraval, Oran',
    deliveryType: 'stop_desk',
    stopDeskOffice: 'Agence ZR Express Oran Maraval',
    codAmountDZD: 99720,
    shippingFeeDZD: 380,
    status: 'livre',
    history: [
      {
        status: 'livre',
        timestamp: '2026-09-20T15:30:00.000Z',
        hubLocation: 'Agence ZR Oran Maraval',
        note: 'Colis retiré au comptoir par le destinataire (pièce d\'identité vérifiée).'
      },
      {
        status: 'en_livraison',
        timestamp: '2026-09-20T09:00:00.000Z',
        hubLocation: 'Agence ZR Oran Maraval',
        note: 'Colis disponible au bureau Stop-Desk pour retrait.'
      },
      {
        status: 'expedie',
        timestamp: '2026-09-19T18:00:00.000Z',
        hubLocation: 'Hub Central ZR Alger',
        note: 'Départ navette nocturne Alger - Oran.'
      }
    ],
    createdAt: '2026-09-19T11:15:00.000Z',
    updatedAt: '2026-09-20T15:30:00.000Z'
  },
  {
    id: 'shp-103',
    carrier: 'maystro',
    trackingNumber: 'MAY-DZ-2026-12093',
    documentNumber: 'BL-2026-0018',
    recipientName: 'Pharmacie Centrale Hydra',
    recipientPhone: '+213 770 99 11 33',
    wilayaCode: '16',
    wilayaName: 'Alger',
    commune: 'Hydra',
    deliveryAddress: '14 Rue Doudou Mokhtar, Hydra, Alger',
    deliveryType: 'domicile',
    codAmountDZD: 45000,
    shippingFeeDZD: 500,
    status: 'encaisse',
    history: [
      {
        status: 'encaisse',
        timestamp: '2026-09-19T17:00:00.000Z',
        hubLocation: 'Service Financier Maystro',
        note: 'Fonds contre-remboursement versés sur compte BaridiMob vendeur.'
      },
      {
        status: 'livre',
        timestamp: '2026-09-19T14:15:00.000Z',
        hubLocation: 'Hydra, Alger',
        note: 'Livraison effectuée avec succès.'
      }
    ],
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-19T17:00:00.000Z'
  }
];

export const CarrierTrackingView: React.FC<CarrierTrackingViewProps> = ({
  invoices,
  language,
  onLinkShipmentToInvoice
}) => {
  const [shipments, setShipments] = useState<CarrierShipment[]>(() => {
    try {
      const stored = localStorage.getItem('algeria_biz_shipments');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_DEMO_SHIPMENTS;
  });

  const [selectedCarrierFilter, setSelectedCarrierFilter] = useState<'all' | AlgerianCarrier>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | ParcelStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeShipmentDetail, setActiveShipmentDetail] = useState<CarrierShipment | null>(null);

  // New Shipment Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCarrier, setNewCarrier] = useState<AlgerianCarrier>('yalidine');
  const [newDocNumber, setNewDocNumber] = useState('');
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientPhone, setNewRecipientPhone] = useState('');
  const [newWilaya, setNewWilaya] = useState('16 - Alger');
  const [newCommune, setNewCommune] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newDeliveryType, setNewDeliveryType] = useState<'domicile' | 'stop_desk'>('domicile');
  const [newCodAmount, setNewCodAmount] = useState<number>(0);

  const saveShipments = (updated: CarrierShipment[]) => {
    setShipments(updated);
    try {
      localStorage.setItem('algeria_biz_shipments', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // Simulates carrier webhook progression for live parcel state
  const handleSimulateWebhook = (shipment: CarrierShipment) => {
    const { updatedShipment } = simulateCarrierWebhookProgress(shipment);
    const updated = shipments.map(s => s.id === updatedShipment.id ? updatedShipment : s);
    saveShipments(updated);
    if (activeShipmentDetail && activeShipmentDetail.id === updatedShipment.id) {
      setActiveShipmentDetail(updatedShipment);
    }
  };

  const handleCreateShipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createShipment(
      newCarrier,
      newDocNumber || 'BL-2026-0021',
      newRecipientName || 'Client Destinataire',
      newRecipientPhone || '+213 550 00 00 00',
      newWilaya,
      newCommune || 'Centre',
      newAddress || `${newWilaya}, Algérie`,
      newDeliveryType,
      newCodAmount
    );

    const updated = [created, ...shipments];
    saveShipments(updated);
    setIsCreateModalOpen(false);

    // Reset form
    setNewRecipientName('');
    setNewRecipientPhone('');
    setNewAddress('');
    setNewCommune('');
    setNewCodAmount(0);
  };

  // Filtered shipments
  const filteredShipments = shipments.filter(s => {
    const matchesCarrier = selectedCarrierFilter === 'all' || s.carrier === selectedCarrierFilter;
    const matchesStatus = selectedStatusFilter === 'all' || s.status === selectedStatusFilter;
    const matchesSearch = 
      s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.wilayaName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCarrier && matchesStatus && matchesSearch;
  });

  // COD Calculations
  const totalCodPending = shipments
    .filter(s => s.status !== 'encaisse' && s.status !== 'retourne')
    .reduce((acc, s) => acc + s.codAmountDZD, 0);

  const totalCodCollected = shipments
    .filter(s => s.status === 'encaisse')
    .reduce((acc, s) => acc + s.codAmountDZD, 0);

  const getStatusBadge = (status: ParcelStatus) => {
    switch (status) {
      case 'en_preparation':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">En Préparation</span>;
      case 'expedie':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-200">Expédié / En Transit</span>;
      case 'en_centre_transit':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">Centre de Tri</span>;
      case 'en_livraison':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200">En Cours de Livraison</span>;
      case 'livre':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">Livré</span>;
      case 'encaisse':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-600 text-white shadow-xs">Encaissé (Reversé)</span>;
      case 'echec_livraison':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-200">Échec Livraison</span>;
      case 'retourne':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-800">Retourné Dépôt</span>;
    }
  };

  return (
    <motion.div
      id="carrier-tracking-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Top Banner with Carriers Hub */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e4fc65]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-[#e4fc65] text-slate-950 font-black text-xs rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={14} className="text-slate-950" />
                Logistique Nationale Algérie
              </span>
              <span className="px-2.5 py-1 bg-white/10 text-white font-mono text-[11px] rounded-full border border-white/10">
                58 Wilayas • Domicile & Stop-Desk
              </span>
              <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 font-bold text-[11px] rounded-full border border-sky-500/30">
                Webhooks Temps Réel
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Intégrations Transporteurs & Suivi des Colis
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Interconnexion directe avec les API des leaders algériens de la messagerie : <strong>Yalidine Express</strong>, <strong>ZR Express</strong>, <strong>Procolis</strong> et <strong>Maystro Delivery</strong>. Génération automatique des bordereaux d'expédition et suivi du contre-remboursement (COD).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              id="create-carrier-shipment-btn"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 bg-[#e4fc65] hover:bg-[#d6f04c] text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Nouvelle Expédition (Bordereau)</span>
            </button>
          </div>
        </div>

        {/* Carrier Cards Grid */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.values(ALGERIAN_CARRIERS) as any[]).map(c => {
            const count = shipments.filter(s => s.carrier === c.id).length;
            const isSelected = selectedCarrierFilter === c.id;

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCarrierFilter(isSelected ? 'all' : c.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-white/20 border-[#e4fc65] ring-2 ring-[#e4fc65]/50' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{c.logo}</span>
                  <span className="text-[10px] font-bold font-mono bg-white/10 px-2 py-0.5 rounded-md text-white">
                    {count} colis
                  </span>
                </div>
                <div className="text-xs font-black text-white mt-1.5 truncate">
                  {c.name}
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate">
                  {c.coverage}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Financial & COD Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Shipments */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Total Expéditions Actives
            </span>
            <Package size={16} className="text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {shipments.length} Colis
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            Sur le réseau des 4 transporteurs partenaires
          </p>
        </div>

        {/* COD en attente */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Contre-Remboursement (En Cours)
            </span>
            <Clock size={16} className="text-amber-700" />
          </div>
          <div className="text-2xl font-black text-amber-900 tracking-tight">
            {formatDZD(totalCodPending)}
          </div>
          <p className="text-[11px] text-amber-700 font-medium">
            Fonds en cours de livraison ou en attente de virement
          </p>
        </div>

        {/* COD Encaissé */}
        <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Fonds Encaissés (BaridiMob / CCP)
            </span>
            <CheckCircle2 size={16} className="text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-950 tracking-tight">
            {formatDZD(totalCodCollected)}
          </div>
          <p className="text-[11px] text-emerald-800 font-medium">
            Montants reversés sur le compte de l'entreprise
          </p>
        </div>
      </div>

      {/* Shipments List & Live Tracking Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Tableau de Bord des Livraisons
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Synchronisation temps réel par webhooks avec les hubs de tri régionaux.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setSelectedStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${selectedStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Tous ({shipments.length})
              </button>
              <button
                onClick={() => setSelectedStatusFilter('en_livraison')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${selectedStatusFilter === 'en_livraison' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                En Livraison
              </button>
              <button
                onClick={() => setSelectedStatusFilter('livre')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${selectedStatusFilter === 'livre' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Livrés
              </button>
              <button
                onClick={() => setSelectedStatusFilter('encaisse')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${selectedStatusFilter === 'encaisse' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Encaissés
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="N° Suivi, client, wilaya, BL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white w-56 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-100 tracking-wider">
                <th className="py-3 px-4">Transporteur</th>
                <th className="py-3 px-4">N° de Suivi (Tracking)</th>
                <th className="py-3 px-4">N° Document (BL / FAC)</th>
                <th className="py-3 px-4">Destinataire & Wilaya</th>
                <th className="py-3 px-4">Type Livraison</th>
                <th className="py-3 px-4 text-right">Contre-Remboursement</th>
                <th className="py-3 px-4 text-right">Frais Envoi</th>
                <th className="py-3 px-4 text-center">Statut Actuel</th>
                <th className="py-3 px-4 text-center">Action Webhook</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredShipments.map(s => {
                const carrierCfg = ALGERIAN_CARRIERS[s.carrier] || ALGERIAN_CARRIERS.yalidine;
                
                return (
                  <tr 
                    key={s.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Carrier Badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{carrierCfg.logo}</span>
                        <div>
                          <div className="font-bold text-slate-900">{carrierCfg.name}</div>
                          <div className="text-[10px] text-slate-600 font-mono">API v1.4</div>
                        </div>
                      </div>
                    </td>

                    {/* Tracking Number */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-black text-slate-900 flex items-center gap-1.5">
                        <span>{s.trackingNumber}</span>
                      </div>
                      <div className="text-[10px] text-slate-600">
                        {new Date(s.updatedAt).toLocaleDateString('fr-FR')} {new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Document */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {s.documentNumber}
                      </span>
                    </td>

                    {/* Recipient */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{s.recipientName}</div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1">
                        <MapPin size={11} className="text-rose-500 shrink-0" />
                        <span>{s.wilayaCode} - {s.wilayaName} ({s.commune})</span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono">{s.recipientPhone}</div>
                    </td>

                    {/* Delivery Type */}
                    <td className="py-3 px-4">
                      {s.deliveryType === 'stop_desk' ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                          <Building size={10} />
                          <span>Stop Desk (Bureau)</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-900 border border-sky-200 text-[10px] font-bold">
                          <MapPin size={10} />
                          <span>À Domicile</span>
                        </div>
                      )}
                    </td>

                    {/* COD Amount */}
                    <td className="py-3 px-4 text-right font-black font-mono text-slate-900">
                      {formatDZD(s.codAmountDZD)}
                    </td>

                    {/* Shipping Fee */}
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatDZD(s.shippingFeeDZD)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(s.status)}
                    </td>

                    {/* Simulate Webhook Action Button */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleSimulateWebhook(s)}
                          title="Simuler une mise à jour d'étape par webhook transporteur"
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Zap size={11} className="text-[#e4fc65]" />
                          <span>Avancer Étape</span>
                        </button>

                        <button
                          onClick={() => setActiveShipmentDetail(s)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Voir l'historique complet des hubs"
                        >
                          <ExternalLink size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredShipments.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Truck size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-sm">Aucune expédition trouvée avec ces critères</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Timeline Detail Modal */}
      <AnimatePresence>
        {activeShipmentDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ALGERIAN_CARRIERS[activeShipmentDetail.carrier]?.logo}</span>
                    <h3 className="text-lg font-black text-slate-900">
                      Suivi Colis : {activeShipmentDetail.trackingNumber}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Réf. Document : {activeShipmentDetail.documentNumber} • {activeShipmentDetail.recipientName}
                  </p>
                </div>

                <button
                  onClick={() => setActiveShipmentDetail(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Header */}
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Statut Actuel
                  </span>
                  <div className="mt-1">
                    {getStatusBadge(activeShipmentDetail.status)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Montant COD à Encaisser
                  </span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {formatDZD(activeShipmentDetail.codAmountDZD)}
                  </span>
                </div>
              </div>

              {/* Hub Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Historique des Centres de Tri & Hubs Régionaux
                </h4>

                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
                  {activeShipmentDetail.history.map((event, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-white shadow-xs" />
                      <div className="text-xs font-black text-slate-800">
                        {event.hubLocation}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {event.note}
                      </p>
                      <div className="text-[10px] text-slate-600 font-mono mt-1">
                        {new Date(event.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSimulateWebhook(activeShipmentDetail)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Zap size={14} className="text-[#e4fc65]" />
                  <span>Simuler Étape Suivante (Webhook)</span>
                </button>

                <button
                  onClick={() => setActiveShipmentDetail(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Shipment Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Créer un Bordereau d'Expédition
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Génération directe du numéro de suivi et calcul du tarif wilaya
                  </p>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateShipmentSubmit} className="space-y-4">
                {/* Carrier Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Transporteur Partenaire
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.values(ALGERIAN_CARRIERS) as any[]).map(c => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setNewCarrier(c.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                          newCarrier === c.id 
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs' 
                            : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-base">{c.logo}</span>
                        <div>
                          <div className="text-xs font-black">{c.name}</div>
                          <div className={`text-[10px] ${newCarrier === c.id ? 'text-slate-300' : 'text-slate-600'}`}>
                            {c.prefix}-DZ
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Document Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    N° Document de Référence (Bon de Livraison / Facture)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: BL-2026-0021 ou FAC-2026-0045"
                    value={newDocNumber}
                    onChange={(e) => setNewDocNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium"
                  />
                </div>

                {/* Recipient Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nom du Destinataire / Entreprise
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Sarl Sahel Distribution"
                      value={newRecipientName}
                      onChange={(e) => setNewRecipientName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Numéro de Téléphone Mobile
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: 0550 12 34 56"
                      value={newRecipientPhone}
                      onChange={(e) => setNewRecipientPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Wilaya & Delivery Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Wilaya de Destination (58 Wilayas)
                    </label>
                    <select
                      value={newWilaya}
                      onChange={(e) => setNewWilaya(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium"
                    >
                      {ALGERIA_WILAYAS.map((w: string) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mode de Livraison
                    </label>
                    <select
                      value={newDeliveryType}
                      onChange={(e) => setNewDeliveryType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium"
                    >
                      <option value="domicile">Livraison à Domicile</option>
                      <option value="stop_desk">Retrait Stop-Desk (Bureau)</option>
                    </select>
                  </div>
                </div>

                {/* Address & Commune */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Commune
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Bab Ezzouar, Es Sénia..."
                      value={newCommune}
                      onChange={(e) => setNewCommune(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Montant Contre-Remboursement (COD)
                    </label>
                    <input
                      type="number"
                      placeholder="0 DA si déjà payé"
                      value={newCodAmount || ''}
                      onChange={(e) => setNewCodAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium font-mono"
                    />
                  </div>
                </div>

                {/* Full Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adresse Complète de Livraison
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Rue, quartier, repère pour le livreur..."
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium resize-none"
                  />
                </div>

                {/* Live Estimated Shipping Fee */}
                <div className="p-3 bg-slate-100 rounded-2xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">
                    Frais de Port Estimés :
                  </span>
                  <span className="font-black text-slate-900 font-mono text-sm">
                    {formatDZD(calculateCarrierFee(newCarrier, newWilaya.split(' - ')[0], newDeliveryType))}
                  </span>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-[#e4fc65] font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Check size={14} />
                    <span>Générer Bordereau & Tracking</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
