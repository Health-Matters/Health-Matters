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
      providesTags: ['Referrals', 'ManagerReferrals'],
    }),

    getManagerDashboard: builder.query({
      query: (params = {}) => ({
        url: '/referrals/manager/dashboard',
        params,
      }),
      providesTags: ['ManagerStats', 'ManagerReferrals'],
    }),

    getManagerTeam: builder.query({
      query: () => '/referrals/manager/team',
      providesTags: ['ManagerTeam'],
    }),

    getManagerInsights: builder.query({
      query: (params = {}) => ({
        url: '/referrals/manager/insights',
        params,
      }),
      providesTags: ['ManagerStats'],
    }),

    // GET /api/referrals/patient/:patientId
    getReferralsByPatientId: builder.query({
      query: (patientId) => `/referrals/patient/${patientId}`,
      providesTags: ['Referrals'],
    }),

    // GET /api/referrals/practitioner/:practitionerId
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
      invalidatesTags: ['Referrals', 'ManagerReferrals', 'ManagerStats', 'ManagerTeam'],
    }),

    // PUT /api/referrals/patient/:patientId
    updateReferralsByPatientId: builder.mutation({
      query: ({ patientId, body }) => ({
        url: `/referrals/patient/${patientId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Referrals'],
    }),

    // PUT /api/referrals/:referralId/assign
    assignReferralById: builder.mutation({
      query: ({ referralId, practitionerClerkUserId }) => ({
        url: `/referrals/${referralId}/assign`,
        method: 'PUT',
        body: { practitionerClerkUserId },
      }),
      invalidatesTags: ['Referrals'],
    }),

    cancelReferralById: builder.mutation({
      query: ({ referralId, cancellationReason }) => ({
        url: `/referrals/${referralId}/cancel`,
        method: 'POST',
        body: { cancellationReason },
      }),
      invalidatesTags: ['Referrals', 'ManagerReferrals', 'ManagerStats'],
    }),

    // DELETE /api/referrals/patient/:patientId
    deleteReferralsByPatientId: builder.mutation({
      query: (patientId) => ({
        url: `/referrals/patient/${patientId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Referrals'],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetReferralsQuery,
  useGetMyReferralsQuery,
  useGetManagerDashboardQuery,
  useGetManagerTeamQuery,
  useGetManagerInsightsQuery,
  useGetReferralsByPatientIdQuery,
  useGetReferralsByPractitionerIdQuery,
  useGetReferralByIdQuery,
  useCreateReferralMutation,
  useUpdateReferralsByPatientIdMutation,
  useAssignReferralByIdMutation,
  useCancelReferralByIdMutation,
  useDeleteReferralsByPatientIdMutation,
} = referralsApi;