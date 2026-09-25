import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  User, 
  ChevronDown, 
  Check, 
  Lock, 
  AlertTriangle, 
  EyeOff, 
  Info,
  ShieldAlert,
  KeyRound,
  Users,
  LogOut,
  Sparkles
} from 'lucide-react';
import { UserAccount, UserRole, UserSession } from '../types';
import { USER_ROLES_CONFIG } from '../services/rbacService';
import { AuthService } from '../services/authService';

interface RbacHeaderBarProps {
  currentUser: UserSession;
  onSelectUser: (user: UserSession) => void;
  onOpenUserManagement?: () => void;
  onOpenChangePassword?: () => void;
  onLogout?: () => void;
}

export const RbacHeaderBar: React.FC<RbacHeaderBarProps> = ({
  currentUser,
  onSelectUser,
  onOpenUserManagement,
  onOpenChangePassword,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentConfig = USER_ROLES_CONFIG[currentUser.role];
  const allUsers = AuthService.getUsers();

  return (
    <div className="relative">
      <button
        id="rbac-role-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer text-left"
      >
        <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-xs">
          {currentUser.avatarIcon || currentConfig.avatarIcon}
        </div>

        <div className="hidden sm:block leading-tight">
          <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <span>{currentUser.name}</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${currentConfig.badgeColor}`}>
              {currentConfig.title.split(' ')[0]}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono font-medium truncate max-w-[140px]">
            @{currentUser.username} • {currentUser.wilaya.split(' - ')[1] || currentUser.wilaya}
          </div>
        </div>

        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Role Switcher & Account Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              className="absolute right-0 mt-2 w-88 bg-white rounded-3xl p-3 shadow-2xl border border-slate-200 z-50 space-y-2.5"
            >
              {/* Header Profile Summary */}
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    {currentUser.avatarIcon || currentConfig.avatarIcon}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">id: @{currentUser.username}</div>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${currentConfig.badgeColor}`}>
                  {currentUser.role}
                </span>
              </div>

              {/* Action Buttons: Password & User Management */}
              <div className="grid grid-cols-2 gap-1.5 px-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (onOpenChangePassword) onOpenChangePassword();
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <KeyRound size={12} className="text-indigo-600" />
                  <span>Mon Mot de passe</span>
                </button>

                {currentUser.role === 'gerant' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      if (onOpenUserManagement) onOpenUserManagement();
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-[#e4fc65] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <Users size={12} />
                    <span>Gérer Utilisateurs</span>
                  </button>
                ) : (
                  <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1">
                    <Lock size={11} />
                    <span>Admin Réservé</span>
                  </div>
                )}
              </div>

              {/* Switch Account Quick List */}
              <div>
                <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className="uppercase tracking-wider">Changer de Compte :</span>
                  <span className="text-[10px] text-slate-400 font-normal">Identifiant / Mot de passe</span>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
                  {allUsers.map((acc) => {
                    const cfg = USER_ROLES_CONFIG[acc.role];
                    const isSelected = currentUser.id === acc.id;

                    return (
                      <button
                        key={acc.id}
                        onClick={() => {
                          const session: UserSession = {
                            id: acc.id,
                            username: acc.username,
                            name: acc.name,
                            role: acc.role,
                            roleTitle: acc.roleTitle,
                            email: acc.email,
                            wilaya: acc.wilaya,
                            avatarColor: acc.avatarColor,
                            avatarIcon: acc.avatarIcon,
                            loginTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                            token: `token_dz_${acc.role}_${Date.now()}`
                          };
                          AuthService.saveSession(session);
                          onSelectUser(session);
                          setIsOpen(false);
                        }}
                        className={`w-full p-2 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                          isSelected 
                            ? 'bg-slate-900 text-white shadow-2xs' 
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">{acc.avatarIcon}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-black truncate">{acc.name}</div>
                            <div className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              @{acc.username} • {acc.password}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${cfg.badgeColor}`}>
                            {acc.role}
                          </span>
                          {isSelected && <Check size={13} className="text-[#e4fc65]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logout Action */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    AuthService.logout();
                    if (onLogout) onLogout();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut size={13} />
                  <span>Verrouiller le terminal / Déconnexion</span>
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
