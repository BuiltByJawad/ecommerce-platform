"use client";

import React, { useRef } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useAxios from "@/context/axiosContext";
import { CategoryFormData, CategoryFormProps } from "@/types/types";
import { withAutoReset } from "@/utils/formikHelpers";

const validationSchema = Yup.object({
  name: Yup.string().required("Category name is required"),
  description: Yup.string().required("Description is required"),
  requiresApproval: Yup.boolean().required("Approval status is required"),
  allowedUsers: Yup.array().of(
    Yup.string().test("is-email-or-empty", "Invalid email address", function (value) {
      // If empty or whitespace only, it's valid (ignore it)
      if (!value || value.trim() === "") {
        return true;
      }
      // Otherwise, must be a valid email
      return Yup.string().email().isValidSync(value);
    })
  ),
  attributes: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required("Attribute name is required"),
        type: Yup.string()
          .oneOf(["text", "number", "select"], "Invalid attribute type")
          .required("Attribute type is required"),
        required: Yup.boolean().required("Required status is required"),
        options: Yup.array()
          .of(Yup.string().required("Option cannot be empty"))
          .when("type", {
            is: "select",
            then: (schema) => schema.min(1, "At least one option is required for select type"),
            otherwise: (schema) => schema.optional(),
          }),
      })
    )
    .min(1, "Please add at least one attribute."),
});

const AddCategoryForm: React.FC<CategoryFormProps> = ({ theme }) => {
  const router = useRouter();
  const { post, loading } = useAxios();
  const fieldRefs = useRef<(HTMLDivElement | null)[]>([]);
  const optionRefs = useRef<(HTMLDivElement | null)[][]>([]);

  const initialValues: CategoryFormData = {
    name: "",
    description: "",
    requiresApproval: false,
    allowedUsers: [],
    attributes: [],
  };

  const handleSubmit = async (values: CategoryFormData, { setSubmitting, resetForm }: any) => {
    try {
      const response = await post("/categories/create", values);

      if (response?.status === 201) {
        toast.success("Category Created Successfully!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "light",
        });
        resetForm();
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error?.response?.data?.data?.error ||
        error?.response?.data?.message ||
        "An error occurred during category creation";

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "light",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={withAutoReset(handleSubmit)}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, isSubmitting }) => (
        <Form className={`space-y-6 ${theme} p-4 rounded-lg shadow-lg`}>
          <div className="space-y-2">
            <label htmlFor="name" className="block font-semibold text-sm">
              Category Name <span className="text-red-500">*</span>
            </label>
            <Field
              type="text"
              name="name"
              placeholder="e.g., Watches, Shirts"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 shadow-sm hover:shadow-md text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700"
            />
            <ErrorMessage name="name" component="p" className="text-red-500 text-xs" />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block font-semibold text-sm">
              Description <span className="text-red-500">*</span>
            </label>
            <Field
              as="textarea"
              name="description"
              rows={3}
              placeholder="Enter category description"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 shadow-sm hover:shadow-md text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700"
            />
            <ErrorMessage name="description" component="p" className="text-red-500 text-xs" />
          </div>

          <div className="flex items-center space-x-3">
            <Field
              type="checkbox"
              name="requiresApproval"
              id="requiresApproval"
              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all duration-200 outline-none"
            />
            <label htmlFor="requiresApproval" className="font-semibold text-sm cursor-pointer">
              Requires Approval to List Products
            </label>
            <ErrorMessage name="requiresApproval" component="p" className="text-red-500 text-xs" />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-sm">Allowed Users (by email)</label>
            <FieldArray name="allowedUsers">
              {({ push, remove }) => (
                <div className="space-y-3">
                  {values.allowedUsers.map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 group w-full"
                      ref={(el) => (fieldRefs.current[index] = el)}
                    >
                      <Field
                        name={`allowedUsers[${index}]`}
                        placeholder={`Enter email ${index + 1}`}
                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 shadow-sm hover:shadow-md text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      push("");
                      setTimeout(() => {
                        const newIndex = values.allowedUsers.length;
                        fieldRefs.current[newIndex]?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                          inline: "nearest",
                        });
                      }, 0);
                    }}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-200 text-sm font-semibold"
                  >
                    Add User Email
                  </button>
                </div>
              )}
            </FieldArray>
          </div>

          {/* Category Attributes Section */}
          <div className="space-y-2">
            <label className="block font-semibold text-sm">
              Category Attributes (e.g., Color, Size, Model) <span className="text-red-500">*</span>
            </label>
            <FieldArray name="attributes">
              {({ push, remove }) => (
                <div className="space-y-4">
                  {values.attributes.map((attribute, index) => (
                    <div
                      key={index}
                      className="p-6 border border-gray-200 rounded-xl bg-gray-50 dark:bg-slate-800 space-y-4 transition-all duration-200 hover:shadow-md w-full"
                      ref={(el) => (fieldRefs.current[index + values.allowedUsers.length] = el)}
                    >
                      <div className="space-y-2">
                        <label htmlFor={`attributes[${index}].name`} className="block font-semibold text-sm">
                          Attribute Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name={`attributes[${index}].name`}
                          placeholder="e.g., Color, Size, Model"
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 shadow-sm hover:shadow-md text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700"
                        />
                        <ErrorMessage
                          name={`attributes[${index}].name`}
                          component="p"
                          className="text-red-500 text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor={`attributes[${index}].type`} className="block font-semibold text-sm">
                          Attribute Type <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          name={`attributes[${index}].type`}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 shadow-sm hover:shadow-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="select">Select (Dropdown)</option>
                        </Field>
                        <ErrorMessage
                          name={`attributes[${index}].type`}
                          component="p"
                          className="text-red-500 text-xs"
                        />
                      </div>

                      <div className="flex items-center space-x-3">
                        <Field
                          type="checkbox"
                          name={`attributes[${index}].required`}
                          id={`attributes[${index}].required`}
                          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all duration-200 outline-none"
                        />
                        <label
                          htmlFor={`attributes[${index}].required`}
                          className="font-semibold text-sm cursor-pointer"
                        >
                          Required
                        </label>
                        <ErrorMessage
                          name={`attributes[${index}].required`}
                          component="p"
                          className="text-red-500 text-xs"
                        />
                      </div>

                      {attribute.type === "select" && (
                        <div className="space-y-2">
                          <label className="block font-semibold text-sm">
                            Options <span className="text-red-500">*</span>
                          </label>
                          <FieldArray name={`attributes[${index}].options`}>
                            {({ push: pushOption, remove: removeOption }) => (
                              <div className="space-y-3">
                                {(attribute.options || []).map((_, optIndex) => (
                                  <div key={optIndex}>
                                    <div
                                      className="flex items-center space-x-3 group w-full"
                                      ref={(el) => {
                                        if (!optionRefs.current[index]) {
                                          optionRefs.current[index] = [];
                                        }
                                        optionRefs.current[index][optIndex] = el;
                                      }}
                                    >
                                      <Field
                                        name={`attributes[${index}].options[${optIndex}]`}
                                        placeholder={`Option ${optIndex + 1}`}
                                        className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-150 shadow-sm hover:shadow-md text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeOption(optIndex)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm font-semibold"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                    <ErrorMessage
                                      name={`attributes[${index}].options[${optIndex}]`}
                                      component="p"
                                      className="text-red-500 text-xs mt-1"
                                    />
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    pushOption("");
                                  }}
                                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-200 text-sm font-semibold"
                                >
                                  Add Option
                                </button>
                                <ErrorMessage
                                  name={`attributes[${index}].options`}
                                  render={(msg) =>
                                    typeof msg === "string" ? <p className="text-red-500 text-xs">{msg}</p> : null
                                  }
                                />
                              </div>
                            )}
                          </FieldArray>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm font-semibold"
                      >
                        Remove Attribute
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      push({
                        name: "",
                        type: "text",
                        required: false,
                        options: [],
                      });
                      setTimeout(() => {
                        const newIndex = values.attributes.length + values.allowedUsers.length;
                        fieldRefs.current[newIndex]?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                          inline: "nearest",
                        });
                      }, 0);
                    }}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-200 text-sm font-semibold"
                  >
                    Add Attribute
                  </button>
                  <ErrorMessage
                    name="attributes"
                    render={(msg) => (typeof msg === "string" ? <p className="text-red-500 text-xs">{msg}</p> : null)}
                  />
                </div>
              )}
            </FieldArray>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200 text-sm font-semibold flex items-center space-x-2"
            >
              {isSubmitting || loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Creating Category...</span>
                </>
              ) : (
                <span>Add Category</span>
              )}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddCategoryForm;
