export { baseApi } from './baseApi';

export {
  useGetUsersQuery,
  useGetMeQuery,
  useUpdateMeMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useDeactivateUserMutation,
  useDeleteUserMutation,
  useAssignUserManagerMutation,
} from './usersApi';

export {
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
