#!/bin/sh
# One-time setup for developers to install @riyaz-tyn packages.
# Get the GITHUB_PACKAGES_TOKEN from your team's internal docs / 1Password / Notion.

echo "Enter your GitHub Packages read-only token:"
read TOKEN
npm config set //npm.pkg.github.com/:_authToken "$TOKEN"
echo "Done! You can now run pnpm install."
