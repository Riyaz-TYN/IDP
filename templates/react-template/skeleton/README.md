# ${{ values.name }}

This is a standalone React application pre-configured to use our internal design system (`@riyaz-tyn/shared-ui`).

## 🚀 Quick Start (Local Development)

You only need **Node.js** and **pnpm** installed.

### First time on a new machine (one-time only)

Set your GitHub Packages token as a system environment variable.  
Get the token from your team's internal docs / onboarding guide.

**Windows:**
```powershell
[System.Environment]::SetEnvironmentVariable("GITHUB_PACKAGES_TOKEN", "your-token-here", "User")
# Then restart your terminal
```

**Mac/Linux** — add to `~/.zshrc` or `~/.bashrc`:
```bash
export GITHUB_PACKAGES_TOKEN=your-token-here
```

Once set, this works for **every** `@riyaz-tyn` project automatically — never set it again.

### Every time (normal workflow)
3. **View the App**
   Open your browser and navigate to the localhost URL provided in your terminal (usually `http://localhost:5173`).

---

## 🏗️ Architecture (Golden Path)

This project follows our strict Golden Path folder structure. Please place your code in the appropriate directories:
- `src/components/`: App-specific React components.
- `src/pages/`: Route-level page components.
- `src/assets/`: Static files (images, fonts, etc).
- `src/hooks/`: Custom React hooks.
- `src/utils/`: Helper functions.

> **⚠️ Note on Shared Components**
> Do not build generic UI components (like Buttons, Inputs, Modals) in this repository. Always import them directly from `@tyn/shared-ui`.

---

*(For Platform Engineers: When this repository is deployed as part of the `TYN-NFIO-RE` monorepo via Git Submodules, `pnpm` will automatically override the NPM registry and symlink the local `shared-ui` workspace instead of fetching it over the network.)*
