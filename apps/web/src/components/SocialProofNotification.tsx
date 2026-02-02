"use client";
import { useEffect, useState } from "react";

const purchases = [
  { name: "Sarah M.", product: "Organic Kale", location: "New York", time: "2 minutes ago" },
  { name: "Michael R.", product: "Quinoa 500g", location: "California", time: "5 minutes ago" },
  { name: "Emma L.", product: "Almond Butter", location: "Texas", time: "8 minutes ago" },
  { name: "James K.", product: "Baby Spinach", location: "Florida", time: "12 minutes ago" },
  { name: "Olivia P.", product: "Organic Kale", location: "Illinois", time: "15 minutes ago" },
];

export default function SocialProofNotification() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showInterval = setInterval(() => {
      setIsVisible(true);
      setCurrentIndex((prev) => (prev + 1) % purchases.length);
      
      setTimeout(() => setIsVisible(false), 5000);
    }, 8000);

    return () => clearInterval(showInterval);
  }, []);

  const purchase = purchases[currentIndex];

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 ${
        isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-sm backdrop-blur-lg">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-trust-green to-sprout-green rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {purchase.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 text-sm">{purchase.name}</span>
              <span className="text-xs text-gray-500">from {purchase.location}</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              just purchased <span className="font-semibold text-trust-green">{purchase.product}</span>
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {purchase.time}
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
