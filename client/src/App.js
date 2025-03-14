import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AdminProductKeysPage from './pages/AdminProductKeysPage';
import AdminProductFormPage from './pages/AdminProductFormPage';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CurrencyProvider>
          <Router>
            <div className="app-container">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={
                    <PrivateRoute>
                      <CheckoutPage />
                    </PrivateRoute>
                  } />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  } />
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminPage />
                    </AdminRoute>
                  } />
                  <Route path="/admin/products/new" element={
                    <AdminRoute>
                      <AdminProductFormPage />
                    </AdminRoute>
                  } />
                  <Route path="/admin/products/:id/edit" element={
                    <AdminRoute>
                      <AdminProductFormPage />
                    </AdminRoute>
                  } />
                  <Route path="/admin/products/:id/keys" element={
                    <AdminRoute>
                      <AdminProductKeysPage />
                    </AdminRoute>
                  } />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CurrencyProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App; 