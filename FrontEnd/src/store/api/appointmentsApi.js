import { baseApi } from './baseApi';

export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getAppointmentsByEmployeeId: builder.query({
      query: (employeeId) => `/appointments/employee/${employeeId}`,
      providesTags: ['Appointments'],
    }),

    getAppointmentsByPractitionerId: builder.query({
      query: (practitionerId) => `/appointments/practitioner/${practitionerId}`,
      providesTags: ['Appointments'],
    }),

    respondToAppointment: builder.mutation({
      query: ({ appointmentId, status }) => ({
        url: `/appointments/${appointmentId}/respond`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Appointments'],
    }),

    cancelAppointment: builder.mutation({
      query: ({ appointmentId }) => ({
        url: `/appointments/${appointmentId}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Appointments'],
    }),

  }),
  overrideExisting: false
});

export const {
  useGetAppointmentsByEmployeeIdQuery,
  useGetAppointmentsByPractitionerIdQuery,
  useRespondToAppointmentMutation,
  useCancelAppointmentMutation,
} = appointmentsApi;