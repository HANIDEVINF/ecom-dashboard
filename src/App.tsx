import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { 
  AppLanguage, 
  BentoDashboardData, 
  BusinessSettings, 
  ClientProfile, 
  DashboardTab, 
  ExpenseItem,
  FinancialData, 
  InboxAlertItem, 
  InventoryItem, 
  Invoice,
  LastNoteItem, 
  NavigationPage, 
  ScheduleEvent, 
  Worker,
  UserSession 
} from './types';
import { 
  INITIAL_BUSINESS_SETTINGS, 
  INITIAL_BENTO_DATA_ALGERIA, 
  INITIAL_CLIENTS, 
  INITIAL_EXPENSES,
  INITIAL_FINANCIALS_ALGERIA, 
  INITIAL_INVENTORY, 
  INITIAL_INVOICES,
  INITIAL_WORKERS, 
  INITIAL_SCHEDULES_ALGERIA, 
  INITIAL_INBOX_ALGERIA 
} from './data/algerianBusinessData';
import { getStoredData, setStoredData, playAlarmChime } from './services/apiService';
import { SAMPLE_USERS, USER_ROLES_CONFIG, isPageAllowed } from './services/rbacService';
import { AuthService } from './services/authService';
import { LoginView } from './components/LoginView';
import { UserManagementModal } from './components/UserManagementModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { AccessDeniedView } from './components/AccessDeniedView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BentoDashboard } from './components/BentoDashboard';
import { WorkersView } from './components/WorkersView';
import { InventoryView } from './components/InventoryView';
import { ClientsView } from './components/ClientsView';
import { FinancialDashboard } from './components/FinancialDashboard';
import { SettingsView } from './components/SettingsView';
import { PosView } from './components/PosView';
import { InvoicesView } from './components/InvoicesView';
import { ExpensesView } from './components/ExpensesView';
import { FiscalLedgerView } from './components/FiscalLedgerView';
import { CarrierTrackingView } from './components/CarrierTrackingView';
import { CloudDatabaseView } from './components/CloudDatabaseView';
import { AccountingExportModal } from './components/AccountingExportModal';
import { BottomNav } from './components/BottomNav';
import { InspectModal } from './components/InspectModal';
import { ElementInspectorOverlay } from './components/ElementInspectorOverlay';
import { AddModal, AddModalType } from './components/AddModal';

export const App: React.FC = () => {
  // Localization & Language State
  const [language, setLanguage] = useState<AppLanguage>(() => {
    return (localStorage.getItem('algeria_biz_lang') as AppLanguage) || 'fr';
  });

  // Active User Authentication Session
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    return AuthService.getActiveSession();
  });

  // Current Navigation Page
  const [currentPage, setCurrentPage] = useState<NavigationPage>(() => {
    const session = AuthService.getActiveSession();
    return session ? AuthService.getDefaultLandingPage(session.role) : 'overview';
  });

  // User Management & Password Modals
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleSelectUser = (user: UserSession) => {
    setCurrentUser(user);
    AuthService.saveSession(user);
    // If switched to a role that does not have access to current page, redirect to its landing page
    if (!isPageAllowed(currentPage, user.role)) {
      setCurrentPage(AuthService.getDefaultLandingPage(user.role));
    }
  };

  const handleLoginSuccess = (session: UserSession) => {
    setCurrentUser(session);
    setCurrentPage(AuthService.getDefaultLandingPage(session.role));
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  // Business Data States (with persistent local storage fallback)
  const [workers, setWorkers] = useState<Worker[]>(() => {
    return getStoredData('workers', INITIAL_WORKERS);
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    return getStoredData('inventory', INITIAL_INVENTORY);
  });

  const [clients, setClients] = useState<ClientProfile[]>(() => {
    return getStoredData('clients', INITIAL_CLIENTS);
  });

  const [financials, setFinancials] = useState<FinancialData>(() => {
    return getStoredData('financials', INITIAL_FINANCIALS_ALGERIA);
  });

  const [bentoData, setBentoData] = useState<BentoDashboardData>(() => {
    return getStoredData('bento_data', INITIAL_BENTO_DATA_ALGERIA);
  });

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    return getStoredData('settings', INITIAL_BUSINESS_SETTINGS);
  });

  const [schedules, setSchedules] = useState<ScheduleEvent[]>(() => {
    return getStoredData('schedules', INITIAL_SCHEDULES_ALGERIA);
  });

  const [inbox, setInbox] = useState<InboxAlertItem[]>(() => {
    return getStoredData('inbox', INITIAL_INBOX_ALGERIA);
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    return getStoredData('invoices', INITIAL_INVOICES);
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    return getStoredData('expenses', INITIAL_EXPENSES);
  });

  // UI / Inspector Controls
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isAccountingModalOpen, setIsAccountingModalOpen] = useState(false);
  const [isHoverInspectEnabled, setIsHoverInspectEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Item Modal
  const [addModal, setAddModal] = useState<{
    isOpen: boolean;
    type: AddModalType;
  }>({
    isOpen: false,
    type: 'worker'
  });

  // Synchronize state changes to localStorage
  useEffect(() => {
    setStoredData('workers', workers);
  }, [workers]);

  useEffect(() => {
    setStoredData('inventory', inventory);
  }, [inventory]);

  useEffect(() => {
    setStoredData('clients', clients);
  }, [clients]);

  useEffect(() => {
    setStoredData('financials', financials);
  }, [financials]);

  useEffect(() => {
    setStoredData('bento_data', bentoData);
  }, [bentoData]);

  useEffect(() => {
    setStoredData('settings', settings);
  }, [settings]);

  useEffect(() => {
    setStoredData('invoices', invoices);
  }, [invoices]);

  useEffect(() => {
    setStoredData('expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('algeria_biz_lang', language);
    // Adjust HTML direction for Arabic
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Global Keyboard Shortcuts (Ctrl+I for MongoDB Inspector)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsInspectorOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute live active alarms
  const activeStockAlarms = inventory.filter(item => item.stockQty <= item.minStockAlert);
  const activeWorkersCount = workers.filter(w => w.status === 'working').length;
  const unreadAlertsCount = inbox.filter(m => m.unread).length;

  // --- WORKER HANDLERS ---
  const handleToggleClock = (workerId: string) => {
    setWorkers(prev => prev.map(w => {
      if (w.id === workerId) {
        if (w.status === 'working') {
          // Clock out: add 8 hours to monthly work
          return {
            ...w,
            status: 'off_shift',
            clockInTime: undefined,
            hoursWorkedThisMonth: w.hoursWorkedThisMonth + 8
          };
        } else {
          // Clock in now
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...w,
            status: 'working',
            clockInTime: timeStr,
            shiftStartedAt: Date.now()
          };
        }
      }
      return w;
    }));
  };

  const handlePayWorker = (workerId: string) => {
    setWorkers(prev => prev.map(w => {
      if (w.id === workerId) {
        return {
          ...w,
          paymentStatus: 'paid' as const
        };
      }
      return w;
    }));
  };

  // --- INVENTORY HANDLERS ---
  const handleUpdateStock = (id: string, delta: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.stockQty + delta);
        const willAlarm = newStock <= item.minStockAlert;
        if (willAlarm && !item.alarmActive && settings.alarmSoundEnabled) {
          playAlarmChime();
        }
        return {
          ...item,
          stockQty: newStock,
          alarmActive: willAlarm
        };
      }
      return item;
    }));
  };

  const handleSetAlarmThreshold = (id: string, newThreshold: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const willAlarm = item.stockQty <= newThreshold;
        return {
          ...item,
          minStockAlert: newThreshold,
          alarmActive: willAlarm
        };
      }
      return item;
    }));
  };

  // --- INBOX / NOTIFICATIONS ---
  const handleToggleInboxRead = (id: string) => {
    setInbox(prev =>
      prev.map(item =>
        item.id === id ? { ...item, unread: !item.unread } : item
      )
    );
  };

  // --- INVOICES & POS HANDLERS ---
  const handleCompleteSale = (newInvoice: Invoice, updatedInventory: InventoryItem[]) => {
    setInvoices(prev => [newInvoice, ...prev]);
    setInventory(updatedInventory);
    setFinancials(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        cash_in_bank_dzd: prev.metrics.cash_in_bank_dzd + newInvoice.totalTTC,
        monthly_revenue: {
          ...prev.metrics.monthly_revenue,
          amountDZD: prev.metrics.monthly_revenue.amountDZD + newInvoice.totalTTC,
          formattedDZD: `${(prev.metrics.monthly_revenue.amountDZD + newInvoice.totalTTC).toLocaleString()} DA`
        }
      },
      events: [
        {
          id: `ev-${Date.now()}`,
          date_badge: 'Auj.',
          title: `Vente ${newInvoice.number}`,
          desc: `Client: ${newInvoice.clientName} - Règlement: ${newInvoice.paymentMethod.toUpperCase()}`,
          status: 'Validé',
          badge: 'bg-emerald-100 text-emerald-800',
          amountDZD: newInvoice.totalTTC,
          type: 'invoice'
        },
        ...prev.events
      ]
    }));
    setInbox(prev => [
      {
        id: `inb-${Date.now()}`,
        type: 'deposit',
        title: `Vente enregistrée : ${newInvoice.number}`,
        desc: `Paiement reçu : ${newInvoice.totalTTC.toLocaleString()} DA (${newInvoice.paymentMethod}).`,
        time: 'À l\'instant',
        unread: true
      },
      ...prev
    ]);
  };

  const handleUpdateInvoiceStatus = (id: string, newStatus: 'payee' | 'en_attente' | 'annulee' | 'avoir_applique') => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  // --- EXPENSES HANDLERS ---
  const handleAddExpense = (expense: ExpenseItem) => {
    setExpenses(prev => [expense, ...prev]);
    setFinancials(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        cash_in_bank_dzd: Math.max(0, prev.metrics.cash_in_bank_dzd - expense.amountDZD)
      },
      events: [
        {
          id: `ev-${Date.now()}`,
          date_badge: 'Auj.',
          title: expense.title,
          desc: `Bénéficiaire: ${expense.paidTo || 'Fournisseur'} (${expense.category})`,
          status: 'Payé',
          badge: 'bg-rose-100 text-rose-800',
          amountDZD: expense.amountDZD,
          type: 'supplier'
        },
        ...prev.events
      ]
    }));
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // --- RESET DATA ---
  const handleResetData = () => {
    setWorkers(INITIAL_WORKERS);
    setInventory(INITIAL_INVENTORY);
    setClients(INITIAL_CLIENTS);
    setInvoices(INITIAL_INVOICES);
    setExpenses(INITIAL_EXPENSES);
    setFinancials(INITIAL_FINANCIALS_ALGERIA);
    setBentoData(INITIAL_BENTO_DATA_ALGERIA);
    setSettings(INITIAL_BUSINESS_SETTINGS);
    setSchedules(INITIAL_SCHEDULES_ALGERIA);
    setInbox(INITIAL_INBOX_ALGERIA);
  };

  // Map NavigationPage to legacy bottom bar tabs for seamless compatibility
  const getLegacyTab = (): DashboardTab => {
    if (currentPage === 'overview') return 'Dashboard';
    if (currentPage === 'financials') return 'Dashboard 2';
    return 'Dashboard 1';
  };

  const handleBottomTabSelect = (tab: DashboardTab) => {
    if (tab === 'Dashboard') setCurrentPage('overview');
    else if (tab === 'Dashboard 2') setCurrentPage('financials');
    else setCurrentPage('workers');
  };

  // If no active user session, render the secure Algerian Business Login Portal
  if (!currentUser) {
    return (
      <LoginView
        language={language}
        onLanguageChange={setLanguage}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div 
      id="app-root-layout"
      className="min-h-screen bg-[#f3f4f7] flex relative font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 antialiased selection:bg-slate-900 selection:text-white"
    >
      {/* 1. Dark Floating Pill Sidebar with Full Algerian Business Views */}
      <Sidebar
        activePage={currentPage}
        onSelectPage={setCurrentPage}
        onToggleInspector={() => setIsInspectorOpen(prev => !prev)}
        isInspectorOpen={isInspectorOpen}
        activeWorkersCount={activeWorkersCount}
        activeAlarmsCount={activeStockAlarms.length}
        pendingInvoicesCount={invoices.filter(i => i.status === 'en_attente').length}
        language={language}
        currentUser={currentUser}
      />

      {/* 2. Primary Main Content Container */}
      <main 
        id="main-content-region"
        className="flex-1 flex flex-col p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto"
      >
        {/* Header Bar with Multilingual Selector & Stock Alarm Indicator */}
        <Header
          settings={settings}
          language={language}
          onLanguageChange={setLanguage}
          onQuickAdd={(type: 'worker' | 'product' | 'client' | 'task') => setAddModal({ isOpen: true, type })}
          onToggleInspector={() => setIsInspectorOpen(prev => !prev)}
          isInspectorOpen={isInspectorOpen}
          activeAlarmsCount={activeStockAlarms.length}
          onViewAlarmsClick={() => setCurrentPage('inventory')}
          unreadAlertsCount={unreadAlertsCount}
          onNotificationsClick={() => {
            setCurrentPage('financials');
            const el = document.getElementById('fin-section-inbox');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentUser={currentUser}
          onSelectUser={handleSelectUser}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
          onLogout={handleLogout}
        />

        {/* Dynamic Page Views with RBAC Access Protection */}
        <AnimatePresence mode="wait">
          {!isPageAllowed(currentPage, currentUser.role) && (
            <AccessDeniedView
              key="access-denied"
              pageName={currentPage}
              currentUser={currentUser}
              onNavigateHome={() => setCurrentPage(AuthService.getDefaultLandingPage(currentUser.role))}
              onOpenSwitchUser={handleLogout}
            />
          )}

          {/* A. Overview Bento Dashboard */}
          {isPageAllowed(currentPage, currentUser.role) && currentPage === 'overview' && (
            <BentoDashboard
              key="dashboard-overview"
              data={bentoData}
              language={language}
              onOpenAddWidget={() => setAddModal({ isOpen: true, type: 'task' })}
              onSelectNote={() => setIsInspectorOpen(true)}
              onNavigate={setCurrentPage}
              activeWorkersCount={activeWorkersCount}
              activeAlarmsCount={activeStockAlarms.length}
            />
          )}

          {/* B. POS & Sales Register View */}
          {currentPage === 'pos' && (
            <PosView
              key="view-pos"
              inventory={inventory}
              clients={clients}
              settings={settings}
              language={language}
              onCompleteSale={handleCompleteSale}
              onNavigateToInventory={() => setCurrentPage('inventory')}
            />
          )}

          {/* C. Invoices & Delivery Slips View */}
          {currentPage === 'invoices' && (
            <InvoicesView
              key="view-invoices"
              invoices={invoices}
              inventory={inventory}
              clients={clients}
              settings={settings}
              language={language}
              currentUser={currentUser}
              onAddInvoice={(inv) => setInvoices(prev => [inv, ...prev])}
              onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
              onDeleteInvoice={handleDeleteInvoice}
              onOpenAccountingExport={() => setIsAccountingModalOpen(true)}
            />
          )}

          {/* D. Expenses & Operational Charges View */}
          {currentPage === 'expenses' && (
            <ExpensesView
              key="view-expenses"
              expenses={expenses}
              settings={settings}
              language={language}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {/* E. Workers Management View */}
          {currentPage === 'workers' && (
            <WorkersView
              key="view-workers"
              workers={workers}
              language={language}
              onClockToggle={handleToggleClock}
              onPaySalary={handlePayWorker}
              onAddWorkerClick={() => setAddModal({ isOpen: true, type: 'worker' })}
            />
          )}

          {/* F. Inventory & Stock Alarms View */}
          {currentPage === 'inventory' && (
            <InventoryView
              key="view-inventory"
              inventory={inventory}
              language={language}
              soundEnabled={settings.alarmSoundEnabled}
              onToggleSound={() => setSettings(s => ({ ...s, alarmSoundEnabled: !s.alarmSoundEnabled }))}
              onUpdateAlarmThreshold={handleSetAlarmThreshold}
              onRestockItem={handleUpdateStock}
              onAddProductClick={() => setAddModal({ isOpen: true, type: 'product' })}
            />
          )}

          {/* G. Clients & Quotations Presentation View */}
          {currentPage === 'clients' && (
            <ClientsView
              key="view-clients"
              clients={clients}
              inventory={inventory}
              settings={settings}
              language={language}
              onAddClientClick={() => setAddModal({ isOpen: true, type: 'client' })}
            />
          )}

          {/* H. Financials, Cash Flow & Taxes View */}
          {currentPage === 'financials' && (
            <FinancialDashboard
              key="view-financials"
              financials={financials}
              inbox={inbox}
              language={language}
              onToggleInboxRead={handleToggleInboxRead}
              onAddEventClick={() => setAddModal({ isOpen: true, type: 'task' })}
            />
          )}

          {/* I. Settings View */}
          {currentPage === 'settings' && (
            <SettingsView
              key="view-settings"
              settings={settings}
              language={language}
              onSaveSettings={setSettings}
              onLanguageChange={setLanguage}
              onResetData={handleResetData}
            />
          )}

          {/* J. Fiscal Immutability & Audit Trail (G50) */}
          {currentPage === 'fiscal_ledger' && (
            <FiscalLedgerView
              key="view-fiscal-ledger"
              invoices={invoices}
              language={language}
              onNavigateToInvoice={(num) => {
                setSearchQuery(num);
                setCurrentPage('invoices');
              }}
            />
          )}

          {/* K. Carrier Tracking & Algerian Logistics (Yalidine, ZR, Procolis, Maystro) */}
          {currentPage === 'carrier_tracking' && (
            <CarrierTrackingView
              key="view-carrier-tracking"
              invoices={invoices}
              language={language}
            />
          )}

          {/* L. Multi-Tenant Cloud Database & Daily Encrypted Backups */}
          {currentPage === 'cloud_backups' && (
            <CloudDatabaseView
              key="view-cloud-backups"
              invoices={invoices}
              inventory={inventory}
              workers={workers}
              language={language}
            />
          )}
        </AnimatePresence>

        {/* 3. Mobile Floating Bottom Pill Switcher */}
        <BottomNav
          activeTab={getLegacyTab()}
          onSelectTab={handleBottomTabSelect}
          currentUser={currentUser}
        />

        {/* 4. Live MongoDB & Flask Backend Inspector */}
        <InspectModal
          isOpen={isInspectorOpen}
          onOpen={() => setIsInspectorOpen(true)}
          onClose={() => setIsInspectorOpen(false)}
          workers={workers}
          inventory={inventory}
          clients={clients}
          invoices={invoices}
          expenses={expenses}
          bentoData={bentoData}
          financials={financials}
          settings={settings}
          schedules={schedules}
          inbox={inbox}
          isHoverInspectEnabled={isHoverInspectEnabled}
          onToggleHoverInspect={() => setIsHoverInspectEnabled(prev => !prev)}
          onResetData={handleResetData}
        />

        {/* 5. Algerian Accounting & Fiscal G50 Export Center */}
        <AccountingExportModal
          isOpen={isAccountingModalOpen}
          onClose={() => setIsAccountingModalOpen(false)}
          invoices={invoices}
          inventory={inventory}
          workers={workers}
          expenses={expenses}
          settings={settings}
          language={language}
        />

        {/* 6. Element Inspector Overlay */}
        <ElementInspectorOverlay
          isEnabled={isHoverInspectEnabled}
          onSelectElement={({ id }) => {
            setIsInspectorOpen(true);
            const domNode = document.getElementById(id);
            if (domNode) {
              domNode.classList.add('ring-4', 'ring-[#e4fc65]');
              setTimeout(() => {
                domNode.classList.remove('ring-4', 'ring-[#e4fc65]');
              }, 2000);
            }
          }}
        />

        {/* 7. Dynamic Add Item Modal */}
        <AddModal
          isOpen={addModal.isOpen}
          type={addModal.type}
          language={language}
          onClose={() => setAddModal(prev => ({ ...prev, isOpen: false }))}
          onAddWorker={(w) => setWorkers(prev => [w, ...prev])}
          onAddProduct={(p) => setInventory(prev => [p, ...prev])}
          onAddClient={(c) => setClients(prev => [c, ...prev])}
          onAddTask={(t) => {
            setBentoData(prev => ({
              ...prev,
              last_notes: [t, ...prev.last_notes],
              tasks_completed: prev.tasks_completed + 1
            }));
          }}
        />

        {/* 8. User Management Modal (Gérant / Super-Admin) */}
        {isUserManagementOpen && (
          <UserManagementModal
            currentUser={currentUser}
            language={language}
            onClose={() => setIsUserManagementOpen(false)}
          />
        )}

        {/* 9. Self-Service Change Password Modal */}
        {isChangePasswordOpen && (
          <ChangePasswordModal
            currentUser={currentUser}
            onClose={() => setIsChangePasswordOpen(false)}
          />
        )}
      </main>
    </div>
  );
};

export default App;
