import { createBackendPlugin, coreServices } from '@backstage/backend-plugin-api';
import express from 'express';

export const credentialsAuthPlugin = createBackendPlugin({
  pluginId: 'credentials-auth',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
      },
      async init({ httpRouter, config }) {
        const validUsername = config.getString('credentialsAuth.username');
        const validPassword = config.getString('credentialsAuth.password');

        const router = express.Router();
        router.use(express.json());

        router.post('/login', (req, res) => {
          const { username, password } = req.body ?? {};
          if (username === validUsername && password === validPassword) {
            res.json({ success: true });
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
