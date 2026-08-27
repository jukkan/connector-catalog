import { useMemo } from 'react';
import type { Connector } from '../types';

interface StatsPageProps {
  connectors: Connector[];
  onBack: () => void;
}

interface YearCount {
  year: number;
  count: number;
}

interface RecencyBucket {
  label: string;
  count: number;
  color: string;
}

const DAY_IN_MS = 1000 * 60 * 60 * 24;

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function StatsPage({ connectors, onBack }: StatsPageProps) {
  const annualTrend = useMemo<YearCount[]>(() => {
    const yearCounts = new Map<number, number>();

    for (const connector of connectors) {
      const createdDate = parseDate(connector.firstCommitDate);
      if (!createdDate) continue;

      const year = createdDate.getUTCFullYear();
      yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
    }

    if (yearCounts.size === 0) return [];

    const years = Array.from(yearCounts.keys()).sort((a, b) => a - b);
    const startYear = years[0];
    const endYear = years[years.length - 1];
    const trend: YearCount[] = [];

    for (let year = startYear; year <= endYear; year++) {
      trend.push({ year, count: yearCounts.get(year) ?? 0 });
    }

    return trend;
  }, [connectors]);

  const recencyBuckets = useMemo<RecencyBucket[]>(() => {
    const now = Date.now();
    const counts = {
      month: 0,
      quarter: 0,
      halfYear: 0,
      year: 0,
      older: 0,
      unknown: 0,
    };

    for (const connector of connectors) {
      const updatedDate = parseDate(connector.lastCommitDate);

      if (!updatedDate) {
        counts.unknown++;
        continue;
      }

      const ageInDays = Math.floor((now - updatedDate.getTime()) / DAY_IN_MS);

      if (ageInDays <= 30) counts.month++;
      else if (ageInDays <= 90) counts.quarter++;
      else if (ageInDays <= 180) counts.halfYear++;
      else if (ageInDays <= 365) counts.year++;
      else counts.older++;
    }

    return [
      { label: 'Updated in last 30 days', count: counts.month, color: 'bg-green-500' },
      { label: 'Updated in last 31-90 days', count: counts.quarter, color: 'bg-emerald-500' },
      { label: 'Updated in last 91-180 days', count: counts.halfYear, color: 'bg-blue-500' },
      { label: 'Updated in last 181-365 days', count: counts.year, color: 'bg-indigo-500' },
      { label: 'Updated over 1 year ago', count: counts.older, color: 'bg-gray-500' },
      { label: 'Unknown update date', count: counts.unknown, color: 'bg-gray-400' },
    ];
  }, [connectors]);

  const maxYearCount = useMemo(() => {
    if (annualTrend.length === 0) return 1;
    return Math.max(...annualTrend.map((year) => year.count), 1);
  }, [annualTrend]);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        aria-label="Back to catalog"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to catalog
      </button>

      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Connector creation trend by year</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Annual count based on each connector&apos;s first commit date.
        </p>

        {annualTrend.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No creation date data available.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {annualTrend.map(({ year, count }) => (
              <div key={year} className="grid grid-cols-[4rem_minmax(0,1fr)_4rem] items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">{year}</span>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(count / maxYearCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-right font-medium text-gray-700 dark:text-gray-200">{count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Update recency distribution</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Distribution of connectors by how recently they were updated.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {recencyBuckets.map((bucket) => {
            const percentage = connectors.length > 0 ? (bucket.count / connectors.length) * 100 : 0;

            return (
              <div
                key={bucket.label}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900"
              >
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{bucket.label}</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{bucket.count.toLocaleString()}</p>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`${bucket.color} h-full rounded-full`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
