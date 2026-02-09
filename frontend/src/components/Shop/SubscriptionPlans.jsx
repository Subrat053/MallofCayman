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
      <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-indigo-600 mx-auto mb-6 shadow-lg"></div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-xl border border-white/20">
            <p className="text-slate-700 text-lg font-semibold">Loading subscription plans...</p>
            <p className="text-slate-500 text-sm mt-2">Please wait while we fetch the latest plans</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen py-3 sm:py-6">
      <div className="max-w-8xl mx-auto">
        {/* Subscription Required Alert - shown when redirected */}
        {redirectMessage && !currentSubscription && (
          <div className="mb-6 sm:mb-8 mx-4 sm:mx-0 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-white/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <HiExclamation className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-900 mb-2">
                  Subscription Required
                </h3>
                <p className="text-amber-800 leading-relaxed mb-3">
                  {redirectMessage} Please choose a subscription plan below to
                  unlock all premium features and grow your business.
                </p>
                {redirectedFrom && (
                  <div className="bg-amber-100/50 backdrop-blur-sm rounded-xl p-3 border border-amber-200">
                    <p className="text-sm text-amber-700">
                      You were trying to access:{" "}
                      <code className="bg-amber-200/80 px-2 py-1 rounded-lg font-mono font-semibold">
                        {redirectedFrom}
                      </code>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-3 sm:mb-6 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2 lg:mb-4">
              Choose Your Subscription Plan
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
              Unlock the perfect plan for your business growth and success
            </p>
            {/* <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
              <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
            </div> */}
          </div>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <div className="mb-8 sm:mb-12 mx-4 sm:mx-0">
            <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-6 lg:p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <HiCheck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-emerald-900 mb-2">
                      🎉 Active Subscription
                    </h3>
                    <p className="text-emerald-700 leading-relaxed">
                      <span className="font-semibold">{plans[currentSubscription.plan]?.name} Plan</span> - 
                      <span className="text-emerald-600">Expires {new Date(currentSubscription.endDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {formatPrice(currentSubscription.finalPrice)}
                  </p>
                  <p className="text-emerald-600 font-medium capitalize">
                    {currentSubscription.billingCycle.replace('-', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Cycle Selector */}
        <div className="flex justify-center mb-8 sm:mb-12 px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl p-2">
            <div className="flex flex-wrap justify-center gap-2">
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
                  className={`px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-sm sm:text-base font-bold transition-all duration-300 transform hover:scale-105 whitespace-nowrap relative overflow-hidden ${
                    billingCycle === cycle.value
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xl"
                      : "text-slate-700 hover:bg-white/60 bg-white/40"
                  }`}
                >
                  {cycle.discount !== "0%" && billingCycle === cycle.value && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-bl-xl rounded-tr-2xl">
                      {cycle.discount} OFF
                    </div>
                  )}
                  <div className="hidden sm:block">{cycle.label}</div>
                  <div className="sm:hidden">{cycle.shortLabel}</div>
                  {cycle.discount !== "0%" && (
                    <div className="text-xs mt-1 opacity-90">
                      Save {cycle.discount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        {plans && Object.keys(plans).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 px-4">
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
          <div className="text-center py-16 mx-4">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-300 to-indigo-300 rounded-2xl flex items-center justify-center">
                  <HiX className="w-7 h-7 text-slate-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                No subscription plans available
              </h3>
              <p className="text-slate-600 leading-relaxed mb-8">
                We're currently updating our subscription offerings. Please check back soon for exciting new plans!
              </p>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <p className="text-slate-500 text-sm">
                  🗚️ Plans will be available shortly
                </p>
              </div>
            </div>
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
      className={`relative group transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
        recommended ? "order-first md:order-none" : ""
      }`}
    >
      {/* Card */}
      <div
        className={`relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-2 lg:p-4 border-2 transition-all duration-500 overflow-hidden ${
          recommended
            ? "border-gradient-to-r from-indigo-500 to-purple-500 shadow-indigo-200/50"
            : isCurrent
            ? "border-emerald-400 shadow-emerald-200/50"
            : "border-white/20 shadow-slate-200/50 group-hover:border-indigo-200"
        }`}
        style={{
          background: recommended
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)'
            : isCurrent
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
            : 'rgba(255, 255, 255, 0.8)'
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-200/20 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full blur-2xl"></div>
        </div>

        {/* Recommended Badge */}
        {recommended && (
          <div className="absolute z-40 -top-3 left-1/2 transform -translate-x-1/2 ">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm">
              <span className="flex items-center gap-2 text-sm font-bold">
                <HiSparkles className="w-4 h-4" />
                <span className="hidden sm:inline text-[12px]">Most Popular</span>
                <span className="sm:hidden text-[12px]">Popular</span>
              </span>
            </div>
          </div>
        )}

        {/* Current Badge */}
        {isCurrent && (
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-3 py-2 rounded-xl text-sm font-bold shadow-lg border border-emerald-200 backdrop-blur-sm">
              ✓ Current
            </span>
          </div>
        )}

        {/* Plan Name */}
        <div className="relative z-10 mt-2">
          <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-2 text-center">
            {planData.name}
          </h3>
        </div>

        {/* Price */}
        <div className="relative z-10 text-center mb-4">
          {isRevenueShare ? (
            <>
              <div className="text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  10%
                </span>
              </div>
              <p className="text-slate-600 font-medium">Commission</p>
              <p className="text-sm text-slate-500 mt-1">
                {formatPrice(25)} minimum/month
              </p>
            </>
          ) : (
            <>
              {pricing.discount > 0 && (
                <div className="text-lg text-slate-400 line-through mb-1">
                  {formatPrice(pricing.totalBeforeDiscount)}
                </div>
              )}
              <div className="text-2xl lg:text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {formatPrice(pricing.finalPrice)}
                </span>
              </div>
              <p className="text-slate-600 font-medium">
                {billingCycle === "monthly" ? "per month" : billingCycle.replace('-', ' ')}
              </p>
              {pricing.discount > 0 && (
                <div className="inline-flex items-center mt-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-3 py-1 rounded-xl text-sm font-bold">
                  🎉 Save {pricing.discount}%
                </div>
              )}
            </>
          )}
        </div>

        {/* Max Products */}
        <div className="relative z-10 text-center mb-4 pb-2 border-b border-slate-200/50">
          <div className="bg-gradient-to-r from-slate-100/80 to-indigo-100/80 backdrop-blur-sm rounded-xl p-2 border border-white/20">
            <p className="text-lg font-bold text-slate-800">
              {planData.maxProducts === 999 ? "Unlimited" : planData.maxProducts}{" "}
              <span className="text-slate-600">Products</span>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 mb-4">
          <ul className="py-[2px] text-[12px]">
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
        </div>

        {/* Subscribe Button */}
        <div className="relative z-10">
          <button
            onClick={() => onSubscribe(plan)}
            disabled={isProcessing || isCurrent}
            className={`w-full py-4 rounded-2xl text-base font-bold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg ${
              isCurrent
                ? "bg-gradient-to-r from-slate-200 to-slate-300 text-slate-600 cursor-not-allowed shadow-none"
                : recommended
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-indigo-200 hover:shadow-indigo-300"
                : "bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900 shadow-slate-200 hover:shadow-slate-300"
            } disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative`}
          >
            {/* Button background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            
            <span className="relative z-10">
              {isProcessing ? (
                <span className="flex items-center justify-center gap-3">
                  <AiOutlineLoading3Quarters className="animate-spin w-5 h-5" />
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">Wait...</span>
                </span>
              ) : isCurrent ? (
                <span className="flex items-center justify-center gap-2">
                  <HiCheck className="w-5 h-5" />
                  <span className="hidden sm:inline">Current Plan</span>
                  <span className="sm:hidden">Current</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <HiSparkles className="w-5 h-5" />
                  <span className="hidden sm:inline">Subscribe Now</span>
                  <span className="sm:hidden">Subscribe</span>
                </span>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text, shortText, disabled = false }) => {
  return (
    <li className="flex items-center gap-3 p-2 rounded-xl transition-all duration-200 hover:bg-white/40">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
        disabled 
          ? "bg-gradient-to-r from-slate-200 to-slate-300" 
          : "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-lg"
      }`}>
        {disabled ? (
          <HiX className="w-4 h-4 text-slate-500" />
        ) : (
          <HiCheck className="w-4 h-4 text-white font-bold" />
        )}
      </div>
      <span className={`font-medium ${
        disabled ? "text-slate-400" : "text-slate-700"
      }`}>
        <span className="hidden sm:inline">{text}</span>
        <span className="sm:hidden">{shortText || text}</span>
      </span>
    </li>
  );
};

export default SubscriptionPlans;
