# Fix: Create Firestore User Document on Registration

## Issue
When users register via Google/Apple or email/password, the registration flow creates:
1. Firebase Auth account ✓
2. Backend account via API ✓

But it does NOT create the Firestore document (`users/{uid}` with `type: "SUPPLIER"`), which is required for login authorization.

## Fix Summary
Modified `src/components/auth/RegisterForm.tsx`:
1. Added Firestore imports (`doc`, `setDoc`, `serverTimestamp` from `firebase/firestore` and `getFirebaseDb`)
2. Added `createFirestoreUserDoc` function that creates a user document in Firestore with all required fields
3. Called `createFirestoreUserDoc` in `createAccount` function after successful backend signup

## Fields included in Firestore document:
- id: uid
- email, firstName, lastName, fullName
- storeName, phone
- type: "SUPPLIER"
- balance: 0
- verificationStatus: "VERIFIED"
- isGoogle: boolean (based on auth method)
- isApple: boolean (based on auth method)
- avatar: default avatar URL
- deliveryMethod: "", gov: "", govName: null
- password: ""
- uniqueId: generated (format: 019xxx)
- date, updatedAt, lastActive: serverTimestamp()
- tokens: []

## Status
✅ All tasks completed - TypeScript compiles successfully


