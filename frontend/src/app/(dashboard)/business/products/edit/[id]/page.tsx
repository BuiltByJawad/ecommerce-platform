"use client";

import { useParams, useRouter } from "next/navigation";
import {
  getMockProductById,
  ProductFormData,
} from "../../ProductData";
import { useEffect, useState } from "react";

interface LocalProductFormProps {
  isEditingForm: boolean;
  initialDataForForm: ProductFormData;
  onFormSubmit: (formData: FormData, productData: ProductFormData) => void;
  onDeleteProduct: (id: string) => void;
}

const ProductForm: React.FC<LocalProductFormProps> = ({
  isEditingForm,
  initialDataForForm,
  onFormSubmit,
  onDeleteProduct,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    onFormSubmit(fd, initialDataForForm);
  };
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded">
      <h2 className="text-lg font-semibold mb-2">
        {isEditingForm ? "Edit Product" : "Create Product"}
      </h2>
      <p className="text-sm mb-4">Name: {initialDataForForm.name}</p>
      <div className="flex gap-2">
        <button onClick={handleSubmit as any} className="px-3 py-2 bg-blue-600 text-white rounded">
          Save
        </button>
        {initialDataForForm.id && (
          <button
            onClick={() => onDeleteProduct(initialDataForForm.id!)}
            className="px-3 py-2 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

const EditProductPage = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [productToEdit, setProductToEdit] = useState<
    ProductFormData | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      // Simulate API call
      setLoading(true);
      const fetchedProduct = getMockProductById(productId);
      if (fetchedProduct) {
        setProductToEdit(fetchedProduct);
      } else {
        // Handle product not found, e.g., redirect or show error
        alert("Mock: Product not found!");
        router.push("/products");
      }
      setLoading(false);
    }
  }, [productId, router]);

  const handleUpdateProduct = (
    formData: FormData,
    productData: ProductFormData
  ) => {
    // In a real app, you would send this to your API
    console.log(`Updating product ID: ${productData.id} (FormData):`);
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    console.log("Product Data Object:", productData);
    alert(`Mock: Product "${productData.name}" updated successfully!`);
    // You might want to update the product in a global state or re-fetch list
    router.push("/products"); // Navigate back to the product list
  };

  const handleDeleteExistingProduct = (id: string) => {
    console.log("Deleting product ID:", id);
    alert(`Mock: Product with ID "${id}" deleted!`);
    // You might want to remove the product from a global state or re-fetch list
    router.push("/products");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 dark:text-white">
        Loading product data...
      </div>
    );
  }

  if (!productToEdit) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 dark:text-white">
        Product not found. You will be redirected.
      </div>
    );
  }

  return (
    <ProductForm
      isEditingForm={true}
      initialDataForForm={productToEdit}
      onFormSubmit={handleUpdateProduct}
      onDeleteProduct={handleDeleteExistingProduct}
    />
  );
};

export default EditProductPage;
