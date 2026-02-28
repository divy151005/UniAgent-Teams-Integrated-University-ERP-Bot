# UniAgent ERP System
### Agent-Based University Administration with Microsoft Teams Integration

A full-stack system with a **Java Spring Boot** backend and **React** frontend, implementing an NLP pipeline for automated announcement routing, event management, and query handling across university channels.

---

## Architecture

```
React Frontend (Vite, port 5173)
    ↕ REST API calls
Java Spring Boot Backend (port 8080)
    ├── NLP Pipeline Engine (rule-based + regex NER)
    ├── Knowledge Graph Resolver
    ├── Policy Engine
    ├── ERP Event Sync
    └── H2 In-Memory Database (swap → PostgreSQL)
```

---

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+

### 1. Start Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
# → Starts on http://localhost:8080
# → H2 Console: http://localhost:8080/h2-console
# → Database auto-seeded with sample data
```

### 2. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# → Opens http://localhost:5173
```

---

## REST API Endpoints

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages` | Ingest & process message through NLP pipeline |
| GET  | `/api/messages` | List all messages (filter: ?status=PENDING, ?intent=query) |
| GET  | `/api/messages/:id` | Get single message |
| POST | `/api/messages/:id/approve` | Admin approves pending message |
| POST | `/api/messages/:id/reject` | Admin rejects message |
| GET  | `/api/messages/stats` | Message count stats |

### NLP
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/nlp/analyze` | Run pipeline analysis (no persistence) |

### Knowledge Graph
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/knowledge-graph` | Full hierarchy (schools→channels) |
| GET | `/api/knowledge-graph/schools` | All schools |
| GET | `/api/knowledge-graph/departments?schoolId=1` | Departments |
| GET | `/api/knowledge-graph/programs?deptId=1` | Programs |

### Channels, Events, Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/channels` | All active Teams channels |
| GET | `/api/events` | ERP events (filter: ?dept=CSE, ?type=exam) |
| GET | `/api/logs?limit=50` | System logs |
| GET | `/api/dashboard` | Full dashboard stats |

---

## NLP Pipeline Flow

```
[Teams Message]
      │
      ▼
1. INGEST     — Receive raw text + sender
      │
      ▼
2. CLASSIFY   — Intent: announcement | query | task
               (confidence score)
      │
      ▼
3. EXTRACT    — NER: dept, year, date, event_type, audience, location
      │
      ▼
4. RESOLVE KG — Map entities → target channel IDs
               ("3rd year CSE" → CH003)
      │
      ▼
5. POLICY     — Route/Escalate/ERP-sync decision
      │
      ▼
6. GENERATE   — Response text
      │
      ▼
7. DELIVER    — Post to Teams channels + log
```

---

## Database Schema

```sql
School(id, name, code)
Department(id, name, code, school_id)
Program(id, name, duration_years, department_id)
TeamsChannel(channel_id, channel_name, year, section, member_count, program_id, active)
Message(id, raw_text, from_user, intent, intent_confidence, entities_json,
        target_channels_json, status, erp_synced, erp_event_id, created_at, processed_at)
ErpEvent(event_id, title, event_type, event_date, department, status,
         source_message_id, created_at)
SystemLog(id, timestamp, source, event, level, message_id)
```

---

## Production Deployment (Azure)

Switch H2 → PostgreSQL in `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://your-host:5432/erpdb
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

Add PostgreSQL driver to `pom.xml`:
```xml
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <scope>runtime</scope>
</dependency>
```

---

## Project Structure

```
university-erp/
├── backend/                          # Spring Boot 3.2
│   ├── pom.xml
│   └── src/main/java/com/university/erp/
│       ├── ErpAgentApplication.java  # Entry point
│       ├── model/                    # JPA entities
│       │   ├── School.java
│       │   ├── Department.java
│       │   ├── Program.java
│       │   ├── TeamsChannel.java
│       │   ├── Message.java
│       │   ├── ErpEvent.java
│       │   └── SystemLog.java
│       ├── repository/               # Spring Data JPA
│       ├── nlp/
│       │   └── NlpPipelineEngine.java  # Intent + NER
│       ├── service/
│       │   ├── MessageService.java     # Orchestrator pipeline
│       │   ├── KnowledgeGraphService.java
│       │   └── DashboardService.java
│       ├── controller/               # REST API
│       │   ├── MessageController.java
│       │   ├── NlpController.java
│       │   └── Controllers.java      # KG, Channels, Events, Logs, Dashboard
│       ├── dto/
│       │   └── MessageRequest.java
│       └── config/
│           ├── WebConfig.java        # CORS
│           └── DataSeeder.java       # Sample data
│
└── frontend/                         # React 18 + Vite
    ├── src/
    │   ├── App.jsx                   # Router
    │   ├── services/api.js           # Axios API layer
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── Topbar.jsx
    │   │   ├── Toast.jsx
    │   │   └── UI.jsx                # Shared components
    │   └── pages/
    │       ├── Dashboard.jsx         # Stats + charts
    │       ├── Pipeline.jsx          # Live NLP analyzer
    │       ├── Messages.jsx          # Queue + approval
    │       ├── KnowledgeGraph.jsx    # Tree explorer
    │       ├── Channels.jsx          # Teams channels
    │       ├── Events.jsx            # ERP events
    │       └── Logs.jsx              # System logs
    └── package.json
```
