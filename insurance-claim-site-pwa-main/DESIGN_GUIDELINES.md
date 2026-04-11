# Insurance Claim Help - Design Guidelines

This document serves as the single source of truth for the visual design and styling of the Insurance Claim Help website. Follow these guidelines to ensure consistency across all pages and components.

## 1. Core Philosophy

- **Premium & Trustworthy**: The design should convey professional competence and reliability.
- **Clean & Flat**: Avoid drop shadows (`shadow-*`). Use borders and subtle background color differences to define depth.
- **Dynamic**: Use `framer-motion` for entrance animations and smooth hover transitions.
- **Spacious**: Use ample whitespace (`py-24` for sections) to create a relaxed, uncluttered reading experience.

## 2. Color Palette

### Primary Colors

- **Primary (Deep Blue)**: `#003153` (Tailwind `bg-primary`, `text-primary`)
  - _Usage_: Headings, Primary Buttons, Active States, Borders.
- **Secondary (Amber/Gold)**: `#ffb41f` (Tailwind `text-secondary`, `bg-secondary`)
  - _Usage_: Icons, Highlights, Accent Text, "Call to Action" nuances.
- **Accent (Teal)**: `#1F7A6D`
  - _Usage_: Success states, specific trust badges.

### Neutral Scale

- **Background**: `white` or `bg-neutral-50` (for alternating sections).
- **Foreground (Headings)**: `oklch(26.9% 0 0)` or `text-neutral-900`.
- **Body Text**: `text-neutral-600` or `text-neutral-500` for subtitles.
- **Borders**: `oklch(0.922 0 0)` or `border-neutral-100` / `border-neutral-200`.

### Gradients

- **Hero Overlay**: `bg-linear-to-b from-black/50 to-black/80` (Darkens images for text legibility).
- **Text Gradient**: `bg-linear-to-r from-primary to-primary-light`.

## 3. Typography

- **Font Family**: Use the project's defaults (`font-base` for body, `font-heading` for headers).
- **Scale**:
  - **H1**: `text-3xl md:text-5xl tracking-tight` (Hero).
  - **H2**: `text-2xl md:text-4xl`.
  - **H3**: `text-xl md:text-3xl`.
  - **Body**: `text-sm md:text-base` (General), `text-lg` (Lead text).

- **Heading Style**: All headings (`h1` through `h4`) should prioritize a **clean, non-bold** appearance. Use `font-normal` or `font-medium`. Avoid using multiple decorative colors (secondary gold) or italics within headings to maintain a premium, professional aesthetic. Stick to `text-neutral-900` or a single `text-primary` highlight.

## 4. UI Component Styling

### Shapes & Borders

- **Radius**: Use generous rounded corners for a modern, friendly feel:
  - `rounded-3xl` (1.5rem) for **cards, containers, and large elements** (primary choice for dashboards).
  - `rounded-2xl` (1rem) for **smaller components** like category icons.
  - `rounded-full` for **pills, search inputs, badges, and circular buttons**.
  - `rounded-xl` for **buttons and small UI elements**.
  - Avoid `rounded-md` - use the larger sizes above for consistency.
- **Borders**: Use `border border-neutral-100` or `border-neutral-200` to define shapes instead of shadows.
- **Shadows**: **NONE**. Do not use `shadow-sm`, `shadow-md`, etc. The design is flat.

### Buttons

- **Primary Button**:
  - Bg: `bg-primary` or `bg-black`
  - Text: `text-white` or `text-primary-foreground`
  - Hover: `hover:brightness-110`
  - Shape: `rounded-full` (for pill style) or `rounded-xl`
  - Padding: `px-6 py-3`
- **Secondary/Outline Button**:
  - Bg: `bg-background` or `bg-neutral-100`
  - Text: `text-foreground`
  - Hover: `hover:bg-secondary hover:text-white`
  - Shape: `rounded-full` or `rounded-xl`
  - Padding: `px-6 py-3`

### Cards

- **Standard Card**:
  - Bg: `bg-white` (if on neutral background) or `bg-white/50`.
  - Border: `border border-neutral-100` or `border-neutral-200`.
  - Shape: `rounded-3xl`.
  - Hover: `hover:border-primary/20 hover:bg-white` (Transition: `duration-300`).
  - Shadow: None.

## 5. Layout & Spacing

- **Container**: Use the `.section` utility class: `mx-auto container px-6 lg:px-15`.
- **Section Spacing**:
  - Standard: `py-24` (96px) or `py-20` (80px).
  - Hero: `min-h-[calc(100lvh-60px)]`.

## 6. Animation (Framer Motion)

- **Entrance**: Standard fade-in-up for content.
  ```tsx
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
  ```
- **Hover**: Smooth color/border transitions (`duration-300`).

## 7. Icons

- **Library**: `lucide-react`.
- **Style**: Often wrapped in a circle or square container (`size-10`, `rounded-full` or `rounded-md`) with `bg-primary` or `border`.

## 8. Code Reference

- **Color Vars**: Defined in `src/app/globals.css`.
- **Layout Utility**: `.section` in `src/app/globals.css`.

### 5. Mobile-First Rules

- Click targets must be at least `44px` (Button height `h-14` is preferred).
- Forms should be single-column.
- Navigation should be sticky (Header or Bottom Bar).
- Use `animate-in fade-in slide-in-from-bottom-2` for all page transitions.
