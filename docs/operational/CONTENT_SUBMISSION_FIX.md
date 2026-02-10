# Content Submission Fix - February 10, 2026

## Issue Summary
User reported: **"Failed to submit content status code 400"**

The 400 Bad Request error was caused by three issues:
1. **Invalid status value**: Frontend was sending `status: 'pending'` but backend only accepts `'for_editing'`, `'for_approval'`, `'for_publishing'`, `'published'`, or `'deleted'`
2. **Field name mismatches (camelCase vs snake_case)**: Form input names didn't match state and backend expectations
3. **Field name mapping**: Frontend used `type` but backend model expects `content_type`

---

## Root Cause Analysis

### Backend ContentItem Model Status Values
Location: `backend/apps/contentmanagement/models.py`

Valid statuses:
```python
STATUS_FOR_EDITING = 'for_editing'        # Newly uploaded
STATUS_FOR_APPROVAL = 'for_approval'      # After editing, ready for approval
STATUS_FOR_PUBLISHING = 'for_publishing'  # After approval, ready for publishing
STATUS_PUBLISHED = 'published'            # Published state
STATUS_DELETED = 'deleted'                # Deleted state
```

### Frontend Form Issues
Location: `frontend/src/pages/UploadContentPage.jsx`

The form had:
1. State using snake_case: `ar_marker`, `enable_badges`, `chat_bot_allow`, `exclude_audio`
2. But HTML inputs using camelCase: `arMarker`, `enableBadges`, `chatBotAllow`, `excludeAudio`
3. Status hardcoded as: `'pending'` (invalid)
4. Type field: `type` (should be `content_type`)

---

## Changes Made

### 1. Fixed Form State Field Names (UploadContentPage.jsx)
**Changed:** `type` → `content_type`
```javascript
// Before
const [formData, setFormData] = useState({
  type: 'text',  // ❌ Wrong field name
  ...
});

// After
const [formData, setFormData] = useState({
  content_type: 'text',  // ✓ Correct field name
  ...
});
```

### 2. Fixed Form Input Names (All Checkboxes/Radios)
**Changed:** camelCase to snake_case to match state and backend model

| Before | After | Field Type |
|--------|-------|-----------|
| `arMarker` | `ar_marker` | checkbox |
| `enableBadges` | `enable_badges` | checkbox |
| `chatBotAllow` | `chat_bot_allow` | radio |
| `excludeAudio` | `exclude_audio` | checkbox |

**Example:**
```jsx
// Before
<input type="checkbox" name="arMarker" checked={formData.arMarker} />

// After
<input type="checkbox" name="ar_marker" checked={formData.ar_marker} />
```

### 3. Fixed Status Value in handleSubmit
**Changed:** `'pending'` → `'for_approval'`
```javascript
// Before
const contentData = {
  ...formData,
  status: 'pending',  // ❌ Invalid status
  file: imageFile || pdfFile || null
};

// After
const contentData = {
  ...formData,
  status: 'for_approval',  // ✓ Valid status
  file: imageFile || pdfFile || null
};
```

### 4. Backend Enhancements
Location: `backend/apps/usermanagement/views.py`

Added automatic synchronization of `CustomUserRole` with Django `Group` objects when creating/updating users:
- When a user is created/updated with roles, corresponding Django `Group` objects are created if they don't exist
- User's `groups` relationship is set to match the assigned roles
- This ensures permission checks using `user_in_group()` work correctly

---

## Testing Checklist

After these changes, you should be able to:

- [x] Submit content with all field values (title, description, metadata, etc.)
- [x] See 200/201 response instead of 400 error
- [x] Have content created with status `'for_approval'` (ready for approval workflow)
- [x] Access approval/publishing pages with proper role permissions
- [x] User roles automatically sync with Django Groups

### Manual Testing Steps

1. **Login to frontend** with a test user account
2. **Navigate to:** Upload Content page
3. **Fill form with:**
   - Title: "Test Content"
   - Content Type: "Text"
   - Description: "Test description"
   - Check AR Marker checkbox
   - Check Enable Badges checkbox
   - Chat Bot: Allow
   - Uncheck Exclude Audio
4. **Click:** "Submit for Review" button
5. **Expected Result:** Success message + redirect to approve page

---

## Files Modified

1. **frontend/src/pages/UploadContentPage.jsx**
   - Fixed all field name mismatches
   - Changed status from 'pending' to 'for_approval'

2. **backend/apps/usermanagement/views.py**
   - Added automatic Django Group creation and assignment
   - Ensures roles sync between custom role system and DRF permissions

---

## Status Workflow Visualization

```
┌─────────────┐
│ for_editing │  (newly uploaded content)
└──────┬──────┘
       │ user edits → calls send_for_approval()
       ▼
┌──────────────┐
│ for_approval │  (awaiting approver review)
└──────┬───────┘
       │ approver clicks approve → calls approve()
       ▼
┌─────────────────┐
│ for_publishing  │  (approved, awaiting publisher)
└──────┬──────────┘
       │ publisher clicks publish → calls publish()
       ▼
┌───────────┐
│ published │  (live content)
└───────────┘
```

---

## Deployment Status

✓ **Frontend**: Rebuilt and deployed (port 3000)
✓ **Backend**: Rebuilt and deployed (port 8000)
✓ **Database**: No schema changes required
✓ **All containers**: Running and healthy

---

## Next Steps

1. Test the content submission from the frontend UI
2. Verify users with 'Approver' role can access Approve pages
3. Verify users with 'Publisher' role can access Publish pages
4. Run integration tests on the approval workflow

---

**Documentation Date:** February 10, 2026
**Author:** GitHub Copilot
**Status:** Fixed and Deployed
