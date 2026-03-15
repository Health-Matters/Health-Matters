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
  useGetMyPatientReferralsQuery,
  useGetReferralsByPatientIdQuery,
  useGetReferralsByPractitionerIdQuery,
  useGetReferralByIdQuery,
  useCreateReferralMutation,
  useUpdateReferralsByPatientIdMutation,
  useAssignReferralByIdMutation,
  useDeleteReferralsByPatientIdMutation,
  useDeleteMyReferralByIdMutation,
  useUpdateReferralStatusMutation,
  useCancelReferralByIdMutation,
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

export {
  useGetAppointmentsByEmployeeIdQuery,
  useGetAppointmentsByPractitionerIdQuery,
  useRespondToAppointmentMutation,
  useCancelAppointmentMutation,
} from './appointmentsApi';

export {
  useGetReviewsQuery,
  useCreateReviewMutation,
} from './reviewsApi';
