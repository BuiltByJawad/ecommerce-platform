"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import useAxios from "@/context/axiosContext";
import { toast } from "react-toastify";

const PaymentPage = () => {
  const params = useParams();
  const router = useRouter();
  const { get } = useAxios();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await get(`/orders/${params.orderId}`);
        const order = response.data.data;

        // Check if order is already paid or processing
        if (order.paymentStatus === "completed") {
          toast.info("This order has already been paid.");
          router.push(`/order-confirmation/${params.orderId}`);
          return;
        }

        if (order.paymentStatus === "processing") {
          toast.info("Payment is already being processed.");
          router.push("/");
          return;
        }

        setOrderData(order);
      } catch (error) {
        setError("Order not found or invalid");
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.orderId) {
      fetchOrderData();
    }
  }, [params.orderId, router]);

  const initiatePayment = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/payment/sslcommerz-init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: params.orderId,
          orderData: {
            total: orderData.orderSummary.total,
            subtotal: orderData.orderSummary.itemsSubtotal,
            shipping: orderData.orderSummary.shipping,
          },
          customerData: {
            firstName: orderData.firstName,
            lastName: orderData.lastName,
            email: orderData.email,
            phone: orderData.phone,
            address: orderData.address,
            city: orderData.city,
            country: orderData.country,
          },
          orderItems: orderData.orderItems,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to SSLCommerz payment page
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.message || "Payment initialization failed");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Payment initialization failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">{error}</h2>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Complete Payment
            </h1>
            <p className="text-gray-600 mt-2">Order ID: {params.orderId}</p>
          </div>

          <div className="border rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>
                  ${orderData?.orderSummary?.itemsSubtotal?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${orderData?.orderSummary?.shipping?.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${orderData?.orderSummary?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <div className="border rounded-lg p-4">
              <div className="flex items-center">
                <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">SSLCommerz Payment Gateway</p>
                  <p className="text-sm text-gray-600">
                    Secure payment with credit/debit cards, mobile banking
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={initiatePayment}
            disabled={loading}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Payment
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
