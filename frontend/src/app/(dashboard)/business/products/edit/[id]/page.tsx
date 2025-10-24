"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useAxios from "@/context/axiosContext";
import { Product } from "@/types/types";
import { toast } from "react-toastify";

const EditProductPage = () => {
  const params = useParams();
  const router = useRouter();
  const { get, put } = useAxios();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await get(`/products/mine/${productId}`);
        setProduct(res?.data?.data?.product || null);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to load product");
        router.push("/business/products");
      } finally {
        setLoading(false);
      }
    };
    if (productId) load();
  }, [productId, router]);

  // Form state covers commonly edited fields; mirrors backend updateProduct accepted fields
  const [form, setForm] = useState({
    name: "",
    price: "",
    discountedPrice: "",
    description: "",
    brand: "",
    color: "",
    material: "",
    compatibleDevices: "",
    screenSize: "",
    dimensions: "",
    batteryLife: "",
    sensorType: "",
    batteryDescription: "",
    features: "",
    isInStock: true,
  });
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        price: String(product.price ?? ""),
        discountedPrice: product.discountedPrice != null ? String(product.discountedPrice) : "",
        description: product.description || "",
        brand: product.brand || "",
        color: (product as any).color || "",
        material: (product as any).material || "",
        compatibleDevices: (product as any).compatibleDevices || "",
        screenSize: (product as any).screenSize || "",
        dimensions: (product as any).dimensions || "",
        batteryLife: (product as any).batteryLife || "",
        sensorType: (product as any).sensorType || "",
        batteryDescription: (product as any).batteryDescription || "",
        features: (product.features || []).join(", "),
        isInStock: !!product.isInStock,
      });
    }
  }, [product]);

  const statusBanner = useMemo(() => {
    if (!product) return null;
    const base = "px-3 py-2 mb-3 rounded text-sm";
    if (product.status === "pending") return <div className={`${base} bg-yellow-50 text-yellow-800`}>This product is pending review.</div>;
    if (product.status === "rejected") return <div className={`${base} bg-red-50 text-red-700`}>Rejected: {product.rejectionReason || "No reason provided"}</div>;
    return <div className={`${base} bg-green-50 text-green-700`}>Approved</div>;
  }, [product]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: form.name,
        price: form.price ? parseFloat(form.price) : undefined,
        discountedPrice: form.discountedPrice ? parseFloat(form.discountedPrice) : undefined,
        description: form.description,
        brand: form.brand,
        color: form.color || undefined,
        material: form.material || undefined,
        compatibleDevices: form.compatibleDevices || undefined,
        screenSize: form.screenSize || undefined,
        dimensions: form.dimensions || undefined,
        batteryLife: form.batteryLife || undefined,
        sensorType: form.sensorType || undefined,
        batteryDescription: form.batteryDescription || undefined,
        isInStock: form.isInStock,
        features: form.features
          ? form.features.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };
      await put(`/products/company/${productId}`, payload);
      toast.success("Saved. Product resubmitted for approval.");
      router.push("/business/products");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 dark:text-white">
        Loading...
      </div>
    );
  }
  if (!product) return null;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-lg sm:text-xl font-bold mb-2">Edit Product</h1>
      {statusBanner}
      <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">Category: {product?.category_name || (product?.category as any) || "N/A"}</div>
      <form onSubmit={onSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Brand</label>
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Price</label>
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border px-3 py-2 rounded" inputMode="decimal" />
          </div>
          <div>
            <label className="block text-sm mb-1">Discounted Price</label>
            <input value={form.discountedPrice} onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })} className="w-full border px-3 py-2 rounded" inputMode="decimal" />
          </div>
          <div>
            <label className="block text-sm mb-1">Color</label>
            <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Material</label>
            <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Compatible Devices</label>
            <input value={form.compatibleDevices} onChange={(e) => setForm({ ...form, compatibleDevices: e.target.value })} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Screen Size</label>
            <input value={form.screenSize} onChange={(e) => setForm({ ...form, screenSize: e.target.value })} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Dimensions</label>
            <input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Battery Life</label>
            <input value={form.batteryLife} onChange={(e) => setForm({ ...form, batteryLife: e.target.value })} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Sensor Type</label>
            <input value={form.sensorType} onChange={(e) => setForm({ ...form, sensorType: e.target.value })} className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Battery Description</label>
            <input value={form.batteryDescription} onChange={(e) => setForm({ ...form, batteryDescription: e.target.value })} className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Features (comma separated)</label>
            <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border px-3 py-2 rounded" rows={4} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input id="inStock" type="checkbox" checked={form.isInStock} onChange={(e) => setForm({ ...form, isInStock: e.target.checked })} />
          <label htmlFor="inStock" className="text-sm">In stock</label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
          <button type="button" onClick={() => router.push("/business/products")} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
        </div>
        {product?.imageUrls?.length ? (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 mb-2">Existing images</p>
            <div className="flex gap-2 flex-wrap">
              {product.imageUrls.map((u, i) => (
                <img key={i} src={u} alt="img" className="w-20 h-20 object-cover rounded" />
              ))}
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
};

export default EditProductPage;
