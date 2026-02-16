import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { savedContentService, SavedContentItem, SaveContentPayload, UnsaveContentPayload } from '../../api/services/savedContent.service';

interface SavedContentState {
  items: SavedContentItem[];
  counts: {
    total: number;
    posts: number;
    tests: number;
    pdfs: number;
  };
  folders: Array<{ name: string; count: number }>;
  currentFilter: 'all' | 'post' | 'test' | 'pdf';
  currentFolder: string | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: SavedContentState = {
  items: [],
  counts: {
    total: 0,
    posts: 0,
    tests: 0,
    pdfs: 0,
  },
  folders: [],
  currentFilter: 'all',
  currentFolder: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const fetchSavedContent = createAsyncThunk(
  'savedContent/fetchSavedContent',
  async (params?: {
    contentType?: 'post' | 'test' | 'pdf';
    folder?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await savedContentService.getSavedContent(params);
    console.log('fetchSavedContent thunk response:', response);
    return response;
  }
);

export const fetchSavedContentCount = createAsyncThunk(
  'savedContent/fetchSavedContentCount',
  async () => {
    const response = await savedContentService.getSavedContentCount();
    console.log('fetchSavedContentCount thunk response:', response);
    return response;
  }
);

export const fetchFolders = createAsyncThunk(
  'savedContent/fetchFolders',
  async () => {
    const response = await savedContentService.getFolders();
    return response;
  }
);

export const saveContent = createAsyncThunk(
  'savedContent/saveContent',
  async (payload: SaveContentPayload, { rejectWithValue }) => {
    try {
      const response = await savedContentService.saveContent(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save content');
    }
  }
);

export const unsaveContent = createAsyncThunk(
  'savedContent/unsaveContent',
  async (payload: UnsaveContentPayload, { rejectWithValue }) => {
    try {
      await savedContentService.unsaveContent(payload);
      return payload;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unsave content');
    }
  }
);

export const removeSavedContent = createAsyncThunk(
  'savedContent/removeSavedContent',
  async (savedContentId: string, { rejectWithValue }) => {
    try {
      await savedContentService.removeSavedContent(savedContentId);
      return savedContentId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove saved content');
    }
  }
);

export const updateSavedContent = createAsyncThunk(
  'savedContent/updateSavedContent',
  async (
    { id, payload }: { id: string; payload: { notes?: string; tags?: string[]; folder?: string } },
    { rejectWithValue }
  ) => {
    try {
      const response = await savedContentService.updateSavedContent(id, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update saved content');
    }
  }
);

const savedContentSlice = createSlice({
  name: 'savedContent',
  initialState,
  reducers: {
    setCurrentFilter: (state, action: PayloadAction<'all' | 'post' | 'test' | 'pdf'>) => {
      state.currentFilter = action.payload;
    },
    setCurrentFolder: (state, action: PayloadAction<string | null>) => {
      state.currentFolder = action.payload;
    },
    clearSavedContent: (state) => {
      state.items = [];
      state.pagination = initialState.pagination;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch saved content
    builder
      .addCase(fetchSavedContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedContent.fulfilled, (state, action) => {
        console.log('fetchSavedContent.fulfilled - action.payload:', action.payload);
        state.loading = false;
        if (action.payload?.data) {
          console.log('Setting items to:', action.payload.data);
          state.items = action.payload.data;
        } else {
          console.log('No data in payload');
        }
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchSavedContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch saved content';
      });

    // Fetch counts
    builder
      .addCase(fetchSavedContentCount.fulfilled, (state, action) => {
        console.log('fetchSavedContentCount.fulfilled - action.payload:', action.payload);
        // API client interceptor already extracts response.data
        // So action.payload is the entire response { success, data }
        if (action.payload?.data) {
          console.log('Setting counts to:', action.payload.data);
          state.counts = action.payload.data;
        } else if (action.payload?.total !== undefined) {
          // Fallback: if payload is the counts object directly
          console.log('Setting counts to payload directly:', action.payload);
          state.counts = action.payload as any;
        } else {
          console.log('No data in counts payload');
        }
      });

    // Fetch folders
    builder
      .addCase(fetchFolders.fulfilled, (state, action) => {
        if (action.payload?.data) {
          state.folders = action.payload.data;
        }
      });

    // Save content
    builder
      .addCase(saveContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveContent.fulfilled, (state, action) => {
        state.loading = false;
        const savedItem = action.payload.data;
        state.items.unshift(savedItem);
        state.counts.total += 1;
        if (savedItem.contentType === 'post') state.counts.posts += 1;
        if (savedItem.contentType === 'test') state.counts.tests += 1;
        if (savedItem.contentType === 'pdf') state.counts.pdfs += 1;
      })
      .addCase(saveContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Unsave content
    builder
      .addCase(unsaveContent.fulfilled, (state, action) => {
        const { contentType, contentId } = action.payload;
        state.items = state.items.filter(item => {
          if (item.contentType === contentType) {
            if (contentType === 'post' && item.post?._id === contentId) return false;
            if (contentType === 'test' && item.test?._id === contentId) return false;
            if (contentType === 'pdf' && item.pdf?._id === contentId) return false;
          }
          return true;
        });
        state.counts.total -= 1;
        if (contentType === 'post') state.counts.posts -= 1;
        if (contentType === 'test') state.counts.tests -= 1;
        if (contentType === 'pdf') state.counts.pdfs -= 1;
      });

    // Remove saved content
    builder
      .addCase(removeSavedContent.fulfilled, (state, action) => {
        const removedItem = state.items.find(item => item._id === action.payload);
        if (removedItem) {
          state.items = state.items.filter(item => item._id !== action.payload);
          state.counts.total -= 1;
          if (removedItem.contentType === 'post') state.counts.posts -= 1;
          if (removedItem.contentType === 'test') state.counts.tests -= 1;
          if (removedItem.contentType === 'pdf') state.counts.pdfs -= 1;
        }
      });

    // Update saved content
    builder
      .addCase(updateSavedContent.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const {
  setCurrentFilter,
  setCurrentFolder,
  clearSavedContent,
  clearError,
} = savedContentSlice.actions;

export default savedContentSlice.reducer;
