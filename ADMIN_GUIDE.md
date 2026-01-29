# Admin Dashboard Setup & Usage Guide

## Overview

The Admin Dashboard allows admins to:
- View all JSA (Job Service Associate) users
- Review work orders created by JSA users
- Approve or reject work orders
- Update payment status
- View comprehensive statistics per user

## Features

### 1. User Management
- See all registered JSA users
- View user contact information
- Track total work orders per user

### 2. Work Order Management
- View all work orders from all JSA users
- Approve pending work orders
- Reject work orders if needed
- Update payment status (Pending → Completed → Failed)
- Quick actions to approve & mark as paid

### 3. Dashboard Statistics
For each selected user, view:
- **Total Works**: Total number of work orders
- **Approved**: Number of approved work orders
- **Pending Approval**: Awaiting admin review
- **Rejected**: Rejected work orders
- **Payment Completed**: Paid work orders
- **Payment Pending**: Awaiting payment
- **Payment Failed**: Failed payment attempts

### 4. Detailed Work History
- Customer name and building ID
- Service type (FullValue, UBR, P2)
- Current approval status with dropdown to change
- Current payment status with dropdown to change
- Date of work completion

## Setting Up Admin Account

To create an admin account, you have two options:

### Option 1: Direct Database Update (Development)
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### Option 2: Using Prisma Studio
1. Run: `npx prisma studio`
2. Navigate to User table
3. Find your user
4. Change `role` from `JSA` to `ADMIN`

### Default Users
By default, new users are created as `JSA` role.

## Accessing Admin Dashboard

1. **Login** with your admin account
2. **Navigate** to Admin Dashboard (visible in navbar when logged in as ADMIN)
3. **Select** a JSA user from the left sidebar
4. **View** their work orders and statistics
5. **Approve/Update** work orders as needed

## API Endpoints

### Admin-Only Endpoints

**GET `/api/admin/users`**
- Returns list of all JSA users with work summary
- Requires: Admin authentication

**GET `/api/admin/users/:userId`**
- Returns detailed user info with all work orders
- Requires: Admin authentication

**PATCH `/api/admin/work/:workId`**
- Updates work order approval or payment status
- Body:
  ```json
  {
    "approvalStatus": "APPROVED" | "REJECTED" | "PENDING",
    "paymentStatus": "COMPLETED" | "FAILED" | "PENDING"
  }
  ```
- Requires: Admin authentication

## Work Order Status Flow

### Approval Status
- **PENDING**: Initial state when work is submitted
- **APPROVED**: Admin has verified the work
- **REJECTED**: Admin rejected the work

### Payment Status
- **PENDING**: Work is done, waiting for payment
- **COMPLETED**: Payment has been made
- **FAILED**: Payment attempt failed

## Security

- Admin routes are protected by middleware
- Only users with `role = 'ADMIN'` can access `/admin`
- Session-based authentication required
- Admin links only appear in navbar for admin users

## Troubleshooting

### "Admin access required" Error
- Your account is not set as ADMIN
- Use Prisma Studio to update your role

### Can't see work orders
- Users may not have created any work yet
- Check if they have the JSA role

### Status updates not reflecting
- Try refreshing the page
- Check browser console for errors
- Verify admin user has proper permissions

## Features in Development

- [ ] Export work orders to CSV
- [ ] Filter work orders by date range
- [ ] Email notifications for approvals
- [ ] Payment tracking dashboard
- [ ] Admin activity logs
