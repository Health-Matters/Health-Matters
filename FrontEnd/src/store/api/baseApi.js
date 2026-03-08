import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

console.log('RTK Query baseUrl:', baseUrl);

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders: async (headers) => {
    try {
      // Access the Clerk instance from window after it's loaded
      if (window.Clerk && window.Clerk.session) {
        const token = await window.Clerk.session.getToken();
        if (token) {
          console.log('Adding Clerk token to request');
          headers.set('Authorization', `Bearer ${token}`);
        } else {
          console.log('No Clerk token available');
        }
      } else {
        console.log('Clerk not initialized or no session');
      }
    } catch (error) {
      console.error('Error getting Clerk token:', error);
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Users', 'Referrals', 'Services'],
  endpoints: () => ({}),
});
