/**
 * Seed a running Gorse instance with Dashdoor restaurants and order
 * history. Idempotent — re-running it just upserts.
 *
 * Usage (host shell):
 *   scripts/n.sh npx tsx scripts/seed-gorse.ts
 *
 * Env:
 *   RECO_GORSE_URL      base URL of the Gorse *server* (default :8088)
 *   RECO_GORSE_API_KEY  optional X-API-Key header
 *   LIBSQL_URL          dashdoor SQLite path (default ./data/db/dashdoor.db)
 */

import { createClient } from '@libsql/client';

const GORSE = (process.env.RECO_GORSE_URL ?? 'http://localhost:8088').replace(/\/$/, '');
const API_KEY = process.env.RECO_GORSE_API_KEY;
const DB_URL = process.env.LIBSQL_URL ?? 'file:./data/db/dashdoor.db';

async function gorse(path: string, method: 'GET' | 'POST', body?: unknown) {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (API_KEY) headers['X-API-Key'] = API_KEY;
  const res = await fetch(`${GORSE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${method} ${path} → HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

async function main() {
  const db = createClient({ url: DB_URL });
  console.log(`Seeding ${GORSE} from ${DB_URL}`);

  // Items = restaurants. Categories = cuisine + price tier + dashpass flag.
  const restaurants = (
    await db.execute(`SELECT r.id, r.name, r.cuisine, r.price_range, r.dash_pass,
                             (SELECT GROUP_CONCAT(rc.category_name, ',')
                                FROM restaurant_categories rc
                               WHERE rc.restaurant_id = r.id) AS categories
                        FROM restaurants r`)
  ).rows as unknown as {
    id: number;
    name: string;
    cuisine: string;
    price_range: number;
    dash_pass: number;
    categories: string | null;
  }[];

  console.log(`  items: ${restaurants.length}`);
  await gorse('/api/items', 'POST',
    restaurants.map(r => ({
      ItemId: String(r.id),
      IsHidden: false,
      Categories: [
        r.cuisine,
        `price:${'$'.repeat(r.price_range)}`,
        r.dash_pass ? 'dashpass' : 'non-dashpass',
        ...(r.categories?.split(',').filter(Boolean) ?? []),
      ],
      Comment: r.name,
    }))
  );

  // Users + order feedback (each order = one 'order' feedback).
  const users = (await db.execute('SELECT id FROM users')).rows as unknown as { id: number }[];
  console.log(`  users: ${users.length}`);
  await gorse('/api/users', 'POST',
    users.map(u => ({ UserId: String(u.id), Subscribe: [] }))
  );

  const orders = (
    await db.execute(`SELECT user_id, store_id, order_date FROM orders WHERE store_id IS NOT NULL`)
  ).rows as unknown as { user_id: number; store_id: number; order_date: string }[];
  console.log(`  feedback: ${orders.length}`);
  await gorse('/api/feedback', 'POST',
    orders.map(o => ({
      FeedbackType: 'order',
      UserId: String(o.user_id),
      ItemId: String(o.store_id),
      Timestamp: o.order_date,
    }))
  );

  console.log('Done. Gorse will start training in the background; check '
    + `${GORSE.replace(':8088', ':8087')}/dashboard.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
