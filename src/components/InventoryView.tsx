import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Bell, 
  DollarSign, 
  TrendingUp, 
  Check, 
  RefreshCw, 
  Volume2, 
  VolumeX,
  Search,
  Sliders,
  Sparkles,
  Camera
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppLanguage, InventoryItem } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { formatDZD, playAlarmChime } from '../services/apiService';
import { CameraBarcodeScannerModal } from './CameraBarcodeScannerModal';

interface InventoryViewProps {
  inventory: InventoryItem[];
  language: AppLanguage;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onUpdateAlarmThreshold: (itemId: string, newThreshold: number) => void;
  onRestockItem: (itemId: string, quantity: number) => void;
  onAddProductClick: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  language,
  soundEnabled,
  onToggleSound,
  onUpdateAlarmThreshold,
  onRestockItem,
  onAddProductClick
}) => {
  const t = TRANSLATIONS[language];
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null);
  const [thresholdInput, setThresholdInput] = useState<number>(5);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const activeAlarms = inventory.filter(i => i.alarmActive || i.stockQty <= i.minStockAlert);
  const totalStockValueDZD = inventory.reduce((acc, i) => acc + (i.stockQty * i.costPriceDZD), 0);
  const totalPotentialRevenueDZD = inventory.reduce((acc, i) => acc + (i.stockQty * i.sellingPriceDZD), 0);
  const avgMargin = Math.round(((totalPotentialRevenueDZD - totalStockValueDZD) / (totalPotentialRevenueDZD || 1)) * 100);

  const categories = ['all', ...new Set(inventory.map(i => i.category))];

  const filteredInventory = inventory.filter(i => {
    const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
    const nameStr = (i.name[language] || i.name.fr).toLowerCase();
    const matchesSearch = 
      nameStr.includes(search.toLowerCase()) || 
      i.sku.toLowerCase().includes(search.toLowerCase()) ||
      i.supplier.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleSaveThreshold = (itemId: string) => {
    if (thresholdInput >= 0) {
      onUpdateAlarmThreshold(itemId, thresholdInput);
      setEditingThresholdId(null);
    }
  };

  return (
    <motion.div
      id="screen-inventory-management"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 pb-20"
    >
      {/* 1. Critical Stock Alarm Banner if threshold is breached */}
      {activeAlarms.length > 0 && (
        <div 
          id="banner-stock-critical-alarms"
          className="bg-rose-500 text-white p-4 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-rose-600 animate-in fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={22} className="text-white animate-bounce" />
            </div>
            <div>
              <h3 className="font-black text-sm">
                {language === 'ar' ? 'تنبيه عاجل: منتجات وصلت للحد الحرج المحدد من صاحب العمل!' : t.inventory.alarmBannerMsg}
              </h3>
              <p className="text-xs text-rose-100 font-medium mt-0.5">
                {activeAlarms.length} {language === 'ar' ? 'سلع تتطلب إعادة تموين سريعة لتفادي نفاد المخزون' : 'articles sous le seuil d\'alarme configuré. Veuillez réapprovisionner.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Audio alarm chime test */}
            <button
              onClick={() => {
                playAlarmChime();
              }}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Tester le signal sonore"
            >
              <Volume2 size={13} />
              <span>{language === 'ar' ? 'تجربة الصوت' : 'Tester alarme'}</span>
            </button>
            <button
              onClick={onToggleSound}
              className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition cursor-pointer"
              title={soundEnabled ? "Couper le son" : "Activer le son"}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </div>
        </div>
      )}

      {/* Header with Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package size={22} className="text-slate-900" />
            <span>{t.inventory.title}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t.inventory.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-full text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            title="Utiliser la caméra du smartphone pour scanner et auditer le stock en rayon"
          >
            <Camera size={15} className="text-emerald-600" />
            <span>Scanner Caméra (Audit)</span>
          </button>

          <button
            id="btn-add-product-page"
            onClick={onAddProductClick}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-[#e4fc65] rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span>{t.inventory.addProduct}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Inventory Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Stock Asset Value (DA) */}
        <div 
          id="card-stock-value-kpi"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.inventory.totalStockValue}
            </span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <DollarSign size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {formatDZD(totalStockValueDZD, language)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {language === 'ar' ? 'سعر التكلفة الإجمالي للبضاعة في المستودع' : 'Valorisation au coût d\'achat HT'}
            </p>
          </div>
        </div>

        {/* Active Critical Alarms (Lime or Red card) */}
        <div 
          id="card-active-alarms-kpi"
          className={`${activeAlarms.length > 0 ? 'bg-[#ff6838] text-white border-orange-600 shadow-md shadow-orange-500/10' : 'bg-[#e4fc65] text-slate-950 border-lime-300'} p-5 rounded-3xl border shadow-xs flex flex-col justify-between h-36`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t.inventory.activeAlarms}
            </span>
            <div className={`w-7 h-7 rounded-xl ${activeAlarms.length > 0 ? 'bg-white/20' : 'bg-black/10'} flex items-center justify-center`}>
              <Bell size={15} className={activeAlarms.length > 0 ? 'animate-bounce' : ''} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight">
              {activeAlarms.length} <span className="text-sm font-bold opacity-90">{language === 'ar' ? 'تنبيهات نشطة' : 'articles sous le seuil'}</span>
            </div>
            <p className="text-[11px] font-semibold opacity-90 mt-0.5">
              {activeAlarms.length > 0 ? (language === 'ar' ? 'تتطلب طلبيات تموين عاجلة' : 'Niveau de réapprovisionnement atteint') : (language === 'ar' ? 'جميع مستويات المخزون كافية' : 'Tous les stocks sont optimaux')}
            </p>
          </div>
        </div>

        {/* Total References & Units */}
        <div 
          id="card-total-skus-kpi"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'ar' ? 'إجمالي السلع والقطع' : 'Total Références & Pièces'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-950 tracking-tight">
              {inventory.reduce((acc, i) => acc + i.stockQty, 0)} <span className="text-xs font-bold text-slate-500">({inventory.length} SKUs)</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {language === 'ar' ? 'توزع على مختلف الفئات التجارية' : 'Réparties sur l\'ensemble des dépôts'}
            </p>
          </div>
        </div>

        {/* Average Profit Margin */}
        <div 
          id="card-avg-margin-kpi"
          className="bg-[#fed6c6] p-5 rounded-3xl border border-[#fbc4b0] shadow-xs flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {language === 'ar' ? 'متوسط الهامش الربحي' : 'Marge Commerciale Moyenne'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-black/10 text-slate-900 flex items-center justify-center">
              <TrendingUp size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-950 tracking-tight">
              +{avgMargin}%
            </div>
            <p className="text-[11px] text-slate-800 font-semibold mt-0.5">
              {language === 'ar' ? 'فارق سعر البيع والشراء بالدينار' : 'Ratio prix de vente / coût de revient'}
            </p>
          </div>
        </div>

      </div>

      {/* Filter and Category Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat ? 'bg-[#14151b] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? (language === 'ar' ? 'جميع الفئات' : 'Toutes les catégories') : cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث عن منتج، رمز SKU، مورد...' : 'Recherche par nom, SKU, fournisseur...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
          />
        </div>
      </div>

      {/* Products & Alarm Table */}
      <div 
        id="table-inventory-container"
        className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs overflow-x-auto"
      >
        <table className="w-full text-left text-xs min-w-[850px]">
          <thead>
            <tr className="text-slate-400 font-bold border-b border-slate-100 uppercase text-[10px] tracking-wider">
              <th className="pb-3 px-2">{t.inventory.productName}</th>
              <th className="pb-3 px-2">{t.inventory.stockQty}</th>
              <th className="pb-3 px-2">{t.inventory.minAlertThreshold}</th>
              <th className="pb-3 px-2">{t.inventory.status}</th>
              <th className="pb-3 px-2">{t.inventory.costPrice}</th>
              <th className="pb-3 px-2">{t.inventory.sellingPrice}</th>
              <th className="pb-3 px-2 text-right">{t.inventory.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredInventory.map((item) => {
              const isAlarmActive = item.alarmActive || item.stockQty <= item.minStockAlert;
              const isEditing = editingThresholdId === item.id;
              const displayName = item.name[language] || item.name.fr;

              return (
                <tr 
                  key={item.id}
                  id={`inventory-row-${item.id}`}
                  className={`transition-colors ${isAlarmActive ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50/80'}`}
                >
                  {/* Name & SKU */}
                  <td className="py-3.5 px-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs shrink-0 font-bold ${isAlarmActive ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>
                        <Package size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          {displayName}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                            {item.sku}
                          </span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{item.supplier}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Stock Quantity */}
                  <td className="py-3.5 px-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-black font-mono ${isAlarmActive ? 'text-rose-600' : 'text-slate-900'}`}>
                        {item.stockQty}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.unit}
                      </span>
                    </div>
                  </td>

                  {/* Owner Alarm Threshold (Editable right here!) */}
                  <td className="py-3.5 px-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          value={thresholdInput}
                          onChange={(e) => setThresholdInput(Number(e.target.value))}
                          className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900"
                        />
                        <button
                          onClick={() => handleSaveThreshold(item.id)}
                          className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          title={t.inventory.saveThreshold}
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">
                          ≤ {item.minStockAlert} {item.unit}
                        </span>
                        <button
                          onClick={() => {
                            setEditingThresholdId(item.id);
                            setThresholdInput(item.minStockAlert);
                          }}
                          className="text-[10px] text-slate-400 hover:text-slate-900 hover:underline"
                        >
                          {language === 'ar' ? 'تعديل' : 'Modifier'}
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Alarm Status Badge */}
                  <td className="py-3.5 px-2">
                    {isAlarmActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-extrabold animate-pulse">
                        <AlertTriangle size={11} className="text-rose-600" />
                        <span>{t.inventory.alarmTriggered}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <Check size={11} />
                        <span>{t.inventory.inStock}</span>
                      </span>
                    )}
                  </td>

                  {/* Cost Price */}
                  <td className="py-3.5 px-2 font-mono text-xs text-slate-600 font-semibold">
                    {formatDZD(item.costPriceDZD, language)}
                  </td>

                  {/* Selling Price */}
                  <td className="py-3.5 px-2 font-mono text-xs text-slate-950 font-black">
                    {formatDZD(item.sellingPriceDZD, language)}
                  </td>

                  {/* Restock & Actions */}
                  <td className="py-3.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onRestockItem(item.id, 10)}
                        className="px-3 py-1.5 bg-[#e4fc65] hover:bg-[#d6f04d] text-slate-950 rounded-xl text-[11px] font-bold border border-lime-300 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Ajouter +10 pièces au stock"
                      >
                        <RefreshCw size={11} />
                        <span>+10 {item.unit}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Camera Barcode Scanner for live inventory stock audits and deliveries */}
      <CameraBarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        inventory={inventory}
        mode="inventory_audit"
        onUpdateStock={(itemId, newStock) => {
          const current = inventory.find(i => i.id === itemId);
          if (current) {
            const diff = newStock - current.stockQty;
            onRestockItem(itemId, diff);
          }
        }}
      />
    </motion.div>
  );
};
