"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    // Redirect to create page with edit mode enabled via query param
    router.replace(`/admin/products/create?edit=${id}`);
  }, [id, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-4" />
        <p className="text-slate-600">Redirecting to edit mode...</p>
      </div>
    </div>
  );
}
