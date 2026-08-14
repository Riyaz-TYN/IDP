#!/usr/bin/env node
/**
 * NiFo IDP — SQLite → PostgreSQL migration
 *
 * Migrates the custom team credential tables (tyn_teams, tyn_members) from
 * the local SQLite database to a PostgreSQL database.
 *
 * All other Backstage plugin tables (catalog, auth, scaffolder, search, …)
 * are created and migrated automatically by Backstage's built-in Knex
 * migrations on the first boot against the new database — no action needed.
 *
 * Usage:
 *   POSTGRES_HOST=your-db.rds.amazonaws.com \
 *   POSTGRES_PORT=5432 \
 *   POSTGRES_USER=backstage \
 *   POSTGRES_PASSWORD=secret \
 *   POSTGRES_DB=backstage \
 *   node scripts/migrate-to-postgres.js
 *
 * Optional:
 *   POSTGRES_SSL=false   — disable SSL (not recommended for production)
 *   SQLITE_PATH=...      — override the SQLite file path
 */

'use strict';

const path = require('path');
const fs   = require('fs');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SQLITE_PATH = process.env.SQLITE_PATH ||
  path.join(__dirname, '../packages/backend/db/credentials-auth.sqlite');

const PG = {
  host:     process.env.POSTGRES_HOST,
  port:     parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user:     process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl:      process.env.POSTGRES_SSL === 'false' ? false : { rejectUnauthorized: false },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function check(label, value) {
  if (!value) {
    console.error(`✗  Missing: ${label}`);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // 1. Validate env vars
  const ok = [
    check('POSTGRES_HOST',     PG.host),
    check('POSTGRES_USER',     PG.user),
    check('POSTGRES_PASSWORD', PG.password),
    check('POSTGRES_DB',       PG.database),
  ].every(Boolean);

  if (!ok) {
    console.error('\nSet the missing environment variables and re-run.\n');
    process.exit(1);
  }

  // 2. Validate SQLite file exists
  if (!fs.existsSync(SQLITE_PATH)) {
    console.error(`\n✗  SQLite file not found: ${SQLITE_PATH}`);
    console.error('   Run the Backstage backend locally at least once so the database is created,');
    console.error('   then run this script before switching to PostgreSQL.\n');
    process.exit(1);
  }

  // 3. Read from SQLite
  const Database = require('better-sqlite3');
  console.log(`\n→ Reading SQLite: ${SQLITE_PATH}`);
  const sqlite = new Database(SQLITE_PATH, { readonly: true });

  let teams   = [];
  let members = [];
  try {
    teams   = sqlite.prepare('SELECT * FROM tyn_teams').all();
    members = sqlite.prepare('SELECT group_id, member_name FROM tyn_members').all();
  } catch (err) {
    console.error(`✗  Could not read tables: ${err.message}`);
    console.error('   The tyn_teams / tyn_members tables may not exist yet.');
    console.error('   Start the backend once to create them, then re-run.\n');
    sqlite.close();
    process.exit(1);
  }
  sqlite.close();

  console.log(`   Found ${teams.length} team(s) and ${members.length} member row(s).`);

  // 4. Connect to PostgreSQL
  const { Client } = require('pg');
  const pg = new Client(PG);
  try {
    await pg.connect();
  } catch (err) {
    console.error(`\n✗  Could not connect to PostgreSQL: ${err.message}\n`);
    process.exit(1);
  }
  console.log(`→ Connected to PostgreSQL: ${PG.host}:${PG.port}/${PG.database}`);

  try {
    await pg.query('BEGIN');

    // 5. Create schema (mirrors credentialsModule.ts ensureSchema)
    await pg.query(`
      CREATE TABLE IF NOT EXISTS tyn_teams (
        group_id     VARCHAR(255) PRIMARY KEY,
        username     VARCHAR(255) NOT NULL UNIQUE,
        password     VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL
      )
    `);
    await pg.query(`
      CREATE TABLE IF NOT EXISTS tyn_members (
        id          SERIAL PRIMARY KEY,
        group_id    VARCHAR(255) NOT NULL REFERENCES tyn_teams(group_id) ON DELETE CASCADE,
        member_name VARCHAR(255) NOT NULL
      )
    `);

    // 6. Migrate tyn_teams (skip duplicates by group_id)
    let teamsNew = 0;
    let teamsSkipped = 0;
    for (const row of teams) {
      const res = await pg.query(
        `INSERT INTO tyn_teams (group_id, username, password, display_name)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (group_id) DO NOTHING`,
        [row.group_id, row.username, row.password, row.display_name],
      );
      if (res.rowCount > 0) teamsNew++;
      else teamsSkipped++;
    }

    // 7. Migrate tyn_members — replace all members for each group
    let membersTotal = 0;
    const groupIds = [...new Set(members.map(m => m.group_id))];
    for (const gid of groupIds) {
      // Replace rather than skip so member lists stay accurate on re-runs
      await pg.query('DELETE FROM tyn_members WHERE group_id = $1', [gid]);
      const rows = members.filter(m => m.group_id === gid);
      for (const m of rows) {
        await pg.query(
          'INSERT INTO tyn_members (group_id, member_name) VALUES ($1, $2)',
          [m.group_id, m.member_name],
        );
        membersTotal++;
      }
    }

    await pg.query('COMMIT');

    console.log('\n✓  Migration complete:');
    console.log(`   Teams   — ${teamsNew} inserted, ${teamsSkipped} already existed (skipped)`);
    console.log(`   Members — ${membersTotal} inserted (replaced per group)\n`);

    if (teamsSkipped > 0) {
      console.log('   Note: existing teams were not overwritten. To update passwords or');
      console.log('   display names, edit them directly in the /teams UI after migration.\n');
    }
  } catch (err) {
    await pg.query('ROLLBACK');
    console.error(`\n✗  Migration failed (rolled back): ${err.message}\n`);
    process.exit(1);
  } finally {
    await pg.end();
  }
}

main().catch(err => {
  console.error(`\n✗  Unexpected error: ${err.message}\n`);
  process.exit(1);
});
