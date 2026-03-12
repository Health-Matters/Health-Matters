export { baseApi } from './baseApi';

export {
  useGetUsersQuery,
  useUpdateMeMutation,
} from './usersApi';

export {
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
} from './referralsApi';

export {
  useGetAppointmentsQuery,
  useGetAppointmentsByPractitionerIdQuery,
  useGetAppointmentsByPatientIdQuery,
  useRespondToAppointmentMutation,
} from './appointmentsApi';

export {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceByIdMutation,
  useDeleteServiceByIdMutation,
} from './servicesApi';