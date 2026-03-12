import { baseApi } from './baseApi';

export const referralsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReferrals: builder.query({
      query: () => '/referrals',
      providesTags: ['Referrals'],
    }),
    getReferralsByPatientId: builder.query({
      query: (patientId) => `/referrals/patient/${patientId}`,
      providesTags: ['Referrals'],
    }),
    getReferralsByPractitionerId: builder.query({
      query: (practitionerId) => `/referrals/practitioner/${practitionerId}`,
      providesTags: ['Referrals'],
    }),
    createReferral: builder.mutation({
      query: (body) => ({
        url: '/referrals',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Referrals', 'Appointments'],
    }),
    updateReferralsByPatientId: builder.mutation({
      query: ({ patientId, body }) => ({
        url: `/referrals/patient/${patientId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Referrals', 'Appointments'],
    }),
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
  useCreateReferralMutation,
  useUpdateReferralsByPatientIdMutation,
  useAssignReferralByIdMutation,
  useUpdateReferralByIdMutation,
  useDeleteReferralsByPatientIdMutation,
} = referralsApi;
