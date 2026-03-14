import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});
