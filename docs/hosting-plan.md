# Tetris Flip: S3 Hosting Plan and Requirements

## Overview

Goal: publish the browser build of Tetris Flip to `game.adamandreason.com` using AWS S3
(static hosting) + CloudFront (HTTPS + caching) + Route 53 DNS.

## Viability

The project already builds as a static site with Vite (`npm run build` -> `dist/`).
That output is suitable for S3 + CloudFront hosting. There is no server-side dependency.
High scores are stored in browser storage per domain, so this subdomain will have its
own local leaderboard.

## Decisions Needed

- Domain: `game.adamandreason.com` (chosen).
- DNS hosting: Route 53 (chosen).
- HTTPS: CloudFront + ACM (chosen).
- Deployment method: AWS CLI (chosen; optional CI later).
- Cache behavior: long cache for assets, short cache for `index.html`.

## Build Requirements

- Node.js LTS installed locally.
- AWS CLI installed and configured on this PC.
- Build output path: `dist/`.
- Vite base path: currently `./` in `vite.config.js` (works for S3 roots and subpaths).
  If you want absolute URLs at the root, use `/` instead.

## Recommended Path: S3 + CloudFront + Route 53 (HTTPS)

### Step 1: Install and configure AWS CLI (one time)

Install the AWS CLI on Windows:

```bash
winget install -e --id Amazon.AWSCLI
```

Configure credentials and default region:

```bash
aws configure
```

Verify it works:

```bash
aws sts get-caller-identity
```

### Step 2: Build the site locally

```bash
npm install
npm run build
```

Optional local test:

```bash
npm run preview
```

### Step 3: Create the S3 bucket

- Create a bucket (example: `game.adamandreason.com`).
- Keep "Block all public access" enabled (CloudFront will access it privately).
- Do not enable static website hosting.

### Step 4: Upload the build output

Using AWS CLI (recommended):

```bash
aws s3 sync dist s3://game.adamandreason.com --delete
```

If you want optimized caching:

```bash
# Upload HTML with no-cache
aws s3 cp dist/index.html s3://game.adamandreason.com/index.html --cache-control "no-cache"

# Upload everything else with long cache
aws s3 sync dist s3://game.adamandreason.com \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable"
```

Deployment script:

```bash
.\scripts\deploy-aws.ps1 -Bucket game.adamandreason.com -DistributionId YOUR_DIST_ID
```

If you skip the `-DistributionId`, the script will just upload and skip invalidation.

### Step 5: Create the CloudFront distribution

- Origin: the S3 bucket (not the website endpoint).
- Enable Origin Access Control (OAC) and grant access to the bucket.
- Default root object: `index.html`.
- Add custom error responses (recommended):
  - 403 -> `/index.html` (200)
  - 404 -> `/index.html` (200)
- Add alternate domain name (CNAME): `game.adamandreason.com`.

### Step 6: Add HTTPS certificate (ACM)

- Request a certificate in **us-east-1** for the chosen subdomain.
- Validate via DNS (Route 53 makes this one click).
- Attach the certificate to the CloudFront distribution.

### Step 7: DNS routing (Route 53)

- Create an A/AAAA alias record to the CloudFront distribution for the subdomain.
- Wait for DNS + CloudFront propagation (usually 5-30 minutes).

### Step 8: Verify

- Visit `https://game.adamandreason.com`.
- Confirm audio, input, and local leaderboard storage work.

## Simpler Alternative: S3 Static Website (HTTP Only)

This is faster to set up but does not provide HTTPS on a custom domain.

### Steps

1. Create a public S3 bucket named after the subdomain.
2. Disable "Block all public access" and add a bucket policy for public read.
3. Enable static website hosting.
4. Set Index document: `index.html`.
5. Set Error document: `index.html` (optional but helpful).
6. Upload `dist/` contents.
7. Create a CNAME record to the S3 website endpoint.

## Deployment Checklist

- `npm run build` completed successfully.
- `dist/index.html` exists at the bucket root.
- CloudFront has `index.html` as the default root object.
- DNS resolves to the distribution.
- Cache headers are reasonable.

## Open Questions

- What is the CloudFront distribution ID (for invalidation in deploy script)?
- Should we add a CI deploy (GitHub Actions) later?
