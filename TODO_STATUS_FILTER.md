# TODO: Reverse Order Status Filter Tabs

## Goal
Reorder the status filter tabs in the orders page from current order to reversed order:
- **Current**: CANCELLED → FAILED → COMPLETED → DELIVERED → PENDING → ALL
- **New**: ALL → PENDING → DELIVERED → COMPLETED → FAILED → CANCELLED

## Status: COMPLETED ✓

### Changes Made:
- [x] Reorder status tabs in `src/app/orders/page.tsx`

### Translation Keys (from messages/ar.json):
- `status.all`: الكل
- `status.pending`: جديد
- `status.delivered`: قيد التسليم
- `status.completed`: مكتمل
- `status.failed`: فشل
- `status.cancelled`: ملغي

