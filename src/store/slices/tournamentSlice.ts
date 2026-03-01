import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import tournamentService from '../../api/services/tournamentService';
import {
  Tournament,
  TournamentFilters,
  TournamentLeaderboardEntry,
  LeaderboardFilters,
  MyTournamentsFilters,
  TournamentState,
} from '../../types/tournament.types';

const initialState: TournamentState = {
  tournaments: [],
  activeTournament: null,
  myTournaments: [],
  leaderboard: [],
  loading: false,
  error: null,
  filters: {},
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
};

// 📱 DISCOVERY & BROWSE - Async Thunks

// 1. Fetch tournaments list (Public)
export const fetchTournaments = createAsyncThunk(
  'tournament/fetchTournaments',
  async (filters: TournamentFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await tournamentService.getTournaments(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 2. Fetch tournament details (Public)
export const fetchTournamentDetails = createAsyncThunk(
  'tournament/fetchDetails',
  async (tournamentId: string, { rejectWithValue }) => {
    try {
      const response = await tournamentService.getTournamentDetails(tournamentId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 3. Fetch tournament leaderboard (Public)
export const fetchTournamentLeaderboard = createAsyncThunk(
  'tournament/fetchLeaderboard',
  async (
    { tournamentId, filters }: { tournamentId: string; filters?: LeaderboardFilters },
    { rejectWithValue }
  ) => {
    try {
      const response = await tournamentService.getTournamentLeaderboard(tournamentId, filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🔐 PARTICIPATION - Async Thunks

// 4. Join tournament (Auth Required)
export const joinTournament = createAsyncThunk(
  'tournament/join',
  async (params: { tournamentId: string; coinType?: 'paid' | 'free' }, { rejectWithValue }) => {
    try {
      const response = await tournamentService.joinTournament(params.tournamentId, params.coinType);
      return { ...response, tournamentId: params.tournamentId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 5. Fetch my tournaments (Auth Required)
export const fetchMyTournaments = createAsyncThunk(
  'tournament/fetchMyTournaments',
  async (filters: MyTournamentsFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await tournamentService.getMyTournaments(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 🎮 TEST ATTEMPT - Async Thunks

// 6. Start tournament test (Auth Required)
export const startTournamentTest = createAsyncThunk(
  'tournament/startTest',
  async (testId: string, { rejectWithValue }) => {
    try {
      const response = await tournamentService.startTournamentTest(testId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 7. Submit tournament test (Auth Required)
export const submitTournamentTest = createAsyncThunk(
  'tournament/submitTest',
  async (
    {
      attemptId,
      data,
    }: {
      attemptId: string;
      data: {
        answers: Array<{
          questionId: string;
          selectedOption: number;
          timeTaken: number;
        }>;
        timeTaken: number;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await tournamentService.submitTournamentTest(attemptId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 8. Get tournament test results (Auth Required)
export const fetchTournamentTestResults = createAsyncThunk(
  'tournament/fetchTestResults',
  async (attemptId: string, { rejectWithValue }) => {
    try {
      const response = await tournamentService.getTournamentTestResults(attemptId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Tournament Slice
const tournamentSlice = createSlice({
  name: 'tournament',
  initialState,
  reducers: {
    // Clear tournament error
    clearTournamentError: (state) => {
      state.error = null;
    },

    // Set tournament filters
    setTournamentFilters: (state, action: PayloadAction<TournamentFilters>) => {
      state.filters = action.payload;
    },

    // Clear tournament filters
    clearTournamentFilters: (state) => {
      state.filters = {};
    },

    // Set active tournament
    setActiveTournament: (state, action: PayloadAction<Tournament | null>) => {
      state.activeTournament = action.payload;
    },

    // Clear active tournament
    clearActiveTournament: (state) => {
      state.activeTournament = null;
    },

    // Reset tournament state
    resetTournamentState: (state) => {
      state.tournaments = [];
      state.activeTournament = null;
      state.myTournaments = [];
      state.leaderboard = [];
      state.loading = false;
      state.error = null;
      state.filters = {};
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        total: 0,
      };
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch Tournaments
    builder.addCase(fetchTournaments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTournaments.fulfilled, (state, action) => {
      state.loading = false;
      state.tournaments = action.payload.tournaments || action.payload;
      state.pagination = {
        currentPage: action.payload.currentPage || 1,
        totalPages: action.payload.totalPages || 1,
        total: action.payload.total || action.payload.length || 0,
      };
    });
    builder.addCase(fetchTournaments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 2. Fetch Tournament Details
    builder.addCase(fetchTournamentDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTournamentDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.activeTournament = action.payload.tournament;
      // Update leaderboard if present
      if (action.payload.topParticipants) {
        state.leaderboard = action.payload.topParticipants;
      }
    });
    builder.addCase(fetchTournamentDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 3. Fetch Tournament Leaderboard
    builder.addCase(fetchTournamentLeaderboard.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTournamentLeaderboard.fulfilled, (state, action) => {
      state.loading = false;
      state.leaderboard = action.payload.leaderboard;
      state.pagination = {
        currentPage: action.payload.currentPage || 1,
        totalPages: action.payload.totalPages || 1,
        total: action.payload.total || action.payload.leaderboard.length,
      };
    });
    builder.addCase(fetchTournamentLeaderboard.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 4. Join Tournament
    builder.addCase(joinTournament.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(joinTournament.fulfilled, (state, action) => {
      state.loading = false;
      // Update the tournament in the list if present
      const tournamentIndex = state.tournaments.findIndex(
        (t) => t._id === action.payload.tournamentId
      );
      if (tournamentIndex !== -1) {
        state.tournaments[tournamentIndex].isJoined = true;
        state.tournaments[tournamentIndex].currentParticipants += 1;
      }
      // Update active tournament if it's the same
      if (state.activeTournament?._id === action.payload.tournamentId) {
        state.activeTournament.isJoined = true;
        state.activeTournament.currentParticipants += 1;
      }
    });
    builder.addCase(joinTournament.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 5. Fetch My Tournaments
    builder.addCase(fetchMyTournaments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMyTournaments.fulfilled, (state, action) => {
      state.loading = false;
      state.myTournaments = action.payload.tournaments || [];
      state.pagination = {
        currentPage: action.payload.currentPage || 1,
        totalPages: action.payload.totalPages || 1,
        total: action.payload.total || 0,
      };
    });
    builder.addCase(fetchMyTournaments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 6. Start Tournament Test
    builder.addCase(startTournamentTest.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(startTournamentTest.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(startTournamentTest.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 7. Submit Tournament Test
    builder.addCase(submitTournamentTest.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(submitTournamentTest.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(submitTournamentTest.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 8. Fetch Tournament Test Results
    builder.addCase(fetchTournamentTestResults.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTournamentTestResults.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(fetchTournamentTestResults.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  clearTournamentError,
  setTournamentFilters,
  clearTournamentFilters,
  setActiveTournament,
  clearActiveTournament,
  resetTournamentState,
} = tournamentSlice.actions;

export default tournamentSlice.reducer;
