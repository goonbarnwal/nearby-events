# NearEvent 📍 - Real-Time Hyperlocal Event Discovery & Management Platform

NearEvent is an intelligent full-stack local event discovery web application that helps users find, bookmark, register for, and publish events happening around them in any city.

---

## 🌟 Key Features

- **📍 Hyperlocal Location & Distance Matching**: Find real-time upcoming events categorized by exact distance in kilometers from your current or searched location.
- **🔍 Multi-City & Global Search**: Search events across Indian hubs (Pune, Delhi NCR, Mumbai, Bengaluru, Patna, Kolkata, etc.) and global cities.
- **🤖 AI-Powered Event Summaries**: Integrated Google Gemini 2.5 AI for automated concise event digests and personalized event recommendations.
- **🎫 Real Event Registration Links**: Connect directly to active registration portals (Devfolio, Eventbrite, Meetup, Townscript, Luma, etc.).
- **🔐 User Authentication**: Support for Email + Password, Google One-Tap & OAuth, with JWT session handling and role-based access control (Admin & User roles).
- **📝 Event Publishing & Management**: Create new events with interactive geolocation lookup, venue detection, and admin approval capabilities.
- **🗺️ Interactive OpenStreetMap**: Live map view with interactive markers displaying event locations in real-time.
- **💾 Persistence**: Dual-mode storage using MongoDB Atlas with fallback memory store.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons, Motion animations
- **Backend**: Express.js (Node.js runtime)
- **Database**: MongoDB Atlas (via Mongoose)
- **AI Integration**: `@google/genai` (Google Gemini)
- **Maps & Geocoding**: Leaflet / OpenStreetMap / Nominatim API
- **Auth**: JWT, Bcrypt.js, Google OAuth 2.0 Client Library

---

## 🚀 Local Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/nearevent.git
cd nearevent
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Define the variables in `.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nearevent?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build

```bash
npm run build
npm start
```

---

## 📄 License
MIT
