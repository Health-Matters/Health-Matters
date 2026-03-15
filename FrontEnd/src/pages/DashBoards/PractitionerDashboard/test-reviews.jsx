import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Loader2, Star } from "lucide-react";
import { useCreateReviewMutation, useGetReviewsQuery } from "../../../store/api/reviewsApi";

/*
 Team J - Recent review cards, review submission form, and star-rating interaction UI (TMJ-001, TMJ-002, TMJ-003) . Done by Yahanima, Senithi, Irindu, Dulmin, and Akith
*/

const initialFormState = {
  patientName: "",
  message: "",
  rating: 0,
};

const StarRating = ({ value, onSelect }) => (
  <div className="flex items-center gap-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onSelect(star)}
        className="rounded-md p-1 transition hover:bg-amber-50"
        aria-label={`Rate ${star} out of 5`}
      >
        <Star
          className={`h-6 w-6 ${value >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
        />
      </button>
    ))}
  </div>
);

const ReviewCard = ({ review }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="text-base font-semibold text-slate-800">{review.patientName}</h3>
    <div className="mt-2 flex items-center gap-1" aria-label={`${review.rating} star rating`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${review.rating >= star ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
        />
      ))}
    </div>
    <p className="mt-3 text-sm leading-6 text-slate-600">{review.message}</p>
  </article>
);

export const PractitionerTestReviews = () => {
  const [searchParams] = useSearchParams();
  const showAll = searchParams.get("scope") === "all";
  const limit = showAll ? 100 : 4;

  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState("");

  const { data: reviews = [], isLoading, isFetching } = useGetReviewsQuery({ limit });
  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation();

  const knownPatientNames = useMemo(() => {
    const seededNames = [
      "John Smith",
      "Sarah Lee",
      "Emma Johnson",
      "Michael Brown",
      "Sarah Davis",
      "Robert Wilson",
      "Jane Smith",
      "Alex Johnson",
    ];
    const fromReviews = reviews
      .map((review) => review?.patientName)
      .filter((name) => typeof name === "string" && name.trim().length > 0);
    return [...new Set([...seededNames, ...fromReviews].map((name) => name.trim().toLowerCase()))];
  }, [reviews]);

  const reviewCountLabel = useMemo(() => {
    if (showAll) return `${reviews.length} total reviews`;
    return `Showing ${reviews.length} recent reviews`;
  }, [reviews.length, showAll]);

  const handleCancel = () => {
    setForm(initialFormState);
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.patientName.trim() || !form.message.trim() || form.rating < 1) {
      setFormError("Patient name, review message, and a star rating are required.");
      return;
    }

    if (!knownPatientNames.includes(form.patientName.trim().toLowerCase())) {
      setFormError("Patient name not found. Please enter an existing patient name.");
      return;
    }

    try {
      await createReview({
        patientName: form.patientName.trim(),
        message: form.message.trim(),
        rating: form.rating,
      }).unwrap();

      handleCancel();
    } catch (error) {
      setFormError(error?.data?.message || "Unable to submit review right now.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-3xl border border-blue-100 bg-linear-to-r from-blue-50 to-cyan-50 p-6">
        <h1 className="text-3xl font-bold text-slate-900">Patient Reviews</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review recent patient feedback and submit new notes after treatment sessions.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">Recent Reviews</h2>
            <p className="text-sm text-slate-500">{reviewCountLabel}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/practitioner/dashboard/reviews?scope=all"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              See All
            </Link>
            <Link
              to="/practitioner/dashboard/reviews/learn-more"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Learn More
            </Link>
          </div>
        </div>

        {isLoading || isFetching ? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-sm text-slate-500">
            No reviews yet. Submit a review to start tracking patient feedback.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-800">Add Your Review</h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Patient Name</label>
            <input
              type="text"
              value={form.patientName}
              onChange={(event) => setForm((current) => ({ ...current, patientName: event.target.value }))}
              placeholder="Enter patient name"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Review Message</label>
            <textarea
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              placeholder="Write your feedback"
              rows={4}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Rating</label>
            <StarRating
              value={form.rating}
              onSelect={(value) => setForm((current) => ({ ...current, rating: value }))}
            />
          </div>

          {formError && <p className="text-sm text-rose-600">{formError}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Review
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};