import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  Layers,
  ShoppingBag,
  Package,
  FileSpreadsheet,
  Globe2
} from 'lucide-react';
import { AppLanguage, UserAccount, UserSession } from '../types';
import { AuthService, INITIAL_USER_ACCOUNTS } from '../services/authService';
import { USER_ROLES_CONFIG } from '../services/rbacService';

interface LoginViewProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  language,
  onLanguageChange,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [selectedDemoUser, setSelectedDemoUser] = useState<UserAccount | null>(null);

  const isRtl = language === 'ar';

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = AuthService.login(username, password);
      setIsLoading(false);

      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setErrorMessage(res.error || 'Identifiant ou mot de passe incorrect.');
      }
    }, 350);
  };

  const handleSelectDemoAccount = (acc: UserAccount) => {
    setSelectedDemoUser(acc);
    setUsername(acc.username);
    setPassword(acc.password);
    setErrorMessage(null);
  };

  return (
    <div 
      id="enterprise-login-portal" 
      className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden ${isRtl ? 'rtl' : 'ltr'}`}
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#e4fc65]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e4fc65] to-amber-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-[#e4fc65]/20">
            DZ
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
              <span>Atlas Business Suite</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-[#e4fc65] border border-white/10">
                v2.6 Enterprise
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              SARL Atlas Distribution • Registre Commerce 16/00-98741B22 (Alger)
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md p-1 rounded-2xl border border-white/10">
          <Globe2 size={13} className="text-slate-400 ml-2 mr-1" />
          {(['fr', 'ar', 'en'] as AppLanguage[]).map((lng) => (
            <button
              key={lng}
              onClick={() => onLanguageChange(lng)}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                language === lng
                  ? 'bg-[#e4fc65] text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {lng === 'fr' ? 'FR' : lng === 'ar' ? 'العربية' : 'EN'}
            </button>
          ))}
        </div>
      </header>

      {/* Central Login Card Container */}
      <main className="relative z-10 max-w-5xl w-full mx-auto my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Authentic Credentials & Role Badges */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#e4fc65] flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Contrôle d'Accès Sécurisé (RBAC)
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Chaque profil possède son interface dédiée.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connectez-vous avec vos identifiants professionnels. Les vues, boutons et données confidentielles (marges, salaires CNAS) s'adaptent automatiquement à votre niveau d'habilitation.
              </p>
            </div>

            {/* Quick 1-Click Demo Profiles */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                <span>Profils & Comptes Configurés (1-Clic pour tester) :</span>
                <span className="text-[10px] text-[#e4fc65]">Mot de passe pré-rempli</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INITIAL_USER_ACCOUNTS.map((acc) => {
                  const cfg = USER_ROLES_CONFIG[acc.role];
                  const isSelected = username === acc.username;

                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectDemoAccount(acc)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white/15 border-[#e4fc65] shadow-lg shadow-[#e4fc65]/10 ring-1 ring-[#e4fc65]'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-lg">{acc.avatarIcon}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${cfg.badgeColor}`}>
                          {acc.role.toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-2">
                        <div className="text-xs font-black text-white group-hover:text-[#e4fc65] transition-colors truncate">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          user: <strong className="text-slate-200">{acc.username}</strong>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          pass: <strong className="text-slate-300">{acc.password}</strong>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-white/5 text-[9px] text-slate-400 truncate">
                        {acc.role === 'caissier' ? '🎯 Interface Caisse POS' :
                         acc.role === 'magasinier' ? '📦 Interface Stock & BL' :
                         acc.role === 'comptable' ? '📑 Interface G50 & Audit' :
                         '👑 Interface DG & Tous Droits'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-[11px] text-slate-300 flex items-start gap-2.5">
              <Building2 size={16} className="text-[#e4fc65] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Conformité DGI & Algérie Télécom :</strong> Session chiffrée SSL/TLS 256 bits avec traçabilité séquentielle des ouvertures de caisse et signatures fiscales.
              </div>
            </div>
          </div>

          {/* Right Column: Modern Login Form */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-950">
                    Connexion Utilisateur
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Entrez vos identifiants pour ouvrir votre session de travail
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-[#e4fc65] flex items-center justify-center font-bold">
                  <KeyRound size={20} />
                </div>
              </div>

              {/* Error Message Box */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2.5 text-xs font-semibold"
                  >
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
                
                {/* Username Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nom d'utilisateur ou Email
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-username-input"
                      type="text"
                      autoFocus
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ex: gerant, caissier, magasinier, comptable"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!username) {
                          setUsername('gerant');
                          setPassword('gerant2026');
                        } else {
                          const acc = INITIAL_USER_ACCOUNTS.find(u => u.username === username);
                          if (acc) setPassword(acc.password);
                        }
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Aide mot de passe ?
                    </button>
                  </div>

                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember & Notice */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
                    <input
                      type="checkbox"
                      checked={rememberTerminal}
                      onChange={(e) => setRememberTerminal(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                    />
                    <span>Mémoriser ma session sur ce terminal</span>
                  </label>

                  <span className="text-[11px] text-slate-400 font-mono">Wilaya 16 (Alger)</span>
                </div>

                {/* Submit Action Button */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-slate-950 hover:bg-slate-800 text-[#e4fc65] font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-slate-950/20 active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin text-[#e4fc65]" />
                      <span>Vérification des habilitations...</span>
                    </>
                  ) : (
                    <>
                      <span>Ouvrir la Session Professionnelle</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Credential Reference Table */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <KeyRound size={13} className="text-slate-400" />
                  <span>Répertoire des Identifiants Système Démo :</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div 
                    onClick={() => handleSelectDemoAccount(INITIAL_USER_ACCOUNTS[0])}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                  >
                    <div className="text-[10px] font-bold text-slate-800">👑 Gérant</div>
                    <div className="text-[10px] font-mono text-slate-500">gerant / gerant2026</div>
                  </div>

                  <div 
                    onClick={() => handleSelectDemoAccount(INITIAL_USER_ACCOUNTS[1])}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                  >
                    <div className="text-[10px] font-bold text-amber-700">🛒 Caissier</div>
                    <div className="text-[10px] font-mono text-slate-500">caissier / caisse2026</div>
                  </div>

                  <div 
                    onClick={() => handleSelectDemoAccount(INITIAL_USER_ACCOUNTS[2])}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                  >
                    <div className="text-[10px] font-bold text-sky-700">📦 Magasinier</div>
                    <div className="text-[10px] font-mono text-slate-500">magasinier / stock2026</div>
                  </div>

                  <div 
                    onClick={() => handleSelectDemoAccount(INITIAL_USER_ACCOUNTS[3])}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
                  >
                    <div className="text-[10px] font-bold text-emerald-700">📑 Comptable</div>
                    <div className="text-[10px] font-mono text-slate-500">comptable / compta2026</div>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </main>

      {/* Footer Legal & Security */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-6 border-t border-white/5">
        <div>
          © 2026 SARL Atlas Distribution Algérie • Système Intégré de Gestion & Encaissement
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Serveur Cloud Opérationnel (DZA-01)
          </span>
          <span className="text-slate-500">|</span>
          <span>Articles 11/12 Code de Commerce</span>
          <span className="text-slate-500">|</span>
          <span>Déclaration Fiscale G50</span>
        </div>
      </footer>
    </div>
  );
};
