
import React, { useState, useEffect } from 'react';
import { User } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import UsersPage from './pages/UsersPage';
import Layout from './components/Layout';

enum Page {
  Dashboard = 'dashboard',
  Products = 'products',
  Sales = 'sales',
  Users = 'users'
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);

  useEffect(() => {
    const savedUser = localStorage.getItem('grocery_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('grocery_current_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('grocery_current_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard user={user} />;
      case Page.Products:
        return <ProductsPage user={user} />;
      case Page.Sales:
        return <SalesPage user={user} />;
      case Page.Users:
        return <UsersPage user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <Layout 
      user={user}
      onLogout={handleLogout} 
      onNavigate={(p) => setCurrentPage(p as Page)} 
      currentPage={currentPage}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
