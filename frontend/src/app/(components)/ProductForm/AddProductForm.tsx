"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import ProductImageUpload from "../../(dashboard)/business/products/ProductImageUpload";
import { toast } from "react-toastify";
import useAxios from "../../../context/axiosContext";
import Select from "react-select";
import { AddProductFormProps, Category, Product } from "@/types/types";
import { ProductSubmitIcon } from "../Icons/Icons";
import { capitalize } from "@/utils/utils";

const AddProductForm: React.FC<AddProductFormProps> = ({ theme, router }) => {
  const { post, loading, get } = useAxios();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await get("/categories/all-categories");
        console.log(response);
        if (response?.status === 200) {
          setCategories(response?.data?.data?.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const productValidationSchema = (): Yup.ObjectSchema<Record<string, unknown>> => {
    type SchemaType = {
      [key: string]:
        | Yup.StringSchema
        | Yup.NumberSchema
        | Yup.BooleanSchema
        | Yup.ArraySchema<string>
        | Yup.ObjectSchema<any>;
    };
    const schema: SchemaType = {
      category: Yup.string().required("Category is required"),
      category_name: Yup.string().required("Category name is required"),
      name: Yup.string().required("Product name is required"),
      description: Yup.string().required("Description is required"),
      price: Yup.number().required("Price is required").min(0, "Price must be non-negative"),
      originalPrice: Yup.number()
        .required("Original price is required")
        .min(0, "Original Price must be non-negative")
        .moreThan(Yup.ref("price"), "Original price must be greater than current price"),
      discountedPrice: Yup.number()
        .positive("Discounted price must be positive")
        .lessThan(Yup.ref("price"), "Discounted price must be less than current price")
        .nullable(),
      brand: Yup.string().required("Brand is required"),
      features: Yup.array()
        .of(Yup.string().required("Feature cannot be empty"))
        .min(1, "At least one feature is required"),
      imageFiles: Yup.array()
        .of(
          Yup.object().shape({
            file: Yup.mixed().required("Image file is required"),
          })
        )
        .min(1, "At least one image is required"),
      isInStock: Yup.boolean().required("Stock status is required"),
      attributes: Yup.object()
        .required("Attributes are required")
        .test("non-empty", "At least one attribute is required", (value) => {
          return value && Object.keys(value).length > 0;
        })
        .test("valid-values", "Attribute values must be strings or string arrays", (value) => {
          if (!value) return false;
          return Object.values(value).every((val) =>
            Array.isArray(val) ? val.every((item) => typeof item === "string") : typeof val === "string"
          );
        }),
    };

    if (selectedCategory?.attributes) {
      schema.attributes = Yup.object().shape(
        selectedCategory.attributes.reduce((acc, attr) => {
          if (attr.required) {
            if (attr.type === "number") {
              acc[attr.name] = Yup.number()
                .required(`${attr.name} is required`)
                .typeError(`${attr.name} must be a number`);
            } else if (attr.type === "select") {
              acc[attr.name] = Yup.array()
                .of(Yup.string())
                .min(1, `At least one ${attr.name} must be selected`)
                .required(`${attr.name} is required`);
            } else {
              acc[attr.name] = Yup.string().required(`${attr.name} is required`);
            }
          }
          return acc;
        }, {} as any)
      );
    }

    return Yup.object(schema);
  };

  const initialValues: Product = {
    category: "",
    category_name: "",
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    discountedPrice: "",
    brand: "",
    features: [],
    imageFiles: [],
    isInStock: true,
    attributes: {},
    cloudinaryPublicIds: [],
  };

  const uploadSingleFile = async (file: File): Promise<{ url: string; publicId: string } | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "upload");

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/db3dox65k/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload ${file.name}`);
      return null;
    }
  };

  const handleSubmit = async (values: Product, { setSubmitting }: any) => {
    try {
      if (!values.imageFiles || values.imageFiles.length === 0) {
        toast.error("Please upload at least one product image");
        return;
      }

      const uploadPromises = values.imageFiles.map(async (image) => {
        return await uploadSingleFile(image.file);
      });

      const results = await Promise.allSettled(uploadPromises);
      const uploadedImages = results
        .filter(
          (
            result
          ): result is PromiseFulfilledResult<{
            url: string;
            publicId: string;
          }> => result.status === "fulfilled" && result.value !== null
        )
        .map((result) => result.value);

      if (uploadedImages.length === 0) {
        toast.error("Failed to upload images");
        return;
      }

      if (!values.attributes || Object.keys(values.attributes).length === 0) {
        toast.error("At least one attribute is required");
        return;
      }

      const productData = {
        ...values,
        category_name: selectedCategory?.name || "",
        imageFiles: uploadedImages,
        price: parseFloat(values.price.toString()),
        originalPrice: values.originalPrice ? parseFloat(values.originalPrice.toString()) : null,
        discountedPrice: values.discountedlPrice ? parseFloat(values.discountedlPrice.toString()) : null,
        attributes: values.attributes, // Send attributes as-is (object)
      };

      // Remove any undefined or null values
      (Object.keys(productData) as Array<keyof typeof productData>).forEach((key) => {
        if (productData[key] === undefined || productData[key] === null) {
          delete productData[key];
        }
      });

      const response = await post("/products/create", productData);

      if (response?.status === 201) {
        toast.success("Product Created Successfully!");
        // router.push("/products");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error?.response?.data?.data?.error ||
        error?.response?.data?.message ||
        "An error occurred during product creation";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const customSelectStyles: SelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
      backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
      boxShadow: state.isFocused ? `0 0 0 1px ${theme === "dark" ? "#60a5fa" : "#3b82f6"}` : "none",
      "&:hover": {
        borderColor: theme === "dark" ? "#6b7280" : "#9ca3af",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? theme === "dark"
          ? "#1e40af"
          : "#3b82f6"
        : state.isFocused
        ? theme === "dark"
          ? "#1f2937"
          : "#f3f4f6"
        : theme === "dark"
        ? "#1f2937"
        : "#ffffff",
      color: state.isSelected ? "#ffffff" : theme === "dark" ? "#f3f4f6" : "#1f2937",
      "&:hover": {
        backgroundColor: theme === "dark" ? "#1f2937" : "#f3f4f6",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
      border: `1px solid ${theme === "dark" ? "#4b5563" : "#d1d5db"}`,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#ffffff" : "#1f2937",
    }),
    input: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#ffffff" : "#1f2937",
    }),
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={productValidationSchema()}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, isSubmitting, setFieldValue }) => (
        <Form className={`space-y-6 ${theme} p-4 rounded-lg shadow-lg`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                Category <span className="text-red-500">*</span>
              </label>
              <Field
                as="select"
                name="category"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const categoryId = e.target.value;
                  setFieldValue("category", categoryId);
                  const selected = categories.find((cat) => cat._id === categoryId);
                  setSelectedCategory(selected || null);
                  setFieldValue("attributes", {});
                }}
              >
                <option value="">Select a category</option>
                {categories?.map((category) => (
                  <option key={category._id} value={category._id}>
                    {capitalize(category.name)}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="category" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                Product Name <span className="text-red-500">*</span>
              </label>
              <Field
                type="text"
                name="name"
                placeholder="Enter product name"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
              />
              <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label htmlFor="price" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                Price <span className="text-red-500">*</span>
              </label>
              <Field
                type="number"
                name="price"
                step="0.01"
                placeholder="Enter price"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
              />
              <ErrorMessage name="price" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label
                htmlFor="originalPrice"
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm"
              >
                Original Price
              </label>
              <Field
                type="number"
                name="originalPrice"
                step="0.01"
                placeholder="Enter original price"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
              />
              <ErrorMessage name="originalPrice" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label
                htmlFor="discountedPrice"
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm"
              >
                Discounted Price
              </label>
              <Field
                type="number"
                name="discountedPrice"
                step="0.01"
                placeholder="Enter discounted price"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
              />
              <ErrorMessage name="discountedPrice" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label htmlFor="brand" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                Brand <span className="text-red-500">*</span>
              </label>
              <Field
                type="text"
                name="brand"
                placeholder="Enter brand"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
              />
              <ErrorMessage name="brand" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            {selectedCategory?.attributes?.map((attr, index) => (
              <div key={index}>
                <label
                  htmlFor={`attributes[${attr.name}]`}
                  className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm"
                >
                  {capitalize(attr.name)}
                  {attr.required && <span className="text-red-500">*</span>}
                </label>
                {attr.type === "select" ? (
                  <Field
                    name={`attributes[${attr.name}]`}
                    render={({ field, form }: any) => (
                      <Select
                        {...field}
                        isMulti
                        options={attr.options?.map((option) => ({
                          value: option,
                          label: capitalize(option),
                        }))}
                        className="text-sm"
                        classNamePrefix="select"
                        styles={customSelectStyles}
                        placeholder={`Select ${capitalize(attr.name)}`}
                        onChange={(selectedOptions) => {
                          const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
                          form.setFieldValue(field.name, values);
                        }}
                        value={field.value?.map((val: string) => ({
                          value: val,
                          label: capitalize(val),
                        }))}
                      />
                    )}
                  />
                ) : (
                  <Field
                    type={attr.type}
                    name={`attributes[${attr.name}]`}
                    placeholder={`Enter ${capitalize(attr.name)}`}
                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors text-sm"
                  />
                )}
                <ErrorMessage name={`attributes[${attr.name}]`} component="p" className="text-red-500 text-xs mt-1" />
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
              Description <span className="text-red-500">*</span>
            </label>
            <Field
              as="textarea"
              name="description"
              rows={4}
              placeholder="Enter product description"
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
            />
            <ErrorMessage name="description" component="p" className="text-red-500 text-xs mt-1" />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
              Features <span className="text-red-500">*</span>
            </label>
            <FieldArray name="features">
              {({ push, remove }) => (
                <div className="space-y-2">
                  {values.features.map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Field
                        name={`features[${index}]`}
                        placeholder={`Enter feature ${index + 1}`}
                        className="flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
                      />
                      {values.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => push("")}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    Add Feature
                  </button>
                  <ErrorMessage name="features" component="p" className="text-red-500 text-xs mt-1" />
                </div>
              )}
            </FieldArray>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
              Product Images <span className="text-red-500">*</span>
            </label>
            <ProductImageUpload
              onChange={(imageData) => setFieldValue("imageFiles", imageData)}
              value={values.imageFiles}
              maxFiles={10}
              maxFileSize={5}
            />
            <ErrorMessage name="imageFiles" component="p" className="text-red-500 text-xs mt-1" />
            {values.imageFiles.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {values.imageFiles.length} image(s) selected
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Field
              type="checkbox"
              name="isInStock"
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="isInStock" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              In Stock
            </label>
            <ErrorMessage name="isInStock" component="p" className="text-red-500 text-xs" />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <ProductSubmitIcon /> <span>Creating Product...</span>
                </>
              ) : (
                <span>Add Product</span>
              )}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddProductForm;
("use client");

import React, { useEffect, useState } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import ProductImageUpload from "../../(dashboard)/business/products/ProductImageUpload";
import { toast } from "react-toastify";
import useAxios from "../../../context/axiosContext";
import Select from "react-select";
import { AddProductFormProps, Category, Product } from "@/types/types";
import { ProductSubmitIcon } from "../Icons/Icons";
import { capitalize } from "@/utils/utils";

const AddProductForm: React.FC<AddProductFormProps> = ({ theme, router }) => {
  const { post, loading, get } = useAxios();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await get("/categories/all-categories");
        console.log(response);
        if (response?.status === 200) {
          setCategories(response?.data?.data?.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const productValidationSchema = (): Yup.ObjectSchema<Record<string, unknown>> => {
    type SchemaType = {
      [key: string]:
        | Yup.StringSchema
        | Yup.NumberSchema
        | Yup.BooleanSchema
        | Yup.ArraySchema<string>
        | Yup.ObjectSchema<any>;
    };
    const schema: SchemaType = {
      category: Yup.string().required("Category is required"),
      category_name: Yup.string().required("Category name is required"),
      name: Yup.string().required("Product name is required"),
      description: Yup.string().required("Description is required"),
      price: Yup.number().required("Price is required").min(0, "Price must be non-negative"),
      originalPrice: Yup.number()
        .required("Original price is required")
        .min(0, "Original Price must be non-negative")
        .moreThan(Yup.ref("price"), "Original price must be greater than current price"),
      discountedPrice: Yup.number()
        .positive("Discounted price must be positive")
        .lessThan(Yup.ref("price"), "Discounted price must be less than current price")
        .nullable(),
      brand: Yup.string().required("Brand is required"),
      features: Yup.array()
        .of(Yup.string().required("Feature cannot be empty"))
        .min(1, "At least one feature is required"),
      imageFiles: Yup.array()
        .of(
          Yup.object().shape({
            file: Yup.mixed().required("Image file is required"),
          })
        )
        .min(1, "At least one image is required"),
      isInStock: Yup.boolean().required("Stock status is required"),
      attributes: Yup.object()
        .required("Attributes are required")
        .test("non-empty", "At least one attribute is required", (value) => {
          return value && Object.keys(value).length > 0;
        })
        .test("valid-values", "Attribute values must be strings or string arrays", (value) => {
          if (!value) return false;
          return Object.values(value).every((val) =>
            Array.isArray(val) ? val.every((item) => typeof item === "string") : typeof val === "string"
          );
        }),
    };

    if (selectedCategory?.attributes) {
      schema.attributes = Yup.object().shape(
        selectedCategory.attributes.reduce((acc, attr) => {
          if (attr.required) {
            if (attr.type === "number") {
              acc[attr.name] = Yup.number()
                .required(`${attr.name} is required`)
                .typeError(`${attr.name} must be a number`);
            } else if (attr.type === "select") {
              acc[attr.name] = Yup.array()
                .of(Yup.string())
                .min(1, `At least one ${attr.name} must be selected`)
                .required(`${attr.name} is required`);
            } else {
              acc[attr.name] = Yup.string().required(`${attr.name} is required`);
            }
          }
          return acc;
        }, {} as any)
      );
    }

    return Yup.object(schema);
  };

  const initialValues: Product = {
    category: "",
    category_name: "",
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    discountedPrice: "",
    brand: "",
    features: [],
    imageFiles: [],
    isInStock: true,
    attributes: {},
    cloudinaryPublicIds: [],
  };

  const uploadSingleFile = async (file: File): Promise<{ url: string; publicId: string } | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "upload");

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/db3dox65k/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload ${file.name}`);
      return null;
    }
  };

  const handleSubmit = async (values: Product, { setSubmitting }: any) => {
    try {
      if (!values.imageFiles || values.imageFiles.length === 0) {
        toast.error("Please upload at least one product image");
        return;
      }

      const uploadPromises = values.imageFiles.map(async (image) => {
        return await uploadSingleFile(image.file);
      });

      const results = await Promise.allSettled(uploadPromises);
      const uploadedImages = results
        .filter(
          (
            result
          ): result is PromiseFulfilledResult<{
            url: string;
            publicId: string;
          }> => result.status === "fulfilled" && result.value !== null
        )
        .map((result) => result.value);

      if (uploadedImages.length === 0) {
        toast.error("Failed to upload images");
        return;
      }

      if (!values.attributes || Object.keys(values.attributes).length === 0) {
        toast.error("At least one attribute is required");
        return;
      }

      const productData = {
        ...values,
        category_name: selectedCategory?.name || "",
        imageFiles: uploadedImages,
        price: parseFloat(values.price.toString()),
        originalPrice: values.originalPrice ? parseFloat(values.originalPrice.toString()) : null,
        discountedPrice: values.discountedlPrice ? parseFloat(values.discountedlPrice.toString()) : null,
        attributes: values.attributes, // Send attributes as-is (object)
      };

      // Remove any undefined or null values
      (Object.keys(productData) as Array<keyof typeof productData>).forEach((key) => {
        if (productData[key] === undefined || productData[key] === null) {
          delete productData[key];
        }
      });

      const response = await post("/products/create", productData);

      if (response?.status === 201) {
        toast.success("Product Created Successfully!");
        // router.push("/products");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error?.response?.data?.data?.error ||
        error?.response?.data?.message ||
        "An error occurred during product creation";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const customSelectStyles: SelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
      backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
      boxShadow: state.isFocused ? `0 0 0 1px ${theme === "dark" ? "#60a5fa" : "#3b82f6"}` : "none",
      "&:hover": {
        borderColor: theme === "dark" ? "#6b7280" : "#9ca3af",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? theme === "dark"
          ? "#1e40af"
          : "#3b82f6"
        : state.isFocused
        ? theme === "dark"
          ? "#1f2937"
          : "#f3f4f6"
        : theme === "dark"
        ? "#1f2937"
        : "#ffffff",
      color: state.isSelected ? "#ffffff" : theme === "dark" ? "#f3f4f6" : "#1f2937",
      "&:hover": {
        backgroundColor: theme === "dark" ? "#1f2937" : "#f3f4f6",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
      border: `1px solid ${theme === "dark" ? "#4b5563" : "#d1d5db"}`,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#ffffff" : "#1f2937",
    }),
    input: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#ffffff" : "#1f2937",
    }),
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={productValidationSchema()}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, isSubmitting, setFieldValue }) => (
        <Form className={`space-y-6 ${theme} p-4 rounded-lg shadow-lg`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                Category <span className="text-red-500">*</span>
              </label>
              <Field
                as="select"
                name="category"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const categoryId = e.target.value;
                  setFieldValue("category", categoryId);
                  const selected = categories.find((cat) => cat._id === categoryId);
                  setSelectedCategory(selected || null);
                  setFieldValue("attributes", {});
                }}
              >
                <option value="">Select a category</option>
                {categories?.map((category) => (
                  <option key={category._id} value={category._id}>
                    {capitalize(category.name)}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="category" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                Product Name <span className="text-red-500">*</span>
              </label>
              <Field
                type="text"
                name="name"
                placeholder="Enter product name"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
              />
              <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label htmlFor="price" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                Price <span className="text-red-500">*</span>
              </label>
              <Field
                type="number"
                name="price"
                step="0.01"
                placeholder="Enter price"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
              />
              <ErrorMessage name="price" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label
                htmlFor="originalPrice"
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm"
              >
                Original Price
              </label>
              <Field
                type="number"
                name="originalPrice"
                step="0.01"
                placeholder="Enter original price"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
              />
              <ErrorMessage name="originalPrice" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label
                htmlFor="discountedPrice"
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm"
              >
                Discounted Price
              </label>
              <Field
                type="number"
                name="discountedPrice"
                step="0.01"
                placeholder="Enter discounted price"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
              />
              <ErrorMessage name="discountedPrice" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label htmlFor="brand" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
                Brand <span className="text-red-500">*</span>
              </label>
              <Field
                type="text"
                name="brand"
                placeholder="Enter brand"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
              />
              <ErrorMessage name="brand" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            {selectedCategory?.attributes?.map((attr, index) => (
              <div key={index}>
                <label
                  htmlFor={`attributes[${attr.name}]`}
                  className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm"
                >
                  {capitalize(attr.name)}
                  {attr.required && <span className="text-red-500">*</span>}
                </label>
                {attr.type === "select" ? (
                  <Field
                    name={`attributes[${attr.name}]`}
                    render={({ field, form }: any) => (
                      <Select
                        {...field}
                        isMulti
                        options={attr.options?.map((option) => ({
                          value: option,
                          label: capitalize(option),
                        }))}
                        className="text-sm"
                        classNamePrefix="select"
                        styles={customSelectStyles}
                        placeholder={`Select ${capitalize(attr.name)}`}
                        onChange={(selectedOptions) => {
                          const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
                          form.setFieldValue(field.name, values);
                        }}
                        value={field.value?.map((val: string) => ({
                          value: val,
                          label: capitalize(val),
                        }))}
                      />
                    )}
                  />
                ) : (
                  <Field
                    type={attr.type}
                    name={`attributes[${attr.name}]`}
                    placeholder={`Enter ${capitalize(attr.name)}`}
                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors text-sm"
                  />
                )}
                <ErrorMessage name={`attributes[${attr.name}]`} component="p" className="text-red-500 text-xs mt-1" />
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
              Description <span className="text-red-500">*</span>
            </label>
            <Field
              as="textarea"
              name="description"
              rows={4}
              placeholder="Enter product description"
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
            />
            <ErrorMessage name="description" component="p" className="text-red-500 text-xs mt-1" />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
              Features <span className="text-red-500">*</span>
            </label>
            <FieldArray name="features">
              {({ push, remove }) => (
                <div className="space-y-2">
                  {values.features.map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Field
                        name={`features[${index}]`}
                        placeholder={`Enter feature ${index + 1}`}
                        className="flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition text-sm"
                      />
                      {values.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => push("")}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    Add Feature
                  </button>
                  <ErrorMessage name="features" component="p" className="text-red-500 text-xs mt-1" />
                </div>
              )}
            </FieldArray>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">
              Product Images <span className="text-red-500">*</span>
            </label>
            <ProductImageUpload
              onChange={(imageData) => setFieldValue("imageFiles", imageData)}
              value={values.imageFiles}
              maxFiles={10}
              maxFileSize={5}
            />
            <ErrorMessage name="imageFiles" component="p" className="text-red-500 text-xs mt-1" />
            {values.imageFiles.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {values.imageFiles.length} image(s) selected
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Field
              type="checkbox"
              name="isInStock"
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="isInStock" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              In Stock
            </label>
            <ErrorMessage name="isInStock" component="p" className="text-red-500 text-xs" />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <ProductSubmitIcon /> <span>Creating Product...</span>
                </>
              ) : (
                <span>Add Product</span>
              )}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddProductForm;
