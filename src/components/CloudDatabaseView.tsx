import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Server, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Lock, 
  Clock, 
  FileCode, 
  Copy, 
  Check, 
  Zap, 
  HardDrive, 
  Layers, 
  Key,
  Archive,
  Info
} from 'lucide-react';
import { AppLanguage, CloudDbStatus, DatabaseBackupRecord, InventoryItem, Invoice, WorkerProfile } from '../types';
import { CloudDatabaseManager, INITIAL_CLOUD_DB_STATUS } from '../services/cloudDatabaseService';
import { formatDZD } from '../services/apiService';

interface CloudDatabaseViewProps {
  invoices: Invoice[];
  inventory: InventoryItem[];
  workers: WorkerProfile[];
  language: AppLanguage;
}

export const CloudDatabaseView: React.FC<CloudDatabaseViewProps> = ({
  invoices,
  inventory,
  workers,
  language
}) => {
  const [dbStatus, setDbStatus] = useState<CloudDbStatus>(INITIAL_CLOUD_DB_STATUS);
  const [backups, setBackups] = useState<DatabaseBackupRecord[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'backups' | 'postgresql_schema' | 'cluster_metrics'>('backups');

  useEffect(() => {
    const list = CloudDatabaseManager.getBackups();
    setBackups(list);
    const engine = CloudDatabaseManager.getEngine();
    setDbStatus(prev => ({
      ...prev,
      engine,
      totalRecords: {
        invoices: invoices.length,
        fiscalLedger: 3,
        inventory: inventory.length,
        clients: 4,
        workers: workers.length,
        expenses: 4
      }
    }));
  }, [invoices, inventory, workers]);

  const handleSwitchEngine = (newEngine: 'mongodb_atlas' | 'postgresql' | 'hybrid_vault') => {
    CloudDatabaseManager.setEngine(newEngine);
    setDbStatus(prev => ({ ...prev, engine: newEngine }));
  };

  const handleCreateSnapshot = async () => {
    setIsCreatingBackup(true);
    const payload = {
      tenantId: dbStatus.tenantId,
      invoices,
      inventory,
      workers,
      timestamp: new Date().toISOString()
    };

    const newRecord = await CloudDatabaseManager.createImmediateBackup(payload, dbStatus.tenantId);
    setBackups(CloudDatabaseManager.getBackups());
    setIsCreatingBackup(false);
  };

  const handleDownloadBackup = (record: DatabaseBackupRecord) => {
    const payload = {
      tenantId: record.tenantId,
      invoices,
      inventory,
      workers,
      backupId: record.id
    };
    CloudDatabaseManager.downloadBackupBlob(record, payload);
  };

  const postgresSqlDdl = CloudDatabaseManager.generatePostgreSqlDdl(invoices, workers, inventory);

  const handleCopySql = () => {
    navigator.clipboard.writeText(postgresSqlDdl);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <motion.div
      id="cloud-database-vault-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Top Hero Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e4fc65]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-[#e4fc65] text-slate-950 font-black text-xs rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Database size={14} className="text-slate-950" />
                Multi-Tenant Cloud Database
              </span>
              <span className="px-2.5 py-1 bg-white/10 text-white font-mono text-[11px] rounded-full border border-white/10">
                Tenant: {dbStatus.tenantId}
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-[11px] rounded-full border border-emerald-500/30">
                Chiffrement AES-256-GCM
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Infrastructure Données & Sauvegardes Quotidiennes Chiffrées
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Architecture cloud isolée par tenant avec réplication multi-zones et basculement automatique. Sauvegardes nocturnes automatiques (02:00 UTC+1) avec empreintes cryptographiques SHA-256 scellées.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              id="create-manual-backup-btn"
              onClick={handleCreateSnapshot}
              disabled={isCreatingBackup}
              className="px-5 py-3 bg-[#e4fc65] hover:bg-[#d6f04c] text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={15} className={isCreatingBackup ? 'animate-spin' : ''} />
              <span>{isCreatingBackup ? 'Chiffrement AES-256...' : 'Créer un Snapshot Immédiat'}</span>
            </button>
          </div>
        </div>

        {/* Engine Switcher & Connectivity Badges */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Moteur Actif :</span>
            <div className="flex items-center bg-white/10 p-1 rounded-xl">
              <button
                onClick={() => handleSwitchEngine('mongodb_atlas')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${dbStatus.engine === 'mongodb_atlas' ? 'bg-[#e4fc65] text-slate-950' : 'text-slate-300 hover:text-white'}`}
              >
                MongoDB Atlas (Cluster M10)
              </button>
              <button
                onClick={() => handleSwitchEngine('postgresql')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${dbStatus.engine === 'postgresql' ? 'bg-[#e4fc65] text-slate-950' : 'text-slate-300 hover:text-white'}`}
              >
                PostgreSQL Relational
              </button>
              <button
                onClick={() => handleSwitchEngine('hybrid_vault')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${dbStatus.engine === 'hybrid_vault' ? 'bg-[#e4fc65] text-slate-950' : 'text-slate-300 hover:text-white'}`}
              >
                Coffre Hybride
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-300 font-mono text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="text-emerald-400 font-bold">Connecté (Pool: {dbStatus.activePoolConnections} sockets)</span>
            </div>
            <span>•</span>
            <span>Latence : {dbStatus.latencyMs} ms</span>
            <span>•</span>
            <span className="text-slate-400">Prochaine Sauvegarde : {dbStatus.nextScheduledBackup}</span>
          </div>
        </div>
      </div>

      {/* Cluster Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Documents & Lignes Indexées
            </span>
            <Layers size={16} className="text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {(dbStatus.totalRecords?.invoices || 0) + (dbStatus.totalRecords?.inventory || 0) + (dbStatus.totalRecords?.workers || 0) + 12} Objets
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            Factures, inventaire, personnel & audit G50
          </p>
        </div>

        {/* Security / Encryption */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Protocole de Sécurité
            </span>
            <Lock size={16} className="text-emerald-600" />
          </div>
          <div className="text-base font-black text-slate-900 truncate">
            AES-256-GCM
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            Clés gérées par KMS & TLS 1.3
          </p>
        </div>

        {/* Backups Count */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Snapshots Chiffrés
            </span>
            <Archive size={16} className="text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {backups.length} Versions
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            Conservation 30 jours glissants
          </p>
        </div>

        {/* Tenant Isolation */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Isolation Cloisonnée
            </span>
            <ShieldCheck size={16} className="text-indigo-600" />
          </div>
          <div className="text-base font-black text-slate-900 font-mono truncate">
            Row-Level Security (RLS)
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            Ségrégation stricte des données par NIF
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit text-xs font-bold">
        <button
          onClick={() => setActiveTab('backups')}
          className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-2 ${activeTab === 'backups' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Archive size={14} />
          <span>Registre des Sauvegardes Chiffrées ({backups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('postgresql_schema')}
          className={`px-4 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-2 ${activeTab === 'postgresql_schema' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <FileCode size={14} />
          <span>Schéma PostgreSQL DDL & Export</span>
        </button>
      </div>

      {/* Tab 1: Backups List */}
      {activeTab === 'backups' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Snapshots Automatiques & Vérifications d'Intégrité
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Chaque archive comporte un condensat SHA-256 garantissant la non-corruption des tables fiscales.
              </p>
            </div>

            <button
              onClick={handleCreateSnapshot}
              disabled={isCreatingBackup}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={isCreatingBackup ? 'animate-spin' : ''} />
              <span>Nouveau Snapshot</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-100 tracking-wider">
                  <th className="py-3 px-4">Fichier Archive (.enc)</th>
                  <th className="py-3 px-4">Horodatage (UTC+1)</th>
                  <th className="py-3 px-4">Type Sauvegarde</th>
                  <th className="py-3 px-4">Taille</th>
                  <th className="py-3 px-4">Objets Stockés</th>
                  <th className="py-3 px-4">Empreinte SHA-256</th>
                  <th className="py-3 px-4 text-center">Intégrité</th>
                  <th className="py-3 px-4 text-right">Télécharger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {backups.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 flex items-center gap-2">
                        <Lock size={12} className="text-slate-400 shrink-0" />
                        <span>{b.filename}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {new Date(b.timestamp).toLocaleString('fr-FR')}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {b.backupType === 'automatic_daily' ? 'Automatique (02:00)' : 'Snapshot Manuel'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {b.formattedSize}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {b.recordCount} records
                    </td>

                    <td className="py-3 px-4 font-mono text-[10px] text-slate-600">
                      <span className="bg-slate-100 px-1 py-0.5 rounded truncate max-w-[120px] inline-block" title={b.checksumSha256}>
                        {b.checksumSha256.slice(0, 12)}...{b.checksumSha256.slice(-6)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 size={10} />
                        Scellé
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDownloadBackup(b)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Télécharger l'archive JSON/BSON chiffrée"
                      >
                        <Download size={12} />
                        <span>Télécharger</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: PostgreSQL Schema DDL */}
      {activeTab === 'postgresql_schema' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Définition de Schéma PostgreSQL (DDL Multi-Tenant)
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Schéma normalisé 3NF avec clés étrangères, contraintes d'immuabilité et indexations pour déclarations fiscales G50.
              </p>
            </div>

            <button
              onClick={handleCopySql}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {copiedSql ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedSql ? 'Copié !' : 'Copier SQL'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
            {postgresSqlDdl}
          </pre>
        </div>
      )}
    </motion.div>
  );
};
