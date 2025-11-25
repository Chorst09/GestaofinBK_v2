"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PriceSearchIndexPage() {
  const params = useParams();
  const router = useRouter();
  const renovationId = params.id as string;

  useEffect(() => {
    router.push(`/renovations/${renovationId}/price-search/web`);
  }, [renovationId, router]);

  return null;
}
