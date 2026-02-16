# 🏆 Tournament APIs - Quick Reference

## 📱 Import Statements

```typescript
// Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTournaments,
  fetchTournamentDetails,
  fetchTournamentLeaderboard,
  joinTournament,
  fetchMyTournaments,
  startTournamentTest,
  submitTournamentTest,
  fetchTournamentTestResults,
} from '@/store/slices/tournamentSlice';

// Direct Service
import tournamentService from '@/api/services/tournamentService';

// Types
import type { 
  Tournament, 
  TournamentFilters,
  TournamentLeaderboardEntry 
} from '@/types/tournament.types';
```

---

## 🎯 Quick API Calls

### 1. List Tournaments
```typescript
// Redux
dispatch(fetchTournaments({ status: 'upcoming', examId: '123' }));

// Direct
const result = await tournamentService.getTournaments({ status: 'upcoming' });
```

### 2. Get Tournament Details
```typescript
// Redux
dispatch(fetchTournamentDetails('tournament-id'));

// Direct
const details = await tournamentService.getTournamentDetails('tournament-id');
```

### 3. Get Leaderboard
```typescript
// Redux
dispatch(fetchTournamentLeaderboard({ 
  tournamentId: 'tournament-id',
  filters: { page: 1, limit: 50 }
}));

// Direct
const leaderboard = await tournamentService.getTournamentLeaderboard('tournament-id');
```

### 4. Join Tournament
```typescript
// Redux
dispatch(joinTournament('tournament-id'))
  .unwrap()
  .then(result => Alert.alert('Success', result.message))
  .catch(error => Alert.alert('Error', error));

// Direct
const result = await tournamentService.joinTournament('tournament-id');
```

### 5. Get My Tournaments
```typescript
// Redux
dispatch(fetchMyTournaments({ status: 'upcoming' }));

// Direct
const myTournaments = await tournamentService.getMyTournaments({ status: 'upcoming' });
```

### 6. Start Tournament Test
```typescript
// Redux
dispatch(startTournamentTest('test-id'))
  .unwrap()
  .then(data => {
    const { attemptId, questions } = data;
    // Navigate to test screen
  });

// Direct
const testData = await tournamentService.startTournamentTest('test-id');
```

### 7. Submit Tournament Test
```typescript
// Redux
dispatch(submitTournamentTest({
  attemptId: 'attempt-id',
  data: {
    answers: [
      { questionId: 'q1', selectedOption: 2, timeTaken: 30 },
      { questionId: 'q2', selectedOption: 1, timeTaken: 45 }
    ],
    timeTaken: 1800
  }
}));

// Direct
const result = await tournamentService.submitTournamentTest('attempt-id', {
  answers: [...],
  timeTaken: 1800
});
```

### 8. Get Test Results
```typescript
// Redux
dispatch(fetchTournamentTestResults('attempt-id'));

// Direct
const results = await tournamentService.getTournamentTestResults('attempt-id');
```

---

## 🎨 Common Patterns

### Check if Can Join
```typescript
const canJoin = await tournamentService.canJoinTournament('tournament-id');
if (!canJoin.canJoin) {
  Alert.alert('Cannot Join', canJoin.reason);
}
```

### Get Tournament Stats
```typescript
const stats = await tournamentService.getTournamentStats('tournament-id');
console.log(`Average Score: ${stats.averageScore}`);
```

### Access Redux State
```typescript
const { 
  tournaments,        // List of tournaments
  activeTournament,   // Selected tournament
  myTournaments,      // User's tournaments
  leaderboard,        // Current leaderboard
  loading,            // Loading state
  error,              // Error message
  pagination          // Pagination info
} = useSelector(state => state.tournament);
```

### Handle Errors
```typescript
try {
  await dispatch(joinTournament('id')).unwrap();
} catch (error: any) {
  Alert.alert('Error', error);
}
```

---

## 📊 Filter Examples

### Tournament Filters
```typescript
const filters: TournamentFilters = {
  examId: '123',
  status: 'upcoming',
  minEntryFee: 0,
  maxEntryFee: 100,
  minPrize: 1000,
  maxPrize: 10000,
  search: 'JEE',
  page: 1,
  limit: 20
};
```

### Leaderboard Filters
```typescript
const filters: LeaderboardFilters = {
  minScore: 50,
  maxScore: 100,
  page: 1,
  limit: 50
};
```

### My Tournaments Filters
```typescript
const filters: MyTournamentsFilters = {
  status: 'completed',
  page: 1,
  limit: 10
};
```

---

## 🔥 One-Liners

```typescript
// Get all upcoming tournaments
const upcoming = await tournamentService.getTournaments({ status: 'upcoming' });

// Get tournament details
const details = await tournamentService.getTournamentDetails('id');

// Join tournament
await tournamentService.joinTournament('id');

// Get my tournaments
const mine = await tournamentService.getMyTournaments();

// Start test
const test = await tournamentService.startTournamentTest('test-id');

// Get leaderboard
const board = await tournamentService.getTournamentLeaderboard('id');
```

---

## 🎯 Complete Flow

```typescript
// 1. Browse
const tournaments = await tournamentService.getTournaments({ status: 'upcoming' });

// 2. Details
const details = await tournamentService.getTournamentDetails(tournaments[0]._id);

// 3. Join
await tournamentService.joinTournament(tournaments[0]._id);

// 4. Start Test (when live)
const test = await tournamentService.startTournamentTest(tournaments[0].testId);

// 5. Submit Test
await tournamentService.submitTournamentTest(test.attemptId, {
  answers: [...],
  timeTaken: 1800
});

// 6. Results
const results = await tournamentService.getTournamentTestResults(test.attemptId);

// 7. Leaderboard
const leaderboard = await tournamentService.getTournamentLeaderboard(tournaments[0]._id);
```

---

## 📁 File Locations

```
src/
├── api/
│   ├── endpoints.ts                    # API endpoints
│   └── services/
│       └── tournamentService.ts        # Service with all 8 APIs
├── types/
│   └── tournament.types.ts             # TypeScript types
└── store/
    ├── index.ts                        # Store config (updated)
    └── slices/
        └── tournamentSlice.ts          # Redux slice

Docs/
├── TOURNAMENT_API_COMPLETE.md          # Full documentation
├── TOURNAMENT_USAGE_EXAMPLES.tsx       # Code examples
└── TOURNAMENT_IMPLEMENTATION_SUMMARY.md # Summary
```

---

## ✅ Checklist

**Implementation:**
- ✅ 8 APIs implemented
- ✅ TypeScript types defined
- ✅ Redux integration complete
- ✅ Error handling added
- ✅ Documentation complete

**Testing:**
- [ ] Test with backend
- [ ] Verify Redux state
- [ ] Test error cases
- [ ] Check pagination
- [ ] Validate filters

**UI Integration:**
- [ ] Create tournament screens
- [ ] Add tournament navigation
- [ ] Implement test flow
- [ ] Add leaderboard view
- [ ] Style components

---

## 🚀 Ready to Use!

All tournament APIs are fully implemented and ready for integration into your React Native app!
