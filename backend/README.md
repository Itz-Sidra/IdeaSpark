## 🧠 Backend Documentation  
**Project:** *AI-Powered Problem Statement Generator*  
**Mode:** MVP (Minimum Viable Product)  
**Stack:** Node.js (Express), JavaScript, Prisma ORM, PostgreSQL

---

## 🚀 Core Features (Backend API)

### ✅ 1. **User Authentication (JWT-based)**
- `POST /auth/signup`  
- `POST /auth/login`  
- `GET /auth/profile` *(protected)*  
- Middleware: JWT verification  
- Password Hashing: `argon2` or `bcrypt`  

---

### ✅ 2. **Idea Generation**
- `POST /ideas/generate`  
  **Inputs:**  
  - Programming Language(s)  
  - Hardware  
  - Domain   

  **Output:**  
  - AI-generated idea (dummy for now)  
  - Metadata: Timestamp, user ID

- `GET /ideas/history` *(protected)*  
  - Fetches user’s generated ideas

---

### ✅ 3. **Saved Ideas**
- `POST /ideas/save`  
  - Save an idea  
- `GET /ideas/saved`  
  - Get saved ideas  
- `DELETE /ideas/:id`  
  - Delete saved idea

---

### ✅ 4. **Edit & Regenerate**
- `POST /ideas/regenerate/:id`  
  - Generate another idea based on old input  
- `PUT /ideas/edit/:id`  
  - Manually edit idea input

---

## 🧰 Tech Stack Overview

| Part            | Tech           |
|-----------------|----------------|
| Server          | Node.js + Express |
| Language        | JavaScript     |
| DB              | PostgreSQL     |
| ORM             | Prisma         |
| Auth            | JWT + argon2   |
| Validation      | zod / express-validator |
| Hosting         | Railway / Render / GCP free tier |
| Deployment CI   | GitHub Actions |
| API Testing     | Thunder Client / Postman |

---

## 🧠 AI Integration Plan

Since **OpenAI is costly**, we’ll do this:

### 📌 Phase 1: Dummy Ideas
- No actual AI
- Use predefined random ideas from an array
- Gives an illusion of “AI idea generation”

### 📌 Phase 2: Free AI Options (if needed)
- Try integrating:
  - [`Gemini (Bard) API`](https://developers.generativeai.google/) — free with Google Cloud account
  - [`HuggingFace Inference`](https://huggingface.co/inference-api) (some are free)

---

## 🧱 API Folder Structure Suggestion

```
📁 backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── prisma/
│   ├── utils/
│   └── index.js
├── .env
├── tsconfig.json
├── package.json
└── README.md

src/
│
├── controllers/          # Contains business logic
│   └── auth.controller.js   # Signup, login logic
│
├── middlewares/          # Contains middleware (e.g., authentication checks)
│   └── auth.middleware.js   # Check for valid JWT
│
├── routes/               # Contains route definitions
│   └── auth.routes.js     # Defines routes for signup/login
│
├── server.js             # Main entry point to initialize the app
│
└── .env                  # Store environment variables (DB URL, JWT secret, etc.)
```

---

## 🔒 .env File Example

```
DATABASE_URL=postgresql://user:password@localhost:5432/asep
JWT_SECRET=your-super-secret
PORT=3000
```

---

## 📌 Dev Notes:
- Set up Prisma schema: `User`, `Idea`
- Use Docker if needed (optional)
- Avoid AI API for now; mock everything
- Keep CORS enabled for frontend testing
- Use Thunder Client or Postman to test APIs

---