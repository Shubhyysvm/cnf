"use client";
import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import Container from "./Container";

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left - rect.width / 2) / 20,
          y: (e.clientY - rect.top - rect.height / 2) / 20,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section ref={heroRef} className="relative pt-32 pb-28 text-white overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-trust-green via-emerald-600 to-sprout-green animate-gradient-slow" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
        
        {/* Animated blobs with parallax */}
        <div 
          className="absolute -top-32 -left-40 w-[50rem] h-[50rem] rounded-full bg-white/10 blur-3xl animate-blob"
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        />
        <div 
          className="absolute -bottom-32 -right-40 w-[45rem] h-[45rem] rounded-full bg-emerald-400/10 blur-3xl animate-blob animation-delay-2000"
          style={{ transform: `translate(${-mousePos.x * 0.8}px, ${-mousePos.y * 0.8}px)` }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-sprout-green/10 blur-3xl animate-blob animation-delay-4000"
          style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
        />

        {/* Floating elements with 3D transform */}
        <div className="pointer-events-none select-none">
          <span className="leaf-3d" style={{ transform: `translate(${-mousePos.x * 0.3}px, ${-mousePos.y * 0.3}px)` }}>🍃</span>
          <span className="leaf-3d delay-200" style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}>🌿</span>
          <span className="leaf-3d delay-500" style={{ transform: `translate(${-mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}>🍃</span>
          <span className="leaf-3d delay-700" style={{ transform: `translate(${mousePos.x * 0.35}px, ${-mousePos.y * 0.35}px)` }}>🥬</span>
        </div>
      </div>

      <Container>
        <div className="text-center max-w-4xl mx-auto relative z-10">
          {/* Animated badge */}
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full text-sm mb-8 shadow-lg border border-white/20 animate-slide-down hover:scale-105 transition-transform cursor-default">
            <span className="w-2 h-2 bg-accent-carrot rounded-full animate-pulse" />
            <span className="font-semibold">Fresh this week</span>
            <span className="text-white/80">—</span>
            <span>Kale, Quinoa & Almond Butter</span>
            <span className="ml-1">🌿</span>
          </span>

          {/* Main heading with gradient text */}
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight animate-slide-up">
            <span className="inline-block bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-2xl">
              Eat Clean.
            </span>
            <br />
            <span className="inline-block bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent drop-shadow-2xl">
              Live True.
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-10 text-white/95 max-w-2xl mx-auto leading-relaxed animate-slide-up animation-delay-200 drop-shadow-lg">
            Certified organic foods crafted to delight your senses and nourish your body—from farm to family.
          </p>

          {/* CTA Buttons with enhanced effects */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up animation-delay-400">
            <Button href="/products" size="lg" className="group relative overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Shop Bestsellers
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Button>
            <Button href="/about" variant="ghost" size="lg" className="hover:bg-white/20 hover:scale-105">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Why CountryNatural?
              </span>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-white/80 animate-slide-up animation-delay-600">
            <div className="flex items-center gap-2 hover:text-white transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">100% Organic</span>
            </div>
            <div className="w-1 h-1 bg-white/40 rounded-full" />
            <div className="flex items-center gap-2 hover:text-white transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="font-medium">12,500+ Happy Families</span>
            </div>
            <div className="w-1 h-1 bg-white/40 rounded-full" />
            <div className="flex items-center gap-2 hover:text-white transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">4.9★ Rated</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
