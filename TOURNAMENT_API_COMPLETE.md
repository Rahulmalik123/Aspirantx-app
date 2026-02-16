# Tournament APIs - Complete Implementation Guide

## 🎯 Overview
Complete tournament system with 8 APIs covering discovery, participation, and test attempts.

**Base URL:** `/api/v1/tournaments`

---

## 📊 API Summary

### Public APIs (No Auth Required) - 3 APIs
1. `GET /` - List active tournaments
2. `GET /details/:tournamentId` - Tournament details
3. `GET /leaderboard/:tournamentId` - Live leaderboard

### Protected APIs (Auth Required) - 5 APIs
4. `POST /join/:tournamentId` - Join tournament
5. `GET /my-tournaments` - User's tournament history
6. `POST /api/v1/tests/:testId/start` - Start tournament test
7. `POST /api/v1/tests/submit/:attemptId` - Submit answers
8. `GET /api/v1/tests/results/:attemptId` - View results

---

## 📱 DISCOVERY & BROWSE APIs

### 1. List Active Tournaments
**Endpoint:** `GET /api/v1/tournaments`  
**Auth:** Not Required (Public)

**Query Parameters:**
```typescript
{
  examId?: string;           // Filter by exam
  status?: 'upcoming' | 'live' | 'completed';
  minEntryFee?: number;      // Minimum entry fee
  maxEntryFee?: number;      // Maximum entry fee
  minPrize?: number;         // Minimum prize pool
  maxPrize?: number;         // Maximum prize pool
  startDate?: string;        // Filter by start date (ISO)
  endDate?: string;          // Filter by end date (ISO)
  search?: string;           // Search by name/description
  page?: number;             // Pagination page (default: 1)
  limit?: number;            // Items per page (default: 10)
}
```

**Response:**
```typescript
{
  tournaments: Tournament[];
  total: number;
  currentPage: number;
  totalPages: number;
}
```

**Usage Example:**
```typescript
import tournamentService from '@/api/services/tournamentService';

// Fetch upcoming tournaments for a specific exam
const filters = {
  examId: '123',
  status: 'upcoming',
  page: 1,
  limit: 20
};

const result = await tournamentService.getTournaments(filters);
```

**Redux Usage:**
```typescript
import { useDispatch, useSelector } from 'react-redux';
import { fetchTournaments } from '@/store/slices/tournamentSlice';

const dispatch = useDispatch();

// Fetch tournaments
dispatch(fetchTournaments({ status: 'upcoming', examId: '123' }));

// Access from state
const { tournaments, loading, error } = useSelector(state => state.tournament);
```

---

### 2. Get Tournament Details
**Endpoint:** `GET /api/v1/tournaments/details/:tournamentId`  
**Auth:** Not Required (Public)

**Response:**
```typescript
{
  tournament: Tournament;
  participantCount: number;
  topParticipants?: TournamentLeaderboardEntry[];
}
```

**Tournament Object:**
```typescript
{
  _id: string;
  name: string;
  description: string;
  examId: string;
  testId: string;
  startTime: string;
  endTime: string;
  registrationEndTime: string;
  entryFee: number;
  prizePool: number;
  prizeDistribution?: Array<{
    rank: string;
    amount: number;
    percentage: number;
  }>;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'live' | 'completed';
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  rules?: string[];
  bannerImage?: string;
  isJoined?: boolean;
  userRank?: number;
  userScore?: number;
}
```

**Usage Example:**
```typescript
const details = await tournamentService.getTournamentDetails('tournament-id');
console.log(details.tournament.name);
console.log(details.participantCount);
```

**Redux Usage:**
```typescript
dispatch(fetchTournamentDetails('tournament-id'));

const { activeTournament, loading } = useSelector(state => state.tournament);
```

---

### 3. Get Tournament Leaderboard
**Endpoint:** `GET /api/v1/tournaments/leaderboard/:tournamentId`  
**Auth:** Not Required (Public)

**Query Parameters:**
```typescript
{
  minScore?: number;
  maxScore?: number;
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  leaderboard: TournamentLeaderboardEntry[];
  total: number;
  userRank?: number;        // If user is authenticated
  currentPage: number;
  totalPages: number;
}
```

**Leaderboard Entry:**
```typescript
{
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  score: number;
  timeTaken: number;
  accuracy: number;
  correctAnswers: number;
  incorrectAnswers: number;
  attemptedQuestions: number;
}
```

**Usage Example:**
```typescript
const leaderboard = await tournamentService.getTournamentLeaderboard(
  'tournament-id',
  { page: 1, limit: 50 }
);
```

**Redux Usage:**
```typescript
dispatch(fetchTournamentLeaderboard({ 
  tournamentId: 'tournament-id',
  filters: { page: 1, limit: 50 }
}));

const { leaderboard, loading } = useSelector(state => state.tournament);
```

---

## 🔐 PARTICIPATION APIs (Auth Required)

### 4. Join Tournament
**Endpoint:** `POST /api/v1/tournaments/:tournamentId/join`  
**Auth:** Required

**Validations:**
- Tournament status must be 'upcoming'
- Max participants not reached
- User not already joined

**Response:**
```typescript
{
  success: boolean;
  message: string;
  tournamentId: string;
  participantId: string;
}
```

**Usage Example:**
```typescript
try {
  const result = await tournamentService.joinTournament('tournament-id');
  console.log(result.message); // "Successfully joined tournament"
} catch (error) {
  console.error(error.message); // "Already joined" or "Tournament is full"
}
```

**Redux Usage:**
```typescript
dispatch(joinTournament('tournament-id'))
  .unwrap()
  .then(result => {
    Alert.alert('Success', result.message);
  })
  .catch(error => {
    Alert.alert('Error', error);
  });
```

**Validation Helper:**
```typescript
const canJoin = await tournamentService.canJoinTournament('tournament-id');
if (canJoin.canJoin) {
  // Show join button
} else {
  // Show reason: canJoin.reason
}
```

---

### 5. Get My Tournaments
**Endpoint:** `GET /api/v1/tournaments/my-tournaments`  
**Auth:** Required

**Query Parameters:**
```typescript
{
  status?: 'upcoming' | 'live' | 'completed';
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  tournaments: Tournament[];
  total: number;
  currentPage: number;
  totalPages: number;
}
```

**Usage Example:**
```typescript
// Get all my tournaments
const all = await tournamentService.getMyTournaments();

// Get only upcoming tournaments
const upcoming = await tournamentService.getMyTournaments({ 
  status: 'upcoming' 
});

// Get completed with pagination
const completed = await tournamentService.getMyTournaments({ 
  status: 'completed',
  page: 1,
  limit: 10
});
```

**Redux Usage:**
```typescript
dispatch(fetchMyTournaments({ status: 'upcoming' }));

const { myTournaments, loading } = useSelector(state => state.tournament);
```

---

## 🎮 TEST ATTEMPT APIs (Auth Required)

### 6. Start Tournament Test
**Endpoint:** `POST /api/v1/tests/:testId/start`  
**Auth:** Required

**Response:**
```typescript
{
  attemptId: string;
  test: {
    _id: string;
    title: string;
    duration: number;
    totalQuestions: number;
    totalMarks: number;
    // ... other test details
  };
  startTime: string;
  questions: Array<{
    _id: string;
    question: string;
    options: string[];
    marks: number;
    negativeMarks: number;
    // ... other question fields
  }>;
}
```

**Usage Example:**
```typescript
const testData = await tournamentService.startTournamentTest('test-id');
const { attemptId, questions, startTime } = testData;

// Navigate to test screen with questions
navigation.navigate('TournamentTest', { 
  attemptId, 
  questions,
  startTime
});
```

**Redux Usage:**
```typescript
dispatch(startTournamentTest('test-id'))
  .unwrap()
  .then(data => {
    // Store attemptId for submission
    navigation.navigate('TournamentTest', data);
  })
  .catch(error => {
    Alert.alert('Error', error);
  });
```

---

### 7. Submit Tournament Test
**Endpoint:** `POST /api/v1/tests/submit/:attemptId`  
**Auth:** Required

**Request Body:**
```typescript
{
  answers: Array<{
    questionId: string;
    selectedOption: number;  // 0, 1, 2, or 3
    timeTaken: number;       // in seconds
  }>;
  timeTaken: number;         // Total time in seconds
}
```

**Response:**
```typescript
{
  success: boolean;
  score: number;
  rank?: number;
  message: string;
}
```

**Auto-Updates:** This API automatically updates the TournamentParticipant record.

**Usage Example:**
```typescript
const answers = [
  { questionId: 'q1', selectedOption: 2, timeTaken: 30 },
  { questionId: 'q2', selectedOption: 1, timeTaken: 45 },
  { questionId: 'q3', selectedOption: 0, timeTaken: 60 },
];

const result = await tournamentService.submitTournamentTest(
  'attempt-id',
  {
    answers,
    timeTaken: 1800  // 30 minutes
  }
);

console.log(`Score: ${result.score}, Rank: ${result.rank}`);
```

**Redux Usage:**
```typescript
dispatch(submitTournamentTest({ 
  attemptId: 'attempt-id',
  data: { answers, timeTaken: 1800 }
}))
  .unwrap()
  .then(result => {
    navigation.navigate('TournamentResults', { 
      attemptId: 'attempt-id' 
    });
  });
```

---

### 8. Get Tournament Test Results
**Endpoint:** `GET /api/v1/tests/results/:attemptId`  
**Auth:** Required

**Response:**
```typescript
{
  attempt: {
    _id: string;
    test: string;
    user: string;
    answers: Array<{
      question: string;
      selectedOption: number;
      isCorrect: boolean;
      timeTaken: number;
    }>;
    completedAt: string;
  };
  score: number;
  percentage: number;
  rank: number;
  totalParticipants: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  timeTaken: number;
  solutions?: Array<{
    questionId: string;
    correctOption: number;
    explanation: string;
  }>;
}
```

**Usage Example:**
```typescript
const results = await tournamentService.getTournamentTestResults('attempt-id');

console.log(`Rank: ${results.rank}/${results.totalParticipants}`);
console.log(`Score: ${results.score} (${results.percentage}%)`);
console.log(`Correct: ${results.correctAnswers}, Incorrect: ${results.incorrectAnswers}`);
```

**Redux Usage:**
```typescript
dispatch(fetchTournamentTestResults('attempt-id'));

const { loading, error } = useSelector(state => state.tournament);
```

---

## 🎨 Complete Usage Flow

### Flow 1: Browse and Join Tournament
```typescript
// 1. List tournaments
const tournaments = await tournamentService.getTournaments({
  status: 'upcoming',
  examId: 'exam-123'
});

// 2. Get tournament details
const details = await tournamentService.getTournamentDetails(tournaments[0]._id);

// 3. Check if can join
const canJoin = await tournamentService.canJoinTournament(tournaments[0]._id);

// 4. Join tournament
if (canJoin.canJoin) {
  const result = await tournamentService.joinTournament(tournaments[0]._id);
  Alert.alert('Success', result.message);
}
```

### Flow 2: Take Tournament Test
```typescript
// 1. Start test (when tournament is live)
const testData = await tournamentService.startTournamentTest('test-id');
const { attemptId, questions } = testData;

// 2. User answers questions...
const answers = questions.map((q, index) => ({
  questionId: q._id,
  selectedOption: userAnswers[index],
  timeTaken: timeTakenPerQuestion[index]
}));

// 3. Submit test
const result = await tournamentService.submitTournamentTest(attemptId, {
  answers,
  timeTaken: totalTimeTaken
});

// 4. Get results
const results = await tournamentService.getTournamentTestResults(attemptId);
```

### Flow 3: View Leaderboard
```typescript
// Get leaderboard (can be called anytime - public)
const leaderboard = await tournamentService.getTournamentLeaderboard(
  'tournament-id',
  { page: 1, limit: 50 }
);

// Display top participants
leaderboard.leaderboard.forEach(participant => {
  console.log(`${participant.rank}. ${participant.userName} - ${participant.score}`);
});
```

### Flow 4: My Tournaments History
```typescript
// Get upcoming tournaments I've joined
const upcoming = await tournamentService.getMyTournaments({ 
  status: 'upcoming' 
});

// Get completed tournaments with results
const completed = await tournamentService.getMyTournaments({ 
  status: 'completed' 
});

// Display my rank and score in completed tournaments
completed.tournaments.forEach(tournament => {
  if (tournament.userRank && tournament.userScore) {
    console.log(`${tournament.name}: Rank ${tournament.userRank}, Score ${tournament.userScore}`);
  }
});
```

---

## 🔧 Utility Methods

### Check if User Can Join
```typescript
const result = await tournamentService.canJoinTournament('tournament-id');
if (!result.canJoin) {
  Alert.alert('Cannot Join', result.reason);
}
```

### Get Tournament Statistics
```typescript
const stats = await tournamentService.getTournamentStats('tournament-id');
console.log(`Average Score: ${stats.averageScore}`);
console.log(`Highest Score: ${stats.highestScore}`);
console.log(`Completion Rate: ${stats.completionRate}%`);
```

---

## 📦 Files Created/Updated

### New Files
1. ✅ `src/types/tournament.types.ts` - All TypeScript types
2. ✅ `src/store/slices/tournamentSlice.ts` - Redux slice with all actions

### Updated Files
1. ✅ `src/api/services/tournamentService.ts` - Complete service with 8 APIs
2. ✅ `src/store/index.ts` - Added tournament reducer
3. ✅ `src/api/endpoints.ts` - Tournament endpoints (already existed)

---

## 🎯 Redux State Management

### State Structure
```typescript
{
  tournaments: Tournament[];          // List of tournaments
  activeTournament: Tournament | null; // Currently selected tournament
  myTournaments: Tournament[];        // User's joined tournaments
  leaderboard: TournamentLeaderboardEntry[]; // Current leaderboard
  loading: boolean;
  error: string | null;
  filters: TournamentFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}
```

### Available Actions
```typescript
// Async actions
fetchTournaments(filters?)
fetchTournamentDetails(tournamentId)
fetchTournamentLeaderboard({ tournamentId, filters? })
joinTournament(tournamentId)
fetchMyTournaments(filters?)
startTournamentTest(testId)
submitTournamentTest({ attemptId, data })
fetchTournamentTestResults(attemptId)

// Sync actions
clearTournamentError()
setTournamentFilters(filters)
clearTournamentFilters()
setActiveTournament(tournament)
clearActiveTournament()
resetTournamentState()
```

---

## ✅ Implementation Complete!

All 8 Tournament APIs are fully implemented with:
- ✅ Complete TypeScript types
- ✅ Service layer with error handling
- ✅ Redux state management
- ✅ Public and protected APIs
- ✅ Pagination support
- ✅ Filtering capabilities
- ✅ Utility methods
- ✅ Full documentation

**Ready to use in your React Native app!** 🚀
