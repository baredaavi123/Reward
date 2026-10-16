# iPhone (iOS) App Installation & Build Guide

This project is fully configured to run as an **iPhone application**.

Unlike Android where any `.apk` file can be downloaded and installed immediately, Apple enforces strict security verification for iOS apps. Below are the **3 best methods** to run and install this app on an iPhone.

---

## ⚡ Method 1: Instant Standalone Install (Recommended & Easiest)
*No Mac, No Apple Developer account, and No sideloading tools required.*

iOS Safari has built-in native support for Progressive Web Apps (PWAs). The app is already configured with iOS icons, splash screen, and standalone full-screen mode:

1. **Host or Run the App**:
   - Host the built `dist/` folder on any free host (Vercel, Netlify, Cloudflare Pages, Firebase, or GitHub Pages), OR
   - Run `npm run dev -- --host` on your computer and connect to the local IP address on your iPhone (e.g. `http://192.168.1.X:5174`).
2. **Open Safari on iPhone**:
   - Visit the URL in Safari.
3. **Install to Home Screen**:
   - Tap the **Share button** at the bottom (the square with an arrow pointing up: ⬆️).
   - Scroll down and tap **"Add to Home Screen"** (*होम स्क्रीन पर जोड़ें*).
   - Tap **Add**.
4. **Result**:
   - The app appears directly on the iPhone home screen with the **Zewar For You / Reward logo**.
   - It opens in full-screen standalone mode with no browser URL bar, just like a native App Store app.

---

## 🍎 Method 2: Native iOS Project (`ios/App`) via Xcode (on Mac)
*Build an official `.ipa` or run directly on a physical iPhone.*

The native Xcode workspace has been generated in `ios/App/App.xcworkspace`:

1. Copy or push this project to a Mac.
2. Run in terminal:
   ```bash
   npm install
   npm run build:ios
   ```
3. Open the workspace in Xcode:
   ```bash
   npx cap open ios
   ```
   *(or double-click `ios/App/App.xcworkspace`)*
4. In Xcode:
   - Go to **Signing & Capabilities** -> Select your Apple Developer Account or personal Apple ID under **Team**.
   - Connect your iPhone via USB / Wi-Fi.
   - Click the **Play (▶ Run)** button to install and run the app directly on your iPhone.
5. **To Export an `.ipa` file**:
   - In Xcode menu, select **Product** -> **Archive**.
   - Once archived, click **Distribute App**.
   - Select **Ad Hoc**, **Development**, or **App Store Connect / TestFlight** to export your signed `.ipa`.

---

## ☁️ Method 3: Automated `.ipa` Build via GitHub Actions (Free Cloud Mac)
*Compile an `.ipa` file without owning a Mac computer.*

A ready-to-run GitHub Actions workflow has been configured at [`.github/workflows/build-ios.yml`](.github/workflows/build-ios.yml):

1. Initialize a git repository and push this project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for iOS build"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. On your GitHub repository page:
   - Go to the **Actions** tab.
   - Select **"Build iOS App (IPA)"** from the left sidebar.
   - Click **Run workflow**.
3. GitHub will run Xcode on a macOS runner, build the app, and generate `Reward.ipa`.
4. Download `Reward.ipa` from the **Artifacts** section at the bottom of the workflow run.

### How to Install the downloaded `.ipa` on an iPhone:
- **Using Sideloadly** (Windows & Mac - free): Download [Sideloadly](https://sideloadly.io), plug in your iPhone, drag-and-drop `Reward.ipa`, enter your Apple ID, and it installs straight to your phone.
- **Using AltStore**: Sideload with your free Apple ID via [AltStore](https://altstore.io).
- **Using TestFlight / Apple Developer**: Upload the archive directly to App Store Connect for TestFlight beta testing.
