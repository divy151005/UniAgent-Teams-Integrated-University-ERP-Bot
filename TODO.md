# University ERP Free Deployment TODO

## Progress Tracker

### [ ] 1. Git Prep
- git add untracked files (TelegramBotService.java etc.)
- git commit -m "Add deployment prep changes"
- git push origin main

### [ ] 2. Backend Prep
- Create Procfile: `web: java -jar target/erp-agent-1.0.0.jar`
- Update WebConfig.java: Add prod CORS (render.com, vercel.app)
- Local Maven build: `cd backend && mvn clean package -DskipTests`
- Test JAR: `java -jar backend/target/erp-agent-1.0.0.jar`

### [ ] 3. Frontend Prep
- Update vite.config.js: Env-based proxy/API base
- Update src/services/api.js: Use VITE_API_URL
- Test local build: `cd frontend && npm run build`

### [ ] 4. Deploy Backend (Render.com)
- Create free Render account
- New Web Service → Connect GitHub repo
- Runtime: Java, Build: `mvn clean package -DskipTests`, Start: `java -jar target/erp-agent-1.0.0.jar`
- Note backend URL (e.g., https://erp-agent-xxx.onrender.com)

### [ ] 5. Deploy Frontend (Vercel)
- Create free Vercel account
- Import GitHub repo
- Env var: VITE_API_URL = [backend URL]
- Framework: Vite
- Note frontend URL

### [ ] 6. Test & Finalize
- Verify dashboard, NLP pipeline at frontend URL
- Update README.md with live URLs
- Mark all complete

**Next step marked when checked.**

