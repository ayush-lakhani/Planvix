import { useState } from "react";
import { paymentAPI } from "../api/payment";
import { Loader2 } from "lucide-react";

export default function PaymentButton({ amount = 100, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create Order
      const data = await paymentAPI.createOrder(amount);
      
      // 2. Open Razorpay Checkout
      const options = {
        key: data.razorpay_key,
        amount: data.amount,
        currency: data.currency,
        name: "Demo SaaS Payment",
        description: "Test Transaction",
        order_id: data.order_id,
        handler: function (response) {
          // Success callback
          if (onSuccess) {
            onSuccess(response.razorpay_payment_id);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            if (onCancel) {
              onCancel();
            }
          },
        },
        theme: {
          color: "#4F46E5", // Indigo-600 to match Tailwind SaaS style
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
          alert("Payment Failed - Please try again.");
          setLoading(false);
          if (onCancel) onCancel();
      });
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initialize payment: " + error.message);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`w-full bg-indigo-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin mr-2 h-6 w-6" />
          Processing...
        </>
      ) : (
        `Pay ₹${amount}`
      )}
    </button>
  );
}
