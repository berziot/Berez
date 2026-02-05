# Crowdsourcing Features

This document describes the new crowdsourcing features added to the Berez app.

## Overview

The app now allows users to contribute to the fountain database by:
1. **Submitting new fountains** - Users can add fountains that are missing from the database
2. **Reporting issues** - Users can report problems with existing fountains (broken, missing, incorrect location, etc.)

## Backend Changes

### New Models (models.py)

#### FountainReport
User reports for fountain issues:
- `id`: Report ID
- `fountain_id`: The fountain being reported
- `user_id`: User who submitted the report (optional, can be anonymous)
- `report_type`: Type of report (broken, missing, incorrect_location, other)
- `description`: Optional details about the issue
- `status`: Report status (pending, resolved, rejected)
- `created_at`: When the report was created
- `resolved_at`: When the report was resolved (if applicable)

#### FountainCreate
Schema for user-submitted fountains:
- `address`: Street address
- `latitude`: Location latitude
- `longitude`: Location longitude
- `dog_friendly`: Whether fountain is dog-friendly
- `bottle_refill`: Whether fountain is suitable for bottle refilling
- `type`: Fountain type
- `description`: Optional additional details

#### Updated Fountain Model
Added new fields:
- `status`: Fountain status (verified, user_submitted, approved)
- `submitted_by`: User ID of who submitted the fountain (if user-contributed)
- `description`: Optional description field

### New Endpoints

#### POST /fountains/submit
Submit a new user-contributed fountain.

**Request Body:**
```json
{
  "address": "string",
  "latitude": 32.0853,
  "longitude": 34.7818,
  "dog_friendly": false,
  "bottle_refill": false,
  "type": "cylindrical_fountain",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "message": "תודה! הברזיה נשלחה לאישור",
  "fountain": { /* fountain object */ }
}
```

**Authentication:** Optional (anonymous submissions allowed)

#### POST /fountains/report
Report an issue with a fountain.

**Request Body:**
```json
{
  "fountain_id": 123,
  "report_type": "broken",
  "description": "Optional description"
}
```

**Report Types:**
- `broken`: Fountain is not working
- `missing`: Fountain has been removed
- `incorrect_location`: Fountain location is wrong
- `other`: Other issues

**Response:**
```json
{
  "message": "תודה על הדיווח!",
  "report": { /* report object */ }
}
```

**Authentication:** Optional (anonymous reports allowed)

#### GET /fountains/{fountain_id}/reports
Get all reports for a specific fountain.

**Response:**
```json
[
  {
    "id": 1,
    "fountain_id": 123,
    "user_id": 456,
    "username": "username",
    "report_type": "broken",
    "description": "Not working",
    "status": "pending",
    "created_at": "2026-02-05T10:00:00",
    "resolved_at": null
  }
]
```

## Frontend Changes

### New Components

#### ReportFountainSheet
A bottom sheet modal for reporting fountain issues.

**Props:**
- `fountainId`: ID of the fountain to report
- `isOpen`: Whether the sheet is visible
- `onClose`: Callback when the sheet is closed

**Features:**
- Radio button selection for report type
- Optional text description (500 chars max)
- Success state with animation
- Works for both authenticated and anonymous users

### New Pages

#### /add-fountain
A full page for submitting new fountains.

**Features:**
- Automatically gets user's current location
- Reverse geocoding to get address
- Address input field
- Fountain type selection (5 types)
- Feature toggles (dog-friendly, bottle refill)
- Optional description field (500 chars max)
- Success state with auto-redirect
- Works for both authenticated and anonymous users

### Updated Components

#### Home Page (page.tsx)
- Added floating action button (FAB) to access the "Add Fountain" page
- FAB is positioned at bottom-right with blue background
- Smooth hover and active animations

#### Fountain Detail Page ([fountain_id]/page.tsx)
- Added "Report Issue" button in the fountain info card
- Integrated ReportFountainSheet component
- Button triggers the report sheet modal

### Updated Types (types.tsx)

Added new TypeScript types:
- `ReportType`: Union type for report types
- `ReportStatus`: Union type for report statuses
- `FountainReport`: Type for fountain reports
- `FountainReportCreate`: Type for creating reports
- `FountainCreate`: Type for creating fountains
- Updated `Fountain` type with optional fields: `status`, `submitted_by`, `description`

## User Flow

### Adding a New Fountain

1. User clicks the FAB button (+ icon) on the home page
2. App requests location permission and gets current coordinates
3. Address is automatically filled via reverse geocoding (user can edit)
4. User selects fountain type from 5 options
5. User can toggle dog-friendly and bottle-refill features
6. User can add optional description
7. User submits the form
8. Fountain is created with status "user_submitted"
9. Success message is shown with note about verification
10. User is redirected back to home page

### Reporting an Issue

1. User opens a fountain detail page
2. User clicks "דווח על בעיה" (Report Issue) button
3. Bottom sheet opens with report form
4. User selects issue type (broken, missing, incorrect location, other)
5. User can add optional description
6. User submits the report
7. Success message is shown
8. Sheet auto-closes after 2 seconds

## Data Management

### User-Submitted Fountains

- New fountains have status "user_submitted"
- They are included in search results but can be filtered by admins
- Admin panel (future) can approve/reject submissions
- Approved fountains get status changed to "approved"
- Original fountains from CSV have status "verified"

### Fountain Reports

- Reports have status "pending" by default
- Admins can review reports and mark them as "resolved" or "rejected"
- Multiple reports can exist for the same fountain
- Reports are displayed chronologically

## Future Enhancements

1. **Admin Panel**
   - Review and approve user-submitted fountains
   - Manage fountain reports
   - Bulk operations for report resolution

2. **User Contributions Page**
   - Show user's submitted fountains
   - Show user's reports
   - Track contribution statistics

3. **Notifications**
   - Notify users when their submission is approved/rejected
   - Notify about report status changes

4. **Gamification**
   - Points for approved submissions
   - Badges for contributions
   - Leaderboard

5. **Report Analytics**
   - Visualize common issues
   - Map of frequently reported areas
   - Automatic flagging of problematic fountains

## Testing

### Backend Testing

Test the new endpoints:

```bash
# Submit a fountain
curl -X POST http://localhost:8000/fountains/submit \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Test Street, Tel Aviv",
    "latitude": 32.0853,
    "longitude": 34.7818,
    "dog_friendly": true,
    "bottle_refill": false,
    "type": "cylindrical_fountain",
    "description": "Near the park"
  }'

# Report a fountain
curl -X POST http://localhost:8000/fountains/report \
  -H "Content-Type: application/json" \
  -d '{
    "fountain_id": 1,
    "report_type": "broken",
    "description": "Water not flowing"
  }'

# Get reports for a fountain
curl http://localhost:8000/fountains/1/reports
```

### Frontend Testing

1. Test adding a new fountain:
   - Click FAB on home page
   - Allow location permission
   - Fill in form and submit
   - Verify success message

2. Test reporting an issue:
   - Open any fountain detail page
   - Click "Report Issue" button
   - Select report type and submit
   - Verify success message

3. Test anonymous submissions:
   - Log out
   - Try both features without authentication
   - Verify they work

## Database Schema Changes

The following changes were made to the database schema:

1. **Fountain table** - Added columns:
   - `status` (TEXT, default='verified')
   - `submitted_by` (INTEGER, nullable, foreign key to user.id)
   - `description` (TEXT, nullable)

2. **New FountainReport table:**
   - `id` (INTEGER, primary key)
   - `fountain_id` (INTEGER, foreign key to fountain.id)
   - `user_id` (INTEGER, nullable, foreign key to user.id)
   - `report_type` (TEXT)
   - `description` (TEXT, nullable)
   - `status` (TEXT, default='pending')
   - `created_at` (TIMESTAMP)
   - `resolved_at` (TIMESTAMP, nullable)

**Note:** SQLModel will automatically create these tables/columns on next app startup. For production, consider using a proper migration tool like Alembic.
