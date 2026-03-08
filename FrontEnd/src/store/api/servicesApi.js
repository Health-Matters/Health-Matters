import { baseApi } from './baseApi';

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query({
      query: (params) => ({
        url: '/services',
        params,
      }),
      providesTags: ['Services'],
    }),
    getServiceById: builder.query({
      query: (serviceId) => `/services/${serviceId}`,
      providesTags: ['Services'],
    }),
    createService: builder.mutation({
      query: (body) => ({
        url: '/services',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Services'],
    }),
    updateServiceById: builder.mutation({
      query: ({ serviceId, body }) => ({
        url: `/services/${serviceId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Services'],
    }),
    deleteServiceById: builder.mutation({
      query: (serviceId) => ({
        url: `/services/${serviceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Services'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceByIdMutation,
  useDeleteServiceByIdMutation,
} = servicesApi;
