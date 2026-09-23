# SentinelGraph — Final Clean College Project Website

## What this version fixes
The previous interface had duplicated dashboard sections and conflicting styles, which caused text to become low-contrast and difficult to read. This version is rebuilt as one consistent interface.

### Direct opening
There is **no login page**. Open `index.html` and the main dashboard appears immediately.

### Main features
- Investigator dashboard with the full project description
- Criminal network graph
- Person/entity search and connections
- Explainable AI relationship & anomaly analysis
- Risk and suspicious-activity alerts
- Crime-data CSV upload and preview
- Location-based analysis
- Backend/API status
- SQLite database integration
- Responsive professional college-project UI

## Backend
Requires Node.js 18+.

```bash
cd backend
npm install
npm start
```

Then open:

`http://localhost:3000`

If the backend is not running, the frontend still works in demo mode.

## Demo scope
The included data is synthetic/demo data for academic presentation. The risk and AI analysis are transparent prototype heuristics, not a validated criminal-risk model. Do not use real sensitive law-enforcement records without appropriate authorization, security, privacy controls, audit logging and validated models.
