import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Save, 
  Bell, 
  Volume2, 
  Globe, 
  Check, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  RotateCcw
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppLanguage, BusinessSettings } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { ALGERIA_WILAYAS } from '../data/algerianBusinessData';
import { playAlarmChime } from '../services/apiService';

interface SettingsViewProps {
  settings: BusinessSettings;
  language: AppLanguage;
  onSaveSettings: (settings: BusinessSettings) => void;
  onLanguageChange: (lang: AppLanguage) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  language,
  onSaveSettings,
  onLanguageChange,
  onResetData
}) => {
  const t = TRANSLATIONS[language];
  const [form, setForm] = useState<BusinessSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <motion.div
      id="screen-settings-management"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 pb-20 max-w-4xl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings size={22} className="text-slate-900" />
            <span>{t.settings.title}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t.settings.subtitle}
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold animate-in fade-in">
            <Check size={14} />
            <span>{language === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Modifications enregistrées !'}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Card 1: Algerian Legal & Tax Identifiers (NIF, NIS, RC) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 size={17} className="text-slate-800" />
            <h3 className="font-bold text-sm text-slate-900">
              {t.settings.legalInfo}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Company Name */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">
                {t.settings.companyName}
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 text-slate-900"
                required
              />
            </div>

            {/* Legal Form */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">
                {t.settings.legalForm}
              </label>
              <select
                value={form.legalForm}
                onChange={(e) => setForm({ ...form, legalForm: e.target.value as BusinessSettings['legalForm'] })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 text-slate-900"
              >
                <option value="SARL">SARL (Société à Responsabilité Limitée)</option>
                <option value="EURL">EURL (Entreprise Unipersonnelle)</option>
                <option value="SPA">SPA (Société Par Actions)</option>
                <option value="SNC">SNC (Société en Nom Collectif)</option>
                <option value="Auto-entrepreneur">Statut Auto-entrepreneur</option>
              </select>
            </div>

            {/* Registre de Commerce (RC) */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">
                {t.settings.rc}
              </label>
              <input
                type="text"
                value={form.rcNumber}
                onChange={(e) => setForm({ ...form, rcNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-medium"
              />
            </div>

            {/* NIF */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">
                {t.settings.nif}
              </label>
              <input
                type="text"
                value={form.nif}
                onChange={(e) => setForm({ ...form, nif: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-medium"
              />
            </div>

            {/* NIS */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">
                {t.settings.nis}
              </label>
              <input
                type="text"
                value={form.nis}
                onChange={(e) => setForm({ ...form, nis: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-medium"
              />
            </div>

            {/* Article d'Imposition */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">
                {t.settings.ai}
              </label>
              <input
                type="text"
                value={form.ai}
                onChange={(e) => setForm({ ...form, ai: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-medium"
              />
            </div>

            {/* Wilaya Selection */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">
                {t.settings.wilaya}
              </label>
              <select
                value={form.wilaya}
                onChange={(e) => setForm({ ...form, wilaya: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 text-slate-900"
              >
                {ALGERIA_WILAYAS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Telephone */}
            <div>
              <label className="block text-slate-500 font-bold mb-1">
                {t.settings.phone}
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
              />
            </div>

            {/* Full Address */}
            <div className="sm:col-span-2">
              <label className="block text-slate-500 font-bold mb-1">
                {t.settings.address}
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Stock Alarm & Notification Preferences */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell size={17} className="text-slate-800" />
            <h3 className="font-bold text-sm text-slate-900">
              {t.settings.stockAlarmPref}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <div>
                <span className="font-bold text-slate-900 block">
                  {t.settings.soundAlarm}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Émet un bip sonore doux lorsqu'un produit atteint le seuil critique
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playAlarmChime()}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 size={12} />
                  <span>Test son</span>
                </button>
                <input
                  type="checkbox"
                  checked={form.alarmSoundEnabled}
                  onChange={(e) => setForm({ ...form, alarmSoundEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <div>
                <span className="font-bold text-slate-900 block">
                  {t.settings.defaultThreshold}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Valeur par défaut appliquée lors de la création d'un nouveau produit
                </span>
              </div>
              <input
                type="number"
                min="1"
                value={form.defaultStockThreshold}
                onChange={(e) => setForm({ ...form, defaultStockThreshold: Number(e.target.value) })}
                className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-center font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Buttons: Submit & Reset */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Voulez-vous réinitialiser toutes les données aux valeurs de démonstration ?")) {
                onResetData();
              }
            }}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Réinitialiser les données</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-black text-[#e4fc65] rounded-full text-xs font-bold shadow-md flex items-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <Save size={14} />
            <span>{t.settings.saveSettings}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};
