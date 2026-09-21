import { InventoryItem, Invoice } from '../types';

const DB_NAME = 'AlgeriePOS_Offline_DB';
const DB_VERSION = 1;

export interface QueuedSale {
  queueId?: number;
  timestamp: string;
  invoice: Invoice;
  cashierName?: string;
  synced: boolean;
}

class OfflineStorageManager {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private syncListeners: Array<(pendingCount: number, isOnline: boolean) => void> = [];
  private pendingCountCache: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      // Initial count check
      this.refreshPendingCount();
    }
  }

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Inventory Store
        if (!db.objectStoreNames.contains('inventory')) {
          const invStore = db.createObjectStore('inventory', { keyPath: 'id' });
          invStore.createIndex('sku', 'sku', { unique: false });
          invStore.createIndex('barcode', 'barcode', { unique: false });
        }

        // Invoices Store
        if (!db.objectStoreNames.contains('invoices')) {
          const invcStore = db.createObjectStore('invoices', { keyPath: 'id' });
          invcStore.createIndex('status', 'status', { unique: false });
        }

        // Offline Sales Queue (Auto-incremented)
        if (!db.objectStoreNames.contains('offline_sales_queue')) {
          const queueStore = db.createObjectStore('offline_sales_queue', { 
            keyPath: 'queueId', 
            autoIncrement: true 
          });
          queueStore.createIndex('synced', 'synced', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Caching entire inventory to local IndexedDB
  async cacheInventory(items: InventoryItem[]): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('inventory', 'readwrite');
      const store = tx.objectStore('inventory');

      for (const item of items) {
        store.put(item);
      }

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[OfflineDB] cacheInventory failed:', err);
    }
  }

  // Retrieve cached inventory
  async getOfflineInventory(): Promise<InventoryItem[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('inventory', 'readonly');
      const store = tx.objectStore('inventory');
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  // Fast offline lookup by barcode or SKU
  async findItemByBarcode(code: string): Promise<InventoryItem | undefined> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('inventory', 'readonly');
      const store = tx.objectStore('inventory');

      const cleanCode = code.trim().toLowerCase();

      return new Promise((resolve) => {
        const req = store.openCursor();
        req.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;
          if (cursor) {
            const item = cursor.value as InventoryItem;
            if (
              (item.barcode && item.barcode.trim().toLowerCase() === cleanCode) ||
              (item.sku && item.sku.trim().toLowerCase() === cleanCode)
            ) {
              resolve(item);
              return;
            }
            cursor.continue();
          } else {
            resolve(undefined);
          }
        };
        req.onerror = () => resolve(undefined);
      });
    } catch {
      return undefined;
    }
  }

  // Queue sale for offline resilience
  async recordOfflineSale(invoice: Invoice, cashierName?: string): Promise<number> {
    const db = await this.getDB();
    const tx = db.transaction(['offline_sales_queue', 'invoices'], 'readwrite');
    const queueStore = tx.objectStore('offline_sales_queue');
    const invoiceStore = tx.objectStore('invoices');

    // Also persist directly into local invoices store
    invoiceStore.put(invoice);

    const queuedItem: Omit<QueuedSale, 'queueId'> = {
      timestamp: new Date().toISOString(),
      invoice,
      cashierName: cashierName || 'Caisse Locale',
      synced: false
    };

    const addReq = queueStore.add(queuedItem);

    return new Promise((resolve, reject) => {
      tx.oncomplete = async () => {
        const id = addReq.result as number;
        await this.refreshPendingCount();
        resolve(id);
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  // Get all pending unsynced sales
  async getPendingSales(): Promise<QueuedSale[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('offline_sales_queue', 'readonly');
      const store = tx.objectStore('offline_sales_queue');
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  // Remove a synced sale
  async removePendingSale(queueId: number): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('offline_sales_queue', 'readwrite');
      tx.objectStore('offline_sales_queue').delete(queueId);

      return new Promise((resolve, reject) => {
        tx.oncomplete = async () => {
          await this.refreshPendingCount();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[OfflineDB] removePendingSale failed:', err);
    }
  }

  // Drain the queue when network is restored
  async drainPendingQueue(onSyncSale: (sale: QueuedSale) => Promise<boolean>): Promise<{ syncedCount: number; remainingCount: number }> {
    const pending = await this.getPendingSales();
    let syncedCount = 0;

    for (const item of pending) {
      try {
        const success = await onSyncSale(item);
        if (success && item.queueId) {
          await this.removePendingSale(item.queueId);
          syncedCount++;
        }
      } catch (e) {
        console.warn('[OfflineDB] Failed to sync sale:', item.invoice.number, e);
      }
    }

    const remaining = await this.getPendingSales();
    this.pendingCountCache = remaining.length;
    this.notifyListeners();

    return { syncedCount, remainingCount: remaining.length };
  }

  async refreshPendingCount(): Promise<number> {
    try {
      const sales = await this.getPendingSales();
      this.pendingCountCache = sales.length;
      this.notifyListeners();
      return this.pendingCountCache;
    } catch {
      return 0;
    }
  }

  getPendingCount(): number {
    return this.pendingCountCache;
  }

  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  subscribe(listener: (pendingCount: number, isOnline: boolean) => void): () => void {
    this.syncListeners.push(listener);
    listener(this.pendingCountCache, this.isOnline());
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const online = this.isOnline();
    for (const l of this.syncListeners) {
      try {
        l(this.pendingCountCache, online);
      } catch (err) {
        console.error(err);
      }
    }
  }

  private async handleNetworkChange(online: boolean) {
    this.notifyListeners();
    if (online) {
      await this.refreshPendingCount();
    }
  }
}

export const offlineStorage = new OfflineStorageManager();
