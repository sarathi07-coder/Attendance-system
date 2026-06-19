<div align="center">

<br/>

```
 ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗    ██╗███╗   ██╗
██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝    ██║████╗  ██║
██║     ███████║█████╗  ██║     █████╔╝     ██║██╔██╗ ██║
██║     ██╔══██║██╔══╝  ██║     ██╔═██╗     ██║██║╚██╗██║
╚██████╗██║  ██║███████╗╚██████╗██║  ██╗    ██║██║ ╚████║
 ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝   ╚═╝╚═╝  ╚═══╝
```

# 🎓 Smart Attendance Management System

**A full-stack, QR-based attendance platform with real-time WhatsApp notifications, analytics dashboards, and dual-portal access for both teachers and students.**

<br/>

[![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-brightgreen?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)](https://docs.docker.com/compose/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Messaging-25D366?style=for-the-badge&logo=whatsapp)](https://whatsapp.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Table of Contents

- [✨ What Is This?](#-what-is-this)
- [🔄 How It Works — System Flow](#-how-it-works--system-flow)
- [🌟 Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🗄️ Database Schema](#️-database-schema)
- [📡 API Reference](#-api-reference)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Configuration](#️-configuration)
- [🔐 Authentication & Roles](#-authentication--roles)
- [📱 QR Check-in Flow](#-qr-check-in-flow)
- [💬 WhatsApp Messaging Service](#-whatsapp-messaging-service)
- [⏰ Automated Schedulers](#-automated-schedulers)
- [🐛 Troubleshooting](#-troubleshooting)
- [🚧 Roadmap](#-roadmap)

---

## ✨ What Is This?

The **Smart Attendance Management System** is a production-ready web application built for schools and colleges to automate and simplify daily attendance tracking. It eliminates the burden of manual registers by providing:

- 📲 **QR Code-based check-ins** — each student has a personalized, time-bound QR code
- 🍃 **Admin portal** — teachers can view real-time check-in status, mark OD/absences, and finalize sessions
- 🎓 **Student portal** — students can log in, display their QR, and view their full attendance history
- 💬 **Instant WhatsApp alerts** — parents are notified automatically when a child is absent
- 📊 **Analytics dashboard** — live stats on class strength, session-wise breakdowns, and regular absentees

---

## 🔄 How It Works — System Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         SMART ATTENDANCE SYSTEM FLOW                                   │
└────────────────────────────────────────────────────────────────────────────────────────┘

  SESSION START (Admin)               STUDENT CHECK-IN              ATTENDANCE FINALIZATION
  ─────────────────────               ─────────────────             ───────────────────────

  [Admin logs in]                     [Student logs in]             [Admin reviews list]
       │                                    │                              │
       ▼                                    ▼                              ▼
  [Dashboard loads]              [Student Dashboard shows]        [Submitted students ✓]
       │                          personal QR code                [Not submitted list ✗]
       ▼                                    │                              │
  [Clicks "Generate QR"]                    ▼                              ▼
       │                          [Scans QR at classroom]        [Admin marks OD / Absent
       ▼                                    │                     / Pre-Informed]
  [QR Code generated for                    ▼                              │
   current session with            [Backend validates:                     ▼
   time-bound expiry]                - Token format             [Finalize Attendance]
       │                             - Date match                           │
       ▼                             - Student match]                       ▼
  [QR displayed /                            │                  [WhatsApp messages sent to
   shared with class]                        ▼                   absent students' parents]
                                    [Attendance marked                     │
                                     PRESENT in DB]                        ▼
                                                                [Session locked / finalized]
                                                                [Analytics updated in real-time]

  ─────────────────────────────────────────────────────────────────────────────────────────

  AUTOMATED SCHEDULER (Background)         REGULAR ABSENTEE DETECTION
  ────────────────────────────────         ──────────────────────────
  • Daily after each session end:          • Runs every Sunday evening
    → Check unfinalized sessions           • Students absent > threshold
    → Auto-send WhatsApp to parents          (default: 3x in 30 days)
    → Log message status to DB             • Weekly summary sent to admin
```

---

## 🌟 Features

### 👨‍🏫 Admin / Teacher Portal
| Feature | Description |
|---|---|
| 🔐 JWT Authentication | Secure login with role-based access (Admin / Teacher) |
| 📊 Live Dashboard | Class strength, today's absentees, message stats, session overview |
| 📲 QR Code Generation | Per-session QR codes with automatic expiry |
| 👀 Real-time Check-in Monitor | See submitted vs. not-submitted students live |
| ✏️ Attendance Override | Mark students as OD, Pre-Informed Absent, or Absent |
| ✅ Session Finalization | Lock attendance and trigger WhatsApp notifications |
| 👥 Student Management | Add, edit, deactivate student records |
| 🔁 Message Retry | Manually re-trigger failed WhatsApp messages |
| ⚠️ Regular Absentee Alert | Students with 3+ absences in 30 days are flagged |

### 🎓 Student Portal
| Feature | Description |
|---|---|
| 🔐 Student Login | Email + password authentication |
| 📱 Personal QR Code | Time-bound, session-specific, unique QR per student |
| 📋 Attendance History | 30-day record of all sessions with status |
| 📊 Analytics View | Pie chart + overall percentage with standing indicator |
| ⏳ Session Awareness | Shows "No Active Session" outside class hours |
| ✅ Duplicate Prevention | Shows "Already Checked In" if re-scanned |

### 💬 WhatsApp Service
| Feature | Description |
|---|---|
| 🔗 Web-based Login | Scan QR once to link WhatsApp account |
| 📨 Bulk Messaging | Send to multiple parents with rate limiting |
| 📡 Status Endpoint | Health check for connection state |
| 🔄 Auto-reconnect | Handles disconnections gracefully |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        SYSTEM ARCHITECTURE                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────┐     HTTP/REST    ┌──────────────────────┐     │
│   │  React Frontend  │◄───────────────►│  Spring Boot Backend  │     │
│   │   (Vite + MUI)   │                 │    (Port: 8080)       │     │
│   │   Port: 3000     │                 │                       │     │
│   └─────────────────┘                 │  ┌─────────────────┐  │     │
│                                        │  │   Controllers   │  │     │
│   Portals:                            │  │ ─────────────── │  │     │
│   • /login         → Admin            │  │ Auth            │  │     │
│   • /dashboard     → Admin            │  │ Student         │  │     │
│   • /students      → Student list     │  │ Attendance      │  │     │
│   • /student-login → Student          │  │ QRCode          │  │     │
│   • /student-dashboard → Student      │  │ Dashboard       │  │     │
│   • /checkin       → QR Scan page     │  └─────────────────┘  │     │
│                                        │           │            │     │
│                                        │  ┌────────▼────────┐  │     │
│                                        │  │    Services     │  │     │
│                                        │  │ AttendanceService│  │     │
│                                        │  │ QRCodeService   │  │     │
│                                        │  │ MessageService  │  │     │
│                                        │  │ SchedulerService│  │     │
│                                        │  └────────┬────────┘  │     │
│                                        │           │            │     │
│                                        │  ┌────────▼────────┐  │     │
│                                        │  │  JPA Repositories│  │     │
│                                        └──┴─────────┬────────┴──┘     │
│                                                     │                 │
│   ┌─────────────────┐    HTTP POST    ┌─────────────▼───────────┐    │
│   │ WhatsApp Service │◄───────────────│       MySQL 8.0          │    │
│   │  (Node.js:3001)  │                │     attendance_db         │    │
│   │  whatsapp-web.js │                │                          │    │
│   └─────────────────┘                └──────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend — `attendance-backend/`
| Layer | Technology | Version |
|---|---|---|
| Language | Java | 17 |
| Framework | Spring Boot | 3.2.0 |
| Security | Spring Security + JWT (jjwt) | 0.12.3 |
| ORM | Spring Data JPA / Hibernate | — |
| Database | MySQL | 8.0 |
| Dev DB | H2 (in-memory) | — |
| Validation | Spring Validation | — |
| API Docs | SpringDoc OpenAPI (Swagger) | 2.3.0 |
| Boilerplate | Lombok | 1.18.30 |
| Build | Maven | 3.x |

### Frontend — `attendance-frontend/`
| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18.2 |
| Build Tool | Vite | 5.0 |
| UI Library | Material UI (MUI) | 5.15 |
| Charts | Recharts | 2.10 |
| QR Code Display | qrcode.react | 4.2 |
| QR Code Scanner | html5-qrcode | 2.3 |
| HTTP Client | Axios | 1.6 |
| Routing | React Router v6 | 6.20 |

### WhatsApp Service — `whatsapp-service/`
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| WhatsApp Client | whatsapp-web.js + Puppeteer |
| QR Generation | qrcode |
| Session Storage | LocalAuth (filesystem) |

### DevOps
| Tool | Purpose |
|---|---|
| Docker | Containerize each service |
| Docker Compose | Orchestrate all 4 containers |
| Nginx | Serve React SPA in production |

---

## 📁 Project Structure

```
attendance-system/
│
├── 📄 docker-compose.yml          # Orchestrates MySQL + Backend + Frontend + WhatsApp
├── 📄 .env.example                # Environment variable template
├── 📄 start_all.sh                # Convenience script for local development
│
├── 📂 attendance-backend/         # Spring Boot REST API
│   ├── 📄 pom.xml
│   └── 📂 src/main/
│       ├── 📂 java/com/school/attendance/
│       │   ├── 📄 AttendanceApplication.java    # Main entry point
│       │   ├── 📂 config/
│       │   │   ├── 📄 SecurityConfig.java       # JWT filter chain, CORS
│       │   │   └── 📄 DataInitializer.java      # Seed default users/students
│       │   ├── 📂 controller/
│       │   │   ├── 📄 AuthController.java              # /api/auth/*
│       │   │   ├── 📄 StudentController.java           # /api/students/*
│       │   │   ├── 📄 AttendanceController.java        # /api/attendance/*
│       │   │   ├── 📄 QRCodeController.java            # /api/qr/*
│       │   │   ├── 📄 DashboardController.java         # /api/dashboard/*
│       │   │   └── 📄 StudentAttendanceController.java # /api/student/* (student self-service)
│       │   ├── 📂 entity/
│       │   │   ├── 📄 Student.java      # Student table model
│       │   │   ├── 📄 Attendance.java   # Attendance record (status, type, finalization)
│       │   │   ├── 📄 QRCode.java       # Session QR tokens (4 blocks/day)
│       │   │   ├── 📄 User.java         # Admin/Teacher accounts
│       │   │   └── 📄 Message.java      # WhatsApp message log
│       │   ├── 📂 service/
│       │   │   ├── 📄 AttendanceService.java    # Core attendance logic + finalization
│       │   │   ├── 📄 QRCodeService.java        # QR generation, validation, session timing
│       │   │   ├── 📄 MessageService.java       # WhatsApp message dispatch
│       │   │   ├── 📄 DashboardService.java     # Stats aggregation
│       │   │   ├── 📄 StudentService.java       # Student CRUD
│       │   │   └── 📄 ScheduledTaskService.java # Cron job scheduler
│       │   ├── 📂 repository/          # Spring Data JPA interfaces
│       │   ├── 📂 dto/                 # Request/Response data objects
│       │   ├── 📂 exception/           # Custom exception handlers
│       │   └── 📂 util/               # JWT utility, helpers
│       └── 📂 resources/
│           └── 📄 application.properties
│
├── 📂 attendance-frontend/         # React + Vite SPA
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   ├── 📄 nginx.conf               # Nginx config for production Docker container
│   └── 📂 src/
│       ├── 📄 App.jsx               # Route definitions + auth guards
│       ├── 📄 main.jsx
│       ├── 📄 index.css             # Global styles + glassmorphism tokens
│       ├── 📂 components/
│       │   ├── 📂 auth/
│       │   │   └── 📄 Login.jsx              # Admin login form
│       │   ├── 📂 layout/
│       │   │   └── 📄 Sidebar.jsx            # Admin navigation sidebar
│       │   ├── 📂 dashboard/
│       │   │   └── 📄 Dashboard.jsx          # Admin main dashboard
│       │   ├── 📂 students/
│       │   │   └── 📄 StudentList.jsx        # Student CRUD management
│       │   ├── 📂 attendance/
│       │   │   └── 📄 AttendanceForm.jsx     # Per-session attendance marking
│       │   └── 📂 student/           # Student self-service portal
│       │       ├── 📄 StudentLogin.jsx       # Student authentication
│       │       ├── 📄 StudentDashboard.jsx   # QR display, history, stats
│       │       └── 📄 StudentCheckIn.jsx     # QR scanner for check-in
│       ├── 📂 services/
│       │   ├── 📄 api.js                     # Axios base instance
│       │   ├── 📄 authService.js             # Admin auth + token storage
│       │   ├── 📄 attendanceService.js       # Attendance API calls
│       │   ├── 📄 studentService.js          # Student CRUD API calls
│       │   └── 📄 dashboardService.js        # Dashboard stats API calls
│       └── 📂 context/              # (Reserved for React Context)
│
└── 📂 whatsapp-service/            # Node.js WhatsApp gateway
    ├── 📄 index.js                  # Express server + whatsapp-web.js client
    ├── 📄 package.json
    └── 📄 Dockerfile
```

---

## 🗄️ Database Schema

```sql
┌─────────────────────────────┐        ┌──────────────────────────────────┐
│         students             │        │            attendance             │
├─────────────────────────────┤        ├──────────────────────────────────┤
│ id              BIGINT (PK) │◄───────│ id                BIGINT (PK)    │
│ rollNo          VARCHAR(20) │        │ student_id        BIGINT (FK)    │
│ studentName     VARCHAR(100)│        │ attendanceDate    DATE           │
│ department      VARCHAR(50) │        │ section           VARCHAR(10)    │
│ section         VARCHAR(10) │        │ classBlock        ENUM           │
│ studentPhone    VARCHAR(15) │        │   (MORNING_1, MORNING_2,        │
│ parentPhone     VARCHAR(15) │        │    AFTERNOON_1, AFTERNOON_2)    │
│ email           VARCHAR(100)│        │ status            ENUM           │
│ passwordHash    VARCHAR(255)│        │   (NOT_MARKED, PRESENT, ABSENT) │
│ enrollmentStatus ENUM       │        │ attendanceType    ENUM           │
│   (ACTIVE, INACTIVE)        │        │   (NOT_SUBMITTED, PRESENT,      │
│ createdAt       TIMESTAMP   │        │    ABSENT, OD, PRE_INFORMED)    │
│ updatedAt       TIMESTAMP   │        │ submittedByStudent BOOLEAN       │
└─────────────────────────────┘        │ submissionTime     TIMESTAMP    │
                                       │ isFinalized       BOOLEAN       │
┌─────────────────────────────┐        │ finalizedAt       TIMESTAMP     │
│           users              │        │ finalizedBy       VARCHAR       │
├─────────────────────────────┤        │ parentMessageSent BOOLEAN       │
│ id           BIGINT (PK)    │        │ studentMessageSent BOOLEAN      │
│ username     VARCHAR(50)    │        │ markedBy          VARCHAR       │
│ passwordHash VARCHAR(255)   │        └──────────────────────────────────┘
│ fullName     VARCHAR(100)   │
│ email        VARCHAR(100)   │        ┌──────────────────────────────────┐
│ role         ENUM           │        │            qr_codes              │
│  (ADMIN, TEACHER)           │        ├──────────────────────────────────┤
│ createdAt    TIMESTAMP      │        │ id           BIGINT (PK)         │
└─────────────────────────────┘        │ sessionDate  DATE                │
                                       │ classBlock   ENUM                │
┌─────────────────────────────┐        │ qrToken      VARCHAR(100) UNIQUE │
│          messages            │        │ generatedAt  TIMESTAMP           │
├─────────────────────────────┤        │ expiresAt    TIMESTAMP           │
│ id           BIGINT (PK)    │        │ isActive     BOOLEAN             │
│ studentId    BIGINT (FK)    │        └──────────────────────────────────┘
│ messageType  ENUM           │
│ recipient    VARCHAR(20)    │
│ content      TEXT           │
│ status       ENUM           │
│ sentAt       TIMESTAMP      │
└─────────────────────────────┘
```

---

## 📡 API Reference

### 🔐 Auth — `/api/auth`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Admin/Teacher login → returns JWT | ❌ |
| POST | `/api/auth/register` | Register new admin user | ❌ |

### 👥 Students — `/api/students`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/students` | List all active students | ✅ JWT |
| POST | `/api/students` | Create a new student | ✅ JWT |
| PUT | `/api/students/{id}` | Update student details | ✅ JWT |
| DELETE | `/api/students/{id}` | Deactivate student (soft delete) | ✅ JWT |

### 📋 Attendance — `/api/attendance`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/attendance/mark` | Mark attendance for a session | ✅ JWT |
| GET | `/api/attendance/date/{date}` | Get attendance by date | ✅ JWT |
| GET | `/api/attendance/submitted` | Get check-in list for a session | ✅ JWT |
| GET | `/api/attendance/not-submitted` | Get absent list for a session | ✅ JWT |
| POST | `/api/attendance/finalize` | Finalize session + trigger messages | ✅ JWT |
| POST | `/api/attendance/resend-messages` | Retry failed WhatsApp messages | ✅ JWT |

### 📲 QR Codes — `/api/qr`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/qr/generate` | Generate QR for a class block | ✅ JWT |
| GET | `/api/qr/current/{block}` | Get active QR for a block | ✅ JWT |
| POST | `/api/qr/validate` | Validate a QR token | ❌ |

### 📊 Dashboard — `/api/dashboard`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Today's summary stats | ✅ JWT |
| GET | `/api/dashboard/absentees/today` | Today's absentees list | ✅ JWT |
| GET | `/api/dashboard/absentees/regular` | Regular absentees list | ✅ JWT |

### 🎓 Student Self-Service — `/api/student`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/student/login` | Student email+password login | ❌ |
| GET | `/api/student/{id}/qrcode` | Get student's personal QR | ❌ |
| POST | `/api/student/checkin` | Submit QR token for check-in | ❌ |
| POST | `/api/student/scan-checkin` | Admin scans student QR | ✅ JWT |
| GET | `/api/student/{id}/attendance-history` | 30-day history + stats | ❌ |
| GET | `/api/student/status` | Check session status by rollNo | ❌ |

### 💬 WhatsApp Service — Port 3001
| Method | Endpoint | Description |
|---|---|---|
| GET | `/status` | Check WhatsApp connection state |
| POST | `/connect` | Initialize WhatsApp client |
| GET | `/get-qr` | Get QR code image (base64) for linking |
| POST | `/send-message` | Send a single WhatsApp message |
| POST | `/send-bulk` | Send bulk messages with rate limiting |
| POST | `/disconnect` | Destroy the WhatsApp session |

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Required For |
|---|---|---|
| Java JDK | 17+ | Backend |
| Maven | 3.6+ | Backend build |
| Node.js | 18+ | Frontend + WhatsApp service |
| MySQL | 8.0 | Database |
| Docker + Compose | Latest | Docker setup (optional) |
| npm | 8+ | Frontend |

---

### ⚡ Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/sarathi07-coder/Attendance-system.git
cd Attendance-system

# 2. Configure environment
cp .env.example .env
# Edit .env if needed

# 3. Start everything
docker-compose up -d

# 4. Access the app
# Frontend:    http://localhost:3000
# Backend API: http://localhost:8080
# Swagger UI:  http://localhost:8080/swagger-ui.html
# WhatsApp:    http://localhost:3001/status
```

---

### 🔧 Option 2: Manual Local Setup

#### Step 1 — MySQL Database

```sql
CREATE DATABASE attendance_db;
```

#### Step 2 — Backend

```bash
cd attendance-backend

# Update database credentials in:
# src/main/resources/application.properties

mvn spring-boot:run
```

Backend will start on **http://localhost:8080**

#### Step 3 — WhatsApp Service

```bash
cd whatsapp-service
npm install
node index.js
```

Service starts on **http://localhost:3001**

To connect WhatsApp:
1. Open `http://localhost:3001/status` to check connection
2. Call `POST http://localhost:3001/connect`
3. Call `GET http://localhost:3001/get-qr` to get the QR image
4. Scan QR in the admin dashboard under WhatsApp settings

#### Step 4 — Frontend

```bash
cd attendance-frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

### 🧑‍💻 Step 5 — Create Your First Admin User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "passwordHash": "admin123",
    "fullName": "Admin User",
    "role": "ADMIN",
    "email": "admin@school.com"
  }'
```

**Default login:**
- Username: `admin`
- Password: `admin123`

> ⚠️ **Change the password in production!**

---

## ⚙️ Configuration

### Backend — `application.properties`

```properties
# ── Database ──────────────────────────────────────────────────────────
spring.datasource.url=jdbc:mysql://localhost:3306/attendance_db
spring.datasource.username=root
spring.datasource.password=your_password

# ── JWT ───────────────────────────────────────────────────────────────
jwt.secret=your-secret-key-min-256-bits-long
jwt.expiration=86400000           # 24 hours in milliseconds

# ── WhatsApp Service ──────────────────────────────────────────────────
whatsapp.service.url=http://localhost:3001

# ── School Settings ───────────────────────────────────────────────────
school.name=Smart School
school.absent.threshold=3         # Absences before flagging
school.lookback.days=30           # Period to check for regular absentees

# ── Session Timings (24-hour HH:mm) ───────────────────────────────────
session.morning1.start=09:00
session.morning1.end=10:00
session.morning2.start=10:15
session.morning2.end=11:15
session.afternoon1.start=13:00
session.afternoon1.end=14:00
session.afternoon2.start=14:15
session.afternoon2.end=15:15

# ── Cron Schedulers ───────────────────────────────────────────────────
attendance.scheduler.morning1-cron=0 35 9 * * ?
attendance.scheduler.morning2-cron=0 15 11 * * ?
attendance.scheduler.afternoon1-cron=0 35 13 * * ?
attendance.scheduler.afternoon2-cron=0 15 15 * * ?
attendance.scheduler.weekly-report-cron=0 0 20 ? * SUN
```

### Frontend — `.env`

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Docker Environment — `.env`

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
```

---

## 🔐 Authentication & Roles

```
┌────────────────────────────────────────────────┐
│               ROLE-BASED ACCESS                │
├────────────────────────────────────────────────┤
│                                                │
│  ADMIN                                         │
│  ├── Full access to all features               │
│  ├── Manage users and students                 │
│  └── Generate reports                          │
│                                                │
│  TEACHER                                       │
│  ├── Mark and finalize attendance              │
│  ├── View dashboard and absentees             │
│  └── No student management                    │
│                                                │
│  STUDENT (separate portal)                     │
│  ├── View personal QR code                    │
│  ├── Self check-in during sessions            │
│  └── View own attendance history              │
│                                                │
└────────────────────────────────────────────────┘
```

- **Admin/Teacher** auth uses **JWT Bearer tokens** stored in `localStorage`
- **Student** auth uses a **session UUID token** (no JWT — lightweight)
- All admin endpoints require `Authorization: Bearer <token>` header

---

## 📱 QR Check-in Flow

### Student Self Check-in
```
1. Student opens /student-login → authenticates with email + password
2. Dashboard fetches /api/student/{id}/qrcode
   → Backend checks: Is there an active session right now?
   → If yes: generates token format: studentId-BLOCK-DATE-hash
   → If no:  shows "No Active Session"
3. Student shows QR code on screen
4. Admin / scanner reads the QR → POST /api/student/checkin
5. Backend validates:
   ├── Token format valid (4 parts split by "-")
   ├── Date matches today
   ├── studentId matches rollNo
   └── Not already checked in
6. Attendance record created with submittedByStudent = true
7. Student sees ✅ "Checked In!" status
```

### Admin-Scanned Check-in
```
1. Admin visits /checkin (QR Scanner page)
2. Scans physical student QR using device camera
3. POST /api/student/scan-checkin → { studentId, classBlock }
4. Backend directly marks attendance PRESENT
```

---

## 💬 WhatsApp Messaging Service

The WhatsApp service runs as a separate Node.js microservice using **whatsapp-web.js**, which uses Puppeteer to automate a real WhatsApp Web session.

### First-Time Setup
```
1. Start service: node index.js
2. POST http://localhost:3001/connect
3. GET  http://localhost:3001/get-qr     → returns base64 QR image
4. Scan QR with WhatsApp mobile app
5. GET  http://localhost:3001/status     → should return { connected: true }
```

### Message Format (sent to parents)
```
📚 Attendance Alert - Smart School

Dear Parent,

Your ward [Student Name] (Roll No: [ROLL]) was marked 
ABSENT for the [SESSION] session on [DATE].

Please ensure regular attendance.

— Smart School Administration
```

### Rate Limiting
Bulk messages include a **1-second delay** between each send to prevent WhatsApp from flagging the number.

---

## ⏰ Automated Schedulers

The `ScheduledTaskService` runs background jobs using Spring's `@Scheduled` annotation:

| Cron | Task |
|---|---|
| After each session end | Finalize unsubmitted attendance + send parent messages |
| Every Sunday 8:00 PM | Generate regular absentee report |

The session timing is **fully configurable** in `application.properties` — simply update the `session.*` and `attendance.scheduler.*` cron values.

---

## 🧪 Testing

### Backend Tests
```bash
cd attendance-backend
mvn test
```

### Frontend (Manual)
```bash
cd attendance-frontend
npm run preview   # Preview production build
```

### Swagger UI
Access interactive API docs at:
```
http://localhost:8080/swagger-ui.html
```

---

## 🐛 Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| Backend won't start | MySQL not running | Start MySQL: `brew services start mysql` |
| `Access Denied` on DB | Wrong credentials | Update `application.properties` |
| JWT errors in frontend | Token expired | Log out and log in again |
| WhatsApp not sending | Client not connected | Call `/connect` and scan QR |
| QR code shows "No Session" | Current time outside session window | Update `session.*.start/end` in properties |
| CORS errors in browser | Backend CORS config | Check `SecurityConfig.java` allowed origins |
| Docker port conflicts | Port already in use | Change ports in `docker-compose.yml` |

---

## 🚧 Roadmap

- [ ] 📱 React Native mobile app for parents
- [ ] 👆 Biometric attendance integration
- [ ] 📧 Email notification fallback
- [ ] 🌐 Multi-language support (i18n)
- [ ] 📜 Attendance certificate PDF generation
- [ ] 📈 Advanced analytics (monthly/yearly trends)
- [ ] 🤖 WhatsApp chatbot for parent queries
- [ ] 🔔 Push notifications
- [ ] 🏫 Multi-institution support

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

Made with ❤️ by [Sarathi](https://github.com/sarathi07-coder)

⭐ Star this repo if you find it useful!

</div>
