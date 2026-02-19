///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Google Apps Script deployment guide for RBAC
// Outcome: Step-by-step instructions to deploy Apps Script as web app
// Short Description: Setup guide for connecting Google Sheets auth backend
/////////////////////////////////////////////////////////////

# Google Apps Script — Setup Guide

## Step 1: Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Rename it to **"ABA Assessments — Users DB"**
4. The script will auto-create the "Users" sheet with headers on first run

## Step 2: Add Apps Script
1. In the Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code in `Code.gs`
3. Copy-paste the contents of `apps-script/Code.gs` into the editor
4. Click **Save** (Ctrl+S)

## Step 3: Deploy as Web App
1. Click **Deploy → New deployment**
2. Click the gear icon next to "Select type" → choose **Web app**
3. Fill in:
   - **Description**: ABA Auth API
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Authorize** the script when prompted (review permissions)
6. Copy the **Web app URL** — it looks like:
   ```
   https://script.google.com/macros/s/XXXXXXX/exec
   ```

## Step 4: Configure Frontend
1. Open `src/lib/sheets-auth.ts` in the project
2. Replace the `APPS_SCRIPT_URL` value with your Web app URL

## Step 5: Test
Send a test request:
```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"action":"register","email":"test@example.com","password":"Test@1234","role":"Parent","firstName":"Test","lastName":"User"}'
```

## Re-deploying After Changes
If you update `Code.gs`:
1. Go to **Deploy → Manage deployments**
2. Click the **pencil icon** on your deployment
3. Change **Version** to "New version"
4. Click **Deploy**

## Notes
- The script runs under your Google account's quota limits
- Free tier: ~20,000 requests/day
- Session tokens are stored in the Sheet and validated on each authenticated request
- Passwords are hashed with SHA-256 before storage (never stored in plain text)
