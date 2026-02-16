import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import examService, { Exam, ExamCategory } from '../../api/services/examService';

interface ExamState {
  categories: ExamCategory[];
  exams: Exam[];
  selectedExam: Exam | null;
  loading: boolean;
  error: string | null;
}

const initialState: ExamState = {
  categories: [],
  exams: [],
  selectedExam: null,
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'exam/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await examService.getCategories();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchExams = createAsyncThunk(
  'exam/fetchExams',
  async (category?: string, { rejectWithValue }) => {
    try {
      const response = await examService.getExams(category);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchExamDetails = createAsyncThunk(
  'exam/fetchExamDetails',
  async (examId: string, { rejectWithValue }) => {
    try {
      const response = await examService.getExamDetails(examId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    clearExamError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Exams
    builder.addCase(fetchExams.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchExams.fulfilled, (state, action) => {
      state.loading = false;
      state.exams = action.payload;
    });
    builder.addCase(fetchExams.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Exam Details
    builder.addCase(fetchExamDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchExamDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedExam = action.payload;
    });
    builder.addCase(fetchExamDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearExamError } = examSlice.actions;
export default examSlice.reducer;
