# SkillLink - Service Marketplace Platform

A modern, professional, mobile-responsive full-stack service marketplace website connecting customers with verified local workers.

## Tech Stack

**Frontend:**
- Next.js 15
- React 19
- Tailwind CSS
- Framer Motion
- TypeScript
- Axios

**Backend:**
- Node.js
- Express.js
- SQLite (or PostgreSQL)
- Sequelize ORM
- JWT Authentication
- bcryptjs for password hashing
- CORS

## Project Structure

```
skilllink/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Worker.js
│   │   ├── Service.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   ├── Review.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── services.js
│   │   ├── bookings.js
│   │   └── workers.js
│   ├── middleware/
│   │   └── auth.js
│   ├── index.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx (Home)
    │   │   ├── layout.tsx
    │   │   ├── services/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/
    │   │   │       └── page.tsx
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   ├── register/
    │   │   │   └── page.tsx
    │   │   └── dashboard/
    │   │       ├── customer/
    │   │       │   └── page.tsx
    │   │       ├── worker/
    │   │       │   └── page.tsx
    │   │       └── admin/
    │   │           └── page.tsx
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   └── Footer.tsx
    │   └── lib/
    │       └── context/
    │           └── AuthContext.tsx
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd skilllink/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   PORT=5001
   DB_NAME=skilllink
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Start the backend server:
   ```bash
   node index.js
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd skilllink/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3000`

## Features

### Customer Features
- Browse services
- Book workers
- Schedule appointments
- View worker profiles
- Track bookings
- Leave ratings/reviews (placeholder)

### Worker Features
- Create profiles
- Upload verification details
- Manage availability
- Accept/reject jobs
- Track earnings (placeholder)
- View ratings/reviews

### Admin Features
- Manage users/workers
- Verify workers
- Handle disputes (placeholder)
- Manage bookings
- View analytics (placeholder)

## Database Models

- **User**: Stores customer, worker, and admin information
- **Worker**: Worker-specific details including skills, availability, and verification status
- **Service**: Service categories (Plumbing, Electrical, Cleaning, etc.)
- **Booking**: Booking details including status, schedule, and customer information
- **Payment**: Payment records (placeholder)
- **Review**: Ratings and reviews (placeholder)
- **Notification**: User notifications (placeholder)

## Deployment

### Frontend Deployment (Vercel)

1. **Sign up for Vercel**:
   - Go to [https://vercel.com](https://vercel.com) and create an account

2. **Deploy using Vercel Dashboard**:
   - Click "Add New" → "Project"
   - Import your GitHub/GitLab/Bitbucket repository
   - In the configuration:
     - **Root Directory**: Select `frontend`
     - **Framework Preset**: Next.js (should be auto-detected)
   - Click "Deploy"

3. **Or Deploy using Vercel CLI**:
   ```bash
   # Install Vercel CLI (if not already installed)
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Deploy from project root
   cd /Users/mani/Documents/trae_projects/AI\ Proctoring\ Website/skilllink
   vercel
   ```

### Backend Deployment (Render.com)

1. **Sign up for Render**:
   - Go to [https://render.com](https://render.com) and create an account

2. **Deploy Backend**:
   - Click "New" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name**: skilllink-backend
     - **Region**: Choose the closest to you
     - **Branch**: main (or your default branch)
     - **Root Directory**: backend
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node index.js`
   - Add Environment Variable:
     - `JWT_SECRET` = (generate a secure random string, e.g., using `openssl rand -base64 32`)
     - `PORT` = 10000 (Render uses this port automatically)
   - Click "Create Web Service"

3. **Update Frontend API URL**:
   After deploying the backend, update your frontend code to use your new backend URL instead of `http://localhost:5001`

### Environment Variables

Make sure to set these environment variables in your Vercel project:
- (Future: `NEXT_PUBLIC_API_URL` = your deployed backend URL)

## Security

- Password hashing with bcryptjs
- JWT-based authentication
- Protected API routes
- Role-based authorization
- Input validation

## Future Enhancements

- Real-time booking updates with Socket.io
- Live location tracking
- AI-based worker recommendations
- Chat system between customers and workers
- Payment gateway integration (Razorpay/Stripe)
- Advanced analytics and reporting
- Mobile app
