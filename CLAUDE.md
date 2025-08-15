# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is **BuildBridge** - a marketplace platform connecting homeowners with tradespeople (tradies). The application is built as a Next.js 15 full-stack application with TypeScript.

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
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking and linting
npm run lint

# Code formatting
npm run format
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

### Project Structure
The project follows Next.js 15 App Router structure:

**Main Application Pages:**
- `/` - Homepage with hero section and service overview
- `/about` - About page
- `/auth/login` - User login page
- `/auth/register` - User registration page
- `/browse-tradies` - Browse available tradespeople with category filtering
- `/post-job` - Job posting form for homeowners
- `/dashboard` - User dashboard (both owners and tradies)
- `/my-projects` - Project management for users
- `/messages` - Messaging system
- `/reviews` - Review management
- `/payment` - Payment processing
- `/subscription` - Subscription management

**Admin Panel:**
- `/admin` - Admin dashboard
- `/admin/complaints` - Complaint management
- `/admin/database` - Database administration
- `/admin/reviews` - Review moderation
- `/admin/suppliers` - Supplier management
- `/admin/tradies` - Tradie management
- `/admin/users` - User management
- `/admin/support` - Support ticket management

**Content Pages:**
- `/blog` - Blog listing
- `/contact` - Contact form
- `/cost-estimator` - Cost estimation tool
- `/faq` - Frequently asked questions
- `/how-it-works` - Platform explanation
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/trades` - Trade categories
- `/services` - Service listings
- `/suppliers/*` - Regional supplier directories (Australia, Canada, New Zealand, USA)

**API Routes:**
- `/api/auth/send-verification` - Email verification
- `/api/autocomplete` - Google Places autocomplete
- `/api/database/init` - Database initialization
- `/api/database/test` - Database testing

### Component Architecture
- shadcn/ui components in `src/components/ui/` (comprehensive UI library)
- Custom components: `Navigation.tsx`, `GooglePlacesAutocomplete.tsx`, `ServerGooglePlacesAutocomplete.tsx`
- Context-based auth state management (`AuthContext.tsx`)
- Responsive design with mobile-first approach
- Shared client-side wrapper (`ClientBody.tsx`)

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
- `NEXT_PUBLIC_APP_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## Testing

No test framework is currently configured. Check with the user before implementing tests.

## Deployment

- Configured for static export with `trailingSlash: true`
- Images configured as `unoptimized: true`
- ESLint checks ignored during builds
- Multiple deployment guides available in the docs/