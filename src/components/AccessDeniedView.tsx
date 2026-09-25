import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  Lock, 
  ArrowLeft, 
  KeyRound,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { NavigationPage, UserSession } from '../types';
import { USER_ROLES_CONFIG } from '../services/rbacService';
import { AuthService } from '../services/authService';

interface AccessDeniedViewProps {
  pageName: NavigationPage;
  currentUser: UserSession;
  onNavigateHome: () => void;
  onOpenSwitchUser: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  pageName,
  currentUser,
  onNavigateHome,
  onOpenSwitchUser
}) => {
  const currentRoleCfg = USER_ROLES_CONFIG[currentUser.role];
  const nativeLandingPage = AuthService.getDefaultLandingPage(currentUser.role);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center space-y-5"
      >
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center shadow-inner">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full inline-block">
            Contrôle d'Habilitation RBAC
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Accès Non Autorisé pour ce Rôle
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            La section <strong>« {pageName.replace('_', ' ').toUpperCase()} »</strong> est restreinte aux profils de direction et comptables autorisés.
          </p>
        </div>

        {/* User Identity Pill */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{currentUser.avatarIcon || '👤'}</span>
            <div>
              <div className="text-xs font-black text-slate-900">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 font-mono">user: {currentUser.username}</div>
            </div>
          </div>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${currentRoleCfg.badgeColor}`}>
            {currentRoleCfg.title}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onNavigateHome}
            className="w-full py-3 px-4 rounded-xl bg-slate-950 text-[#e4fc65] font-black text-xs hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>Retourner à mon Espace ({currentUser.role === 'caissier' ? 'Caisse POS' : currentUser.role === 'magasinier' ? 'Stock & Expéditions' : 'Tableau de bord'})</span>
          </button>

          <button
            onClick={onOpenSwitchUser}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <KeyRound size={14} className="text-indigo-600" />
            <span>Se Connecter avec un Autre Identifiant</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3 flex items-center justify-center gap-1.5">
          <Lock size={11} />
          <span>Protection Déontologique des Données Commerciales Algériennes</span>
        </div>
      </motion.div>
    </div>
  );
};
