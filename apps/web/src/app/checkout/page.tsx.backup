"use client";

import { useState, useEffect } from "react";
import Container from "@/components/Container";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Package, 
  CreditCard, 
  MapPin, 
  ArrowRight, 
  Lock, 
  Truck,
  Tag,
  Shield,
  CheckCircle2,
  Phone,
  Mail,
  Home,
  Clock,
  Gift,
  Percent,
  Wallet,
  Banknote,
  User,
  Calendar
} from "lucide-react";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<"shipping" | "payment" | "review">("shipping");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [saveInfo, setSaveInfo] = useState(false);

  const [shippingForm, setShippingForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod" | "netbanking">("card");
  const [selectedDeliverySpeed, setSelectedDeliverySpeed] = useState<"standard" | "express">("standard");

  const subtotal = cart.subtotal;
  const freeShippingThreshold = 4000;
  const deliveryCharge = selectedDeliverySpeed === "express" ? 150 : (subtotal >= freeShippingThreshold ? 0 : 500);
  const tax = subtotal * 0.08; // 8% GST
  const discount = promoDiscount;
  const total = subtotal + deliveryCharge + tax - discount;

  // Estimated delivery dates
  const today = new Date();
  const standardDelivery = new Date(today);
  standardDelivery.setDate(today.getDate() + 5);
  const expressDelivery = new Date(today);
  expressDelivery.setDate(today.getDate() + 2);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }
    
    setIsApplyingPromo(true);
    // Simulate API call
    setTimeout(() => {
      // Mock promo codes
      const validPromos: Record<string, number> = {
        "WELCOME10": 0.10,
        "SAVE20": 0.20,
        "ORGANIC15": 0.15,
      };

      const discountPercent = validPromos[promoCode.toUpperCase()];
      if (discountPercent) {
        const discountAmount = subtotal * discountPercent;
        setPromoDiscount(discountAmount);
        toast.success(`Promo applied! You saved ₹${discountAmount.toFixed(2)} 🎉`);
      } else {
        toast.error("Invalid promo code");
      }
      setIsApplyingPromo(false);
    }, 800);
  };

  const validateShippingForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip'];
    for (const field of required) {
      if (!shippingForm[field as keyof typeof shippingForm]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingForm.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    
    // Phone validation (10 digits for India)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(shippingForm.phone.replace(/\D/g, ''))) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    
    return true;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateShippingForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const sessionId = localStorage.getItem("cart-session-id");
      const response = await fetch("http://localhost:3001/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId || "anonymous",
        },
        body: JSON.stringify({
          ...shippingForm,
          paymentMethod,
          deliverySpeed: selectedDeliverySpeed,
          promoCode: promoCode || undefined,
          discount: promoDiscount,
          saveInfo,
        }),
      });

      if (!response.ok) throw new Error("Failed to place order");

      const data = await response.json();
      
      toast.success("Order placed successfully! 🎉", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#2E7D32",
          color: "#fff",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "16px",
        },
      });

      // Clear cart (if using context method)
      // clearCart();

      // Redirect to order confirmation
      router.push(`/order-confirmation?orderNumber=${data.orderNumber}`);
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error("Failed to place order. Please try again.", {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <main className="pt-28 pb-16">
        <Container>
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some products before checking out</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-trust-green text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Shop Now
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <Container>
        {/* Header with breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-trust-green transition">Home</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-trust-green transition">Cart</Link>
            <span>/</span>
            <span className="text-trust-green font-semibold">Checkout</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-trust-green to-green-600 bg-clip-text text-transparent">
                Secure Checkout
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Lock className="w-4 h-4 text-trust-green" />
                Your information is safe and encrypted
              </p>
            </div>
            <Link
              href="/cart"
              className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-trust-green hover:text-trust-green transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Cart
            </Link>
          </div>
        </div>

        {/* Enhanced Progress Steps */}
        <div className="relative flex items-center justify-between max-w-2xl mx-auto mb-12">
          {/* Step 1 - Shipping */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                step === "shipping"
                  ? "bg-gradient-to-br from-trust-green to-green-600 text-white shadow-lg shadow-trust-green/30 scale-110"
                  : step === "payment" || step === "review"
                  ? "bg-gradient-to-br from-trust-green to-green-600 text-white"
                  : "bg-white border-2 border-gray-300 text-gray-400"
              }`}
            >
              {step === "payment" || step === "review" ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <MapPin className="w-6 h-6" />
              )}
            </div>
            <div className="mt-3 text-center">
              <p className={`text-sm font-bold ${step === "shipping" ? "text-trust-green" : "text-gray-700"}`}>
                Shipping
              </p>
              <p className="text-xs text-gray-500">Address details</p>
            </div>
          </div>

          {/* Connector Line */}
          <div className="absolute top-7 left-0 right-0 h-1 bg-gray-200 -z-0" style={{ width: 'calc(100% - 7rem)', left: '3.5rem' }}>
            <div
              className={`h-full bg-gradient-to-r from-trust-green to-green-600 transition-all duration-500 ${
                step === "payment" ? "w-1/2" : step === "review" ? "w-full" : "w-0"
              }`}
            />
          </div>

          {/* Step 2 - Payment */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                step === "payment"
                  ? "bg-gradient-to-br from-trust-green to-green-600 text-white shadow-lg shadow-trust-green/30 scale-110"
                  : step === "review"
                  ? "bg-gradient-to-br from-trust-green to-green-600 text-white"
                  : "bg-white border-2 border-gray-300 text-gray-400"
              }`}
            >
              {step === "review" ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <CreditCard className="w-6 h-6" />
              )}
            </div>
            <div className="mt-3 text-center">
              <p className={`text-sm font-bold ${step === "payment" ? "text-trust-green" : "text-gray-700"}`}>
                Payment
              </p>
              <p className="text-xs text-gray-500">Choose method</p>
            </div>
          </div>

          {/* Step 3 - Review */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                step === "review"
                  ? "bg-gradient-to-br from-trust-green to-green-600 text-white shadow-lg shadow-trust-green/30 scale-110"
                  : "bg-white border-2 border-gray-300 text-gray-400"
              }`}
            >
              <Package className="w-6 h-6" />
            </div>
            <div className="mt-3 text-center">
              <p className={`text-sm font-bold ${step === "review" ? "text-trust-green" : "text-gray-700"}`}>
                Review
              </p>
              <p className="text-xs text-gray-500">Confirm order</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {step === "shipping" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-trust-green/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-trust-green" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
                    <p className="text-sm text-gray-600">Where should we deliver your order?</p>
                  </div>
                </div>

                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={shippingForm.firstName}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, firstName: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={shippingForm.lastName}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, lastName: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={shippingForm.email}
                      onChange={(e) =>
                        setShippingForm({ ...shippingForm, email: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition"
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingForm.phone}
                      onChange={(e) =>
                        setShippingForm({ ...shippingForm, phone: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition"
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={shippingForm.address}
                      onChange={(e) =>
                        setShippingForm({ ...shippingForm, address: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition"
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Apartment, Suite, etc. (Optional)
                    </label>
                    <input
                      type="text"
                      value={shippingForm.apartment}
                      onChange={(e) =>
                        setShippingForm({ ...shippingForm, apartment: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition"
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingForm.city}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, city: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition"
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingForm.state}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, state: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition"
                        placeholder="NY"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={shippingForm.zip}
                        onChange={(e) =>
                          setShippingForm({ ...shippingForm, zip: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition"
                        placeholder="10001"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep("payment")}
                    className="w-full bg-trust-green text-white py-3.5 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-6"
                  >
                    Continue to Payment
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-trust-green/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-trust-green" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                    <p className="text-sm text-gray-600">Choose how you'd like to pay</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      paymentMethod === "card"
                        ? "border-trust-green bg-trust-green/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-gray-700" />
                        <span className="font-semibold text-gray-900">Credit / Debit Card</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="text-xs font-bold text-gray-500">VISA</div>
                        <div className="text-xs font-bold text-gray-500">MC</div>
                        <div className="text-xs font-bold text-gray-500">AMEX</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("paypal")}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      paymentMethod === "paypal"
                        ? "border-trust-green bg-trust-green/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-blue-600 rounded"></div>
                      <span className="font-semibold text-gray-900">PayPal</span>
                    </div>
                  </button>
                </div>

                {paymentMethod === "card" && (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition"
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          CVV *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </form>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg mt-6">
                  <Lock className="w-4 h-4 text-trust-green" />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep("shipping")}
                    disabled={isSubmitting}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="flex-1 bg-trust-green text-white py-3.5 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Place Order (₹{total.toFixed(2)})
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-trust-green" />
                Order Summary
              </h2>

              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-sprout-green/20 to-trust-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🌿</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        {item.variant && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-trust-green/10 text-trust-green">
                            {item.variant}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-sm text-trust-green flex-shrink-0">
                      ₹{item.total.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-trust-green">FREE</span>
                    ) : (
                      `₹${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-semibold">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-trust-green">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {shipping > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    Add <span className="font-bold">₹{(freeShippingThreshold - subtotal).toFixed(2)}</span> more to
                    get FREE shipping!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
