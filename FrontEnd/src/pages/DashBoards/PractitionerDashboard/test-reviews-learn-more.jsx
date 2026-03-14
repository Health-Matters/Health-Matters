import { Star } from 'lucide-react';
import { Link } from 'react-router';
import { useGetReviewsQuery } from '../../../store/api/reviewsApi';

const SummaryCard = ({ label, value }) => (
  <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

export const PractitionerReviewsLearnMore = () => {
  const { data: reviews = [], isLoading } = useGetReviewsQuery({ limit: 100 });

  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? (reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews).toFixed(1)
    : '0.0';
  const highSatisfaction = reviews.filter((item) => item.rating >= 4).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-3xl border border-blue-100 bg-linear-to-r from-blue-50 to-cyan-50 p-6">
        <h1 className="text-2xl font-bold text-slate-800">Review Insights</h1>
        <p className="mt-2 text-sm text-slate-600">
          Additional feedback data to help track patient satisfaction trends for your practice.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total Reviews" value={totalReviews} />
        <SummaryCard label="Average Rating" value={`${averageRating} / 5`} />
        <SummaryCard label="4-5 Star Reviews" value={highSatisfaction} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">What this means</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-slate-500">Loading insights...</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <Star className="mt-0.5 h-4 w-4 text-amber-500" />
              Consistent ratings above 4 indicate strong perceived quality of care.
            </li>
            <li className="flex items-start gap-3">
              <Star className="mt-0.5 h-4 w-4 text-amber-500" />
              Use lower-rated comments to identify communication or process gaps.
            </li>
            <li className="flex items-start gap-3">
              <Star className="mt-0.5 h-4 w-4 text-amber-500" />
              Track this page over time to monitor service improvements after changes.
            </li>
          </ul>
        )}
      </section>

      <div>
        <Link
          to="/practitioner/dashboard/reviews"
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Back to Reviews
        </Link>
      </div>
    </div>
  );
};
