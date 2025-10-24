"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useAxios from "@/context/axiosContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const validationSchema = Yup.object({
  password: Yup.string().min(8, "Min 8 characters").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Required"),
});

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const { post } = useAxios();
  const token = (params?.token as string) || "";
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values: { password: string; confirmPassword: string }) => {
    setSubmitting(true);
    try {
      const res = await post("/reset-password", {
        token,
        newPassword: values.password,
      });
      if (res?.status === 200) {
        toast.success("Password reset successful. Please sign in.", { autoClose: 1500 });
        setTimeout(() => router.push("/signin"), 1600);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.data?.error || err?.response?.data?.error || "Reset failed",
        { autoClose: 3000 }
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Invalid reset link</div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="bg-gray-100 w-full min-h-screen flex items-center justify-center p-4">
        <div className="w-[450px] mx-auto px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
            <p className="text-sm text-center text-gray-500 mb-6">
              Enter a new password for your account.
            </p>
            <Formik
              initialValues={{ password: "", confirmPassword: "" }}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
              validateOnBlur={false}
              validateOnChange={false}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4 w-[300px] mx-auto">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      New Password
                    </label>
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm text-sm"
                    />
                    <ErrorMessage name="password" component="p" className="text-xs text-red-500 mt-1" />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                      Confirm Password
                    </label>
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Re-enter new password"
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm text-sm"
                    />
                    <ErrorMessage name="confirmPassword" component="p" className="text-xs text-red-500 mt-1" />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-60"
                    disabled={isSubmitting || submitting}
                  >
                    {isSubmitting || submitting ? "Resetting..." : "Reset Password"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
}
