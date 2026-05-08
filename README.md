# StoryVault 📰

<img width="1905" height="861" alt="Screenshot 2026-05-08 194658" src="https://github.com/user-attachments/assets/7ef0ed4b-deff-47c9-8b45-b2dec2ca55ff" />


<img width="1921" height="975" alt="Screenshot 2026-05-08 194732" src="https://github.com/user-attachments/assets/d996cb90-1323-4585-b0fa-8ba811be383d" />


<img width="1918" height="967" alt="image" src="https://github.com/user-attachments/assets/7342436c-fd43-4b59-9cbf-d41f3bb3391c" />


A full-stack web application that scrapes stories from [tech News](https://news.ycombinator.com/), stores them in MongoDB, and serves them through a clean, modern interface with authentication and bookmarking features.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [How to Run the Project Locally](#how-to-run-the-project-locally)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)

---

## Features

- 🔍 **Web Scraper** – Scrapes Hacker News for stories using Axios + Cheerio
- 🗄️ **MongoDB Storage** – Stories are persisted and deduplicated using Mongoose upsert
- 🔒 **User Authentication** – Secure register/login using JWT tokens stored in HTTP-only cookies
- 🔖 **Bookmark Stories** – Logged-in users can save and remove bookmarks
- 📄 **Bookmarks Page** – Protected page showing only your saved stories
- ⚛️ **React Context API** – Global auth state managed via `AuthContext`

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router DOM
- Lucide React (Icons)
- Vanilla CSS

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Cheerio (HTML parsing)
- Axios (HTTP requests)
- JWT (Authentication)
- Bcrypt (Password hashing)
- Cookie-parser

---

## Setup Instructions

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- A MongoDB instance – either [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud) or a local MongoDB server

### 1. Clone the Repository

```bash
git clone https://github.com/Rajan167030/storyvault.git
cd storyvault
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Then fill in your values (see [Environment Variables](#environment-variables) below).

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable      | Description                                | Example                              |
|---------------|--------------------------------------------|--------------------------------------|
| `MONGO_URI`   | MongoDB connection string                  | `mongodb+srv://user:pass@cluster...` |
| `JWT_SECRET`  | Secret key used to sign JWT tokens         | `my_super_secret_key`                |
| `PORT`        | Port for the Express server (optional)     | `3000`                               |
| `NODE_ENV`    | Environment mode (optional)                | `development`                        |

Example `backend/.env`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abc.mongodb.net/storyvault
JWT_SECRET=your_secret_key_here
PORT=3000
NODE_ENV=development
```

### Frontend (`frontend/`)

The frontend reads the backend URL from a Vite environment variable. Create a `.env` file in the `frontend/` directory if needed:

```env
VITE_API_URL=http://localhost:3000
```

> If no `.env` is set, it defaults to `http://localhost:3000` automatically.

---

## How to Run the Project Locally

You need **two terminals** – one for the backend and one for the frontend.

### Terminal 1 – Start the Backend

```bash
cd backend
npm run dev
```

The server will start on **http://localhost:3000**

> On startup, the server automatically scrapes Hacker News and populates the MongoDB database.

### Terminal 2 – Start the Frontend

```bash
cd frontend
npm run dev
```

The app will open on **http://localhost:5173**

---

## API Endpoints

### Stories

| Method | Endpoint                       | Description                              | Auth Required |
|--------|--------------------------------|------------------------------------------|---------------|
| GET    | `/api/stories`                 | Fetch all stories (sorted by points ↓)   | No            |
| GET    | `/api/stories/:id`             | Fetch a single story by ID               | No            |
| POST   | `/api/stories/scrape`          | Trigger a fresh scrape of Hacker News    | No            |
| POST   | `/api/stories/:storyId/bookmark` | Toggle bookmark on a story             | ✅ Yes        |

### Authentication

| Method | Endpoint              | Description                          | Auth Required |
|--------|-----------------------|--------------------------------------|---------------|
| POST   | `/api/auth/register`  | Register a new user account          | No            |
| POST   | `/api/auth/login`     | Login and receive a session cookie   | No            |
| POST   | `/api/auth/logout`    | Logout and clear session cookie      | No            |
| GET    | `/api/auth/test`      | Verify session and get user data     | ✅ Yes        |

---

## Project Structure

```
storyvault/
├── backend/
│   ├── controller/
│   │   ├── auth.controller.js     # Register, login, logout, bookmark logic
│   │   └── story.controller.js    # Scrape, fetch stories
│   ├── middleware/
│   │   └── user.middleware.js     # JWT auth protection middleware
│   ├── models/
│   │   ├── user.model.js          # User schema
│   │   └── story.model.js         # Story schema
│   ├── routes/
│   │   ├── auth.routes.js         # Auth API routes
│   │   └── story.routes.js        # Story API routes
│   ├── utils/
│   │   ├── mongo.js               # MongoDB connection
│   │   └── generatetoken.js       # JWT token generator
│   ├── .env.example               # Example environment file
│   └── index.js                   # App entry point
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state (React Context API)
    │   ├── App.jsx                # Main app with routes and UI components
    │   ├── App.css                # Component styles
    │   ├── index.css              # Global styles and CSS variables
    │   └── main.jsx               # React app entry point
    └── vite.config.js             # Vite configuration
```

---

## License

MIT
