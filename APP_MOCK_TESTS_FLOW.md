# 📱 App Side - Mock Tests Flow Documentation

Complete flow for how users interact with Mock Tests in the mobile/web app.

---

## 🎯 **Complete User Journey**

```
User opens App
    ↓
Selects Exam (SSC CGL, SSC CHSL, etc.)
    ↓
Views available Tests/Quizzes
    ↓
Selects a Test/Quiz
    ↓
Views Test Details (questions, duration, marks)
    ↓
Starts Test (Timer begins)
    ↓
Attempts Questions (one by one)
    ↓
Submits Test
    ↓
Views Results & Analysis
    ↓
Reviews Answers with Explanations
```

---

## 📋 **Test Types Available for Users**

### **1. Daily Quiz (Free)**
- **Source**: Question Bank
- **Questions**: 10 questions daily
- **Auto-generated**: System picks questions daily
- **Availability**: New quiz every day at 12:00 AM
- **Access**: All users (Free)

### **2. Topic Tests**
- **Source**: Question Bank (filtered by topic)
- **Questions**: 20-30 questions
- **Purpose**: Practice specific topics
- **Access**: Free/Paid based on admin settings

### **3. Subject Tests**
- **Source**: Question Bank (filtered by subject)
- **Questions**: 50-100 questions
- **Purpose**: Full subject practice
- **Access**: Free/Paid

### **4. Mock Tests (Full Length)**
- **Source**: Multiple Question Banks
- **Questions**: 100-200 questions (exam pattern)
- **Duration**: 60-180 minutes
- **Sections**: Multiple subjects (Quant, Reasoning, English, GA)
- **Access**: Usually Paid

### **5. PYQ Tests (Previous Year Papers)**
- **Source**: PYQ Bank (CSV uploaded papers)
- **Questions**: Actual exam questions
- **Year**: 2020, 2021, 2022, etc.
- **Access**: Premium users

### **6. Quiz Battles (Multiplayer)**
- **Source**: Question Bank
- **Questions**: 10 questions
- **Mode**: Real-time 1v1 or multiplayer
- **Access**: Free with coins

---

## 🔄 **Test Lifecycle Flow**

### **Step 1: Browse Tests**

**API Endpoint:**
```
GET /api/v1/tests?examId=64abc123&type=mock_test&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64xyz890",
      "title": "SSC CGL Mock Test 1",
      "type": "mock_test",
      "duration": 60,
      "totalQuestions": 100,
      "totalMarks": 200,
      "isPaid": true,
      "price": 50,
      "isActive": true,
      "sections": [
        { "name": "Quantitative Aptitude", "questions": 25 },
        { "name": "Reasoning", "questions": 25 },
        { "name": "English", "questions": 25 },
        { "name": "General Awareness", "questions": 25 }
      ]
    }
  ]
}
```

---

### **Step 2: View Test Details**

**API Endpoint:**
```
GET /api/v1/tests/64xyz890
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64xyz890",
    "title": "SSC CGL Mock Test 1",
    "description": "Full-length mock test as per SSC CGL pattern",
    "type": "mock_test",
    "duration": 60,
    "totalQuestions": 100,
    "totalMarks": 200,
    "negativeMarking": true,
    "negativeMarkingRatio": "1:4",
    "isPaid": true,
    "price": 50,
    "sections": [
      {
        "name": "Quantitative Aptitude",
        "subjectId": "64sub123",
        "questions": 25,
        "duration": 15
      }
    ],
    "totalAttempts": 1523,
    "averageScore": 142.5,
    "userAttempted": false,
    "userPurchased": false
  }
}
```

---

### **Step 3: Purchase Test (if Paid)**

**If `isPaid: true` and `userPurchased: false`:**

**API Endpoint:**
```
POST /api/v1/payments/purchase
```

**Request:**
```json
{
  "itemType": "test",
  "itemId": "64xyz890",
  "price": 50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test purchased successfully",
  "data": {
    "transactionId": "TXN123456",
    "remainingCoins": 450
  }
}
```

---

### **Step 4: Start Test**

**API Endpoint:**
```
POST /api/v1/tests/64xyz890/start
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": "64attempt123",
    "testId": "64xyz890",
    "userId": "64user456",
    "questions": [
      {
        "_id": "64q001",
        "questionText": "What is 25% of 800?",
        "options": ["150", "200", "250", "300"],
        "type": "single_choice",
        "marks": 2,
        "negativeMarks": 0.5
      },
      {
        "_id": "64q002",
        "questionText": "Find the next number: 2, 6, 12, 20, ?",
        "options": ["28", "30", "32", "36"],
        "type": "single_choice",
        "marks": 2,
        "negativeMarks": 0.5
      }
      // ... 98 more questions
    ],
    "startTime": "2026-02-11T10:30:00.000Z",
    "endTime": "2026-02-11T11:30:00.000Z",
    "duration": 60,
    "status": "in_progress"
  }
}
```

**Note:** Questions are sent WITHOUT `correctAnswer` and `explanation` fields.

---

### **Step 5: Submit Answers (During Test)**

**User can submit answers one by one or in bulk:**

**API Endpoint:**
```
POST /api/v1/tests/attempts/64attempt123/answer
```

**Request:**
```json
{
  "questionId": "64q001",
  "selectedAnswer": 1,
  "timeTaken": 45
}
```

**Response:**
```json
{
  "success": true,
  "message": "Answer saved"
}
```

---

### **Step 6: Submit Test**

**API Endpoint:**
```
POST /api/v1/tests/attempts/64attempt123/submit
```

**Request:**
```json
{
  "answers": [
    { "questionId": "64q001", "selectedAnswer": 1, "timeTaken": 45 },
    { "questionId": "64q002", "selectedAnswer": 3, "timeTaken": 30 }
    // ... all answers
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": "64attempt123",
    "status": "completed",
    "totalQuestions": 100,
    "attempted": 95,
    "correct": 72,
    "incorrect": 23,
    "skipped": 5,
    "totalMarks": 200,
    "marksObtained": 132.5,
    "percentage": 66.25,
    "timeTaken": 3420,
    "rank": 245,
    "totalParticipants": 1523,
    "resultId": "64result789"
  }
}
```

---

### **Step 7: View Results & Analysis**

**API Endpoint:**
```
GET /api/v1/tests/attempts/64attempt123/result
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": "64attempt123",
    "testTitle": "SSC CGL Mock Test 1",
    "userId": "64user456",
    "userName": "Rahul Malik",
    
    "summary": {
      "totalQuestions": 100,
      "attempted": 95,
      "correct": 72,
      "incorrect": 23,
      "skipped": 5,
      "totalMarks": 200,
      "marksObtained": 132.5,
      "percentage": 66.25,
      "accuracy": 75.79,
      "timeTaken": 3420,
      "avgTimePerQuestion": 36
    },
    
    "sectionWise": [
      {
        "section": "Quantitative Aptitude",
        "totalQuestions": 25,
        "attempted": 24,
        "correct": 18,
        "incorrect": 6,
        "marks": 31,
        "accuracy": 75
      },
      {
        "section": "Reasoning",
        "totalQuestions": 25,
        "attempted": 25,
        "correct": 20,
        "incorrect": 5,
        "marks": 37.5,
        "accuracy": 80
      }
    ],
    
    "rank": {
      "yourRank": 245,
      "totalParticipants": 1523,
      "percentile": 83.91
    },
    
    "topicWiseAnalysis": [
      {
        "topic": "Percentage",
        "attempted": 5,
        "correct": 4,
        "incorrect": 1,
        "accuracy": 80
      },
      {
        "topic": "Algebra",
        "attempted": 7,
        "correct": 5,
        "incorrect": 2,
        "accuracy": 71.43
      }
    ],
    
    "timeAnalysis": {
      "fastestQuestion": 12,
      "slowestQuestion": 145,
      "averageTime": 36
    },
    
    "comparisonWithToppers": {
      "yourScore": 132.5,
      "topperScore": 189,
      "averageScore": 142.5
    }
  }
}
```

---

### **Step 8: Review Answers**

**API Endpoint:**
```
GET /api/v1/tests/attempts/64attempt123/review
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": "64attempt123",
    "questions": [
      {
        "_id": "64q001",
        "questionText": "What is 25% of 800?",
        "options": ["150", "200", "250", "300"],
        "correctAnswer": 1,
        "yourAnswer": 1,
        "isCorrect": true,
        "marks": 2,
        "marksObtained": 2,
        "timeTaken": 45,
        "explanation": "25% of 800 = (25/100) × 800 = 200",
        "difficulty": "easy",
        "topic": "Percentage"
      },
      {
        "_id": "64q002",
        "questionText": "Find the next number: 2, 6, 12, 20, ?",
        "options": ["28", "30", "32", "36"],
        "correctAnswer": 1,
        "yourAnswer": 3,
        "isCorrect": false,
        "marks": 2,
        "marksObtained": -0.5,
        "timeTaken": 30,
        "explanation": "Series pattern: n(n+1). So 5×6 = 30",
        "difficulty": "medium",
        "topic": "Number Series"
      }
      // ... all 100 questions with solutions
    ]
  }
}
```

---

## 📊 **Test Statistics & Leaderboard**

### **Get Test Leaderboard**

**API Endpoint:**
```
GET /api/v1/tests/64xyz890/leaderboard?page=1&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "64user789",
      "userName": "Amit Kumar",
      "profilePic": "https://...",
      "score": 189,
      "percentage": 94.5,
      "timeTaken": 3200,
      "attemptedAt": "2026-02-11T09:30:00.000Z"
    },
    {
      "rank": 2,
      "userId": "64user456",
      "userName": "Priya Sharma",
      "profilePic": "https://...",
      "score": 185,
      "percentage": 92.5,
      "timeTaken": 3300,
      "attemptedAt": "2026-02-11T10:15:00.000Z"
    }
    // ... top 50 users
  ],
  "yourRank": {
    "rank": 245,
    "score": 132.5,
    "percentage": 66.25
  }
}
```

---

## 🎮 **Daily Quiz Special Flow**

### **Get Today's Daily Quiz**

**API Endpoint:**
```
GET /api/v1/daily-quiz?examId=64abc123&date=2026-02-11
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64daily123",
    "date": "2026-02-11",
    "exam": {
      "_id": "64abc123",
      "name": "SSC CGL"
    },
    "questionBank": "64bank456",
    "totalQuestions": 10,
    "alreadyAttempted": false,
    "status": "available"
  }
}
```

### **Start Daily Quiz**
```
POST /api/v1/daily-quiz/64daily123/start
```

Same flow as regular test.

---

## 🏆 **Quiz Battle Flow**

### **Create Battle**

**API Endpoint:**
```
POST /api/v1/battles/create
```

**Request:**
```json
{
  "examId": "64abc123",
  "subjectId": "64sub456",
  "mode": "1v1",
  "betAmount": 10
}
```

### **Join Battle**
```
POST /api/v1/battles/64battle123/join
```

### **Battle Questions**
```
GET /api/v1/battles/64battle123/questions
```

### **Submit Battle Answer (Real-time)**
```
POST /api/v1/battles/64battle123/answer
```

### **Battle Result**
```
GET /api/v1/battles/64battle123/result
```

---

## 🔐 **Access Control**

### **Free Tests**
- Daily Quiz
- Some Topic Tests
- Limited Mock Tests

### **Paid Tests (Coins Required)**
- Premium Mock Tests
- PYQ Papers
- Full Subject Tests

### **Premium Subscription**
- Unlimited access to all tests
- No coin deduction
- Advanced analytics

---

## 📱 **App UI Screens**

### **1. Tests List Screen**
```
┌─────────────────────────────┐
│ 🏠 SSC CGL > Tests          │
├─────────────────────────────┤
│ 📊 Daily Quiz (Free)        │
│ ⏰ Available: Today          │
│ ✅ 10 Questions | 15 min    │
├─────────────────────────────┤
│ 🎯 Mock Test 1 (50 coins)   │
│ 📝 100 Questions | 60 min   │
│ ⭐ 4.5 | 1.2k attempts      │
├─────────────────────────────┤
│ 📄 PYQ 2023 (Premium)       │
│ 🔒 Unlock with subscription │
└─────────────────────────────┘
```

### **2. Test Details Screen**
```
┌─────────────────────────────┐
│ ← SSC CGL Mock Test 1       │
├─────────────────────────────┤
│ ⏱ Duration: 60 minutes      │
│ 📝 Questions: 100            │
│ 💯 Total Marks: 200          │
│ ❌ Negative: 0.25 per wrong │
│                              │
│ 📊 Sections:                │
│ • Quant (25 Q)              │
│ • Reasoning (25 Q)          │
│ • English (25 Q)            │
│ • GA (25 Q)                 │
│                              │
│ 📈 1.2k attempts             │
│ ⭐ Avg Score: 142/200        │
│                              │
│ [Start Test - 50 coins] 🎯  │
└─────────────────────────────┘
```

### **3. Test Screen (During Test)**
```
┌─────────────────────────────┐
│ ⏱ 45:30 | Q 15/100          │
├─────────────────────────────┤
│ What is 25% of 800?         │
│                              │
│ ○ 150                       │
│ ○ 200                       │
│ ○ 250                       │
│ ○ 300                       │
│                              │
│ [Clear] [Mark Review] [Next]│
│                              │
│ ◉◉◯◯◯ ▢▢▢▢▢ ... (Progress) │
└─────────────────────────────┘
```

### **4. Result Screen**
```
┌─────────────────────────────┐
│ 🎉 Test Completed!           │
├─────────────────────────────┤
│ Your Score: 132.5/200       │
│ Percentage: 66.25%          │
│ Accuracy: 75.79%            │
│ Time: 57 min                │
│                              │
│ ✅ Correct: 72               │
│ ❌ Incorrect: 23             │
│ ⊘ Skipped: 5                │
│                              │
│ 🏆 Rank: #245/1523          │
│ 📊 Percentile: 83.91        │
│                              │
│ [View Solutions] [Leaderboard]│
└─────────────────────────────┘
```

---

## 🔄 **State Management (App Side)**

### **Test Attempt States**
- `not_started` - User hasn't started yet
- `in_progress` - User is attempting
- `paused` - Test paused (if allowed)
- `submitted` - Test submitted
- `completed` - Result calculated
- `expired` - Time expired (auto-submit)

### **Local Storage**
```javascript
{
  "currentAttempt": {
    "attemptId": "64attempt123",
    "testId": "64xyz890",
    "startTime": "2026-02-11T10:30:00.000Z",
    "answers": [
      { "questionId": "64q001", "selectedAnswer": 1, "timeTaken": 45 }
    ],
    "currentQuestionIndex": 15,
    "markedForReview": [3, 7, 12]
  }
}
```

---

## ⚡ **Performance Optimizations**

### **1. Lazy Load Questions**
- Load first 20 questions initially
- Load next batch when user reaches Q15
- Reduces initial load time

### **2. Auto-save Answers**
- Save answer immediately on selection
- Debounce API calls (every 30 seconds)
- Prevent data loss on app crash

### **3. Offline Support**
- Download test questions when online
- Allow offline attempts
- Sync answers when back online

### **4. Image Optimization**
- Compress question images
- Lazy load images in questions
- Use CDN for static assets

---

## 🎯 **Key Features**

✅ **Timer Management** - Countdown with auto-submit
✅ **Mark for Review** - Flag questions for later review
✅ **Section-wise Navigation** - Jump between sections
✅ **Question Palette** - Visual progress indicator
✅ **Pause & Resume** - Save progress (if allowed by admin)
✅ **Real-time Leaderboard** - See rankings during test
✅ **Detailed Analytics** - Topic-wise, section-wise breakdown
✅ **Solution Videos** - Video explanations for difficult questions
✅ **Compare with Toppers** - See where you stand
✅ **Bookmark Questions** - Save for later practice

---

## 📈 **Analytics & Tracking**

### **Track User Behavior**
- Time spent per question
- Questions skipped/marked
- Section switching frequency
- Most difficult topics
- Improvement over time

### **Performance Metrics**
- Average score trend
- Accuracy improvement
- Speed vs accuracy balance
- Weak topics identification
- Suggested practice areas

---

This documentation covers the complete app-side flow for Mock Tests, Daily Quizzes, and Quiz Battles! 🚀
