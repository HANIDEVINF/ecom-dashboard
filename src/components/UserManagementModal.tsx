import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Key, 
  Trash2, 
  ShieldCheck, 
  X, 
  Check, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { AppLanguage, UserAccount, UserRole, UserSession } from '../types';
import { AuthService } from '../services/authService';
import { USER_ROLES_CONFIG } from '../services/rbacService';
import { ALGERIA_WILAYAS } from '../data/algerianBusinessData';

interface UserManagementModalProps {
  currentUser: UserSession;
  language: AppLanguage;
  onClose: () => void;
  onUserListChanged?: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  currentUser,
  language,
  onClose,
  onUserListChanged
}) => {
  const [users, setUsers] = useState<UserAccount[]>(() => AuthService.getUsers());
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  // Password Reset State
  const [selectedUserForReset, setSelectedUserForReset] = useState<UserAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('caissier');
  const [newRoleTitle, setNewRoleTitle] = useState('Caissier Comptoir');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+213 ');
  const [newWilaya, setNewWilaya] = useState('16 - Alger');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handleRoleChange = (role: UserRole) => {
    setNewRole(role);
    switch (role) {
      case 'caissier':
        setNewRoleTitle('Caissier Terminal Vente');
        break;
      case 'magasinier':
        setNewRoleTitle('Agent de Stock & Préparation');
        break;
      case 'comptable':
        setNewRoleTitle('Comptable Adjoint');
        break;
      case 'gerant':
        setNewRoleTitle('Administrateur Délégué');
        break;
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!newUsername.trim() || !newPassword.trim() || !newName.trim()) {
      setFormError('Veuillez remplir au minimum l\'identifiant, le mot de passe et le nom complet.');
      return;
    }

    const cfg = USER_ROLES_CONFIG[newRole];

    const res = AuthService.createUser({
      username: newUsername.trim(),
      password: newPassword.trim(),
      name: newName.trim(),
      role: newRole,
      roleTitle: newRoleTitle.trim(),
      email: newEmail.trim() || `${newUsername.trim().toLowerCase()}@atlas-algerie.dz`,
      phone: newPhone.trim(),
      wilaya: newWilaya,
      avatarColor: newRole === 'caissier' ? 'bg-amber-500 text-white' :
                   newRole === 'magasinier' ? 'bg-sky-500 text-white' :
                   newRole === 'comptable' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-[#e4fc65]',
      avatarIcon: cfg.avatarIcon
    });

    if (res.success && res.user) {
      const refreshed = AuthService.getUsers();
      setUsers(refreshed);
      setFormSuccess(`Utilisateur "${res.user.name}" (${res.user.username}) créé avec succès !`);
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      if (onUserListChanged) onUserListChanged();
      setTimeout(() => {
        setActiveTab('list');
        setFormSuccess(null);
      }, 1200);
    } else {
      setFormError(res.error || 'Erreur lors de la création de l\'utilisateur.');
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset) return;

    const res = AuthService.adminResetPassword(selectedUserForReset.id, newPasswordInput);
    if (res.success) {
      setResetSuccess(true);
      setUsers(AuthService.getUsers());
      if (onUserListChanged) onUserListChanged();
      setTimeout(() => {
        setSelectedUserForReset(null);
        setNewPasswordInput('');
        setResetSuccess(false);
      }, 1000);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      const res = AuthService.deleteUser(userId);
      if (res.success) {
        setUsers(AuthService.getUsers());
        if (onUserListChanged) onUserListChanged();
      } else {
        alert(res.error || 'Impossible de supprimer cet utilisateur.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#e4fc65] text-slate-950 flex items-center justify-center font-bold">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Gestion des Utilisateurs & Rôles (RBAC)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e4fc65]/20 text-[#e4fc65] font-bold">
                  Espace Gérant
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Administration des identifiants, mots de passe et droits d'accès des collaborateurs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-4 pb-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'list'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Users size={14} />
            <span>Liste des Comptes ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <UserPlus size={14} />
            <span>Créer un Nouvel Utilisateur</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: USER LIST */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {users.map((acc) => {
                  const cfg = USER_ROLES_CONFIG[acc.role];
                  const isCurrent = currentUser.id === acc.id;

                  return (
                    <div
                      key={acc.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs space-y-3 relative group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${acc.avatarColor}`}>
                            {acc.avatarIcon}
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                              <span>{acc.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                                  Vous
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {acc.roleTitle}
                            </div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${cfg.badgeColor}`}>
                          {acc.role}
                        </span>
                      </div>

                      {/* Credentials & Details Box */}
                      <div className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Identifiant :</span>
                          <span className="font-mono font-bold text-slate-900">{acc.username}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Mot de passe :</span>
                          <span className="font-mono font-bold text-indigo-700">•••••••• ({acc.password})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Wilaya d'affectation :</span>
                          <span className="text-slate-700">{acc.wilaya}</span>
                        </div>
                        {acc.lastLogin && (
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Dernière connexion :</span>
                            <span>{acc.lastLogin}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForReset(acc);
                            setNewPasswordInput('');
                            setResetSuccess(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer text-[11px]"
                        >
                          <Key size={12} className="text-indigo-600" />
                          <span>Changer mot de passe</span>
                        </button>

                        {acc.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(acc.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                            title="Supprimer ce compte"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Security Banner */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Séparation stricte des tâches (Segregation of Duties) :</strong> Les caissiers et magasiniers n'ont aucun accès aux marges d'achat et aux états financiers, conformément aux normes comptables et au Code de Commerce Algérien.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE USER FORM */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateUser} className="space-y-4">
              
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={15} className="text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <Check size={15} className="text-emerald-600 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom & Prénom Collaborateur *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ex: Redouane Khelifi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rôle & Profil d'Accès *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="caissier">Caissier (Terminal POS & Tickets 80mm)</option>
                    <option value="magasinier">Magasinier (Stock, BL & Expéditions Yalidine)</option>
                    <option value="comptable">Comptable (Fiscalité G50 & Registre Immuable)</option>
                    <option value="gerant">Gérant (Accès Exécutif Complet)</option>
                  </select>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Identifiant de Connexion (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="ex: redouane.k"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mot de Passe Initial *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="ex: atlas2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Role Title Custom */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Intitulé du Poste
                  </label>
                  <input
                    type="text"
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    placeholder="ex: Caissier Caisse 02"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Wilaya Assignment */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Wilaya d'Affectation
                  </label>
                  <select
                    value={newWilaya}
                    onChange={(e) => setNewWilaya(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    {ALGERIA_WILAYAS.map(w => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Téléphone Collaborateur
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+213 550 00 00 00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Adresse Email Professionnelle
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="collaborateur@atlas-algerie.dz"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-950 text-[#e4fc65] font-black text-xs hover:bg-slate-800 transition-all cursor-pointer shadow-md flex items-center gap-2"
                >
                  <UserPlus size={15} />
                  <span>Enregistrer le Nouvel Utilisateur</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* MODAL: RESET PASSWORD POPUP */}
        {selectedUserForReset && (
          <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Key size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Changer le Mot de Passe
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Pour {selectedUserForReset.name} ({selectedUserForReset.username})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUserForReset(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {resetSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold text-center flex flex-col items-center gap-1.5">
                  <Check size={20} className="text-emerald-600" />
                  <span>Mot de passe mis à jour avec succès !</span>
                </div>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nouveau Mot de Passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        autoFocus
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Nouveau mot de passe"
                        className="w-full px-3 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForReset(null)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs"
                    >
                      Appliquer
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}

      </motion.div>
    </div>
  );
};
