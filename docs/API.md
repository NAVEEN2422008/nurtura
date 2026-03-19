# NURTURA API Reference

## Base URL

```
http://localhost:3001/api (local development)
https://api.nurtura.app (production)
```

## Authentication

All requests (except `/auth/signup` and `/auth/login`) require:

```bash
Authorization: Bearer <JWT_TOKEN>
```

Response format (all endpoints):

```json
{
  "success": true | false,
  "data": { /* response payload */ } | null,
  "error": "Error message" | null,
  "statusCode": 200,
  "timestamp": "2026-03-10T10:30:00Z"
}
```

---

## 🔐 Auth Endpoints

### POST /api/auth/signup

Create a new user account.

**Request:**
```json
{
  "email": "mother@example.com",
  "password": "securePassword123",
  "name": "Sarah",
  "role": "mother",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "670a1234567890abcdef1234",
    "email": "mother@example.com",
    "name": "Sarah",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

**Status Codes:** `201 Created`, `400 Bad Request`, `409 Conflict` (email exists)

---

### POST /api/auth/login

Authenticate and get JWT token.

**Request:**
```json
{
  "email": "mother@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "670a1234567890abcdef1234",
    "email": "mother@example.com",
    "name": "Sarah",
    "role": "mother",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

**Status Codes:** `200 OK`, `400 Bad Request`, `401 Unauthorized`

---

### GET /api/auth/me

Get current user profile (requires auth).

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "670a1234567890abcdef1234",
    "email": "mother@example.com",
    "name": "Sarah",
    "role": "mother",
    "language": "en",
    "ageGroup": "25-35",
    "medicalHistory": ["gestational_diabetes"],
    "createdAt": "2026-03-01T00:00:00Z"
  }
}
```

---

## 🤰 Pregnancy Endpoints

### POST /api/pregnancies

Create a new pregnancy record.

**Request:**
```json
{
  "lastMenstrualPeriod": "2025-12-15",
  "expectedDeliveryDate": "2026-09-21",
  "riskFactors": ["family_history_gd"],
  "chronicConditions": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pregnancyId": "670a2345567890abcdef1235",
    "currentWeek": 22,
    "trimester": 2,
    "babySize": "Papaya",
    "expectedDeliveryDate": "2026-09-21",
    "status": "active",
    "createdAt": "2026-03-10T10:00:00Z"
  }
}
```

---

### GET /api/pregnancies/:id

Fetch pregnancy details with all related data.

**Query Parameters:**
```
?include=health_records,risk_assessments,appointments
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pregnancyId": "670a2345567890abcdef1235",
    "userId": "670a1234567890abcdef1234",
    "currentWeek": 22,
    "trimester": 2,
    "babySize": "Papaya",
    "status": "active",
    "riskFactors": ["family_history_gd"],
    "latestHealthRecord": {
      "recordDate": "2026-03-10",
      "vitals": { "systolicBP": 115, "diastolicBP": 75 }
    },
    "latestRiskAssessment": {
      "riskScore": 35,
      "riskLevel": "low"
    },
    "nextAppointment": {
      "appointmentDate": "2026-03-17",
      "appointmentType": "prenatal_checkup"
    }
  }
}
```

---

### PATCH /api/pregnancies/:id

Update pregnancy details (EDD, risk factors, notes).

**Request:**
```json
{
  "expectedDeliveryDate": "2026-09-22",
  "riskFactors": ["family_history_gd", "advanced_maternal_age"],
  "notes": "Feeling well, minor nausea"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated pregnancy object */ }
}
```

---

## 💬 Chat / Chatbot Endpoints

### POST /api/chat

Send message to AI pregnancy assistant.

**Request:**
```json
{
  "pregnancyId": "670a2345567890abcdef1235",
  "message": "Is it normal to have nausea at week 22?",
  "includeContext": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "670a3456567890abcdef1236",
    "response": "Nausea can persist into the second and even third trimester for some mothers. While it's less common at week 22, every pregnancy is different. If the nausea is severe or you're unable to keep food down, it's worth mentioning at your next checkup.",
    "confidence": 0.95,
    "recommendations": [
      {
        "type": "informational",
        "text": "Try eating small, frequent meals"
      }
    ],
    "flags": [],
    "aiModel": "gpt-4",
    "timestamp": "2026-03-10T10:30:00Z"
  }
}
```

**Emergency Flags:**
If message contains severe symptoms, response includes:
```json
{
  "flags": ["EMERGENCY", "SEVERE_BLEEDING"],
  "urgentRecommendation": "Please contact emergency services or your doctor immediately"
}
```

---

### GET /api/chat/history/:pregnancyId

Fetch conversation history for a pregnancy.

**Query Parameters:**
```
?limit=50&offset=0&search=nausea
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "670a2345567890abcdef1235",
    "messageCount": 28,
    "messages": [
      {
        "role": "user",
        "content": "Is it normal to have nausea at week 22?",
        "timestamp": "2026-03-10T10:30:00Z"
      },
      {
        "role": "assistant",
        "content": "Nausea can persist...",
        "confidence": 0.95,
        "timestamp": "2026-03-10T10:30:15Z"
      }
    ],
    "contextSnapshot": {
      "pregnancyWeek": 22,
      "trimester": 2,
      "recentSymptoms": ["nausea", "fatigue"]
    }
  }
}
```

---

## 🏥 Health Record Endpoints

### POST /api/health/vitals

Log vital signs.

**Request:**
```json
{
  "pregnancyId": "670a2345567890abcdef1235",
  "systolicBP": 120,
  "diastolicBP": 80,
  "weight": 70,
  "heartRate": 80,
  "notes": "Feeling good"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recordId": "670a4567567890abcdef1237",
    "recordType": "vitals",
    "recordDate": "2026-03-10",
    "vitals": {
      "systolicBP": 120,
      "diastolicBP": 80,
      "weight": 70,
      "heartRate": 80
    }
  }
}
```

---

### GET /api/health/:pregnancyId

Get all health records for a pregnancy (sorted by date).

**Query Parameters:**
```
?recordType=vitals&limit=20&days=30
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pregnancyId": "670a2345567890abcdef1235",
    "recordCount": 15,
    "records": [
      {
        "recordId": "670a4567567890abcdef1237",
        "recordType": "vitals",
        "recordDate": "2026-03-10",
        "vitals": {
          "systolicBP": 120,
          "diastolicBP": 80,
          "weight": 70
        }
      }
    ],
    "summary": {
      "latestBP": "120/80",
      "weightGain": "2.5kg",
      "trendAnalysis": "Stable, within normal ranges"
    }
  }
}
```

---

### POST /api/health/risk-assessment

Manually trigger risk assessment based on current health data.

**Request:**
```json
{
  "pregnancyId": "670a2345567890abcdef1235",
  "includeLatestData": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assessmentId": "670a5678567890abcdef1238",
    "assessmentDate": "2026-03-10",
    "riskScore": 35,
    "riskLevel": "low",
    "conditions": [
      {
        "name": "preeclampsia",
        "probability": 0.08,
        "severity": "mild",
        "recommendation": "Continue routine monitoring"
      }
    ],
    "recommendedAction": "No immediate action needed. Routine prenatal care continues.",
    "escalatedToProvider": false
  }
}
```

---

## 📅 Appointment Endpoints

### GET /api/appointments/:pregnancyId

List all appointments for a pregnancy.

**Query Parameters:**
```
?status=scheduled&includeCompleted=false&days=180
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pregnancyId": "670a2345567890abcdef1235",
    "appointmentCount": 8,
    "appointments": [
      {
        "appointmentId": "670a6789567890abcdef1239",
        "appointmentDate": "2026-03-17T10:00:00Z",
        "appointmentType": "prenatal_checkup",
        "location": "City Hospital, OB-GYN Ward",
        "providerName": "Dr. Patel",
        "status": "scheduled",
        "reminderSent": {
          "oneDayBefore": false
        }
      }
    ],
    "nextAppointment": {
      "appointmentId": "670a6789567890abcdef1239",
      "daysUntil": 7
    }
  }
}
```

---

### POST /api/appointments

Create a new appointment.

**Request:**
```json
{
  "pregnancyId": "670a2345567890abcdef1235",
  "appointmentDate": "2026-03-17T10:30:00Z",
  "appointmentType": "prenatal_checkup",
  "location": "City Hospital, OB-GYN Ward",
  "providerName": "Dr. Patel",
  "notes": "Routine 6-month checkup"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appointmentId": "670a6789567890abcdef1239",
    "appointmentDate": "2026-03-17T10:30:00Z",
    "status": "scheduled",
    "createdAt": "2026-03-10T12:00:00Z"
  }
}
```

---

### PATCH /api/appointments/:id

Update appointment status or reschedule.

**Request:**
```json
{
  "status": "completed",
  "completionNotes": "Routine checkup. BP normal, no concerns.",
  "resultsUrl": "https://example.com/results/123"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated appointment object */ }
}
```

---

## 👨‍👩‍👧 Family Support Endpoints

### POST /api/family/invite

Invite a family member (partner, parent, etc.) to view pregnancy updates.

**Request:**
```json
{
  "pregnancyId": "670a2345567890abcdef1235",
  "familyMemberEmail": "partner@example.com",
  "relationship": "partner",
  "permissionsShared": ["view_dashboard", "view_appointments", "receive_alerts"],
  "notificationLevel": "updates"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inviteId": "670a7890567890abcdef123a",
    "inviteToken": "abc123def456ghi789jkl012",
    "inviteLink": "https://nurtura.app/join/abc123def456ghi789jkl012",
    "inviteStatus": "pending",
    "expiresIn": 604800
  }
}
```

---

### POST /api/family/:id/accept

Accept a family invite (family member's action).

**Request:**
```json
{
  "inviteToken": "abc123def456ghi789jkl012",
  "userId": "670a7890567890abcdef123b"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inviteId": "670a7890567890abcdef123a",
    "inviteStatus": "accepted",
    "acceptedAt": "2026-03-10T13:00:00Z"
  }
}
```

---

### GET /api/family/:id/shared-view

Get shared pregnancy view for family member.

**Response (family member sees limited data):**
```json
{
  "success": true,
  "data": {
    "pregnancyId": "670a2345567890abcdef1235",
    "currentWeek": 22,
    "babySize": "Papaya",
    "nextAppointment": {
      "appointmentDate": "2026-03-17",
      "appointmentType": "prenatal_checkup"
    },
    "sharedMetrics": {
      "moodTrend": "stable",
      "recentUpdates": [/* limited summaries */]
    },
    "permissionsGranted": ["view_dashboard", "view_appointments"]
  }
}
```

---

## 🌍 Localization Endpoints

### GET /api/localization/:lang/glossary

Get medical term glossary in specified language.

**Supported Languages:** `en`, `es`, `ta`, `hi`, `te`

**Response:**
```json
{
  "success": true,
  "data": {
    "language": "en",
    "terms": [
      {
        "medicalTerm": "Gestational Diabetes Mellitus (GDM)",
        "simplifiedExplanation": "A type of diabetes that develops during pregnancy. Your body has trouble controlling blood sugar levels.",
        "symptoms": ["excessive thirst", "frequent urination"],
        "whenToContact": "If you notice excessive thirst or unusually frequent urination"
      }
    ]
  }
}
```

---

## 🔔 Notification Endpoints

### GET /api/notifications/:userId

Get user's notifications.

**Query Parameters:**
```
?status=pending&type=appointment_reminder&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "notificationId": "670a8901567890abcdef123c",
        "type": "appointment_reminder",
        "title": "Appointment Reminder",
        "message": "Your prenatal checkup is in 1 day at City Hospital",
        "actionUrl": "/appointments/670a6789567890abcdef1239",
        "status": "sent",
        "createdAt": "2026-03-16T09:00:00Z"
      }
    ],
    "unreadCount": 3
  }
}
```

---

### PATCH /api/notifications/:id

Mark notification as read.

**Request:**
```json
{
  "status": "read"
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `409` | Conflict (e.g., email already exists) |
| `500` | Internal Server Error |
| `503` | Service Unavailable (external API down) |

**Error Response:**
```json
{
  "success": false,
  "error": "Pregnancy not found",
  "statusCode": 404,
  "timestamp": "2026-03-10T10:30:00Z"
}
```

---

## Rate Limiting

- Auth endpoints: 5 requests per minute per IP
- Chat endpoint: 20 requests per minute per user
- Other endpoints: 100 requests per minute per user

Response header: `X-RateLimit-Remaining: 95`

---

## Webhook Events (Future)

Planned webhooks for provider integration:

```
POST /webhooks/pregnancy-risk-alert
POST /webhooks/appointment-completed
POST /webhooks/conversation-flagged
```
