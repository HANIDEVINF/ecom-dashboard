import { NavigationPage, UserAccount, UserRole, UserSession } from '../types';

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-1',
    username: 'gerant',
    password: 'gerant2026',
    name: 'Yacine Mansouri',
    role: 'gerant',
    roleTitle: 'Directeur Général & Fondateur',
    email: 'direction@atlas-algerie.dz',
    phone: '+213 550 12 34 56',
    wilaya: '16 - Alger',
    avatarColor: 'bg-slate-900 text-[#e4fc65]',
    avatarIcon: '👑',
    lastLogin: '2026-09-22 08:30',
    createdAt: '2026-01-10',
    isCustom: false
  },
  {
    id: 'usr-2',
    username: 'caissier',
    password: 'caisse2026',
    name: 'Karim Belkacem',
    role: 'caissier',
    roleTitle: 'Caissier Principal (Caisse Centrale)',
    email: 'caisse01@atlas-algerie.dz',
    phone: '+213 661 98 76 54',
    wilaya: '16 - Alger',
    avatarColor: 'bg-amber-500 text-white',
    avatarIcon: '🛒',
    lastLogin: '2026-09-22 08:45',
    createdAt: '2026-02-01',
    isCustom: false
  },
  {
    id: 'usr-3',
    username: 'magasinier',
    password: 'stock2026',
    name: 'Sofiane Haddad',
    role: 'magasinier',
    roleTitle: 'Chef Magasinier & Responsable Expéditions',
    email: 'stock@atlas-algerie.dz',
    phone: '+213 770 45 67 89',
    wilaya: '16 - Alger',
    avatarColor: 'bg-sky-500 text-white',
    avatarIcon: '📦',
    lastLogin: '2026-09-22 08:15',
    createdAt: '2026-02-15',
    isCustom: false
  },
  {
    id: 'usr-4',
    username: 'comptable',
    password: 'compta2026',
    name: 'Amina Bouzid',
    role: 'comptable',
    roleTitle: 'Comptable Agréée & Fiscaliste G50',
    email: 'compta@atlas-algerie.dz',
    phone: '+213 560 33 22 11',
    wilaya: '31 - Oran',
    avatarColor: 'bg-emerald-600 text-white',
    avatarIcon: '📑',
    lastLogin: '2026-09-22 07:50',
    createdAt: '2026-01-15',
    isCustom: false
  }
];

const STORAGE_USERS_KEY = 'algeria_biz_users_v2';
const STORAGE_SESSION_KEY = 'algeria_biz_active_session_v2';

export class AuthService {
  /**
   * Get all registered accounts (combining initial seed with saved localStorage)
   */
  static getUsers(): UserAccount[] {
    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load users from storage:', e);
    }
    return INITIAL_USER_ACCOUNTS;
  }

  /**
   * Save user accounts to persistent local storage
   */
  static saveUsers(users: UserAccount[]): void {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save users to storage:', e);
    }
  }

  /**
   * Authenticate with username and password
   */
  static login(usernameInput: string, passwordInput: string): { 
    success: boolean; 
    session?: UserSession; 
    error?: string;
  } {
    const trimmedUser = usernameInput.trim().toLowerCase();
    const trimmedPass = passwordInput.trim();

    if (!trimmedUser || !trimmedPass) {
      return { 
        success: false, 
        error: 'Veuillez saisir votre identifiant et votre mot de passe.' 
      };
    }

    const users = this.getUsers();
    const account = users.find(u => 
      u.username.toLowerCase() === trimmedUser || 
      u.email.toLowerCase() === trimmedUser
    );

    if (!account) {
      return { 
        success: false, 
        error: `Identifiant "${usernameInput}" introuvable dans le système.` 
      };
    }

    if (account.password !== trimmedPass) {
      return { 
        success: false, 
        error: 'Mot de passe incorrect pour cet utilisateur. Vérifiez la casse.' 
      };
    }

    // Update lastLogin
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    account.lastLogin = now;
    this.saveUsers(users);

    // Create session
    const session: UserSession = {
      id: account.id,
      username: account.username,
      name: account.name,
      role: account.role,
      roleTitle: account.roleTitle,
      email: account.email,
      wilaya: account.wilaya,
      avatarColor: account.avatarColor,
      avatarIcon: account.avatarIcon,
      loginTimestamp: now,
      token: `token_dz_${account.role}_${Date.now()}`
    };

    this.saveSession(session);

    return { success: true, session };
  }

  /**
   * Retrieve active session
   */
  static getActiveSession(): UserSession | null {
    try {
      const stored = localStorage.getItem(STORAGE_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load session:', e);
    }
    return null;
  }

  /**
   * Save session to storage
   */
  static saveSession(session: UserSession | null): void {
    try {
      if (session) {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    } catch (e) {
      console.warn('Failed to save session:', e);
    }
  }

  /**
   * Log out active user
   */
  static logout(): void {
    this.saveSession(null);
  }

  /**
   * Create a new user account (Gérant only)
   */
  static createUser(accountData: Omit<UserAccount, 'id' | 'createdAt'>): { 
    success: boolean; 
    user?: UserAccount; 
    error?: string; 
  } {
    const users = this.getUsers();
    const cleanUsername = accountData.username.trim().toLowerCase();

    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: `L'identifiant "${cleanUsername}" est déjà utilisé.` };
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      isCustom: true,
      ...accountData,
      username: cleanUsername
    };

    const updated = [...users, newUser];
    this.saveUsers(updated);
    return { success: true, user: newUser };
  }

  /**
   * Change user password
   */
  static changePassword(userId: string, oldPass: string, newPass: string): { 
    success: boolean; 
    error?: string; 
  } {
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, error: 'Le nouveau mot de passe doit contenir au moins 4 caractères.' };
    }

    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'Utilisateur introuvable.' };
    }

    if (user.password !== oldPass.trim()) {
      return { success: false, error: 'L\'ancien mot de passe est incorrect.' };
    }

    user.password = newPass.trim();
    this.saveUsers(users);
    return { success: true };
  }

  /**
   * Admin Reset Password (without knowing old password)
   */
  static adminResetPassword(userId: string, newPass: string): { 
    success: boolean; 
    error?: string; 
  } {
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, error: 'Le mot de passe doit comporter au moins 4 caractères.' };
    }

    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'Utilisateur introuvable.' };
    }

    user.password = newPass.trim();
    this.saveUsers(users);
    return { success: true };
  }

  /**
   * Delete custom user
   */
  static deleteUser(userId: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'Utilisateur introuvable.' };

    if (user.username === 'gerant') {
      return { success: false, error: 'Le compte Administrateur principal ne peut être supprimé.' };
    }

    const filtered = users.filter(u => u.id !== userId);
    this.saveUsers(filtered);
    return { success: true };
  }

  /**
   * Get default landing page according to user role
   */
  static getDefaultLandingPage(role: UserRole): NavigationPage {
    switch (role) {
      case 'caissier':
        return 'pos';
      case 'magasinier':
        return 'inventory';
      case 'comptable':
        return 'fiscal_ledger';
      case 'gerant':
      default:
        return 'overview';
    }
  }

  /**
   * Helper to reset to initial seed
   */
  static resetToDefaults(): void {
    localStorage.removeItem(STORAGE_USERS_KEY);
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
}
