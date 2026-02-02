"use client";
import { useState } from "react";
import Container from "./Container";

const testimonials = [
  { 
    name: "Aisha R.", 
    text: "Finally a store I trust. The kale is so fresh my kids ask for seconds!", 
    rating: 5,
    role: "Mom of 3",
    image: "AR",
    verified: true
  },
  { 
    name: "Dev P.", 
    text: "Quinoa so clean and fluffy. Subscribed for monthly delivery!", 
    rating: 5,
    role: "Fitness Coach",
    image: "DP",
    verified: true
  },
  { 
    name: "Maya L.", 
    text: "Almond butter is silky and rich. Zero junk, just almonds.", 
    rating: 5,
    role: "Chef",
    image: "ML",
    verified: true
  },
  { 
    name: "James K.", 
    text: "Best organic groceries I've found online. Fast shipping too!", 
    rating: 5,
    role: "Nutritionist",
    image: "JK",
    verified: true
  },
];

export default function Testimonials() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="bg-gradient-to-b from-white to-warm-neutral">
      <Container className="py-20">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-semibold text-trust-green mb-3 tracking-wider uppercase">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Loved by Real Families
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of happy customers who trust CountryNatural for their organic essentials
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-accent-carrot fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">4.9 out of 5 stars</span>
            <span className="text-sm text-gray-500">(12,543 reviews)</span>
          </div>
        </div>

        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={`flex gap-6 ${isPaused ? '' : 'marquee'}`}>
            {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
              <div 
                key={i} 
                className="min-w-[22rem] bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-trust-green to-sprout-green rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {t.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{t.name}</h4>
                      {t.verified && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{t.role}</p>
                  </div>
                </div>
                
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-accent-carrot fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed flex-1">"{t.text}"</p>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Purchase
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Hover over reviews to pause
        </p>
      </Container>
    </section>
  );
}
