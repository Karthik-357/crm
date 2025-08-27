# CRM System - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Backend Features](#backend-features)
4. [Frontend Features](#frontend-features)
5. [Database Models](#database-models)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Security](#authentication--security)
8. [Dependencies & Node Modules](#dependencies--node-modules)
9. [Setup & Configuration](#setup--configuration)
10. [Deployment](#deployment)

---

## Project Overview

This is a comprehensive Customer Relationship Management (CRM) system built with a **Node.js/Express backend** and **React frontend**. The system manages customers, projects, tasks, activities, and events with full user authentication, role-based access control, and real-time features.

**Key Features:**
- User authentication and authorization
- Customer management
- Project tracking
- Task management
- Activity logging
- Calendar/Event management
- Analytics and reporting
- Real-time updates via Socket.IO
- Email notifications
- PDF/CSV export capabilities

---

## System Architecture

### Backend Architecture
```
backend/
├── config/          # Configuration files (email, database)
├── controllers/     # Business logic handlers
├── middleware/      # Authentication and authorization
├── models/          # MongoDB schemas
├── routes/          # API endpoint definitions
└── index.js         # Main server file
```

### Frontend Architecture
```
frontend/
├── src/
│   ├── components/  # Reusable UI components
│   ├── context/     # React context providers
│   ├── pages/       # Main page components
│   └── types/       # TypeScript type definitions
├── public/          # Static assets
└── package.json     # Dependencies and scripts
```

### Data Flow
1. **Frontend** makes HTTP requests to **Backend API**
2. **Backend** validates requests through middleware
3. **Controllers** process business logic
4. **Models** interact with MongoDB database
5. **Real-time updates** sent via Socket.IO
6. **Frontend** updates UI based on responses

---

## Backend Features

### 1. User Management System
- **Registration**: New user creation with email/password
- **Login**: JWT-based authentication
- **Role-based Access**: Admin and regular user roles
- **Password Reset**: OTP-based and token-based reset flows
- **User Settings**: Dark mode, notifications, preferences

### 2. Customer Management
- **CRUD Operations**: Create, read, update, delete customers
- **Customer Status**: Active, Inactive, Lead
- **Customer Analytics**: Monthly growth tracking
- **Customer Search**: Find customers by various criteria

### 3. Project Management
- **Project Lifecycle**: Proposal → In Progress → Completed → On Hold
- **Revenue Tracking**: Project values and financial metrics
- **Progress Monitoring**: Project completion percentages
- **Customer Association**: Projects linked to customers

### 4. Task Management
- **Task Status**: Todo, In Progress, Completed
- **Priority Levels**: Low, Medium, High
- **Due Date Tracking**: Deadline management
- **User Assignment**: Tasks assigned to specific users
- **Project Integration**: Tasks linked to projects

### 5. Activity Logging
- **Activity Types**: Calls, emails, meetings, notes
- **Real-time Updates**: Socket.IO integration
- **Customer Association**: Activities linked to customers
- **Audit Trail**: Complete activity history

### 6. Event Management
- **Calendar Events**: Schedule and manage events
- **Date/Time Tracking**: Event scheduling
- **Event Descriptions**: Detailed event information

### 7. Email System
- **Password Reset**: Automated email sending
- **OTP Verification**: Email-based OTP for security
- **Email Templates**: Professional HTML email templates
- **SMTP Integration**: Gmail/other email service support

---

## Frontend Features

### 1. Dashboard
- **Real-time Stats**: Live customer, project, task counts
- **Trend Analysis**: Month-over-month growth metrics
- **Performance Charts**: Customer growth trends
- **Quick Overview**: Project status distribution
- **Top Performers**: Best customers and projects

### 2. Customer Management Interface
- **Customer List**: Paginated customer display
- **Customer Modal**: Add/edit customer information
- **Customer Search**: Filter and search functionality
- **Customer Analytics**: Growth and status metrics

### 3. Project Management Interface
- **Project Overview**: Status-based project organization
- **Project Cards**: Visual project representation
- **Progress Tracking**: Visual progress indicators
- **Revenue Display**: Financial project metrics

### 4. Task Management Interface
- **Task List**: User-specific task display
- **Task Creation**: Add new tasks with details
- **Status Updates**: Change task status
- **Priority Management**: Task priority indicators

### 5. Analytics Dashboard
- **Status Breakdowns**: Customer, project, task distributions
- **Trend Charts**: Revenue and growth trends
- **Performance Metrics**: Completion rates, averages
- **Export Capabilities**: PDF and CSV export

### 6. Calendar Interface
- **Event Display**: Calendar view of events
- **Event Management**: Add/edit/delete events
- **Date Navigation**: Month/week/day views

### 7. Admin Panel
- **User Management**: Admin user controls
- **System Overview**: Administrative metrics
- **User List**: Manage all system users

---

## Database Models

### 1. User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String,
  role: String (admin/user, default: user),
  avatar: String,
  settings: {
    darkMode: Boolean,
    emailNotifications: Boolean,
    pushNotifications: Boolean
  },
  resetToken: String,
  resetTokenExpiry: Date,
  otp: String,
  otpExpiry: Date,
  createdAt: Date
}
```

### 2. Customer Model
```javascript
{
  name: String (required),
  email: String (unique, required),
  phone: String,
  company: String,
  status: String (active/inactive/lead),
  industry: String,
  avatar: String,
  lastContact: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Project Model
```javascript
{
  customerId: ObjectId (ref: Customer, required),
  name: String (required),
  status: String (proposal/in-progress/completed/on-hold),
  startDate: Date,
  endDate: Date,
  value: Number,
  progress: Number (0-100),
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Task Model
```javascript
{
  title: String (required),
  description: String,
  status: String (todo/in-progress/completed),
  dueDate: Date,
  assignedTo: ObjectId (ref: User),
  userId: ObjectId (ref: User, required),
  customerId: ObjectId (ref: Customer),
  projectId: ObjectId (ref: Project),
  priority: String (low/medium/high),
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Activity Model
```javascript
{
  customerId: ObjectId (ref: Customer, required),
  type: String (call/email/meeting/note, required),
  description: String,
  date: Date (required),
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Event Model
```javascript
{
  title: String (required),
  dateTime: Date (required),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Authentication Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/auth/send-otp` - Send password reset OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password-token` - Reset password with token
- `GET /api/auth/verify-reset-token/:token` - Verify reset token

### User Management
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/:id/settings` - Get user settings
- `PUT /api/users/:id/settings` - Update user settings

### Customer Management
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/stats` - Get customer statistics

### Project Management
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/stats` - Get project statistics

### Task Management
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/user/:userId` - Get tasks by user ID (admin)

### Activity Management
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create activity
- `GET /api/activities/:id` - Get activity by ID
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

### Event Management
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

---

## Authentication & Security

### JWT Authentication
- **Token Generation**: JWT tokens with 24-hour expiration
- **Token Verification**: Middleware validates tokens on protected routes
- **User Context**: Tokens contain user ID and role information

### Password Security
- **Bcrypt Hashing**: Passwords hashed with bcrypt (salt rounds: 10)
- **Password Validation**: Minimum 6 characters required
- **Secure Comparison**: Timing-safe password comparison

### Role-based Access Control
- **Admin Role**: Full system access, user management
- **User Role**: Limited access to own data
- **Route Protection**: Middleware enforces role restrictions

### Password Reset Security
- **OTP System**: 6-digit OTP with 10-minute expiration
- **Token System**: Secure reset tokens with 24-hour expiration
- **Email Verification**: Reset links sent to verified email addresses

---

## Dependencies & Node Modules

### Backend Dependencies

#### Core Dependencies
- **express (^5.1.0)**: Web framework for Node.js
  - Handles HTTP requests and responses
  - Provides middleware system
  - Manages routing and API endpoints

- **mongoose (^8.15.1)**: MongoDB object modeling tool
  - Defines database schemas and models
  - Handles database connections
  - Provides validation and middleware

- **cors (^2.8.5)**: Cross-Origin Resource Sharing middleware
  - Enables frontend-backend communication
  - Handles preflight requests
  - Configures allowed origins

#### Authentication & Security
- **bcryptjs (^3.0.2)**: Password hashing library
  - Securely hashes passwords
  - Provides salt generation
  - Enables secure password comparison

- **jsonwebtoken (^9.0.2)**: JWT implementation
  - Creates and verifies authentication tokens
  - Handles token expiration
  - Manages user sessions

#### Email & Communication
- **nodemailer (^7.0.5)**: Email sending library
  - Sends password reset emails
  - Handles SMTP configuration
  - Manages email templates

#### Real-time Features
- **socket.io (^4.8.1)**: Real-time bidirectional communication
  - Enables live updates
  - Handles WebSocket connections
  - Manages real-time event broadcasting

#### Environment & Configuration
- **dotenv (^16.5.0)**: Environment variable management
  - Loads configuration from .env files
  - Manages sensitive data
  - Provides environment-specific settings

### Frontend Dependencies

#### Core React
- **react (^18.3.1)**: UI library
  - Component-based architecture
  - Virtual DOM management
  - State and lifecycle management

- **react-dom (^18.3.1)**: React DOM rendering
  - Renders React components to DOM
  - Handles DOM updates
  - Manages component mounting

#### Routing & Navigation
- **react-router-dom (^6.30.1)**: Client-side routing
  - Handles page navigation
  - Manages route protection
  - Provides navigation components

#### UI Components & Styling
- **@headlessui/react (^1.7.19)**: Unstyled UI components
  - Provides accessible components
  - Handles focus management
  - Manages component state

- **@heroicons/react (^2.2.0)**: Icon library
  - Provides consistent iconography
  - Handles icon sizing and styling
  - Manages icon accessibility

- **lucide-react (^0.344.0)**: Additional icon library
  - Extends icon options
  - Provides modern icon designs
  - Maintains consistency

#### Styling & CSS
- **tailwindcss (^3.4.1)**: Utility-first CSS framework
  - Provides utility classes
  - Handles responsive design
  - Manages design system

- **autoprefixer (^10.4.18)**: CSS vendor prefixing
  - Ensures cross-browser compatibility
  - Automatically adds vendor prefixes
  - Handles CSS compatibility

- **postcss (^8.4.35)**: CSS processing tool
  - Processes CSS with plugins
  - Handles CSS transformations
  - Manages CSS workflow

#### Charts & Data Visualization
- **chart.js (^4.5.0)**: Charting library
  - Creates interactive charts
  - Handles data visualization
  - Provides chart customization

- **react-chartjs-2 (^5.3.0)**: React wrapper for Chart.js
  - Integrates Chart.js with React
  - Handles chart lifecycle
  - Manages chart updates

- **chartjs-plugin-datalabels (^2.2.0)**: Chart.js plugin
  - Adds data labels to charts
  - Handles label positioning
  - Manages label formatting

#### HTTP Client
- **axios (^1.10.0)**: HTTP client library
  - Makes API requests
  - Handles request/response interceptors
  - Manages error handling

#### Date & Time
- **date-fns (^4.1.0)**: Date utility library
  - Handles date formatting
  - Provides date manipulation
  - Manages timezone handling

#### Email Integration
- **@emailjs/browser (^4.4.1)**: Email service integration
  - Handles email sending from frontend
  - Manages email templates
  - Provides email validation

#### Development Tools
- **vite (^5.4.2)**: Build tool and dev server
  - Provides fast development server
  - Handles module bundling
  - Manages build optimization

- **eslint (^9.9.1)**: Code linting tool
  - Enforces code quality
  - Identifies potential errors
  - Maintains code consistency

---

## Setup & Configuration

### Environment Variables Required

#### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/crm-system

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Optional
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

### Installation Steps

#### Backend Setup
```bash
cd backend
npm install
npm start
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create database named 'crm-system'
3. Collections will be created automatically

---

## Deployment

### Backend Deployment (Vercel)
- Uses `vercel.json` configuration
- Automatic deployment from Git
- Environment variables configured in Vercel dashboard

### Frontend Deployment (Vercel)
- Build command: `npm run build`
- Output directory: `dist`
- Automatic deployment from Git

### Production Considerations
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure CORS for production domains
- Set up proper email service credentials
- Enable HTTPS in production

---

## Key Features Summary

### ✅ Implemented Features
- Complete user authentication system
- Role-based access control
- Customer relationship management
- Project tracking and management
- Task management with priorities
- Activity logging and history
- Calendar and event management
- Real-time updates via WebSocket
- Email notifications and password reset
- Comprehensive analytics dashboard
- Data export (PDF/CSV)
- Responsive design with Tailwind CSS
- Dark mode support
- Admin panel for user management

### 🔧 Technical Features
- RESTful API architecture
- JWT-based authentication
- MongoDB with Mongoose ODM
- Real-time communication
- File upload capabilities
- Email integration
- Chart.js data visualization
- PDF generation
- CSV export functionality

### 📱 User Experience
- Intuitive dashboard design
- Real-time data updates
- Responsive mobile design
- Dark/light theme toggle
- Interactive charts and graphs
- Quick action buttons
- Search and filter capabilities
- Export and sharing options

This CRM system provides a comprehensive solution for managing customer relationships, projects, and business operations with modern web technologies and a focus on user experience and data security.
