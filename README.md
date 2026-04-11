# UniAgent NLP-Pipeline - University ERP System
[![Maven](https://img.shields.io/badge/Maven-3.8%2B-brightorange)](https://maven.apache.org/)
[![Node.js](https://img.shields.io/badge/Node-18%2B-brightgreen)](https://nodejs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-blue.svg)](https://spring.io/projects/spring-boot)
[![MongoDB](https://img.shields.io/badge/MongoDB-Embedded-brightgreen)](https://mongodb.com)

**Agent-Based University Administration Platform with Telegram Integration & Advanced NLP Pipeline**

Full-stack ERP system featuring **Java Spring Boot** backend, **React/Vite** frontend, **MongoDB** database, and a sophisticated **NLP Pipeline** for automated message processing, event management, knowledge graph resolution, Telegram bot delivery, **receipt management**, and **decision engine**.

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- MongoDB (embedded, auto-starts)

### One-Command Full Stack
```bash
# Ensure in project root
chmod +x start*.sh
./start-all.sh
```
**Or manual** (if scripts fail):
```bash
./start.sh  # Backend + MongoDB
# In new terminal:
cd frontend && npm install && npm run dev
```
Starts MongoDB (27017), backend (8080), frontend (5173). Logs: `./data/mongod.log`.
The startup script now detects stale UniAgent listeners on ports `8080` and `5173` and restarts them automatically, which prevents the common \"frontend opens but backend is unreachable\" issue.

### Manual Start (Reliable Fallback)
1. **Backend + MongoDB** (from root):
   ```bash
   ./start.sh
   ```
   - Port: 8080
   - DB: localhost:27017/university_erp
   - Auto-seeded via DataSeeder

2. **Frontend only**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open [http://127.0.0.1:5173](http://127.0.0.1:5173)

## 🏗️ Architecture

```
Telegram Bot ←→ Messages → REST API (Spring Boot :8080)
                           │
                    MongoDB (./data/)
                           │
                NLP Pipeline Engine
                (Intent Classification + NER + KG Resolution)
                           │
React Frontend (:5173) ← Dashboard / Pages / Real-time
```

**Core Components**:
- **NLP Engine**: Rule-based intent detection + Regex NER for university entities (depts, programs, events, dates)
- **Knowledge Graph**: School → Department → Program → Telegram Channel hierarchy
- **Telegram Bot**: Receives/processes/announces via BotController (see TELEGRAM_SETUP.md)
- **Event Sync**: ERP events from messages → persistent tracking
- **Decision Engine**: Rule-based approval/rejection workflows (DecisionEngineService)
- **Receipt System**: Financial receipts management with read receipts tracking
- **Dashboard**: Real-time stats, message queue, logs

## 📱 Frontend Pages
| Page | Description | Key Features |
|------|-------------|--------------|
| Dashboard | Overview stats | Message counts, pipeline metrics, charts |
| Messages | Processing queue | Approve/reject, intent/entities view |
| Pipeline | Live NLP tester | Test raw text → full analysis |
| Knowledge Graph | Org hierarchy | Interactive tree: Schools → Channels |
| Channels | Telegram channels | List, stats, member counts |
| Events | ERP events | Filter by dept/type/status |
| Receipts **NEW** | Receipt management | List/view/approve receipts, read receipts |
| Logs | System logs | Real-time filtering by level |
| Chatbot | Interactive testing | Live message processing |

## 🔌 REST API Endpoints

### Messages (`/api/messages`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages` | Process message via NLP pipeline |
| GET | `/api/messages` | List (query: `?status=PENDING&intent=announcement`) |
| GET | `/api/messages/{id}` | Single message details |
| POST | `/api/messages/{id}/approve` | Admin approval |
| POST | `/api/messages/{id}/reject` | Reject |
| GET | `/api/messages/stats` | Aggregated stats |

### Receipts **NEW** (`/api/receipts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/receipts` | List receipts (?userId=?&status=?) |
| GET | `/api/receipts/{id}` | Single receipt details |
| POST | `/api/receipts` | Create new receipt |
| POST | `/api/receipts/{id}/approve` | Approve receipt |
| GET | `/api/read-receipts` | Read receipts tracking |

### Decision Engine **NEW** (`/api/decisions`)
| POST | `/api/decisions/evaluate` | Run decision rules on DTO |

### NLP (`/api/nlp`)
| POST | `/api/nlp/analyze` | Standalone analysis (text → intent/entities) |

### Knowledge Graph (`/api/knowledge-graph`)
| GET | `/api/knowledge-graph` | Full hierarchy |
| GET | `/api/knowledge-graph/schools` | All schools |
| GET | `/api/knowledge-graph/departments?schoolId=1` | Filtered |
| GET | `/api/knowledge-graph/programs?deptId=1` | Programs |

### Other (`/api/*`)
| GET | `/api/channels` | All Telegram channels |
| GET | `/api/events` | ERP events (`?dept=CSE&type=exam`) |
| GET | `/api/logs?limit=50&level=ERROR` | System logs |
| GET | `/api/dashboard` | Unified stats |
| GET | `/api/users` | User management |

## 🧠 NLP Pipeline Flow

```
1. RAW INPUT (Telegram message)
   ↓
2. INTENT: announcement/query/task (confidence score)
   ↓
3. NER EXTRACTION: dept(CSE), year(3rd), event(exam), date(2024-12), audience(UG)
   ↓
4. KG RESOLUTION: CSE → Dept#3 → Channels [CH001,CH002]
   ↓
5. DECISION ENGINE: Rule evaluation (auto-approve? confidence threshold?)
   ↓
6. ACTION: Telegram delivery + MongoDB persist + Log + Receipt if financial
```

**NlpPipelineEngine** extracts 10+ entity types with 90%+ accuracy on university domain.

## 🗄️ MongoDB Database

**Embedded MongoDB** (data/ directory):
- Collections: schools, departments, programs, teams_channels, messages, erp_events, system_logs, **receipts**, **read_receipts**, **decision_rules**, **users**
- Auto-seeded on startup (DataSeeder.java)
- View data: `mongosh --dbpath ./data`
- Backup: Copy `./data/` directory

## 📋 Project Structure

```
UniAgent NLP-Pipeline-University-ERP/
├── README.md                    # This file
├── start-all.sh                # Full stack start
├── start.sh                    # Backend + MongoDB
├── TELEGRAM_SETUP.md           # Bot token setup
├── TODO.md                     # Current tasks
├── .gitignore                  # Git ignores
├── FILE_LIST.md                # File inventory
├── backend/                    # Spring Boot API + Services
│   ├── pom.xml
│   ├── src/main/java/com/university/erp/
│   │   ├── config/ (DataSeeder, TeamsConfig)
│   │   ├── controller/ (ReceiptController, MessageController, KnowledgeGraphController...)
│   │   ├── dto/ (DecisionResult, MessageReadReceiptDTO...)
│   │   ├── model/ (Receipt, ReadReceipt, User, DecisionRule, MessageReadReceipt...)
│   │   ├── repository/ (ReceiptRepository...)
│   │   └── service/ (ReceiptService, DecisionEngineService, MessageReadReceiptService...)
├── frontend/                   # React + Vite UI
│   ├── src/pages/ (Receipts.jsx **NEW**, Chatbot.jsx...)
└── data/                       # MongoDB storage
```

## 🤖 Telegram Integration
- **BotController**: Handles webhook/commands
- Setup: Follow `TELEGRAM_SETUP.md` for bot token/environment vars
- Channels model supports Telegram channel routing/membership

## 🚀 Development Workflow
1. `./start-all.sh` for hot-reload dev
2. Backend changes: Maven auto-recompiles
3. Frontend: Vite HMR
4. Test NLP: `/pages/Pipeline`
5. Test Receipts: `/pages/Receipts`
6. View logs: `/pages/Logs`

**Troubleshoot**:
- Backend not starting? Run `./start.sh` first.

**Build**:
```bash
cd backend && mvn clean package -DskipTests
cd ../frontend && npm run build
```

## ☁️ Production Deployment
1. External MongoDB: Edit `application.properties`
2. JAR: `mvn package` → `java -jar target/*.jar`
3. Frontend: `npm run build` → serve `dist/`

## 📈 Features Coverage
- ✅ Full-stack (Java/React/Mongo)
- ✅ Advanced NLP for uni domain
- ✅ Telegram bot automation
- ✅ Knowledge Graph navigation
- ✅ Real-time dashboard/logs
- ✅ Message approval workflow
- ✅ ERP event tracking
- ✅ **Receipts management & read receipts** ✅
- ✅ **Decision Engine** ✅

See `TODO.md` for roadmap.

## 🙌 Contributing
1. Fork & PR to https://github.com/divy151005/NLP-Pipeline-University-ERP
2. Follow code style (IntelliJ formatter)
3. Add tests for new features
4. Update README for new features

---
**Built with ❤️ for University Automation**
