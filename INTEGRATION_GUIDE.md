# Plug-and-Play Integration Guide: Reward Points & Loyalty System

This guide explains how to quickly integrate the **Reward Points & Loyalty System** into any existing React, Next.js, or Vite application whenever a customer demands this feature.

---

## 📦 What is Inside `src/loyalty/`?

The `src/loyalty/` directory is 100% self-contained. It contains:

| File | Purpose |
| :--- | :--- |
| `types.ts` | Clean TypeScript interfaces (`LoyaltySettings`, `LoyaltyCustomer`, `LoyaltyTransaction`). |
| `loyaltyEngine.ts` | Pure business logic functions: `calculatePointsEarned`, `calculateDiscountValue`, `validatePointsRedemption`, `formatWhatsAppLoyaltyMessage`, `openWhatsAppChat`. |
| `components/RewardSettingsCard.tsx` | Complete settings card with master ON/OFF toggle, earning threshold (₹/pt), redemption rate (₹/pt), and minimum redeemable points restriction. |
| `components/CustomerLoyaltyCard.tsx` | Customer profile loyalty card displaying points balance, ₹ value, 1-click **WhatsApp notification button**, and manual adjustment trigger. |
| `components/RewardRedeemModal.tsx` | Points redemption modal for billings & transactions enforcing minimum points (default: 5). |
| `components/RewardBadge.tsx` | Reusable `⭐ X Pts` badge for lists & tables. |
| `components/ManualPointsAdjustModal.tsx` | Modal allowing store owners to manually add or deduct points with audit notes. |
| `index.ts` | Clean single-entry export for all types, functions, and components. |

---

## 🚀 5-Minute Step-by-Step Integration

### Step 1: Copy the `src/loyalty` Folder
Copy `src/loyalty/` directly into your target project's `src/` directory:
```bash
cp -r src/loyalty /path/to/target-project/src/loyalty
```

---

### Step 2: Update Your Data Models / Types

In your existing `Party` or `Customer` type, add:
```typescript
interface Customer {
  // your existing fields...
  loyaltyPoints?: number; // Current accumulated points balance
}
```

In your existing `BusinessProfile` or `Settings` type, add:
```typescript
import { LoyaltySettings } from './loyalty';

interface AppSettings {
  // your existing settings...
  loyalty: LoyaltySettings;
}
```

In your existing `Transaction` or `Invoice` type, add:
```typescript
interface Transaction {
  // your existing fields...
  pointsEarned?: number;   // Points earned from this purchase
  pointsRedeemed?: number; // Points redeemed for discount
}
```

---

### Step 3: Add the Settings Card to Your Settings Page

```tsx
import { RewardSettingsCard } from '@/loyalty';

export function SettingsPage() {
  const [loyaltySettings, setLoyaltySettings] = useState(myProfile.loyalty);

  return (
    <div>
      <RewardSettingsCard
        settings={loyaltySettings}
        onChange={(updated) => {
          setLoyaltySettings(updated);
          saveSettings(updated);
        }}
      />
    </div>
  );
}
```

---

### Step 4: Add the Loyalty Card to Customer Details

```tsx
import { CustomerLoyaltyCard, ManualPointsAdjustModal } from '@/loyalty';

export function CustomerDetailsPage({ customer, settings }) {
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  return (
    <div>
      {/* Shows balance, cash value, and 'Send Message' WhatsApp button */}
      <CustomerLoyaltyCard
        customer={customer}
        settings={settings}
        businessName="Your Shop Name"
        onOpenAdjustModal={() => setIsAdjustOpen(true)}
      />

      {isAdjustOpen && (
        <ManualPointsAdjustModal
          isOpen={isAdjustOpen}
          onClose={() => setIsAdjustOpen(false)}
          customer={customer}
          onAdjustPoints={(customerId, newPoints, reason) => {
            updateCustomerPoints(customerId, newPoints, reason);
          }}
        />
      )}
    </div>
  );
}
```

---

### Step 5: Add the Point Badge to Customer Lists

```tsx
import { RewardBadge } from '@/loyalty';

export function CustomerListItem({ customer }) {
  return (
    <div className="flex items-center gap-2">
      <span>{customer.name}</span>
      <RewardBadge points={customer.loyaltyPoints} />
    </div>
  );
}
```

---

### Step 6: Automatically Calculate Points on Transactions

In your transaction creation function (for Debit / You Gave / Invoices):
```typescript
import { calculatePointsEarned } from '@/loyalty';

// When creating a Debit (Sale) entry:
const pointsEarned = settings.enabled ? calculatePointsEarned(invoiceAmount, settings) : 0;

// Update customer points:
customer.loyaltyPoints = (customer.loyaltyPoints || 0) + pointsEarned - (pointsRedeemed || 0);
```

---

### Step 7: Redeem Points in Invoices or Entries

```tsx
import { RewardRedeemModal } from '@/loyalty';

export function BillingModal({ customer, settings, onApplyDiscount }) {
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsRedeemOpen(true)}>
        Redeem Points (Avail: {customer.loyaltyPoints} Pts)
      </button>

      <RewardRedeemModal
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
        availablePoints={customer.loyaltyPoints || 0}
        settings={settings}
        onConfirmRedeem={(pointsRedeemed, discountAmount) => {
          onApplyDiscount(pointsRedeemed, discountAmount);
        }}
      />
    </div>
  );
}
```

---

## 🎯 Business Rule Defaults

- **Earning Rule**: 1 Point for every ₹500 purchase (`rupeesPerPoint: 500`).
- **Redemption Rule**: 1 Point = ₹80 discount (`redemptionRate: 80`).
- **Minimum Redemption Rule**: Minimum 5 points required to redeem (`minPointsToRedeem: 5`).
- **WhatsApp Notification**: 1-click button formats `"YOU GOT 1 REWARD POINT..."` and opens WhatsApp directly with customer phone number.
