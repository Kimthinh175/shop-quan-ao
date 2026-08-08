"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductDetailContent from "../../../components/client/ProductDetailContent";

function ProductQueryComponent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;

  return <ProductDetailContent productId={id} />;
}

export default function ProductQueryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f6] dark:bg-[#0B0B0B]" />}>
      <ProductQueryComponent />
    </Suspense>
  );
}