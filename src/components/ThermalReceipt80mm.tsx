import React from 'react';
import { AppLanguage, BusinessSettings, Invoice } from '../types';
import { formatDZD } from '../services/apiService';
import { AlgerianSealStamp } from './AlgerianSealStamp';

interface ThermalReceipt80mmProps {
  invoice: Invoice;
  settings: BusinessSettings;
  language: AppLanguage;
  showStamp?: boolean;
}

export const ThermalReceipt80mm: React.FC<ThermalReceipt80mmProps> = ({
  invoice,
  settings,
  language,
  showStamp = true
}) => {
  const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const paymentMethodLabel = {
    especes: 'ESPÈCES',
    baridimob: 'BARIDIMOB (CCP)',
    virement_cib: 'CARTE CIB / BNA',
    cheque: 'CHÈQUE BANCAIRE'
  }[invoice.paymentMethod] || 'ESPÈCES';

  // Estimate cash tendered if not specified
  const cashReceived = invoice.paymentMethod === 'especes' 
    ? Math.ceil(invoice.totalTTC / 1000) * 1000 
    : invoice.totalTTC;
  const changeReturned = Math.max(0, cashReceived - invoice.totalTTC);

  // Total items count
  const totalItemCount = invoice.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div 
      id="thermal-receipt-80mm"
      className="mx-auto bg-[#fafaf8] text-slate-900 font-mono text-[12px] leading-tight border border-slate-300 shadow-md p-5 rounded-md relative select-none w-full max-w-[320px] print:max-w-none print:w-[80mm] print:shadow-none print:border-none print:p-2 print:bg-white"
      style={{
        fontFamily: "'Courier New', Courier, monospace"
      }}
    >
      {/* Jagged top tear pattern (thermal paper cut) */}
      <div className="absolute -top-2 left-0 right-0 h-2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200 to-transparent opacity-60 print:hidden" />

      {/* Header Store Identification */}
      <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-slate-950">
        <h2 className="text-sm font-black tracking-wider uppercase">
          {settings.companyName}
        </h2>
        <div className="text-[11px] font-bold text-slate-700">
          {settings.legalForm} • {settings.wilaya}
        </div>
        <div className="text-[10px] text-slate-600">
          {settings.address}
        </div>
        <div className="text-[10px] text-slate-600">
          Tél : {settings.phone}
        </div>

        {/* Fiscal IDs */}
        <div className="text-[9.5px] pt-1 text-slate-600 border-t border-dotted border-slate-300 space-y-0.5">
          <div>RC : {settings.rcNumber}</div>
          <div>NIF : {settings.nif} • AI : {settings.ai}</div>
        </div>
      </div>

      {/* Ticket Details */}
      <div className="py-2.5 border-b border-dashed border-slate-950 text-[11px] space-y-1">
        <div className="flex justify-between font-bold">
          <span>TICKET N°:</span>
          <span>{invoice.number}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>DATE : {invoice.date}</span>
          <span>{currentTime}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>CAISSE : 01 (COMPTOIR)</span>
          <span>CAISSIER : ADMIN</span>
        </div>
        <div className="flex justify-between text-slate-700 pt-0.5 font-semibold">
          <span>CLIENT :</span>
          <span className="truncate max-w-[170px]">{invoice.clientName}</span>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-2.5 border-b-2 border-dashed border-slate-950">
        <div className="flex justify-between text-[10.5px] font-black pb-1.5 border-b border-slate-300 uppercase">
          <span className="w-1/2">DÉSIGNATION</span>
          <span className="w-1/4 text-center">QTÉ</span>
          <span className="w-1/4 text-right">TOTAL</span>
        </div>

        <div className="divide-y divide-dotted divide-slate-200 py-1 space-y-1.5">
          {invoice.items.map((item, idx) => (
            <div key={idx} className="pt-1 text-[11px]">
              <div className="font-bold truncate text-slate-950">
                {item.productName}
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                <span>{item.quantity} × {item.unitPriceDZD.toLocaleString()} DA</span>
                <span className="font-bold text-slate-950 font-mono">
                  {item.totalDZD.toLocaleString()} DA
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals & Calculations */}
      <div className="py-2.5 border-b-2 border-dashed border-slate-950 space-y-1 text-[11px]">
        <div className="flex justify-between text-slate-600">
          <span>Nombre d'articles :</span>
          <span className="font-bold">{totalItemCount}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Sous-total HT :</span>
          <span>{invoice.subtotalHT.toLocaleString()} DA</span>
        </div>

        {invoice.discountDZD > 0 && (
          <div className="flex justify-between text-slate-800 font-bold">
            <span>Remise accordée :</span>
            <span>-{invoice.discountDZD.toLocaleString()} DA</span>
          </div>
        )}

        {invoice.tvaRate > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>TVA 19% légale :</span>
            <span>{invoice.tvaAmountDZD.toLocaleString()} DA</span>
          </div>
        )}

        {/* Large Prominent Total TTC */}
        <div className="flex justify-between items-center text-sm font-black pt-1.5 border-t border-slate-950 text-slate-950">
          <span>NET À PAYER :</span>
          <span className="text-base">{invoice.totalTTC.toLocaleString()} DA</span>
        </div>
      </div>

      {/* Payment Tender Details */}
      <div className="py-2 border-b border-dashed border-slate-950 text-[11px] space-y-0.5">
        <div className="flex justify-between font-bold">
          <span>MODE RÈGLEMENT :</span>
          <span>{paymentMethodLabel}</span>
        </div>
        {invoice.paymentMethod === 'especes' && (
          <>
            <div className="flex justify-between text-slate-600">
              <span>Espèces reçues :</span>
              <span>{cashReceived.toLocaleString()} DA</span>
            </div>
            <div className="flex justify-between font-black text-slate-950 pt-0.5">
              <span>RENDU MONNAIE :</span>
              <span className="text-[12px]">{changeReturned.toLocaleString()} DA</span>
            </div>
          </>
        )}
      </div>

      {/* BaridiMob & Fiscal QR Code */}
      <div className="py-3 flex flex-col items-center justify-center text-center space-y-2 border-b border-dashed border-slate-950">
        {/* Stylized Vector QR Code representing Algerian Fiscal / BaridiMob Transaction */}
        <div className="p-2 bg-white border border-slate-400 rounded-md inline-block shadow-2xs">
          <svg viewBox="0 0 100 100" className="w-24 h-24">
            {/* 3 Corner Anchor Squares */}
            <rect x="5" y="5" width="26" height="26" fill="#000" rx="3" />
            <rect x="9" y="9" width="18" height="18" fill="#fff" rx="2" />
            <rect x="13" y="13" width="10" height="10" fill="#000" />

            <rect x="69" y="5" width="26" height="26" fill="#000" rx="3" />
            <rect x="73" y="9" width="18" height="18" fill="#fff" rx="2" />
            <rect x="77" y="13" width="10" height="10" fill="#000" />

            <rect x="5" y="69" width="26" height="26" fill="#000" rx="3" />
            <rect x="9" y="73" width="18" height="18" fill="#fff" rx="2" />
            <rect x="13" y="77" width="10" height="10" fill="#000" />

            {/* Matrix Data Points Pattern */}
            <rect x="36" y="8" width="6" height="6" fill="#000" />
            <rect x="48" y="8" width="6" height="6" fill="#000" />
            <rect x="58" y="14" width="6" height="6" fill="#000" />
            <rect x="36" y="24" width="6" height="6" fill="#000" />
            <rect x="48" y="24" width="6" height="6" fill="#000" />
            
            <rect x="8" y="36" width="6" height="6" fill="#000" />
            <rect x="20" y="42" width="6" height="6" fill="#000" />
            <rect x="36" y="40" width="8" height="8" fill="#1e3a8a" />
            <rect x="52" y="36" width="6" height="6" fill="#000" />
            <rect x="68" y="40" width="6" height="6" fill="#000" />
            <rect x="82" y="36" width="6" height="6" fill="#000" />

            <rect x="14" y="54" width="6" height="6" fill="#000" />
            <rect x="36" y="56" width="6" height="6" fill="#000" />
            <rect x="46" y="50" width="8" height="8" fill="#000" />
            <rect x="62" y="56" width="6" height="6" fill="#000" />
            <rect x="78" y="54" width="6" height="6" fill="#000" />

            <rect x="38" y="72" width="6" height="6" fill="#000" />
            <rect x="48" y="78" width="6" height="6" fill="#000" />
            <rect x="60" y="70" width="6" height="6" fill="#000" />
            <rect x="74" y="74" width="6" height="6" fill="#000" />
            <rect x="84" y="84" width="6" height="6" fill="#000" />

            {/* BaridiMob badge center */}
            <circle cx="50" cy="50" r="10" fill="#fff" />
            <circle cx="50" cy="50" r="8" fill="#0284c7" />
            <text x="50" y="53" fill="#fff" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">BM</text>
          </svg>
        </div>
        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
          Scanner pour vérification / Paiement BaridiMob
        </div>
      </div>

      {/* Official Stamp Placement (Cachet Humide) */}
      {showStamp && (
        <div className="py-2 flex justify-center">
          <AlgerianSealStamp
            companyName={settings.companyName}
            legalForm={settings.legalForm}
            rcNumber={settings.rcNumber}
            nif={settings.nif}
            wilaya={settings.wilaya}
            date={invoice.date}
            size="sm"
            inkColor="blue"
          />
        </div>
      )}

      {/* Footer Closing & Legal Notices */}
      <div className="text-center pt-3 space-y-1 text-[10px] text-slate-600">
        <p className="font-bold text-slate-900 tracking-wider">
          ★ MERCI DE VOTRE VISITE ★
        </p>
        <p className="font-arabic text-xs font-semibold text-slate-800 dir-rtl">
          شكراً لزيارتكم - نتمنى لكم يوماً سعيداً
        </p>
        <p className="text-[8.5px] text-slate-400 pt-1 border-t border-dotted border-slate-300">
          Les articles vendus ne sont ni repris ni échangés au-delà de 48H.
          Conservez ce ticket comme justificatif d'achat.
        </p>
      </div>

      {/* Jagged bottom tear pattern */}
      <div className="absolute -bottom-2 left-0 right-0 h-2 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-200 to-transparent opacity-60 print:hidden" />
    </div>
  );
};
