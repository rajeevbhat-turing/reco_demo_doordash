import { db } from '@/lib/db';
import type { RecoTask } from './task-loader';

/**
 * Leave-one-out task generator over the `orders` table.
 *
 * For each user with ≥ 3 orders we hold out the *most recent* order's
 * store as ground truth; the engine is then scored on whether it would
 * have recommended that store given the user's earlier orders as
 * signal. Lat/lng come from the user's default address — same input the
 * production `/home` feed gets.
 *
 * This is the noisier ground-truth source. It pairs well with the
 * curated seed in `data/reco-tasks/seed.json` (precision) — history
 * gives breadth.
 */
export async function loadHistorySplitTasks(limit?: number): Promise<RecoTask[]> {
  // For each user with ≥ 3 orders, take the most recent order. The
  // address we use for lat/lng is the *order's* address, not the user's
  // current default — synthetic users often have multiple addresses
  // across cities, and the default is frequently not where the order
  // was placed.
  const rows = await db.query<{
    user_id: number;
    email: string;
    order_count: number;
    last_order_id: number;
    store_id: number;
    addr_lat: number;
    addr_lng: number;
  }>(
    `WITH counts AS (
       SELECT user_id, COUNT(*) AS n
         FROM orders WHERE store_id IS NOT NULL
        GROUP BY user_id HAVING COUNT(*) >= 3
     ),
     last_orders AS (
       SELECT o.user_id, o.id AS order_id, o.store_id, o.address_id,
              ROW_NUMBER() OVER (PARTITION BY o.user_id
                                 ORDER BY datetime(o.order_date) DESC) AS rn
         FROM orders o
        WHERE o.store_id IS NOT NULL
     )
     SELECT u.id AS user_id, u.email,
            c.n AS order_count,
            lo.order_id AS last_order_id, lo.store_id,
            a.latitude AS addr_lat, a.longitude AS addr_lng
       FROM users u
       JOIN counts c       ON c.user_id = u.id
       JOIN last_orders lo ON lo.user_id = u.id AND lo.rn = 1
       JOIN addresses a    ON a.id = lo.address_id
      WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL
      ORDER BY c.n DESC
      ${limit ? `LIMIT ${limit}` : ''}`
  );

  return rows.map(r => ({
    taskId: `history-${r.user_id}`,
    surface: 'home_feed',
    userEmail: r.email,
    userLat: r.addr_lat,
    userLng: r.addr_lng,
    statement: `Leave-one-out: user has ${r.order_count} orders; predict the most recent store (order #${r.last_order_id}).`,
    expectedItemIds: [String(r.store_id)],
    expectedKind: 'restaurant',
  }));
}
