import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { ScmIntegrations } from '@backstage/integration';
import simpleGit from 'simple-git';

export const createGitSubmoduleAction = (integrations: ScmIntegrations) => {
  return createTemplateAction<{
    repoUrl: string;
    submoduleUrl: string;
    submodulePath: string;
  }>({
    id: 'monorepo:submodule:add',
    description: 'Adds a git submodule to the monorepo',
    schema: {
      input: {
        type: 'object',
        required: ['repoUrl', 'submoduleUrl', 'submodulePath'],
        properties: {
          repoUrl: { type: 'string', description: 'URL of the monorepo to clone' },
          submoduleUrl: { type: 'string', description: 'URL of the submodule to add' },
          submodulePath: { type: 'string', description: 'Path inside the monorepo to add the submodule' },
        },
      },
    },
    async handler(ctx) {
      const { repoUrl, submoduleUrl, submodulePath } = ctx.input;

      // Resolve the GitHub token from Backstage's integration config (app-config.yaml)
      const integration = integrations.github.byUrl(repoUrl);
      const githubToken = integration?.config?.token;

      if (!githubToken) {
        throw new Error(
          `No GitHub integration token found for URL: ${repoUrl}. ` +
          'Ensure integrations.github[].token is set in your app-config.yaml.',
        );
      }

      // Create a temporary directory for cloning the monorepo
      const tempDir = await ctx.createTemporaryDirectory();

      // Embed token in the clone URL so the initial clone authenticates
      const authenticatedRepoUrl = repoUrl.replace('https://', `https://${githubToken}@`);

      // GIT_TERMINAL_PROMPT=0 ensures git NEVER hangs waiting for a credential prompt
      const env = { ...process.env, GIT_TERMINAL_PROMPT: '0' };

      // Shared git config applied to all git operations:
      // url.insteadOf rewrites https://github.com → https://<token>@github.com
      // for ALL subsequent operations (submodule add, push) without storing
      // the token in .gitmodules (which stays clean with the plain URL).
      const gitConfig = [
        `url.https://${githubToken}@github.com.insteadOf=https://github.com`,
        'user.name=Backstage Scaffolder',
        'user.email=scaffolder@backstage.io',
      ];

      try {
        ctx.logger.info('Cloning monorepo...');
        await simpleGit({ config: gitConfig }).env(env).clone(authenticatedRepoUrl, tempDir);

        // Work inside the cloned repo from here on
        const repoGit = simpleGit({ baseDir: tempDir, config: gitConfig }).env(env);

        ctx.logger.info('Adding submodule (credentials injected transparently)...');
        // Use the plain submoduleUrl — the url.insteadOf rewrite above silently
        // injects the token when git fetches it, so .gitmodules stays token-free.
        await repoGit.submoduleAdd(submoduleUrl, submodulePath);

        ctx.logger.info('Committing changes...');
        await repoGit.add('.');
        await repoGit.commit(`feat: auto-added submodule for ${submodulePath}`);

        ctx.logger.info('Pushing to monorepo...');
        await repoGit.push();

        ctx.logger.info('Successfully added and pushed submodule!');
      } catch (error: any) {
        ctx.logger.error(`Failed to add submodule: ${error.message}`);
        throw error;
      }
    },
  });
};

export const customScaffolderModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'custom-git-actions',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolder, config }) {
        const integrations = ScmIntegrations.fromConfig(config);
        scaffolder.addActions(createGitSubmoduleAction(integrations));
      },
    });
  },
});
