import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, Database } from 'lucide-react';
import { offlineStorage } from '../services/offlineStorageService';

interface OfflineIndicatorProps {
  onManualSync?: () => Promise<void>;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onManualSync }) => {
  const [isOnline, setIsOnline] = useState(offlineStorage.isOnline());
  const [pendingCount, setPendingCount] = useState(offlineStorage.getPendingCount());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = offlineStorage.subscribe((count, online) => {
      setPendingCount(count);
      setIsOnline(online);
    });
    return unsubscribe;
  }, []);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    try {
      if (onManualSync) {
        await onManualSync();
      } else {
        await offlineStorage.drainPendingQueue(async () => true);
      }
      setSyncSuccessMsg('Synchronisation réussie !');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    } catch {
      // Error handled
    } finally {
      setIsSyncing(false);
    }
  };

  // If online and no pending sales and no success message, show a minimal subtle badge or null
  if (isOnline && pendingCount === 0 && !syncSuccessMsg) {
    return null;
  }

  return (
    <div 
      id="offline-sync-indicator-banner"
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold transition-all border ${
        !isOnline 
          ? 'bg-amber-950/90 text-amber-200 border-amber-500/40 backdrop-blur-md'
          : pendingCount > 0 
            ? 'bg-indigo-950/90 text-indigo-200 border-indigo-500/40 backdrop-blur-md'
            : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 backdrop-blur-md'
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff size={15} className="text-amber-400 animate-pulse" />
            <span>Mode Hors-Ligne (IndexedDB actif)</span>
          </>
        ) : (
          <>
            <Wifi size={15} className="text-emerald-400" />
            <span>En Ligne</span>
          </>
        )}
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/30 text-white font-mono text-[11px]">
          <Database size={11} className="text-amber-400" />
          <span>{pendingCount} en attente</span>
        </div>
      )}

      {syncSuccessMsg ? (
        <span className="flex items-center gap-1 text-emerald-300 text-[11px]">
          <CheckCircle size={13} /> {syncSuccessMsg}
        </span>
      ) : (
        isOnline && pendingCount > 0 && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Sync...' : 'Synchroniser'}</span>
          </button>
        )
      )}
    </div>
  );
};
