# IdeaSpark

An AI-Powered Problem Statement Generator for Tech & Hardware-Based Projects. IdeaSpark is your one-stop solution for brainstorming, and evolving concepts into realities.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)

---

## Overview

IdeaSpark is built to simplify project idea generation across domains. Provides real-time, customized, and relevant ideas based on user inputs. Offers secure access, storage, and retrieval of ideas for future reference. Empowers students, educators, and professionals with a smart ideation assistant.
---

## Features

- **AI-Powered Idea Generation**
  - Integrates Google’s **Gemini 2.0 Flash model** via Vertex AI.
  - Accepts inputs like domain, language, and hardware stack.
  - Generates innovative and tailored problem statements in real-time.

- **Secure User Authentication**
  - Passwords hashed with **Bcrypt**.
  - Stateless session handling with **JWT**.

- **Smart Prompt Engineering**
  - Backend builds structured prompts dynamically.
  - Gemini API processes the prompts for idea generation.

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (via Prisma ORM, hosted on NeonDB)
- **AI:** Google Gemini 2.0 Flash
- **Authentication & Security:** Bcrypt, JWT
- **Deployment:** Vercel

---

## Installation

Follow these steps to get IdeaSpark running locally:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Itz-Sidra/IdeaSpark.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd IdeaSpark
   ```

3. **Install Dependencies**

     ```bash
     npm install
     ```

4. **Environment Configuration**
   
   Create a `.env` file in the root directory and add your keys:

   ```env
   DATABASE_URL=your-neondb-url
   JWT_SECRET=your-jwt-secret
   GEMINI_API_KEY=your-gemini-api-key
   ```

5. **Database Setup**

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
---
## Usage

### Start Development Server

```bash
node server.js
```

Visit: [http://localhost:3000](http://localhost:3000)
