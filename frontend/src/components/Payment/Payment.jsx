import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { RxCross1 } from "react-icons/rx";
import { getProductImageUrl } from "../../utils/mediaUtils";
import { useCurrency } from "../../context/CurrencyContext";

const Payment = () => {
  const [orderData, setOrderData] = useState([]);
  const [open, setOpen] = useState(false);
  const [sellerPayPalEmail, setSellerPayPalEmail] = useState(null);
  const [sellerShopName, setSellerShopName] = useState("Shop");
  const [stripeLoading, setStripeLoading] = useState(false);
  const { user } = useSelector((state) => state.user);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    const orderData = JSON.parse(localStorage.getItem("latestOrder"));
    setOrderData(orderData);

    // Fetch seller's PayPal email if shopId exists
    if (orderData?.shopId) {
      fetchSellerPayPalEmail(orderData.shopId);
    }
  }, []);

  const fetchSellerPayPalEmail = async (shopId) => {
    try {
      const response = await axios.get(
        `${server}/shop/get-shop-info/${shopId}`
      );
      if (response.data.success && response.data.shop) {
        const shop = response.data.shop;
        setSellerPayPalEmail(shop.paypalEmail);
        setSellerShopName(shop.name);

        if (!shop.paypalEmail) {
          console.warn(
            "⚠️ Seller has not configured PayPal email. Payment will go to platform."
          );
          toast.warning(
            "Seller hasn't set up PayPal. Payment will be processed manually."
          );
        } else {
          console.log(`✅ Seller PayPal email found: ${shop.paypalEmail}`);
        }
      }
    } catch (error) {
      console.error("Error fetching seller PayPal email:", error);
      toast.warning(
        "Could not fetch seller payment info. Using default payment method."
      );
    }
  };

  // PayPal - Direct payment to seller
  const createOrder = (data, actions) => {
    const purchaseUnit = {
      description: `Order from ${sellerShopName}`,
      amount: {
        currency_code: "USD",
        value: orderData?.totalPrice,
      },
    };

    // If seller has PayPal email, send money DIRECTLY to seller
    if (sellerPayPalEmail) {
      purchaseUnit.payee = {
        email_address: sellerPayPalEmail,
      };
      console.log(
        `💰 Payment will go DIRECTLY to seller: ${sellerPayPalEmail}`
      );
    } else {
      console.log(`⚠️ No seller PayPal email - payment will go to platform`);
    }

    return actions.order
      .create({
        purchase_units: [purchaseUnit],
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
      })
      .then((orderID) => {
        return orderID;
      });
  };

  const order = {
    cart: orderData?.cart,
    shippingAddress: orderData?.shippingAddress,
    user: user && user,
    totalPrice: orderData?.totalPrice,
    subTotalPrice: orderData?.subTotalPrice,
    shippingPrice: orderData?.shipping,
    discountPrice: orderData?.discountPrice,
    tax: orderData?.tax || 0,
    // District-based delivery fields (Mall of Cayman)
    deliveryMethod: orderData?.deliveryMethod || "COLLECT",
    deliveryDistrict: orderData?.deliveryDistrict || null,
    deliveryFeeAmount: orderData?.deliveryFeeAmount || 0,
    deliveryProviderType: orderData?.deliveryProviderType || "VENDOR",
    pickupDetails: orderData?.pickupDetails || null,
  };

  const onApprove = async (data, actions) => {
    return actions.order.capture().then(function (details) {
      const { payer } = details;

      let paymentInfo = payer;

      if (paymentInfo !== undefined) {
        paypalPaymentHandler(paymentInfo);
      }
    });
  };

  const paypalPaymentHandler = async (paymentInfo) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    order.paymentInfo = {
      id: paymentInfo.payer_id,
      status: "succeeded",
      type: "Paypal",
    };

    await axios
      .post(`${server}/order/create-order`, order, config)
      .then((res) => {
        setOpen(false);
        // Store order data for success page
        localStorage.setItem(
          "latestOrderData",
          JSON.stringify({
            orders: res.data.orders,
            paymentMethod: res.data.paymentMethod,
            totalAmount: orderData?.totalPrice,
            user: user,
            timestamp: new Date().toISOString(),
          })
        );
        navigate("/order/success");
        toast.success("Order successful!");
        localStorage.setItem("cartItems", JSON.stringify([]));
        localStorage.setItem("latestOrder", JSON.stringify([]));
      });
  };

  const handleStripeCheckout = async () => {
    setStripeLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/payment/stripe/create-order-checkout-session`,
        {
          amount: orderData?.totalPrice,
          successUrl: `${window.location.origin}/stripe/order-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment`,
          metadata: {
            userId: user?._id?.toString() || "",
          },
        },
        { withCredentials: true }
      );
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to initiate Stripe payment"
      );
      setStripeLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
        <div className="w-full 800px:w-[65%]">
          <PaymentInfo
            user={user}
            open={open}
            setOpen={setOpen}
            onApprove={onApprove}
            createOrder={createOrder}
            onStripeCheckout={handleStripeCheckout}
            stripeLoading={stripeLoading}
          />
        </div>
        <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
          <CartData orderData={orderData} />
        </div>
      </div>
    </div>
  );
};

const PaymentInfo = ({ user, open, setOpen, onApprove, createOrder, onStripeCheckout, stripeLoading }) => {
  return (
    <div className="w-full 800px:w-[95%] bg-[#fff] rounded-md p-5 pb-8">
      {/* PayPal Payment Section */}
      <div>
        <div className="flex items-center gap-3 pb-4 border-b mb-4">
          <img
            src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_74x46.jpg"
            alt="PayPal"
            className="h-8"
          />
          <h4 className="text-[18px] font-[600] text-[#000000b1]">
            Pay with PayPal
          </h4>
        </div>

        {/* PayPal Info */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-[14px] text-blue-800 mb-2">
            <span className="font-semibold">Secure Payment:</span> Your payment
            is protected by PayPal's buyer protection.
          </p>
          <p className="text-[12px] text-blue-600">
            Pay using your PayPal balance, bank account, or credit/debit card
            through PayPal.
          </p>
        </div>

        {/* Pay Now Button */}
        <div className="w-full">
          <div
            className={`${styles.button} !bg-[#0070ba] hover:!bg-[#003087] text-white h-[50px] rounded-[5px] cursor-pointer text-[18px] font-[600] flex items-center justify-center gap-2 transition-all duration-200`}
            onClick={() => setOpen(true)}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.378 2.07.67 5.332-1.85 6.796-1.33.773-3.028 1.103-4.953 1.103H11.74l-1.05 6.67H5.97l-.063.4h4.063l.063-.4h1.93l1.05-6.67h2.07c3.14 0 5.53-.813 6.855-2.872.943-1.47 1.096-3.14.684-4.486z" />
            </svg>
            Pay Now with PayPal
          </div>
        </div>

        {/* PayPal Modal */}
        {open && (
          <div className="w-full fixed top-0 left-0 bg-[#00000039] h-screen flex items-center justify-center z-[99999]">
            <div className="w-full 800px:w-[40%] h-screen 800px:h-[80vh] bg-white rounded-[5px] shadow flex flex-col justify-center p-8 relative overflow-y-scroll">
              <div className="w-full flex justify-end p-3">
                <RxCross1
                  size={30}
                  className="cursor-pointer absolute top-5 right-3 hover:text-red-500 transition-colors"
                  onClick={() => setOpen(false)}
                />
              </div>
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Complete Your Payment
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Choose your preferred PayPal payment method
                </p>
              </div>
              <PayPalScriptProvider
                options={{
                  "client-id":
                    "AW3P72fNSIFlkCnT3gaKSxCKKaTL09YBLL3d45J5Uc7JaXCNrYJoUiza6OqL87Kj7Sg7UbufGwCrQ7yA",
                  currency: "USD",
                }}
              >
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  onApprove={onApprove}
                  createOrder={createOrder}
                />
              </PayPalScriptProvider>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="text-gray-400 text-sm font-medium">OR</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      {/* Stripe Payment Section */}
      <div>
        <div className="flex items-center gap-3 pb-4 border-b mb-4">
          <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 60 25" fill="currentColor">
            <path d="M59.64 14.28h-8.06v-2.46h8.06v2.46zm-8.06-4.1h8.06V7.72h-8.06v2.46zm0 8.2h8.06v-2.46h-8.06v2.46zM0 7.72h6.04c3.22 0 5.04 1.62 5.04 4.34 0 2.74-1.82 4.38-5.04 4.38H2.46v4.56H0V7.72zm2.46 6.54h3.36c1.72 0 2.68-.8 2.68-2.2 0-1.38-.96-2.16-2.68-2.16H2.46v4.36zm10.36-6.54h2.28v2.04c.54-1.36 1.66-2.22 3.26-2.22.2 0 .38.02.56.04v2.24a5.02 5.02 0 00-.82-.06c-1.72 0-3 1.1-3 3.28v5.96h-2.28V7.72zm11.4 6.28c.02 2.14 1.36 3.06 2.94 3.06 1.12 0 1.94-.42 2.52-1.14l1.62 1.28C30.28 18.54 28.9 19 27.24 19c-3.04 0-5.18-2-5.18-5.38 0-3.2 2.06-5.4 4.94-5.4 3.02 0 4.7 2.16 4.7 5.08 0 .26-.02.52-.04.7H24.22zm5.02-1.62c-.06-1.72-.96-2.72-2.4-2.72-1.42 0-2.44 1.02-2.6 2.72h5zm5.14-4.66h2.28v1.24c.52-.86 1.56-1.42 2.86-1.42 2.1 0 3.28 1.38 3.28 3.5V21h-2.28v-5.7c0-1.36-.62-2.08-1.8-2.08-1.22 0-2.06.82-2.06 2.24V21h-2.28V7.72z"/>
          </svg>
          <h4 className="text-[18px] font-[600] text-[#000000b1]">
            Pay with Card (Stripe)
          </h4>
        </div>

        <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
          <p className="text-[14px] text-indigo-800 mb-2">
            <span className="font-semibold">Secure Card Payment:</span> Pay
            directly with your credit or debit card via Stripe.
          </p>
          <p className="text-[12px] text-indigo-600">
            Visa, Mastercard, and other major cards accepted.
          </p>
        </div>

        <button
          onClick={onStripeCheckout}
          disabled={stripeLoading}
          className="w-full h-[50px] bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-[5px] text-[18px] font-[600] flex items-center justify-center gap-2 transition-all duration-200"
        >
          {stripeLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Redirecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Pay with Card
            </>
          )}
        </button>
      </div>

      {/* Security Note */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Your payment information is encrypted and secure</span>
        </div>
      </div>
    </div>
  );
};

const CartData = ({ orderData }) => {
  const { formatPrice } = useCurrency();
  const shipping =
    orderData?.shipping && !isNaN(orderData.shipping)
      ? Number(orderData.shipping).toFixed(2)
      : "0.00";

  return (
    <div className="w-full bg-[#fff] rounded-md p-5 pb-8">
      {/* Order Items Section */}
      {orderData?.cart && orderData.cart.length > 0 && (
        <div className="mb-6">
          <h3 className="text-[18px] font-[600] text-[#000000] mb-4">
            Order Items
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {orderData.cart.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 border border-[#00000010] rounded-lg"
              >
                {/* Product Image */}
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={getProductImageUrl(
                      item.images,
                      0,
                      process.env.REACT_APP_BACKEND_URL
                    )}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-md border border-[#00000010]"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/64x64/f0f0f0/999999?text=No+Image";
                    }}
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-[500] text-[#000] truncate">
                    {item.name}
                  </h4>

                  {/* Selected Attributes */}
                  {item.selectedAttributes &&
                    Object.keys(item.selectedAttributes).length > 0 && (
                      <div className="mt-1">
                        {Object.entries(item.selectedAttributes).map(
                          ([key, value]) => (
                            <span
                              key={key}
                              className="inline-block bg-[#f5f5f5] text-[#333] text-[12px] px-2 py-1 rounded-md mr-2 mb-1"
                            >
                              {key}: {value}
                            </span>
                          )
                        )}
                      </div>
                    )}

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[12px] text-[#666]">
                      Qty: {item.qty}
                    </span>
                    <div className="flex flex-col items-end">
                      {/* Show final price if available (when attributes have price variations) */}
                      {item.finalPrice ? (
                        <>
                          <span className="text-[14px] font-[600] text-[#f63b60]">
                            {formatPrice(item.finalPrice * item.qty)}
                          </span>
                          {item.finalPrice !== item.discountPrice && (
                            <span className="text-[12px] text-[#999] line-through">
                              {formatPrice(item.discountPrice * item.qty)}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[14px] font-[600] text-[#f63b60]">
                          {formatPrice(item.discountPrice * item.qty)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <hr className="my-4 border-[#00000010]" />
        </div>
      )}

      {/* Price Summary */}
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">subtotal:</h3>
        <h5 className="text-[18px] font-[600]">
          {formatPrice(
            orderData?.subTotalPrice && !isNaN(orderData.subTotalPrice)
              ? Number(orderData.subTotalPrice)
              : 0
          )}
        </h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">shipping:</h3>
        <h5 className="text-[18px] font-[600]">{formatPrice(shipping)}</h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
        <h5 className="text-[18px] font-[600]">
          {orderData?.discountPrice
            ? formatPrice(orderData.discountPrice)
            : "-"}
        </h5>
      </div>

      <div className="flex justify-between border-t pt-3 mt-3">
        <h3 className="text-[18px] font-[600] text-[#000000]">Total:</h3>
        <h5 className="text-[18px] font-[600]">
          {formatPrice(
            orderData?.totalPrice && !isNaN(orderData.totalPrice)
              ? Number(orderData.totalPrice)
              : 0
          )}
        </h5>
      </div>
      <br />
    </div>
  );
};

export default Payment;
