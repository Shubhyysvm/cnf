"use client";
import Link from "next/link";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-bold mb-4">Country Natural Foods</h3>
            <p className="text-gray-400 text-sm">
              Authentic organic products for a healthier, sustainable lifestyle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
              <li><Link href="/new" className="hover:text-white">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white">Our Story</Link></li>
              <li><Link href="/certifications" className="hover:text-white">Certifications</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-3">Get freshness in your inbox.</p>
            <form className="flex gap-2" action="#" method="post">
              <input aria-label="Email" className="flex-1 rounded-full px-4 py-2 text-gray-900" placeholder="you@example.com" />
              <button className="rounded-full bg-trust-green px-5 font-semibold">Join</button>
            </form>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-gray-400">
          © 2025 CountryNatural. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
