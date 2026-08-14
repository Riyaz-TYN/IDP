import { createBackendPlugin, coreServices } from '@backstage/backend-plugin-api';
import express from 'express';

interface TeamConfig {
  username: string;
  password: string;
  groupId: string;
  displayName: string;
  members: string[];
}

export const credentialsAuthPlugin = createBackendPlugin({
  pluginId: 'credentials-auth',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
      },
      async init({ httpRouter, config }) {
        // Load all team credentials from config
        const teamConfigs = config.getConfigArray('credentialsAuth.teams');
        const teams: TeamConfig[] = teamConfigs.map(t => ({
          username:    t.getString('username'),
          password:    t.getString('password'),
          groupId:     t.getString('groupId'),
          displayName: t.getString('displayName'),
          members:     t.getStringArray('members'),
        }));

        const router = express.Router();
        router.use(express.json());

        // POST /api/credentials-auth/login
        router.post('/login', (req, res) => {
          const { username, password } = req.body ?? {};
          const match = teams.find(
            t => t.username === username && t.password === password,
          );
          if (match) {
            res.json({
              success:     true,
              groupId:     match.groupId,
              displayName: match.displayName,
              members:     match.members,
            });
          } else {
            res.status(401).json({ error: 'Invalid credentials' });
          }
        });

        httpRouter.use(router);
        httpRouter.addAuthPolicy({ path: '/login', allow: 'unauthenticated' });
      },
    });
  },
});
