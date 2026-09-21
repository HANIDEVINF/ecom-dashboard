import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Percent, 
  Eye, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  Search,
  Printer,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLanguage, ClientProfile, InventoryItem, BusinessSettings } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { formatDZD } from '../services/apiService';

interface ClientsViewProps {
  clients: ClientProfile[];
  inventory: InventoryItem[];
  settings: BusinessSettings;
  language: AppLanguage;
  onAddClientClick: () => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  inventory,
  settings,
  language,
  onAddClientClick
}) => {
  const t = TRANSLATIONS[language];
  const [selectedClientForPresentation, setSelectedClientForPresentation] = useState<ClientProfile | null>(null);
  const [search, setSearch] = useState('');

  const totalClients = clients.length;
  const totalReceivablesDZD = clients.reduce((acc, c) => acc + c.outstandingBalanceDZD, 0);
  const totalBilledDZD = clients.reduce((acc, c) => acc + c.totalRevenueDZD, 0);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.wilaya.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      id="screen-clients-management"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 pb-20"
    >
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase size={22} className="text-slate-900" />
            <span>{t.clients.title}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t.clients.subtitle}
          </p>
        </div>

        <button
          id="btn-add-client-page"
          onClick={onAddClientClick}
          className="px-4 py-2 bg-slate-900 hover:bg-black text-[#e4fc65] rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          <span>{t.clients.addClient}</span>
        </button>
      </div>

      {/* 3 Summary Client & Commercial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Active Clients */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.clients.totalClients}
            </span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building2 size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {totalClients} <span className="text-xs font-semibold text-slate-500">{language === 'ar' ? 'شركات ومؤسسات' : 'entreprises'}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {language === 'ar' ? 'موزعة عبر عدة ولايات في الجزائر' : 'Portefeuille commercial actif'}
            </p>
          </div>
        </div>

        {/* Total Billed Revenue */}
        <div className="bg-[#e4fc65] p-5 rounded-3xl border border-lime-300 shadow-xs flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t.clients.totalBilled}
            </span>
            <div className="w-7 h-7 rounded-xl bg-black/10 text-slate-900 flex items-center justify-center">
              <Sparkles size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {formatDZD(totalBilledDZD, language)}
            </div>
            <p className="text-[11px] text-slate-800 font-semibold mt-0.5">
              {language === 'ar' ? 'إجمالي المبيعات والفواتير المسددة' : 'Chiffre d\'affaires cumulé'}
            </p>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-[#fed6c6] p-5 rounded-3xl border border-[#fbc4b0] shadow-xs flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t.clients.outstandingBalance}
            </span>
            <div className="w-7 h-7 rounded-xl bg-black/10 text-slate-900 flex items-center justify-center">
              <FileText size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {formatDZD(totalReceivablesDZD, language)}
            </div>
            <p className="text-[11px] text-slate-800 font-semibold mt-0.5">
              {language === 'ar' ? 'مستحقات للدفع عند التسليم أو بنكياً' : 'Créances commerciales en cours'}
            </p>
          </div>
        </div>

      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث عن عميل أو شركة أو ولاية...' : 'Rechercher un client, entreprise, wilaya...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          {filteredClients.length} {language === 'ar' ? 'عملاء معروضين' : 'clients affichés'}
        </span>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            id={`client-card-${client.id}`}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            {/* Top Bar */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    client.status === 'vip' 
                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {client.status === 'vip' ? '★ Client VIP' : 'Client Actif'}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1.5">
                    {client.company}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {client.name}
                  </p>
                </div>

                {client.discountTier > 0 && (
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xl">
                    -{client.discountTier}% Remise
                  </span>
                )}
              </div>

              {/* Meta details */}
              <div className="mt-3 space-y-1.5 text-[11px] text-slate-500 font-medium border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <MapPin size={12} className="text-slate-400" />
                  <span>{client.wilaya}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={12} className="text-slate-400" />
                  <span className="font-mono">{client.phone}</span>
                </div>
                {client.nif && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <span>NIF: {client.nif}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial summary for this client */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{language === 'ar' ? 'إجمالي المشتريات' : 'Total facturé :'}</span>
                <span className="font-bold text-slate-900 font-mono">
                  {formatDZD(client.totalRevenueDZD, language)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{language === 'ar' ? 'الرصيد المتبقي' : 'Solde dû :'}</span>
                <span className={`font-bold font-mono ${client.outstandingBalanceDZD > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {client.outstandingBalanceDZD > 0 ? formatDZD(client.outstandingBalanceDZD, language) : (language === 'ar' ? 'مسدد بالكامل ✓' : 'À jour ✓')}
                </span>
              </div>
            </div>

            {/* Action: Open Client Presentation & Quotation Mode */}
            <button
              id={`btn-open-presentation-${client.id}`}
              onClick={() => setSelectedClientForPresentation(client)}
              className="w-full py-2 bg-slate-900 hover:bg-black text-[#e4fc65] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <Eye size={13} />
              <span>{language === 'ar' ? 'عرض مخصص للعميل (Devis)' : 'Présentation Client Personnalisée'}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Modal: Client-Facing Presentation Mode (Ready to show to the client) */}
      <AnimatePresence>
        {selectedClientForPresentation && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative"
            >
              {/* Header Devis */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-[#e4fc65] uppercase">
                    Devis & Offre Commerciale Personnalisée
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">
                    {settings.companyName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {settings.address} • RC: {settings.rcNumber} • NIF: {settings.nif}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 block font-mono">
                    DEVIS N° 2026-DZ-{selectedClientForPresentation.id.replace('cli-', '00')}
                  </span>
                  <span className="text-xs text-slate-500 font-medium block">
                    Alger, le 21 Septembre 2026
                  </span>
                </div>
              </div>

              {/* Client Box */}
              <div className="my-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Destinataire / Client
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedClientForPresentation.company}
                  </h4>
                  <p className="text-xs text-slate-600">
                    Attn: {selectedClientForPresentation.name}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} /> {selectedClientForPresentation.wilaya}
                  </p>
                </div>

                {selectedClientForPresentation.discountTier > 0 && (
                  <div className="bg-emerald-100 text-emerald-900 p-3 rounded-xl text-center self-start sm:self-auto border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold block">Tarif Préférentiel</span>
                    <span className="text-base font-black">-{selectedClientForPresentation.discountTier}% Accordé</span>
                  </div>
                )}
              </div>

              {/* Items Table for this Client */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden mb-5">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Désignation</th>
                      <th className="py-2.5 px-3">Prix Catalogue</th>
                      <th className="py-2.5 px-3">Remise Client</th>
                      <th className="py-2.5 px-3 text-right">Prix Net Client (DA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {inventory.slice(0, 4).map((item) => {
                      const discount = selectedClientForPresentation.discountTier;
                      const discountedPrice = Math.round(item.sellingPriceDZD * (1 - discount / 100));
                      return (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 text-slate-900 font-semibold">
                            {item.name[language] || item.name.fr}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {formatDZD(item.sellingPriceDZD, language)}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-700 font-bold">
                            {discount > 0 ? `-${discount}%` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                            {formatDZD(discountedPrice, language)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Terms & Bank details (BaridiMob / BNA) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Modalités de règlement en Algérie :</p>
                <p>• Règlement par virement bancaire (CIB / BNA / CPA) ou mandat BaridiMob / CCP.</p>
                <p>• Validité de l'offre : 30 jours à compter de la date d'émission.</p>
                <p>• Livraison assurée sur {selectedClientForPresentation.wilaya} avec bon de livraison conforme.</p>
              </div>

              {/* Close Button */}
              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Imprimer Devis</span>
                </button>
                <button
                  onClick={() => setSelectedClientForPresentation(null)}
                  className="px-5 py-2 bg-slate-900 text-[#e4fc65] rounded-xl text-xs font-bold hover:bg-black cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
