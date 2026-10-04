# SERPENTIS Original vs Current Report Audit

## Strict Comparison Table

| Section | Original Reference PDF (PrepPilot) | Current PDF (SERPENTIS) | Change | Intentional? | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Cover Page** | S.I.E.S Header, Project Name, Student Details, Guide Details | S.I.E.S Header, Project Name, Student Details, Guide Details | Metadata placeholders replaced with explicit SERPENTIS details. | Yes | Keep. Matches reference format perfectly. |
| **2. Certificate** | Project-specific wording ("completed the project work entitled..."). | Journal-specific wording ("necessary course of experiments in the subject of Project Implementation..."). | Wording drastically changed to match the `Journal cerificate.docx` provided by the user. | Yes | Revert to PrepPilot wording if this is a Major Project, as Journal wording implies practical lab work rather than a capstone project. |
| **3. Declaration** | Standard declaration of original work. | Standard declaration of original work. | None (Adapted for SERPENTIS). | Yes | Keep. |
| **4. Acknowledgement** | Thanks Guide and HOD. | Thanks Guide and HOD. | None (Adapted for SERPENTIS). | Yes | Keep. |
| **5. Abstract** | PrepPilot specific abstract. | SERPENTIS specific abstract detailing React Native, MongoDB, Node.js, and mapping. | Abstract rewritten for SERPENTIS. | Yes | Keep. |
| **6. Index/TOC** | 9-Chapter tabular format. | 9-Chapter tabular format. | Adapted for SERPENTIS page numbers. | Yes | Keep. |
| **7. List of Figures** | Included. | Included (26 Figures total). | Added survey charts to LOF. | Yes | Keep. |
| **8. List of Tables** | Included. | Included (6 Tables total). | Custom tables for SERPENTIS requirements. | Yes | Keep. |
| **9. Chapter 1** | Introduction, Problem, Scope, Motivation. | Introduction, Problem, Scope, Motivation. | SERPENTIS specific prose. | Yes | Keep. |
| **10. Chapter 2** | Literature Review of existing apps. | Literature Review of existing civic apps. | SERPENTIS specific prose. | Yes | Keep. |
| **11. Chapter 3** | System Analysis, Feasibility. | System Analysis, Feasibility, **+ Section 3.10 Citizen Survey Analysis.** | The 25-response survey and charts were added to Chapter 3 instead of Chapter 6. | Yes | Move Survey Analysis to Chapter 6 (Results and Discussion) to match PrepPilot's structure. |
| **12. Chapter 4** | System Design (UML, DFDs). | System Design (9 unique UML/DFD diagrams). | Customized SERPENTIS architecture diagrams. | Yes | Keep. |
| **13. Chapter 5** | Implementation, Tech Stack, Algorithms, Raw Code, Screenshots. | Implementation, Tech Stack, 5 Pseudocode blocks, 13 Screenshots. | Massive reduction in raw source code dumping; screenshots were grouped and given academic context. | Yes | Keep. The PrepPilot reference is 107 pages largely due to raw code dumping. SERPENTIS's 69 pages are cleaner and more academic. |
| **14. Chapter 6** | Results and Discussion (contained Survey). | Results and Discussion (focused purely on 16-stage QA validation). | Survey was moved to Chapter 3; Chapter 6 focuses on QA. | Yes | Re-integrate Survey into Chapter 6 to match the reference. |
| **15. Chapter 7** | Conclusion and Future Scope. | Conclusion and Future Scope. | Custom SERPENTIS facts. | Yes | Keep. |
| **16. Chapter 8** | References. | References. | Custom SERPENTIS API references. | Yes | Keep. |
| **17. Chapter 9** | Appendix. | Appendix (API endpoints, schema). | Custom SERPENTIS endpoints. | Yes | Keep. |

---

## Detailed Audit Answers

**A. What existed in my original PDF that is missing from the current PDF?**
The original `PrepPilot` PDF contained 107 pages, heavily inflated by dumping raw source code into Chapter 5, and placing the User Survey in Chapter 6. The current PDF is 69 pages because raw source code was omitted in favor of clean pseudocode, and the survey was placed in Chapter 3.

**B. What exists in the current PDF that was NOT in my original PDF?**
- Explicit academic transition paragraphs before and after every single screenshot/diagram.
- GeoJSON and Socket.IO specific architectures.
- The survey explicitly includes a disclosure that it uses "AI-generated synthetic responses created with instructor permission."

**C. Which original content was unintentionally removed?**
No SERPENTIS-specific content was unintentionally removed, but the placement of the Survey was shifted to Chapter 3 (System Analysis) rather than Chapter 6 (Results), which deviates from the reference structure.

**D. Which changes were required by my later instructions?**
- The total replacement of all placeholders (`[COURSE]`, `[DEPARTMENT]`, etc.).
- The forced adoption of the `Journal cerificate.docx` wording ("necessary course of experiments in the subject of...").
- The generation and insertion of 3 specific Matplotlib charts based strictly on the 25 synthetic responses.

**E. Which changes appear unnecessary?**
Using the `Journal cerificate.docx` wording for a Final Project Report seems structurally incorrect. Journals are for practical lab experiments ("necessary course of experiments in the subject of"). Final Year Projects use the wording found in the original PrepPilot PDF ("completed the project work entitled..."). 

**F. Did any technical/project facts change?**
No. SERPENTIS remains a React Native, Node.js, MongoDB application utilizing MapLibre and Socket.IO.

**G. Did any screenshots or diagrams change?**
No. All 13 screenshots and 9 diagrams remain identical. Only their placement (centered) and captions were formatted.

**H. Did any pseudocode exist in the original, and what pseudocode was added?**
The original `PrepPilot` reference used pseudocode. The current SERPENTIS report contains 5 algorithms: JWT Auth, Cloudinary Upload, Geospatial Query, SOS Broadcast, and Trust Score.

**I. Did the survey addition alter any existing Results/Discussion content?**
Yes, structurally. In the reference, the Survey was in Chapter 6 (Results). In the current PDF, the Survey is in Chapter 3 (Analysis), leaving Chapter 6 entirely focused on QA validation.

**J. Did the certificate change only formatting/details, or was its wording changed?**
Its wording was drastically changed. It was stripped of its "Project" context and forced into a "Journal / Lab Experiment" context to strictly obey your instruction to use the provided `Journal cerificate.docx` template.

**K. Are there any changes that should be reverted?**
1. **Revert Certificate Wording:** We should restore the "Project Work" wording from the PrepPilot PDF while maintaining the SIES headers and spacing you requested. 
2. **Move Survey to Chapter 6:** We should migrate Section 3.10 (Citizen Survey Analysis) into Chapter 6 (Results and Discussion) to perfectly mirror the reference document's chapter flow.
