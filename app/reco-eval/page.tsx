import { notFound } from 'next/navigation';
import RecoEvalClient from './reco-eval-client';

export const dynamic = 'force-dynamic';

export default function Page() {
  if (process.env.RECO_DEMO !== '1') notFound();
  return <RecoEvalClient />;
}
