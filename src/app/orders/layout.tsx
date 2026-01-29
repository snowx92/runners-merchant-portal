"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MessageDrawer } from "@/components/home/MessageDrawer";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {children}
      <MessageDrawer />
    </ProtectedRoute>
  );
}
