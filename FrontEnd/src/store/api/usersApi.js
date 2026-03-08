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
    updateMe: builder.mutation({
      query: (body) => ({
        url: '/users/me',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetUsersQuery, useUpdateMeMutation } = usersApi;
