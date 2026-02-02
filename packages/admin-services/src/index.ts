import { z } from 'zod';

// Auth Schemas
export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const adminSignupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .regex(/^[A-Za-z ]+$/, 'First name can only contain letters and spaces'),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .regex(/^[A-Za-z ]+$/, 'Last name can only contain letters and spaces'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const createAdminUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'VIEWER']),
});

// Product Schemas
export const createProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters').max(255),
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(255),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(255),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  ingredients: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  categoryId: z.string().uuid('Invalid category ID'),
  badges: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isLatestArrival: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// Variant Schemas
export const createVariantSchema = z.object({
  name: z.string().min(2, 'Variant name must be at least 2 characters'),
  price: z.number().positive('Price must be positive'),
  discountPrice: z.number().positive('Discount price must be positive').optional(),
  discount: z.number().min(0).max(100, 'Discount must be between 0 and 100').optional(),
  offer: z.string().optional(),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  stockQuantity: z.number().int().nonnegative('Stock must be non-negative'),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  shelfLife: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const updateVariantSchema = createVariantSchema.partial();

// Category Schemas
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  slug: z.string().min(2, 'Slug must be at least 2 characters').max(100),
  icon: z.string().optional(),
  displayOrder: z.number().int().nonnegative(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Image Upload Schema
export const uploadImageSchema = z.object({
  altText: z.string().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isDefault: z.boolean().optional(),
});

// Utility Functions
export function calculateDiscount(originalPrice: number, discountPrice: number): number {
  if (discountPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}

export function calculateDiscountPrice(originalPrice: number, discountPercent: number): number {
  return Math.round(originalPrice * (1 - discountPercent / 100) * 100) / 100;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  return { valid: true };
}

// Export types for re-export
export type * from '@countrynaturalfoods/admin-types';
