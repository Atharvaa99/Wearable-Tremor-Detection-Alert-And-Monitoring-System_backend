# 🏥 TremorWatch — Backend API

A production-grade REST API for a **wearable tremor detection and patient monitoring system**. Built for Final Year Project — real-time Parkinson's tremor detection with a nursing dashboard.

## 🚀 Features

- **JWT Authentication with Token Blacklisting**: Secure login/logout with automatic token cleanup via MongoDB TTL index
- **Role-Based Access Control**: Three distinct access levels — Admin, User (Nurse), and IoT Device
- **Live Vitals Pipeline**: IoT devices push Heart Rate, SPO₂, and Tremor Status directly to patient records
- **Automated Device Monitoring**: Background job marks devices INACTIVE after 30 seconds of no data — dead-man's switch pattern
- **Patient-Device Lifecycle Management**: Creating a patient activates a device; deleting a patient frees it back to the pool
- **Admin Seeding**: Default Admin account auto-created on first run if none exists

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Bearer tokens)
- **Security**: bcryptjs for password hashing
- **Background Jobs**: Native `setInterval`

## 📋 Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account or local MongoDB instance

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Atharvaa99/Wearable-Tremor-Detection-Alert-And-Monitoring-System_backend.git
   cd tremor-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   DEFAULT_ADMIN_PASSWORD=your_default_admin_password
   DEVICE_API_KEY=your_iot_device_api_key
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:3000`. A default Admin account is seeded automatically on first run.

## 🏗️ Architecture

### Database Schema

```
User (name, password, role: Admin | User)
  ↓
Patient (name, deviceId, HR, SPO2, tremorStatus, lastSeen)
  ↓
Device (deviceId, type, status: ACTIVE | INACTIVE, patientName)

TokenBlacklist (token, blacklistedAt) ← TTL: 3 days
```

### Vitals Update Flow

```
IoT Device (x-api-key)
  → PATCH /api/patient/patient-info/:deviceId
  → Update HR, SPO2, tremorStatus, lastSeen
  → If device was INACTIVE → mark ACTIVE
  → Frontend polls every 2s (vitals) / 500ms (tremor)
```

### Device Lifecycle

```
Device connects  → POST /connect-device/:deviceId/:type  → status: INACTIVE
Nurse adds patient → POST /create-patient { name, deviceId } → status: ACTIVE
Device goes silent → deviceMonitor job (every 10s) → status: INACTIVE after 30s
Nurse removes patient → DELETE /delete-patient/:id → status: INACTIVE
```

### Why Token Blacklisting?

JWTs are stateless by design — once issued, they're valid until expiry. To support secure logout (especially in a clinical environment where shared workstations are common), issued tokens are stored in a blacklist on logout and checked on every protected request. MongoDB's TTL index auto-purges entries after **3 days**, keeping the collection lean.

### Why a Background Monitor Job?

IoT devices can go offline unexpectedly — battery drain, connectivity loss, hardware failure. The monitor job runs every **10 seconds** and checks if any patient's `lastSeen` timestamp is older than **30 seconds**. If so, it marks the device `INACTIVE` — giving nurses a real-time signal that a device is no longer transmitting.

## 📡 API Endpoints

**Base URL:** `https://wearable-tremor-detection-alert-and.onrender.com`

---

### 🔐 Authentication — `/api/auth`

#### `POST /api/auth/login`
Login with name and password.

**Request:**
```json
{
  "name": "Admin",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "message": "User logged in",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64abc...",
    "name": "Admin",
    "role": "Admin"
  }
}
```

---

#### `POST /api/auth/register-user` *(Admin only)*
Create a new nurse/user account.

**Headers:** `Authorization: Bearer <admin_token>`

**Request:**
```json
{
  "name": "Nurse Jane",
  "password": "securepassword"
}
```

---

#### `DELETE /api/auth/delete-user/:userId` *(Admin only)*
Delete a user account.

**Headers:** `Authorization: Bearer <admin_token>`

---

#### `GET /api/auth/viewAll` *(Admin only)*
Get all registered users.

**Headers:** `Authorization: Bearer <admin_token>`

---

#### `POST /api/auth/logOut` *(Authenticated)*
Blacklist the current JWT token.

**Headers:** `Authorization: Bearer <token>`

---

### 🧑‍⚕️ Patients — `/api/patient`

#### `GET /api/patient/viewAll` *(User)*
Get all patients with their current vitals.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "All patients are as follows",
  "users": [
    {
      "_id": "64xyz...",
      "name": "John Doe",
      "deviceId": "DEV-001",
      "HR": 78,
      "SPO2": 97,
      "tremorStatus": "INACTIVE",
      "lastSeen": "2024-01-15T09:30:00.000Z"
    }
  ]
}
```

---

#### `POST /api/patient/create-patient` *(User)*
Assign a patient to a device. The device must exist and be INACTIVE.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "John Doe",
  "deviceId": "DEV-001"
}
```

---

#### `DELETE /api/patient/delete-patient/:patientId` *(User)*
Remove a patient and return their device to INACTIVE status.

**Headers:** `Authorization: Bearer <token>`

---

#### `PATCH /api/patient/patient-info/:deviceId` *(IoT Device)*
Push live vitals from a wearable device. Called by hardware, not the frontend.

**Headers:** `x-api-key: your_device_api_key`

**Request:**
```json
{
  "HR": 82,
  "SPO2": 96,
  "tremorStatus": "ACTIVE"
}
```

---

### 📡 Devices — `/api/device`

#### `GET /api/device/viewAll` *(User)*
Get all registered devices with their current status.

**Headers:** `Authorization: Bearer <token>`

---

#### `POST /api/device/connect-device/:deviceId/:type` *(IoT Device)*
Self-register a device on first connection. Called by hardware automatically.

**Headers:** `x-api-key: your_device_api_key`

---

#### `DELETE /api/device/delete-device/:deviceId` *(User)*
Remove a device from the system.

**Headers:** `Authorization: Bearer <token>`

---

## 🔐 Authentication Levels

| Level | Method | Used By |
|---|---|---|
| `authUser` | JWT Bearer Token | Nurses — all patient & device endpoints |
| `authAdmin` | JWT Bearer Token + role check | Admins — user management only |
| `authDevice` | `x-api-key` header | IoT hardware — vitals push & device registration |

## 👥 Role Permissions

| Action | Admin | User (Nurse) | Device |
|---|---|---|---|
| Login | ✅ | ✅ | ❌ |
| Register / Delete Users | ✅ | ❌ | ❌ |
| View All Users | ✅ | ❌ | ❌ |
| Add / Remove Patients | ❌ | ✅ | ❌ |
| View Patients & Vitals | ❌ | ✅ | ❌ |
| View / Delete Devices | ❌ | ✅ | ❌ |
| Self-Register Device | ❌ | ❌ | ✅ |
| Push Live Vitals | ❌ | ❌ | ✅ |

## 🧪 Testing Flow

```bash
# 1. Login as Admin (seeded automatically on first run)
POST /api/auth/login
{ "name": "Admin", "password": "your_default_admin_password" }
# → Copy the admin token

# 2. Register a nurse account
POST /api/auth/register-user
Authorization: Bearer <admin_token>
{ "name": "Nurse Jane", "password": "pass123" }

# 3. Login as nurse
POST /api/auth/login
{ "name": "Nurse Jane", "password": "pass123" }
# → Copy the nurse token

# 4. Simulate a device connecting (normally done by hardware)
POST /api/device/connect-device/DEV-001/tremor-sensor
x-api-key: your_device_api_key

# 5. Add a patient assigned to that device
POST /api/patient/create-patient
Authorization: Bearer <nurse_token>
{ "name": "John Doe", "deviceId": "DEV-001" }

# 6. Simulate device pushing vitals
PATCH /api/patient/patient-info/DEV-001
x-api-key: your_device_api_key
{ "HR": 78, "SPO2": 97, "tremorStatus": "ACTIVE" }

# 7. View all patients
GET /api/patient/viewAll
Authorization: Bearer <nurse_token>

# 8. Logout
POST /api/auth/logOut
Authorization: Bearer <nurse_token>
```

## 🚀 Deployment

### Render (Current)

1. Push code to GitHub
2. Connect repository on [render.com](https://render.com)
3. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add all environment variables in the Render dashboard
5. Deploy

**Live API:** `https://wearable-tremor-detection-alert-and.onrender.com`

> ⚠️ Update the CORS `origin` in `app.js` to your frontend URL before deploying:
> ```js
> app.use(cors({ origin: 'https://your-frontend.vercel.app' }));
> ```

## 📁 Project Structure

```
src/
├── config/
│   └── db.js                        # MongoDB connection
│
├── controllers/
│   ├── auth.controller.js           # Register, login, logout, user management
│   ├── device.controller.js         # Device registration, deletion, viewAll
│   └── patient.controller.js        # Patient CRUD + vitals update
│
├── middleware/
│   └── auth.middleware.js           # authUser, authAdmin, authDevice guards
│
├── models/
│   ├── blacklist.model.js           # JWT blacklist — TTL index (3 days)
│   ├── device.model.js              # Device schema (ACTIVE/INACTIVE)
│   ├── patient.model.js             # Patient + HR, SPO2, tremorStatus
│   └── user.model.js                # User schema with bcrypt pre-save hook
│
├── routes/
│   ├── auth.routes.js
│   ├── device.routes.js
│   └── patient.route.js
│
├── jobs/
│   └── deviceMonitor.job.js         # Marks devices INACTIVE after 30s silence
│
├── seeds/
│   └── admin.seed.js                # Seeds default Admin on first run
│
└── app.js                           # Express app + CORS + route mounting

server.js                            # Entry point — connects DB, starts monitor, runs app
```

## 🔮 Planned Features

- [ ] WebSocket support for true real-time push (replace polling)
- [ ] Historical vitals storage with time-series data
- [ ] Alert history log — record all tremor events with timestamps
- [ ] Multi-ward support — group patients by ward
- [ ] Notification system — SMS/email alerts to assigned nurse on tremor detection
- [ ] Patient discharge flow — archive rather than delete
- [ ] Rate limiting on device endpoints — prevent data flooding
- [ ] Refresh token support — improve session management

## 📄 License

This project is open source and available under the [MIT License](LICENSE).