# Withdraw Logic Implementation - TODO

## Phase 1: Update Type Definitions
- [ ] Update `PayoutRequest` interface to include bank_card_number, bank_code, bank_method

## Phase 2: Update Translations
- [ ] Add bank method labels (credit_card, prepaid_card, cash_transfer) in en.json
- [ ] Add bank method labels in ar.json
- [ ] Add bank code labels (all 45 banks with EN/AR names) in en.json
- [ ] Add bank code labels in ar.json
- [ ] Add validation error messages in en.json
- [ ] Add validation error messages in ar.json
- [ ] Add confirmation modal labels in en.json
- [ ] Add confirmation modal labels in ar.json
- [ ] Add bank card number labels and placeholders in en.json
- [ ] Add bank card number labels and placeholders in ar.json

## Phase 3: Update WithdrawModal Component
- [ ] Rewrite WithdrawModal with full implementation
- [ ] Add state for bank fields (bankCardNumber, bankCode, bankMethod)
- [ ] Add bank-specific dropdowns and input fields
- [ ] Add phone validation (11 digits, starts with 01)
- [ ] Add Luhn algorithm for card validation
- [ ] Add IBAN validation for cash_transfer
- [ ] Add confirmation modal with all transaction details
- [ ] Update handleWithdraw to run validations and show confirmation

## Phase 4: Styling Updates
- [ ] Add CSS for new form fields
- [ ] Add CSS for confirmation modal
- [ ] Add error message styling

## Phase 5: Testing
- [ ] Test mobile wallet flow
- [ ] Test bank_wallet flow
- [ ] Test bank_card flow with credit_card
- [ ] Test bank_card flow with prepaid_card
- [ ] Test bank_card flow with cash_transfer (IBAN validation)
- [ ] Test validation errors
- [ ] Test confirmation modal

