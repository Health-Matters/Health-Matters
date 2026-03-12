export { baseApi } from './baseApi';

export {
  useGetUsersQuery,
  useUpdateMeMutation,
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
} from './referralsApi';

export {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceByIdMutation,
  useDeleteServiceByIdMutation,
} from './servicesApi';