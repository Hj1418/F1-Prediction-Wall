# F1 Community Prediction League - Google Apps Script Backend

This directory contains the serverless backend implementation designed for Google Sheets & Google Apps Script.

## 📁 Files

- `Code.gs`: The primary API engine handling `doGet`, `doPost`, server-side deadline validation, duplicate driver checks, score calculation, and leaderboard queries.
- `SetupSheet.gs`: Automated database initializer that generates all 8 relational tables with exact column headers and styling.

---

## 🚀 5-Minute Setup Guide

### Step 1: Create a Google Spreadsheet
1. Go to [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name it: `F1 Prediction League Database`.

### Step 2: Open Google Apps Script
1. In the top menu, click **Extensions > Apps Script**.
2. Rename the project from `Untitled project` to `F1 Prediction API`.

### Step 3: Add the Scripts
1. Delete any boilerplate code in `Code.gs` and paste the contents of [`Code.gs`](./Code.gs).
2. Click **+ (Add a file)** > **Script**, name it `SetupSheet`, and paste the contents of [`SetupSheet.gs`](./SetupSheet.gs).

### Step 4: Initialize the Database Tables
1. In the toolbar dropdown, select the function `initializeDatabase`.
2. Click **Run**.
3. Grant the required permissions when prompted.
4. Check your Google Sheet: All 8 tables (`Users`, `RaceWeekends`, `Sessions`, `PredictionRounds`, `Predictions`, `Results`, `Scores`, `Achievements`) will now be created with colored, frozen header rows.

### Step 5: Deploy as Web App
1. In the top right corner, click **Deploy > New deployment**.
2. Click the **gear icon (Select type)** and choose **Web app**.
3. Configure the deployment settings:
   - **Description**: `F1 Community API v1`
   - **Execute as**: `Me (your_email@gmail.com)`
   - **Who has access**: `Anyone` *(Crucial: Allows the frontend to make requests without Google OAuth popups for public reads)*
4. Click **Deploy**.
5. Copy the generated **Web App URL** (e.g., `https://script.google.com/macros/s/AKfycbx.../exec`).

### Step 6: Connect to the Frontend
Create a `.env` file in the root of the React project:
```env
VITE_API_URL=https://script.google.com/macros/s/AKfycbx.../exec
```
*(If left empty or running locally without this env variable, the frontend automatically falls back to the built-in Mock Engine with zero configuration!)*
