---
title: PROJECT REPORT ON SERPENTIS
author: ATHARVA PHALKE
---

# TITLE PAGE

**PROJECT REPORT ON**  
**SERPENTIS**

Submitted in partial fulfillment of the requirements for the degree of  
[MISSING — COURSE]  
in  
[MISSING — DEPARTMENT]

By  
**ATHARVA PHALKE**

Under the guidance of  
**[MISSING — GUIDE NAME]**

**[MISSING — COLLEGE NAME]**  
**[MISSING — ACADEMIC YEAR]**

---

# CERTIFICATE

This is to certify that the project entitled **SERPENTIS** is a bonafide work carried out by **ATHARVA PHALKE** under my supervision and guidance for the partial fulfillment of the requirements for the degree of [MISSING — COURSE] in [MISSING — DEPARTMENT] at [MISSING — COLLEGE NAME] during the academic year [MISSING — ACADEMIC YEAR].

______________________  
**[MISSING — GUIDE NAME]**  
Project Guide

______________________  
**Head of Department**

______________________  
**Principal**

---

# STUDENT DECLARATION

I, **ATHARVA PHALKE**, hereby declare that the project work entitled **SERPENTIS** submitted to [MISSING — COLLEGE NAME] is a record of an original work done by me under the guidance of [MISSING — GUIDE NAME]. This project work is submitted in the partial fulfillment of the requirements for the award of the degree of [MISSING — COURSE]. The results embodied in this report have not been submitted to any other University or Institute for the award of any degree or diploma.

______________________  
**ATHARVA PHALKE**

---

# ACKNOWLEDGEMENT

I would like to express my sincere gratitude to my project guide, [MISSING — GUIDE NAME], for their continuous support, motivation, and guidance throughout the development of SERPENTIS. I am also thankful to the faculty members of the [MISSING — DEPARTMENT] at [MISSING — COLLEGE NAME] for their valuable insights. Lastly, I extend my appreciation to my family and friends for their constant encouragement.

---

# ABSTRACT

SERPENTIS is a comprehensive React Native mobile application with a Node.js/Express backend and MongoDB database, designed to address the inefficiencies in modern civic reporting and community engagement. Traditional systems often lack transparency, real-time updates, and gamification, leading to civic apathy. SERPENTIS solves this by providing a unified digital platform where citizens can report local infrastructure issues using geospatial coordinates, track resolution progress, and engage in real-time community chat via Socket.IO. The system integrates advanced map rendering (MapLibre with OpenFreeMap tiles) to dynamically display user reports, emergency SOS alerts, and verified geospatial datasets comprising 2,319 public services and 13 heritage records. Furthermore, the implementation features a gamified Trust Score system to incentivize legitimate civic participation, secure token-based authentication (JWT, bcrypt, React Native Keychain), and real-time emergency broadcast protocols. 

---

# TABLE OF CONTENTS
(Automated in Word)

# LIST OF FIGURES
(Automated in Word)

# LIST OF TABLES
(Automated in Word)

---

# CHAPTER 1 — INTRODUCTION

## 1.1 Background
Urban and rural communities face continuous challenges in reporting and addressing civic issues such as potholes, garbage accumulation, water leakage, and broken streetlights. Traditional reporting systems are often fragmented, slow, and lack transparency, leading to unaddressed civic problems and citizen frustration. Additionally, managing emergency situations (SOS) and keeping the community informed about local heritage and public services is disjointed.

## 1.2 Problem Statement
The current system for civic reporting is highly inefficient. Citizens lack a centralized, transparent platform to report issues directly with multimedia evidence and exact geospatial coordinates. Furthermore, tracking the status of these reports is tedious. In emergencies, citizens need a quick way to broadcast SOS alerts to nearby users. There is also a lack of community cohesion in managing local information, such as heritage sites or public services, leading to a disconnected civic experience.

## 1.3 Motivation
The primary motivation behind SERPENTIS is to empower citizens and promote smart city governance. By providing a transparent, easy-to-use, and engaging platform, the project aims to increase civic participation and ensure that local issues are brought to light and resolved efficiently.

## 1.4 Objectives
1. To develop a cross-platform mobile application utilizing React Native for citizens to report civic issues with images and GPS locations.
2. To implement a secure, scalable backend system using Node.js and MongoDB for storing user data, reports, and public services.
3. To provide a real-time SOS alerting mechanism for emergencies using WebSockets.
4. To foster community engagement through real-time chat (Socket.IO) and group discussions.
5. To gamify civic participation through a Trust Score and reputation system, encouraging reliable reporting.

## 1.5 Scope
The scope of SERPENTIS is bounded to the development of the mobile client and the backend server API. The mobile application provides user authentication, profile management, report creation, map visualization, community chat, and SOS broadcasts. The backend handles REST APIs, real-time web sockets, secure credential storage, and media uploads. The system focuses on citizen-to-citizen and citizen-to-system interactions, currently excluding a dedicated web dashboard for municipal authorities.

## 1.6 Significance of the Project
SERPENTIS modernizes the concept of neighborhood watch and civic maintenance. By merging gamification with social awareness, it converts a previously tedious civic duty into an engaging community activity, significantly reducing the turnaround time for issue discovery and reporting.

## 1.7 Organization of the Report
Chapter 2 reviews existing systems and literature. Chapter 3 covers system analysis and requirements. Chapter 4 details system design and architectures. Chapter 5 discusses implementation specifics. Chapter 6 provides testing and QA results. Chapter 7 concludes the project, outlining future enhancements. Chapter 8 and 9 cover references and technical appendices, respectively.

---

# CHAPTER 2 — LITERATURE REVIEW

## 2.1 Introduction
The literature review examines the state of existing civic reporting portals, emergency alert systems, and community-based digital platforms. Understanding the technical limitations and functional gaps in current solutions justifies the architecture of SERPENTIS.

## 2.2 Existing Civic Reporting Systems
Various municipalities utilize standalone web portals or legacy applications (e.g., SeeClickFix) for citizens to submit complaints regarding infrastructure. These platforms act primarily as issue drop-boxes and rarely provide community-level visibility.

## 2.3 Existing Emergency/SOS Applications
Emergency applications often focus solely on dispatching alerts to trusted contacts or authorities via SMS. They generally lack integration into a broader community-awareness network, meaning nearby citizens who could provide immediate assistance are uninformed.

## 2.4 Community-Based Digital Platforms
Platforms like Nextdoor provide hyper-local social networking. While they excel at community discussion, they lack structured, verifiable civic reporting mechanisms and do not integrate geospatial data filtering for municipal infrastructure.

## 2.5 Location-Based Civic Applications
Modern GIS applications allow mapping of public resources. However, these systems are usually read-only portals managed by state entities and do not permit dynamic, real-time user contribution with media attachments and trust validation.

## 2.6 Limitations of Existing Approaches
Existing systems suffer from:
- Low user engagement due to a lack of gamification or reward mechanisms.
- Absence of real-time bidirectional communication.
- Lack of integrated emergency (SOS) features within the civic domain.
- Fragmented architecture that separates chat, mapping, and reporting.

## 2.7 Functional Gap
There is a distinct gap requiring a unified platform that combines geospatial civic reporting, real-time community chat, SOS alerts, and a trust-based gamification system under a single, highly performant mobile application backed by a scalable NoSQL database.

## 2.8 Proposed Approach
SERPENTIS is a React Native mobile application with a Node.js/Express backend and MongoDB database. It introduces real-time web sockets (Socket.IO) for community messaging, MapLibre for geospatial visualization, and a gamified Trust Score algorithm.

## 2.9 Summary
By analyzing the limitations of existing frameworks, SERPENTIS establishes a technical foundation aimed at bridging civic reporting with active, real-time community engagement.

---

# CHAPTER 3 — SYSTEM ANALYSIS

## 3.1 System Requirements
System analysis defines the baseline requirements necessary for the successful deployment and operation of SERPENTIS.

## 3.2 Functional Requirements

| ID | Module | Requirement Description | Priority |
|----|--------|-------------------------|----------|
| FR1 | Authentication | User registration, login, and password management with JWT. | High |
| FR2 | Profile | Users can update their profile information and display pictures. | Medium |
| FR3 | Civic Reporting | Users can create geospatial reports containing images, descriptions, and categories. | High |
| FR4 | Mapping | System must plot user reports, 2,319 public services, and 13 places on an interactive map. | High |
| FR5 | Emergency (SOS) | Users can broadcast SOS signals containing emergency type and precise GPS coordinates. | High |
| FR6 | Community Chat | Users can join groups and send real-time chat messages via Socket.IO. | High |
| FR7 | Gamification | System calculates and displays user Trust Scores and Leaderboards. | Medium |

## 3.3 Non-Functional Requirements

| ID | Quality Attribute | Requirement Description |
|----|-------------------|-------------------------|
| NFR1 | Security | Passwords hashed via bcrypt; tokens stored via React Native Keychain; JWT for API routes. |
| NFR2 | Performance | Backend must perform efficient geospatial `$near` queries using MongoDB `2dsphere` indexes. |
| NFR3 | Scalability | Node.js backend must handle concurrent websocket connections. |
| NFR4 | Availability | System API should be highly available, returning appropriate HTTP status codes. |

## 3.4 Hardware Requirements
- **Mobile Client:** Android Device (Android 10+) or iOS equivalent. Minimum 2GB RAM, GPS hardware, Camera.
- **Backend Server (Development):** Dual-core CPU, 4GB RAM, 10GB Storage.

## 3.5 Software Requirements
- **Mobile Frontend:** React Native 0.86.0, Node.js >=22.11.0.
- **Backend:** Node.js, Express 5.2.1, MongoDB 9.7.4.
- **Development Tools:** Android Studio / Metro Bundler, Git.

## 3.6 Feasibility Analysis
- **Technical Feasibility:** High. The React Native framework and Node.js environment are well-supported. MapLibre and Socket.IO provide the necessary mapping and real-time capabilities.
- **Operational Feasibility:** High. The intuitive mobile UI allows citizens to report issues seamlessly.
- **Economic Feasibility:** High. The project utilizes open-source frameworks and free-tier cloud services (Cloudinary, OpenFreeMap, MongoDB Atlas/Local).

## 3.7 Development Methodology
The project utilized an Iterative Agile methodology consisting of 16 QA validation stages. Database schemas were defined first, followed by backend API development, mobile UI creation, and distinct feature integration sprints (Authentication → Reports → Maps → Sockets).

## 3.8 User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| Citizen | Standard mobile user. | Can create reports, view maps, chat, and send SOS. |
| Moderator | Elevated user role. | Can verify reports and manage community groups. |
| Admin | System administrator. | Full control over public services, heritage places, and moderation. |

## 3.9 System Constraints
- Requires active internet connection for real-time map tile fetching and API requests.
- Requires user permission for precise GPS location.

## 3.10 Summary
The system analysis firmly outlines the functional boundaries, technical prerequisites, and feasibility of SERPENTIS, ensuring a clear roadmap for the design phase.

---

# CHAPTER 4 — SYSTEM DESIGN

## 4.1 System Architecture
SERPENTIS follows a decoupled client-server architecture. The mobile client communicates asynchronously with the backend server via HTTP REST APIs for standard CRUD operations and WebSockets (Socket.IO) for real-time data streaming.

## 4.2 Frontend Architecture
The mobile frontend is a React Native application. It utilizes functional components, React Context/State hooks for local data management, and React Navigation for handling the Stack and Bottom-Tab transitions.

## 4.3 Backend Architecture
The backend is a Node.js + Express application built with a Model-View-Controller (MVC) inspired design. It segregates logic into Models (Mongoose schemas), Controllers (request handling), Routes (endpoint definitions), and Middlewares (JWT verification, Multer image parsing).

## 4.4 Database Architecture
MongoDB serves as the NoSQL database layer, utilizing Mongoose ODM. It relies heavily on `2dsphere` indexes on the `location` field across the `Report`, `PublicService`, `Place`, and `SOS` collections to enable rapid geospatial intersections.

## 4.5 Authentication and Security Architecture
Authentication is stateless, relying on JSON Web Tokens (JWT). Upon successful login, the server issues a JWT. The React Native application stores this token securely using `react-native-keychain`. All subsequent protected API calls include the JWT in the Authorization header. Passwords are salted and hashed using `bcrypt` before database persistence.

## 4.6 Map/GPS Architecture
The mapping system integrates `MapLibre` to render vector tiles sourced from `OpenFreeMap`. The device's GPS coordinates are fetched using `@react-native-community/geolocation`, transforming raw latitude/longitude into GeoJSON Point objects before API transmission.

## 4.7 Report Processing Architecture
Reports are composed of textual metadata and binary image data. Images are uploaded to `Cloudinary` via the backend, and the resulting secure URL is stored in the MongoDB `Report` document alongside the user reference and geospatial Point.

## 4.8 SOS Architecture
Emergency SOS broadcasts are instantly written to the database and emitted over Socket.IO. The backend broadcasts the SOS event to all active socket clients, triggering visual alerts on nearby users' devices.

## 4.9 Community/Chat Architecture
Chat architecture utilizes Socket.IO rooms. Users joining a specific community group are placed in a socket room. Messages are emitted to the room and concurrently saved to the MongoDB `ChatMessage` collection.

## 4.10 Trust and Reward Architecture
A trust-scoring algorithm evaluates user participation. Actions such as creating valid reports increase the Trust Score. Leaderboard APIs aggregate these scores to rank users dynamically.

## 4.11 Use Case Diagram (Specification)
- **Actors:** Citizen, Moderator.
- **Use Cases:** Register/Login, Create Report, View Map, Send SOS Alert, Join Group, Send Message, View Leaderboard.
- **Relationships:** Citizen initiates all use cases. Moderator inherits Citizen use cases and includes 'Verify Report'.

*(Note: [DIAGRAM REQUIRED - Use Case Diagram])*

## 4.12 DFD Level 0 (Specification)
- **External Entity:** Mobile User.
- **Process:** SERPENTIS Core System (0.0).
- **Data Flow (In):** User Credentials, Report Data, SOS Trigger, Chat Messages.
- **Data Flow (Out):** JWT Token, Map Markers, Real-time Alerts, Leaderboard Data.

*(Note: [DIAGRAM REQUIRED - DFD Level 0])*

## 4.13 DFD Level 1 (Specification)
- **Processes:** 1.0 Auth Management, 2.0 Report Management, 3.0 Map/Geospatial Engine, 4.0 Real-time Comms.
- **Data Stores:** D1 Users, D2 Reports, D3 SOS, D4 Public Services.
- **Data Flows:** Auth credentials to 1.0; Validated token to User. Location data to 3.0; Map features to User. Report payload to 2.0; Cloudinary URL to D2.

*(Note: [DIAGRAM REQUIRED - DFD Level 1])*

## 4.14 DFD Level 2 (Specification for Report Management)
- **Processes:** 2.1 Validate Input, 2.2 Upload Media, 2.3 Store Report, 2.4 Update Trust Score.
- **Data Flows:** Raw report to 2.1. Validated data + Images to 2.2 (Cloudinary API). Image URL to 2.3. Save status to 2.4 to update D1 (User).

*(Note: [DIAGRAM REQUIRED - DFD Level 2])*

## 4.15 ER Diagram (Specification)
- **Entities:** User, Report, SOS, PublicService, Place, Group, ChatMessage.
- **Relationships:** 
  - User (1) to (N) Report [ReportedBy]
  - User (1) to (N) SOS
  - Group (1) to (N) ChatMessage
  - User (1) to (N) ChatMessage
- **Attributes:** User (email, hash, trustScore), Report (title, category, images, location), PublicService (name, category, location).

*(Note: [DIAGRAM REQUIRED - ER Diagram])*

## 4.16 Sequence Diagram (Specification - Authentication)
- **Lifelines:** User App, AuthController, MongoDB.
- **Sequence:** User enters credentials -> App sends POST /login -> AuthController fetches User -> bcrypt.compare() -> Generate JWT -> App stores in Keychain -> Navigates to Home.

*(Note: [DIAGRAM REQUIRED - Sequence Diagram])*

## 4.17 Activity Diagram (Specification - Create Report)
- **Nodes:** Start -> Capture Image & Location -> Submit API Request -> Validate Token -> Upload to Cloudinary -> Save MongoDB -> End.
- **Decisions:** Token valid? (No -> Throw Error). Upload success? (No -> Return 500).

*(Note: [DIAGRAM REQUIRED - Activity Diagram])*

## 4.18 Component Diagram (Specification)
- **Components:** React Native App (UI, Auth Context, Socket Client), Node.js Server (Express Router, Socket.IO Server), MongoDB Atlas, Cloudinary API, OpenFreeMap Tiles.
- **Interfaces:** REST over HTTPS, WSS (WebSockets), MongoDB URI, Cloudinary SDK.

*(Note: [DIAGRAM REQUIRED - Component Diagram])*

## 4.19 Collaboration Diagram (Specification - SOS Alert)
- **Objects:** User1: Citizen, UI: SOSScreen, API: NodeServer, DB: MongoDB, User2: NearbyCitizen.
- **Messages:** 1. Trigger SOS(Type), 2. POST /api/sos, 3. Save SOS(), 4. socket.broadcast('sos_alert'), 5. Display Alert(UI).

*(Note: [DIAGRAM REQUIRED - Collaboration Diagram])*

---

# CHAPTER 5 — IMPLEMENTATION

## 5.1 Implementation Overview
The implementation phase translates the architectural blueprints into functional code. SERPENTIS is implemented entirely in JavaScript/TypeScript across the stack.

## 5.2 Technology Stack
- **React Native (0.86.0):** Mobile frontend framework.
- **Node.js (>=22.11.0) + Express (5.2.1):** Backend runtime and routing framework.
- **MongoDB (9.7.4):** Database layer.
- **Socket.IO (4.8.4):** Real-time event broadcasting.
- **MapLibre (11.4.1):** High-performance vector map rendering.

## 5.3 Mobile Application Implementation
The mobile app is scaffolded using the React Native CLI. It utilizes `@react-navigation/native-stack` and `bottom-tabs` for complex routing. Global state, such as the active user session and Trust Score, is managed using React Context API.

## 5.4 Backend Implementation
The Node.js backend utilizes TypeScript for static typing, compiled via `tsc`. Express handles HTTP requests, utilizing middlewares like `cors` and `multer` for parsing incoming `multipart/form-data` required for image uploads.

## 5.5 Database Implementation
Mongoose acts as the Object Data Modeling (ODM) library. `User.ts`, `Report.ts`, and `PublicService.ts` enforce strict schemas. Crucially, the `location` field is typed as a GeoJSON Point to enable queries like:
```javascript
// Pseudocode: Geospatial Schema Definition
location: {
  type: { type: String, enum: ['Point'], required: true },
  coordinates: { type: [Number], required: true } // [longitude, latitude]
}
schema.index({ location: '2dsphere' });
```

## 5.6 Authentication Implementation
User passwords are encrypted before saving using `bcrypt.hash()`. On login, `bcrypt.compare()` verifies the hash. Upon success, `jsonwebtoken.sign()` generates a JWT. The React Native app secures this token using `react-native-keychain`, ensuring it is stored in the device's secure enclave.

## 5.7 User Profile Implementation
Users can modify their profiles and upload profile pictures. Profile data is fetched dynamically and cached in the local context to prevent excessive API calls.

## 5.8 Civic Report Implementation
When a user submits a report, the app captures the description, category, and GPS coordinates. The data is sent as FormData.

## 5.9 Image Upload Implementation
Images picked via `react-native-image-picker` are parsed by Multer (`multer.memoryStorage()`) on the backend. A `streamifier` buffer streams the data directly to Cloudinary using their v2 API, abstracting away local disk storage limits on the Node server.

## 5.10 GPS and Location Implementation
Coordinates are acquired via `@react-native-community/geolocation`, prompting the user for OS-level location permissions.

## 5.11 MapLibre Implementation
The map screen utilizes `@maplibre/maplibre-react-native`. It fetches vector tiles from OpenFreeMap to avoid enterprise API costs. Reports and Public Services are clustered and rendered as distinct SymbolLayers on the map.

## 5.12 Public Services and Heritage
The backend seeds and serves a dataset of 2,319 public services (hospitals, police stations, fire brigades) and 13 heritage/place records specific to the Sion/SIES geography.

## 5.13 SOS Implementation
SOS triggers send a high-priority API request containing the user's location and emergency type (e.g., Medical, Fire).

## 5.14 Community and Group Chat
Users navigate to the Community tab to view local groups. 

## 5.15 Socket.IO Implementation
The Node.js server attaches a `socket.io` instance to the HTTP server. Clients authenticate their socket connection using the JWT. Events like `chat_message` and `sos_alert` are emitted globally or to specific rooms.

## 5.16 Trust Score and Rewards
The `User` model tracks a `trustScore` integer. Backend controllers increment this score upon report creation or verification.

## 5.17 Dashboard and Leaderboard
The Leaderboard API aggregates users and sorts them descending by `trustScore`, sending the top users to the frontend for display.

## 5.18 Navigation
A robust `NavigationContainer` wraps the app, providing protected route logic. Unauthenticated users are forced to the AuthStack (Login/Signup), while authenticated users access the MainTabs.

## 5.19 Error Handling and Validation
Express routes utilize Try-Catch blocks. Mongoose schema validation handles missing data. The mobile app utilizes Axios interceptors to globally handle `401 Unauthorized` responses and trigger forced logouts.

## 5.20 Security Measures
No sensitive keys (JWT Secrets, Cloudinary URL, MongoDB URI) are hardcoded. They are injected via `.env` files.

## 5.21 Screenshots

*(Note: [SCREENSHOT REQUIRED - Splash, Login, Signup])*
*(Note: [SCREENSHOT REQUIRED - Home, Map, SIES/Sion Map Area])*
*(Note: [SCREENSHOT REQUIRED - Create Report, Report Details])*
*(Note: [SCREENSHOT REQUIRED - Community, Chat])*
*(Note: [SCREENSHOT REQUIRED - SOS, Places])*
*(Note: [SCREENSHOT REQUIRED - Dashboard, Leaderboard])*
*(Note: [SCREENSHOT REQUIRED - Profile, Edit Profile, Notifications, Password Reset])*

---

# CHAPTER 6 — RESULTS AND DISCUSSION

## 6.1 Testing Strategy
SERPENTIS underwent rigorous iterative QA validation rather than relying on arbitrary performance statistics. The testing focused on functional integrity across 16 distinct developmental stages.

## 6.2 Functional Testing
Functional testing ensured that all mobile app screens communicated accurately with the backend schemas.

## 6.3 Iterative QA Validation
The project was validated through 16 QA Steps. These steps iteratively confirmed the stability of each module before proceeding to the next. All 16 steps were completed and passed successfully on the actual repository.

## 6.4 Test Cases (Derived from QA Steps 1-16)

| Test ID | Module | Test Description | Expected Result | Actual Result | Status |
|---------|--------|------------------|-----------------|---------------|--------|
| TC01 | Auth | User Registration & Login with JWT verification. | Token generated & stored in Keychain. | Token successfully stored. | PASS |
| TC02 | Home | Load User Dashboard and Trust Score. | Displays correct user stats. | Stats rendered accurately. | PASS |
| TC03 | Map | Render MapLibre with OpenFreeMap tiles. | Tiles load smoothly at user GPS location. | Map loads natively. | PASS |
| TC04 | Reports | Submit issue with Cloudinary image upload. | Report saved to DB with geospatial Point. | Image uploaded, DB updated. | PASS |
| TC05 | SOS | Broadcast Emergency SOS. | Socket emits alert to all connected users. | Alert received instantly. | PASS |
| TC06 | Community | Send real-time chat message in group. | Message persists in DB and updates UI via socket. | Chat functional. | PASS |
| TC07 | Profile | Update profile picture and details. | DB reflects changes, UI updates context. | Profile updated securely. | PASS |
| TC08 | Leaderboard | Fetch sorted Trust Scores. | Users ordered descending by score. | Ordered list displayed. | PASS |
| TC09 | Heritage | Query 13 Place records and 2,319 Public Services. | Returns accurate records for Sion/SIES. | Records plotted correctly. | PASS |

## 6.5 - 6.15 Functional Module Discussions
Throughout the 16 QA stages, testing confirmed that:
- **Authentication (Step 1-2):** Passwords are secure, tokens handle session continuity.
- **Map/GPS (Step 3):** The transition to MapLibre successfully resolved previous rendering issues.
- **SOS & Community (Step 5-6):** WebSockets operate with minimal latency.
- **Places/Heritage (Step 12):** The dataset (2319 public services, 13 places) integrates seamlessly with geospatial indexing.
- **Backend/Metro Health (Step 14-16):** Development servers process requests efficiently without memory leaks.

## 6.6 Results Discussion
The iterative validation proves that a React Native application with a Node.js/Express backend and MongoDB database is highly capable of running a real-time civic and community platform. The system successfully implements all intended functional requirements.

---

# CHAPTER 7 — CONCLUSION AND FUTURE SCOPE

## 7.1 Conclusion
The SERPENTIS project successfully delivered a comprehensive digital platform that modernizes civic reporting and community engagement. By bridging geospatial tracking with real-time communications, the application empowers citizens to actively participate in smart city governance.

## 7.2 Achievements
- Successfully integrated a React Native mobile frontend with a secure Node.js/Express backend.
- Implemented robust MongoDB `2dsphere` geospatial queries for accurate map plotting.
- Leveraged Socket.IO for real-time SOS broadcasts and community chat.
- Successfully verified 16 complex QA stages ensuring system stability.

## 7.3 Current Limitations
- The system currently lacks a dedicated web portal designed specifically for municipal authorities to officially close and track issue analytics on a macro level.
- Rendering tens of thousands of unclustered map markers could introduce performance bottlenecks on low-end mobile devices.

## 7.4 Future Enhancements
- Implementation of AI-based image verification to automatically categorize and validate civic reports, preventing spam.
- Development of a React.js or Next.js web dashboard for municipal and administrative oversight.
- Integration of advanced map marker clustering algorithms at the MapLibre layer for massive dataset scaling.

## 7.5 Final Summary
SERPENTIS establishes a viable, scalable technical framework for civic-tech applications, proving that gamification and real-time connectivity can significantly enhance community-driven infrastructure management.

---

# CHAPTER 8 — REFERENCES

[1] Meta Platforms, Inc., "React Native Documentation," 2026. [Online]. Available: https://reactnative.dev/
[2] OpenJS Foundation, "Node.js API Documentation," 2026. [Online]. Available: https://nodejs.org/docs/
[3] Expressjs.com, "Express - Node.js web application framework," 2026. [Online]. Available: https://expressjs.com/
[4] MongoDB, Inc., "MongoDB Documentation," 2026. [Online]. Available: https://www.mongodb.com/docs/
[5] Automattic, "Mongoose ODM v9.7.4," 2026. [Online]. Available: https://mongoosejs.com/
[6] Socket.IO, "Socket.IO Documentation," 2026. [Online]. Available: https://socket.io/docs/v4/
[7] MapLibre, "MapLibre GL JS & Native," 2026. [Online]. Available: https://maplibre.org/
[8] OpenFreeMap, "OpenFreeMap Map Tiles," 2026. [Online]. Available: https://openfreemap.org/
[9] Cloudinary, "Cloudinary Node.js SDK," 2026. [Online]. Available: https://cloudinary.com/documentation/node_integration
[10] Auth0, "JSON Web Token (JWT)," 2026. [Online]. Available: https://jwt.io/

*(Note: Formatting follows general IEEE guidelines for web references).*

---

# CHAPTER 9 — APPENDIX

## 9.1 API Endpoint Summary

| HTTP Method | Endpoint | Description |
|-------------|----------|-------------|
| POST | `/api/auth/register` | Registers a new user. |
| POST | `/api/auth/login` | Authenticates user, returns JWT. |
| GET | `/api/reports` | Fetches civic reports (geospatial filter). |
| POST | `/api/reports` | Creates a new report with image. |
| GET | `/api/public-services`| Fetches the 2,319 public services. |
| GET | `/api/places` | Fetches the 13 heritage records. |
| POST | `/api/sos` | Broadcasts SOS emergency. |
| GET | `/api/users/leaderboard`| Fetches top users by Trust Score. |

## 9.2 Database Schema Summary

**User Collection**
- `email`: String (Unique)
- `password`: String (bcrypt hash)
- `trustScore`: Number
- `profilePicture`: String

**Report Collection**
- `title`, `description`: String
- `category`: Enum ('pothole', 'garbage', etc.)
- `images`: Array of Strings (Cloudinary URLs)
- `location`: GeoJSON Point [longitude, latitude]
- `reportedBy`: ObjectId (ref: User)

**PublicService Collection**
- `name`: String
- `category`: String
- `location`: GeoJSON Point

## 9.3 Important Code Snippets

**Geospatial Query Example (Node.js/Mongoose)**
```typescript
const nearbyReports = await Report.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [userLongitude, userLatitude]
      },
      $maxDistance: 5000 // 5km radius
    }
  }
});
```

## 9.4 Sample API Data
*Sample Report JSON Response:*
```json
{
  "_id": "60d5ec49f1b2c8a1e8c9b3a4",
  "title": "Large pothole on main road",
  "category": "pothole",
  "location": {
    "type": "Point",
    "coordinates": [72.86, 19.03]
  },
  "trustScoreImpact": 5
}
```

## 9.5 Additional Technical Information
The repository utilizes `.env` files for environment variable management and ESLint/Prettier for code formatting.

## 9.6 Screenshot Index
*(To be populated upon insertion of screenshots).*
