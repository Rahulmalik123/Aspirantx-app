# Subject-Wise Test API Flow - App Side Documentation

## Complete Flow: Subject Selection → Test Start → Submit

---

## 1️⃣ Get All Subjects for an Exam

**Endpoint:** `GET /api/v1/subjects`

**Query Parameters:**
- `examId` (required): The exam ID for which you want subjects

**Request Example:**
```javascript
GET /api/v1/subjects?examId=69873c5743da003de3bc9d35
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "69873c5743da003de3bc9d36",
      "name": "English Language",
      "code": "english",
      "description": "English grammar, vocabulary, comprehension",
      "examIds": ["69873c5743da003de3bc9d35"],
      "isCommon": false,
      "totalTopics": 10,
      "totalQuestions": 10,
      "isActive": true
    },
    {
      "_id": "69873c5743da003de3bc9d37",
      "name": "Quantitative Aptitude",
      "code": "quantitative",
      "totalTopics": 8,
      "totalQuestions": 50
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

## 2️⃣ Get Topics for a Subject (Optional)

**Endpoint:** `GET /api/v1/topics`

**Query Parameters:**
- `subjectId` (required): The subject ID
- `examId` (optional): Filter by exam

**Request Example:**
```javascript
GET /api/v1/topics?subjectId=69873c5743da003de3bc9d36
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "698c19b7d8118e47aa7d74fe",
      "name": "Grammar",
      "code": "grammar",
      "subjectId": "69873c5743da003de3bc9d36",
      "subjectName": "English Language",
      "totalQuestions": 10,
      "easyQuestions": 3,
      "mediumQuestions": 5,
      "hardQuestions": 2
    },
    {
      "_id": "698c19b7d8118e47aa7d74ff",
      "name": "Vocabulary",
      "code": "vocabulary",
      "totalQuestions": 15
    }
  ]
}
```

---

## 3️⃣ Get All Subject Tests (Filter by Subject)

**Endpoint:** `GET /api/v1/tests`

**Query Parameters:**
- `examId` (optional): Filter by exam
- `type=subject_test` (required): Get only subject tests
- `subjectId` (optional): Filter by specific subject
- `isActive=true` (optional): Only active tests
- `isPaid=false` (optional): Only free tests

**Request Example:**
```javascript
GET /api/v1/tests?type=subject_test&examId=69873c5743da003de3bc9d35&isActive=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "698c48f3726ab95276e1ad60",
      "title": "English Language - Complete Test",
      "description": "All topics from English Language",
      "examId": {
        "_id": "69873c5743da003de3bc9d35",
        "name": "SSC MTS"
      },
      "type": "subject_test",
      "totalQuestions": 25,
      "duration": 30,
      "totalMarks": 100,
      "negativeMarking": true,
      "negativeMarks": 0.25,
      "isPaid": false,
      "price": 0,
      "isActive": true,
      "questionBanks": [
        {
          "bankId": "698c19b7d8118e47aa7d7500",
          "questionsCount": 15,
          "difficulty": "mixed"
        },
        {
          "bankId": "698c19b7d8118e47aa7d7501",
          "questionsCount": 10,
          "difficulty": "medium"
        }
      ],
      "sections": [
        {
          "name": "Grammar Section",
          "subjectId": "69873c5743da003de3bc9d36",
          "questions": 15,
          "duration": 15
        },
        {
          "name": "Vocabulary Section",
          "subjectId": "69873c5743da003de3bc9d36",
          "questions": 10,
          "duration": 15
        }
      ]
    }
  ]
}
```

---

## 4️⃣ Get Test Details (Before Starting)

**Endpoint:** `GET /api/v1/tests/:testId`

**Request Example:**
```javascript
GET /api/v1/tests/698c48f3726ab95276e1ad60
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "698c48f3726ab95276e1ad60",
    "title": "English Language - Complete Test",
    "type": "subject_test",
    "totalQuestions": 25,
    "duration": 30,
    "totalMarks": 100,
    "negativeMarking": true,
    "negativeMarks": 0.25,
    "instructions": [
      "Each question carries 4 marks",
      "Wrong answer deducts 0.25 marks",
      "Total time: 30 minutes"
    ],
    "sections": [
      {
        "name": "Grammar Section",
        "questions": 15,
        "duration": 15
      },
      {
        "name": "Vocabulary Section",
        "questions": 10,
        "duration": 15
      }
    ]
  }
}
```

---

## 5️⃣ Start Test (Get Questions)

**Endpoint:** `POST /api/v1/tests/start/:testId`

**Headers:**
```
Authorization: Bearer <user_token>
```

**Request Example:**
```javascript
POST /api/v1/tests/start/698c48f3726ab95276e1ad60
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": "698c48f3726ab95276e1ad62",
    "testId": "698c48f3726ab95276e1ad60",
    "userId": "698c19b7d8118e47aa7d7400",
    "startedAt": "2026-02-13T10:30:00.000Z",
    "endTime": "2026-02-13T11:00:00.000Z",
    "status": "in_progress",
    "questions": [
      {
        "_id": "698c19b7d8118e47aa7d7510",
        "questionText": "Choose the correct synonym for 'Abundant':",
        "options": [
          { "text": "Scarce", "isCorrect": false },
          { "text": "Plentiful", "isCorrect": true },
          { "text": "Limited", "isCorrect": false },
          { "text": "Rare", "isCorrect": false }
        ],
        "subject": "English Language",
        "topic": "Vocabulary",
        "difficulty": "easy",
        "marks": 4
      },
      {
        "_id": "698c19b7d8118e47aa7d7511",
        "questionText": "Identify the grammatically correct sentence:",
        "options": [
          { "text": "He don't like apples", "isCorrect": false },
          { "text": "He doesn't likes apples", "isCorrect": false },
          { "text": "He doesn't like apples", "isCorrect": true },
          { "text": "He not like apples", "isCorrect": false }
        ],
        "subject": "English Language",
        "topic": "Grammar",
        "difficulty": "medium",
        "marks": 4
      }
      // ... 23 more questions
    ]
  }
}
```

**Note:** Questions are randomly selected from the specified Question Banks with the configured difficulty level.

---

## 6️⃣ Submit Test

**Endpoint:** `POST /api/v1/tests/submit/:attemptId`

**Headers:**
```
Authorization: Bearer <user_token>
```

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "698c19b7d8118e47aa7d7510",
      "selectedOption": 1,
      "timeTaken": 45
    },
    {
      "questionId": "698c19b7d8118e47aa7d7511",
      "selectedOption": 2,
      "timeTaken": 60
    },
    {
      "questionId": "698c19b7d8118e47aa7d7512",
      "selectedOption": null,
      "timeTaken": 0
    }
  ]
}
```

**Field Descriptions:**
- `questionId` (required): Question ID
- `selectedOption` (required): Index of selected option (0-3), or `null` for skipped
- `timeTaken` (required): Time spent on question in seconds

**Response:**
```json
{
  "success": true,
  "message": "Test submitted successfully",
  "data": {
    "attemptId": "698c48f3726ab95276e1ad62",
    "testId": "698c48f3726ab95276e1ad60",
    "userId": "698c19b7d8118e47aa7d7400",
    "score": 76,
    "totalMarks": 100,
    "correctAnswers": 20,
    "wrongAnswers": 4,
    "skippedQuestions": 1,
    "timeTaken": 1650,
    "rank": 5,
    "submittedAt": "2026-02-13T10:57:30.000Z",
    "status": "completed",
    "answers": [
      {
        "questionId": "698c19b7d8118e47aa7d7510",
        "selectedOption": 1,
        "isCorrect": true,
        "marksAwarded": 4,
        "timeSpent": 45,
        "skipped": false
      },
      {
        "questionId": "698c19b7d8118e47aa7d7511",
        "selectedOption": 2,
        "isCorrect": true,
        "marksAwarded": 4,
        "timeSpent": 60,
        "skipped": false
      },
      {
        "questionId": "698c19b7d8118e47aa7d7512",
        "selectedOption": null,
        "isCorrect": false,
        "marksAwarded": 0,
        "timeSpent": 0,
        "skipped": true
      }
    ]
  }
}
```

---

## 7️⃣ Get Test Results & Analysis

**Endpoint:** `GET /api/v1/tests/results/:attemptId`

**Headers:**
```
Authorization: Bearer <user_token>
```

**Request Example:**
```javascript
GET /api/v1/tests/results/698c48f3726ab95276e1ad62
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": "698c48f3726ab95276e1ad62",
    "testDetails": {
      "title": "English Language - Complete Test",
      "type": "subject_test",
      "totalQuestions": 25,
      "totalMarks": 100
    },
    "performance": {
      "score": 76,
      "percentage": 76,
      "correctAnswers": 20,
      "wrongAnswers": 4,
      "skippedQuestions": 1,
      "accuracy": 83.33,
      "rank": 5,
      "totalAttempts": 150
    },
    "timings": {
      "totalTime": 1800,
      "timeTaken": 1650,
      "averageTimePerQuestion": 66
    },
    "sectionWise": [
      {
        "sectionName": "Grammar Section",
        "totalQuestions": 15,
        "correct": 12,
        "wrong": 2,
        "skipped": 1,
        "score": 47.5,
        "accuracy": 85.71
      },
      {
        "sectionName": "Vocabulary Section",
        "totalQuestions": 10,
        "correct": 8,
        "wrong": 2,
        "skipped": 0,
        "score": 28.5,
        "accuracy": 80
      }
    ],
    "topicWise": [
      {
        "topicName": "Grammar",
        "correct": 12,
        "wrong": 2,
        "accuracy": 85.71
      },
      {
        "topicName": "Vocabulary",
        "correct": 8,
        "wrong": 2,
        "accuracy": 80
      }
    ],
    "difficultyWise": {
      "easy": { "correct": 8, "wrong": 0, "accuracy": 100 },
      "medium": { "correct": 10, "wrong": 3, "accuracy": 76.92 },
      "hard": { "correct": 2, "wrong": 1, "accuracy": 66.67 }
    }
  }
}
```

---

## 8️⃣ Get User's Test History

**Endpoint:** `GET /api/v1/tests/my-attempts`

**Headers:**
```
Authorization: Bearer <user_token>
```

**Query Parameters:**
- `testId` (optional): Filter by specific test
- `type=subject_test` (optional): Only subject tests
- `status=completed` (optional): completed/in_progress/abandoned
- `page=1` (optional)
- `limit=10` (optional)

**Request Example:**
```javascript
GET /api/v1/tests/my-attempts?type=subject_test&status=completed&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "attemptId": "698c48f3726ab95276e1ad62",
      "testId": "698c48f3726ab95276e1ad60",
      "testTitle": "English Language - Complete Test",
      "testType": "subject_test",
      "score": 76,
      "totalMarks": 100,
      "percentage": 76,
      "rank": 5,
      "totalAttempts": 150,
      "submittedAt": "2026-02-13T10:57:30.000Z",
      "status": "completed"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

## 📱 App Integration Flow

### Step-by-Step Implementation:

#### 1. **Subject Selection Screen**
```javascript
// Fetch subjects for selected exam
const subjects = await fetch(`/api/v1/subjects?examId=${examId}`);

// Show subject list with total questions
subjects.data.forEach(subject => {
  console.log(subject.name, subject.totalQuestions);
});
```

#### 2. **Topic Selection (Optional)**
```javascript
// After subject selected, fetch topics
const topics = await fetch(`/api/v1/topics?subjectId=${subjectId}`);

// Show topics to user for filtering
```

#### 3. **Test List Screen**
```javascript
// Get all subject tests for this exam
const tests = await fetch(`/api/v1/tests?type=subject_test&examId=${examId}`);

// Filter by subject if needed
const subjectTests = tests.data.filter(test => 
  test.sections?.some(section => section.subjectId === selectedSubjectId)
);
```

#### 4. **Test Details Screen**
```javascript
// Show test details before starting
const testDetails = await fetch(`/api/v1/tests/${testId}`);

// Display: title, questions, duration, marks, sections
```

#### 5. **Start Test**
```javascript
// Start test and get questions
const attempt = await fetch(`/api/v1/tests/start/${testId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

// Store attemptId and questions locally
localStorage.setItem('attemptId', attempt.data.attemptId);
localStorage.setItem('questions', JSON.stringify(attempt.data.questions));
```

#### 6. **During Test**
```javascript
// Track user's answers
const userAnswers = [];
userAnswers.push({
  questionId: question._id,
  selectedOption: selectedIndex, // 0, 1, 2, 3 or null
  timeTaken: timeSpent
});
```

#### 7. **Submit Test**
```javascript
// Submit when time ends or user clicks submit
const result = await fetch(`/api/v1/tests/submit/${attemptId}`, {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ answers: userAnswers })
});

// Navigate to results screen
navigateToResults(result.data);
```

#### 8. **Results Screen**
```javascript
// Fetch detailed results
const results = await fetch(`/api/v1/tests/results/${attemptId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Show: score, rank, section-wise analysis, topic-wise performance
```

---

## 🔑 Key Points for App Development

1. **Authentication Required:**
   - All test operations require `Authorization: Bearer <token>` header
   - Login/Register first to get user token

2. **Subject Tests vs Regular Tests:**
   - Filter by `type=subject_test` to show only subject-wise tests
   - Check `sections` array to identify which subjects are covered

3. **Question Banks:**
   - Tests use Question Banks to generate questions
   - Questions are randomly selected based on difficulty and count
   - Same test can have different questions each time

4. **Time Tracking:**
   - Track `timeTaken` per question in seconds
   - Server validates submission time against test duration

5. **Answer Format:**
   - `selectedOption` should be index (0-3) or `null` for skipped
   - All questions must be included in submission (even skipped ones)

6. **Scoring:**
   - Correct answer: +4 marks (or as configured)
   - Wrong answer: -0.25 marks (if negative marking enabled)
   - Skipped: 0 marks

7. **Error Handling:**
   - Test already completed: Cannot restart
   - Time expired: Auto-submit
   - Network issues: Save answers locally, retry submission

---

## 🚨 Common Errors

### 1. Test Not Found
```json
{
  "success": false,
  "message": "Test not found"
}
```
**Solution:** Verify testId is correct and test is active.

### 2. Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```
**Solution:** Include valid Bearer token in Authorization header.

### 3. Test Already Started
```json
{
  "success": false,
  "message": "Test already in progress"
}
```
**Solution:** Cannot start same test twice. Resume existing attempt.

### 4. Invalid Answers Format
```json
{
  "success": false,
  "message": "Invalid answer format"
}
```
**Solution:** Ensure all answers have questionId, selectedOption, timeTaken.

---

## 📊 Example Complete Flow

```javascript
// 1. Get subjects
const subjects = await api.get('/subjects?examId=xyz');

// 2. Get subject tests
const tests = await api.get('/tests?type=subject_test&examId=xyz');

// 3. User selects a test, get details
const testDetails = await api.get('/tests/abc123');

// 4. Start test
const attempt = await api.post('/tests/start/abc123');
const { attemptId, questions } = attempt.data;

// 5. User answers questions
const answers = questions.map(q => ({
  questionId: q._id,
  selectedOption: getUserAnswer(q),
  timeTaken: getTimeTaken(q)
}));

// 6. Submit test
const result = await api.post(`/tests/submit/${attemptId}`, { answers });

// 7. Show results
console.log('Score:', result.data.score);
console.log('Rank:', result.data.rank);
```

---

## 📝 Notes

- Subject tests can have multiple sections
- Each section can focus on different topics within the subject
- Questions are dynamically selected from Question Banks
- Results include detailed topic-wise and difficulty-wise analysis
- Rank is calculated among all users who attempted the same test

