# Nursing Department Election Management System

## Project Overview

The Nursing Department Election Management System is a secure web-based voting platform designed to facilitate departmental elections digitally. The system aims to provide a transparent, efficient, and user-friendly voting experience for students while giving election administrators full control over election setup, voter management, and result monitoring.

The platform will allow administrators to import eligible voters, manage candidates and positions, conduct elections, and generate election results. Students will receive voting access through their registered email addresses and can securely cast their votes online.

---

## Objectives

* Digitize departmental elections.
* Eliminate manual ballot counting.
* Prevent duplicate voting.
* Ensure only eligible students can vote.
* Provide real-time election monitoring.
* Generate accurate and transparent election results.
* Maintain an audit trail for election activities.

---

## Technology Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui

### Backend

* Next.js Route Handlers
* Server Actions
* Auth.js (Authentication)

### Database

* MongoDB Atlas
* Mongoose ODM

### Additional Services

* Resend (Email Delivery)
* Zod (Validation)

### Deployment

* Vercel
* MongoDB Atlas

---

## User Roles

### Administrator

Administrators can:

* Create and manage elections
* Upload eligible voters
* Create positions
* Add and manage candidates
* Start and end elections
* Monitor voter turnout
* View election results
* Access audit logs

### Voter

Voters can:

* Activate their account via email invitation
* Log into the platform
* View election information
* View candidate profiles and manifestos
* Cast votes
* View election results (if enabled)

---

## Proposed Election Workflow

### 1. Voter Import

Administrators upload a CSV or Excel file containing eligible voters.

Example:

| Student ID | Full Name  | Email                                       |
| ---------- | ---------- | ------------------------------------------- |
| NUR001     | John Doe   | [john@example.com](mailto:john@example.com) |
| NUR002     | Mary Smith | [mary@example.com](mailto:mary@example.com) |

The system stores the voter records and marks them as inactive until they activate their accounts.

---

### 2. Election Setup

Administrators create:

* Election
* Positions
* Candidates
* Election start date
* Election end date

The election remains in Draft status until activated.

---

### 3. Invitation and Account Activation

Once the election is ready:

* Email invitations are sent to all eligible voters.
* Each email contains a secure activation link.
* Users activate their account by creating a password.

After activation, users can log in normally using their email and password.

---

### 4. Voting Process

Students:

* Log into the platform.
* View all available positions.
* Review candidate information.
* Vote for one candidate per position.
* Submit their ballot.

The system validates votes and prevents duplicate voting.

---

### 5. Election Closure

When the election end time is reached:

* Voting is automatically disabled.
* Election status changes to Ended.
* Results become available.
* Election data is locked for integrity.

---

## Core Modules

### Authentication Module

Features:

* Email-based login
* Account activation
* Password reset
* Session management
* Role-based access control

---

### Election Management Module

Features:

* Create elections
* Edit elections
* Activate elections
* End elections
* Schedule election periods

---

### Position Management Module

Features:

* Add positions
* Edit positions
* Remove positions
* Configure voting rules

Examples:

* President
* Vice President
* Secretary
* Treasurer
* PRO

---

### Candidate Management Module

Features:

* Add candidates
* Upload candidate photos
* Candidate manifesto
* Position assignment
* Candidate approval

---

### Voter Management Module

Features:

* Import voters via CSV
* Search voters
* Disable voter accounts
* Resend activation emails
* View voting status

---

### Voting Module

Features:

* Secure ballot interface
* One vote per position
* Vote validation
* Election eligibility checks
* Vote submission confirmation

---

### Results Module

Features:

* Live vote counts
* Candidate rankings
* Election winners
* Voter turnout statistics
* Graphical result visualizations

---

### Audit Logging Module

Tracks activities such as:

* Election creation
* Candidate additions
* Election activation
* Election closure
* Administrative changes

This ensures accountability and transparency.

---

## Database Design

### Users Collection

```javascript
{
  _id,
  studentId,
  fullName,
  email,
  password,
  role,
  activated,
  createdAt
}
```

### Elections Collection

```javascript
{
  _id,
  title,
  description,
  startDate,
  endDate,
  status
}
```

### Positions Collection

```javascript
{
  _id,
  electionId,
  title,
  maxSelections
}
```

### Candidates Collection

```javascript
{
  _id,
  electionId,
  positionId,
  name,
  photo,
  manifesto
}
```

### Votes Collection

```javascript
{
  _id,
  voterId,
  electionId,
  positionId,
  candidateId,
  createdAt
}
```

### Audit Logs Collection

```javascript
{
  _id,
  userId,
  action,
  metadata,
  createdAt
}
```

---

## Security Considerations

### Authentication Security

* Password hashing using bcrypt
* Protected routes
* Session validation

### Voting Security

* Prevent duplicate voting
* Server-side vote validation
* Election state verification
* Unique database constraints

### Data Integrity

* Election locking after closure
* Audit logging
* Role-based permissions

---

## Future Enhancements

* Multi-department support
* Mobile application
* SMS notifications
* Real-time election analytics
* Biometric verification
* QR code voter verification
* Printable election reports

---

## Project Goal

To deliver a secure, scalable, transparent, and production-ready election management platform capable of handling departmental elections while maintaining election integrity and providing a seamless experience for both administrators and voters.
