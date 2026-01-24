a# Recording Fix Implementation Plan

## Issues to Fix
1. Cancel recording doesn't work properly - it creates an audio blob when canceling
2. No loading animations when sending images, voice messages, or locations

## Implementation Steps

### Step 1: Add loading state variables to MessageDrawer.tsx
- [x] Add `isSendingVoice` state
- [x] Add `isUploadingImage` state
- [x] Add `isSendingLocation` state
- [x] Add `streamRef` to track the media stream

### Step 2: Fix cancelRecording function
- [x] Stop all tracks on the stream first (prevents onstop from creating blob)
- [x] Properly clean up state variables
- [x] Set isRecording to false BEFORE stopping to prevent blob creation
- [x] Clean up timer and recorder references

### Step 3: Update sendVoiceMessage with loading state
- [x] Set `isSendingVoice` to true before upload
- [x] Set `isSendingVoice` to false after completion
- [x] Clear blob and time after sending

### Step 4: Update handleImageUpload with loading state
- [x] Set `isUploadingImage` to true before upload
- [x] Set `isUploadingImage` to false after completion
- [x] Close attachment menu after completion

### Step 5: Update getCurrentLocation and sendLocation with loading state
- [x] Set `isSendingLocation` during location fetch
- [x] Set `isSendingLocation` during location send
- [x] Clear location modal after completion

### Step 6: Add CSS loading animations
- [x] Add loading spinner keyframes (spin animation)
- [x] Add `.loadingSpinner` class for white spinner
- [x] Add `.loadingSpinnerDark` class for dark spinner
- [x] Add `.loadingOverlay` class for full overlay
- [x] Add `.sendingButton` class for disabled state
- [x] Enhanced `.recordingDot` pulse animation with scale transform

### Step 7: Update UI to show loading states
- [x] Update voice preview send button to show spinner
- [x] Update attachment menu items to show loading
- [x] Update location modal to show loading state

## Files Modified
1. `src/components/home/MessageDrawer.tsx` - Add loading states and fix cancelRecording
2. `src/styles/home/messages.module.css` - Add loading animations

## Testing Status
- [x] Fix cancel recording logic - now sets isRecording false first
- [x] Added loading spinners to all send buttons
- [x] Added loading overlays for location modal
- [x] Location messages now show as clickable map cards with static map preview
- [x] TypeScript errors fixed
- [x] Attachment menu items now have transparent background (only text/icon)
- [x] Location message card now has transparent background
- [x] Message bubbles for image, audio, and location now have transparent backgrounds using CSS classes
- [x] Text messages keep their original backgrounds (#2d2d2d for own, white for other)
- [x] Location address text is always black for visibility on white map background
- [x] Images are now clickable and open in a full-screen modal
- [x] Image preview modal with dark overlay and close button
- [x] TypeScript compilation passed - no errors
- [ ] Manual testing needed to verify functionality

