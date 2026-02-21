import React, { useState, useEffect } from "react";
import "./App.css";
import Store from "./redux/store";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useGoogleTranslate } from "./hooks/useGoogleTranslate";
import axios from "axios";
import { CurrencyProvider } from "./context/CurrencyContext";
import BanModal from "./components/BanDetection/BanModal";
import BanProtection from "./components/BanDetection/BanProtection";
import SellerBanProtection from "./components/BanDetection/SellerBanProtection";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import BuyerTermsOfServicePage from "./pages/BuyerTermsOfServicePage";
import SellerTermsOfServicePage from "./pages/SellerTermsOfServicePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import ShippingPolicyPage from "./pages/ShippingPolicyPage";
import AboutUsPage from "./pages/AboutUsPage";
import ReviewsPage from "./pages/ReviewsPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import AdminBlogPage from "./pages/AdminBlogPage";
import {
  LoginPage,
  SignupPage,
  ActivationPage,
  HomePage,
  ProductsPage,
  BestSellingPage,
  EventsPage,
  FAQPage,
  CheckoutPage,
  PaymentPage,
  OrderSuccessPage,
  ProductDetailsPage,
  ProfilePage,
  ShopCreatePage,
  SellerActivationPage,
  ShopLoginPage,
  OrderDetailsPage,
  TrackOrderPage,
  UserInbox,
  UserForgotPasswordPage,
  UserResetPasswordPage,
  ContactPage,
} from "./routes/Routes";
import {
  ShopDashboardPage,
  ShopCreateProduct,
  ShopAllProducts,
  ShopCreateEvents,
  ShopAllEvents,
  ShopAllCoupouns,
  ShopPreviewPage,
  ShopAllOrders,
  ShopOrderDetails,
  ShopAllRefunds,
  ShopSettingsPage,
  ShopWithDrawMoneyPage,
  ShopInboxPage,
  ShopEditProductPage,
  ShopForgotPasswordPage,
  ShopResetPasswordPage,
  ShippingManagementPage,
  ProductShippingPage,
  SellerGSTSettingsPage,
  ShopVideoCallsPage,
  DashboardVideoBannersPage,
  DashboardCreateVideoBannerPage,
  DashboardEditVideoBannerPage,
  ShopAllAdvertisements,
  ShopCreateAdvertisement,
  ShopAdvertisementPricing,
  ShopAdvertisementPayment,
  ShopEditAdvertisement,
  ShopRenewAdvertisement,
  HtmlCssEditorPage,
  StoreSettingsPage,
} from "./routes/ShopRoutes";

import {
  AdminDashboardPage,
  AdminDashboardUsers,
  AdminDashboardSellers,
  AdminDashboardPendingSellers,
  AdminDashboardOrders,
  AdminDashboardProducts,
  AdminDashboardEvents,
  AdminDashboardWithdraw,
  AdminDashboardBanner,
  AdminDashboardCategories,
} from "./routes/AdminRoutes";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminOrderDetailsPage from "./pages/AdminOrderDetailsPage";
import AdminDashboardLegalPages from "./pages/AdminDashboardLegalPages";
import AdminReviewsPage from "./pages/AdminReviewsPage";
import AdminSiteSettingsPage from "./pages/AdminSiteSettingsPage";
import AdminDashboardEmailTemplates from "./pages/AdminDashboardEmailTemplates";
import AdminInHouseStoresPage from "./pages/AdminInHouseStoresPage";
import AdminCurrencySettingsPage from "./pages/AdminCurrencySettingsPage";
import AdminFAQPage from "./pages/AdminFAQPage";
import AdminVideoBannersPage from "./pages/AdminVideoBannersPage";
import CreateVideoBannerPage from "./pages/CreateVideoBannerPage";
import PhonePeSuccessPage from "./pages/PhonePeSuccessPage";
import PhonePeFailedPage from "./pages/PhonePeFailedPage";
import PhonePeTestPayment from "./pages/PhonePeTestPayment";
import SubscriptionPlansPage from "./pages/SubscriptionPlansPage";
import CommissionDashboardPage from "./pages/CommissionDashboardPage";
import InventoryAlertsPage from "./pages/InventoryAlertsPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import SubscriptionCancelPage from "./pages/SubscriptionCancelPage";
import AdminSubscriptionsPage from "./pages/AdminSubscriptionsPage";
import AdminPlanManagementPage from "./pages/AdminPlanManagementPage";
import AdminReviewManagementPage from "./pages/AdminReviewManagementPage";
import AdminAdvertisementsPage from "./pages/AdminAdvertisementsPage";
import AdminAdPlanManagementPage from "./pages/AdminAdPlanManagementPage";
import ReviewManagementPage from "./pages/ReviewManagementPage";
import AdminDashboardStaff from "./pages/AdminDashboardStaff";
import AdminDashboardPendingProducts from "./pages/AdminDashboardPendingProducts";
import AdminDistrictManagementPage from "./pages/AdminDistrictManagementPage";
import VendorDeliverySetupPage from "./pages/VendorDeliverySetupPage";
import ShopStoreManagerPage from "./pages/Shop/ShopStoreManagerPage";
import AdminStoreManagerPage from "./pages/AdminStoreManagerPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadSeller, loadUser } from "./redux/actions/user";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";
import SellerProtectedRoute from "./routes/SellerProtectedRoute";
import SellerSubscriptionProtectedRoute from "./routes/SellerSubscriptionProtectedRoute";
import StoreManagerProtectedRoute from "./routes/StoreManagerProtectedRoute";
import { ShopHomePage } from "./ShopRoutes";
import StoreManagerDashboardPage from "./pages/StoreManager/StoreManagerDashboardPage";
import SMProductsPage from "./pages/StoreManager/SMProductsPage";
import SMCreateProductPage from "./pages/StoreManager/SMCreateProductPage";
import SMEditProductPage from "./pages/StoreManager/SMEditProductPage";
import SMOrdersPage from "./pages/StoreManager/SMOrdersPage";
import SMOrderDetailsPage from "./pages/StoreManager/SMOrderDetailsPage";
import SMInventoryPage from "./pages/StoreManager/SMInventoryPage";
import SMAdPlanManagementPage from "./pages/StoreManager/SMAdPlanManagementPage";
import SMAdvertisementsPage from "./pages/StoreManager/SMAdvertisementsPage";
import SMCreateAdvertisementPage from "./pages/StoreManager/SMCreateAdvertisementPage";
import SMEditAdvertisementPage from "./pages/StoreManager/SMEditAdvertisementPage";
import SMHomepageAdsPage from "./pages/StoreManager/SMHomepageAdsPage";
import SMCreateHomepageAdPage from "./pages/StoreManager/SMCreateHomepageAdPage";
import SMHomepageAdPaymentPage from "./pages/StoreManager/SMHomepageAdPaymentPage";
import SMHomepageAdAnalyticsPage from "./pages/StoreManager/SMHomepageAdAnalyticsPage";
import SMHomepageAdPricingPage from "./pages/StoreManager/SMHomepageAdPricingPage";
import { getAllProducts } from "./redux/actions/product";
import { getAllEvents } from "./redux/actions/event";
import { server } from "./server";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CustomerVideoCall from "./components/Customer/CustomerVideoCall";
import SellerVideoCall from "./components/Shop/SellerVideoCall";
import { SocketProvider } from "./contexts/SocketContext";

const App = () => {
  const [stripeApikey, setStripeApiKey] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize Google Translate
  useGoogleTranslate();

  async function getStripeApikey() {
    try {
      const { data } = await axios.get(`${server}/payment/stripeapikey`);
      setStripeApiKey(data.stripeApikey);
    } catch (error) {
      console.log("Error loading stripe key:", error);
    }
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load user and seller data first (these actions handle their own errors)
        await Promise.all([
          Store.dispatch(loadUser()),
          Store.dispatch(loadSeller()),
        ]);
        
        // Load other data
        Store.dispatch(getAllProducts());
        Store.dispatch(getAllEvents());
        getStripeApikey();
        
        setIsInitialized(true);
      } catch (error) {
        console.log("Error initializing app:", error);
        setIsInitialized(true); // Set to true even on error to prevent infinite loading
      }
    };

    initializeApp();
  }, []);

  // Show loading screen while app is initializing
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
          <p className="text-gray-500">Initializing your shopping experience</p>
        </div>
      </div>
    );
  }

  return (
    <CurrencyProvider>
    <SocketProvider>
      <BrowserRouter>
        <BanModal />
        {stripeApikey && (
        <Elements stripe={loadStripe(stripeApikey)}>
          <Routes>
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <BanProtection>
                    <PaymentPage />
                  </BanProtection>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Elements>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/buyer-terms" element={<BuyerTermsOfServicePage />} />
        <Route path="/seller-terms" element={<SellerTermsOfServicePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/refund" element={<RefundPolicyPage />} />
        <Route path="/shipping" element={<ShippingPolicyPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/forgot-password" element={<UserForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<UserResetPasswordPage />} />
        <Route
          path="/activation/:activation_token"
          element={<ActivationPage />}
        />
        <Route
          path="/seller/activation/:activation_token"
          element={<SellerActivationPage />}
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/best-selling" element={<BestSellingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <BanProtection>
                <CheckoutPage />
              </BanProtection>
            </ProtectedRoute>
          }
        />

        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route path="/phonepe/success" element={<PhonePeSuccessPage />} />
        <Route path="/phonepe/failed" element={<PhonePeFailedPage />} />
        <Route path="/phonepe/test-payment" element={<PhonePeTestPayment />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <BanProtection>
                <ProfilePage />
              </BanProtection>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <BanProtection>
                <UserInbox />
              </BanProtection>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/order/:id"
          element={
            <ProtectedRoute>
              <BanProtection>
                <OrderDetailsPage />
              </BanProtection>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/track/order/:id"
          element={
            <ProtectedRoute>
              <BanProtection>
                <TrackOrderPage />
              </BanProtection>
            </ProtectedRoute>
          }
        />

        <Route path="/shop/preview/:id" element={<ShopPreviewPage />} />
        {/* shop Routes */}
        <Route path="/shop-create" element={<ShopCreatePage />} />
        <Route path="/shop-login" element={<ShopLoginPage />} />
        <Route path="/shop-forgot-password" element={<ShopForgotPasswordPage />} />
        <Route path="/shop-reset-password/:token" element={<ShopResetPasswordPage />} />
        {/* Public subscription plans page - anyone can view */}
        <Route path="/shop/subscriptions" element={<SubscriptionPlansPage />} />
        <Route
          path="/shop/:id"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopHomePage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopSettingsPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-store-settings"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <StoreSettingsPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-html-css-editor"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <HtmlCssEditorPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-shipping"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShippingManagementPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />
        <Route
          path="/dashboard-product-shipping"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ProductShippingPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopDashboardPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-create-product"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopCreateProduct />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-edit-product/:id"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopEditProductPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-orders"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopAllOrders />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-refunds"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopAllRefunds />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/order/:id"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopOrderDetails />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-products"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopAllProducts />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-withdraw-money"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopWithDrawMoneyPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-messages"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopInboxPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-video-calls"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopVideoCallsPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-video-banners"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <DashboardVideoBannersPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-create-video-banner"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <DashboardCreateVideoBannerPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-edit-video-banner/:id"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <DashboardEditVideoBannerPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-create-event"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopCreateEvents />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />
        <Route
          path="/dashboard-events"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopAllEvents />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />
        <Route
          path="/dashboard-coupouns"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopAllCoupouns />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-advertisements"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopAllAdvertisements />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-create-advertisement"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopCreateAdvertisement />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-advertisement-pricing"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopAdvertisementPricing />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-advertisement-payment/:advertisementId"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopAdvertisementPayment />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-edit-advertisement/:id"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopEditAdvertisement />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-renew-advertisement/:id"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopRenewAdvertisement />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-gst-settings"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <SellerGSTSettingsPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-delivery-setup"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <VendorDeliverySetupPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-store-manager"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ShopStoreManagerPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-subscription"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <SubscriptionPlansPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-commissions"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <CommissionDashboardPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-inventory-alerts"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <InventoryAlertsPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/dashboard-reviews"
          element={
            <SellerSubscriptionProtectedRoute>
              <SellerBanProtection>
                <ReviewManagementPage />
              </SellerBanProtection>
            </SellerSubscriptionProtectedRoute>
          }
        />

        <Route
          path="/subscription-success"
          element={
            <SellerProtectedRoute>
              <SubscriptionSuccessPage />
            </SellerProtectedRoute>
          }
        />

        {/* PayPal redirect route - with /seller/ prefix */}
        <Route
          path="/seller/subscription-success"
          element={
            <SellerProtectedRoute>
              <SubscriptionSuccessPage />
            </SellerProtectedRoute>
          }
        />

        {/* PayPal cancel routes */}
        <Route
          path="/subscription-cancel"
          element={
            <SellerProtectedRoute>
              <SubscriptionCancelPage />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/seller/subscription-cancel"
          element={
            <SellerProtectedRoute>
              <SubscriptionCancelPage />
            </SellerProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedAdminRoute>
              <AdminAnalyticsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardUsers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-staff"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardStaff />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-sellers"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardSellers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-pending-sellers"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPendingSellers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-pending-products"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPendingProducts />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-orders"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardOrders />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/order/:id"
          element={
            <ProtectedAdminRoute>
              <AdminOrderDetailsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-products"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardProducts />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-events"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardEvents />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-banner"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardBanner />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-video-banners"
          element={
            <ProtectedAdminRoute>
              <AdminVideoBannersPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-create-video-banner"
          element={
            <ProtectedAdminRoute>
              <CreateVideoBannerPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-categories"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardCategories />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-legal-pages"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardLegalPages />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-reviews"
          element={
            <ProtectedAdminRoute>
              <AdminReviewsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-site-settings"
          element={
            <ProtectedAdminRoute>
              <AdminSiteSettingsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-email-templates"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardEmailTemplates />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-in-house-stores"
          element={
            <ProtectedAdminRoute>
              <AdminInHouseStoresPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-currency-settings"
          element={
            <ProtectedAdminRoute>
              <AdminCurrencySettingsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-subscriptions"
          element={
            <ProtectedAdminRoute>
              <AdminSubscriptionsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-plan-management"
          element={
            <ProtectedAdminRoute>
              <AdminPlanManagementPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-advertisements"
          element={
            <ProtectedAdminRoute>
              <AdminAdvertisementsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-ad-plans"
          element={
            <ProtectedAdminRoute>
              <AdminAdPlanManagementPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-review-management"
          element={
            <ProtectedAdminRoute>
              <AdminReviewManagementPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-faq"
          element={
            <ProtectedAdminRoute>
              <AdminFAQPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-blog"
          element={
            <ProtectedAdminRoute>
              <AdminBlogPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-districts"
          element={
            <ProtectedAdminRoute>
              <AdminDistrictManagementPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-withdraw-request"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardWithdraw />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin-store-managers"
          element={
            <ProtectedAdminRoute>
              <AdminStoreManagerPage />
            </ProtectedAdminRoute>
          }
        />

        {/* Store Manager Routes */}
        <Route
          path="/store-manager"
          element={
            <StoreManagerProtectedRoute>
              <StoreManagerDashboardPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/dashboard"
          element={
            <StoreManagerProtectedRoute>
              <StoreManagerDashboardPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/products"
          element={
            <StoreManagerProtectedRoute>
              <SMProductsPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/create-product"
          element={
            <StoreManagerProtectedRoute>
              <SMCreateProductPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/edit-product/:id"
          element={
            <StoreManagerProtectedRoute>
              <SMEditProductPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/orders"
          element={
            <StoreManagerProtectedRoute>
              <SMOrdersPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/order/:id"
          element={
            <StoreManagerProtectedRoute>
              <SMOrderDetailsPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/inventory"
          element={
            <StoreManagerProtectedRoute>
              <SMInventoryPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/ad-plans"
          element={
            <StoreManagerProtectedRoute>
              <SMAdPlanManagementPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/advertisements"
          element={
            <StoreManagerProtectedRoute>
              <SMAdvertisementsPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/create-advertisement"
          element={
            <StoreManagerProtectedRoute>
              <SMCreateAdvertisementPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/edit-advertisement/:id"
          element={
            <StoreManagerProtectedRoute>
              <SMEditAdvertisementPage />
            </StoreManagerProtectedRoute>
          }
        />
        
        {/* Store Manager Homepage Ads Routes */}
        <Route
          path="/store-manager/homepage-ads"
          element={
            <StoreManagerProtectedRoute>
              <SMHomepageAdsPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/homepage-ads/create"
          element={
            <StoreManagerProtectedRoute>
              <SMCreateHomepageAdPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/homepage-ads/pricing"
          element={
            <StoreManagerProtectedRoute>
              <SMHomepageAdPricingPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/homepage-ads/payment/:id"
          element={
            <StoreManagerProtectedRoute>
              <SMHomepageAdPaymentPage />
            </StoreManagerProtectedRoute>
          }
        />
        <Route
          path="/store-manager/homepage-ads/analytics/:id"
          element={
            <StoreManagerProtectedRoute>
              <SMHomepageAdAnalyticsPage />
            </StoreManagerProtectedRoute>
          }
        />
      </Routes>
      
      {/* Customer Video Call Component - Global */}
      <CustomerVideoCall />
      
      {/* Seller Video Call Component - Global */}
      <SellerVideoCall />
      
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </BrowserRouter>
    </SocketProvider>
    </CurrencyProvider>
  );
};
export default App;
