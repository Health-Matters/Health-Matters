import { baseApi } from './baseApi';

export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query({
      query: () => '/appointments',
      providesTags: ['Appointments'],
    }),
    getAppointmentsByPractitionerId: builder.query({
      query: (practitionerId) => `/appointments/practitioner/${practitionerId}`,
      providesTags: ['Appointments'],
    }),
    getAppointmentsByPatientId: builder.query({
      query: (patientId) => `/appointments/patient/${patientId}`,
      providesTags: ['Appointments'],
    }),
    respondToAppointment: builder.mutation({
      query: ({ appointmentId, status }) => ({
        url: `/appointments/${appointmentId}/respond`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Appointments', 'Referrals'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentsByPractitionerIdQuery,
  useGetAppointmentsByPatientIdQuery,
  useRespondToAppointmentMutation,
} = appointmentsApi;