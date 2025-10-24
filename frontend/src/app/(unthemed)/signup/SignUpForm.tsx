"use client";
import React, { useEffect } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import useAxios from "@/context/axiosContext";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../redux";
import { setCurrentUser } from "../../state";
import { useRouter } from "next/navigation";
import { withAutoReset } from "@/utils/formikHelpers";

const validationSchema = Yup.object({
  f_name: Yup.string().required("First Name is required"),
  l_name: Yup.string().required("Last Name is required"),
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

type RegisterValues = {
  f_name: string;
  l_name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type HandleRegister = (
  values: RegisterValues,
  formikHelpers: { resetForm: () => void }
) => Promise<void>;

interface SignUpFormProps {
  onLoadingChange?: (loading: boolean) => void;
}

const SignUpForm = ({ onLoadingChange }: SignUpFormProps) => {
  const { post, loading } = useAxios();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleRegister: HandleRegister = async (values, { resetForm }) => {
    try {
      const response = await post("/register", values);
      if (response?.status === 201) {
        toast.success("Registration Successful!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
          onClose: () => {
            resetForm();
            dispatch(setCurrentUser(response?.data?.data?.user));
            const userRole: string = response?.data?.data?.user?.role;
            if (userRole === "customer") {
              router.push("/signup/activation");
            } else {
              router.push("/dashboard");
            }
          },
        });
      }
    } catch (error: any) {
      onLoadingChange?.(false);
      const errorMessage =
        error?.response?.data?.data?.error ||
        "An error occurred during registration";
      toast.error(errorMessage, {
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
  };

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  return (
    <Formik
      initialValues={{
        f_name: "",
        l_name: "",
        email: "",
        password: "",
        confirmPassword: "",
      }}
      validationSchema={validationSchema}
      validateOnChange={true}
      validateOnBlur={false}
      onSubmit={withAutoReset(handleRegister)}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="flex flex-col items-center justify-center relative">
          <div className="mb-4">
            <label
              htmlFor="f_name"
              className="block text-sm font-medium text-gray-600"
            >
              First name <span className="text-red-500">*</span>
            </label>
            <Field
              type="text"
              name="f_name"
              className={`w-[270px] px-3 py-2 text-sm border rounded-lg ${
                errors.f_name && touched.f_name
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <ErrorMessage
              name="f_name"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="l_name"
              className="block text-sm font-medium text-gray-600"
            >
              Last name <span className="text-red-500">*</span>
            </label>
            <Field
              type="text"
              name="l_name"
              className={`w-[270px] px-3 py-2 text-sm border rounded-lg ${
                errors.l_name && touched.l_name
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <ErrorMessage
              name="l_name"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600"
            >
              Email address <span className="text-red-500">*</span>
            </label>
            <Field
              type="email"
              name="email"
              className={`w-[270px] px-3 py-2 text-sm border rounded-lg ${
                errors.email && touched.email
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <ErrorMessage
              name="email"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <Field
              type="password"
              name="password"
              placeholder="At least 8 characters"
              className={`w-[270px] px-3 py-2 text-sm border rounded-lg placeholder:text-gray-600 ${
                errors.password && touched.password
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <ErrorMessage
              name="password"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-600"
            >
              Confirm password <span className="text-red-500">*</span>
            </label>
            <Field
              type="password"
              name="confirmPassword"
              className={`w-[270px] px-3 py-2 text-sm border rounded-lg ${
                errors.confirmPassword && touched.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <ErrorMessage
              name="confirmPassword"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className={`w-[270px] py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Register
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default SignUpForm;
