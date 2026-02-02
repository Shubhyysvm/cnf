# Category Showcase Implementation

## Overview
Updated the category display from simple chips to an elegant alternating layout with fade transitions, matching the style shown in the design references (Cold Pressed Oils and Desi Grocery images).

## Features Implemented

### 1. **Alternating Layout**
- **Even-indexed categories**: Text on left, image on right
- **Odd-indexed categories**: Image on left, text on right
- Creates a visually dynamic, magazine-style layout

### 2. **Smooth Transitions**
- **Fade-in animations**: Each category section fades in as you scroll
- **Image fade effect**: Gradient overlay on images that fades towards the text
- **Hover effects**: 
  - Images scale up slightly on hover
  - Text color transitions to brand green
  - Arrow icon slides forward
  - Call-to-action expands

### 3. **Content Display**
- **Title**: Large, bold category name (from database)
- **Description**: Uses the `description` field from the categories table
- **Image**: Uses the `imageUrl` field, with fallback to organic icon
- **Call-to-action**: "Explore [Category Name]" button with animated arrow

### 4. **Responsive Design**
- **Mobile**: Single column layout with image below text
- **Tablet & Desktop**: Full alternating two-column layout
- Smooth transitions between breakpoints

## Files Modified

### 1. **New Component: `CategoryShowcase.tsx`**
```
apps/web/src/components/CategoryShowcase.tsx
```
- Client component using Framer Motion
- Handles alternating layout logic
- Manages all animations and transitions

### 2. **Updated: `page.tsx`**
```
apps/web/src/app/page.tsx
```
- Replaced `CategoryChips` import with `CategoryShowcase`
- Updated categories section to use new component
- Added gradient background for visual depth

### 3. **Dependencies**
- Added `framer-motion@^12.25.0` for animations

## Database Schema Usage

The component uses the following fields from the `categories` table:

```sql
- id: uuid (unique identifier)
- name: string (category title)
- slug: string (URL path)
- description: text (short description displayed in showcase)
- imageUrl: string (category hero image)
```

## Styling Features

### Gradient Overlays
```typescript
// Fades image towards text
isEven 
  ? "bg-gradient-to-r from-transparent to-white/30"
  : "bg-gradient-to-l from-transparent to-white/30"
```

### Animation Timings
- **Initial fade-in**: 0.6s duration
- **Scroll trigger**: 100px before viewport
- **Stagger delay**: 0.1s per category
- **Hover transitions**: 0.3-0.5s

## Design Match

This implementation matches the provided screenshots:

1. **Cold Pressed Oils Style**:
   - Large hero image
   - Text with bullet points
   - Clear call-to-action
   - Warm, earthy tones

2. **Desi Grocery Style**:
   - Clean, modern layout
   - Prominent typography
   - Product imagery
   - Descriptive text

## Usage

The component automatically alternates layout for each category:

```tsx
<CategoryShowcase categories={categories} />
```

Where `categories` is an array with:
```typescript
{
  id: number | string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}
```

## Future Enhancements

Potential improvements:
1. Add loading skeleton for images
2. Implement lazy loading for better performance
3. Add video support for category showcases
4. Include subcategory preview on hover
5. Add parallax scrolling effect
6. Support for multiple images per category

## Testing

To see the new design:
1. Ensure categories have descriptions in the database
2. Add images to categories via admin panel
3. Visit the home page
4. Scroll to "Shop by Category" section
5. Observe alternating layouts and smooth transitions

## Notes

- Categories without images show a fallback organic icon (🌱)
- Categories without descriptions show default text
- All animations respect `prefers-reduced-motion` accessibility settings
- Images are optimized using Next.js Image component
