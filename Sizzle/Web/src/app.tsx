import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const VendorPage = lazy(() => import('./pages/VendorPage').then((m) => ({ default: m.VendorPage })));
const MenuPage = lazy(() => import('./pages/MenuPage').then((m) => ({ default: m.MenuPage })));
const AddItemPage = lazy(() => import('./pages/AddItemPage').then((m) => ({ default: m.AddItemPage })));
const ItemDetailPage = lazy(() => import('./pages/ItemDetailPage').then((m) => ({ default: m.ItemDetailPage })));
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage').then((m) => ({ default: m.ConfirmationPage })));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage').then((m) => ({ default: m.OrderTrackingPage })));
const PickupConfirmationPage = lazy(() => import('./pages/PickupConfirmationPage').then((m) => ({ default: m.PickupConfirmationPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const BusinessHoursPage = lazy(() => import('./pages/BusinessHoursPage').then((m) => ({ default: m.BusinessHoursPage })));
const PayoutsPage = lazy(() => import('./pages/PayoutsPage').then((m) => ({ default: m.PayoutsPage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })));
const FavoritesEmptyPage = lazy(() => import('./pages/FavoritesEmptyPage').then((m) => ({ default: m.FavoritesEmptyPage })));
const UserAccountPage = lazy(() => import('./pages/UserAccountPage').then((m) => ({ default: m.UserAccountPage })));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage').then((m) => ({ default: m.OrderHistoryPage })));
const OrderHistoryEmptyPage = lazy(() => import('./pages/OrderHistoryEmptyPage').then((m) => ({ default: m.OrderHistoryEmptyPage })));
const PaymentMethodsPage = lazy(() => import('./pages/PaymentMethodsPage').then((m) => ({ default: m.PaymentMethodsPage })));
const PaymentFailedPage = lazy(() => import('./pages/PaymentFailedPage').then((m) => ({ default: m.PaymentFailedPage })));
const OrderHelpPage = lazy(() => import('./pages/OrderHelpPage').then((m) => ({ default: m.OrderHelpPage })));
const PickupCompletePage = lazy(() => import('./pages/PickupCompletePage').then((m) => ({ default: m.PickupCompletePage })));
const WriteReviewPage = lazy(() => import('./pages/WriteReviewPage').then((m) => ({ default: m.WriteReviewPage })));
const ReorderReviewPage = lazy(() => import('./pages/ReorderReviewPage').then((m) => ({ default: m.ReorderReviewPage })));
const FilterPanelPage = lazy(() => import('./pages/FilterPanelPage').then((m) => ({ default: m.FilterPanelPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const GoLivePage = lazy(() => import('./pages/GoLivePage').then((m) => ({ default: m.GoLivePage })));
const ItemCustomizePage = lazy(() => import('./pages/ItemCustomizePage').then((m) => ({ default: m.ItemCustomizePage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const MapPage = lazy(() => import('./pages/MapPage').then((m) => ({ default: m.MapPage })));
const NewOrderAlertPage = lazy(() => import('./pages/NewOrderAlertPage').then((m) => ({ default: m.NewOrderAlertPage })));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const RejectOrderPage = lazy(() => import('./pages/RejectOrderPage').then((m) => ({ default: m.RejectOrderPage })));
const ResetLinkExpiredPage = lazy(() => import('./pages/ResetLinkExpiredPage').then((m) => ({ default: m.ResetLinkExpiredPage })));
const ResetLinkSentPage = lazy(() => import('./pages/ResetLinkSentPage').then((m) => ({ default: m.ResetLinkSentPage })));
const SearchEmptyPage = lazy(() => import('./pages/SearchEmptyPage').then((m) => ({ default: m.SearchEmptyPage })));
const VendorBusyModePage = lazy(() => import('./pages/VendorBusyModePage').then((m) => ({ default: m.VendorBusyModePage })));
const VendorLoginPage = lazy(() => import('./pages/VendorLoginPage').then((m) => ({ default: m.VendorLoginPage })));
const VendorOnboardingPage = lazy(() => import('./pages/VendorOnboardingPage').then((m) => ({ default: m.VendorOnboardingPage })));
const VendorOnboardingHoursPage = lazy(() => import('./pages/VendorOnboardingHoursPage').then((m) => ({ default: m.VendorOnboardingHoursPage })));
const VendorOnboardingPayoutPage = lazy(() => import('./pages/VendorOnboardingPayoutPage').then((m) => ({ default: m.VendorOnboardingPayoutPage })));
const VendorRegisterPage = lazy(() => import('./pages/VendorRegisterPage').then((m) => ({ default: m.VendorRegisterPage })));
const VendorVerificationPendingPage = lazy(() => import('./pages/VendorVerificationPendingPage').then((m) => ({ default: m.VendorVerificationPendingPage })));
const SupabaseStatusPage = lazy(() => import('./pages/SupabaseStatusPage').then((m) => ({ default: m.SupabaseStatusPage })));

export default function App() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8f6f1', color: '#1c1917' }}>Loading…</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/vendor" element={<VendorPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/favorites-empty" element={<FavoritesEmptyPage />} />
        <Route path="/user-account" element={<UserAccountPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        <Route path="/order-history-empty" element={<OrderHistoryEmptyPage />} />
        <Route path="/payment-methods" element={<PaymentMethodsPage />} />
        <Route path="/payment-failed" element={<PaymentFailedPage />} />
        <Route path="/order-help" element={<OrderHelpPage />} />
        <Route path="/pickup-complete" element={<PickupCompletePage />} />
        <Route path="/write-review" element={<WriteReviewPage />} />
        <Route path="/reorder-review" element={<ReorderReviewPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/add-item" element={<AddItemPage />} />
        <Route path="/item-detail" element={<ItemDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/business-hours" element={<BusinessHoursPage />} />
        <Route path="/payouts" element={<PayoutsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/order-tracking" element={<OrderTrackingPage />} />
        <Route path="/pickup-confirmation" element={<PickupConfirmationPage />} />
        <Route path="/filter-panel" element={<FilterPanelPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/go-live" element={<GoLivePage />} />
        <Route path="/item-customize" element={<ItemCustomizePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/new-order-alert" element={<NewOrderAlertPage />} />
        <Route path="/order-detail" element={<OrderDetailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reject-order" element={<RejectOrderPage />} />
        <Route path="/reset-link-expired" element={<ResetLinkExpiredPage />} />
        <Route path="/reset-link-sent" element={<ResetLinkSentPage />} />
        <Route path="/search-empty" element={<SearchEmptyPage />} />
        <Route path="/vendor-busy-mode" element={<VendorBusyModePage />} />
        <Route path="/vendor-login" element={<VendorLoginPage />} />
        <Route path="/vendor-onboarding" element={<VendorOnboardingPage />} />
        <Route path="/vendor-onboarding-hours" element={<VendorOnboardingHoursPage />} />
        <Route path="/vendor-onboarding-payout" element={<VendorOnboardingPayoutPage />} />
        <Route path="/vendor-register" element={<VendorRegisterPage />} />
        <Route path="/vendor-verification-pending" element={<VendorVerificationPendingPage />} />
        <Route path="/supabase" element={<SupabaseStatusPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
