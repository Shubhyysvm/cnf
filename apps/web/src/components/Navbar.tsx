"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Container from "./Container";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { cart, openCart } = useCart();
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition backdrop-blur ${
        scrolled ? "bg-white/90 shadow-sm" : "bg-transparent"
      }`}
      role="banner"
    >
      <Container>
        <nav className="flex h-16 items-center justify-between" aria-label="Primary">
          <Link href="/" className="flex items-center gap-2" aria-label="CountryNatural home">
            <div className="w-9 h-9 rounded-full bg-trust-green text-white grid place-items-center font-bold">
              TS
            </div>
            <span className={`text-lg sm:text-xl font-bold ${scrolled ? "text-trust-green" : "text-white"}`}>
              CountryNatural
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link className={`${scrolled ? "text-gray-700" : "text-white"} hover:text-trust-green transition`} href="/products">Products</Link>
            <Link className={`${scrolled ? "text-gray-700" : "text-white"} hover:text-trust-green transition`} href="/categories">Categories</Link>
            <Link className={`${scrolled ? "text-gray-700" : "text-white"} hover:text-trust-green transition`} href="/about">About</Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={openCart}
              className={`relative p-2 rounded-full hover:bg-gray-100/20 transition ${
                scrolled ? "text-gray-700" : "text-white"
              }`}
              aria-label="Shopping cart"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-carrot text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {cart.itemCount}
                </span>
              )}
            </button>
              <Link
                className={`rounded-full text-sm px-4 py-2 font-semibold transition ${
                  scrolled ? "bg-trust-green text-white hover:bg-trust-green/90" : "bg-white text-trust-green hover:bg-white/90"
                }`}
                href="/login"
              >
                Login
              </Link>
            <Link 
              className={`rounded-full text-sm px-4 py-2 font-semibold transition ${
                scrolled ? "bg-trust-green text-white hover:bg-trust-green/90" : "bg-white text-trust-green hover:bg-white/90"
              }`} 
              href="/products"
            >
              Shop Now
            </Link>
          </div>
        </nav>
      </Container>
    </header>
  );
}
