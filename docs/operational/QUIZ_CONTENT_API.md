# Quiz Content Type API Documentation

## Overview
The API now supports a new **Quiz** content type with quiz-specific fields for the mobile AR app.

## Database Schema Updates
New fields added to `ContentItem` model:
- `quiz_length` (Integer): Duration of quiz in minutes
- `quiz_badges` (CharField): Whether quiz awards badges ('yes' or 'no')
- `quiz_number` (Integer): Quiz sequence number

## Content Type Options
```
- text (Text content)
- image (Image content)
- video (Video content)
- document (Document/PDF)
- quiz (NEW: Quiz content with quiz-specific metadata)
```

## API Endpoints

### 1. Create Quiz Content
**Endpoint:** `POST /api/content/items/`

**Request Body:**
```json
{
  "title": "Beginner Geography Quiz",
  "body": "<p>Test your geography knowledge...</p>",
  "status": "for_approval",
  "content_type": "quiz",
  "photo_caption": "Geography Quiz Image",
  "file": "(optional PDF or image)",
  "quiz_length": 30,
  "quiz_badges": "yes",
  "quiz_number": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Content created successfully",
  "data": {
    "id": 123,
    "title": "Beginner Geography Quiz"
  }
}
```

### 2. Retrieve All Published Quiz Content
**Endpoint:** `GET /api/content/items/?status=published&content_type=quiz`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Beginner Geography Quiz",
    "body": "<p>Test your geography knowledge...</p>",
    "status": "published",
    "content_type": "quiz",
    "photo_caption": "Geography Quiz Image",
    "file_url": "https://api.example.com/media/content_files/2026/02/quiz_file.pdf",
    "quiz_length": 30,
    "quiz_badges": "yes",
    "quiz_number": 1,
    "created_by": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com"
    },
    "created_at": "2026-02-10T12:00:00Z",
    "published_at": "2026-02-10T13:00:00Z"
  }
]
```

### 3. Retrieve Specific Quiz Content by ID
**Endpoint:** `GET /api/content/items/{id}/`

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Beginner Geography Quiz",
  "body": "<p>Test your geography knowledge...</p>",
  "status": "published",
  "content_type": "quiz",
  "photo_caption": "Geography Quiz Image",
  "file_url": "https://api.example.com/media/content_files/2026/02/quiz_file.pdf",
  "quiz_length": 30,
  "quiz_badges": "yes",
  "quiz_number": 1,
  "created_by": { ... },
  "created_at": "2026-02-10T12:00:00Z",
  "published_at": "2026-02-10T13:00:00Z"
}
```

### 4. Update Quiz Content
**Endpoint:** `PATCH /api/content/items/{id}/`

**Request Body:**
```json
{
  "title": "Updated Quiz Title",
  "quiz_length": 45,
  "quiz_badges": "yes",
  "quiz_number": 2
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Updated Quiz Title",
  "quiz_length": 45,
  "quiz_number": 2,
  ...
}
```

### 5. Get Quiz Content for Mobile AR Tour App
**Endpoint:** `GET /api/content/game/content/?content_type=quiz`

**Response (200 OK):**
Returns all published quiz content with relative file paths automatically converted to absolute URLs for mobile app consumption.

```json
[
  {
    "id": 1,
    "title": "AR Geography Quiz",
    "content_type": "quiz",
    "quiz_length": 30,
    "quiz_badges": "yes",
    "quiz_number": 1,
    "status": "published",
    "file_url": "https://100.93.255.84:8000/media/content_files/2026/02/quiz.pdf",
    "created_at": "2026-02-10T12:00:00Z",
    "published_at": "2026-02-10T13:00:00Z"
  }
]
```

## Quiz-Specific Field Details

### quiz_length (Integer, minutes)
- **Type:** Positive integer
- **Required:** Yes (when content_type='quiz')
- **Example:** 30 (for a 30-minute quiz)
- **Use Case:** Mobile app can display estimated time to complete quiz

### quiz_badges (Choice: 'yes' | 'no')
- **Type:** String choice field
- **Choices:** 'yes' or 'no'
- **Default:** 'no'
- **Example:** 'yes'
- **Use Case:** Indicates if completion of quiz grants badges to users

### quiz_number (Integer, sequence)
- **Type:** Positive integer
- **Required:** Yes (when content_type='quiz')
- **Example:** 1, 2, 3...
- **Use Case:** Determines quiz order/sequence in the app

## Frontend Form Behavior

When users select **"Quiz"** from the Content Type dropdown:
1. Title field remains visible (required)
2. Description field remains visible (optional rich text)
3. Image/PDF upload fields remain visible (optional)
4. Photo Caption field remains visible (optional)
5. **New Quiz-specific fields appear:**
   - Quiz Length (number input, required for quiz type)
   - Quiz Badges (yes/no dropdown, required for quiz type)
   - Quiz Number (number input, required for quiz type)

When users select other content types (Text, Image, Video, Document):
- Quiz-specific fields are hidden

## Authentication
- **Public endpoints** (GET published content): No authentication required
- **Create/Update/Delete endpoints**: Requires authentication with appropriate role
  - **Encoder/Editor role:** Can create draft quizzes
  - **Approver role:** Can approve quizzes for publishing
  - **Admin role:** Can manage all quiz content

## Error Responses

### 400 Bad Request
Missing required fields for quiz content type:
```json
{
  "quiz_length": ["This field is required."],
  "quiz_number": ["This field is required."],
  "quiz_badges": ["This field is required."]
}
```

### 403 Forbidden
User lacks permission to create/edit quiz content:
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
Quiz content not found:
```json
{
  "detail": "Not found."
}
```

## Mobile App Integration Example

```javascript
// Fetch all published quizzes
const fetchQuizzes = async () => {
  const response = await fetch('http://localhost:8000/api/content/game/content/', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  const quizzes = await response.json();
  
  // Filter for quiz type
  const quizContent = quizzes.filter(item => item.content_type === 'quiz');
  
  // Sort by quiz_number
  quizContent.sort((a, b) => a.quiz_number - b.quiz_number);
  
  return quizContent;
};

// Example usage
const quizzes = await fetchQuizzes();
quizzes.forEach(quiz => {
  console.log(`Quiz #${quiz.quiz_number}: ${quiz.title} (${quiz.quiz_length} minutes)`);
  if (quiz.quiz_badges === 'yes') {
    console.log('✓ Badges available for completion');
  }
});
```

## Database Queries

### Get all quizzes by sequence number
```sql
SELECT id, title, quiz_number, quiz_length, quiz_badges 
FROM contentmanagement_contentitem 
WHERE content_type='quiz' AND status='published' 
ORDER BY quiz_number ASC;
```

### Count total quizzes
```sql
SELECT COUNT(*) as total_quizzes 
FROM contentmanagement_contentitem 
WHERE content_type='quiz' AND status='published';
```

### Get quiz with most questions (longest duration)
```sql
SELECT * FROM contentmanagement_contentitem 
WHERE content_type='quiz' AND status='published' 
ORDER BY quiz_length DESC LIMIT 1;
```
