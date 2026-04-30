const API_BASE = import.meta.env.VITE_API_URL || "";

export const paymentAPI = {
  createOrder: async (amount) => {
    const response = await fetch(`${API_BASE}/api/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create order");
    }

    return response.json();
  },

  /**
   * Confirm a successful Razorpay payment.
   * This updates the user's tier to 'pro' in MongoDB and
   * broadcasts a payment_received event to the admin dashboard.
   */
  confirmUpgrade: async (razorpay_payment_id, razorpay_order_id) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/api/confirm-upgrade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ razorpay_payment_id, razorpay_order_id }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to confirm upgrade");
    }

    return response.json();
  },
};
