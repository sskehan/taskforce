# TaskForce v1.01

Home jobs, sorted. A shared household jobs and reminders app for Shaun and Lyndsey, replacing the Household Chores list in Microsoft To Do.

- **Jobs** repeat on a fixed schedule (cleaning, sheets) or from when they were last done (charging, worming, car cleans).
- **Items** that wear out (CPAP parts) track when they were fitted, with **Still good** to push a replacement back without losing the history.
- Everything To Do does: steps, My Day, important star, due dates, repeats, assign to a person, notes, photo, who added it.
- Plus: home score, overdue catch-up without piles of copies, per-job reminder repeats, full history of who did what.

The app is a web app hosted on GitHub Pages. Data lives in Firebase (free plan) and syncs live between both phones. Push reminders come from a small job that GitHub runs every hour for free.

Until `firebase-config.js` is filled in, the app runs in **demo mode** with your starter list on that phone only, so you can try it straight away.

---

## Setup (all from your phone)

Allow about 30 minutes. Use Chrome on your phone for each step.

### 1. Put the files on GitHub
1. Create a new **public** repository called `taskforce`.
2. On a PC: unzip, then drag **everything inside** the unzipped folder (including the `icons`, `reminders` and `.github` folders) onto the repo's **Add file > Upload files** page, and commit. Dragging from a PC keeps the folders.
3. **Settings > Pages**: Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)`, Save.
   Your app will be at **https://sskehan.github.io/taskforce/**. Open it now: it starts in demo mode.

### 2. Create the Firebase project
1. Go to **console.firebase.google.com** > **Add project** > name it `TaskForce` > turn Google Analytics off > Create.
2. On the project home page tap the **web icon `</>`**, nickname `TaskForce`, don't tick Hosting, **Register app**.
   Copy the values shown (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`) into `firebase-config.js` on GitHub (open the file, tap the pencil, paste, commit).

### 3. Sign-ins
1. **Build > Authentication > Get started > Email/Password** > Enable > Save.
2. **Users** tab > **Add user**: your email and a password. Then the same for Lyndsey.
3. Put both emails in `firebase-config.js` (the `people` list).
4. **Authentication > Settings > Authorised domains > Add domain**: `sskehan.github.io`.

### 4. Database
1. **Build > Firestore Database > Create database**. Location: **australia-southeast1 (Sydney)**. Start in **production mode**.
2. **Rules** tab: replace everything with the text of `firestore.rules`, put your two emails in where it says PASTE, then **Publish**.

### 5. Push reminders
1. **Project settings (cog) > Cloud Messaging > Web Push certificates > Generate key pair**. Copy the key into `vapidKey` in `firebase-config.js`.
2. **Project settings > Service accounts > Generate new private key** > Generate. A `.json` file downloads.
   Open it (e.g. in Files, open with a text viewer) and copy **all** of its text.
3. On GitHub: repo **Settings > Secrets and variables > Actions > New repository secret**.
   Name: `FIREBASE_SERVICE_ACCOUNT`. Secret: paste the text. Add secret.
   Then delete the downloaded `.json` file from your phone; it's a key to your database.

### 6. Install and load your jobs
1. Open **https://sskehan.github.io/taskforce/** in Chrome > menu > **Add to Home screen / Install**.
   (If Chrome says it's already installed and won't open it, use Samsung Internet like you did for Our Tax.)
2. Sign in. Tap the **S/L avatars** (top right) > **Load my starter list (22 jobs)**. Only do this on one phone.
3. Still in Settings, **Push reminders > Turn on** and allow notifications. Lyndsey does this on her phone too.
4. Test it: GitHub app or site > **Actions > TaskForce reminders > Run workflow**, tick *Send a test notification*, Run. Both phones should buzz within a minute or two.

---

## How reminders work
- Every hour (at about 7 past) GitHub runs `reminders/send.mjs`. It checks each job's reminder settings and sends a push to whoever the job is assigned to (**Either** = both of you).
- Reminders go out at the job's reminder time (default 6pm), or soon after. If a job isn't done, it reminds again on the schedule you chose (daily, every 2 days, and so on).
- If more than three jobs need someone at once, they get one summary notification instead of a flood.
- Notification buttons: **Done / Replaced** opens the app and ticks it off (with Undo). **Still good** opens the extend sheet.
- GitHub pauses hourly jobs in repos that have had no changes for 60 days. The *Keep reminders switched on* job makes a tiny monthly commit so that never happens.

## Backups
Settings > **Back up to a file** saves everything (jobs, history, settings) as a `.json` file. **Restore from a backup file** brings it back.

## Updating
Change files on GitHub as usual. The app picks up the new version next time it's opened with signal. Version numbers: 1.0, 1.01 (more reliable install), 1.02…

## Files
| File | What it is |
|---|---|
| `index.html`, `styles.css`, `app.js` | The app |
| `logic.js` | Due dates, repeats and reminder rules (shared by app and reminder job) |
| `store.js` | Saving and syncing (Firebase, or demo mode) |
| `seed.js` | Starter list from To Do and default categories |
| `firebase-config.js` | Your Firebase settings and the two people |
| `sw.js` | Offline support and push notifications |
| `reminders/` | The hourly reminder job |
| `icons/` | App icon and notification badge |
| `.github/workflows/` | When GitHub runs the reminder and keep-alive jobs |
| `firestore.rules` | Who can read and change data (only the two of you) |
