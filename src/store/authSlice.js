import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  role: null, // Added to track ADMIN vs ALUMNI
  isAuthenticated: false,
  isProfileComplete: false,
  isApproved: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthFromStorage: (state, action) => {
      // Expecting an object from AsyncStorage now, not just a token string
      state.token = action.payload?.token;
      state.role = action.payload?.role || null;
      state.isAuthenticated = !!action.payload?.token;
      state.isProfileComplete = action.payload?.isProfileComplete || false;
      state.isApproved = action.payload?.isApproved || false;
    },
    setLoginSuccess: (state, action) => {
      const payload = action.payload; // The full API response
      state.token = payload.access_token;
      state.isAuthenticated = true;

      // Extract roles array safely
      const userRoles = payload.roles || [];

      if (userRoles.includes('ADMIN')) {
        // ADMIN: Bypass everything, go straight to Main App
        state.role = 'ADMIN';
        state.isProfileComplete = true;
        state.isApproved = true;
      } else if (userRoles.includes('ALUMNI')) {
        // ALUMNI: Approved user, go straight to Main App
        state.role = 'ALUMNI';
        state.isProfileComplete = true;
        state.isApproved = true;
      } else if (payload.code === 'PENDING_VERIFICATION') {
        // PENDING VERIFICATION: Filled form, waiting for admin
        state.role = 'ALUMNI';
        state.isProfileComplete = true; // Bypasses Onboarding
        state.isApproved = false; // Stops at Pending Screen
      } else if (payload.code === 'PENDING_REGISTRATION') {
        // PENDING REGISTRATION: Fresh OTP login, needs to fill form
        state.role = 'ALUMNI';
        state.isProfileComplete = false; // Stops at Onboarding
        state.isApproved = false;
      } else {
        // Fallback for safety
        state.isProfileComplete = false;
        state.isApproved = false;
      }
    },
    submitProfile: state => {
      console.log('REDUCER: Updating Profile Status');
      state.isProfileComplete = true;
      state.isApproved = false; 
    },
    approveUser: state => {
      state.isApproved = true;
    },
    setLogout: state => {
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isProfileComplete = false;
      state.isApproved = false;
    },
  },
});

export const {
  setAuthFromStorage,
  setLoginSuccess,
  setLogout,
  submitProfile,
  approveUser,
} = authSlice.actions;

export const selectIsAuthenticated = state => state.auth.isAuthenticated;
export const selectIsProfileComplete = state => state.auth.isProfileComplete;
export const selectIsApproved = state => state.auth.isApproved;
export const selectUserRole = state => state.auth.role; 

export default authSlice.reducer;
