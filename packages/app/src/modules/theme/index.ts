import { createElement, type ReactNode } from 'react';
import { ThemeBlueprint } from '@backstage/plugin-app-react';
import {
  createUnifiedTheme,
  palettes,
  UnifiedThemeProvider,
  genPageTheme,
  shapes,
} from '@backstage/theme';
import { createFrontendModule } from '@backstage/frontend-plugin-api';

const nifoLightTheme = createUnifiedTheme({
  palette: {
    ...palettes.light,
    primary: {
      main: '#0070C0',
      light: '#338FCC',
      dark: '#005A99',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10233F',
      light: '#1E3A5F',
      dark: '#071529',
      contrastText: '#ffffff',
    },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    success: { main: '#10b981' },
    info: { main: '#22D3EE' },
    background: {
      default: '#f7f9fc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      disabled: '#94a3b8',
    },
    navigation: {
      background: '#10233F',
      indicator: '#22D3EE',
      color: '#cbd5e1',
      selectedColor: '#ffffff',
      navItem: {
        hoverBackground: 'rgba(34,211,238,0.08)',
      },
      submenu: {
        background: '#0d1e35',
      },
    },
    pinSidebarButton: {
      icon: '#cbd5e1',
      background: '#1E3A5F',
    },
    tabbar: {
      indicator: '#0070C0',
    },
  } as any,
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  defaultPageTheme: 'home',
  pageTheme: {
    home: genPageTheme({ colors: ['#10233F', '#0070C0'], shape: shapes.wave }),
    documentation: genPageTheme({ colors: ['#005A99', '#338FCC'], shape: shapes.wave2 }),
    tool: genPageTheme({ colors: ['#10233F', '#1E3A5F'], shape: shapes.round }),
    service: genPageTheme({ colors: ['#0070C0', '#22D3EE'], shape: shapes.wave }),
    website: genPageTheme({ colors: ['#22D3EE', '#0070C0'], shape: shapes.wave }),
    library: genPageTheme({ colors: ['#10233F', '#0070C0'], shape: shapes.wave2 }),
    other: genPageTheme({ colors: ['#10233F', '#1E3A5F'], shape: shapes.round }),
    app: genPageTheme({ colors: ['#0070C0', '#10233F'], shape: shapes.wave }),
    apis: genPageTheme({ colors: ['#10233F', '#22D3EE'], shape: shapes.round }),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#0070C0',
          '&:hover': { backgroundColor: '#005A99' },
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(16,35,63,0.08)',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6 },
        colorPrimary: {
          backgroundColor: '#dbeafe',
          color: '#0070C0',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: '#475569',
          fontWeight: 600,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#0070C0',
          '&:hover': { color: '#005A99' },
        },
      },
    },
  },
});

const nifoThemeExtension = ThemeBlueprint.make({
  name: 'nifo-light',
  params: {
    theme: {
      id: 'nifo-light',
      title: 'NiFo Light',
      variant: 'light',
      Provider: ({ children }: { children: ReactNode }) =>
        createElement(UnifiedThemeProvider, { theme: nifoLightTheme, children }),
    },
  },
});

export const themeModule = createFrontendModule({
  pluginId: 'app',
  extensions: [nifoThemeExtension],
});
