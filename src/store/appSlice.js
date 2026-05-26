import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hasSeenOnboarding: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setHasSeenOnboarding(state, action) {
      state.hasSeenOnboarding = action.payload;
    },
  },
});

export const { setHasSeenOnboarding } = appSlice.actions;

export const selectHasSeenOnboarding = state => state.app.hasSeenOnboarding;

export default appSlice.reducer;
