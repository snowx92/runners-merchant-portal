# Balance Check for Chat - Implementation Plan

## Objective
Prevent users from opening any chat if their balance is less than 5 EGP.

## Analysis
- The `MessageDrawer.tsx` file already has an incomplete `checkBalanceAndProceed` function with syntax errors
- The balance API is available via `commonService.getBalance()` returning `BalanceResponse`
- The balance check should happen in `handleChatClick` function

## Implementation Steps ✅ COMPLETED

### Step 1: Fix the incomplete `checkBalanceAndProceed` function ✅ DONE
- Completed the function logic to properly check balance
- Added error handling and balance state management
- Returns false if balance < 5 EGP
- Shows alert message: "لا يمكنك فتح الدردشة برصيد أقل من 5 جنيهات. يرجى شحن حسابك."

### Step 2: Integrate balance check into `handleChatClick` ✅ DONE
- Added async modifier to `handleChatClick`
- Calls `checkBalanceAndProceed` before allowing user to open a chat
- Returns early if balance check fails

### Step 3: Add balance state management ✅ DONE
- Added state for `userBalance` and `isCheckingBalance`
- Added `hasLowBalance` state for UI feedback

## Files Modified
- `src/components/home/MessageDrawer.tsx`

## Implementation Details

### Balance Check Function
```typescript
const checkBalanceAndProceed = async (): Promise<boolean> => {
  try {
    setIsCheckingBalance(true);
    const response = await commonService.getBalance();
    
    if (response.data && typeof response.data.balance === 'number') {
      const balance = response.data.balance;
      setUserBalance(balance);
      
      if (balance < 5) {
        setHasLowBalance(true);
        alert('لا يمكنك فتح الدردشة برصيد أقل من 5 جنيهات. يرجى شحن حسابك.');
        setIsCheckingBalance(false);
        return false;
      }
      
      setHasLowBalance(false);
      setIsCheckingBalance(false);
      return true;
    }
    
    setIsCheckingBalance(false);
    return true; // Allow if we can't get balance
  } catch (error) {
    console.error("Error checking balance:", error);
    setIsCheckingBalance(false);
    return true; // Allow if balance check fails
  }
};
```

### Chat Click Handler
```typescript
const handleChatClick = async (message: Message) => {
  // Check balance before opening chat
  const canOpenChat = await checkBalanceAndProceed();
  if (!canOpenChat) {
    return;
  }
  
  setSelectedChat(message);
  setChatMessages([]);
};
```

## Success Criteria ✅ VERIFIED
- ✅ Users with balance < 5 EGP cannot open chats
- ✅ Users see a clear message explaining why they can't chat
- ✅ Balance check fails gracefully (allows chat if API is unavailable)
- ✅ No syntax errors in the code
