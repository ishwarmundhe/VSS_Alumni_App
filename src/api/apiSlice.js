import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@env';

function xhrUpload({
  url,
  method = 'POST',
  token,
  fieldName,
  imageUri,
  fileName = 'upload.jpg',
}) {
  return new Promise(resolve => {
    const formData = new FormData();
    formData.append(fieldName, {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg',
    });

    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ data });
        } else {
          resolve({ error: data });
        }
      } catch {
        resolve({ error: { message: 'Failed to parse server response' } });
      }
    };

    xhr.onerror = () =>
      resolve({ error: { message: 'Network error during upload' } });
    xhr.ontimeout = () => resolve({ error: { message: 'Upload timed out' } });
    xhr.timeout = 30000; // 30s

    xhr.send(formData);
  });
}

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
    // ── AUTH ─────────────────────────────────────────────────────────────────

    loginWithPassword: builder.mutation({
      query: credentials => {
        const formBody = new URLSearchParams();
        formBody.append('username', credentials.username);
        formBody.append('password', credentials.password);
        return {
          url: '/admin/login',
          method: 'POST',
          body: formBody.toString(),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        };
      },
    }),

    sendOtp: builder.mutation({
      query: data => ({ url: '/send-otp', method: 'POST', body: data }),
    }),

    verifyOtp: builder.mutation({
      query: data => ({ url: '/verify-otp', method: 'POST', body: data }),
    }),

    // ── USER PROFILE & REGISTRATION ──────────────────────────────────────────

    registerUser: builder.mutation({
      query: data => ({ url: '/register', method: 'POST', body: data }),
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
      query: userId => ({ url: `/admin/approve/${userId}`, method: 'PUT' }),
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

    // NOTE: backend route /alumni/stats is not implemented.
    // Kept here so existing exports don't break, but do not use in UI.
    // Derive counts from pendingUsers.length / approvedUsers.length instead.
    getAlumniStats: builder.query({
      query: () => '/alumni/stats',
      providesTags: ['PendingUsers', 'Alumni'],
    }),

    getDirectoryUsers: builder.query({
      query: params => ({ url: '/alumni', method: 'GET', params }),
      providesTags: ['Alumni'],
    }),

    getCurrentUser: builder.query({
      query: () => '/me',
      providesTags: ['CurrentUser'],
    }),

    updateCurrentUser: builder.mutation({
      query: profileData => ({ url: '/me', method: 'PUT', body: profileData }),
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

    // ── AVATAR — XHR-based to guarantee multipart on Android ─────────────────

    getAvatar: builder.query({
      query: () => '/me/avatar',
      providesTags: ['Avatar'],
    }),

    // Used in ProfileOnboarding after /register. Call: uploadAvatar(image.path)
    uploadAvatar: builder.mutation({
      queryFn: async (imageUri, { getState }) =>
        xhrUpload({
          url: `${API_URL}/me/avatar`,
          method: 'POST',
          token: getState().auth?.token,
          fieldName: 'avatar',
          imageUri,
          fileName: 'profile_photo.jpg',
        }),
      invalidatesTags: ['Avatar', 'CurrentUser'],
    }),

    // Used in EditProfileScreen. Call: updateProfilePicture(newProfileImage)
    updateProfilePicture: builder.mutation({
      queryFn: async (imageUri, { getState }) =>
        xhrUpload({
          url: `${API_URL}/me/avatar`,
          // method: 'PUT',
          method: 'POST',
          token: getState().auth?.token,
          fieldName: 'avatar',
          imageUri,
          fileName: 'profile_photo.jpg',
        }),
      invalidatesTags: ['CurrentUser', 'Alumni', 'Avatar'],
    }),

    // Alias for updateProfilePicture kept for backward compatibility
    updateAvatar: builder.mutation({
      queryFn: async (imageUri, { getState }) =>
        xhrUpload({
          url: `${API_URL}/me/avatar`,
          // method: 'PUT',
          method: 'POST',
          token: getState().auth?.token,
          fieldName: 'avatar',
          imageUri,
          fileName: 'profile_photo.jpg',
        }),
      invalidatesTags: ['Avatar', 'CurrentUser'],
    }),

    deleteAvatar: builder.mutation({
      query: () => ({ url: '/me/avatar', method: 'DELETE' }),
      invalidatesTags: ['Avatar', 'CurrentUser'],
    }),

    // ── EVENTS ───────────────────────────────────────────────────────────────

    getEvents: builder.query({
      query: params => ({ url: '/events', method: 'GET', params }),
      providesTags: ['Events'],
    }),

    getEventById: builder.query({
      query: eventId => `/events/${eventId}`,
      providesTags: ['Events'],
    }),

    createEvent: builder.mutation({
      query: eventData => ({ url: '/events', method: 'POST', body: eventData }),
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
      query: eventId => ({ url: `/events/${eventId}`, method: 'DELETE' }),
      invalidatesTags: ['Events'],
    }),

    // Call: uploadEventBanner({ eventId, imageUri })
    uploadEventBanner: builder.mutation({
      queryFn: async ({ eventId, imageUri }, { getState }) =>
        xhrUpload({
          url: `${API_URL}/events/${eventId}/banner`,
          method: 'POST',
          token: getState().auth?.token,
          fieldName: 'banner',
          imageUri,
          fileName: 'event_banner.jpg',
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
