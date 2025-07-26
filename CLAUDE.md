# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is **BuildBridge** - a marketplace platform connecting homeowners with tradespeople (tradies). The application is built as a Next.js 15 full-stack application with TypeScript, located in the `buildbridge-platform/` directory.

### Key Architecture Components

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL) with comprehensive schemas for projects, owners, tradies, and reviews
- **Authentication**: Supabase Auth with custom user profiles
- **Maps Integration**: Google Maps API for location services
- **Email**: Resend API for transactional emails
- **Runtime**: Uses `same-runtime` for JSX processing (note: `jsxImportSource: "same-runtime/dist"` in tsconfig.json)

### Core Database Schema

The platform manages four main entities with geographic capabilities:
- **Projects**: Job postings with location coordinates and detailed descriptions
- **Owners**: Homeowner accounts with addresses and coordinates  
- **Tradies**: Tradespeople with service radius, specialties, ratings, and business info
- **Reviews**: Rating system with approval workflow

All entities support geographic queries using a `calculate_distance()` function for location-based matching.

## Development Commands

```bash
# Development server with Turbopack (runs on all interfaces)
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Type checking and linting
bun run lint

# Code formatting
bun run format
```

## Code Style & Linting

- **Formatter**: Uses Biome for code formatting with space indentation and double quotes
- **Linter**: Biome with most accessibility rules disabled for rapid development
- **TypeScript**: Strict mode enabled with absolute imports via `@/` alias
- **Git**: Not currently a git repository

## Key Technical Details

### Authentication System
- Supabase-based auth with custom user profiles
- Support for homeowner and tradie account types
- Row Level Security (RLS) policies implemented
- Email verification required for new accounts

### Location Services
- Google Maps integration for address autocomplete
- Geographic coordinate storage for distance calculations
- Service radius matching for tradies
- Location-based project recommendations

### Component Architecture
- shadcn/ui components in `src/components/ui/`
- Custom components like `Navigation.tsx` and Google Maps components
- Context-based auth state management (`AuthContext.tsx`)
- Responsive design with mobile-first approach

### Database Integration
- Comprehensive TypeScript types exported from `lib/supabase.ts`
- Views and functions for tradie statistics and distance calculations
- Automatic rating updates via database triggers
- Support for image/video attachments

## Environment Setup

Required environment variables (see `SETUP_AUTHENTICATION.md`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## Testing

No test framework is currently configured. Check with the user before implementing tests.

## Deployment

- Configured for static export with `trailingSlash: true`
- Images configured as `unoptimized: true`
- ESLint checks ignored during builds
- Multiple deployment guides available in the docs/