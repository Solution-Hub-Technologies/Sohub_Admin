import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { OrdersModule } from './components/modules/OrdersModule';
import { ConfiguratorModule } from './components/modules/ConfiguratorModule';
import { UserManagementModule } from './components/modules/UserManagementModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { LoginModule } from './components/modules/LoginModule';

const MainContent: React.FC = () => {
  const { activeTab, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return (
      <>
        <LoginModule />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 select-none">
      {/* Streamlined Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'orders' && <OrdersModule />}
            {activeTab === 'configurator' && <ConfiguratorModule />}
            {activeTab === 'users' && <UserManagementModule />}
            {activeTab === 'settings' && <SettingsModule />}
          </div>
        </main>
      </div>

      {/* Global Toast Feedback */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
