# Standalone Customer Reward & Loyalty System
*(ग्राहक रिवॉर्ड पॉइंट सिस्टम - सेपरेट कॉपी)*

A completely isolated, lightweight, and production-ready **Customer Reward & Loyalty System**. 
Designed specifically to be deployed or integrated whenever a customer requests reward points, discounts, and WhatsApp notifications.

---

## 🌟 Key Features

1. **Automatic Points Earning**:
   - Calculates 1 Reward Point for every ₹500 (or customizable rate) on Debit entries and Sales.
   
2. **Strict Minimum 5 Points Redemption**:
   - Customers must redeem at least 5 points at a time.
   - Each redeemed point provides ₹80 (or configured rate) discount on the bill.

3. **WhatsApp Reward Notification**:
   - 1-click **"Send Message (WhatsApp)"** button pre-fills a formatted reward update:
     ```text
     🎉 *REWARD POINTS UPDATE*
     Dear Ashok Garg,

     *YOU GOT 1 REWARD POINT!* 🌟
     Against your purchase of ₹500.00

     ⭐ *Your Current Point Balance:* 6 Points
     💰 *Total Redemption Value:* ₹480.00
     ℹ️ Redeemable at ₹80/point (Min 5 points required)

     Thank you for your valuable business!
     — Our Business
     ```

4. **Complete Settings Panel**:
   - Master toggle to turn the entire system ON or OFF.
   - Live settings for ₹ per Point, Redemption Value per Point, and Minimum Points to Redeem.

5. **Manual Adjustments with Audit Log**:
   - Store owners can manually award bonus points or deduct points with audit reasons.

---

## 📁 Directory Structure

```text
Reward/
├── INTEGRATION_GUIDE.md          # 5-minute guide to plug into other apps
├── README.md                     # This documentation
├── package.json
├── vite.config.ts
├── index.html
├── src/
│   ├── loyalty/                  # ⭐ 100% ISOLATED PLUG-AND-PLAY MODULE
│   │   ├── types.ts              # Clean TypeScript definitions
│   │   ├── loyaltyEngine.ts      # Pure business logic calculations
│   │   ├── components/
│   │   │   ├── RewardSettingsCard.tsx      # Settings card component
│   │   │   ├── CustomerLoyaltyCard.tsx     # Points balance & WhatsApp sender
│   │   │   ├── RewardRedeemModal.tsx       # Bill redemption modal
│   │   │   ├── RewardBadge.tsx             # Star badge for lists
│   │   │   └── ManualPointsAdjustModal.tsx # Manual adjustments modal
│   │   └── index.ts              # Single export file
│   ├── components/               # Clean demo app UI (Customers, Entries, Settings)
│   ├── context/                  # Clean state manager
│   ├── utils/                    # Local storage persistence
│   ├── App.tsx                   # Main demo app shell
│   └── main.tsx                  # React entry point
```

---

## 🚀 How to Run the Standalone App

```bash
# 1. Open this folder
cd F:\kaam\Project\Reward

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open `http://localhost:5174` in your browser to test and demonstrate the Reward System live.

---

## 🛠️ How to Deliver on Customer Demand

- **If customer wants a standalone Reward Khata**: Deliver this standalone application as-is.
- **If customer wants this feature added to their existing app**: Copy `src/loyalty/` into their project and follow `INTEGRATION_GUIDE.md`.
