export { baseApi } from './baseApi';

export {
  useGetUsersQuery,
  useGetMeQuery,
  useUpdateMeMutation,
} from './usersApi';

export {
  useGetReferralsQuery,
  useGetReferralsByPatientIdQuery,
  useGetReferralsByPractitionerIdQuery,
  useCreateReferralMutation,
  useUpdateReferralsByPatientIdMutation,
  useAssignReferralByIdMutation,
  useDeleteReferralsByPatientIdMutation,
  useUpdateReferralStatusMutation,
} from './referralsApi';

export {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceByIdMutation,
  useDeleteServiceByIdMutation,
} from './servicesApi';

export {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} from './notificationsApi';
