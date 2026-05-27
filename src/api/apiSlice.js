import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@env';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'User',
    'PendingUsers',
    'Alumni',
    'CurrentUser',
    'Avatar',
    'Events',
  ],
  endpoints: builder => ({
    loginWithPassword: builder.mutation({
      query: credentials => {
        const formBody = new URLSearchParams();
        formBody.append('username', credentials.username);
        formBody.append('password', credentials.password);

        return {
          url: '/admin/login',
          method: 'POST',
          body: formBody.toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        };
      },
    }),

    sendOtp: builder.mutation({
      query: data => ({
        url: '/send-otp',
        method: 'POST',
        body: data,
      }),
    }),

    verifyOtp: builder.mutation({
      query: data => ({
        url: '/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),

    // --- USER PROFILE & REGISTRATION ---
    registerUser: builder.mutation({
      query: data => ({
        url: '/register',
        method: 'POST',
        body: data,
      }),
    }),

    updateProfile: builder.mutation({
      query: ({ userId, ...profileData }) => ({
        url: `/users/${userId}`,
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    getUserDetails: builder.query({
      query: userId => `/users/${userId}`,
      providesTags: ['User'],
    }),

    approveUser: builder.mutation({
      query: userId => ({
        url: `/admin/approve/${userId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['PendingUsers', 'Alumni'],
    }),

    getPendingUsers: builder.query({
      query: () => '/admin/pending',
      providesTags: ['PendingUsers'],
    }),

    getAlumniUsers: builder.query({
      query: () => '/admin/alumni',
      providesTags: ['Alumni'],
    }),

    getAlumniStats: builder.query({
      query: () => '/alumni/stats',
      providesTags: ['PendingUsers', 'Alumni'],
    }),

    getDirectoryUsers: builder.query({
      query: params => ({
        url: '/alumni',
        method: 'GET',
        params: params,
      }),
      providesTags: ['Alumni'],
    }),

    getCurrentUser: builder.query({
      query: () => '/me',
      providesTags: ['CurrentUser'],
    }),

    updateCurrentUser: builder.mutation({
      query: profileData => ({
        url: '/me',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['CurrentUser', 'Alumni'],
    }),

    updateUserAddress: builder.mutation({
      query: ({ addressId, ...addressData }) => ({
        url: `/me/addresses/${addressId}`,
        method: 'PUT',
        body: addressData,
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    updateProfilePicture: builder.mutation({
      query: formData => ({
        url: '/me/avatar',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['CurrentUser', 'Alumni'],
    }),

    // --- AVATAR MANAGEMENT ---
    getAvatar: builder.query({
      query: () => '/me/avatar',
      providesTags: ['Avatar'],
    }),

    uploadAvatar: builder.mutation({
      query: formData => ({
        url: '/me/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Avatar', 'CurrentUser'],
    }),

    updateAvatar: builder.mutation({
      query: formData => ({
        url: '/me/avatar',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Avatar', 'CurrentUser'],
    }),

    deleteAvatar: builder.mutation({
      query: () => ({
        url: '/me/avatar',
        method: 'DELETE',
      }),
      invalidatesTags: ['Avatar', 'CurrentUser'],
    }),

    // --- EVENTS MANAGEMENT ---
    getEvents: builder.query({
      query: params => ({
        url: '/events',
        method: 'GET',
        params: params,
      }),
      providesTags: ['Events'],
    }),

    getEventById: builder.query({
      query: eventId => `/events/${eventId}`,
      providesTags: ['Events'],
    }),

    createEvent: builder.mutation({
      query: eventData => ({
        url: '/events',
        method: 'POST',
        body: eventData,
      }),
      invalidatesTags: ['Events'],
    }),

    updateEvent: builder.mutation({
      query: ({ eventId, ...eventData }) => ({
        url: `/events/${eventId}`,
        method: 'PUT',
        body: eventData,
      }),
      invalidatesTags: ['Events'],
    }),

    deleteEvent: builder.mutation({
      query: eventId => ({
        url: `/events/${eventId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Events'],
    }),

    uploadEventBanner: builder.mutation({
      query: ({ eventId, formData }) => ({
        url: `/events/${eventId}/banner`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Events'],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useUpdateProfilePictureMutation,
  useUpdateUserAddressMutation,
  useUpdateCurrentUserMutation,
  useGetDirectoryUsersQuery,
  useLoginWithPasswordMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRegisterUserMutation,
  useUpdateProfileMutation,
  useGetUserDetailsQuery,
  useApproveUserMutation,
  useGetPendingUsersQuery,
  useGetAlumniUsersQuery,
  useGetAlumniStatsQuery,
  useGetAvatarQuery,
  useUploadAvatarMutation,
  useUpdateAvatarMutation,
  useDeleteAvatarMutation,
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useUploadEventBannerMutation,
} = apiSlice;
