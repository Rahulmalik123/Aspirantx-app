import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import examReducer from './slices/examSlice';
import savedContentReducer from './slices/savedContentSlice';
import tournamentReducer from './slices/tournamentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    exam: examReducer,
    savedContent: savedContentReducer,
    tournament: tournamentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
