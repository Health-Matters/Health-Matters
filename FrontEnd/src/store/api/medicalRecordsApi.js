import { baseApi } from './baseApi';

export const medicalRecordsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdviceSheetAccessCountByEmployeeId: builder.query({
      query: (employeeId) => `/medical-records/access-count/${employeeId}`,
      providesTags: ['MedicalRecords'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdviceSheetAccessCountByEmployeeIdQuery,
} = medicalRecordsApi;
