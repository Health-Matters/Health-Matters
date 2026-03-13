export { baseApi } from './baseApi';

export {
  useGetUsersQuery,
  useUpdateMeMutation,
} from './usersApi';

export {
  useGetReferralsQuery,
  useGetReferralsByPatientIdQuery,
  useGetReferralsByPractitionerIdQuery,
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
  useCancelAppointmentMutation,
} from './appointmentsApi';

export {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceByIdMutation,
  useDeleteServiceByIdMutation,
} from './servicesApi';
