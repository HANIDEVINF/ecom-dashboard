import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  Camera, 
  X, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Minus, 
  Package, 
  ShoppingCart, 
  Volume2, 
  VolumeX,
  SwitchCamera
} from 'lucide-react';
import { InventoryItem } from '../types';
import { offlineStorage } from '../services/offlineStorageService';

interface CameraBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  mode: 'pos' | 'inventory_audit';
  onItemScanned?: (item: InventoryItem, code: string) => void;
  onUpdateStock?: (itemId: string, newStock: number) => void;
}

export const CameraBarcodeScannerModal: React.FC<CameraBarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  inventory,
  mode,
  onItemScanned,
  onUpdateStock
}) => {
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [matchedItem, setMatchedItem] = useState<InventoryItem | null>(null);
  const [scannedCount, setScannedCount] = useState<number>(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isBeepEnabled, setIsBeepEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'html5-camera-barcode-reader';

  // Web Audio synthetic POS laser beep
  const playBeep = () => {
    if (!isBeepEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, ctx.currentTime); // High pitch crisp scanner beep
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setLastScannedCode(null);
      setMatchedItem(null);
      setCameraError(null);
      return;
    }

    let isMounted = true;

    // Discover available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!isMounted) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera if available
          const backCam = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
          );
          startScanning(backCam ? backCam.id : devices[0].id);
        } else {
          startScanning({ facingMode: 'environment' });
        }
      })
      .catch((err) => {
        console.warn('Could not enumerate cameras, falling back to facingMode:', err);
        startScanning({ facingMode: 'environment' });
      });

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen]);

  const startScanning = async (cameraIdOrConfig: string | { facingMode: string }) => {
    try {
      setCameraError(null);
      if (scannerRef.current) {
        await stopScanner();
      }

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE
      ];

      const html5QrCode = new Html5Qrcode(readerElementId, { formatsToSupport, verbose: false });
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        cameraIdOrConfig,
        {
          fps: 15,
          qrbox: { width: 280, height: 180 }
        },
        (decodedText) => {
          handleCodeDetected(decodedText);
        },
        () => {
          // Ignored per-frame decoding misses
        }
      );

      if (typeof cameraIdOrConfig === 'string') {
        setActiveCameraId(cameraIdOrConfig);
      }
    } catch (err: any) {
      console.error('Camera start error:', err);
      setCameraError(
        err.message || 'Impossible d\'activer la caméra. Vérifiez les autorisations de votre navigateur.'
      );
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Scanner stop warning:', e);
      }
      scannerRef.current = null;
    }
  };

  const handleCodeDetected = async (code: string) => {
    const clean = code.trim();
    if (clean === lastScannedCode) return; // Debounce immediate duplicate

    playBeep();
    setLastScannedCode(clean);
    setScannedCount(prev => prev + 1);

    // 1. Search in props inventory
    let found = inventory.find(
      i => (i.barcode && i.barcode.trim() === clean) || (i.sku && i.sku.trim() === clean)
    );

    // 2. If not found, check offline IndexedDB cache
    if (!found) {
      found = await offlineStorage.findItemByBarcode(clean);
    }

    setMatchedItem(found || null);

    if (found && onItemScanned) {
      onItemScanned(found, clean);
    }
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startScanning({ facingMode: nextMode });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <Camera size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black">
                {mode === 'pos' ? 'Scanner Caméra (Caisse POS)' : 'Audit & Inventaire par Caméra'}
              </h3>
              <p className="text-[11px] text-slate-400">Lecture EAN-13, Code-128, QR Code via Webcam / Mobile</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsBeepEnabled(!isBeepEnabled)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
              title={isBeepEnabled ? 'Bip sonore actif' : 'Bip coupé'}
            >
              {isBeepEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={toggleCameraFacing}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
              title="Changer de caméra (Avant / Arrière)"
            >
              <SwitchCamera size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Viewfinder Container */}
        <div className="relative bg-slate-950 p-2 min-h-[260px] flex items-center justify-center overflow-hidden">
          
          <div id={readerElementId} className="w-full max-w-[360px] rounded-2xl overflow-hidden shadow-inner"></div>

          {/* Reticle Guide Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[280px] h-[180px] border-2 border-dashed border-emerald-400/80 rounded-2xl relative shadow-lg">
              {/* Animated laser line */}
              <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] absolute top-1/2 -translate-y-1/2 animate-pulse"></div>
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-wider bg-black/60 px-2.5 py-0.5 rounded-full text-emerald-300 border border-emerald-500/30">
                Alignez le Code-Barres ici
              </span>
            </div>
          </div>

          {/* Camera Error Message */}
          {cameraError && (
            <div className="absolute inset-x-4 p-4 rounded-2xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs text-center space-y-2">
              <AlertCircle size={22} className="mx-auto text-rose-400" />
              <p className="font-bold">{cameraError}</p>
              <button
                onClick={() => startScanning({ facingMode: 'environment' })}
                className="px-3 py-1 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-500 transition cursor-pointer"
              >
                Réessayer la Caméra
              </button>
            </div>
          )}

        </div>

        {/* Feedback Area & Current Match */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 text-xs">
          
          {lastScannedCode ? (
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-500" />
                  Code détecté : <strong className="font-mono text-slate-900">{lastScannedCode}</strong>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  Total : {scannedCount} scans
                </span>
              </div>

              {matchedItem ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                  <div className="space-y-0.5">
                    <p className="font-black text-slate-900 text-xs">
                      {typeof matchedItem.name === 'string' ? matchedItem.name : (matchedItem.name.fr || matchedItem.name.ar || matchedItem.sku)}
                    </p>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      Prix : <span className="font-bold text-emerald-700">{(matchedItem.sellingPriceDZD || 0).toLocaleString('fr-DZ')} DA</span>
                      {' '}| Stock restant : <span className={`font-bold ${matchedItem.stockQty <= (matchedItem.minStockAlert || 5) ? 'text-rose-600' : 'text-slate-800'}`}>{matchedItem.stockQty} {matchedItem.unit}</span>
                    </p>
                  </div>

                  {mode === 'pos' ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-[#e4fc65] font-black text-xs">
                      <ShoppingCart size={13} />
                      <span>Ajouté au panier !</span>
                    </div>
                  ) : (
                    // Inventory audit quick adjuster
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (onUpdateStock && matchedItem) {
                            onUpdateStock(matchedItem.id, Math.max(0, matchedItem.stockQty - 1));
                          }
                        }}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        title="-1 unité"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="font-black text-slate-900 text-sm px-1">{matchedItem.stockQty}</span>
                      <button
                        onClick={() => {
                          if (onUpdateStock && matchedItem) {
                            onUpdateStock(matchedItem.id, matchedItem.stockQty + 1);
                          }
                        }}
                        className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center hover:bg-emerald-700 cursor-pointer"
                        title="+1 unité"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
                  <span>Article inconnu dans l'inventaire ({lastScannedCode})</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">Non référencé</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
              <Package size={18} className="mx-auto mb-1 text-slate-400" />
              <span>Pointez la caméra vers le code-barres de l'article pour le scanner automatiquement.</span>
            </div>
          )}

          {/* Quick Manual Entry Fallback */}
          <div className="flex items-center gap-2 pt-1">
            <input 
              type="text" 
              placeholder="Ou saisissez le code-barres manuellement..." 
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value;
                  if (val.trim()) {
                    handleCodeDetected(val);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition cursor-pointer"
            >
              Terminé
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
