"use client";

import { motion } from "framer-motion";

type Category = {
  id: number | string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export default function CategoryShowcase({ categories }: { categories: Category[] }) {
  return (
    <div className="space-y-16">
      {categories.map((category, index) => {
        const isEven = index % 2 === 0;

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <a
              href={`/categories/${category.slug}`}
              className="group block"
            >
              <div
                className={`flex flex-col ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                } items-center gap-8 md:gap-12 lg:gap-16`}
              >
                {/* Text Content */}
                <motion.div
                  className="flex-1 space-y-4"
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 group-hover:text-trust-green transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    {category.description || "Explore our curated selection of organic products"}
                  </p>
                  <div className="inline-flex items-center text-trust-green font-semibold group-hover:gap-3 transition-all duration-300">
                    <span>Explore {category.name}</span>
                    <svg
                      className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </motion.div>

                {/* Image */}
                <motion.div
                  className="flex-1 w-full relative"
                  initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
                    {/* Gradient Overlay - fades image towards text */}
                    <div
                      className={`absolute inset-0 z-10 pointer-events-none ${
                        isEven
                          ? "bg-gradient-to-r from-transparent via-transparent to-white/30"
                          : "bg-gradient-to-l from-transparent via-transparent to-white/30"
                      }`}
                    />

                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-trust-green/20 to-trust-green/5 flex items-center justify-center">
                        <span className="text-6xl opacity-20">🌱</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </a>
          </motion.div>
        );
      })}
    </div>
  );
}
