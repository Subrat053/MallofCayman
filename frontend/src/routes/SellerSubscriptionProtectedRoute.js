import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Loader from "../components/Layout/Loader";

/**
 * Protected route that requires both seller authentication AND an active subscription.
 * Sellers without an active subscription will be redirected to the subscription page.
 * 
 * Routes that should NOT require subscription (always accessible):
 * - /dashboard (to see overview and subscription status)
 * - /dashboard-subscription (to purchase subscription)
 * - /settings (to manage account)
 * - /shop/:id (public shop page)
 */

// Routes that don't require subscription - sellers can access these without a paid plan
const SUBSCRIPTION_FREE_ROUTES = [
  "/dashboard",
  "/dashboard-subscription",
  "/settings",
  "/subscription-success",
];

const SellerSubscriptionProtectedRoute = ({ children }) => {
  const { isLoading, isSeller, seller } = useSelector((state) => state.seller);
  const location = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  // Not a seller - redirect to login
  if (!isSeller) {
    return <Navigate to="/shop-login" replace />;
  }

  // Check if current route is subscription-free
  const isSubscriptionFreeRoute = SUBSCRIPTION_FREE_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith("/shop/")
  );

  // If it's a subscription-free route, allow access
  if (isSubscriptionFreeRoute) {
    return children;
  }

  // Check subscription status - must have both:
  // 1. An active subscription status (not pending, cancelled, or expired)
  // 2. A paid plan (not 'free' or 'none')
  const PAID_PLANS = ['bronze', 'silver', 'gold', 'platinum', 'revenue-share'];
  const isPaidPlan = seller?.subscriptionPlan && PAID_PLANS.includes(seller.subscriptionPlan.toLowerCase());
  const isActiveStatus = seller?.subscriptionStatus === 'active';
  
  const hasActiveSubscription = isPaidPlan && isActiveStatus;

  // No active paid subscription - redirect to subscription page
  if (!hasActiveSubscription) {
    return (
      <Navigate 
        to="/dashboard-subscription" 
        state={{ 
          from: location.pathname,
          message: "Please subscribe to a plan to access this feature." 
        }} 
        replace 
      />
    );
  }

  return children;
};

export default SellerSubscriptionProtectedRoute;
