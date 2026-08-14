import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { navModule } from './modules/nav';
import { themeModule } from './modules/theme';
import { teamsModule } from './modules/teams';

export default createApp({
  features: [catalogPlugin, navModule, themeModule, teamsModule],
});
