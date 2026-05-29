/**
 * Seeds the OpenSearch `restaurants` index from dashdoor.db.
 * Idempotent: deletes and recreates the index on every run.
 *
 * Run: npx tsx scripts/seed-opensearch.ts
 * Requires OpenSearch on OPENSEARCH_URL (default http://localhost:9200).
 */

// @ts-expect-error — better-sqlite3 ships without types
import Database from 'better-sqlite3';
import { join } from 'path';
import { INDEX_NAME, INDEX_MAPPING } from '../tools/reco-engines/opensearch/index-schema';

const OPENSEARCH_URL = process.env.OPENSEARCH_URL ?? 'http://localhost:9200';
const DB_PATH = join(process.cwd(), 'data/db/dashdoor.db');

type RestaurantRow = {
  id: number;
  name: string;
  cuisine: string;
  city: string;
  state: string;
  zip_code: string;
  price_range: number;
  featured: number | null;
  latitude: number | null;
  longitude: number | null;
  avg_rating: number | null;
};

async function osRequest(path: string, method: string, body?: unknown): Promise<unknown> {
  const res = await fetch(`${OPENSEARCH_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok && res.status !== 404) {
    throw new Error(`OpenSearch ${method} ${path} → ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

async function main() {
  const db = new Database(DB_PATH, { readonly: true });

  const rows: RestaurantRow[] = db
    .prepare(
      `SELECT
        r.id, r.name, r.cuisine, r.city, r.state, r.zip_code,
        r.price_range, r.featured, r.latitude, r.longitude,
        AVG(CASE WHEN ur.approval_status = 'approved' THEN ur.rating END) AS avg_rating
      FROM restaurants r
      LEFT JOIN user_reviews ur
        ON ur.store_id = r.id AND ur.store_category = 'restaurant'
      GROUP BY r.id`
    )
    .all() as RestaurantRow[];

  console.log(`Loaded ${rows.length} restaurants from ${DB_PATH}`);

  // Delete existing index (ignore 404)
  await osRequest(`/${INDEX_NAME}`, 'DELETE');
  console.log(`Deleted index '${INDEX_NAME}' (or it didn't exist)`);

  // Create index with mapping
  await osRequest(`/${INDEX_NAME}`, 'PUT', INDEX_MAPPING);
  console.log(`Created index '${INDEX_NAME}'`);

  // Bulk index all restaurants
  const bulkLines: string[] = [];
  for (const row of rows) {
    bulkLines.push(JSON.stringify({ index: { _index: INDEX_NAME, _id: String(row.id) } }));
    bulkLines.push(
      JSON.stringify({
        id: row.id,
        name: row.name,
        cuisine: row.cuisine,
        city: row.city,
        state: row.state,
        zip_code: row.zip_code,
        price_range: row.price_range,
        featured: Boolean(row.featured),
        avg_rating: row.avg_rating ?? 4.0,
        location:
          row.latitude != null && row.longitude != null
            ? { lat: row.latitude, lon: row.longitude }
            : undefined,
      })
    );
  }

  const bulkBody = bulkLines.join('\n') + '\n';
  const bulkRes = await fetch(`${OPENSEARCH_URL}/${INDEX_NAME}/_bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-ndjson' },
    body: bulkBody,
  });
  const bulkJson = (await bulkRes.json()) as { errors: boolean; items: unknown[] };

  if (bulkJson.errors) {
    console.error('Bulk index had errors:', JSON.stringify(bulkJson.items.slice(0, 5), null, 2));
    process.exit(1);
  }

  console.log(`Indexed ${rows.length} restaurants into '${INDEX_NAME}' — done.`);
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
