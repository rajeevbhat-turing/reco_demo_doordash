import * as fs from 'node:fs';
import * as path from 'node:path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { marked } from 'marked';

export const dynamic = 'force-static';

/**
 * Whitelist of repo-root markdown docs we expose on the demo. Keep
 * this list tight — it controls which files are reachable at
 * `/docs/<slug>`. Anything not listed → 404.
 */
const DOCS: Record<string, { file: string; title: string }> = {
  overview: { file: 'OVERVIEW.md', title: 'What this is, how it works, why it matters' },
  'byo-llm': { file: 'BYO_LLM.md', title: 'Bring your own LLM' },
  'reco-http-contract': {
    file: 'docs/reco-http-contract.md',
    title: 'Reco HTTP wire contract',
  },
};

export async function generateStaticParams() {
  return Object.keys(DOCS).map(slug => ({ slug }));
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (process.env.RECO_DEMO !== '1') notFound();
  const entry = DOCS[slug];
  if (!entry) notFound();

  const absPath = path.join(process.cwd(), entry.file);
  if (!fs.existsSync(absPath)) notFound();
  const md = fs.readFileSync(absPath, 'utf-8');
  const html = await marked.parse(md, { async: true, gfm: true });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 pt-24 pb-12">
        <div className="mb-6 flex items-center justify-between text-sm">
          <Link href="/demo" className="text-gray-500 hover:text-gray-800">
            ← Back to /demo
          </Link>
          <Link href="/reco-eval" className="text-gray-500 hover:text-gray-800">
            Back to /reco-eval →
          </Link>
        </div>
        <article
          className="markdown-doc rounded-lg border border-gray-200 bg-white p-8 shadow-sm text-sm text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </main>
  );
}

// Page-level meta — show the doc title in the browser tab.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = DOCS[slug];
  return { title: entry ? `${entry.title} — Dashdoor reco demo` : 'Not found' };
}
