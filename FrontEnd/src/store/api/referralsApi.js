import { baseApi } from './baseApi';

export const referralsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // GET /api/referrals
    getReferrals: builder.query({
      query: () => '/referrals',
      providesTags: ['Referrals'],
    }),

    // GET /api/referrals/my-submissions
    // MGR-005: Returns referrals submitted by the authenticated user.
    // SECURITY: No ID passed in the request — identity is derived from
    // the Clerk token on the backend. Never pass a managerId here.
    // Optional params: { status, serviceType, search, dateFrom, dateTo, page, limit }
    getMyReferrals: builder.query({
      query: (params = {}) => ({
        url: '/referrals/my-submissions',
        params,
      }),
      providesTags: ['Referrals'],
    }),

    // GET /api/referrals/patient/:patientId
    getReferralsByPatientId: builder.query({
      query: (patientId) => `/referrals/patient/${patientId}`,
      providesTags: ['Referrals'],
    }),
    getReferralsByPractitionerId: builder.query({
      query: (practitionerId) => `/referrals/practitioner/${practitionerId}`,
      providesTags: ['Referrals'],
    }),

    // GET /api/referrals/:referralId
    getReferralById: builder.query({
      query: (referralId) => `/referrals/${referralId}`,
      providesTags: ['Referrals'],
    }),

    // POST /api/referrals
    // SECURITY: No submittedByClerkUserId in the body.
    // It is always set server-side from the Clerk token.
    createReferral: builder.mutation({
      query: (body) => ({
        url: '/referrals',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Referrals'],
    }),
    updateReferralsByPatientId: builder.mutation({
      query: ({ patientId, body }) => ({
        url: `/referrals/patient/${patientId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Referrals'],
    }),
    assignReferralById: builder.mutation({
      query: ({ referralId, practitionerClerkUserId }) => ({
        url: `/referrals/${referralId}/assign`,
        method: 'PUT',
        body: { practitionerClerkUserId },
      }),
      invalidatesTags: ['Referrals'],
    }),
    deleteReferralsByPatientId: builder.mutation({
      query: (patientId) => ({
        url: `/referrals/patient/${patientId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Referrals'],
    }),
    updateReferralStatus: builder.mutation({
      query: ({ referralId, referralStatus }) => ({
        url: `/referrals/${referralId}/status`,
        method: 'PUT',
        body: { referralStatus },
      }),
      invalidatesTags: ['Referrals'],
    }),
    cancelReferralById: builder.mutation({
      query: ({ referralId, reason }) => ({
        url: `/referrals/${referralId}/cancel`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: ['Referrals', 'Notifications'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetReferralsQuery,
  useGetMyReferralsQuery,
  useGetReferralsByPatientIdQuery,
  useGetReferralsByPractitionerIdQuery,
  useGetReferralByIdQuery,
  useCreateReferralMutation,
  useUpdateReferralsByPatientIdMutation,
  useAssignReferralByIdMutation,
  useDeleteReferralsByPatientIdMutation,
  useUpdateReferralStatusMutation,
  useCancelReferralByIdMutation,
} = referralsApi;
