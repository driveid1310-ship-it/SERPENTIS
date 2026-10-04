# DOCUMENTATION AUDIT

## A. PROJECT FACTS
1. **Final project title:** SERPENTIS
2. **Student name:** ATHARVA PHALKE
3. **Technologies and versions actually used:**
   - **Mobile Frontend:** React Native (`0.86.0`), React (`19.2.3`), React Navigation (`^7.3.8`).
   - **Backend:** Node.js (Target `>= 22.11.0`), Express (`^5.2.1`), Socket.IO (`^4.8.4`).
   - **Database:** MongoDB via Mongoose (`^9.7.4`).
   - **Security/Auth:** bcrypt (`^6.0.0`), jsonwebtoken (`^9.0.3`), react-native-keychain (`^10.0.0`).
   - **Media/File Storage:** Cloudinary (`^2.10.0`), multer (`^2.2.0`), react-native-image-picker (`^8.2.1`).
   - **Maps/Location:** MapLibre (`@maplibre/maplibre-react-native 11.4.1`), React Native Geolocation (`@react-native-community/geolocation ^3.4.0`).
4. **Problem statement:** Traditional civic reporting systems are inefficient, lack transparency, and fail to engage the community or provide real-time updates and emergency response features.
5. **Motivation:** To empower citizens and promote smart city governance by providing a transparent, engaging platform for civic participation.
6. **Objectives:** To develop a cross-platform mobile application for geospatial civic issue reporting, real-time SOS alerting, and gamified community engagement.
7. **Scope:** Mobile client and backend server for citizen-to-citizen and citizen-to-system interactions (excluding a dedicated web portal for municipal authorities).
8. **Existing system:** Standalone apps like municipal complaint portals or generic third-party tools (e.g., SeeClickFix).
9. **Limitations of existing system:** Low user engagement, lack of real-time community chat, absent gamification/trust mechanisms, and no integrated emergency (SOS) features.
10. **Proposed system:** A holistic MERN + React Native system combining location-based civic reporting, SOS alerts, and Socket.IO community chat with gamification.
11. **Functional requirements:** User auth (JWT/OTP), Profile management, GPS-based Report creation with images, Interactive Maps (Sion/SIES dataset), Community Groups/Chat, SOS Broadcasts, Trust Score/Leaderboard.
12. **Non-functional requirements:** Secure credential storage (Keychain/Bcrypt), scalable RESTful API, efficient geospatial queries (`2dsphere`), real-time socket performance.
13. **Feasibility:** High technical, operational, and economic feasibility utilizing open-source frameworks and free-tier cloud services.
14. **Development methodology:** Iterative Agile development (schema definition → backend API → mobile UI → distinct feature integration sprints).
15. **System architecture:** Mobile Client (React Native) ↔ REST API / WebSockets (Node.js/Express) ↔ Database (MongoDB) & Media Cloud (Cloudinary).
16. **Frontend architecture:** Component-based UI, Stack/Bottom-Tab Navigation, Context/State management, Socket.IO client.
17. **Backend architecture:** MVC-inspired structure (Models, Controllers, Routes, Middleware, Services).
18. **Database architecture:** MongoDB Collections (`User`, `Report`, `SOS`, `PublicService`, `Place`, `Group`, `ChatMessage`, `OTP`) with `2dsphere` indexes.
19. **Authentication/security architecture:** JWT tokens securely stored via React Native Keychain, passwords hashed with bcrypt, Cloudinary secure uploads.
20. **API architecture:** RESTful endpoints for CRUD operations (`/api/auth`, `/api/reports`, `/api/sos`, `/api/public-services`, etc.).
21. **Map/GPS architecture:** MapLibre rendering OpenFreeMap vector tiles, utilizing React Native Geolocation for user coordinates.
22. **Report workflow:** User selects location → Uploads image (Cloudinary) → Submits details → Backend saves 2dsphere point → Trust score updates.
23. **SOS workflow:** User triggers SOS → Type and coordinates sent via API → Backend broadcasts active SOS to connected users via Socket.IO.
24. **Community/chat workflow:** User joins Group → Messages sent over Socket.IO → Emitted to group members in real-time and persisted in MongoDB.
25. **Trust-score/reward workflow:** Users earn points/badges for verified reports; scores displayed on Dashboard/Leaderboard.
26. **Public-services/heritage functionality:** 2319 public services & 13 heritage places (SIES/Sion dataset) stored in MongoDB, retrieved dynamically via geospatial queries.
27. **Important algorithms:** Geospatial filtering (MongoDB `$near`), real-time event broadcasting, Trust Score calculation.
28. **Important pseudocode that can be included:** JWT authentication logic, Geospatial `$near` query structure, Socket.IO room emission.
29. **Testing already completed:** Steps 1–16 of development/QA history.
30. **Actual QA results from Steps 1–16:** All 16 steps completed and passed during iterative testing.
31. **Known limitations:** Lack of a dedicated municipal web dashboard. Potential rendering performance bottlenecks with extremely large datasets of map markers if clustering is not perfectly tuned.
32. **Future enhancement possibilities:** AI-based image verification, native municipal portal, advanced marker clustering algorithms.
33. **Required screenshots:** Splash, Login, Signup, Home, Map, SIES/Sion Map Area, Create Report, Report Details, Community, Chat, SOS, Places, Dashboard, Leaderboard, Profile, Edit Profile, Notifications, Password Reset.
34. **Required diagrams:** System Architecture, Use Case, Sequence, ER, DFD Level 0-2, Activity, Collaboration, Component.
35. **Existing documentation that can be reused:** `SERPENTIS_Final_Project_Report.docx/.pdf` provide a solid structural outline and textual descriptions.
36. **Missing information that must be supplied manually:** College details, Guide details, Academic Year, actual generated UML images, actual App screenshots.

## B. CURRENT DOCUMENTATION
* **What is already good:** The overall structure, chapter division, factual alignment with backend models, and REST/WebSocket workflow descriptions in the generated `.docx` and `.pdf` files.
* **What is outdated:** The documents do not have any outdated logic, as they were freshly generated based on the current codebase.
* **What is missing:** Real UML diagram images (currently text placeholders) and Mobile App screenshots.
* **What should be rewritten:** The text placeholders for UML and screenshots must be replaced with actual image assets.
* **What can be preserved:** Everything else (Architecture descriptions, methodology, objectives, gap analysis, database mappings).

## C. REPORT CONTENT INVENTORY
Based on the existing Python script logic and repository structure, the inventory aligns perfectly with the proposed Chapters 1 through 9.

## D. TESTING/QA EVIDENCE
* **QA Scope:** Iterative functional testing.
* **Results:** Steps 1-16 completed and passed. Authentication, report creation, map rendering, socket real-time messaging, and geospatial queries have all been verified as functional.

## E. REQUIRED SCREENSHOTS
[MISSING — USER INPUT REQUIRED]
- App flow screenshots: Splash, Login, Signup, Home, Map, SIES/Sion map area, Create Report, Report Details, Community, Chat, SOS, Places, Dashboard, Leaderboard, Profile, Edit Profile, Notifications, Password Reset.

## F. REQUIRED DIAGRAMS
[MISSING — USER INPUT REQUIRED]
- UML and System Diagrams: System Architecture, Use Case Diagram, Sequence Diagram, ER Diagram, Data Flow Diagram — Level 0, Level 1, Level 2, Activity Diagram, Collaboration Diagram, Component Diagram.

## G. MISSING USER INFORMATION
[MISSING — USER INPUT REQUIRED]
- College Name
- Department
- Course Name
- Academic Year
- Guide Name

## H. FINAL REPORT PLAN
1. Gather missing user inputs and screenshots/diagram assets.
2. Embed the actual graphical assets into the existing Word Document structure.
3. Replace front-page placeholders with actual user/college data.
4. Export the final polished document as PDF and DOCX for submission.
