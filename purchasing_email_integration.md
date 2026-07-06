# Power Automate Email Flow - Testing & Integration Guide

## Testing Your Flow

Before deploying to production, test each email scenario using Power Automate's testing interface or by sending HTTP POST requests to your flow endpoint.

### Test Case 1: Pending Approval

This test triggers the pending approval email when a request needs approver sign-off.

**HTTP Request**:
```json
POST /flow-endpoint
{
  "emailType": "pending_approval",
  "requestId": "REQ23FIRE-1"
}
```

**Expected Result**:
- Email sent to the primary approver (or delegate if assigned)
- Subject: `Purchasing request REQ23FIRE-1 - "..." pending your approval`
- Body includes request details, amount, and approval link

**What to verify**:
- ✅ Email arrives in approver's inbox
- ✅ Link in email opens to request approval page
- ✅ All request details display correctly

---

### Test Case 2: Purchase Submission

This test triggers the purchase submission email when a new purchase is created without an associated request.

**HTTP Request**:
```json
POST /flow-endpoint
{
  "emailType": "purchase_submission",
  "purchaseId": "PUR23FIRE-1"
}
```

**Expected Result**:
- Email sent to approver (or configured stakeholder)
- Subject: `New purchasing submission - PUR23FIRE-1`
- Body includes purchase details, vendor, amount, and link to purchase page

**What to verify**:
- ✅ Email arrives in stakeholder inbox
- ✅ Link in email opens to purchase detail page
- ✅ Vendor and amount information is correct

---

### Test Case 3: Status Change

This test triggers status change notifications when a request's status is updated.

**HTTP Request**:
```json
POST /flow-endpoint
{
  "emailType": "status_change",
  "requestId": "REQ23FIRE-1"
}
```

**Expected Result** (varies by status):

**If status = "Approved"**:
- Subject: `Purchasing request REQ23FIRE-1 approved - please submit purchase`
- Body tells user to submit the purchase
- Recipient: Request creator (or delegate)

**If status = "Approved For AP"**:
- Subject: `Purchasing request REQ23FIRE-1 approved - Finance will complete`
- Body tells user Finance will handle it
- Recipient: Request creator (or delegate)

**If status = Any other value**:
- Subject: `Update to purchasing request REQ23FIRE-1 - "..."`
- Body shows status change with generic message
- Recipient: Request creator (or delegate)

**What to verify**:
- ✅ Email recipient is correct (creator or delegate)
- ✅ Email subject matches the status
- ✅ Email body has appropriate messaging for the status
- ✅ Link opens to request detail page

---

## Testing in Power Automate

1. Open your flow in Power Automate
2. Click **Test** (top right)
3. Select **Manually trigger a flow**
4. Paste one of the JSON payloads above into the request body
5. Click **Test**
6. Monitor the flow execution and check for errors

---

## Testing in Postman or cURL

If you prefer testing via HTTP client:

**Postman**:
1. Create new POST request
2. Paste your Power Automate webhook URL as the request URL
3. Set Body to **raw** JSON
4. Paste one of the test payloads
5. Click **Send**

**cURL**:
```bash
curl -X POST https://prod-XX.eastus.logic.azure.com:443/workflows/... \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "pending_approval",
    "requestId": "REQ23FIRE-1"
  }'
```

---

## Node.js Integration

Once testing is complete, update your Node.js application to call the Power Automate flow instead of using the old email functions.

### Replace Old Email Functions

**Before** (old code to remove):
```typescript
import sendEmail from "../sendEmail"
import { sendPendingApprovalEmail, sendPurchaseEmail, sendStatusEmail } from "./emailFunctions"

// Usage:
await sendPendingApprovalEmail([approverEmail], request)
await sendPurchaseEmail([stakeholderEmail], purchase)
await sendStatusEmail(request)
```

**After** (new code to add):
```typescript
const triggerPowerAutomate = async (emailType: string, id: string) => {
  const payload = {
    emailType,
    ...(emailType === 'purchase_submission' ? { purchaseId: id } : { requestId: id })
  };

  try {
    const response = await fetch(process.env.POWER_AUTOMATE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error('Power Automate error:', await response.text());
    }
  } catch (error) {
    console.error('Failed to trigger Power Automate:', error);
  }
};

// Usage:
await triggerPowerAutomate('pending_approval', request.requestId);
await triggerPowerAutomate('purchase_submission', purchase.purchaseId);
await triggerPowerAutomate('status_change', request.requestId);
```

### Environment Configuration

Add your Power Automate webhook URL to your `.env` file:

```bash
# .env
POWER_AUTOMATE_WEBHOOK_URL=https://prod-XX.eastus.logic.azure.com/workflows/...
```

Then reference it in your code:
```typescript
process.env.POWER_AUTOMATE_WEBHOOK_URL
```

### Where to Call These Functions

**For Pending Approval** - When a request is created with approvers assigned:
```typescript
// In your request creation endpoint
if (approvalAssigned) {
  await triggerPowerAutomate('pending_approval', request.requestId);
}
```

**For Purchase Submission** - When a new purchase is created without a request:
```typescript
// In your purchase creation endpoint
if (!purchase.requestId) {
  await triggerPowerAutomate('purchase_submission', purchase.purchaseId);
}
```

**For Status Change** - When a request status is updated:
```typescript
// In your request update endpoint
if (statusChanged) {
  await triggerPowerAutomate('status_change', request.requestId);
}
```

### Error Handling

The basic implementation logs errors to console. For production, consider:

```typescript
const triggerPowerAutomate = async (emailType: string, id: string) => {
  const payload = {
    emailType,
    ...(emailType === 'purchase_submission' ? { purchaseId: id } : { requestId: id })
  };

  try {
    const response = await fetch(process.env.POWER_AUTOMATE_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Power Automate error (${emailType}):`, errorText);
      
      // Optional: Send to logging service
      // await logError('Power Automate Failed', { emailType, id, error: errorText });
      
      // Optional: Throw error to caller
      // throw new Error(`Failed to send ${emailType} email`);
    }
  } catch (error) {
    console.error(`Failed to trigger Power Automate (${emailType}):`, error);
    
    // Optional: Re-throw or handle based on your error strategy
    // throw error;
  }
};
```

### Async Considerations

The function is async but doesn't block your request. This is intentional - email notifications should not slow down your API responses. However, you may want to:

1. **Log the attempt** for audit purposes
2. **Retry on failure** with exponential backoff
3. **Queue failed attempts** for retry later

```typescript
// With retry logic
const triggerPowerAutomateWithRetry = async (
  emailType: string, 
  id: string,
  maxRetries = 3
) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const payload = {
        emailType,
        ...(emailType === 'purchase_submission' ? { purchaseId: id } : { requestId: id })
      };

      const response = await fetch(process.env.POWER_AUTOMATE_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        return; // Success
      }
      
      lastError = await response.text();
    } catch (error) {
      lastError = error;
    }
    
    // Wait before retry (exponential backoff)
    if (attempt < maxRetries) {
      const delayMs = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.error(`Power Automate failed after ${maxRetries} attempts:`, lastError);
};
```

---

## Cleanup

After confirming the Power Automate integration is working:

1. **Remove old email files** from your Node.js project:
   - Delete `sendEmail.ts` if no longer used
   - Delete email function files (sendPendingApprovalEmail, etc.)

2. **Remove email dependencies** from `package.json` if applicable:
   - Any email libraries (nodemailer, sendgrid, etc.)

3. **Update documentation** to reference Power Automate for email workflows

4. **Archive old email code** for reference if needed

---

## Troubleshooting

### Email not sending
- Verify the webhook URL is correct in `.env`
- Check Power Automate flow is enabled
- Review Power Automate run history for errors
- Verify the request ID/purchase ID exists in database

### Wrong email template
- Check the `emailType` value matches exactly (case-sensitive)
- Verify status value in database for status_change emails
- Check for whitespace issues (newlines) in database values

### Recipients not receiving emails
- Verify email addresses in database are correct
- Check Outlook/O365 spam folder
- Review Power Automate Send Email action for errors
- Verify email permissions in Power Automate

### Flow is disabled
- Manually enable the flow in Power Automate
- Check for any failed runs that may have disabled it
- Review Power Automate notifications for warnings

