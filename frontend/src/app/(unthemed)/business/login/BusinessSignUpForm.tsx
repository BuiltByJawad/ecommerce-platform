"use client";
import React, { useEffect } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import useAxios from "@/context/axiosContext";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../../redux";
import { setCurrentUser } from "../../../state";
import { useRouter } from "next/navigation";
import { withAutoReset } from "@/utils/formikHelpers";

const validationSchema = Yup.object({
  f_name: Yup.string().required("First Name is required"),
  l_name: Yup.string().required("Last Name is required"),
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required"),
  company_name: Yup.string().required("Company name is required"),
  tax_id: Yup.string()
    .required("Tax ID is required")
    .min(5, "Tax ID must be at least 5 characters"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9+\-() ]+$/, "Please enter a valid phone number"),
  address: Yup.string().required("Business address is required"),
  business_type: Yup.string().required("Business type is required"),
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
  company_name: string;
  tax_id: string;
  phone: string;
  address: string;
  business_type: string;
  password: string;
  confirmPassword: string;
};

type HandleRegister = (
  values: RegisterValues,
  formikHelpers: { resetForm: () => void }
) => Promise<void>;

interface BusinessSignUpFormProps {
  onLoadingChange?: (loading: boolean) => void;
}

const BusinessSignUpForm = ({ onLoadingChange }: BusinessSignUpFormProps) => {
  const { post, loading } = useAxios();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleRegister: HandleRegister = async (values, { resetForm }) => {
    try {
      const response = await post("/register-business", values);
      if (response?.status === 201) {
        toast.success("Business Registration Successful!", {
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
            router.push("/signup/activation");
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
        style: { width: "500px" },
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
        company_name: "",
        tax_id: "",
        phone: "",
        address: "",
        business_type: "",
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
          <div className="w-full grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="f_name"
                className="block text-sm font-medium text-gray-600"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <Field
                type="text"
                name="f_name"
                className={`w-full px-3 py-2 text-sm border rounded-lg ${
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
            <div>
              <label
                htmlFor="l_name"
                className="block text-sm font-medium text-gray-600"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <Field
                type="text"
                name="l_name"
                className={`w-full px-3 py-2 text-sm border rounded-lg ${
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
          </div>

          <div className="mb-4 w-full">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <Field
              type="email"
              name="email"
              className={`w-full px-3 py-2 text-sm border rounded-lg ${
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

                 <div className="w-full grid grid-cols-2 gap-4 mb-4">
            <div>
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
                className={`w-full px-3 py-2 text-sm border rounded-lg placeholder:text-gray-600 ${
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
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-600"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <Field
                type="password"
                name="confirmPassword"
                className={`w-full px-3 py-2 text-sm border rounded-lg ${
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
          </div>

          <div className="mb-4 w-full">
            <label
              htmlFor="company_name"
              className="block text-sm font-medium text-gray-600"
            >
              Company Name <span className="text-red-500">*</span>
            </label>
            <Field
              type="text"
              name="company_name"
              className={`w-full px-3 py-2 text-sm border rounded-lg ${
                errors.company_name && touched.company_name
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <ErrorMessage
              name="company_name"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>

          <div className="w-full grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="tax_id"
                className="block text-sm font-medium text-gray-600"
              >
                Tax ID <span className="text-red-500">*</span>
              </label>
              <Field
                type="text"
                name="tax_id"
                className={`w-full px-3 py-2 text-sm border rounded-lg ${
                  errors.tax_id && touched.tax_id
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="tax_id"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-600"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Field
                type="text"
                name="phone"
                className={`w-full px-3 py-2 text-sm border rounded-lg ${
                  errors.phone && touched.phone
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="phone"
                component="div"
                className="text-red-500 text-xs mt-1"
              />
            </div>
          </div>

          <div className="mb-4 w-full">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-600"
            >
              Business Address <span className="text-red-500">*</span>
            </label>
            <Field
              as="textarea"
              name="address"
              rows={2}
              className={`w-full px-3 py-2 text-sm border rounded-lg ${
                errors.address && touched.address
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <ErrorMessage
              name="address"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>

          <div className="mb-4 w-full">
            <label
              htmlFor="business_type"
              className="block text-sm font-medium text-gray-600"
            >
              Business Type <span className="text-red-500">*</span>
            </label>
            <Field
              as="select"
              name="business_type"
              className={`w-full px-3 py-2 text-sm border rounded-lg ${
                errors.business_type && touched.business_type
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">Select Business Type</option>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="distributor">Distributor</option>
              <option value="service_provider">Service Provider</option>
              <option value="other">Other</option>
            </Field>
            <ErrorMessage
              name="business_type"
              component="div"
              className="text-red-500 text-xs mt-1"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className={`w-full py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Register Business
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default BusinessSignUpForm;
