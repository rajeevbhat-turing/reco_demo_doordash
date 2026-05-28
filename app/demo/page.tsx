import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function DemoLandingPage() {
  if (process.env.RECO_DEMO !== '1') {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-2xl px-6 pt-24 pb-12">
        <p className="text-sm text-gray-500">
          <Link href="/home" className="hover:text-gray-800">
            ← Back to home
          </Link>
        </p>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Recommendation engine demo
        </h1>
        <p className="mt-4 text-base leading-relaxed text-gray-600">
          This Dashdoor gym scores recommendation engines and LLM agents on the same
          tasks and metrics. The consumer app is the real environment — agents drive the
          same UI a person would use.
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/docs/overview"
            className="font-medium text-red-600 hover:text-red-700 underline"
          >
            What is this? — one-page explainer for clients & 3rd-party teams →
          </Link>
        </p>

        <ul className="mt-8 space-y-4">
          <li className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Engine evaluation</h2>
            <p className="mt-1 text-sm text-gray-600">
              Compare random, popularity, Gorse, LightFM, and Implicit on seed or history
              tasks. Hit@K, NDCG, and per-task drilldowns.
            </p>
            <Link
              href="/reco-eval"
              className="mt-3 inline-block text-sm font-medium text-red-600 hover:text-red-700"
            >
              Open evaluation lab →
            </Link>
          </li>

          <li className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">LLM agent</h2>
            <p className="mt-1 text-sm text-gray-600">
              The agent drives a real browser through the gym. Scored on the same
              board as library engines. To use <strong>your own</strong> model
              without sharing keys, point the &quot;Bring your own&quot; panel at
              an OpenAI-compatible gateway you host (see{' '}
              <code className="rounded bg-gray-100 px-1 text-xs">BYO_LLM.md</code>).
            </p>
            <Link
              href="/reco-eval"
              className="mt-3 inline-block text-sm font-medium text-red-600 hover:text-red-700"
            >
              Run agent from eval lab →
            </Link>
          </li>

          <li className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Live re-rank</h2>
            <p className="mt-1 text-sm text-gray-600">
              On Home, use the Reco dropdown in the header to re-order the restaurant feed.
            </p>
            <Link
              href="/home"
              className="mt-3 inline-block text-sm font-medium text-red-600 hover:text-red-700"
            >
              Go to home feed →
            </Link>
          </li>
        </ul>

      </div>
    </main>
  );
}
