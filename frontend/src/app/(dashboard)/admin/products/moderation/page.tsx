"use client";

import React, { useCallback, useEffect, useState } from "react";
import useAxios from "@/context/axiosContext";
import { Product } from "@/types/types";
import Image from "next/image";
import { toast } from "react-toastify";

const ModerationPage: React.FC = () => {
  const { get, put } = useAxios();
  const [pending, setPending] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPending = useCallback(async () => {
    try {
      const res = await get("/products/moderation/pending");
      setPending(res?.data?.data?.products || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load pending products");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadPending();
      setIsLoading(false);
    })();
  }, [loadPending]);

  const approve = async (id: string) => {
    try {
      await put(`/products/moderation/approve/${id}`, {});
      setPending((prev) => prev.filter((p) => p._id !== id));
      toast.success("Approved");
    } catch (e) {
      console.error(e);
      toast.error("Approve failed");
    }
  };

  const reject = async (id: string) => {
    const reason = window.prompt("Enter rejection reason (optional):") || "";
    try {
      await put(`/products/moderation/reject/${id}`, { reason });
      setPending((prev) => prev.filter((p) => p._id !== id));
      toast.success("Rejected");
    } catch (e) {
      console.error(e);
      toast.error("Reject failed");
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg sm:text-xl font-bold">Moderation Queue</h1>
        <span className="text-sm text-gray-500">{pending.length} pending</span>
      </div>

      {pending.length === 0 ? (
        <div className="p-6 bg-white dark:bg-gray-800 rounded shadow">No pending products.</div>
      ) : (
        <div className="grid gap-3">
          {pending.map((p) => (
            <div key={p._id} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded shadow">
              <Image
                src={p.imageUrls?.[0] || "/images/placeholder.jpg"}
                alt={p.name}
                width={64}
                height={64}
                className="rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium truncate max-w-[320px]">{p.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">pending</span>
                </div>
                <div className="text-xs text-gray-500">
                  {p.brand} • {p.category_name} • ${Number(p.price).toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => approve(p._id!)}
                  className="px-3 py-1.5 rounded bg-green-600 text-white text-sm hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => reject(p._id!)}
                  className="px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerationPage;
