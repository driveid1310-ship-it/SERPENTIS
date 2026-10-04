# SERPENTIS Diagram Specifications

## 1. Use Case Diagram

*   **Diagram Title:** SERPENTIS System Use Case Diagram
*   **Actors:**
    *   Citizen (Primary Actor)
    *   Moderator (Secondary Actor - Inherits from Citizen)
*   **System Boundary:** SERPENTIS Application
*   **Use Cases:**
    *   **Authentication & Profile:**
        *   Register / Login
        *   Password Reset (OTP)
        *   Manage Profile (Update details, Profile Picture)
        *   Privacy/Security Functionality (JWT/Keychain management implicitly part of login/session)
    *   **Civic Reporting:**
        *   Create Civic Report
            *   *Includes:* Add Location/GPS
            *   *Includes:* Upload Report Image
        *   View Reports
        *   Interact with Reports (Upvote, Personally Observe)
        *   Verify Report (Moderator Only)
    *   **Emergency:**
        *   Broadcast SOS Alert
    *   **Mapping & Location:**
        *   View Map (MapLibre/OpenFreeMap)
        *   Find Public Services (2319 records)
        *   Find Heritage/Places (13 records)
    *   **Community:**
        *   Community/Group Functionality (Join/View Groups)
        *   Chat (Real-time Socket.IO)
    *   **Gamification:**
        *   View Dashboard (Personal Stats)
        *   View Leaderboard/Rewards (Trust Score ranking)
*   **Relationships:**
    *   Citizen -> All Use Cases (except Verify Report)
    *   Moderator -> Verify Report
    *   Create Civic Report -> (<<include>>) Add Location/GPS
    *   Create Civic Report -> (<<include>>) Upload Report Image
*   **What should NOT be included:** Municipal Web Dashboard/Admin portal (Out of scope).

---

## 2. DFD Level 0 (Context Diagram)

*   **Diagram Title:** SERPENTIS Context Data Flow Diagram (Level 0)
*   **Entities (External):**
    *   Citizen (Mobile User)
    *   External APIs (Cloudinary, OpenFreeMap)
*   **Process:**
    *   0.0 SERPENTIS System
*   **Data Flows (Directional):**
    *   Citizen -> SERPENTIS System: Credentials, Profile Data, Report Details + Media, SOS Trigger, Chat Messages.
    *   SERPENTIS System -> Citizen: JWT Token, Map Markers/Data, Trust Score Updates, Real-time Chat/SOS Alerts.
    *   SERPENTIS System -> External APIs: Image Data (to Cloudinary), Map Tile Requests (to OpenFreeMap).
    *   External APIs -> SERPENTIS System: Secure Image URL (from Cloudinary), Vector Map Tiles (from OpenFreeMap).
*   **What should NOT be included:** Internal databases or sub-processes.

---

## 3. DFD Level 1

*   **Diagram Title:** SERPENTIS Data Flow Diagram (Level 1)
*   **Entities (External):** Citizen, Cloudinary API, OpenFreeMap API
*   **Processes:**
    *   1.0 Auth & Profile Management
    *   2.0 Civic Reporting Engine
    *   3.0 Emergency (SOS) System
    *   4.0 Map & Spatial Engine
    *   5.0 Community & Chat System (Socket.IO)
    *   6.0 Gamification & Leaderboard Engine
*   **Data Stores:**
    *   D1: Users (MongoDB)
    *   D2: Reports (MongoDB)
    *   D3: Public Services & Places (MongoDB)
    *   D4: SOS Events (MongoDB)
    *   D5: Groups & Messages (MongoDB)
    *   D6: OTPs (MongoDB)
*   **Data Flows:**
    *   Citizen -> 1.0: Credentials -> D1 & D6 (Auth Verification).
    *   Citizen -> 2.0: Report Payload -> Cloudinary API (Returns URL) -> D2 (Store Report) -> 6.0 (Update Trust Score).
    *   Citizen -> 3.0: SOS Trigger -> D4 (Store SOS) -> Emit Real-time Alert -> Citizen.
    *   Citizen -> 4.0: GPS Bounding Box -> D2 & D3 (Spatial Query) + OpenFreeMap API (Tiles) -> Citizen (Map View).
    *   Citizen -> 5.0: Chat Message -> D5 (Store Message) -> Emit via Socket.IO -> Citizen.
    *   6.0 -> D1: Read/Update Trust Scores -> Citizen (Leaderboard View).

---

## 4. DFD Level 2 (Civic Reporting)

*   **Diagram Title:** SERPENTIS Data Flow Diagram (Level 2) - Civic Reporting Engine
*   **Entities:** Citizen, Cloudinary API
*   **Processes (Expanding 2.0):**
    *   2.1 Capture Location & Data
    *   2.2 Upload Media
    *   2.3 Validate & Store Report
    *   2.4 Trigger Gamification Engine
*   **Data Stores:** D2: Reports, D1: Users
*   **Data Flows:**
    *   Citizen -> 2.1: Location, Category, Description, Raw Image.
    *   2.1 -> 2.2: Raw Image -> Cloudinary API -> Secure Image URL.
    *   2.1 & 2.2 -> 2.3: Merged Payload (Data + URL).
    *   2.3 -> D2: Insert GeoJSON Point Document.
    *   2.3 -> 2.4: Success Status -> Update D1 (Trust Score Increment).
    *   2.3 -> Citizen: Success Confirmation.

---

## 5. ER Diagram

*   **Diagram Title:** SERPENTIS Entity Relationship Diagram
*   **Entities & Important Attributes:**
    *   **User:** `_id` (PK), `email` (Unique), `password` (Hash), `trustScore` (Int), `profilePicture` (String), `role` (Enum), `badges` (Array).
    *   **Report:** `_id` (PK), `title`, `description`, `category` (Enum), `status` (Enum), `location` (GeoJSON 2dsphere), `images` (Array), `reportedBy` (FK -> User).
    *   **PublicService:** `_id` (PK), `name`, `category`, `location` (GeoJSON 2dsphere).
    *   **Place:** `_id` (PK), `name`, `description`, `location` (GeoJSON 2dsphere).
    *   **SOS:** `_id` (PK), `reportedBy` (FK -> User), `emergencyType` (Enum), `location` (GeoJSON 2dsphere), `status` (Enum).
    *   **Group:** `_id` (PK), `name`, `description`, `members` (Array of FK -> User).
    *   **ChatMessage:** `_id` (PK), `group` (FK -> Group), `sender` (FK -> User), `message` (String), `timestamp`.
    *   **OTP:** `_id` (PK), `email`, `otp`, `expiresAt`.
*   **Relationships:**
    *   User (1) ---- (N) Report (A user creates many reports)
    *   User (1) ---- (N) SOS (A user triggers many SOS alerts)
    *   User (M) ---- (N) Group (Users belong to many groups)
    *   Group (1) ---- (N) ChatMessage (A group has many messages)
    *   User (1) ---- (N) ChatMessage (A user sends many messages)
*   **Important Indexes to Note:** `location` fields must be marked with `[2dsphere Index]`.

---

## 6. Sequence Diagram

*   **Diagram Title:** Create Civic Report Sequence Diagram
*   **Actors/Lifelines:**
    *   Citizen (Mobile UI)
    *   AuthContext / Keychain (Client-side Security)
    *   ReportController (Node.js/Express)
    *   Cloudinary API
    *   MongoDB (Mongoose)
*   **Messages (Sequential):**
    1.  Citizen -> Mobile UI: Enter details, snap photo, get GPS.
    2.  Mobile UI -> AuthContext: Retrieve JWT.
    3.  Mobile UI -> ReportController: POST `/api/reports` (FormData with JWT).
    4.  ReportController -> ReportController: Verify JWT Middleware.
    5.  ReportController -> Cloudinary API: Stream image buffer.
    6.  Cloudinary API --> ReportController: Return Secure Image URL.
    7.  ReportController -> MongoDB: `Report.create({ data, location: GeoJSON, images: [URL] })`.
    8.  MongoDB --> ReportController: Return Saved Document.
    9.  ReportController -> MongoDB: `User.findByIdAndUpdate(trustScore++)`.
    10. ReportController --> Mobile UI: 201 Created.
    11. Mobile UI --> Citizen: Show Success Toast & Navigate to Map.

---

## 7. Activity Diagram

*   **Diagram Title:** Create Civic Report Activity Flow
*   **Nodes & Flow:**
    *   [Start] -> (Select 'Create Report' from Bottom Tab)
    *   (Fetch Device GPS Location via Geolocation API) -> [Decision: GPS Granted?]
    *   [No] -> (Show Permission Error) -> [End]
    *   [Yes] -> (Fill Form: Title, Description, Category)
    *   (Capture/Pick Image) -> (Submit Form)
    *   (Client Validation) -> [Decision: Inputs Valid?]
    *   [No] -> (Show UI Errors)
    *   [Yes] -> (Transmit FormData over REST API)
    *   (Backend Middleware validates JWT) -> [Decision: Token Valid?]
    *   [No] -> (Return 401) -> (Force Logout on Client)
    *   [Yes] -> (Upload Image to Cloudinary)
    *   (Save GeoJSON Report to MongoDB)
    *   (Increment User Trust Score)
    *   (Return 201 Success) -> (Update Context state on Client) -> [End]

---

## 8. Component Diagram

*   **Diagram Title:** SERPENTIS Architectural Components
*   **Components:**
    *   **Mobile App (React Native):**
        *   `Navigation Container` (React Navigation)
        *   `Auth Provider` (Context + Keychain)
        *   `Map Component` (MapLibre GL)
        *   `Socket Client` (Socket.IO-client)
    *   **Backend Server (Node.js/Express):**
        *   `Express Router`
        *   `JWT Verification Middleware`
        *   `Socket.IO Server`
        *   `Controllers` (Auth, Report, Map, Chat, SOS)
        *   `Mongoose Models` (User, Report, etc.)
    *   **External Services:**
        *   `MongoDB Cluster` (Database)
        *   `Cloudinary Service` (Media CDN)
        *   `OpenFreeMap Tiles` (Map Data)
*   **Interfaces/Connections:**
    *   Mobile App <--(REST API over HTTPS)--> Backend Server
    *   Mobile App <--(WSS / WebSockets)--> Backend Server
    *   Backend Server <--(MongoDB Native Driver)--> MongoDB Cluster
    *   Backend Server <--(Cloudinary Node SDK)--> Cloudinary Service
    *   Map Component <--(HTTPS Tile Requests)--> OpenFreeMap Tiles

---

## 9. Collaboration Diagram (Communication Diagram)

*   **Diagram Title:** SOS Emergency Broadcast Collaboration
*   **Objects:**
    *   `1: Citizen` (Actor)
    *   `2: SOS Screen` (React Native UI)
    *   `3: SOS Controller` (Express Backend)
    *   `4: Socket Engine` (Socket.IO Server)
    *   `5: Database` (MongoDB)
    *   `6: Active User Devices` (React Native Clients)
*   **Messages:**
    *   `1 -> 2`: Trigger Emergency (Type)
    *   `2 -> 3`: POST /api/sos (Coordinates, Type, JWT)
    *   `3 -> 5`: Insert SOS Record
    *   `3 -> 4`: Trigger Event `broadcast('sos_alert')`
    *   `4 -> 6`: Emit `sos_alert` over active WebSockets
    *   `6`: Display push/in-app alert to nearby users
*   **What should NOT be included:** Standard polling mechanisms (since Socket.IO handles this natively).
