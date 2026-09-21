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
  ShieldAlert
} from 'lucide-react';
import { UserRole, UserSession } from '../types';
import { SAMPLE_USERS, USER_ROLES_CONFIG } from '../services/rbacService';

interface RbacHeaderBarProps {
  currentUser: UserSession;
  onSelectUser: (user: UserSession) => void;
}

export const RbacHeaderBar: React.FC<RbacHeaderBarProps> = ({
  currentUser,
  onSelectUser
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentConfig = USER_ROLES_CONFIG[currentUser.role];

  return (
    <div className="relative">
      <button
        id="rbac-role-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer text-left"
      >
        <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-xs">
          {currentConfig.avatarIcon}
        </div>

        <div className="hidden sm:block leading-tight">
          <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <span>{currentUser.name}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${currentConfig.badgeColor}`}>
              {currentConfig.title.split(' ')[0]}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
            {currentUser.roleTitle}
          </div>
        </div>

        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Role Switcher Dropdown */}
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
              className="absolute right-0 mt-2 w-84 bg-white rounded-3xl p-3 shadow-2xl border border-slate-200 z-50 space-y-2"
            >
              <div className="px-2 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Changer de Session & Rôle (RBAC)
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-600">
                  Sécurité Commerciale
                </span>
              </div>

              <div className="space-y-1">
                {SAMPLE_USERS.map(user => {
                  const cfg = USER_ROLES_CONFIG[user.role];
                  const isSelected = currentUser.id === user.id;

                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user);
                        setIsOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-2xl text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected 
                          ? 'bg-slate-900 text-white' 
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="text-xl mt-0.5">{cfg.avatarIcon}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-black truncate">
                            {user.name}
                          </div>
                          {isSelected && <Check size={14} className="text-[#e4fc65]" />}
                        </div>

                        <div className={`text-[10px] font-bold ${isSelected ? 'text-[#e4fc65]' : 'text-slate-600'}`}>
                          {cfg.title}
                        </div>

                        <div className={`text-[10px] mt-1 line-clamp-2 leading-tight ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                          {cfg.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Security Guard Notice */}
              <div className="p-2.5 bg-slate-50 rounded-2xl text-[10px] text-slate-600 border border-slate-100 flex items-start gap-2">
                <ShieldAlert size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Protection Déontologique :</strong> En mode <em>Caissier</em> ou <em>Magasinier</em>, les coûts d'achat et salaires du personnel sont cryptographiquement et visuellement masqués.
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
