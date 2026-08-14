import { createBackendPlugin, coreServices } from '@backstage/backend-plugin-api';
import express from 'express';
import type { Knex } from 'knex';

interface TeamConfig {
  username: string;
  password: string;
  groupId: string;
  displayName: string;
  members: string[];
}

interface TeamRow {
  group_id: string;
  username: string;
  password: string;
  display_name: string;
}

async function ensureSchema(db: Knex) {
  if (!(await db.schema.hasTable('tyn_teams'))) {
    await db.schema.createTable('tyn_teams', t => {
      t.string('group_id').primary();
      t.string('username').notNullable().unique();
      t.string('password').notNullable();
      t.string('display_name').notNullable();
    });
  }
  if (!(await db.schema.hasTable('tyn_members'))) {
    await db.schema.createTable('tyn_members', t => {
      t.increments('id').primary();
      t.string('group_id').notNullable();
      t.string('member_name').notNullable();
    });
  }
}

async function seedFromConfig(db: Knex, teams: TeamConfig[]) {
  const row = await db('tyn_teams').count('* as n').first();
  if (Number(row?.n ?? 0) > 0) return;
  for (const team of teams) {
    await db('tyn_teams').insert({
      group_id: team.groupId,
      username: team.username,
      password: team.password,
      display_name: team.displayName,
    });
    for (const m of team.members) {
      await db('tyn_members').insert({ group_id: team.groupId, member_name: m });
    }
  }
}

async function getTeamsWithMembers(db: Knex) {
  const teams: TeamRow[] = await db('tyn_teams').select('*');
  const members: { group_id: string; member_name: string }[] = await db('tyn_members').select('group_id', 'member_name');
  return teams.map(t => ({
    groupId: t.group_id,
    username: t.username,
    displayName: t.display_name,
    members: members.filter(m => m.group_id === t.group_id).map(m => m.member_name),
  }));
}

export const credentialsAuthPlugin = createBackendPlugin({
  pluginId: 'credentials-auth',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
        database: coreServices.database,
      },
      async init({ httpRouter, config, database }) {
        const db = await database.getClient();
        await ensureSchema(db);

        // Seed initial teams from config on first boot
        let configTeams: TeamConfig[] = [];
        try {
          configTeams = config.getConfigArray('credentialsAuth.teams').map(t => ({
            username:    t.getString('username'),
            password:    t.getString('password'),
            groupId:     t.getString('groupId'),
            displayName: t.getString('displayName'),
            members:     t.getStringArray('members'),
          }));
        } catch { /* no config teams */ }
        await seedFromConfig(db, configTeams);

        const router = express.Router();
        router.use(express.json());

        // ── Auth ─────────────────────────────────────────────────────────────

        router.post('/login', async (req, res) => {
          const { username, password } = req.body ?? {};
          const team = await db('tyn_teams').where({ username, password }).first() as TeamRow | undefined;
          if (!team) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
          }
          const members = await db('tyn_members')
            .where({ group_id: team.group_id })
            .pluck('member_name') as string[];
          res.json({
            success:     true,
            groupId:     team.group_id,
            displayName: team.display_name,
            members,
          });
        });

        // ── Team CRUD ─────────────────────────────────────────────────────────

        // GET /teams — list all teams with members
        router.get('/teams', async (_req, res) => {
          const teams = await getTeamsWithMembers(db);
          res.json(teams);
        });

        // POST /teams — create a new team
        router.post('/teams', async (req, res) => {
          const { groupId, username, password, displayName, members } = req.body ?? {};
          if (!groupId || !username || !password || !displayName) {
            res.status(400).json({ error: 'groupId, username, password and displayName are required' });
            return;
          }
          try {
            await db('tyn_teams').insert({
              group_id:     groupId,
              username,
              password,
              display_name: displayName,
            });
            for (const m of (members ?? []) as string[]) {
              if (m.trim()) await db('tyn_members').insert({ group_id: groupId, member_name: m.trim() });
            }
            const team = (await getTeamsWithMembers(db)).find(t => t.groupId === groupId);
            res.status(201).json(team);
          } catch (err: any) {
            if (err?.message?.includes('UNIQUE')) {
              res.status(409).json({ error: 'A team with that username or groupId already exists' });
            } else {
              res.status(500).json({ error: String(err?.message) });
            }
          }
        });

        // PUT /teams/:groupId — update display name and/or members
        router.put('/teams/:groupId', async (req, res) => {
          const { groupId } = req.params;
          const { displayName, members } = req.body ?? {};
          const existing = await db('tyn_teams').where({ group_id: groupId }).first();
          if (!existing) {
            res.status(404).json({ error: 'Team not found' });
            return;
          }
          if (displayName) {
            await db('tyn_teams').where({ group_id: groupId }).update({ display_name: displayName });
          }
          if (Array.isArray(members)) {
            await db('tyn_members').where({ group_id: groupId }).delete();
            for (const m of members as string[]) {
              if (m.trim()) await db('tyn_members').insert({ group_id: groupId, member_name: m.trim() });
            }
          }
          const team = (await getTeamsWithMembers(db)).find(t => t.groupId === groupId);
          res.json(team);
        });

        // DELETE /teams/:groupId — delete a team and its members
        router.delete('/teams/:groupId', async (req, res) => {
          const { groupId } = req.params;
          const existing = await db('tyn_teams').where({ group_id: groupId }).first();
          if (!existing) {
            res.status(404).json({ error: 'Team not found' });
            return;
          }
          await db('tyn_members').where({ group_id: groupId }).delete();
          await db('tyn_teams').where({ group_id: groupId }).delete();
          res.json({ success: true });
        });

        httpRouter.use(router);
        httpRouter.addAuthPolicy({ path: '/login',          allow: 'unauthenticated' });
        httpRouter.addAuthPolicy({ path: '/teams',          allow: 'unauthenticated' });
        httpRouter.addAuthPolicy({ path: '/teams/:groupId', allow: 'unauthenticated' });
      },
    });
  },
});
