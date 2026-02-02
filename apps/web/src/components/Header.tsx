// @ts-nocheck
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Container from "./Container";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cart, openCart } = useCart();
  const { wishlist, openWishlist } = useWishlist();
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMenuToggle = () => setMenuOpen(!menuOpen);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 backdrop-blur-md ${
        scrolled 
          ? "bg-white/95 shadow-lg border-b border-gray-100" 
          : "bg-white/80"
      }`}
      role="banner"
    >
      <Container>
        <nav className="flex h-16 items-center justify-between" aria-label="Primary">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 flex-shrink-0 group" 
            aria-label="CountryNatural home"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-trust-green to-green-600 text-white grid place-items-center font-bold text-sm shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
              CN
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-trust-green to-green-600 bg-clip-text text-transparent hidden sm:inline">
              CountryNatural
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <Link 
              className="px-4 py-2 rounded-lg text-gray-700 hover:text-trust-green hover:bg-trust-green/5 transition font-medium relative group" 
              href="/products"
            >
              Products
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-trust-green scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
            <Link 
              className="px-4 py-2 rounded-lg text-gray-700 hover:text-trust-green hover:bg-trust-green/5 transition font-medium relative group" 
              href="/categories"
            >
              Categories
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-trust-green scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
            <Link 
              className="px-4 py-2 rounded-lg text-gray-700 hover:text-trust-green hover:bg-trust-green/5 transition font-medium relative group" 
              href="/about"
            >
              About
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-trust-green scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
          </div>

          {/* Actions - Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden sm:flex p-2 rounded-full hover:bg-trust-green/10 transition group"
              aria-label="Search"
              title="Search"
            >
              <svg 
                className="w-5 h-5 text-gray-700 group-hover:text-trust-green transition" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={openWishlist}
              className="relative p-2 rounded-full hover:bg-trust-green/10 transition group"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <svg 
                className="w-5 h-5 text-gray-700 group-hover:text-red-500 transition" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
              {wishlist.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {wishlist.itemCount}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-full hover:bg-trust-green/10 transition group"
              aria-label="Shopping cart"
              title="Shopping cart"
            >
              <svg 
                className="w-5 h-5 text-gray-700 group-hover:text-trust-green transition" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                />
              </svg>
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-accent-carrot to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cart.itemCount}
                </span>
              )}
            </button>

            {/* Login Button */}
            <Link
              className="hidden sm:inline-flex items-center gap-2 rounded-full text-sm px-4 py-2 font-semibold transition bg-gradient-to-r from-trust-green to-green-600 text-white hover:shadow-lg hover:scale-105 shadow-md"
              href="/login"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
              Login
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={handleMenuToggle}
              className="md:hidden p-2 rounded-full hover:bg-trust-green/10 transition"
              aria-label="Toggle menu"
            >
              <svg 
                className="w-6 h-6 text-gray-700" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2 animate-slide-down">
            <Link 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-trust-green hover:bg-trust-green/5 rounded-lg transition font-medium" 
              href="/products"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Products
            </Link>
            <Link 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-trust-green hover:bg-trust-green/5 rounded-lg transition font-medium" 
              href="/categories"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Categories
            </Link>
            <Link 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-trust-green hover:bg-trust-green/5 rounded-lg transition font-medium" 
              href="/about"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About
            </Link>
            <div className="border-t border-gray-200 pt-3 px-4">
              <Link
                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-center rounded-full text-sm font-semibold transition bg-gradient-to-r from-trust-green to-green-600 text-white hover:shadow-lg shadow-md"
                href="/login"
                onClick={() => setMenuOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Login
              </Link>
            </div>
          </div>
        )}

        {/* Search Bar - Expandable */}
        {searchOpen && (
          <div className="border-t border-gray-200 py-4 animate-slide-down">
            <form action="/products" method="get" className="flex gap-2">
              <input
                type="search"
                name="search"
                placeholder="Search organic products..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-green focus:border-transparent"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-2 bg-trust-green text-white rounded-lg font-semibold hover:bg-trust-green/90 transition"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </Container>
    </header>
  );
}
