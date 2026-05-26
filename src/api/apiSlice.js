import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://85.25.172.10:8002',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'PendingUsers', 'Alumni', 'CurrentUser'],
  endpoints: builder => ({
    // --- AUTHENTICATION ---
    loginWithPassword: builder.mutation({
      query: credentials => {
        const formBody = new URLSearchParams();
        formBody.append('username', credentials.username);
        formBody.append('password', credentials.password);

        return {
          url: '/v1/auth/login/password',
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
        url: '/v1/auth/send-otp',
        method: 'POST',
        body: data,
      }),
    }),

    verifyOtp: builder.mutation({
      query: data => ({
        url: '/v1/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),

    // --- USER PROFILE & REGISTRATION ---
    registerUser: builder.mutation({
      query: data => ({
        url: '/v1/users/register',
        method: 'POST',
        body: data,
      }),
    }),

    updateProfile: builder.mutation({
      query: ({ userId, ...profileData }) => ({
        url: `/v1/user/profile/${userId}`,
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    getUserDetails: builder.query({
      query: userId => `/v1/users/${userId}`,
      providesTags: ['User'],
    }),

    approveUser: builder.mutation({
      query: userId => ({
        url: `/v1/admin/approve/${userId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['PendingUsers', 'Alumni'],
    }),

    getPendingUsers: builder.query({
      query: () => '/v1/admin/pending',
      providesTags: ['PendingUsers'],
    }),

    getAlumniUsers: builder.query({
      query: () => '/v1/admin/alumni',
      providesTags: ['Alumni'],
    }),

    getAlumniStats: builder.query({
      query: () => '/v1/alumni/stats',
      providesTags: ['PendingUsers', 'Alumni'],
    }),
    getDirectoryUsers: builder.query({
      query: params => ({
        url: '/v1/users/alumni',
        method: 'GET',
        params: params,
      }),
      providesTags: ['Alumni'],
    }),

    getCurrentUser: builder.query({
      query: () => '/v1/users/me',
      providesTags: ['CurrentUser'],
    }),

    updateCurrentUser: builder.mutation({
      query: profileData => ({
        url: '/v1/users/me',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['CurrentUser', 'Alumni'],
    }),

    updateUserAddress: builder.mutation({
      query: ({ addressId, ...addressData }) => ({
        url: `/v1/users/me/addresses/${addressId}`,
        method: 'PUT',
        body: addressData,
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    updateProfilePicture: builder.mutation({
      query: formData => ({
        url: '/v1/users/me/profile-picture',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['CurrentUser', 'Alumni'],
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
} = apiSlice;
