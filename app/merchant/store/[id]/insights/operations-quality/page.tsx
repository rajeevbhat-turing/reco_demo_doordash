'use client';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface MetricCardProps {
  title: string;
  description: string;
  status: 'on-track' | 'needs-attention';
  metrics: Array<{
    label: string;
    value: string;
    change?: string;
    hasInfo?: boolean;
  }>;
  goal: string;
  emptyStateImage: string;
  emptyStateTitle: string;
  emptyStateMessage: string;
  viewDetailsHref: string;
}

function MetricCard({
  title,
  description,
  status,
  metrics,
  goal,
  emptyStateImage,
  emptyStateTitle,
  emptyStateMessage,
  viewDetailsHref,
}: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xl font-bold text-gray-900 flex-grow">{title}</h3>
        <div className="ml-4">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
            On track
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-6">{description}</p>

      <div className="space-y-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="mb-4">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-sm text-gray-900">{metric.label}</span>
              {metric.hasInfo && (
                <svg
                  height="12"
                  width="12"
                  aria-hidden="true"
                  fill="none"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0 text-gray-400"
                >
                  <path
                    clipRule="evenodd"
                    d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14ZM8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                  <path d="M7 7.5H9V12H7V7.5Z" fill="currentColor" />
                  <path
                    d="M9.25 5.25C9.25 5.94036 8.69036 6.5 8 6.5C7.30964 6.5 6.75 5.94036 6.75 5.25C6.75 4.55964 7.30964 4 8 4C8.69036 4 9.25 4.55964 9.25 5.25Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-gray-900">{metric.value}</span>
              {metric.change && <span className="text-sm text-gray-900">{metric.change}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <svg
          height="16"
          width="16"
          aria-hidden="true"
          fill="none"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0 text-green-600"
        >
          <path
            d="M14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8ZM10.293 5.29297C10.6835 4.90244 11.3175 4.90244 11.708 5.29297C12.0985 5.68349 12.0985 6.31748 11.708 6.70801L7.37402 11.041C7.1865 11.2284 6.93213 11.334 6.66699 11.334C6.40183 11.3339 6.14746 11.2285 5.95996 11.041L4.29297 9.37402C3.90282 8.98353 3.90272 8.35039 4.29297 7.95996C4.68349 7.56944 5.31748 7.56944 5.70801 7.95996L6.66699 8.91895L10.293 5.29297ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8Z"
            fill="currentColor"
          />
        </svg>
        <button className="text-sm font-bold text-gray-900 hover:underline">{goal}</button>
      </div>

      <div className="flex flex-col items-center justify-center py-6 mb-6">
        <img
          src={emptyStateImage}
          alt=""
          className="mb-4"
          style={{ maxWidth: '200px', height: 'auto' }}
        />
        <h4 className="text-lg font-bold text-gray-900 mb-1">{emptyStateTitle}</h4>
        <p className="text-sm text-gray-900">{emptyStateMessage}</p>
      </div>

      {/* <Link
        href={viewDetailsHref}
        className="inline-flex items-center justify-center px-3 py-2 rounded-full text-sm font-bold text-gray-900 border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
      >
        View details
      </Link> */}
    </div>
  );
}

export default function OperationsQualityPage() {
  const params = useParams();
  const storeId = params?.id as string;

  return (
    <MerchantLayout>
      <div className="max-w-7xl" style={{ padding: '48px 0px' }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Operations quality</h1>
          <p className="text-sm text-gray-600">
            A measure of how good of an experience you are providing to your customers.
          </p>
        </div>

        {/* Areas requiring your attention */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Areas requiring your attention
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Improve these metrics to create a great customer experience.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Nov 1 – 27, 2025 compared to Oct 4 – 30, 2025
              </span>
              <span className="text-sm text-gray-600 underline decoration-dashed underline-offset-4">
                Last updated on Nov 25, 2025
              </span>
            </div>
          </div>
          {/* Empty state - no items requiring attention */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[200px] flex items-center justify-center">
            <p className="text-gray-500">No areas currently require attention</p>
          </div>
        </div>

        {/* Areas on track */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Areas on track</h2>
            <p className="text-sm text-gray-600 mb-6">
              Continue doing a good job in these areas of your operations.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Nov 1 – 27, 2025 compared to Oct 4 – 30, 2025
              </span>
              <span className="text-sm text-gray-600 underline decoration-dashed underline-offset-4">
                Last updated on Nov 25, 2025
              </span>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Wait time card */}
            <MetricCard
              title="Wait time"
              description="Total amount of time Dashers wait for orders at your store"
              status="on-track"
              metrics={[
                {
                  label: 'Avoidable wait',
                  value: '0 mins',
                  change: '—%',
                  hasInfo: true,
                },
                {
                  label: 'Total Dasher wait',
                  value: '0 mins',
                  change: '—%',
                  hasInfo: true,
                },
              ]}
              goal="Meets goal of 3 mins 24 sec or lower"
              emptyStateImage="/empty-state-default.svg"
              emptyStateTitle="There were no stores with late orders"
              emptyStateMessage="Nice work!"
              viewDetailsHref={`/merchant/store/${storeId}/insights/operations-quality/detail/avoidableWait`}
            />

            {/* Cancellations card */}
            <MetricCard
              title="Cancellations"
              description="Orders that were not prepared, picked up and/or delivered"
              status="on-track"
              metrics={[
                {
                  label: 'Avoidable cancellation rate',
                  value: '0.0%',
                  change: '—%',
                  hasInfo: true,
                },
                {
                  label: 'Sales lost',
                  value: '$0.00',
                  change: '—%',
                  hasInfo: true,
                },
              ]}
              goal="Meets goal of 1.1% or lower"
              emptyStateImage="/empty-state-default.svg"
              emptyStateTitle="There were no avoidable cancellations"
              emptyStateMessage="Nice work!"
              viewDetailsHref={`/merchant/store/${storeId}/insights/operations-quality/detail/avoidableCancellations`}
            />

            {/* Order accuracy card */}
            <MetricCard
              title="Order accuracy"
              description="A measure of orders reported with missing or incorrect items"
              status="on-track"
              metrics={[
                {
                  label: 'Missing or incorrect rate',
                  value: '0.0%',
                  change: '—%',
                  hasInfo: true,
                },
                {
                  label: 'Missing or incorrect error charges',
                  value: '$0.00',
                  change: '—%',
                },
              ]}
              goal="Meets goal of 1% or lower"
              emptyStateImage="/empty-state-default.svg"
              emptyStateTitle="There were no items reported missing or incorrect"
              emptyStateMessage="Keep it up!"
              viewDetailsHref={`/merchant/store/${storeId}/insights/operations-quality/detail/orderErrorRate`}
            />

            {/* Downtime card */}
            <MetricCard
              title="Downtime"
              description="Total amount of time your stores were unavailable during open hours"
              status="on-track"
              metrics={[
                {
                  label: 'Downtime',
                  value: '0.0% (0 min)',
                  change: '—%',
                },
              ]}
              goal="Meets goal of 1% or lower"
              emptyStateImage="/no-downtime.svg"
              emptyStateTitle="There were no temporary deactivations"
              emptyStateMessage="Nice work!"
              viewDetailsHref={`/merchant/store/${storeId}/insights/operations-quality/detail/downtime`}
            />
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
