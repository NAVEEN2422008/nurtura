# NURTURA Database Schema Reference

## Collections Overview

### 1. users
Stores user profiles for pregnant mothers, partners, and healthcare providers.

```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  password: String (hashed with bcrypt),
  name: String,
  role: "mother" | "partner" | "provider",
  language: "en" | "es" | "ta" | "hi" | "te",
  ageGroup: "18-25" | "25-35" | "35-45" | "45+",
  
  // Medical context
  medicalHistory: [String], // ["gestational_diabetes", "hypertension"]
  allergies: [String],
  currentMedications: [String],
  
  // Preferences
  notificationPreferences: {
    emailReminders: Boolean,
    smsReminders: Boolean, // Future
    pushNotifications: Boolean,
    appointmentDaysAhead: Number, // 1, 7, 14
  },
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
}
```

**Indexes:**
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ createdAt: -1 })
```

---

### 2. pregnancies
Represents a single pregnancy journey (active or completed).

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  
  // Date information
  lastMenstrualPeriod: Date,
  expectedDeliveryDate: Date,
  
  // Current state
  currentWeek: Number, // 0-42 (pregnancy weeks)
  trimester: Number, // 1, 2, 3
  babySize: String, // "Lentil", "Pea", "Papaya", "Mango", etc.
  babyWeight: Number, // grams (estimated from week)
  
  // Medical profile
  riskFactors: [String], // ["family_history_gd", "advanced_maternal_age"]
  chronicConditions: [String], // Mother's conditions
  previousPregnancies: Number, // Parity
  
  // Status & flow
  status: "planning" | "active" | "postpartum" | "completed",
  postpartumWeek: Number, // 0-12, if postpartum
  
  // Pregnancy-specific notes
  notes: String,
  
  // Tracking
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```javascript
db.pregnancies.createIndex({ userId: 1 })
db.pregnancies.createIndex({ status: 1, userId: 1 })
db.pregnancies.createIndex({ expectedDeliveryDate: 1 })
```

---

### 3. health_records
Logs vitals, labs, ultrasound results, and symptom entries.

```javascript
{
  _id: ObjectId,
  pregnancyId: ObjectId (ref: pregnancies),
  
  // Record metadata
  recordDate: Date,
  recordType: "vitals" | "lab" | "ultrasound" | "symptom_log" | "provider_note",
  dataSource: "user_entry" | "provider_upload" | "device_sync" | "ehr_import",
  
  // Vitals (if recordType === "vitals")
  vitals: {
    systolicBP: Number, // mmHg
    diastolicBP: Number,
    heartRate: Number, // bpm
    temperature: Number, // Celsius
    weight: Number, // kg
    weightGain: Number, // kg from pre-pregnancy
  },
  
  // Lab results (if recordType === "lab")
  labs: {
    glucoseFasting: Number, // mg/dL
    glucoseRandom: Number,
    hemoglobin: Number, // g/dL
    proteinUrine: Boolean,
    whiteBloodCells: Number,
    testDate: Date,
  },
  
  // Ultrasound (if recordType === "ultrasound")
  ultrasound: {
    babyHeartRate: Number,
    estimatedWeight: Number, // grams
    amniotic: String, // "normal" | "low" | "high"
    placenta: String,
    notes: String,
  },
  
  // Symptoms (if recordType === "symptom_log")
  symptoms: [String], // ["nausea", "fatigue", "swelling", "headache"]
  symptomSeverity: {
    nausea: 0-10,
    fatigue: 0-10,
    swelling: 0-10,
    // ... etc
  },
  
  // Text notes
  notes: String,
  
  // Timestamp
  createdAt: Date,
}
```

**Indexes:**
```javascript
db.health_records.createIndex({ pregnancyId: 1 })
db.health_records.createIndex({ pregnancyId: 1, recordDate: -1 })
db.health_records.createIndex({ recordType: 1 })
```

---

### 4. risk_assessments
Stores AI-generated pregnancy risk predictions.

```javascript
{
  _id: ObjectId,
  pregnancyId: ObjectId (ref: pregnancies),
  
  // Assessment details
  assessmentDate: Date,
  assessment Type: "automated" | "manual_review",
  
  // Overall risk
  riskScore: Number, // 0-100
  riskLevel: "low" | "moderate" | "high",
  
  // Detected conditions (array of concerns)
  conditions: [
    {
      name: String, // "preeclampsia", "gestational_diabetes", etc.
      probability: Number, // 0-1 (0% to 100%)
      severity: "mild" | "moderate" | "severe",
      symptoms: [String], // warning signs for this condition
      recommendation: String, // Action to take
      referralUrgency: "routine" | "urgent" | "emergency",
    }
  ],
  
  // Contributing factors
  inputFactors: {
    age: Boolean,
    bmi: Boolean,
    bloodPressure: Boolean,
    glucose: Boolean,
    symptoms: Boolean,
    medicalHistory: Boolean,
    // ... which factors contributed
  },
  
  // AI details
  modelVersion: String, // e.g., "gpt-4-20231215"
  confidenceScore: Number, // 0.5-1.0
  
  // Action taken
  recommendedAction: String, // "Schedule doctor within 48h", etc.
  escalatedToProvider: Boolean,
  
  // Audit trail
  createdBy: ObjectId (ref: users), // System or provider
  createdAt: Date,
}
```

**Indexes:**
```javascript
db.risk_assessments.createIndex({ pregnancyId: 1 })
db.risk_assessments.createIndex({ pregnancyId: 1, assessmentDate: -1 })
db.risk_assessments.createIndex({ riskLevel: 1 })
db.risk_assessments.createIndex({ "conditions.name": 1 })
```

---

### 5. conversations
Stores AI chatbot conversation history.

```javascript
{
  _id: ObjectId,
  pregnancyId: ObjectId (ref: pregnancies),
  userId: ObjectId (ref: users),
  
  // Conversation metadata
  title: String, // e.g., "Nausea in Week 18"
  startDate: Date,
  lastMessageDate: Date,
  
  // Messages array
  messages: [
    {
      _id: ObjectId,
      role: "user" | "assistant",
      content: String,
      timestamp: Date,
      
      // AI metadata (if role === "assistant")
      aiModel: String, // "gpt-4"
      confidence: Number, // 0-1
      flags: [String], // ["emergency", "medical_alert"]
      embedding: [Number], // for semantic search (1536 for GPT-4)
    }
  ],
  
  // Context snapshot (updated with each message)
  contextSnapshot: {
    pregnancyWeek: Number,
    currentWeek: Number,
    trimester: Number,
    recentSymptoms: [String],
    riskLevel: String,
    toneEmotional: "calm" | "anxious" | "sad" | "excited",
  },
  
  // Conversation summary
  summary: String, // Automatic summary (future)
  tags: [String], // ["nutrition", "mental_health", "emergency"]
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```javascript
db.conversations.createIndex({ pregnancyId: 1 })
db.conversations.createIndex({ userId: 1 })
db.conversations.createIndex({ pregnancyId: 1, lastMessageDate: -1 })
db.conversations.createIndex({ "messages.embedding": "2dsphere" }) // for semantic search
```

---

### 6. appointments
Tracks scheduled medical appointments and milestones.

```javascript
{
  _id: ObjectId,
  pregnancyId: ObjectId (ref: pregnancies),
  
  // Appointment details
  appointmentDate: Date,
  appointmentType: 
    "prenatal_checkup" | 
    "ultrasound" | 
    "lab_work" | 
    "postpartum_6week" | 
    "postpartum_42day" |
    "newborn_checkup" |
    "vaccination",
  
  // Location & provider
  location: String, // Hospital name or address
  providerName: String, // Doctor/midwife name
  notes: String, // Special instructions
  
  // Status
  status: "scheduled" | "completed" | "missed" | "rescheduled" | "cancelled",
  completionNotes: String, // Notes if completed
  
  // Reminder tracking
  reminderSent: {
    oneWeekBefore: Boolean,
    oneDayBefore: Boolean,
    dayOfAppointment: Boolean,
  },
  
  // Results (if completed)
  resultsUrl: String, // Link to provider notes or images
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date, // if status === completed
}
```

**Indexes:**
```javascript
db.appointments.createIndex({ pregnancyId: 1 })
db.appointments.createIndex({ appointmentDate: 1 })
db.appointments.createIndex({ status: 1 })
db.appointments.createIndex({ pregnancyId: 1, appointmentDate: 1 })
```

---

### 7. notifications
Stores sent and pending notifications (reminders, alerts, family updates).

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users), // Recipient
  pregnancyId: ObjectId (ref: pregnancies), // Associated pregnancy
  
  // Notification details
  type: 
    "appointment_reminder" | 
    "medication_reminder" | 
    "risk_alert" | 
    "family_update" | 
    "postpartum_milestone" |
    "mental_health_checkin",
  
  title: String,
  message: String,
  actionUrl: String, // Link to relevant page
  
  // Content
  data: {
    appointmentId: ObjectId, // if type === appointment_reminder
    riskLevel: String,
    recommendedAction: String,
    // ... context-specific data
  },
  
  // Delivery status
  status: "pending" | "sent" | "failed" | "read",
  deliveryChannels: ["in-app", "email", "sms"], // Future: SMS
  
  // Scheduling
  createdAt: Date,
  scheduledFor: Date, // When to send
  sentAt: Date, // When actually sent
  readAt: Date, // When user viewed (in-app)
}
```

**Indexes:**
```javascript
db.notifications.createIndex({ userId: 1 })
db.notifications.createIndex({ status: 1 })
db.notifications.createIndex({ createdAt: -1 })
db.notifications.createIndex({ userId: 1, readAt: 1 })
```

---

### 8. family_links
Manages partnerships and family member sharing.

```javascript
{
  _id: ObjectId,
  pregnancyId: ObjectId (ref: pregnancies),
  motherId: ObjectId (ref: users), // The pregnant mother
  familyMemberId: ObjectId (ref: users), // Partner, parent, etc.
  
  // Relationship
  relationship: "partner" | "parent" | "sibling" | "friend" | "provider",
  
  // Invitation flow
  inviteToken: String (unique), // Used in invite link
  inviteStatus: "pending" | "accepted" | "rejected" | "expired",
  invitedAt: Date,
  acceptedAt: Date,
  
  // Permissions (what family member can see)
  permissionsShared: [
    "view_dashboard",
    "view_mood_trends",
    "view_appointments",
    "view_chat_summary", // Not full chat
    "receive_alerts",
    "edit_reminders",
  ],
  
  // Settings
  notificationLevel: "updates" | "important_only" | "none",
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date, // Invite expires after 2 weeks if not accepted
}
```

**Indexes:**
```javascript
db.family_links.createIndex({ pregnancyId: 1 })
db.family_links.createIndex({ motherId: 1 })
db.family_links.createIndex({ familyMemberId: 1 })
db.family_links.createIndex({ inviteToken: 1 })
db.family_links.createIndex({ inviteStatus: 1 })
```

---

## Aggregation Examples

### Get user's current pregnancy with latest risk assessment

```javascript
db.pregnancies.aggregate([
  { $match: { userId: ObjectId("..."), status: "active" } },
  { $lookup: {
      from: "risk_assessments",
      let: { pregnancyId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$pregnancyId", "$$pregnancyId"] } } },
        { $sort: { assessmentDate: -1 } },
        { $limit: 1 }
      ],
      as: "latestRisk"
    }
  },
  { $unwind: { path: "$latestRisk", preserveNullAndEmptyArrays: true } }
])
```

### Get pregnancy timeline: appointments + health records + risks

```javascript
db.pregnancies.aggregate([
  { $match: { _id: ObjectId("...") } },
  { $lookup: { from: "appointments", localField: "_id", foreignField: "pregnancyId", as: "appointments" } },
  { $lookup: { from: "health_records", localField: "_id", foreignField: "pregnancyId", as: "healthRecords" } },
  { $lookup: { from: "risk_assessments", localField: "_id", foreignField: "pregnancyId", as: "riskAssessments" } }
])
```

---

## Data Retention Policies

| Collection | Retention | Notes |
|-----------|-----------|-------|
| users | Indefinite | Historic data for past pregnancies |
| pregnancies | Indefinite | Keep for health history |
| health_records | Indefinite | Legal & medical record |
| conversations | 1 year | Archive to cold storage after 1 year |
| risk_assessments | Indefinite | Important for trend analysis |
| appointments | 2 years after completion | Legal requirement |
| notifications | 90 days | Can archive older ones |
| family_links | Until revoked | Keep invitation history |

---

## Database Performance Tips

1. **Field Selection:** Use `.select()` to avoid fetching large text fields (notes, chat history)
2. **Query Optimization:** Index frequently queried fields (pregnancyId, userId, date ranges)
3. **Aggregation:** Use `$match` early to reduce documents before expensive operations
4. **Pagination:** Implement limit/skip for large result sets
5. **Denormalization:** Consider denormalizing `currentWeek` in conversations for faster queries
6. **TTL Indexes:** Set on notifications for automatic cleanup
   ```javascript
   db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 })
   ```
