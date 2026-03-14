import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

console.log('RTK Query baseUrl:', baseUrl);

// Safe token getter — uses window.Clerk which ClerkProvider populates.
// Wrapped in a null-check so it never throws on early page loads.
const getClerkToken = async () => {
  try {
    if (window.Clerk?.session) {
      return await window.Clerk.session.getToken();
    }
    return null;
  } catch (err) {
    console.error('Failed to get Clerk token:', err);
    return null;
  }
};

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl,
  credentials: 'omit',
  prepareHeaders: async (headers) => {
    const token = await getClerkToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log('Adding Clerk token to request');
    } else {
      console.warn('No Clerk token available — request will be unauthenticated');
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Users', 'Referrals', 'Services', 'Notifications', 'MedicalRecords', 'Reviews', 'Appointments'],
  endpoints: () => ({}),
});