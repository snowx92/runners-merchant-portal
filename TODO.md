# Fix: Merchant Login Authorization for Apple/Google Users

## Original Issue
When a merchant logs in by Apple or Google and their type is "supplier", it says "this type is not authorized".

## Root Cause Analysis
The backend API was failing because the `gov` field was not included in the signup request body. The backend tries to create a Firestore document with the provided data, but `undefined` values are not allowed in Firestore documents.

## Solution Applied

### Modified `src/components/auth/RegisterForm.tsx`:

1. **Added `gov: ""` field to the signup request body** for both social auth and email/password flows

```typescript
// For social auth:
requestData = {
    email: formData.email,
    phone: formData.phone,
    firstName: formData.firstName,
    lastName: formData.lastName,
    storeName: formData.storeName,
    type: "SUPPLIER",
    uid: uid,
    secretCode: secret,
    idToken: idToken!,
    gov: "",  // Added this field
};

// For email/password:
requestData = {
    email: formData.email,
    phone: formData.phone,
    firstName: formData.firstName,
    lastName: formData.lastName,
    storeName: formData.storeName,
    type: "SUPPLIER",
    uid: uid,
    secretCode: secret,
    password: formData.password,
    gov: "",  // Added this field
};
```

## Status
✅ TypeScript compiles successfully
✅ Added `gov: ""` to API request body



