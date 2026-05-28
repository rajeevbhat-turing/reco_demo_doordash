'use client';

import Link from 'next/link';

/**
 * Visible entry to /demo when RECO_DEMO is enabled. Styled as a red
 * pill that stands out in the header so clients can find the eval
 * harness without hunting (see how_to_use.md).
 */
export default function RecoDemoNavLink() {
  if (process.env.NEXT_PUBLIC_RECO_DEMO !== '1') {
    return null;
  }

  return (
    <Link
      href="/demo"
      className="shrink-0 rounded-full bg-[#eb1700ff] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-700 sm:text-sm"
      data-testid="reco-demo-nav-link"
    >
      Reco engine eval demo →
    </Link>
  );
}
