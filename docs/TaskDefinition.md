
# Every Health — Tech Challenge

Estimated time: 6–8 hours

---

## 🧠 Context

Every Health is building a digital clinic for LGBTQ+ healthcare, starting with STI prevention and treatment services. Because we work with sensitive data around health, medication, and identity, we care about security, scalability, and thoughtful engineering.

This challenge simulates an internal tool to help monitor anonymized health logs and prepares us for future features like audit trails and role-based access.

---

## 🎯 Your Task

You will build a small backend application that:

1. Accepts uploaded logs (JSON format).
2. Stores them in memory or a local database (SQLite is fine).
3. Exposes an API to:
    - List logs
    - Filter by severity and timestamp
    - Return basic stats (e.g. counts per severity level)
4. Handles data validation and prevents exposure of sensitive fields like `patient_id`.

---

## 📁 Example Log Format

```json
json
CopyEdit
{
  "timestamp": "2025-03-01T14:25:43Z",
  "source": "medication-service",
  "severity": "error",
  "message": "User XYZ failed medication eligibility check",
  "patient_id": "abc123"
}

```

---

## 📦 What to Build

A small Node.js application in **TypeScript**, using any backend framework (e.g. Express, Fastify). It should provide:

- `GET /logs` — return all logs
- `GET /logs?severity=error&after=...` — filter logs
- `GET /stats` — return count of logs per severity
- **Bonus:** Anonymize or remove sensitive fields like `patient_id` before storing

---

## 📄 Design Reflection Document (1–2 pages)

Please include a short Markdown or PDF file where you:

1. Explain your design choices and trade-offs
2. Describe how this system would change in a production setting (privacy, scaling, monitoring)
3. Outline how you'd deploy this on AWS
4. Sketch how you'd expand the system with user auth, RBAC, and audit logs

---

## 🧪 Requirements

- TypeScript with Node.js (no plain JavaScript)
- SQLite or in-memory data store
- REST API with basic error handling
- `README.md` with setup instructions

---

## ⏱️ Timebox

This should take **no more than 6–8 hours** total. If you’re running out of time:

- You can skip one of the API endpoints
- You can submit partial functionality with notes in your README

---

## 💬 What Happens Next

If selected for the next round, we’ll schedule a **technical interview (60–90 minutes)**. In that session, we’ll:

- Walk through your solution together
- Ask deeper questions about your design decisions
- Explore different scenarios
