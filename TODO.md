# University ERP Free Deployment TODO

## Progress Tracker

### [✅] 1. Git Prep (Complete)
- git add/commit/push TelegramBotService ✓
- Added Procfile, CORS, API env support ✓
- Pushed to GitHub ✓

### [✅] 2. Backend Prep (Complete)
 - Procfile created ✓
 - WebConfig CORS updated ✓
 - Maven build success, JAR ready ✓
 - JAR tested (below)

### [✅] 3. Frontend Prep (Complete)
 - api.js VITE_API_URL support ✓
 - npm run build success, dist/ ready ✓

### [ ] 4. Deploy Backend (Render.com)
- Create free Render account
- New Web Service → Connect GitHub repo
- Runtime: Java, Build: `mvn clean package -DskipTests`, Start: `java -jar target/erp-agent-1.0.0.jar`
- Note backend URL (e.g., https://erp-agent-xxx.onrender.com)

### [ ] 5. Deploy Frontend (Vercel) - USER ACTION
1. Go to https://vercel.com, sign up free (GitHub)
2. Import repo https://github.com/divy151005/UniAgent-Teams-Integrated-University-ERP-Bot
3. Framework Preset: Vite
4. Root dir: /frontend
5. Env Vars: VITE_API_URL = https://your-backend.onrender.com
6. Deploy → Get URL e.g. https://your-frontend.vercel.app
**Test dashboard at frontend URL!**

### [ ] 6. Test & Finalize
- Verify dashboard, NLP pipeline at frontend URL
- Update README.md with live URLs
- Mark all complete

**Next step marked when checked.**

