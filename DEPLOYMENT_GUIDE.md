# SkillMentor Full-Stack Cloud Deployment Guide (Phase 0)

Deploy **SkillMentor** using **Docker Container Images** and direct CLI deployments:
- **Database**: [Aiven for MySQL](https://aiven.io) (Managed MySQL 8 with SSL)
- **Backend**: [Render](https://render.com) (Deploys pre-built Docker image from Docker Hub)
- **Frontend**: [Vercel](https://vercel.com) (Deployed via Vercel CLI or Web)

---

## Architecture Overview

```
[ User Browser ]
       |
       | HTTPS (React UI)
       v
[ Vercel Frontend ] (skillmentor.vercel.app)
       |
       | REST API (HTTPS) + STOMP WebSockets (WSS)
       v
[ Render Web Service ] (Deploys Docker Image: <username>/skillmentor-backend:latest)
       |
       | MySQL Protocol with SSL (sslMode=REQUIRED)
       v
[ Aiven MySQL Cloud DB ] (mysql-xxxxx.aivencloud.com:port)
```

---

## STEP 1: Provision Aiven MySQL Cloud Database [COMPLETED & VERIFIED]

Your Aiven Cloud MySQL database is **already provisioned, connected, and fully initialized**:
- **Host**: `skillmentor-mysql-skillmentor-v1.j.aivencloud.com`
- **Port**: `11053`
- **Database**: `defaultdb`
- **User**: `avnadmin`
- **Password**: Set this privately in Render and your local environment; do not commit it.
- **Spring JDBC URL**:
  ```
  jdbc:mysql://skillmentor-mysql-skillmentor-v1.j.aivencloud.com:11053/defaultdb?sslMode=REQUIRED
  ```

> [!TIP]
> **Status: 100% Initialized & Verified!**
> All 13 database tables (`users`, `mentorship_sessions`, `wallets`, `peer_requests`, `reviews`, `user_skills`, etc.) have already been created on your Aiven database via SSL, and demo accounts (Nitesh Kumar, Adarsh Porwal, Rajeev Sherma, etc.) are seeded and ready.

---

## STEP 2: Build & Push Backend Docker Image to Docker Hub

You can build and push the container image directly from your local PowerShell without needing GitHub:

### 1. Log in to Docker Hub
Open your terminal and run:
```powershell
docker login
```
Enter your **Docker Hub username** and **password / Personal Access Token**.

### 2. Build the Multi-Stage Docker Image
From the root project directory (`skillmentor`), run:
```powershell
docker build -t <your-dockerhub-username>/skillmentor-backend:latest ./skillmentor-backend
```
*(Replace `<your-dockerhub-username>` with your actual Docker Hub username, e.g., `niteshkdev/skillmentor-backend:latest`)*

The multi-stage build will:
1. Compile the Spring Boot application using Maven 3.9 + Java 17.
2. Package the optimized executable JAR.
3. Bundle it into a lightweight, secure Eclipse Temurin JRE 17 runtime container (~155 MB).

### 3. Push Image to Docker Hub
```powershell
docker push <your-dockerhub-username>/skillmentor-backend:latest
```

Once finished, your image is publicly or privately available on Docker Hub!

---

## STEP 3: Deploy Backend to Render from Docker Image

You do **NOT** need to connect GitHub to Render. Render can deploy directly from your Docker Hub image:

1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** (top right) -> **Web Service**.
3. Click the tab: **"Deploy an existing image from a registry"** (or **Existing image**).
4. Enter your Image URL:
   ```
   docker.io/<your-dockerhub-username>/skillmentor-backend:latest
   ```
   *(If your repository on Docker Hub is private, click **Add Credentials** and enter your Docker Hub username and access token).*
5. Click **Next**.
6. **Configure Service Details**:
   - **Name**: `skillmentor-backend`
   - **Region**: Choose the region closest to your Aiven MySQL database.
   - **Instance Type**: **Free**
7. **Set Environment Variables**:
   Under the **Environment Variables** section, click **Add Environment Variable** for each:

   | Key | Value | Description |
   |---|---|---|
   | `PORT` | `8080` | Container port |
   | `SPRING_DATASOURCE_URL` | `jdbc:mysql://skillmentor-mysql-skillmentor-v1.j.aivencloud.com:11053/defaultdb?sslMode=REQUIRED` | Aiven JDBC URL with SSL |
   | `SPRING_DATASOURCE_USERNAME` | `avnadmin` | Aiven DB user |
   | `SPRING_DATASOURCE_PASSWORD` | `<your-aiven-password>` | Aiven DB password |
   | `JWT_SECRET` | `<generate-a-long-random-secret>` | 256-bit JWT secret |
   | `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:5173` | Allowed frontend domains |
   | `APP_SEED_ENABLED` | `true` | Auto-seed initial demo accounts |
   | `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` | Auto-create tables in Aiven |
   | `RAZORPAY_KEY_ID` | `<your-test-key-id>` | Sandbox key |
   | `RAZORPAY_KEY_SECRET` | `<your-test-key-secret>` | Sandbox secret |

8. Click **Create Web Service**.
9. Render will pull your Docker image and launch the container in seconds.
   - Once running, copy your Render backend URL:
     `https://skillmentor-backend.onrender.com`
   - Health check: Open `https://skillmentor-backend.onrender.com/v3/api-docs` in your browser.

---

## STEP 4: Deploy Frontend to Vercel

You can deploy the frontend directly from your local terminal using the **Vercel CLI** (no GitHub required!):

### Method A: Deploy using Vercel CLI (Fastest, No GitHub needed)

1. Open PowerShell and navigate to the frontend folder:
   ```powershell
   cd skillmentor-frontend
   ```
2. Run Vercel CLI:
   ```powershell
   npx vercel
   ```
3. Follow the interactive prompts:
   - `Set up and deploy?`: **Yes (`Y`)**
   - `Which scope?`: Select your Vercel personal account.
   - `Link to existing project?`: **No (`N`)**
   - `Project name`: `skillmentor` (or press Enter)
   - `Directory located`: `./` (press Enter)
   - `Want to modify settings?`: **No (`N`)**
4. Set the backend API URL environment variable in Vercel:
   ```powershell
   npx vercel env add VITE_API_BASE_URL production
   ```
   When prompted for value, enter:
   `https://skillmentor-backend-latest.onrender.com/api`
5. Deploy to Production:
   ```powershell
   npx vercel --prod
   ```
6. Vercel will build and output your live production URL:
   `https://skillmentor.vercel.app`

---

### Method B: Deploy using Vercel Web Dashboard (If preferred)

1. Go to [vercel.com](https://vercel.com) -> **Add New...** -> **Project**.
2. If using GitHub, import the repository.
3. In Project Settings:
   - **Root Directory**: `skillmentor-frontend`
   - **Framework Preset**: `Vite`
4. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://skillmentor-backend-latest.onrender.com/api`
5. Click **Deploy**.

---

## STEP 5: Final Handshake & Verification

1. **Update Render CORS Allowed Origins**:
   - In your Render dashboard under `skillmentor-backend` -> **Environment**:
   - Update `CORS_ALLOWED_ORIGINS` to include your exact Vercel domain:
     ```
     https://skillmentor.vercel.app,https://*.vercel.app,http://localhost:5173
     ```
   - Click **Save Changes** (takes ~10 seconds).

2. **Verification Checklist**:
   - [x] Open your Vercel URL: `https://skillmentor.vercel.app`
   - [x] Sign in with demo student account:
     - **Email**: `student@jssaten.ac.in`
     - **Password**: `password123`
   - [x] Test **Smart Reciprocal Skill Matcher**:
     - Verify it lists reciprocal peer matches at **0 Credits (Free Mutual Swap)**.
     - Book a session and verify it does NOT deduct credits.
   - [x] Test **Live Chat (STOMP WebSockets)**:
     - Open chat on an active session. The green **Live** badge will illuminate through Render WSS.
   - [x] Test **Student Help Requests**:
     - Complete a request and confirm wallet balance updates correctly.

---

## Updating Your Application in the Future

Whenever you make code changes and want to update the live app:

1. **Update Backend**:
   ```powershell
   # Rebuild and push Docker image
   docker build -t <your-dockerhub-username>/skillmentor-backend:latest ./skillmentor-backend
   docker push <your-dockerhub-username>/skillmentor-backend:latest
   ```
   In Render Dashboard, click **Manual Deploy** -> **Deploy latest image**. Render pulls the new image and deploys with zero downtime!

2. **Update Frontend**:
   ```powershell
   cd skillmentor-frontend
   npx vercel --prod
   ```
