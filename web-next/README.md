# Avocados Amandi - Next.js App

This is the Next.js version of the Avocados Amandi website, migrated from Create React App for better SEO.

## Structure

- **`/app`** - Next.js app router pages
  - `page.tsx` - Home page
  - `[...seo]/page.tsx` - Dynamic SEO pages for country-specific routes
- **`/components`** - React components (to be migrated from `/web/src/components`)
- **`/lib`** - Utilities and configurations
  - `countries.ts` - Country configuration with SEO paths
  - `translations.ts` - Translation files (ES/EN)

## SEO Routes

The app generates static pages for all country-specific SEO paths:
- `/en/order-avocados-online-uk`
- `/en/order-avocados-online-finland`
- `/en/ecological-avocados-uk`
- `/es/comprar-aguacates-online-espana`
- etc.

All routes are defined in `lib/countries.ts` and automatically generated at build time.

## Migration Status

✅ **Completed:**
- Next.js app setup with TypeScript
- Country configuration system
- Dynamic SEO routes
- Translations structure
- Footer with SEO links
- Global styles with design tokens

⏳ **To Migrate:**
- All components from `/web/src/components` need to be migrated to `/components`
- Components need to accept `translations` and optional `country` props
- CSS modules need to be converted from `.css` to `.module.css`

## Running

```bash
npm run dev
```

## Building

```bash
npm run build
```

This will generate all static pages including all SEO routes.
