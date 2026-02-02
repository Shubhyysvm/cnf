"use client";
import { useState, useEffect } from "react";
import Container from "./Container";

export default function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-trust-green text-white text-sm">
        <Container className="py-2 flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            Free shipping over ₹4000 • Fresh organics delivered fast
          </div>
          <button aria-label="Close" className="px-2">
            ✕
          </button>
        </Container>
      </div>
    );
  }

  if (!open) return null;

  return (
    <div className="bg-trust-green text-white text-sm">
      <Container className="py-2 flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          Free shipping over ₹4000 • Fresh organics delivered fast
        </div>
        <button aria-label="Close" className="px-2" onClick={() => setOpen(false)}>
          ✕
        </button>
      </Container>
    </div>
  );
}
