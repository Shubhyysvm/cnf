"use client";

import React, { useMemo } from "react";
import { SyncManager } from "@/components/sync/SyncManager";
import { AdminApiClient } from "@countrynaturalfoods/admin-api-client";

export default function SyncPage() {
  const apiClient = useMemo(
    () => new AdminApiClient(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"),
    []
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SyncManager apiClient={apiClient} />
    </div>
  );
}
