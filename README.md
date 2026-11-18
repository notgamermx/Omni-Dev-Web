# OmniDev Website

Production-ready website for OmniDev — an open-source AI development environment.

## Stack

- **Framework**: Astro 4.x (static site generation)
- **Styling**: Tailwind CSS 3.4
- **Animations**: GSAP 3.12
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Cloudflare Pages
- **Edge Functions**: Cloudflare Workers (Pages Functions)
- **Storage**: Cloudflare R2 (assets)
- **Auth**: Supabase Auth (admin CMS)
- **CI/CD**: GitHub Actions

## Project Structure

```
omnidev-web/
├── public/                 # Static assets
│   ├── _headers           # Security headers & caching
│   ├── _redirects         # URL redirects
│   └── robots.txt
├── src/
│   ├── components/        # Astro & React components
│   │   ├── Layout.astro
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── HeroShowcase.tsx   # Interactive 4-mode demo (island)
│   │   ├── CommandPalette.tsx # ⌘K search (island)
│   │   └── Toast.tsx          # Toast notifications (island)
│   ├── pages/             # File-based routing
│   │   ├── index.astro           # Home
│   │   ├── download.astro        # Download
│   │   ├── updates.astro         # Updates & Roadmap
│   │   ├── docs/[section].astro  # Documentation
│   │   ├── license.astro
│   │   ├── security.astro
│   │   ├── community.astro
│   │   ├── about.astro
│   │   └── admin/                # Admin CMS
│   ├── lib/               # Server-side utilities
│   │   ├── supabase.ts    # Supabase client
│   │   ├── content.ts     # Content fetching with caching
│   │   ├── github.ts      # GitHub API helpers
│   │   └── utils.ts       # Common utilities
│   ├── styles/
│   │   └── global.css     # Tailwind + custom styles
│   ├── types/
│   │   ├── index.ts       # App types
│   │   └── database.ts    # Supabase generated types
│   └── scripts/
│       └── sync-releases.js
├── functions/             # Cloudflare Pages Functions (Edge Workers)
│   ├── api/
│   │   ├── feedback.ts        # POST /api/feedback
│   │   ├── releases.ts        # GET /api/releases
│   │   ├── roadmap.ts         # GET/POST /api/roadmap
│   │   ├── cms.ts             # Admin CMS CRUD
│   │   └── webhook-github.ts  # GitHub webhook handler
│   └── utils/
│       └── cors.ts
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_admin_auth.sql
│   └── seed.sql
├── .github/workflows/
│   └── deploy.yml
├── astro.config.mjs
├── tailwind.config.js
├── wrangler.toml
├── package.json
├── tsconfig.json
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase account
- Cloudflare account
- GitHub repository

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Start Supabase locally (optional)
npx supabase start

# 4. Run dev server
npm run dev
# Open http://localhost:4321
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) | Yes |
| `GITHUB_TOKEN` | GitHub PAT with repo/admin:repo_hook | Yes |
| `GITHUB_WEBHOOK_SECRET` | Secret for GitHub webhook verification | Yes |
| `REPO_OWNER` | GitHub repo owner | No (default: notgamermx) |
| `REPO_NAME` | GitHub repo name | No (default: omnidev) |

### Database Setup

```bash
# Apply migrations
npx supabase migration up

# Seed default data
npx supabase db seed
```

Or run the SQL files in `supabase/migrations/` manually in Supabase Dashboard → SQL Editor.

### Create Admin User

1. Go to Supabase Dashboard → Authentication → Users → Add user
2. Create user with email/password
3. Copy the user UUID
4. Run in SQL Editor:
```sql
INSERT INTO admin_users (user_id, role)
VALUES ('your-user-uuid', 'admin');
```

## Deployment

### Cloudflare Pages

1. Push to GitHub
2. In Cloudflare Dashboard → Pages → Create a project
3. Connect your GitHub repo
4. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `/` (or your project folder)
5. Add environment variables in Pages Settings → Environment variables
6. Deploy!

### GitHub Actions

The workflow in `.github/workflows/deploy.yml` handles:
- Build on push/PR
- Deploy to Cloudflare Pages (main → production, PR → preview)
- Scheduled release sync (daily)

Required GitHub Secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_TOKEN`
- `GITHUB_WEBHOOK_SECRET`

### GitHub Webhook

1. Go to GitHub repo → Settings → Webhooks → Add webhook
2. Payload URL: `https://your-domain.pages.dev/api/webhook-github`
3. Content type: `application/json`
4. Secret: Your `GITHUB_WEBHOOK_SECRET`
5. Events: Select "Release" events

### Custom Domain

1. In Cloudflare Pages → Custom domains → Add domain
2. Add DNS records as instructed
3. Enable "Always Use HTTPS" in SSL/TLS settings

## Features

### Public Pages
- **Home**: Hero with interactive 4-mode code showcase, features, tech stack
- **Download**: Platform-specific downloads synced from GitHub Releases
- **Updates**: Release history (GitHub + CMS) + product roadmap
- **Docs**: Multi-section documentation with code examples
- **License**: MIT license + third-party notices
- **Security**: Security policy + vulnerability report form
- **Community**: GitHub links + feedback submission form
- **About**: Architecture, maintainer, contributing guide

### Admin CMS (`/admin`)
- **Dashboard**: Overview with quick actions
- **Content**: Edit hero copy, announcement bar, fallback version
- **Releases**: Add/edit/delete release notes (merged with GitHub)
- **Roadmap**: Manage roadmap items with status
- **Feedback**: View community submissions
- **Security**: View security reports (admin role only)

### Interactive Components
- **HeroShowcase**: 4-mode code demo with live terminal (AutoMode, OmniMode, Teach Mode, AI Agents)
- **CommandPalette**: ⌘K fuzzy search for navigation
- **Toast**: Non-blocking notifications

### API Endpoints
- `POST /api/feedback` - Submit feedback (public)
- `GET /api/releases` - Get releases (cached 5min)
- `GET/POST /api/roadmap` - Get/add roadmap items
- `GET/POST/PUT/DELETE /api/cms` - Admin CMS operations (auth required)
- `POST /api/webhook-github` - GitHub release webhook

## Design System

Colors, animations, and components are defined in:
- `tailwind.config.js` - Theme configuration
- `src/styles/global.css` - Base styles + custom utilities

Key color palette:
- `bg` (#080A0F), `surface` (#0F1218), `elevated` (#161B24)
- `accent` (#3B82F6), `amber` (#F59E0B), `success` (#22C55E), `danger` (#EF4444), `purple` (#A855F7)

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run sync-releases # Sync GitHub releases to Supabase
npm run deploy:preview # Deploy preview (manual)
```

## License

MIT License - see [LICENSE](https://github.com/notgamermx/omnidev/blob/main/LICENSE)