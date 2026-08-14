import { createElement } from 'react';
import { PageBlueprint, createFrontendModule } from '@backstage/frontend-plugin-api';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';

const teamsPage = PageBlueprint.make({
  name: 'teams',
  params: {
    path: '/teams',
    title: 'Teams',
    icon: createElement(PeopleAltIcon),
    loader: async () => {
      const { TeamsPage } = await import('./TeamsPage');
      return createElement(TeamsPage);
    },
  },
});

export const teamsModule = createFrontendModule({
  pluginId: 'app',
  extensions: [teamsPage],
});
