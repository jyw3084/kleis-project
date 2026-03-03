import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from './connection.js';

const MIGRATIONS_DIR = join(
  fileURLToPath(import.meta.url),
  '..',
  'migrations',
);

function loadMigrations(): { name: string; sql: string }[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => ({
      name: basename(f, '.sql'),
      sql: readFileSync(join(MIGRATIONS_DIR, f), 'utf-8'),
    }));
}

export function runMigrationsWithDb(
  db: import('better-sqlite3').Database,
): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name       TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    db
      .prepare('SELECT name FROM _migrations')
      .all()
      .map((row) => (row as { name: string }).name),
  );

  const migrations = loadMigrations();

  const runAll = db.transaction(() => {
    for (const migration of migrations) {
      if (applied.has(migration.name)) continue;
      db.exec(migration.sql);
      db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(
        migration.name,
      );
      console.log(`Applied migration: ${migration.name}`);
    }
  });

  runAll();
}

export function runMigrations(): void {
  runMigrationsWithDb(getDb());
}
