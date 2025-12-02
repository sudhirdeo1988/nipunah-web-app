/**
 * Razorpay Payment Utility
 * Handles payment flow with Razorpay (using dummy API for now)
 */

// Dummy API function to create order
const createDummyOrder = async (amount, currency, planId, planName) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return dummy order data
  return {
    id: `order_${Date.now()}_${planId}`,
    amount: amount * 100, // Convert to paise (Razorpay expects amount in smallest currency unit)
    currency: currency,
    receipt: `receipt_${Date.now()}`,
    status: "created",
    planId,
    planName,
  };
};

/**
 * Initialize Razorpay payment
 * @param {Object} options - Payment options
 * @param {number} options.amount - Amount in rupees
 * @param {string} options.currency - Currency code (default: INR)
 * @param {number} options.planId - Plan ID
 * @param {string} options.planName - Plan name
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onFailure - Failure callback
 * @param {Function} options.onShowGateway - Callback to show payment gateway modal (for dummy mode)
 */
export const initiateRazorpayPayment = async ({
  amount,
  currency = "INR",
  planId,
  planName,
  onSuccess,
  onFailure,
  onShowGateway,
}) => {
  try {
    // For dummy/testing: Show payment gateway modal
    // Set NEXT_PUBLIC_USE_DUMMY_PAYMENT=false to use actual Razorpay checkout
    // Default to dummy mode for now
    const useDummyPayment =
      process.env.NEXT_PUBLIC_USE_DUMMY_PAYMENT !== "false";

    // Create order using dummy API
    const orderData = await createDummyOrder(
      amount,
      currency,
      planId,
      planName
    );

    if (useDummyPayment) {
      console.log("Using dummy payment flow");
      // Show payment gateway modal if callback provided
      if (onShowGateway) {
        onShowGateway({
          orderData,
          amount,
          currency,
          planName,
          onSuccess,
          onFailure,
        });
      } else {
        // Fallback: simulate payment success after 2 seconds
        setTimeout(() => {
          const dummyResponse = {
            razorpay_payment_id: `pay_dummy_${Date.now()}`,
            razorpay_order_id: orderData.id,
            razorpay_signature: `sig_dummy_${Date.now()}`,
          };
          if (onSuccess) {
            onSuccess({
              ...dummyResponse,
              orderId: orderData.id,
              planId,
              planName,
              amount,
            });
          }
        }, 2000);
      }
      return;
    }

    // Check if Razorpay is loaded (only needed for actual payment)
    if (typeof window === "undefined" || !window.Razorpay) {
      throw new Error(
        "Razorpay SDK not loaded. Please wait a moment and try again."
      );
    }

    // Razorpay options
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy_key", // Dummy key for now
      amount: orderData.amount, // Amount in paise
      currency: orderData.currency,
      name: "Nipunah",
      description: `Payment for ${planName}`,
      order_id: orderData.id,
      handler: function (response) {
        // Handle successful payment
        console.log("Payment successful:", response);
        if (onSuccess) {
          onSuccess({
            ...response,
            orderId: orderData.id,
            planId,
            planName,
            amount,
          });
        }
      },
      prefill: {
        name: "", // Can be filled from user data
        email: "", // Can be filled from user data
        contact: "", // Can be filled from user data
      },
      notes: {
        planId: planId.toString(),
        planName: planName,
      },
      theme: {
        color: "#6366f1", // Customize color
      },
      modal: {
        ondismiss: function () {
          // Handle payment modal dismissal
          console.log("Payment cancelled by user");
          if (onFailure) {
            onFailure({ error: "Payment cancelled by user" });
          }
        },
      },
    };

    // Initialize Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.open();

    // Handle payment errors
    razorpay.on("payment.failed", function (response) {
      console.error("Payment failed:", response);
      if (onFailure) {
        onFailure({
          error: response.error?.description || "Payment failed",
          errorCode: response.error?.code,
        });
      }
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    if (onFailure) {
      onFailure({
        error: error.message || "Failed to initiate payment",
      });
    }
  }
};

/**
 * Load Razorpay script dynamically
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window object not available"));
      return;
    }

    // Check if script is already loaded
    if (window.Razorpay) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="razorpay"]');
    if (existingScript) {
      existingScript.addEventListener("load", resolve);
      existingScript.addEventListener("error", reject);
      return;
    }

    // Create and append script tag
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
};
