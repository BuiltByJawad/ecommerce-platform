"use client";
import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import useAxios from "@/context/axiosContext";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import Loading from "@/app/loading";
import "react-toastify/dist/ReactToastify.css";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

export default function ForgotPassword() {
  const { post } = useAxios();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = async (values: { email: string }) => {
    setIsLoading(true);
    try {
      const response = await post("/forgot-password", values);
      if (response?.status === 200) {
        setEmailSent(true);
        toast.success("Password reset link sent to your email!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.data?.error || "Failed to send reset link",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <>
        <ToastContainer />
        <div className="bg-gray-100 w-full min-h-screen flex items-center justify-center p-4">
          <div className="w-[450px] mx-auto px-4">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-5xl text-green-600 mb-4">✉️</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Check Your Email
              </h1>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to your email address. Please
                check your inbox and follow the instructions.
              </p>
              <Link
                href="/signin"
                className="text-blue-500 font-medium hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      {isLoading ? (
        <Loading />
      ) : (
        <div className="bg-gray-100 w-full min-h-screen flex items-center justify-center p-4">
          <div className="w-[450px] mx-auto px-4">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
                Forgot Password?
              </h1>
              <p className="text-gray-500 text-center mb-6 text-sm">
                Enter your email address and we'll send you a link to reset
                your password.
              </p>
              <Formik
                initialValues={{ email: "" }}
                validationSchema={validationSchema}
                onSubmit={handleForgotPassword}
                validateOnChange={false}
                validateOnBlur={false}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4 w-[300px] mx-auto">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-gray-700 font-medium mb-2 text-sm"
                      >
                        Email Address
                      </label>
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        className="w-full px-3 py-1.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
                      />
                      <ErrorMessage
                        name="email"
                        component="p"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </motion.button>
                  </Form>
                )}
              </Formik>

              <p className="text-gray-600 text-center mt-6 text-sm">
                Remember your password?{" "}
                <Link
                  href="/signin"
                  className="text-blue-500 font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
