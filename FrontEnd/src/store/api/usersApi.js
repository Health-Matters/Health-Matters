import { baseApi } from './baseApi';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['Users'],
    }),
    getMe: builder.query({
      query: () => '/users/me',
      providesTags: ['Users'],
    }),
    updateMe: builder.mutation({
      query: (body) => ({
        url: '/users/me',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    createUser: builder.mutation({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation({
      query: ({ userId, body }) => ({
        url: `/users/${userId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/users/${userId}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['Users'],
    }),
    deactivateUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    assignUserManager: builder.mutation({
      query: ({ userId, managerClerkUserId }) => ({
        url: `/users/${userId}/manager`,
        method: 'POST',
        body: { managerClerkUserId },
      }),
      invalidatesTags: ['Users'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetMeQuery,
  useUpdateMeMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useDeactivateUserMutation,
  useDeleteUserMutation,
  useAssignUserManagerMutation,
} = usersApi;
