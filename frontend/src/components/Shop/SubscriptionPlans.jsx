import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { HiCheck, HiX, HiSparkles, HiExclamation } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useCurrency } from "../../context/CurrencyContext";

const SubscriptionPlans = ({ isPublic = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSeller } = useSelector((state) => state.seller);
  const { formatPrice } = useCurrency();
  const [plans, setPlans] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [processingPayment, setProcessingPayment] = useState(false);

  // Check if redirected from protected route
  const redirectMessage = location.state?.message;
  const redirectedFrom = location.state?.from;

  useEffect(() => {
    // Show toast if redirected from a protected route
    if (redirectMessage) {
      toast.warning(redirectMessage);
    }
  }, [redirectMessage]);

  useEffect(() => {
    fetchPlans();
    if (isSeller) {
      fetchCurrentSubscription();
    } else {
      setLoading(false);
    }
  }, [isSeller]);

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get(`${server}/subscription/get-plans`);
      setPlans(data.plans);
    } catch (error) {
      toast.error("Failed to load subscription plans");
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const { data } = await axios.get(
        `${server}/subscription/my-subscription`,
        {
          withCredentials: true,
        }
      );
      setCurrentSubscription(data.subscription);
    } catch (error) {
      console.log("No active subscription");
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (plan) => {
    if (!plans || !plans[plan])
      return {
        totalBeforeDiscount: 0,
        discountAmount: 0,
        finalPrice: 0,
        discount: 0,
      };
    const planData = plans[plan];
    const monthlyPrice = planData.monthlyPrice;

    const months =
      billingCycle === "3-months"
        ? 3
        : billingCycle === "6-months"
        ? 6
        : billingCycle === "12-months"
        ? 12
        : 1;
    const discount =
      billingCycle === "3-months"
        ? 10
        : billingCycle === "6-months"
        ? 15
        : billingCycle === "12-months"
        ? 20
        : 0;

    const totalBeforeDiscount = monthlyPrice * months;
    const discountAmount = (totalBeforeDiscount * discount) / 100;
    const finalPrice = totalBeforeDiscount - discountAmount;

    return { totalBeforeDiscount, discountAmount, finalPrice, discount };
  };

  const handleSubscribe = async (plan) => {
    // If not a seller, redirect to login
    if (!isSeller) {
      toast.info("Please login as a seller to subscribe");
      navigate("/shop-login", { state: { redirectTo: "/shop/subscriptions" } });
      return;
    }

    setSelectedPlan(plan);
    setProcessingPayment(true);

    try {
      const { data } = await axios.post(
        `${server}/subscription/create-paypal-subscription`,
        { plan, billingCycle },
        { withCredentials: true }
      );

      if (data.success && data.approvalUrl) {
        // Store subscription ID for later activation
        localStorage.setItem("pendingSubscriptionId", data.subscription);
        // Redirect to PayPal
        window.location.href = data.approvalUrl;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create subscription"
      );
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="lg:ml-[calc(64px)] w-full bg-gradient-to-br from-blue-50 to-white min-h-screen py-4 sm:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Subscription Required Alert - shown when redirected */}
        {redirectMessage && !currentSubscription && (
          <div className="mb-4 sm:mb-6 mx-2 sm:mx-0 bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <HiExclamation className="w-6 h-6 text-amber-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800">
                  Subscription Required
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  {redirectMessage} Please choose a subscription plan below to
                  unlock all features.
                </p>
                {redirectedFrom && (
                  <p className="text-xs text-amber-600 mt-2">
                    You were trying to access:{" "}
                    <code className="bg-amber-100 px-1 rounded">
                      {redirectedFrom}
                    </code>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-4 sm:mb-8 px-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Choose Your Subscription Plan
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Select the perfect plan for your business
          </p>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <div className="mb-4 sm:mb-8 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-green-800">
                  Active Subscription
                </h3>
                <p className="text-xs sm:text-sm text-green-600">
                  {plans[currentSubscription.plan]?.name} Plan - Expires{" "}
                  {new Date(currentSubscription.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {formatPrice(currentSubscription.finalPrice)}
                </p>
                <p className="text-xs text-green-500">
                  {currentSubscription.billingCycle}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Billing Cycle Selector */}
        <div className="flex justify-center mb-4 sm:mb-8 px-2 overflow-x-auto pb-2">
          <div className="inline-flex rounded-lg border border-primary-200 bg-white p-1 min-w-max">
            {[
              {
                value: "monthly",
                label: "Monthly",
                shortLabel: "1 Mo",
                discount: "0%",
              },
              {
                value: "3-months",
                label: "3 Months",
                shortLabel: "3 Mo",
                discount: "10%",
              },
              {
                value: "6-months",
                label: "6 Months",
                shortLabel: "6 Mo",
                discount: "15%",
              },
              {
                value: "12-months",
                label: "12 Months",
                shortLabel: "12 Mo",
                discount: "20%",
              },
            ].map((cycle) => (
              <button
                key={cycle.value}
                onClick={() => setBillingCycle(cycle.value)}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  billingCycle === cycle.value
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="hidden sm:block">{cycle.label}</div>
                <div className="sm:hidden">{cycle.shortLabel}</div>
                {cycle.discount !== "0%" && (
                  <div className="text-[10px] sm:text-xs">
                    {cycle.discount} off
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        {plans && Object.keys(plans).length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {Object.entries(plans).map(([planKey, planData]) => (
              <PlanCard
                key={planKey}
                plan={planKey}
                planData={planData}
                pricing={calculatePrice(planKey)}
                billingCycle={billingCycle}
                onSubscribe={handleSubscribe}
                isProcessing={processingPayment && selectedPlan === planKey}
                isCurrent={currentSubscription?.plan === planKey}
                recommended={planKey === "silver"}
                isRevenueShare={planKey === "revenue-share"}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow mx-2">
            <p className="text-gray-500 text-base sm:text-lg">
              No subscription plans available.
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">
              Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const PlanCard = ({
  plan,
  planData,
  pricing,
  billingCycle,
  onSubscribe,
  isProcessing,
  isCurrent,
  recommended = false,
  isRevenueShare = false,
  formatPrice,
}) => {
  return (
    <div
      className={`relative bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 border-2 ${
        recommended
          ? "border-primary-500"
          : isCurrent
          ? "border-green-500"
          : "border-gray-200"
      } hover:shadow-xl transition-shadow`}
    >
      {/* Recommended Badge */}
      {recommended && (
        <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1">
            <HiSparkles className="w-2 h-2 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Recommended</span>
            <span className="sm:hidden">Best</span>
          </span>
        </div>
      )}

      {/* Current Badge */}
      {isCurrent && (
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          <span className="bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium">
            Current
          </span>
        </div>
      )}

      {/* Plan Name */}
      <h3 className="text-sm sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 mt-1 sm:mt-0">
        {planData.name}
      </h3>

      {/* Price */}
      <div className="mb-2 sm:mb-4">
        {isRevenueShare ? (
          <>
            <div className="text-lg sm:text-3xl font-bold text-gray-900">
              <span className="text-base sm:text-3xl">10%</span>
              <span className="text-xs sm:text-base font-normal"> Comm.</span>
            </div>
            <p className="text-[10px] sm:text-sm text-gray-500">
              {formatPrice(25)} min/mo
            </p>
          </>
        ) : (
          <>
            {pricing.discount > 0 && (
              <div className="text-xs sm:text-lg text-gray-400 line-through">
                {formatPrice(pricing.totalBeforeDiscount)}
              </div>
            )}
            <div className="text-lg sm:text-3xl font-bold text-gray-900">
              {formatPrice(pricing.finalPrice)}
            </div>
            <p className="text-[10px] sm:text-sm text-gray-500">
              {billingCycle === "monthly" ? "/month" : billingCycle}
            </p>
            {pricing.discount > 0 && (
              <p className="text-[10px] sm:text-sm text-green-600 font-medium">
                Save {pricing.discount}%
              </p>
            )}
          </>
        )}
      </div>

      {/* Max Products */}
      <div className="mb-2 sm:mb-4 pb-2 sm:pb-4 border-b border-gray-200">
        <p className="text-xs sm:text-base text-gray-700 font-semibold">
          {planData.maxProducts === 999 ? "Unlimited" : planData.maxProducts}{" "}
          Products
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-1 sm:space-y-2 mb-3 sm:mb-6 text-[10px] sm:text-sm">
        {planData.features.businessProfile && (
          <FeatureItem text="Business Profile" shortText="Biz Profile" />
        )}
        {planData.features.logo && (
          <FeatureItem text="Logo Upload" shortText="Logo" />
        )}
        {planData.features.pdfUpload && (
          <FeatureItem text="PDF Upload" shortText="PDF" />
        )}
        <FeatureItem
          text={`${planData.features.imagesPerProduct} Images/Product`}
          shortText={`${planData.features.imagesPerProduct} Imgs`}
        />
        {planData.features.videoOption ? (
          <FeatureItem text="Video Upload" shortText="Video" />
        ) : (
          <FeatureItem text="Video Upload" shortText="Video" disabled />
        )}
        {planData.features.contactSeller ? (
          <FeatureItem text="Contact Seller" shortText="Contact" />
        ) : (
          <FeatureItem text="Contact Seller" shortText="Contact" disabled />
        )}
        {planData.features.htmlCssEditor ? (
          <FeatureItem text="HTML/CSS Editor" shortText="HTML/CSS" />
        ) : (
          <FeatureItem text="HTML/CSS Editor" shortText="HTML/CSS" disabled />
        )}
        {planData.features.adPreApproval ? (
          <FeatureItem text="Ad Pre-Approval" shortText="Ad Approve" />
        ) : (
          <FeatureItem text="Ad Pre-Approval" shortText="Ad Approve" disabled />
        )}
      </ul>

      {/* Subscribe Button */}
      <button
        onClick={() => onSubscribe(plan)}
        disabled={isProcessing || isCurrent}
        className={`w-full py-2 sm:py-3 rounded-lg text-xs sm:text-base font-semibold transition-colors ${
          isCurrent
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : recommended
            ? "bg-primary-600 text-white hover:bg-primary-700"
            : "bg-red-500 text-white hover:bg-red-600"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-1 sm:gap-2">
            <AiOutlineLoading3Quarters className="animate-spin w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Processing...</span>
          </span>
        ) : isCurrent ? (
          <span className="hidden sm:inline">Current Plan</span>
        ) : isCurrent ? (
          <span className="sm:hidden">Current</span>
        ) : (
          <>
            <span className="hidden sm:inline">Subscribe Now</span>
            <span className="sm:hidden">Subscribe</span>
          </>
        )}
      </button>
    </div>
  );
};

const FeatureItem = ({ text, shortText, disabled = false }) => {
  return (
    <li className="flex items-center gap-1 sm:gap-2">
      {disabled ? (
        <HiX className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
      ) : (
        <HiCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
      )}
      <span className={`${disabled ? "text-gray-400" : "text-gray-700"}`}>
        <span className="hidden sm:inline">{text}</span>
        <span className="sm:hidden">{shortText || text}</span>
      </span>
    </li>
  );
};

export default SubscriptionPlans;
