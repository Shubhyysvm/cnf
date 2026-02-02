// @ts-nocheck
"use client";

import { useState } from "react";
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
  Percent,
  Wallet,
  Banknote,
  User,
  Smartphone,
  Building2,
  ArrowLeft
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

  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod" | "netbanking">("upi");
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
        "FIRST10": 0.10,
      };

      const discountPercent = validPromos[promoCode.toUpperCase()];
      if (discountPercent) {
        const discountAmount = subtotal * discountPercent;
        setPromoDiscount(discountAmount);
        toast.success(`🎉 Promo applied! You saved ₹${discountAmount.toFixed(2)}`, {
          duration: 3000,
        });
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

  const handlePlaceOrder = async () => {
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

      // Redirect to order confirmation
      router.push(`/order-confirmation?orderNumber=${data.orderNumber}`);
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <main className="pt-28 pb-16">
        <Container>
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some organic products before checking out</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-trust-green to-green-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-screen">
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-trust-green via-green-600 to-emerald-600 bg-clip-text text-transparent">
                Secure Checkout
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Shield className="w-4 h-4 text-trust-green" />
                256-bit SSL encrypted • Your data is safe with us
              </p>
            </div>
            <Link
              href="/cart"
              className="hidden md:flex items-center gap-2 px-5 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-trust-green hover:text-trust-green transition-all shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>
          </div>
        </div>

        {/* Enhanced 3-Step Progress */}
        <div className="relative flex items-center justify-between max-w-3xl mx-auto mb-12 px-4">
          {/* Step 1 - Shipping */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-lg ${
                step === "shipping"
                  ? "bg-gradient-to-br from-trust-green to-green-600 text-white scale-110 shadow-trust-green/30"
                  : step === "payment" || step === "review"
                  ? "bg-gradient-to-br from-trust-green to-green-600 text-white"
                  : "bg-white border-2 border-gray-300 text-gray-400"
              }`}
            >
              {step === "payment" || step === "review" ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <MapPin className="w-7 h-7" />
              )}
            </div>
            <div className="mt-3 text-center">
              <p className={`text-sm font-bold ${step === "shipping" ? "text-trust-green" : "text-gray-700"}`}>
                Shipping
              </p>
              <p className="text-xs text-gray-500 hidden sm:block">Delivery address</p>
            </div>
          </div>

          {/* Connector Line 1 */}
          <div className="absolute top-8 left-[20%] right-[60%] h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-trust-green to-green-600 transition-all duration-500 ${
                step === "payment" || step === "review" ? "w-full" : "w-0"
              }`}
            />
          </div>

          {/* Step 2 - Payment */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-lg ${
                step === "payment"
                  ? "bg-gradient-to-br from-trust-green to-green-600 text-white scale-110 shadow-trust-green/30"
                  : step === "review"
                  ? "bg-gradient-to-br from-trust-green to-green-600 text-white"
                  : "bg-white border-2 border-gray-300 text-gray-400"
              }`}
            >
              {step === "review" ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <CreditCard className="w-7 h-7" />
              )}
            </div>
            <div className="mt-3 text-center">
              <p className={`text-sm font-bold ${step === "payment" ? "text-trust-green" : "text-gray-700"}`}>
                Payment
              </p>
              <p className="text-xs text-gray-500 hidden sm:block">Choose method</p>
            </div>
          </div>

          {/* Connector Line 2 */}
          <div className="absolute top-8 left-[60%] right-[20%] h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-trust-green to-green-600 transition-all duration-500 ${
                step === "review" ? "w-full" : "w-0"
              }`}
            />
          </div>

          {/* Step 3 - Review */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-lg ${
                step === "review"
                  ? "bg-gradient-to-br from-trust-green to-green-600 text-white scale-110 shadow-trust-green/30"
                  : "bg-white border-2 border-gray-300 text-gray-400"
              }`}
            >
              <Package className="w-7 h-7" />
            </div>
            <div className="mt-3 text-center">
              <p className={`text-sm font-bold ${step === "review" ? "text-trust-green" : "text-gray-700"}`}>
                Review
              </p>
              <p className="text-xs text-gray-500 hidden sm:block">Confirm order</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ===== STEP 1: SHIPPING ===== */}
            {step === "shipping" && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 animate-fade-in">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-trust-green/20 to-green-600/20 flex items-center justify-center shadow-md">
                    <MapPin className="w-7 h-7 text-trust-green" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Delivery Address</h2>
                    <p className="text-sm text-gray-600">Where should we deliver your fresh organic products?</p>
                  </div>
                </div>

                <form className="space-y-6">
                  {/* Contact Information Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingForm.firstName}
                          onChange={(e) => setShippingForm({ ...shippingForm, firstName: e.target.value })}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition-all hover:border-gray-300 bg-white"
                          placeholder="John"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingForm.lastName}
                          onChange={(e) => setShippingForm({ ...shippingForm, lastName: e.target.value })}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition-all hover:border-gray-300 bg-white"
                          placeholder="Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={shippingForm.email}
                          onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition-all hover:border-gray-300 bg-white"
                          placeholder="john.doe@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={shippingForm.phone}
                          onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition-all hover:border-gray-300 bg-white"
                          placeholder="9876543210"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Section */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                      <Home className="w-5 h-5 text-green-600" />
                      Delivery Address
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Street Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingForm.address}
                          onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition-all hover:border-gray-300 bg-white"
                          placeholder="123 Main Street, Near Landmark"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Apartment, Suite, Floor (Optional)
                        </label>
                        <input
                          type="text"
                          value={shippingForm.apartment}
                          onChange={(e) => setShippingForm({ ...shippingForm, apartment: e.target.value })}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition-all hover:border-gray-300 bg-white"
                          placeholder="Apt 4B, Floor 2"
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shippingForm.city}
                            onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition-all hover:border-gray-300 bg-white"
                            placeholder="Mumbai"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shippingForm.state}
                            onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition-all hover:border-gray-300 bg-white"
                            placeholder="Maharashtra"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            PIN Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shippingForm.zip}
                            onChange={(e) => setShippingForm({ ...shippingForm, zip: e.target.value })}
                            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition-all hover:border-gray-300 bg-white"
                            placeholder="400001"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Speed Section */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-purple-600" />
                      Delivery Speed
                    </h3>
                    <div className="space-y-3">
                      <label className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] ${
                        selectedDeliverySpeed === "standard" 
                          ? "border-trust-green bg-trust-green/10 shadow-md" 
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}>
                        <input
                          type="radio"
                          name="deliverySpeed"
                          value="standard"
                          checked={selectedDeliverySpeed === "standard"}
                          onChange={() => setSelectedDeliverySpeed("standard")}
                          className="mt-1.5 w-5 h-5 text-trust-green focus:ring-2 focus:ring-trust-green"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-lg text-gray-900">Standard Delivery</span>
                            <span className="font-bold text-xl text-trust-green">
                              {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4" />
                            Arrives by <span className="font-semibold text-trust-green">{formatDate(standardDelivery)}</span>
                          </p>
                          <p className="text-xs text-gray-500">5-7 business days • Perfect for planned purchases</p>
                        </div>
                      </label>
                      
                      <label className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] ${
                        selectedDeliverySpeed === "express" 
                          ? "border-orange-500 bg-orange-50 shadow-md" 
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}>
                        <input
                          type="radio"
                          name="deliverySpeed"
                          value="express"
                          checked={selectedDeliverySpeed === "express"}
                          onChange={() => setSelectedDeliverySpeed("express")}
                          className="mt-1.5 w-5 h-5 text-orange-500 focus:ring-2 focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-lg text-gray-900 flex items-center gap-2">
                              Express Delivery
                              <span className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
                                FAST
                              </span>
                            </span>
                            <span className="font-bold text-xl text-orange-600">₹150</span>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4" />
                            Arrives by <span className="font-semibold text-orange-600">{formatDate(expressDelivery)}</span>
                          </p>
                          <p className="text-xs text-gray-500">2-3 business days • For urgent orders</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Save Information Checkbox */}
                  <label className="flex items-start gap-3 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 cursor-pointer hover:bg-gray-100 transition-all">
                    <input
                      type="checkbox"
                      checked={saveInfo}
                      onChange={(e) => setSaveInfo(e.target.checked)}
                      className="mt-1 w-5 h-5 text-trust-green rounded focus:ring-2 focus:ring-trust-green"
                    />
                    <div>
                      <p className="font-bold text-gray-900">Save this information for faster checkout</p>
                      <p className="text-sm text-gray-600 mt-1">We'll securely store your details for future orders</p>
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (validateShippingForm()) {
                        setStep("payment");
                      }
                    }}
                    className="w-full bg-gradient-to-r from-trust-green via-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:via-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                  >
                    Continue to Payment
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </form>
              </div>
            )}

            {/* ===== STEP 2: PAYMENT ===== */}
            {step === "payment" && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 animate-fade-in">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-trust-green/20 to-green-600/20 flex items-center justify-center shadow-md">
                    <CreditCard className="w-7 h-7 text-trust-green" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Payment Method</h2>
                    <p className="text-sm text-gray-600">Choose how you'd like to pay for your order</p>
                  </div>
                </div>

                {/* Payment Method Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* UPI */}
                  <button
                    onClick={() => setPaymentMethod("upi")}
                    className={`relative p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      paymentMethod === "upi"
                        ? "border-trust-green bg-trust-green/10 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Smartphone className="w-8 h-8 text-purple-600" />
                      {paymentMethod === "upi" && (
                        <CheckCircle2 className="w-6 h-6 text-trust-green" />
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">UPI Payment</h3>
                    <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Instant</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">Popular</span>
                    </div>
                  </button>

                  {/* Card */}
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`relative p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      paymentMethod === "card"
                        ? "border-trust-green bg-trust-green/10 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <CreditCard className="w-8 h-8 text-blue-600" />
                      {paymentMethod === "card" && (
                        <CheckCircle2 className="w-6 h-6 text-trust-green" />
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Debit / Credit Card</h3>
                    <p className="text-sm text-gray-600">Visa, Mastercard, Rupay</p>
                    <div className="mt-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">Secure</span>
                    </div>
                  </button>

                  {/* Net Banking */}
                  <button
                    onClick={() => setPaymentMethod("netbanking")}
                    className={`relative p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      paymentMethod === "netbanking"
                        ? "border-trust-green bg-trust-green/10 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Building2 className="w-8 h-8 text-indigo-600" />
                      {paymentMethod === "netbanking" && (
                        <CheckCircle2 className="w-6 h-6 text-trust-green" />
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Net Banking</h3>
                    <p className="text-sm text-gray-600">All major banks supported</p>
                    <div className="mt-3">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">Reliable</span>
                    </div>
                  </button>

                  {/* Cash on Delivery */}
                  <button
                    onClick={() => setPaymentMethod("cod")}
                    className={`relative p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      paymentMethod === "cod"
                        ? "border-trust-green bg-trust-green/10 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Banknote className="w-8 h-8 text-green-600" />
                      {paymentMethod === "cod" && (
                        <CheckCircle2 className="w-6 h-6 text-trust-green" />
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Cash on Delivery</h3>
                    <p className="text-sm text-gray-600">Pay when you receive</p>
                    <div className="mt-3">
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded">Convenient</span>
                    </div>
                  </button>
                </div>

                {/* Card Details Form (if card selected) */}
                {paymentMethod === "card" && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4">Card Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition bg-white"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition bg-white"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition bg-white"
                            placeholder="123"
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Badge */}
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200 mb-6">
                  <Lock className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">Your payment information is secure</p>
                    <p className="text-xs text-gray-600 mt-1">256-bit SSL encryption • PCI DSS compliant</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep("shipping")}
                    className="px-6 py-4 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("review")}
                    className="flex-1 bg-gradient-to-r from-trust-green via-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:via-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                  >
                    Review Order
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}

            {/* ===== STEP 3: REVIEW ===== */}
            {step === "review" && (
              <div className="space-y-6 animate-fade-in">
                {/* Shipping Summary */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-trust-green" />
                      Shipping Address
                    </h3>
                    <button
                      onClick={() => setStep("shipping")}
                      className="text-sm text-trust-green font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="font-bold text-gray-900">{shippingForm.firstName} {shippingForm.lastName}</p>
                    <p className="text-gray-600 mt-1">{shippingForm.address}</p>
                    {shippingForm.apartment && <p className="text-gray-600">{shippingForm.apartment}</p>}
                    <p className="text-gray-600">{shippingForm.city}, {shippingForm.state} - {shippingForm.zip}</p>
                    <p className="text-gray-600 mt-2">📧 {shippingForm.email}</p>
                    <p className="text-gray-600">📱 {shippingForm.phone}</p>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-trust-green" />
                      Payment Method
                    </h3>
                    <button
                      onClick={() => setStep("payment")}
                      className="text-sm text-trust-green font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                    {paymentMethod === "upi" && (
                      <>
                        <Smartphone className="w-8 h-8 text-purple-600" />
                        <div>
                          <p className="font-bold text-gray-900">UPI Payment</p>
                          <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
                        </div>
                      </>
                    )}
                    {paymentMethod === "card" && (
                      <>
                        <CreditCard className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900">Debit / Credit Card</p>
                          <p className="text-sm text-gray-600">Secure card payment</p>
                        </div>
                      </>
                    )}
                    {paymentMethod === "netbanking" && (
                      <>
                        <Building2 className="w-8 h-8 text-indigo-600" />
                        <div>
                          <p className="font-bold text-gray-900">Net Banking</p>
                          <p className="text-sm text-gray-600">Bank transfer</p>
                        </div>
                      </>
                    )}
                    {paymentMethod === "cod" && (
                      <>
                        <Banknote className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-bold text-gray-900">Cash on Delivery</p>
                          <p className="text-sm text-gray-600">Pay when you receive</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep("payment")}
                    className="px-6 py-4 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-trust-green via-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:via-green-700 hover:to-emerald-700 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-6 h-6" />
                        Place Order • ₹{total.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ===== ORDER SUMMARY SIDEBAR ===== */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-24 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-4">
                <Package className="w-6 h-6 text-trust-green" />
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-sprout-green/30 to-trust-green/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{
                        item.productName.toLowerCase().includes("kale") ? "🥬" :
                        item.productName.toLowerCase().includes("quinoa") ? "🌾" :
                        item.productName.toLowerCase().includes("almond") ? "🥜" :
                        item.productName.toLowerCase().includes("spinach") ? "🥬" :
                        "🌿"
                      }</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        {item.variant && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-trust-green/20 text-trust-green border border-trust-green/30">
                            {item.variant}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-sm text-trust-green mt-1">
                        ₹{item.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-trust-green focus:border-trust-green outline-none transition text-sm font-semibold"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo}
                    className="px-4 py-2.5 bg-gradient-to-r from-accent-carrot to-orange-600 text-white rounded-lg font-bold text-sm hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isApplyingPromo ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Tag className="w-4 h-4" />
                        Apply
                      </>
                    )}
                  </button>
                </div>
                {promoDiscount > 0 && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <p className="text-xs text-green-700 font-semibold">
                      Code "{promoCode}" applied! Saved ₹{promoDiscount.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cart.itemCount} items)</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    Delivery ({selectedDeliverySpeed === "express" ? "Express" : "Standard"})
                  </span>
                  <span className="font-semibold text-gray-900">
                    {deliveryCharge === 0 ? (
                      <span className="text-trust-green font-bold">FREE</span>
                    ) : (
                      `₹${deliveryCharge.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (8%)</span>
                  <span className="font-semibold text-gray-900">₹{tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <Percent className="w-4 h-4" />
                      Discount
                    </span>
                    <span className="font-semibold text-green-600">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-trust-green to-green-600 bg-clip-text text-transparent">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Free Shipping Indicator */}
              {deliveryCharge > 0 && subtotal < freeShippingThreshold && (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Package className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900 mb-1">Get FREE Delivery!</p>
                      <p className="text-xs text-amber-800">
                        Add <span className="font-bold text-amber-900">₹{(freeShippingThreshold - subtotal).toFixed(2)}</span> more to qualify
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="border-t pt-4 grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Shield className="w-6 h-6 text-trust-green" />
                  <p className="text-xs text-gray-600 font-semibold">Secure</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <CheckCircle2 className="w-6 h-6 text-trust-green" />
                  <p className="text-xs text-gray-600 font-semibold">Verified</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Lock className="w-6 h-6 text-trust-green" />
                  <p className="text-xs text-gray-600 font-semibold">Encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
