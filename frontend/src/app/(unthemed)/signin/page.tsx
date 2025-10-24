"use client";
import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import useAxios from "@/context/axiosContext";
import { useAppDispatch } from "../../redux";
import { setCurrentUser } from "../../state";

export default function Login() {
  const { post } = useAxios();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleLogin = useCallback(async (values) => {
    try {
      const response = await post("/login", values);
      if (response?.status === 200) {
        toast.dismiss();
        toast.success(`Logging in...`, {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
          onClose: () => {
            dispatch(setCurrentUser(response?.data?.data?.user));
            if (response?.data?.data?.user?.role === "admin") {
              router.push("/admin");
            } else if (response?.data?.data?.user?.role === "company") {
              router.push("/business");
            } else if (response?.data?.data?.user?.role === "customer") {
              router.push("/home");
            }
          },
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.data?.error, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }, [post, dispatch, router]);

  return (
    <>
      <div className="bg-gray-100 w-full min-h-screen flex items-center justify-center bg-gradient-to-br p-4">
        <ToastContainer />
        <div className="w-[400px] mx-auto px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-gray-800 text-center">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-center mb-6 text-sm text-nowrap">
              Login to your account and continue your shopping!
            </p>
            <Formik
              initialValues={{ email: "", password: "", rememberMe: false }}
              validationSchema={validationSchema}
              onSubmit={handleLogin}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4 w-[300px] mx-auto">
                  {/* Email Input */}
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

                  {/* Password Input */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-gray-700 font-medium mb-2 text-sm"
                    >
                      Password
                    </label>
                    <Field
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      className="w-full px-3 py-1.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
                    />
                    <ErrorMessage
                      name="password"
                      component="p"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Forgot Password */}
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href="/forgot-password"
                      className="text-blue-500 text-sm hover:underline focus:ring-2 focus:ring-blue-500"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Login Button */}
                  <motion.button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </motion.button>
                </Form>
              )}
            </Formik>
            {/* Sign Up Link */}
            <p className="text-gray-600 text-center mt-6 text-sm">
              Don’t have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-500 font-medium text-sm hover:underline focus:ring-2 focus:ring-blue-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
