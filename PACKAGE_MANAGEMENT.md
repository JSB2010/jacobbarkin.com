# Package Management Guide

## Current Status (October 13, 2025)

### ✅ All Issues Fixed

1. **Hydration Error** - FIXED ✓
2. **Image Quality Warnings** - FIXED ✓
3. **Appwrite Error** - FIXED ✓
4. **Next.js Config Warnings** - FIXED ✓
5. **Build Errors** - FIXED ✓

---

## Understanding the Warnings

### Headers/Redirects Warning (NOT AN ERROR - This is Expected)
```
⚠ rewrites, redirects, and headers are not applied when exporting your application
```

**What it means**: Next.js is telling you that the `headers()` function in `next.config.mjs` won't work with static export.

**Why it's OK**: You're already using the correct approach! Your headers are in `public/_headers` which Cloudflare Pages reads and applies. This is the **correct** way to handle headers for static sites.

**Action needed**: None. This warning is informational only.

---

## Package Update Strategy

### Safe to Update Anytime
These packages can be updated without breaking changes:

```bash
npm install --legacy-peer-deps --no-package-lock \
  lucide-react@latest \
  node-appwrite@latest \
  @types/node@latest \
  @types/react@latest \
  @types/react-dom@latest
```

### Update with Caution (Test After)
These may have breaking changes:

```bash
# Appwrite (18.x → 21.x has breaking changes)
npm install --legacy-peer-deps --no-package-lock appwrite@latest

# Jest (29.x → 30.x has breaking changes)
npm install --legacy-peer-deps --no-package-lock jest@latest jest-environment-jsdom@latest

# Zod (3.x → 4.x has breaking changes)
npm install --legacy-peer-deps --no-package-lock zod@latest
```

### Currently Outdated Packages

| Package | Current | Latest | Breaking Changes? |
|---------|---------|--------|-------------------|
| appwrite | 18.2.0 | 21.2.1 | ⚠️ Yes (API changes) |
| lucide-react | 0.511.0 | 0.545.0 | ✅ No |
| node-appwrite | 17.2.0 | 20.2.1 | ⚠️ Yes |
| jest | 29.7.0 | 30.2.0 | ⚠️ Yes |
| zod | 3.25.76 | 4.1.12 | ⚠️ Yes (major version) |
| @types/node | 22.18.10 | 24.7.2 | ⚠️ Yes (major version) |

---

## NPM Commands Reference

### Check for Updates
```bash
# See all outdated packages
npm outdated

# See specific package versions
npm view <package-name> versions
npm view <package-name> version  # Latest only
```

### Update Packages

#### Method 1: Update to Latest (Recommended for this project)
```bash
# Update specific packages
npm install --legacy-peer-deps --no-package-lock <package-name>@latest

# Update multiple packages
npm install --legacy-peer-deps --no-package-lock package1@latest package2@latest
```

#### Method 2: Update to "Wanted" Version
```bash
# Updates to the version specified in package.json (respects ^ and ~)
npm update --legacy-peer-deps --no-package-lock
```

#### Method 3: Interactive Update (Requires npm-check-updates)
```bash
# Install the tool
npm install -g npm-check-updates

# Check what would be updated
ncu

# Update package.json (doesn't install)
ncu -u

# Then install
npm install --legacy-peer-deps --no-package-lock
```

### Why Use These Flags?

- `--legacy-peer-deps`: Ignores peer dependency conflicts (needed due to React 19 and some babel packages)
- `--no-package-lock`: Prevents package-lock.json creation (avoids version conflicts in this project)

---

## Recommended Update Schedule

### Monthly (Low Risk)
- Icon libraries (lucide-react)
- Type definitions (@types/*)
- Development tools (sharp, sharp-cli)

### Quarterly (Medium Risk)
- UI libraries (@radix-ui/*)
- Utility libraries (clsx, tailwind-merge)
- Build tools (@next/bundle-analyzer)

### Major Versions Only (High Risk - Test Thoroughly)
- Next.js (currently 15.5.5)
- React (currently 19.1.0)
- Appwrite (currently 18.2.0)
- Jest (currently 29.7.0)
- Zod (currently 3.25.76)

---

## Testing After Updates

### 1. Development Server
```bash
npm run dev
```
Check for:
- No console errors
- No hydration warnings
- All pages load correctly

### 2. Build
```bash
npm run build
```
Check for:
- Build completes successfully
- No TypeScript errors (if enabled)
- Bundle size is reasonable

### 3. Production Preview
```bash
npm run start
# Or serve the out/ directory
npx serve out
```

### 4. Key Pages to Test
- Homepage (/)
- About (/about)
- Projects (/projects)
- Contact (/contact)
- Admin Dashboard (/admin/dashboard)

---

## Current Package Versions (Working)

### Core
- next: 15.5.5
- react: 19.1.0
- react-dom: 19.1.0

### Backend
- appwrite: 18.2.0 (client SDK)
- node-appwrite: 17.2.0 (server SDK)

### UI Libraries
- @radix-ui/*: 1.x (various)
- framer-motion: 12.14.0
- lucide-react: 0.545.0 (updated)

### Styling
- tailwindcss: 4.1.5
- tailwind-merge: 3.3.0
- class-variance-authority: 0.7.1

### Forms & Validation
- react-hook-form: 7.56.4
- zod: 3.25.76
- @hookform/resolvers: 5.0.1

---

## Troubleshooting

### Issue: npm install fails with ETARGET error
**Solution**: Use `--legacy-peer-deps --no-package-lock` flags

### Issue: Hydration mismatch errors
**Solution**: Ensure time-based or random content only renders on client
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
return mounted ? <ClientContent /> : <ServerContent />;
```

### Issue: Image quality warnings
**Solution**: Add `qualities` array to next.config.mjs:
```javascript
images: {
  qualities: [75, 85, 90, 95, 100],
  // ... other config
}
```

### Issue: Build warnings about headers/redirects
**Solution**: This is expected for static export. Use `public/_headers` and `public/_redirects` instead.

---

## Quick Reference

```bash
# Check outdated packages
npm outdated

# Update safe packages
npm install --legacy-peer-deps --no-package-lock lucide-react@latest node-appwrite@latest

# Test everything
npm run dev
npm run build

# Deploy
git add .
git commit -m "Update dependencies"
git push
```

---

## Notes

- Always test locally before deploying
- Keep package.json in version control
- Don't commit package-lock.json (it's in .gitignore)
- Use `--legacy-peer-deps` for all npm commands in this project
- The project uses React 19 which some packages don't officially support yet

