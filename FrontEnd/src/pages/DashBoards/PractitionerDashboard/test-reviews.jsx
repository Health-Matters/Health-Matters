import { useState } from "react";

export const PractitionerTestReviews = () => {

  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);

  const reviews = [
    {
      name: "John Doe",
      text: "Amazing service and caring staff.",
      rating: 5,
    },
    {
      name: "Jane Smith",
      text: "The appointment process was smooth.",
      rating: 4,
    },
    {
      name: "Alice Johnson",
      text: "I had a great experience during my treatment.",
      rating: 5,
    },
    {
      name: "Bob Brown",
      text: "Staff could be more responsive.",
      rating: 3,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Review Submitted!");
    setName("");
    setReview("");
    setRating(0);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="bg-blue-100 p-6 rounded text-center mb-8">
        <h1 className="text-3xl font-bold">Patient Reviews</h1>
        <p className="text-gray-600">
          Read and share reviews from other patients
        </p>

        <button className="mt-4 bg-black text-white px-6 py-2 rounded">
          Write a review
        </button>
      </div>

      {/* Recent Reviews */}
      <h2 className="text-2xl font-semibold mb-4">Recent Reviews</h2>

      <div className="grid grid-cols-2 gap-4 mb-8">

        {reviews.map((r, index) => (
          <div
            key={index}
            className="bg-white p-4 shadow rounded border"
          >
            <h3 className="font-semibold">{r.name}</h3>

            <p className="text-yellow-500">
              {"⭐".repeat(r.rating)}
            </p>

            <p className="text-gray-600">{r.text}</p>
          </div>
        ))}

      </div>

      {/* Buttons */}
      <div className="flex gap-4 mb-8">
        <button className="border px-4 py-2 rounded">
          See All
        </button>

        <button className="bg-black text-white px-4 py-2 rounded">
          Learn More
        </button>
      </div>

      {/* Add Review */}
      <h2 className="text-2xl font-semibold mb-4">Add Your Review</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-blue-50 p-6 rounded shadow"
      >

        {/* Name */}
        <label className="block mb-2 font-medium">
          Your Name
        </label>

        <input
          type="text"
          placeholder="Enter your name"
          className="w-full border p-2 rounded mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Review */}
        <label className="block mb-2 font-medium">
          Your Review
        </label>

        <textarea
          placeholder="Write your review here"
          className="w-full border p-2 rounded mb-4"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <p className="text-sm text-gray-500 mb-4">
          Be honest and constructive
        </p>

        {/* Rating */}
        <label className="block mb-2 font-medium">
          Rating
        </label>

        <div className="flex gap-4 mb-6">

          {[1,2,3,4,5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className={`text-xl ${
                rating >= star
                  ? "text-yellow-500"
                  : "text-gray-400"
              }`}
            >
              ★
            </button>
          ))}

        </div>

        {/* Buttons */}
        <div className="flex gap-4">

          <button
            type="button"
            className="border px-6 py-2 rounded"
            onClick={() => {
              setName("");
              setReview("");
              setRating(0);
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded"
          >
            Submit Review
          </button>

        </div>

      </form>

    </div>
  );
};