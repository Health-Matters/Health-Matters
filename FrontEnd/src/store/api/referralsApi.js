import { baseApi } from './baseApi';

export const referralsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── Core referral endpoints ────────────────────────────────────────────

    // GET /api/referrals
    getReferrals: builder.query({
      query: () => '/referrals',
      providesTags: ['Referrals'],
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

    // GET /api/referrals/manager/:managerId
    // Returns { data: Referral[], pagination: { total, page, limit, totalPages } }
    // Optional params: { status, serviceType, search, dateFrom, dateTo, page, limit }
    getReferralsByManagerId: builder.query({
      query: ({ managerId, ...params }) => ({
        url: `/referrals/manager/${managerId}`,
        params,
      }),
      providesTags: ['Referrals'],
    }),

    // GET /api/referrals/:referralId
    getReferralById: builder.query({
      query: (referralId) => `/referrals/${referralId}`,
      providesTags: ['Referrals'],
    }),

    // POST /api/referrals
    createReferral: builder.mutation({
      query: (body) => ({
        url: '/referrals',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Referrals', 'Appointments'],
    }),

    // PUT /api/referrals/patient/:patientId
    updateReferralsByPatientId: builder.mutation({
      query: ({ patientId, body }) => ({
        url: `/referrals/patient/${patientId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Referrals', 'Appointments'],
    }),

    // PUT /api/referrals/:referralId/assign
    assignReferralById: builder.mutation({
      query: ({ referralId, practitionerClerkUserId }) => ({
        url: `/referrals/${referralId}/assign`,
        method: 'PUT',
        body: { practitionerClerkUserId },
      }),
      invalidatesTags: ['Referrals', 'Appointments'],
    }),
    updateReferralById: builder.mutation({
      query: ({ referralId, body }) => ({
        url: `/referrals/${referralId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Referrals', 'Appointments'],
    }),

    // DELETE /api/referrals/patient/:patientId
    deleteReferralsByPatientId: builder.mutation({
      query: (patientId) => ({
        url: `/referrals/patient/${patientId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Referrals', 'Appointments'],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetReferralsQuery,
  useGetReferralsByPatientIdQuery,
  useGetReferralsByPractitionerIdQuery,
  useGetReferralsByManagerIdQuery,
  useGetReferralByIdQuery,
  useCreateReferralMutation,
  useUpdateReferralsByPatientIdMutation,
  useAssignReferralByIdMutation,
  useUpdateReferralByIdMutation,
  useDeleteReferralsByPatientIdMutation,
} = referralsApi;