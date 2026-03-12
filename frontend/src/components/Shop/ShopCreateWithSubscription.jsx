import React, { useState, useRef, useCallback, useEffect } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { HiOutlineCamera, HiOutlineLocationMarker } from "react-icons/hi";
import { MdMyLocation } from "react-icons/md";
import { FiMapPin, FiArrowLeft, FiArrowRight, FiCheck, FiCreditCard, FiLock } from "react-icons/fi";
import { BsCreditCard, BsCheckCircle, BsPaypal } from "react-icons/bs";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Google Maps Configuration
const GOOGLE_MAPS_API_KEY = "AIzaSyBecpP3O2kfTa0z-lLIiShmsZE6e1kDmOk";

// ── Stripe inline card form (used inside Elements provider) ──────────────────
const StripeCardForm = ({ clientSecret, onSuccess, planPrice }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements || !clientSecret) return;
    setProcessing(true);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });
    if (result.error) {
      toast.error(result.error.message || "Payment failed. Please try again.");
      setProcessing(false);
    } else if (result.paymentIntent?.status === "succeeded") {
      toast.success("Payment successful!");
      onSuccess();
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-gray-300 rounded-lg p-4 bg-white focus-within:border-slate-500 transition-colors">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "15px",
                color: "#374151",
                fontFamily: "system-ui, sans-serif",
                "::placeholder": { color: "#9ca3af" },
              },
              invalid: { color: "#dc2626" },
            },
          }}
        />
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <FiLock className="text-gray-400 flex-shrink-0" />
        <span>Secured by Stripe — your card details are encrypted</span>
      </div>
      <button
        onClick={handlePay}
        disabled={!stripe || processing}
        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Processing…
          </>
        ) : (
          <>
            <FiLock className="text-base" />
            Pay ${planPrice} securely
          </>
        )}
      </button>
    </div>
  );
};
// ────────────────────────────────────────────────────────────────────────────

// Load Google Maps Script
const loadGoogleMapsScript = (callback) => {
  const existingScript = document.getElementById("googleMaps");
  if (!existingScript) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.id = "googleMaps";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.onload = () => {
      if (callback) callback();
    };
  } else {
    if (callback) callback();
  }
};

const ShopCreateWithSubscription = () => {
  const navigate = useNavigate();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentChoice, setPaymentChoice] = useState(null); // 'now' or 'later'

  // Subscription plans from backend
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phoneNumber: "",
    address: "",
    zipCode: "",
    password: "",
    latitude: "",
    longitude: "",
    paypalEmail: "", // REQUIRED for receiving payments
    // Bank account details
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    accountType: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [tradeLicenses, setTradeLicenses] = useState([]); // Trade and Business License documents
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Subscription selection
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");

  // Stripe payment state
  const [paymentMethod, setPaymentMethod] = useState("paypal"); // 'paypal' | 'stripe'
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [stripeInitError, setStripeInitError] = useState(false);

  // Google Maps states
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Refs
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize Google Maps
  React.useEffect(() => {
    loadGoogleMapsScript(() => {
      initializeAutocomplete();
    });
  }, []);

  // Fetch subscription plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoadingPlans(true);
        const { data } = await axios.get(`${server}/subscription/get-plans`);

        if (data.success && data.plans) {
          // Transform backend data to match frontend structure
          const transformedPlans = Object.entries(data.plans)
            .filter(([key, plan]) => plan.isActive !== false) // Only show active plans
            .map(([key, plan]) => ({
              id: key,
              name: plan.name,
              price: {
                monthly: plan.monthlyPrice,
                quarterly: plan.monthlyPrice * 3 * 0.9, // 10% discount
                semiannual: plan.monthlyPrice * 6 * 0.85, // 15% discount
                annual: plan.monthlyPrice * 12 * 0.8, // 20% discount
              },
              maxProducts: plan.maxProducts,
              features: formatPlanFeatures(plan, key),
              color: getPlanColor(key),
              popular: key === "silver",
            }));

          setSubscriptionPlans(transformedPlans);
        }
      } catch (error) {
        console.error("Failed to fetch subscription plans:", error);
        toast.error("Failed to load subscription plans");
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  // Helper function to format plan features
  const formatPlanFeatures = (plan, planKey) => {
    const features = [];

    // Add max products info
    if (plan.maxProducts === 999) {
      features.push("Unlimited Products");
    } else {
      features.push(`${plan.maxProducts} Products`);
    }

    // Add features from plan.features object
    if (plan.features) {
      if (plan.features.businessProfile)
        features.push("Business profile & logo");
      if (plan.features.pdfUpload) features.push("PDF upload");
      if (plan.features.imagesPerProduct) {
        features.push(`${plan.features.imagesPerProduct} images/product`);
      }
      if (plan.features.videoOption) features.push("Video option");
      if (plan.features.contactSeller) features.push("Contact seller");
      if (plan.features.htmlCssEditor) features.push("HTML/CSS editor");
      if (plan.features.adPreApproval) features.push("Ad pre-approval");
    }

    // Special handling for revenue-share
    if (planKey === "revenue-share") {
      features.push("10% Commission to MoC");
      features.push("90% to vendor");
      features.push("$25/month minimum");
      features.push("Pay as you earn");
    }

    return features;
  };

  // Helper function to get plan color
  const getPlanColor = (planKey) => {
    const colors = {
      bronze: "from-orange-400 to-amber-600",
      silver: "from-gray-400 to-gray-600",
      gold: "from-yellow-400 to-yellow-600",
      "revenue-share": "from-purple-400 to-purple-600",
    };
    return colors[planKey] || "from-blue-400 to-blue-600";
  };

  const initializeAutocomplete = useCallback(() => {
    if (window.google && addressInputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: [] },
        }
      );
      autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
    }
  }, []);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const location = place.geometry.location;
      const lat = location.lat();
      const lng = location.lng();

      setFormData((prev) => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString(),
        address: place.formatted_address || place.name,
      }));
      setMapCenter({ lat, lng });

      const addressComponents = place.address_components;
      const postalCode = addressComponents?.find((component) =>
        component.types.includes("postal_code")
      )?.long_name;

      if (postalCode) {
        setFormData((prev) => ({ ...prev, zipCode: postalCode }));
      }

      setShowMap(true);
      setTimeout(() => initializeMap(), 100);
    }
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setFormData((prev) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString(),
          }));
          setMapCenter({ lat, lng });

          if (window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK" && results[0]) {
                setFormData((prev) => ({
                  ...prev,
                  address: results[0].formatted_address,
                }));
                const addressComponents = results[0].address_components;
                const postalCode = addressComponents?.find((component) =>
                  component.types.includes("postal_code")
                )?.long_name;
                if (postalCode) {
                  setFormData((prev) => ({ ...prev, zipCode: postalCode }));
                }
              }
              setIsLoadingLocation(false);
            });
          } else {
            setIsLoadingLocation(false);
          }

          setShowMap(true);
          setTimeout(() => initializeMap(), 100);
        },
        (error) => {
          toast.error("Unable to get your location");
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
    }
  };

  const initializeMap = () => {
    if (window.google && mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 15,
      });

      if (formData.latitude && formData.longitude) {
        updateMarker(
          parseFloat(formData.latitude),
          parseFloat(formData.longitude)
        );
      }
    }
  };

  const updateMarker = (lat, lng) => {
    if (mapInstanceRef.current) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        draggable: true,
        title: "Shop Location",
      });
      markerRef.current.addListener("dragend", (event) => {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        setFormData((prev) => ({
          ...prev,
          latitude: newLat.toString(),
          longitude: newLng.toString(),
        }));
        reverseGeocode(newLat, newLng);
      });
    }
  };

  const reverseGeocode = (lat, lng) => {
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          setFormData((prev) => ({
            ...prev,
            address: results[0].formatted_address,
          }));
          const addressComponents = results[0].address_components;
          const postalCode = addressComponents?.find((component) =>
            component.types.includes("postal_code")
          )?.long_name;
          if (postalCode) {
            setFormData((prev) => ({ ...prev, zipCode: postalCode }));
          }
        }
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  };

  // Step validation
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter shop name");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter email");
      return false;
    }
    if (!formData.password.trim()) {
      toast.error("Please enter password");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.phoneNumber) {
      toast.error("Please enter phone number");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Please enter address");
      return false;
    }
    if (!formData.zipCode) {
      toast.error("Please enter zip code");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!selectedPlan) {
      toast.error("Please select a subscription plan");
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!paymentChoice) {
      toast.error("Please choose a payment option");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep === 4 && !validateStep4()) return;
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      const newForm = new FormData();

      if (avatar) {
        newForm.append("file", avatar);
      }

      // Append trade license files
      tradeLicenses.forEach((license) => {
        newForm.append("tradeLicenses", license);
      });

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          newForm.append(key, formData[key]);
        }
      });

      // Add subscription preferences
      newForm.append("selectedPlan", selectedPlan);
      newForm.append("billingCycle", billingCycle);
      newForm.append("paymentChoice", paymentChoice);

      const response = await axios.post(
        `${server}/shop/create-shop`,
        newForm,
        config
      );

      toast.success(response.data.message);

      if (paymentChoice === "later") {
        setTimeout(() => {
          navigate("/shop-login");
        }, 2000);
      }
    } catch (error) {
      console.error("Shop registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handlePayPalApprove = async (data, actions) => {
    try {
      await actions.order.capture();
      toast.success("Payment successful! Completing registration...");
      await handleSubmit();
    } catch (error) {
      toast.error("Payment failed");
      setIsLoading(false);
    }
  };

  // Initialize Stripe PaymentIntent for vendor registration
  const initializeStripePayment = async () => {
    try {
      setStripeInitError(false);
      const price = getSelectedPlanPrice();
      if (!price || price <= 0) {
        toast.error("Invalid plan price");
        return;
      }
      const { data } = await axios.post(`${server}/shop/registration-payment-intent`, {
        amount: price,
      });
      if (data.success) {
        setStripeClientSecret(data.client_secret);
        if (data.publishable_key && !stripePromise) {
          setStripePromise(loadStripe(data.publishable_key));
        }
      }
    } catch (error) {
      console.error("Stripe init error:", error);
      setStripeInitError(true);
      toast.error("Failed to initialize card payment.");
    }
  };

  const getSelectedPlanPrice = () => {
    if (!selectedPlan) return 0;
    const plan = subscriptionPlans.find((p) => p.id === selectedPlan);
    return plan?.price[billingCycle] || 0;
  };

  // Render step content
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderAddressInfo();
      case 3:
        return renderSubscriptionSelection();
      case 4:
        return renderPaymentChoice();
      case 5:
        return paymentChoice === "now" ? renderPayment() : renderConfirmation();
      default:
        return null;
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-5">
      {/* Avatar Upload */}
      <div className="flex justify-center">
        <div className="relative">
          {avatar ? (
            <img
              src={URL.createObjectURL(avatar)}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
              <span className="text-3xl">🏪</span>
            </div>
          )}
          <label
            htmlFor="file-input"
            className="absolute bottom-0 right-0 bg-slate-800 text-white p-1.5 rounded-full cursor-pointer hover:bg-slate-700 transition-colors shadow"
          >
            <HiOutlineCamera className="w-4 h-4" />
          </label>
          <input type="file" id="file-input" accept=".jpg,.jpeg,.png" onChange={handleFileInputChange} className="hidden" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Shop Name <span className="text-red-500">*</span></label>
        <input
          type="text" name="name" value={formData.name} onChange={handleInputChange}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white transition-all"
          placeholder="Enter your shop name" required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
        <input
          type="email" name="email" value={formData.email} onChange={handleInputChange}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white transition-all"
          placeholder="shop@example.com" required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
        <div className="relative">
          <input
            type={visible ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white transition-all pr-10"
            placeholder="At least 6 characters" required
          />
          <button type="button" onClick={() => setVisible(!visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {visible ? <AiOutlineEye className="w-4 h-4" /> : <AiOutlineEyeInvisible className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
          <input type="number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
            placeholder="+1 234 567 8900" required />
        </div>
      </div>

      {/* PayPal Email */}
      <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <BsPaypal className="text-blue-700 text-lg flex-shrink-0" />
          <p className="font-semibold text-gray-800 text-sm">PayPal Payout Email <span className="text-red-500">*</span></p>
        </div>
        <p className="text-xs text-amber-700 mb-3">Customer payments go directly to this PayPal account. Required to receive sales revenue.</p>
        <input type="email" name="paypalEmail" value={formData.paypalEmail} onChange={handleInputChange}
          className="w-full px-3 py-2.5 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          placeholder="your@paypal.com" required />
      </div>

      {/* Bank Details */}
      <div className="border border-gray-200 bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <BsCreditCard className="text-gray-500 text-lg flex-shrink-0" />
          <p className="font-semibold text-gray-800 text-sm">Bank Account Details</p>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Optional</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">For backup payments and future withdrawals</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: "accountHolderName", label: "Account Holder Name", placeholder: "John Doe" },
            { name: "accountNumber", label: "Account Number", placeholder: "1234567890" },
            { name: "bankName", label: "Bank Name", placeholder: "Bank of Cayman" },
            { name: "ifscCode", label: "IFSC / Routing Code", placeholder: "SBIN0001234" },
          ].map(({ name, label, placeholder }) => (
            <div key={name} className="space-y-1">
              <label className="block text-xs font-medium text-gray-600">{label}</label>
              <input type="text" name={name} value={formData[name]} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                placeholder={placeholder} />
            </div>
          ))}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">Account Type</label>
            <select name="accountType" value={formData.accountType} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white">
              <option value="">Select type</option>
              <option value="savings">Savings</option>
              <option value="current">Current</option>
            </select>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          <input type="text" ref={addressInputRef} name="address" value={formData.address} onChange={handleInputChange}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
            placeholder="Start typing your address..." required />
          <button type="button" onClick={getCurrentLocation} disabled={isLoadingLocation}
            className="px-3 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex-shrink-0"
            title="Use my location">
            {isLoadingLocation ? <span className="animate-spin inline-block">⌛</span> : <MdMyLocation className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Zip Code <span className="text-red-500">*</span></label>
        <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
          placeholder="Enter zip code" required />
      </div>

      {/* Trade License Upload */}
      <div className="border border-gray-200 rounded-xl p-4">
        <div className="flex items-start gap-2 mb-3">
          <span className="text-xl flex-shrink-0">📄</span>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Trade & Business License <span className="text-gray-400 font-normal">(Optional)</span></p>
            <p className="text-xs text-gray-500 mt-0.5">Upload up to 5 files (PNG, JPG, PDF — max 10MB each). Uploading a trade certificate helps build trust and may speed up approval.</p>
          </div>
        </div>
        <label htmlFor="trade-license-input"
          className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <svg className="w-7 h-7 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-500"><span className="font-medium">Click to upload</span> or drag & drop</p>
          <input id="trade-license-input" type="file" accept=".jpg,.jpeg,.png,.pdf" multiple
            onChange={(e) => {
              const files = Array.from(e.target.files);
              if (files.length + tradeLicenses.length > 5) { toast.error("Maximum 5 files allowed"); return; }
              const validFiles = files.filter((file) => {
                if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} is too large (max 10MB)`); return false; }
                return true;
              });
              setTradeLicenses([...tradeLicenses, ...validFiles]);
            }}
            className="hidden" />
        </label>
        {tradeLicenses.length > 0 && (
          <div className="mt-3 space-y-2">
            {tradeLicenses.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2.5">
                  {file.type === "application/pdf" ? (
                    <div className="w-9 h-9 bg-red-50 border border-red-200 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 text-[10px] font-bold">PDF</span>
                    </div>
                  ) : (
                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-9 h-9 object-cover rounded flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-800 truncate max-w-[180px]">{file.name}</p>
                    <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button type="button" onClick={() => setTradeLicenses(tradeLicenses.filter((_, i) => i !== index))}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showMap && (
        <div>
          <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
            <FiMapPin className="inline" /> Shop Location on Map
          </label>
          <div ref={mapRef} className="w-full h-56 rounded-lg border border-gray-300" />
          <p className="text-xs text-gray-500 mt-1.5">Drag the marker to adjust your exact location</p>
        </div>
      )}
    </div>
  );

  const renderSubscriptionSelection = () => (
    <div className="space-y-6">
      {/* Billing Cycle */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "monthly", label: "Monthly" },
          { value: "quarterly", label: "3 Months", discount: "10%" },
          { value: "semiannual", label: "6 Months", discount: "15%" },
          { value: "annual", label: "12 Months", discount: "20%" },
        ].map((cycle) => (
          <button
            key={cycle.value} type="button" onClick={() => setBillingCycle(cycle.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              billingCycle === cycle.value ? "bg-slate-800 text-white border-slate-800" : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            {cycle.label}
            {cycle.discount && <span className="ml-1.5 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">{cycle.discount} off</span>}
          </button>
        ))}
      </div>

      {isLoadingPlans ? (
        <div className="flex items-center justify-center gap-3 py-12 text-gray-500">
          <span className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-transparent" />
          Loading plans…
        </div>
      ) : subscriptionPlans.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No subscription plans available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id} onClick={() => setSelectedPlan(plan.id)}
              className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPlan === plan.id ? "border-slate-800 bg-slate-50" : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-4 bg-slate-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase">Popular</span>
              )}
              {selectedPlan === plan.id && (
                <div className="absolute top-3 right-3"><BsCheckCircle className="w-5 h-5 text-slate-700" /></div>
              )}
              <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">${plan.price[billingCycle]}</span>
                <span className="text-gray-400 text-xs ml-1">/ {billingCycle === "quarterly" ? "3mo" : billingCycle === "semiannual" ? "6mo" : billingCycle === "annual" ? "year" : "mo"}</span>
              </div>
              <ul className="space-y-1.5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <FiCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPaymentChoice = () => (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">Choose when you'd like to pay for your subscription</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pay Now */}
        <div
          onClick={() => setPaymentChoice("now")}
          className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
            paymentChoice === "now" ? "border-slate-800 bg-slate-50" : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <BsCreditCard className="w-5 h-5 text-white" />
            </div>
            {paymentChoice === "now" && <BsCheckCircle className="w-5 h-5 text-slate-700" />}
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Pay Now</h3>
          <p className="text-sm text-gray-500 mb-3">Pay today and get activated faster after approval</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-center gap-1.5"><FiCheck className="text-emerald-500 flex-shrink-0" />Faster approval</li>
            <li className="flex items-center gap-1.5"><FiCheck className="text-emerald-500 flex-shrink-0" />Immediate activation</li>
            <li className="flex items-center gap-1.5"><FiCheck className="text-emerald-500 flex-shrink-0" />100% refund if declined</li>
          </ul>
        </div>

        {/* Pay Later */}
        <div
          onClick={() => setPaymentChoice("later")}
          className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
            paymentChoice === "later" ? "border-slate-800 bg-slate-50" : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
              <span className="text-lg">⏰</span>
            </div>
            {paymentChoice === "later" && <BsCheckCircle className="w-5 h-5 text-slate-700" />}
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Pay After Approval</h3>
          <p className="text-sm text-gray-500 mb-3">Register free, pay only after admin approves you</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-center gap-1.5"><FiCheck className="text-emerald-500 flex-shrink-0" />No payment now</li>
            <li className="flex items-center gap-1.5"><FiCheck className="text-emerald-500 flex-shrink-0" />Wait for approval first</li>
            <li className="flex items-center gap-1.5"><FiCheck className="text-emerald-500 flex-shrink-0" />Flexible payment options</li>
          </ul>
        </div>
      </div>

      {selectedPlan && (
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm">
          <div>
            <p className="font-semibold text-gray-900">{subscriptionPlans.find((p) => p.id === selectedPlan)?.name} Plan</p>
            <p className="text-gray-500">{billingCycle === "quarterly" ? "3 Months" : billingCycle === "semiannual" ? "6 Months" : billingCycle === "annual" ? "12 Months" : "Monthly"} billing</p>
          </div>
          <span className="text-xl font-bold text-gray-900">${getSelectedPlanPrice()}</span>
        </div>
      )}
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Complete Payment</h2>
        <p className="text-sm text-gray-500">Choose how you'd like to pay for your subscription</p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan</span>
            <span className="font-medium text-gray-800">{subscriptionPlans.find((p) => p.id === selectedPlan)?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Billing cycle</span>
            <span className="font-medium text-gray-800">
              {billingCycle === "quarterly" ? "3 Months" : billingCycle === "semiannual" ? "6 Months" : billingCycle === "annual" ? "12 Months" : "Monthly"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shop</span>
            <span className="font-medium text-gray-800">{formData.name}</span>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
          <span className="font-semibold text-gray-800">Total due</span>
          <span className="text-2xl font-bold text-gray-900">${getSelectedPlanPrice()}</span>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Select payment method</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod("paypal")}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
              paymentMethod === "paypal"
                ? "border-slate-800 bg-slate-800 text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
            }`}
          >
            <BsPaypal className="text-base" />
            PayPal
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentMethod("stripe");
              if (!stripeClientSecret) initializeStripePayment();
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
              paymentMethod === "stripe"
                ? "border-slate-800 bg-slate-800 text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
            }`}
          >
            <FiCreditCard className="text-base" />
            Credit / Debit Card
          </button>
        </div>
      </div>

      {/* PayPal Buttons */}
      {paymentMethod === "paypal" && (
        <div>
          <PayPalScriptProvider
            options={{
              "client-id": "AW3P72fNSIFlkCnT3gaKSxCKKaTL09YBLL3d45J5Uc7JaXCNrYJoUiza6OqL87Kj7Sg7UbufGwCrQ7yA",
              currency: "USD",
            }}
          >
            <PayPalButtons
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [{ amount: { value: getSelectedPlanPrice().toFixed(2) } }],
                });
              }}
              onApprove={handlePayPalApprove}
              onError={() => {
                toast.error("PayPal payment failed. Please try again.");
                setIsLoading(false);
              }}
            />
          </PayPalScriptProvider>
        </div>
      )}

      {/* Stripe Card Form */}
      {paymentMethod === "stripe" && (
        <div>
          {stripeInitError ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-red-600">Failed to load card payment. Please check your connection.</p>
              <button
                type="button"
                onClick={initializeStripePayment}
                className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : !stripeClientSecret || !stripePromise ? (
            <div className="flex items-center justify-center gap-3 py-8 text-gray-500">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-transparent" />
              <span className="text-sm">Initializing secure payment…</span>
            </div>
          ) : (
            <Elements stripe={stripePromise}>
              <StripeCardForm
                clientSecret={stripeClientSecret}
                onSuccess={handleSubmit}
                planPrice={getSelectedPlanPrice()}
              />
            </Elements>
          )}
        </div>
      )}

      <p className="text-center text-xs text-gray-400">
        🔒 All payments are secure and encrypted. 100% refund if shop is not approved.
      </p>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      {/* Check icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
          <FiCheck className="w-8 h-8 text-emerald-600" />
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Almost there!</h2>
        <p className="text-sm text-gray-500 mt-1">Review your details and submit your application</p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2 text-sm">
        {[{l:"Shop",v:formData.name},{l:"Email",v:formData.email},{l:"Phone",v:formData.phoneNumber},{l:"Plan",v:subscriptionPlans.find((p)=>p.id===selectedPlan)?.name},{l:"Payment",v:"Pay After Approval"}].map(({l,v})=>(
          <div key={l} className="flex justify-between">
            <span className="text-gray-500">{l}</span>
            <span className="font-medium text-gray-800 truncate max-w-[60%] text-right">{v}</span>
          </div>
        ))}
      </div>

      {/* Next steps */}
      <div className="border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">What happens next?</p>
        <ol className="space-y-2 text-sm text-gray-600">
          {["You'll receive an email verification link","Verify your email address","Admin reviews your application (within 48 hrs)","Once approved, complete your payment","Start selling!"].map((s,i)=>(
            <li key={i} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">{i+1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <button
        onClick={handleSubmit} disabled={isLoading}
        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Submitting…" : "Complete Registration"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img src="/logo (10).png" alt="Mall of Cayman" className="h-14 w-auto mx-auto object-contain" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Become a Seller</h1>
          <p className="text-sm text-gray-500 mt-1">Join thousands of successful sellers on our platform</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {[
            { num: 1, label: "Basics" },
            { num: 2, label: "Location" },
            { num: 3, label: "Plan" },
            { num: 4, label: "Payment" },
            { num: 5, label: paymentChoice === "now" ? "Pay" : "Confirm" },
          ].map((step, idx, arr) => (
            <React.Fragment key={step.num}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    currentStep > step.num
                      ? "bg-slate-800 text-white"
                      : currentStep === step.num
                      ? "bg-slate-800 text-white ring-4 ring-slate-200"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {currentStep > step.num ? <FiCheck className="w-4 h-4" /> : step.num}
                </div>
                <span className={`text-xs mt-1.5 font-medium hidden sm:block ${currentStep >= step.num ? "text-slate-700" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-all duration-300 ${currentStep > step.num ? "bg-slate-800" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Step header bar */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-base font-bold text-gray-800">
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Address & Location"}
              {currentStep === 3 && "Choose a Subscription Plan"}
              {currentStep === 4 && "Payment Timing"}
              {currentStep === 5 && paymentChoice === "now" && "Complete Payment"}
              {currentStep === 5 && paymentChoice !== "now" && "Confirm & Submit"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Step {currentStep} of 5
            </p>
          </div>

          {/* Form content */}
          <div className="p-6">{renderStep()}</div>

          {/* Navigation */}
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 && (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors duration-200 shadow-sm"
              >
                Continue
                <FiArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have a seller account?{" "}
          <Link to="/shop-login" className="text-slate-700 font-semibold hover:underline">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ShopCreateWithSubscription;
