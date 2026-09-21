import React, { useState } from 'react';
import { X, Check, Users, Package, Briefcase, Plus, Calendar } from 'lucide-react';
import { ALGERIA_WILAYAS } from '../data/algerianBusinessData';
import { AppLanguage } from '../types';

export type AddModalType = 'worker' | 'product' | 'client' | 'task' | 'schedule';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: AddModalType;
  language: AppLanguage;
  onAddWorker?: (workerData: any) => void;
  onAddProduct?: (productData: any) => void;
  onAddClient?: (clientData: any) => void;
  onAddTask?: (taskData: any) => void;
  onAddSchedule?: (scheduleData: any) => void;
}

export const AddModal: React.FC<AddModalProps> = ({
  isOpen,
  onClose,
  type,
  language,
  onAddWorker,
  onAddProduct,
  onAddClient,
  onAddTask,
  onAddSchedule
}) => {
  // Worker Form State
  const [workerName, setWorkerName] = useState('');
  const [workerRole, setWorkerRole] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerWilaya, setWorkerWilaya] = useState(ALGERIA_WILAYAS[15]); // 16 - Alger
  const [workerSalary, setWorkerSalary] = useState(70000);
  const [workerHourly, setWorkerHourly] = useState(450);
  const [workerCnas, setWorkerCnas] = useState('');

  // Product Form State
  const [prodNameFr, setProdNameFr] = useState('');
  const [prodNameAr, setProdNameAr] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodCategory, setProdCategory] = useState('Informatique');
  const [prodStock, setProdStock] = useState(10);
  const [prodThreshold, setProdThreshold] = useState(5);
  const [prodCostPrice, setProdCostPrice] = useState(15000);
  const [prodSellingPrice, setProdSellingPrice] = useState(21000);
  const [prodSupplier, setProdSupplier] = useState('');
  const [prodUnit, setProdUnit] = useState('pcs');

  // Client Form State
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientWilaya, setClientWilaya] = useState(ALGERIA_WILAYAS[15]);
  const [clientPhone, setClientPhone] = useState('');
  const [clientNif, setClientNif] = useState('');
  const [clientDiscount, setClientDiscount] = useState(5);

  // Task / Note State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAmount, setTaskAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'worker') {
      onAddWorker?.({
        id: `wrk-${Date.now()}`,
        name: workerName,
        role: workerRole || "Employé",
        phone: workerPhone || "+213 550 00 00 00",
        wilaya: workerWilaya,
        status: "off_shift",
        clockInTime: undefined,
        hoursWorkedThisMonth: 0,
        monthlySalaryDZD: Number(workerSalary) || 60000,
        hourlyRateDZD: Number(workerHourly) || 400,
        payFrequency: "monthly",
        paymentDueDate: "30/09/2026",
        paymentStatus: "pending",
        cnasNumber: workerCnas || undefined
      });
    } else if (type === 'product') {
      onAddProduct?.({
        id: `inv-${Date.now()}`,
        name: {
          fr: prodNameFr || "Nouveau Produit",
          en: prodNameFr || "New Product",
          ar: prodNameAr || prodNameFr || "منتج جديد"
        },
        sku: prodSku || `DZ-${Math.floor(1000 + Math.random() * 9000)}`,
        category: prodCategory,
        stockQty: Number(prodStock) || 0,
        unit: prodUnit,
        minStockAlert: Number(prodThreshold) || 5,
        alarmActive: Number(prodStock) <= Number(prodThreshold),
        costPriceDZD: Number(prodCostPrice) || 0,
        sellingPriceDZD: Number(prodSellingPrice) || 0,
        supplier: prodSupplier || "Fournisseur Local",
        lastRestocked: new Date().toLocaleDateString('fr-FR')
      });
    } else if (type === 'client') {
      onAddClient?.({
        id: `cli-${Date.now()}`,
        name: clientName,
        company: clientCompany || clientName,
        wilaya: clientWilaya,
        phone: clientPhone || "+213 550 00 00 00",
        email: "contact@client.dz",
        nif: clientNif || undefined,
        totalOrders: 1,
        totalRevenueDZD: 0,
        outstandingBalanceDZD: 0,
        discountTier: Number(clientDiscount) || 0,
        notes: "Nouveau client enregistré",
        customPricingEnabled: Number(clientDiscount) > 0,
        status: "active"
      });
    } else if (type === 'task') {
      onAddTask?.({
        id: `note-${Date.now()}`,
        type: taskTitle,
        date: new Date().toLocaleDateString('fr-FR'),
        status: "100%",
        statusPercent: 100,
        duration: taskAmount ? `${taskAmount} DA` : "Terminé",
        category: "sales",
        amountDZD: Number(taskAmount) || undefined
      });
    }

    onClose();
  };

  const titles = {
    worker: language === 'ar' ? 'إضافة موظف جديد' : 'Ajouter un Employé (Pointage & Salaire)',
    product: language === 'ar' ? 'إضافة سلعة وضبط منبه المخزون' : 'Ajouter un Produit & Seuil d\'Alarme',
    client: language === 'ar' ? 'إضافة عميل وتسعيرة مخصصة' : 'Ajouter un Client (Tarif & Wilaya)',
    task: language === 'ar' ? 'إضافة عملية أو طلبية' : 'Nouvelle Opération Commerciale',
    schedule: language === 'ar' ? 'حجز موعد أو توصيل' : 'Planifier un Rendez-vous'
  };

  return (
    <div 
      id="modal-add-item-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="modal-add-item-card"
        className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">{titles[type]}</h3>
          <button 
            id="btn-close-add-modal"
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* 1. WORKER FORM */}
          {type === 'worker' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom et Prénom de l'employé</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Khaled Belhadj"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Poste occupé</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Magasinier / Livreur"
                    value={workerRole}
                    onChange={(e) => setWorkerRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    placeholder="+213 550 00 00 00"
                    value={workerPhone}
                    onChange={(e) => setWorkerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Salaire Net Mensuel (DA)</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={workerSalary}
                    onChange={(e) => setWorkerSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Taux Horaire (DA/h)</label>
                  <input
                    type="number"
                    step="50"
                    value={workerHourly}
                    onChange={(e) => setWorkerHourly(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Wilaya</label>
                  <select
                    value={workerWilaya}
                    onChange={(e) => setWorkerWilaya(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  >
                    {ALGERIA_WILAYAS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">N° CNAS (Sécurité Sociale)</label>
                  <input
                    type="text"
                    placeholder="16-123456-78"
                    value={workerCnas}
                    onChange={(e) => setWorkerCnas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCT & ALARM FORM */}
          {type === 'product' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation du Produit (Français)</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Imprimante Thermique Ticket CIB"
                  value={prodNameFr}
                  onChange={(e) => setProdNameFr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation en Arabe (اسم السلعة بالعربية)</label>
                <input
                  type="text"
                  placeholder="طابعة فواتير حرارية"
                  value={prodNameAr}
                  onChange={(e) => setProdNameAr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-medium text-right font-['Cairo']"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code / SKU</label>
                  <input
                    type="text"
                    placeholder="ex: TPE-DZ-05"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantité Initiale</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-rose-700 mb-1">🚨 Seuil d'Alarme</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={prodThreshold}
                    onChange={(e) => setProdThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-rose-50/50 text-rose-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prix d'Achat HT (DA)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={prodCostPrice}
                    onChange={(e) => setProdCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prix de Vente TTC (DA)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={prodSellingPrice}
                    onChange={(e) => setProdSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fournisseur</label>
                  <input
                    type="text"
                    placeholder="ex: Grossiste Alger"
                    value={prodSupplier}
                    onChange={(e) => setProdSupplier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unité de mesure</label>
                  <select
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  >
                    <option value="pcs">Pièces (pcs)</option>
                    <option value="carton">Cartons</option>
                    <option value="kg">Kilogrammes (kg)</option>
                    <option value="rouleau">Rouleaux</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 3. CLIENT FORM */}
          {type === 'client' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Raison Sociale / Entreprise</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Sarl El Wiam Transport"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Principal</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Mourad Boukhalfa"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Wilaya d'implantation</label>
                  <select
                    value={clientWilaya}
                    onChange={(e) => setClientWilaya(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  >
                    {ALGERIA_WILAYAS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    placeholder="+213 550 11 22 33"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Numéro NIF (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="001816099238472"
                    value={clientNif}
                    onChange={(e) => setClientNif(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Remise Tarifaire (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={clientDiscount}
                    onChange={(e) => setClientDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. TASK / NOTE FORM */}
          {type === 'task' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation de la commande / tâche</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Livraison 10 Écrans Sarl Oran Tech"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Montant de l'opération (DA)</label>
                <input
                  type="number"
                  placeholder="385000"
                  value={taskAmount}
                  onChange={(e) => setTaskAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono font-bold"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-black text-[#e4fc65] rounded-xl font-bold shadow-sm transition active:scale-95 cursor-pointer"
            >
              Enregistrer
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
