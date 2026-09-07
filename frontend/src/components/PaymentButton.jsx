import React, { useState, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { CreditCard } from 'lucide-react';

// Utility to load Razorpay script dynamically
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentButton = ({ courseId, coursePrice, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const displayRazorpay = async () => {
    if (!user) {
      toast.error('Please login to purchase this course');
      return;
    }

    setLoading(true);
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order on the backend
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data: orderData } = await axios.post(
        '/api/payments/create-order',
        { courseId },
        config
      );

      if (!orderData.success) {
        toast.error('Failed to create order');
        setLoading(false);
        return;
      }

      // 2. Options for Razorpay popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy', // fallback for testing
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'NexusAI Platform',
        description: 'Course Purchase',
        order_id: orderData.data.id,
        handler: async function (response) {
          // 3. Verify payment on the backend
          try {
            const verifyRes = await axios.post(
              '/api/payments/verify',
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                courseId
              },
              config
            );
            
            if (verifyRes.data.success) {
              toast.success('Payment successful! Welcome to the course.');
              if (onSuccess) onSuccess();
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#3b82f6', // primary color
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Something went wrong during payment initialization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={displayRazorpay}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></span>
      ) : (
        <>
          <CreditCard size={18} />
          Enroll Now - ${coursePrice}
        </>
      )}
    </button>
  );
};

export default PaymentButton;
