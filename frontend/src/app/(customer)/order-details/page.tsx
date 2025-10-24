"use client";

import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { CreditCard, Lock } from "lucide-react";
import useAxios from "@/context/axiosContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/app/redux";
import { clearCart } from "@/app/state";

const checkoutValidationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  address: Yup.string().required("Street address is required"),
  city: Yup.string().required("Town / City is required"),
  country: Yup.string().required("Country is required"),
  phone: Yup.string().required("Phone number is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  orderNotes: Yup.string(),
  paymentMethod: Yup.string()
    .oneOf(["cod", "sslcommerz"], "Please select a valid payment method")
    .required("Please select a payment method"),
});

const OrderDetails = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { get, post } = useAxios();
  const { theme } = useTheme();
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [_isLoading, _setIsLoading] = useState(true);
  const cartItemsFromStore = useAppSelector((state) => state.global.cartItems);
  const cartItems = Object.values(cartItemsFromStore);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await get("/countries");
        setCountries(Array?.isArray(response?.data?.data?.countries) ? response?.data?.data?.countries : []);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        toast.error("Failed to load countries", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
        });
        setCountries([]);
      } finally {
        _setIsLoading(false);

      }
    };
    fetchCountries();
  }, []);

  // Calculate subtotal dynamically
  const itemsSubtotal = cartItems
    .reduce((total, item) => total + parseFloat(item?.product?.price || 0) * item.quantity, 0)
    .toFixed(2);

  // Get shipping rate for selected country
  const selectedCountryData = Array?.isArray(countries)
    ? countries?.find((country) => country?.country_name === selectedCountry)
    : null;
  const shippingRate = selectedCountryData ? parseFloat(selectedCountryData?.shipping_rate?.toString()) || 5.0 : 5.0;

  const order = {
    items: cartItems,
    summary: {
      itemsSubtotal: parseFloat(itemsSubtotal),
      shipping: shippingRate,
    },
  };
  const grandTotal = (order.summary.itemsSubtotal + order.summary.shipping).toFixed(2);

  const handleSSLCommerzPayment = async (orderData, customerData) => {
    try {
      const response = await post("/payments/initiate-ssl-commerz", {
        orderData: {
          total: parseFloat(grandTotal),
          subtotal: parseFloat(itemsSubtotal),
          shipping: shippingRate,
        },
        customerData,
        orderItems: cartItems.map((item) => ({
          productId: item?.product?._id,
          name: item?.product?.name,
          price: parseFloat(item?.product?.price || 0),
          quantity: item.quantity,
          subtotal: parseFloat(item?.product?.price || 0) * item.quantity,
        })),
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error("SSLCommerz payment error:", error);
      toast.error("Payment initialization failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    }
  };

  // Update your handlePlaceOrder function to handle SSLCommerz payments
  const handlePlaceOrder = async (values, { setSubmitting, resetForm }) => {
    setSelectedCountry(values.country);

    try {
      if (cartItems.length === 0) {
        toast.error("Cart is empty. Please add items to proceed.", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
        });
        return;
      }

      // If payment method is SSLCommerz, redirect to payment gateway
      if (values.paymentMethod === "sslcommerz") {
        await handleSSLCommerzPayment(
          {
            total: parseFloat(grandTotal),
            subtotal: parseFloat(itemsSubtotal),
            shipping: shippingRate,
          },
          values
        );
        return;
      }

      // Handle COD payments (existing code)
      const payload = {
        ...values,
        orderItems: cartItems.map((item) => ({
          productId: item?.product?._id,
          name: item?.product?.name,
          price: parseFloat(item?.product?.price || 0),
          quantity: item.quantity,
          subtotal: parseFloat(item?.product?.price || 0) * item.quantity,
        })),
        orderSummary: {
          itemsSubtotal: parseFloat(itemsSubtotal),
          shipping: shippingRate,
          total: parseFloat(grandTotal),
        },
      };

      const response = await post("/order-details/create", payload, {
        timeout: 10000,
      });

      if (response?.status === 201) {
        toast.success(`Order placed successfully!`, {
          position: "top-right",
          autoClose: 1000,
          theme: "light",
          onClose: () => {
            resetForm();
            dispatch(clearCart());
            router.push("/home");
          },
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.data?.error || "Failed to place order", {
        position: "top-right",
        autoClose: 1000,
        theme: "light",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme}`}>
      <div className="bg-white mt-5 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-300 relative">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              address: "",
              city: "",
              country: "",
              phone: "",
              email: "",
              orderNotes: "",
              paymentMethod: "cod",
            }}
            validationSchema={checkoutValidationSchema}
            onSubmit={handlePlaceOrder}
            validateOnChange={false}
            validateOnBlur={false}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Side: Billing and Notes */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Billing details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block font-medium mb-2 text-sm">
                          First name <span className="text-red-600">*</span>
                        </label>
                        <Field
                          type="text"
                          id="firstName"
                          name="firstName"
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
                        />
                        <ErrorMessage name="firstName" component="p" className="text-red-500 text-xs mt-1" />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block font-medium mb-2 text-sm">
                          Last name <span className="text-red-600">*</span>
                        </label>
                        <Field
                          type="text"
                          id="lastName"
                          name="lastName"
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
                        />
                        <ErrorMessage name="lastName" component="p" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="country" className="block font-medium mb-2 text-sm">
                        Country <span className="text-red-600">*</span>
                      </label>
                      <Field
                        as="select"
                        id="country"
                        name="country"
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white 
                        dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
                        onChange={(e) => {
                          setFieldValue("country", e.target.value);
                          setSelectedCountry(e.target.value);
                        }}
                      >
                        <option value="">Select Country</option>
                        {countries?.map((country) => (
                          <option key={country?._id || country?.country_name} value={country?.country_name}>
                            {country?.country_name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="country" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                    <div>
                      <label htmlFor="city" className="block font-medium mb-2 text-sm">
                        Town / City <span className="text-red-600">*</span>
                      </label>
                      <Field
                        type="text"
                        id="city"
                        name="city"
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
                      />
                      <ErrorMessage name="city" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                    <div>
                      <label htmlFor="address" className="block font-medium mb-2 text-sm">
                        Street address <span className="text-red-600">*</span>
                      </label>
                      <Field
                        type="text"
                        id="address"
                        name="address"
                        placeholder="House number and street name"
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
                      />
                      <ErrorMessage name="address" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block font-medium mb-2 text-sm">
                        Phone <span className="text-red-600">*</span>
                      </label>
                      <Field
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
                      />
                      <ErrorMessage name="phone" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block font-medium mb-2 text-sm">
                        Email address <span className="text-red-600">*</span>
                      </label>
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
                      />
                      <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                    <h2 className="text-2xl font-bold pt-8 text-gray-800 dark:text-white">Additional information</h2>
                    <div>
                      <label htmlFor="orderNotes" className="block font-medium mb-2 text-sm">
                        Order notes (optional)
                      </label>
                      <Field
                        as="textarea"
                        id="orderNotes"
                        name="orderNotes"
                        rows="4"
                        placeholder="Notes about your order, e.g. special notes for delivery."
                        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side: Order Summary & Payment */}
                <div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Your order</h2>
                    <div className="space-y-4">
                      <div className="flex justify-between font-semibold border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span>Product</span>
                        <span>Subtotal</span>
                      </div>
                      {cartItems?.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm border-b border-gray-200 dark:border-gray-700 pb-2"
                        >
                          <span>
                            {item?.product?.name} × {item?.quantity}
                          </span>
                          <span>${(parseFloat(item?.product?.price || 0) * item?.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold">
                        <span>Subtotal</span>
                        <span>${itemsSubtotal}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span>Shipping</span>
                        <span>${order.summary.shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${grandTotal}</span>
                      </div>
                    </div>
                    <div className="mt-8">
                      <ul className="space-y-2">
                        <li>
                          <label
                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                              values.paymentMethod === "cod"
                                ? "bg-blue-50 dark:bg-gray-800 border-blue-500"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            <Field
                              type="radio"
                              name="paymentMethod"
                              value="cod"
                              className="mr-4 h-4 w-4 focus:ring-blue-500 text-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                            <span className="font-semibold">Cash on delivery</span>
                          </label>
                          {values.paymentMethod === "cod" && (
                            <div className="p-4 mt-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-md">
                              Pay with cash upon delivery.
                            </div>
                          )}
                        </li>
                        <li>
                          <label
                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                              values.paymentMethod === "sslcommerz"
                                ? "bg-blue-50 dark:bg-gray-800 border-blue-500"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            <Field
                              type="radio"
                              name="paymentMethod"
                              value="sslcommerz"
                              className="mr-4 h-4 w-4 focus:ring-blue-500 text-blue-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                            />
                            <span className="font-semibold">Credit/Debit Card & Mobile Banking</span>
                            <CreditCard className="ml-auto text-gray-500 dark:text-gray-400" />
                          </label>
                          {values.paymentMethod === "sslcommerz" && (
                            <div className="p-4 mt-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-md">
                              Pay securely with credit card, debit card, or mobile banking via SSLCommerz.
                            </div>
                          )}
                        </li>
                      </ul>
                      <ErrorMessage name="paymentMethod" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-200 mt-6">
                      Your personal data will be used to process your order, support your experience throughout this
                      website, and for other purposes described in our{" "}
                      <Link href="#" className="font-semibold text-blue-400 hover:underline">
                        privacy policy
                      </Link>
                      .
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting || cartItems.length === 0}
                      className={`w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-3 px-4 rounded-lg shadow-sm flex items-center justify-center transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed ${
                        isSubmitting || cartItems.length === 0 ? "opacity-50" : ""
                      }`}
                    >
                      <Lock size={16} className="mr-2" />
                      {isSubmitting ? "Placing Order..." : "Place Order"}
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
