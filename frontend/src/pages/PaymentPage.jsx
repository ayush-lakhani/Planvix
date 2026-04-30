import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import PaymentButton from "../components/PaymentButton";
import { useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const [status, setStatus] = useState("idle"); // idle, success, cancelled
  const [paymentId, setPaymentId] = useState("");
  const navigate = useNavigate();

  const handleSuccess = (id) => {
    setPaymentId(id);
    setStatus("success");
  };

  const handleCancel = () => {
    setStatus("cancelled");
  };

  const handleRetry = () => {
    setStatus("idle");
    setPaymentId("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 transform hover:shadow-3xl border border-gray-100 dark:border-gray-700">
        
        <div className="p-8">
          {status === "idle" && (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mx-auto flex items-center justify-center mb-6">
                 <span className="text-3xl">💳</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Demo Payment</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Minimal Razorpay Integration</p>
              
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-8 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Test Product</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">₹100</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 flex flex-col gap-1 text-left">
                  <span>Card: <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">4111 1111 1111 1111</code></span>
                  <span>Any Future Expiry, CVV</span>
                  <span>OTP: <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">1234</code></span>
                </div>
              </div>

              <PaymentButton amount={100} onSuccess={handleSuccess} onCancel={handleCancel} />
            </div>
          )}

          {status === "success" && (
            <div className="text-center animate-slide-up">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto flex items-center justify-center mb-6">
                 <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Your transaction has been processed.</p>
              
              <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-4 py-3 rounded-lg mb-8 font-mono text-sm break-all font-medium border border-green-200 dark:border-green-800">
                ID: {paymentId}
              </div>

              <button 
                onClick={() => navigate("/")}
                className="w-full text-gray-600 dark:text-gray-300 font-bold py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors flex items-center justify-center group"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {status === "cancelled" && (
            <div className="text-center animate-slide-up">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto flex items-center justify-center mb-6">
                 <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Cancelled</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">You closed the checkout window.</p>
              
              <button 
                onClick={handleRetry}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
