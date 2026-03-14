import { baseApi } from './baseApi';

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query({
      query: ({ limit } = {}) => ({
        url: '/reviews',
        params: limit ? { limit } : undefined,
      }),
      providesTags: ['Reviews'],
    }),
    createReview: builder.mutation({
      query: (body) => ({
        url: '/reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Reviews'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetReviewsQuery, useCreateReviewMutation } = reviewsApi;
