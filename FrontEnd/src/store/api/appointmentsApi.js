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

    createAppointment: builder.mutation({
      query: (body) => ({
        url: '/appointments',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Appointments']
    }),

    updateAppointmentStatus: builder.mutation({
      query: ({ appointmentId, body }) => ({
        url: `/appointments/${appointmentId}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Appointments']
    }),

  }),
  overrideExisting: false
});

export const {
  useGetAppointmentsByEmployeeIdQuery,
  useGetAppointmentsByPractitionerIdQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentStatusMutation
} = appointmentsApi;