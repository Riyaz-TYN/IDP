import { createBackendModule } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import simpleGit from 'simple-git';

export const createGitSubmoduleAction = () => {
  return createTemplateAction<{
    repoUrl: string;
    submoduleUrl: string;
    submodulePath: string;
    githubToken: string;
  }>({
    id: 'monorepo:submodule:add',
    description: 'Adds a git submodule to the monorepo',
    schema: {
      input: {
        type: 'object',
        required: ['repoUrl', 'submoduleUrl', 'submodulePath', 'githubToken'],
        properties: {
          repoUrl: { type: 'string', description: 'URL of the monorepo to clone' },
          submoduleUrl: { type: 'string', description: 'URL of the submodule to add' },
          submodulePath: { type: 'string', description: 'Path inside the monorepo to add the submodule' },
          githubToken: { type: 'string', description: 'GitHub Token for authentication' },
        },
      },
    },
    async handler(ctx) {
      const { repoUrl, submoduleUrl, submodulePath, githubToken } = ctx.input;
      
      ctx.logger.info(`Adding submodule ${submoduleUrl} to ${repoUrl} at ${submodulePath}`);
      
      // Create a temporary directory for cloning the monorepo
      const tempDir = await ctx.createTemporaryDirectory();
      
      // Inject token for authentication
      // Assuming urls like: https://github.com/org/repo.git
      const authenticatedRepoUrl = repoUrl.replace('https://', `https://${githubToken}@`);
      
      const git = simpleGit(tempDir);
      
      try {
        ctx.logger.info('Cloning monorepo...');
        await git.clone(authenticatedRepoUrl, tempDir);
        
        ctx.logger.info('Configuring git user...');
        await git.addConfig('user.name', 'Backstage Scaffolder');
        await git.addConfig('user.email', 'scaffolder@backstage.io');

        ctx.logger.info('Adding submodule...');
        await git.submoduleAdd(submoduleUrl, submodulePath);
        
        ctx.logger.info('Committing changes...');
        await git.add('.');
        await git.commit(`feat: auto-added submodule for ${submodulePath}`);
        
        ctx.logger.info('Pushing to monorepo...');
        await git.push();
        
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
      },
      async init({ scaffolder }) {
        scaffolder.addActions(createGitSubmoduleAction());
      },
    });
  },
});
