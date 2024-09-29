# Non-Conformance App

## Overview

The Non-Conformance App allows users to record non-conformance reports by analyzing a text description of an event. The app uses AI to extract key information from the user's input and stores each report for future reference. The app features a dark theme for a comfortable viewing experience in low-light environments.

## User Journey

### 1. Sign In

1. Open the app.
2. Click on **"Sign in with ZAPT"**.
3. Choose a sign-in method (Google, Facebook, Apple, or Magic Link).
4. Complete the authentication process.
5. You are redirected to the home page of the app.

### 2. Submit a New Report

1. On the home page, locate the **"New Report"** section.
2. In the text area provided, describe the non-conformance event in detail.
3. Click the **"Analyze Text"** button.
   - The button will show a loading state while the AI processes the input.
4. Review the extracted data displayed below the buttons.
5. If satisfied, click the **"Save Report"** button.
   - The report is saved, and the input field is cleared.
6. The new report appears in the **"Your Reports"** section.

### 3. View Saved Reports

1. Scroll to the **"Your Reports"** section on the home page.
2. Browse through the list of saved reports.
   - Details Displayed:
     - **What happened**
     - **When it happened**
     - **Who was involved**
     - **Outcome**
     - **Next steps**

### 4. Sign Out

1. Click the **"Sign Out"** button at the top-right corner.
2. You are signed out and redirected to the login page.

## Features

- **Dark Theme:** The app uses a dark color scheme for easy reading in low-light conditions.
- **Authentication:** Secure login using ZAPT authentication with multiple providers.
- **AI Analysis:** AI extracts key information from a textual description.
- **Data Persistence:** Reports are saved and associated with your account.
- **Responsive Design:** The app works well on all screen sizes.
- **User-Friendly Interface:** Intuitive and accessible UI components.
- **Loading States:** Visual feedback during data processing and API calls.
- **Error Handling:** Informative messages are displayed if errors occur during saving or fetching reports.

## Notes

- Ensure all required fields are filled when submitting a report.
- The app prevents multiple submissions while processing.
- All reports are private and tied to your authenticated account.
- If an error occurs while saving a report, an error message will be displayed.