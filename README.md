# Track — Expense Tracker

Production-ready **React Native (TypeScript)** expense tracker backed exclusively by **Firebase** (Auth, Firestore, Storage, FCM-ready notifications).

## Features

- Splash + email/password auth (register, login, forgot password, remember me, logout)
- Dashboard with balance, income/expense, savings, budget progress, charts, quick actions
- Transactions with search, filters, sort, pagination, pull-to-refresh, edit/delete
- Categories (defaults + CRUD with icon/color)
- Monthly / category budgets with overrun warnings
- Reports (daily / weekly / monthly / yearly) + shareable export summary
- Profile + settings (dark/light/system theme, currency, language, notification toggles)
- Receipt & profile image upload via Firebase Storage
- Redux Toolkit state, React Navigation v7, React Native Paper (Material 3)
- Offline-friendly Firestore sync + MMKV preferences
- Firestore & Storage security rules included

## Tech stack

| Layer | Choice |
| --- | --- |
| App | React Native 0.86 + TypeScript |
| UI | React Native Paper, Vector Icons, Linear Gradient, Chart Kit |
| State | Redux Toolkit |
| Forms | React Hook Form |
| Backend | Firebase Auth, Firestore, Storage |
| Push | FCM interface (`@react-native-firebase/messaging` optional) |
| Prefs | react-native-mmkv |

## Project structure

```text
src/
├── components/       # Reusable UI (cards, charts, forms, transactions)
├── constants/        # App + Firebase env constants
├── firebase/         # auth, firestore, storage, notifications
├── hooks/            # bootstrap, theme, analytics, image picker
├── navigation/       # Auth + Main tabs + nested stacks
├── redux/            # slices: auth, transactions, categories, budgets, settings, profile, notifications
├── screens/          # Splash, Auth, Dashboard, Transactions, Categories, Budget, Reports, Profile, Settings
├── services/         # toast, export
├── theme/            # light/dark Material 3 palette
├── types/            # shared TypeScript models
└── utils/            # formatters, validation, MMKV storage

firebase/
├── firestore.rules
├── storage.rules
└── firestore.indexes.json
```

## Prerequisites

- Node.js **≥ 22.13** (project engines; 22.11 may warn)
- Xcode (iOS) / Android Studio (Android)
- CocoaPods (iOS)
- A Firebase project

## 1. Install dependencies

```bash
cd Track
npm install
# iOS
cd ios && bundle install && bundle exec pod install && cd ..
```

Icon fonts live in `src/assets/fonts/`. Link them after clone or when fonts change:

```bash
npm run link:fonts
```

This copies fonts into Android/iOS native projects. Do **not** also use `react-native-vector-icons/fonts.gradle` — that causes duplicate resource errors on Android.

## 2. Configure Firebase

1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication → Email/Password**.
3. Create a **Cloud Firestore** database.
4. Enable **Storage**.
5. (Optional) Enable **Cloud Messaging** for push.

### Web app config (required for the JS SDK)

Register a Web app in Firebase and copy the config into `src/constants/env.ts`:

```ts
export const ENV = {
  FIREBASE_API_KEY: '...',
  FIREBASE_AUTH_DOMAIN: '...',
  FIREBASE_PROJECT_ID: '...',
  FIREBASE_STORAGE_BUCKET: '...',
  FIREBASE_MESSAGING_SENDER_ID: '...',
  FIREBASE_APP_ID: '...',
  FIREBASE_MEASUREMENT_ID: '...',
};
```

A template also lives in `.env.example`.

### Deploy security rules

```bash
# Install Firebase CLI if needed: npm i -g firebase-tools
firebase login
firebase init firestore storage   # point to firebase/*.rules
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Or paste `firebase/firestore.rules` and `firebase/storage.rules` into the console manually.

### Composite indexes

Deploy `firebase/firestore.indexes.json`, or create indexes when the app logs a Firestore index URL for:

- `transactions`: `uid` ASC + `date` DESC  
- `categories`: `uid` ASC + `name` ASC  

## 3. Run the app

```bash
npm start
npm run android
# or
npm run ios
```

## Firestore collections

### `users/{uid}`

| Field | Type |
| --- | --- |
| uid | string |
| name | string |
| email | string |
| currency | string |
| photo | string \| null |
| createdAt | string (ISO) |
| fcmToken | string \| null |

### `transactions/{id}`

| Field | Type |
| --- | --- |
| id, uid | string |
| amount | number |
| type | `income` \| `expense` |
| categoryId | string |
| paymentMethod | string |
| description | string |
| receiptImage | string \| null |
| date, createdAt | string (ISO) |

### `categories/{id}`

| Field | Type |
| --- | --- |
| id, uid, name, icon, color | string |
| type | `income` \| `expense` |
| isDefault | boolean |

Defaults seeded on register: Food, Shopping, Travel, Bills, Medical, Salary, Investment, Gift.

### `budgets/{id}`

| Field | Type |
| --- | --- |
| id, uid | string |
| categoryId | string \| null (null = overall) |
| amount | number |
| month, year | number |

## Storage paths

- `receipts/{uid}/{filename}.jpg`
- `profiles/{uid}/avatar.jpg`

## FCM (optional native push)

The app ships a notification service that **gracefully no-ops** until native messaging is installed.

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

Then:

1. Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS).
2. Apply the Google Services Gradle / Xcode setup from the React Native Firebase docs.
3. Background handling is already wired in `index.js` via `setBackgroundMessageHandler`.

Settings toggles cover daily reminder, budget alerts, and monthly reminder; schedule delivery with Cloud Functions or your FCM campaign tooling.

## Offline support

- Firestore listeners keep a local cache and sync when connectivity returns.
- Auth persistence uses AsyncStorage (`createAsyncStorage`).
- Theme / remember-me / settings use **MMKV**.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Metro bundler |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm test` | Jest |
| `npm run lint` | ESLint |

## Architecture notes

- **Protected routes**: `RootNavigator` switches Auth ↔ Main from Redux auth state.
- **Realtime sync**: `useAppBootstrap` subscribes to transactions, categories, budgets, and profile after login.
- **Analytics**: `useAnalytics` powers reports/charts (income vs expense, category pie, savings trend).
- **Validation**: React Hook Form + shared validators for email/password/amount.
- **Theming**: Paper MD3 + custom teal/sky finance palette; system / light / dark.

## Production checklist

- [ ] Replace `YOUR_*` values in `src/constants/env.ts`
- [ ] Deploy Firestore + Storage rules
- [ ] Create Firestore composite indexes
- [ ] Configure release signing (Android) / certificates (iOS)
- [ ] Install `@react-native-firebase/messaging` if you need true push
- [ ] Move secrets to CI-injected config (e.g. `react-native-config`) for release builds

## License

Private demo project — customize as needed.
# Track
