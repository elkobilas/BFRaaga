import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { SellerDashboard } from './pages/SellerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SearchPage } from './pages/SearchPage';
import { SellerPage } from './pages/SellerPage';
import { CategoryPage } from './pages/CategoryPage';
import { GuestCheckoutPage } from './pages/GuestCheckoutPage';
import { AboutPage } from './pages/AboutPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { HowToBuyPage } from './pages/HowToBuyPage';
import { HowToSellPage } from './pages/HowToSellPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="product/:slug" element={<ProductPage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="seller/:slug" element={<SellerPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="guest-checkout" element={<GuestCheckoutPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="faq" element={<FAQPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="how-to-buy" element={<HowToBuyPage />} />
              <Route path="how-to-sell" element={<HowToSellPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              <Route path="seller/*" element={<ProtectedRoute sellerOnly><SellerDashboard /></ProtectedRoute>} />
              <Route path="admin/*" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
