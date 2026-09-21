import React, { useState } from 'react';
import { 
  Printer, 
  Usb, 
  Radio, 
  Bluetooth, 
  Scissors, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Zap,
  Terminal,
  Cpu
} from 'lucide-react';
import { hardwarePrinter, ESCPOSPrinterConfig } from '../services/escposService';

interface HardwareBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HardwareBridgeModal: React.FC<HardwareBridgeModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ESCPOSPrinterConfig>(hardwarePrinter.getConfig());
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectUSB = async () => {
    setIsConnecting(true);
    setStatusMsg(null);
    const res = await hardwarePrinter.connectWebUSB();
    setIsConnecting(false);
    if (res.success) {
      setStatusMsg({ text: `Connecté avec succès : ${res.deviceName}`, type: 'success' });
      setConfig(hardwarePrinter.getConfig());
    } else {
      setStatusMsg({ text: res.error || 'Erreur de connexion', type: 'error' });
    }
  };

  const handleConnectSerial = async () => {
    setIsConnecting(true);
    setStatusMsg(null);
    const res = await hardwarePrinter.connectWebSerial();
    setIsConnecting(false);
    if (res.success) {
      setStatusMsg({ text: `Connecté via Port Série (COM) : ${res.deviceName}`, type: 'success' });
      setConfig(hardwarePrinter.getConfig());
    } else {
      setStatusMsg({ text: res.error || 'Erreur port série', type: 'error' });
    }
  };

  const handleTestPrint = async () => {
    const mockInvoice: any = {
      id: 'test-inv',
      invoiceNumber: 'TEST-ESC-POS',
      date: new Date().toLocaleDateString('fr-DZ'),
      time: new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }),
      cashierName: 'Administrateur',
      clientName: 'Test Matériel (Comptoir)',
      items: [
        { description: 'Imprimante Thermique 80mm', quantity: 1, unitPrice: 18500, total: 18500 },
        { description: 'Rouleau Papier Thermique 80x80', quantity: 5, unitPrice: 350, total: 1750 }
      ],
      subtotal: 20250,
      taxAmount: 3847.5,
      timbreFiscal: 250,
      totalAmount: 24347.5,
      paidAmount: 25000,
      paymentMethod: 'especes'
    };

    const res = await hardwarePrinter.printInvoiceDirect(mockInvoice);
    setTestOutput(res.rawText);
    setStatusMsg({
      text: `Test envoyé via ${res.method} ! Commande coupe-papier (GS V 66 0) et tiroir-caisse déclenchés.`,
      type: 'success'
    });
  };

  const handleSaveToggle = (key: keyof ESCPOSPrinterConfig, val: any) => {
    const updated = { ...config, [key]: val };
    setConfig(updated);
    hardwarePrinter.saveConfig(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <Printer size={18} />
            </div>
            <div>
              <h3 className="text-base font-black">Passerelle Matérielle ESC/POS (Hardware Bridge)</h3>
              <p className="text-xs text-slate-400">Impression directe sans boîte de dialogue OS (WebUSB &amp; Port Série)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">

          {/* Status Message */}
          {statusMsg && (
            <div className={`p-3 rounded-2xl flex items-center gap-2.5 font-bold ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : statusMsg.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Connection Modes */}
          <div className="space-y-2.5">
            <label className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Cpu size={14} className="text-indigo-600" />
              1. Sélectionner le Protocole Matériel
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* WebUSB */}
              <div 
                onClick={() => handleSaveToggle('type', 'webusb')}
                className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  config.type === 'webusb' 
                    ? 'border-indigo-600 bg-indigo-50/50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-black text-slate-900 flex items-center gap-1.5">
                    <Usb size={15} className="text-indigo-600" /> WebUSB
                  </span>
                  {config.type === 'webusb' && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Epson TM-T20, Xprinter XP-N160, Bixolon, Citizen</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnectUSB();
                  }}
                  disabled={isConnecting}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-slate-900 text-white font-bold text-[11px] hover:bg-black transition cursor-pointer"
                >
                  {isConnecting ? 'Recherche...' : 'Appairer USB'}
                </button>
              </div>

              {/* WebSerial */}
              <div 
                onClick={() => handleSaveToggle('type', 'webserial')}
                className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  config.type === 'webserial' 
                    ? 'border-indigo-600 bg-indigo-50/50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-black text-slate-900 flex items-center gap-1.5">
                    <Radio size={15} className="text-indigo-600" /> Port Série
                  </span>
                  {config.type === 'webserial' && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Câble RS232, COM Virtuel USB, Terminaux intégrés</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnectSerial();
                  }}
                  disabled={isConnecting}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-slate-900 text-white font-bold text-[11px] hover:bg-black transition cursor-pointer"
                >
                  Sélectionner Port
                </button>
              </div>

              {/* Virtual Spooler */}
              <div 
                onClick={() => handleSaveToggle('type', 'virtual_preview')}
                className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  config.type === 'virtual_preview' 
                    ? 'border-emerald-600 bg-emerald-50/50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-black text-slate-900 flex items-center gap-1.5">
                    <Zap size={15} className="text-emerald-600" /> Spooler Direct
                  </span>
                  {config.type === 'virtual_preview' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Impression silencieuse intégrée &amp; Test immédiat</p>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg text-center">
                  Toujours Prêt
                </span>
              </div>

            </div>
          </div>

          {/* Options: Width, Cut, Drawer */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900">Paramètres du Rouleau et Périphériques</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Largeur Rouleau</label>
                <select 
                  value={config.paperWidth}
                  onChange={(e) => handleSaveToggle('paperWidth', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold"
                >
                  <option value="80mm">Standard 80 mm (42 col)</option>
                  <option value="58mm">Compact 58 mm (32 col)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input 
                  type="checkbox"
                  id="chk-auto-cut"
                  checked={config.autoCut}
                  onChange={(e) => handleSaveToggle('autoCut', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="chk-auto-cut" className="font-bold text-slate-800 flex items-center gap-1 cursor-pointer">
                  <Scissors size={13} className="text-slate-600" /> Coupe-papier auto (GS V)
                </label>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input 
                  type="checkbox"
                  id="chk-open-drawer"
                  checked={config.openDrawer}
                  onChange={(e) => handleSaveToggle('openDrawer', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="chk-open-drawer" className="font-bold text-slate-800 cursor-pointer">
                  Ouverture tiroir-caisse (ESC p)
                </label>
              </div>
            </div>
          </div>

          {/* Test & Debug Raw Stream */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleTestPrint}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Printer size={15} />
              <span>Imprimer Ticket Test &amp; Découpe</span>
            </button>

            <span className="text-[11px] text-slate-500">
              Imprimante actuelle : <strong className="text-slate-900">{config.name}</strong>
            </span>
          </div>

          {/* Real-time ESC/POS Raw Text Inspection */}
          {testOutput && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Terminal size={12} /> Flux de Données ESC/POS Généré :
              </label>
              <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto border border-slate-800 leading-relaxed whitespace-pre">
                {testOutput}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
