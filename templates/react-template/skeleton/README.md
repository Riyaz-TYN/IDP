# ${{ parameters.name }}

This is a standalone React application pre-configured to use our internal design system (`@tyn/shared-ui`).

## 🚀 Quick Start (Local Development)

To run this application locally, you only need Node.js and `pnpm` installed on your machine.

1. **Install Dependencies**
   Run the following command to install all required packages. This will automatically download our pre-built `@tyn/shared-ui` components from the registry:
   ```bash
   pnpm install
   ```

2. **Start the Development Server**
   Start the Vite development server with hot-module replacement (HMR):
   ```bash
   pnpm run dev
   ```

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
