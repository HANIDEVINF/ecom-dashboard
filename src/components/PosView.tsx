import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Receipt, 
  User, 
  Printer, 
  AlertTriangle, 
  Sparkles,
  Percent,
  CheckCircle2,
  Eye,
  EyeOff,
  Keyboard,
  Barcode,
  ShieldAlert,
  Camera,
  Cpu,
  Layers
} from 'lucide-react';
import { AppLanguage, BusinessSettings, ClientProfile, InventoryItem, Invoice, InvoiceItem } from '../types';
import { formatDZD, playAlarmChime } from '../services/apiService';
import { PrintInvoiceModal } from './PrintInvoiceModal';
import { CameraBarcodeScannerModal } from './CameraBarcodeScannerModal';
import { HardwareBridgeModal } from './HardwareBridgeModal';
import { VirtualizedCatalogList } from './VirtualizedCatalogList';
import { offlineStorage } from '../services/offlineStorageService';
import { hardwarePrinter } from '../services/escposService';

interface PosViewProps {
  inventory: InventoryItem[];
  clients: ClientProfile[];
  settings: BusinessSettings;
  language: AppLanguage;
  onCompleteSale: (newInvoice: Invoice, updatedInventory: InventoryItem[]) => void;
  onNavigateToInventory?: () => void;
}

export const PosView: React.FC<PosViewProps> = ({
  inventory,
  clients,
  settings,
  language,
  onCompleteSale
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{ item: InventoryItem; quantity: number }[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('walk_in');
  const [tvaEnabled, setTvaEnabled] = useState(true);
  const [discountDA, setDiscountDA] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'especes' | 'baridimob' | 'virement_cib' | 'cheque'>('especes');
  const [cashReceivedDA, setCashReceivedDA] = useState<number | ''>('');
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [saleSuccessMessage, setSaleSuccessMessage] = useState(false);
  const [isBlindMode, setIsBlindMode] = useState<boolean>(() => {
    return localStorage.getItem('pos_blind_mode') === 'true';
  });
  const [activeHotkey, setActiveHotkey] = useState<string | null>(null);
  const [barcodeScanFeedback, setBarcodeScanFeedback] = useState<string | null>(null);
  
  // Frontend Specialist State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  const [isVirtualizedCatalog, setIsVirtualizedCatalog] = useState(false);

  // References for keyboard-first navigation
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);

  // Sync Blind Mode preference
  const toggleBlindMode = () => {
    setIsBlindMode(prev => {
      const next = !prev;
      localStorage.setItem('pos_blind_mode', String(next));
      return next;
    });
  };

  // Flash hotkey feedback badge
  const triggerHotkeyFeedback = (key: string) => {
    setActiveHotkey(key);
    setTimeout(() => setActiveHotkey(null), 700);
  };

  // Extract categories
  const categories = ['all', ...Array.from(new Set(inventory.map(i => i.category)))];

  // Filter inventory
  const filteredProducts = inventory.filter(p => {
    const nameMatch = (p.name[language] || p.name.fr).toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory === 'all' || p.category === selectedCategory;
    return nameMatch && categoryMatch;
  });

  // Client selected
  const currentClient = clients.find(c => c.id === selectedClientId);

  // Cart operations
  const addToCart = (product: InventoryItem) => {
    if (product.stockQty <= 0) return;
    setCart(prev => {
      const existing = prev.find(line => line.item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQty) return prev; // Cannot exceed stock
        return prev.map(line => 
          line.item.id === product.id 
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }
      return [...prev, { item: product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(line => {
        if (line.item.id === productId) {
          const newQty = line.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > line.item.stockQty) return line;
          return { ...line, quantity: newQty };
        }
        return line;
      }).filter(Boolean) as { item: InventoryItem; quantity: number }[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(line => line.item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCashReceivedDA('');
    setDiscountDA(0);
  };

  // Calculations
  const clientDiscountPercent = currentClient?.discountTier || 0;
  
  const subtotalHT = cart.reduce((acc, line) => {
    const itemPrice = line.item.sellingPriceDZD;
    return acc + (itemPrice * line.quantity);
  }, 0);

  const clientDiscountDA = Math.round(subtotalHT * (clientDiscountPercent / 100));
  const effectiveSubtotalAfterClientDiscount = Math.max(0, subtotalHT - clientDiscountDA - discountDA);
  const tvaRate = tvaEnabled ? 0.19 : 0;
  const tvaAmount = Math.round(effectiveSubtotalAfterClientDiscount * tvaRate);
  const totalTTC = effectiveSubtotalAfterClientDiscount + tvaAmount;

  const cashTendered = typeof cashReceivedDA === 'number' ? cashReceivedDA : 0;
  const changeDue = Math.max(0, cashTendered - totalTTC);

  // Quick cash tender helper
  const handleQuickCash = (amount: number) => {
    setCashReceivedDA(amount);
  };

  // Barcode / Rapid Search Enter Handler
  const handleBarcodeOrSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Search exact SKU match or single result
    const trimmed = searchQuery.trim().toLowerCase();
    const exactMatch = inventory.find(i => i.sku.toLowerCase() === trimmed) ||
                       inventory.find(i => (i.name[language] || i.name.fr).toLowerCase() === trimmed);

    const targetProduct = exactMatch || (filteredProducts.length === 1 ? filteredProducts[0] : null);

    if (targetProduct) {
      if (targetProduct.stockQty > 0) {
        addToCart(targetProduct);
        setBarcodeScanFeedback(`+1 ${targetProduct.name[language] || targetProduct.name.fr}`);
        setTimeout(() => setBarcodeScanFeedback(null), 1500);
        setSearchQuery('');
        searchInputRef.current?.focus();
      } else {
        setBarcodeScanFeedback(`Stock épuisé pour ${targetProduct.sku}`);
        setTimeout(() => setBarcodeScanFeedback(null), 2000);
      }
    }
  };

  // Submit Sale Handler
  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Generate Invoice Number
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `FAC-2026-${randomSeq}`;
    const today = new Date().toISOString().slice(0, 10);

    const invoiceItems: InvoiceItem[] = cart.map(line => ({
      productId: line.item.id,
      productName: line.item.name[language] || line.item.name.fr,
      sku: line.item.sku,
      quantity: line.quantity,
      unitPriceDZD: line.item.sellingPriceDZD,
      totalDZD: line.item.sellingPriceDZD * line.quantity
    }));

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      number: invoiceNumber,
      type: 'facture',
      date: today,
      dueDate: today,
      clientId: currentClient ? currentClient.id : undefined,
      clientName: currentClient ? currentClient.name : 'Client Comptoir (Vente Directe)',
      clientCompany: currentClient ? currentClient.company : undefined,
      clientWilaya: currentClient ? currentClient.wilaya : settings.wilaya,
      clientNif: currentClient?.nif,
      clientNis: currentClient?.nis,
      clientRc: currentClient?.rcNumber,
      items: invoiceItems,
      subtotalHT,
      tvaRate,
      tvaAmountDZD: tvaAmount,
      discountDZD: clientDiscountDA + discountDA,
      totalTTC,
      paymentMethod,
      status: 'payee',
      notes: `Vente au comptoir réglée par ${paymentMethod.toUpperCase()}`
    };

    // Decrement inventory stock
    let alarmTriggered = false;
    const updatedInventory = inventory.map(item => {
      const line = cart.find(l => l.item.id === item.id);
      if (line) {
        const newStock = Math.max(0, item.stockQty - line.quantity);
        const willAlarm = newStock <= item.minStockAlert;
        if (willAlarm && !item.alarmActive) {
          alarmTriggered = true;
        }
        return {
          ...item,
          stockQty: newStock,
          alarmActive: willAlarm
        };
      }
      return item;
    });

    if (alarmTriggered && settings.alarmSoundEnabled) {
      playAlarmChime();
    }

    // Call upstream state updater
    onCompleteSale(newInvoice, updatedInventory);

    // True Offline-First: persist sale in local IndexedDB queue
    offlineStorage.recordOfflineSale(newInvoice).catch(err => {
      console.warn('Could not queue sale in offline IndexedDB:', err);
    });
    offlineStorage.cacheInventory(updatedInventory).catch(() => {});

    // Direct ESC/POS Hardware Bridge: auto-print if hardware printer configured
    const hwConfig = hardwarePrinter.getConfig();
    if (hwConfig.type === 'webusb' || hwConfig.type === 'webserial') {
      hardwarePrinter.printInvoiceDirect(newInvoice).catch(e => {
        console.warn('Direct ESC/POS hardware print failed:', e);
      });
    }

    setCompletedInvoice(newInvoice);
    setSaleSuccessMessage(true);
    clearCart();

    setTimeout(() => {
      setSaleSuccessMessage(false);
    }, 4000);
  };

  // Global Counter Hotkeys (F2: Search, F4: Tender, F8: Blind Mode, Esc: Clear/Cancel, Enter: Checkout)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if print modal is already open
      if (isPrintModalOpen) return;

      // F2: Focus Search / Barcode input
      if (e.key === 'F2') {
        e.preventDefault();
        triggerHotkeyFeedback('F2');
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }

      // F4: Focus Cash Tender amount
      if (e.key === 'F4') {
        e.preventDefault();
        triggerHotkeyFeedback('F4');
        setPaymentMethod('especes');
        cashInputRef.current?.focus();
        cashInputRef.current?.select();
      }

      // F8: Toggle Cashier Blind Mode (Privacy Eye)
      if (e.key === 'F8') {
        e.preventDefault();
        triggerHotkeyFeedback('F8');
        toggleBlindMode();
      }

      // Escape: Blur inputs or Void cart if empty
      if (e.key === 'Escape') {
        if (document.activeElement === searchInputRef.current || document.activeElement === cashInputRef.current) {
          (document.activeElement as HTMLElement).blur();
        } else if (cart.length > 0) {
          triggerHotkeyFeedback('Esc');
          clearCart();
        }
      }

      // Enter outside inputs: trigger checkout if cart has items
      if (e.key === 'Enter' && e.target === document.body && cart.length > 0) {
        e.preventDefault();
        triggerHotkeyFeedback('Enter');
        handleCheckout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isPrintModalOpen, isBlindMode]);

  return (
    <motion.div
      id="pos-sales-register-view"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      {/* Top Banner & Title with Ergonomic Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {language === 'ar' ? 'نقطة البيع والصندوق السريع' : 'Point de Vente & Caisse Rapide'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#14151b] text-[#e4fc65]">
              POS DZD
            </span>
            {isBlindMode && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <EyeOff size={12} />
                <span>Mode Discret Actif</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {language === 'ar' 
              ? 'تسجيل المبيعات المباشرة، ماسح الباركود، خصم المخزون التلقائي، وتذاكر 80 مم'
              : 'Encaissement direct, ergonomie clavier (F2/F4/F8), impression ticket 80mm et masquage discret'}
          </p>
        </div>

        {/* Top Right: Hardware, Scanner, Virtualization & Cashier Privacy */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Virtualized Catalog Toggle */}
          <button
            onClick={() => setIsVirtualizedCatalog(!isVirtualizedCatalog)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
              isVirtualizedCatalog
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Basculer vers le catalogue virtualisé haute performance (TanStack Virtual - 15 000+ SKUs)"
          >
            <Layers size={14} className={isVirtualizedCatalog ? 'text-white' : 'text-indigo-600'} />
            <span>{isVirtualizedCatalog ? 'Vue Grille' : 'Catalogue Virtuel (15k)'}</span>
          </button>

          {/* Camera Barcode Scanner Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
            title="Ouvrir le scanner caméra pour smartphones, tablettes ou webcams"
          >
            <Camera size={14} className="text-emerald-600" />
            <span>Scanner Caméra</span>
          </button>

          {/* Hardware Bridge Button (ESC/POS) */}
          <button
            onClick={() => setIsHardwareModalOpen(true)}
            className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
            title="Configurer l'imprimante thermique USB/Série et le tiroir-caisse"
          >
            <Cpu size={14} className="text-slate-900" />
            <span>Matériel ESC/POS</span>
          </button>

          {/* Cashier Blind Mode Toggle */}
          <button
            onClick={toggleBlindMode}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border ${
              isBlindMode
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Masquer les marges et bénéfices aux yeux des clients devant la caisse (Touche F8)"
          >
            {isBlindMode ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>{isBlindMode ? 'Discret (F8) ON' : 'Mode Discret (F8)'}</span>
          </button>

          {/* Success Alert Pill */}
          {saleSuccessMessage && completedInvoice && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500 text-slate-950 px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2 font-bold text-xs"
            >
              <CheckCircle2 size={16} className="text-slate-950" />
              <span>Vente #{completedInvoice.number}</span>
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="bg-slate-950 text-[#e4fc65] px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 hover:bg-black cursor-pointer"
              >
                <Printer size={12} />
                <span>Ticket 80mm</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Keyboard-First Counter Ergonomics HUD Strip */}
      <div 
        id="pos-keyboard-shortcuts-bar"
        className="bg-slate-900 text-white rounded-2xl p-2.5 px-4 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs"
      >
        <div className="flex items-center gap-2 text-slate-400">
          <Keyboard size={14} className="text-[#e4fc65]" />
          <span className="text-[11px] font-bold text-slate-200">Raccourcis Caisse Rapide :</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* F2 Search */}
          <button
            onClick={() => {
              searchInputRef.current?.focus();
              searchInputRef.current?.select();
              triggerHotkeyFeedback('F2');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeHotkey === 'F2' ? 'bg-[#e4fc65] text-slate-950 scale-105' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <span className="px-1 py-0.2 rounded bg-black/40 text-[#e4fc65] font-bold text-[10px]">F2</span>
            <span>Scan / Chercher</span>
          </button>

          {/* F4 Tender */}
          <button
            onClick={() => {
              cashInputRef.current?.focus();
              cashInputRef.current?.select();
              triggerHotkeyFeedback('F4');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeHotkey === 'F4' ? 'bg-[#e4fc65] text-slate-950 scale-105' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <span className="px-1 py-0.2 rounded bg-black/40 text-[#e4fc65] font-bold text-[10px]">F4</span>
            <span>Espèces reçues</span>
          </button>

          {/* F8 Blind mode */}
          <button
            onClick={() => {
              toggleBlindMode();
              triggerHotkeyFeedback('F8');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeHotkey === 'F8' || isBlindMode ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <span className="px-1 py-0.2 rounded bg-black/40 text-[#e4fc65] font-bold text-[10px]">F8</span>
            <span>{isBlindMode ? 'Discret ON' : 'Mode Discret'}</span>
          </button>

          {/* Enter finalize */}
          <button
            disabled={cart.length === 0}
            onClick={() => {
              handleCheckout();
              triggerHotkeyFeedback('Enter');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeHotkey === 'Enter' ? 'bg-emerald-400 text-slate-950 font-bold scale-105' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <span className="px-1 py-0.2 rounded bg-black/40 text-[#e4fc65] font-bold text-[10px]">↵ Entrée</span>
            <span>Valider</span>
          </button>

          {/* Esc Clear */}
          <button
            disabled={cart.length === 0}
            onClick={() => {
              clearCart();
              triggerHotkeyFeedback('Esc');
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
              activeHotkey === 'Esc' ? 'bg-rose-400 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <span className="px-1 py-0.2 rounded bg-black/40 text-rose-300 font-bold text-[10px]">Esc</span>
            <span>Vider</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns (Products Catalog Left, Cart Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Catalog & Search (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {isVirtualizedCatalog ? (
            <VirtualizedCatalogList 
              items={inventory}
              onAddToCart={addToCart}
              language={language}
            />
          ) : (
            <>
              {/* Search and Category Filter with Barcode Enter listener */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <form onSubmit={handleBarcodeOrSearchSubmit} className="relative">
                  <Barcode className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={language === 'ar' ? 'امسح الباركود أو ابحث بالاسم أو SKU... (اضغط F2 للتركيز)' : 'Scanner code-barres ou rechercher (F2)... Appuyer sur Entrée pour ajouter'}
                    className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer"
                      title="Ouvrir le Scanner Caméra (Webcam / Smartphone)"
                    >
                      <Camera size={13} />
                    </button>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-mono text-[10px] font-bold">
                      F2
                    </span>
                  </div>
                </form>

                {/* Live barcode scan alert feedback */}
                {barcodeScanFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-xl flex items-center gap-2"
                  >
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Article scanné : {barcodeScanFeedback}</span>
                  </motion.div>
                )}

                {/* Category pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-[11px] ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {cat === 'all' ? (language === 'ar' ? 'الكل' : 'Tous') : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredProducts.map(product => {
                  const inCartQty = cart.find(c => c.item.id === product.id)?.quantity || 0;
                  const remainingStock = product.stockQty - inCartQty;
                  const isOutOfStock = remainingStock <= 0;
                  const isLowStock = product.stockQty <= product.minStockAlert;

                  return (
                    <div
                      key={product.id}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                        isOutOfStock 
                          ? 'opacity-50 border-slate-200 cursor-not-allowed' 
                          : 'border-slate-200/80 hover:border-slate-400 hover:shadow-md active:scale-[0.99]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {product.sku}
                          </span>
                          {isLowStock && (
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <AlertTriangle size={10} />
                              {language === 'ar' ? 'حرج' : 'Alerte Stock'}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                          {product.name[language] || product.name.fr}
                        </h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {product.category}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          {/* Price presentation (Selling price is always public, cost is masked) */}
                          <div className="text-sm font-mono font-black text-slate-950">
                            {formatDZD(product.sellingPriceDZD, language)}
                          </div>
                          <span className={`text-[10px] font-semibold ${
                            isOutOfStock ? 'text-rose-600 font-bold' : remainingStock <= product.minStockAlert ? 'text-amber-600' : 'text-slate-500'
                          }`}>
                            {isOutOfStock 
                              ? (language === 'ar' ? 'نفذ المخزون' : 'Épuisé')
                              : `${remainingStock} ${product.unit} ${language === 'ar' ? 'متوفر' : 'dispo'}`}
                          </span>
                        </div>

                        <button
                          disabled={isOutOfStock}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            isOutOfStock
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-slate-900 text-[#e4fc65] hover:bg-black shadow-2xs'
                          }`}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>

        {/* Right Column: Checkout Cart & Tender (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between min-h-[580px]">
            
            {/* Cart Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-[#e4fc65] flex items-center justify-center">
                    <ShoppingCart size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      {language === 'ar' ? 'سلة المشتريات' : 'Panier Caisse'}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      {cart.length} {language === 'ar' ? 'عناصر' : 'articles'}
                    </span>
                  </div>
                </div>

                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 transition-all cursor-pointer flex items-center gap-1"
                    title="Vider le panier (Touche Esc)"
                  >
                    <Trash2 size={12} />
                    <span>{language === 'ar' ? 'إفراغ (Esc)' : 'Vider (Esc)'}</span>
                  </button>
                )}
              </div>

              {/* Client Selector */}
              <div className="my-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <User size={12} />
                  <span>{language === 'ar' ? 'العميل المشتري' : 'Client / Destinataire'}</span>
                </label>
                <select
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none"
                >
                  <option value="walk_in">
                    {language === 'ar' ? 'زبون عابر (Comptoir Espèces)' : 'Client Comptoir (Vente Directe)'}
                  </option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.wilaya}) {c.discountTier > 0 ? `[-${c.discountTier}%]` : ''}
                    </option>
                  ))}
                </select>
                {clientDiscountPercent > 0 && (
                  <p className="text-[10px] text-emerald-700 font-bold px-1">
                    ✓ Remise préférentielle de {clientDiscountPercent}% appliquée automatiquement
                  </p>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 my-2">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <p className="font-semibold">
                      {language === 'ar' ? 'السلة فارغة حالياً' : 'Panier vide'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {language === 'ar' ? 'اضغط F2 للبحث أو مسح الباركود' : 'Sélectionnez des articles ou scannez un code-barres (F2)'}
                    </p>
                  </div>
                ) : (
                  cart.map(({ item, quantity }) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <h5 className="font-bold text-slate-900 truncate text-[11px]">
                          {item.name[language] || item.name.fr}
                        </h5>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatDZD(item.sellingPriceDZD, language)} × {quantity}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-slate-950 text-xs">
                          {formatDZD(item.sellingPriceDZD * quantity, language)}
                        </span>
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-[11px]">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations & Tender Section */}
            <div className="border-t border-slate-100 pt-3 space-y-3">
              
              {/* TVA & Discount Toggles */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={tvaEnabled}
                    onChange={e => setTvaEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-0"
                  />
                  <span>TVA 19% légale</span>
                </label>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-500">Remise DA:</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={discountDA || ''}
                    onChange={e => setDiscountDA(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="0"
                    className="w-20 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-right font-mono text-xs"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'طريقة الدفع' : 'Mode de paiement'}
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'especes', label: 'Espèces', icon: <Banknote size={13} /> },
                    { id: 'baridimob', label: 'BaridiMob', icon: <Smartphone size={13} /> },
                    { id: 'virement_cib', label: 'CIB / BNA', icon: <CreditCard size={13} /> },
                    { id: 'cheque', label: 'Chèque', icon: <Receipt size={13} /> }
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer text-[10px] font-bold ${
                        paymentMethod === method.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {method.icon}
                      <span>{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash change tender if Espèces */}
              {paymentMethod === 'especes' && totalTTC > 0 && (
                <div className="bg-amber-50/70 p-2.5 rounded-2xl border border-amber-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                      <span>{language === 'ar' ? 'المبلغ المقبوض (DA) :' : 'Espèces reçues :'}</span>
                      <span className="px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-mono text-[9px] font-bold">F4</span>
                    </span>
                    <input
                      ref={cashInputRef}
                      type="number"
                      step="500"
                      value={cashReceivedDA}
                      onChange={e => setCashReceivedDA(e.target.value ? Number(e.target.value) : '')}
                      placeholder={totalTTC.toString()}
                      className="w-28 px-2 py-1 bg-white border border-amber-300 rounded-lg text-right font-mono font-black text-xs text-slate-950 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Quick tender pills */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {[totalTTC, 2000, 5000, 10000, 20000].map(val => (
                      <button
                        key={val}
                        onClick={() => handleQuickCash(val)}
                        className="px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-950 border border-amber-200 rounded-md text-[10px] font-mono font-bold cursor-pointer"
                      >
                        {val.toLocaleString()} DA
                      </button>
                    ))}
                  </div>

                  {/* Change Due calculation */}
                  <div className="flex items-center justify-between pt-1 border-t border-amber-200 text-xs font-bold text-slate-900">
                    <span>{language === 'ar' ? 'الصرف الواجب إرجاعه :' : 'Monnaie à rendre :'}</span>
                    <span className="font-mono text-emerald-800 font-black text-sm">
                      {formatDZD(changeDue, language)}
                    </span>
                  </div>
                </div>
              )}

              {/* Totals Summary */}
              <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Total HT :</span>
                  <span className="font-mono font-semibold">{formatDZD(subtotalHT, language)}</span>
                </div>
                {(clientDiscountDA > 0 || discountDA > 0) && (
                  <div className="flex justify-between text-emerald-700 text-[11px] font-semibold">
                    <span>Remise totale accordée :</span>
                    <span className="font-mono">-{formatDZD(clientDiscountDA + discountDA, language)}</span>
                  </div>
                )}
                {tvaEnabled && (
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>TVA 19% :</span>
                    <span className="font-mono">{formatDZD(tvaAmount, language)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-950 font-black text-base pt-1 border-t border-slate-200">
                  <span>TOTAL À PAYER :</span>
                  <span className="font-mono text-lg text-slate-950">{formatDZD(totalTTC, language)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className={`w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer ${
                  cart.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#e4fc65] hover:bg-[#d4ee4d] text-slate-950'
                }`}
              >
                <Check size={16} />
                <span>
                  {language === 'ar' 
                    ? `تأكيد البيع وحفظ الفاتورة (${formatDZD(totalTTC, language)}) [Entrée]` 
                    : `VALIDER LA VENTE & ENCAISSER (${formatDZD(totalTTC, language)}) [Entrée]`}
                </span>
              </button>

            </div>

          </div>
        </div>

      </div>

      {/* Printable Invoice Modal (Defaults to 80mm thermal receipt for counter speed) */}
      <PrintInvoiceModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        invoice={completedInvoice}
        settings={settings}
        language={language}
        initialFormat="thermal_80mm"
      />

      {/* Camera Barcode & QR Scanner Modal */}
      <CameraBarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        inventory={inventory}
        mode="pos"
        onItemScanned={(item) => {
          addToCart(item);
          const nameStr = typeof item.name === 'string' ? item.name : (item.name[language] || item.name.fr);
          setBarcodeScanFeedback(nameStr);
          setTimeout(() => setBarcodeScanFeedback(null), 2500);
        }}
      />

      {/* Hardware Bridge Modal (ESC/POS, WebUSB, WebSerial) */}
      <HardwareBridgeModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
      />
    </motion.div>
  );
};

