"use client";

import { useParams } from "next/navigation";
import ProductDetailContent from "../../../../components/client/ProductDetailContent";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : undefined;

  return <ProductDetailContent productId={id} />;
}
