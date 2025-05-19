import { Suspense } from 'react';
import ESGMetricDashboard from '../components/ESGMetricDashboard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ESGMetricsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ESGMetricDashboard />
    </Suspense>
  );
}
