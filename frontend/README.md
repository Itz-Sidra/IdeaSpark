## 🌐 Frontend Documentation  
**Project:** *AI-Powered Problem Statement Generator*  
**Mode:** Light Mode (for now)  
**Stack:** HTML, CSS, JavaScript (Vanilla)  

---

## 🎨 Figma Design  
> ✨ View our UI prototype on Figma:  
[ASEP-2 Figma Design (Frontend UI)](https://www.figma.com/design/QxIg6pQoJriiBLHNceVbIH/ASEP-2?t=wPYFnV7LphlW0gMk-1)

---

## 🧱 Frontend Stack

- HTML  
- CSS  
- JavaScript (Vanilla)

---

## 🎨 Design Guidelines:
- Clean, minimalistic, modern
- Responsive layout (mobile + desktop)
- Soft tones, smooth transitions
- Fonts: Google Fonts like Poppins, Inter, or Open Sans
- Icons: Use [Heroicons](https://heroicons.com/) or [Font Awesome](https://fontawesome.com/) (open source)

---

## 🧱 Pages & UI Components:

### ✅ 1. **Common Layout (All Pages)**
- **🔝 Header:**
  - Logo (left)
  - Navbar (right):  
    `Home | How It Works / About Us | Generate Idea | Contact Us`

- **🔚 Footer:**
  - “Made with ❤️ by Team”  
  - GitHub repo link (icon): [🔗 View on GitHub](https://github.com/Itz-Sidra/ASEP2)

---

### 🏠 2. **Home Page**
- **Hero Section:**
  - **Tagline:**  
    > “Struggling to find a project idea? Let AI do it for you.”
  - **Call-to-Action Button:**  
    `Generate My Project Ideas`
    - Redirect to: `/generate.html`

- **Extra:**  
  Add creative content — a small paragraph or animation, maybe a Lottie JSON or static SVG. Up to you guys!

---

### 🧠 3. **Idea Generator Page (`/generate.html`)**
**🧩 Main Section:**
- Form Inputs:
  - ✅ **Select Software Language**  
    Dropdown/Checkbox: HTML, Python, Java, C++, etc.
  - ✅ **Select Hardware Component**  
    Dropdown/Checkbox: Arduino, Raspberry Pi, etc.
  - ✅ **Domain (Optional)**  
    Textbox/Dropdown/Checkbox (e.g., “Healthcare”, “Security”)

- **🔘 Submit Button**: `Generate Idea`

**📦 Output Box (after submission):**
- Area to display generated idea
- Buttons:
  - `✏️ Edit` → edit inputs
  - `🔄 Another Idea`
  - `💾 Save Idea`
  - `📋 Copy`

---

### 👤 4. **User Profile Page (`/profile.html`)**
- **Profile Section:**
  - User details (Name, Email, etc.)
- **Saved Ideas Section:**
  - List of saved project ideas
  - Option to delete or copy

- **History Section:**
  - List of previously generated ideas (optional)

---

### 🔐 5. **Login / Signup Pages**
- Basic, clean forms with:
  - Email + password (optional: confirm password for signup)
  - Submit Button
  - Toggle link: “Don’t have an account? Signup” / “Already have an account? Login”

---

## 🖥️ UI Pages Overview

### 1. `index.html` - Home Page
- Hero section with tagline  
- CTA: “Generate My Project Ideas” button  
- Navigation bar + footer

### 2. `generate.html` - Idea Generator
- Select programming language
- Select hardware (optional)
- Enter domain (optional)
- Idea display area with:
  - Regenerate / Edit / Save / Copy

### 3. `profile.html` - User Profile
- Saved ideas
- Generation history
- Basic profile details

### 4. `login.html` / `signup.html`
- Simple user auth forms

### 5. `about.html` / `contact.html`
- Informational + feedback


---

## 📁 Folder Structure Suggestion

```
📁 public/
├── index.html
├── generate.html
├── profile.html
├── login.html
├── signup.html
├── about.html (or how-it-works.html)
├── contact.html
📁 css/
│   └── styles.css
📁 js/
│   └── main.js
📁 assets/
│   ├── logo.png
│   ├── icons/
│   └── images/
```

---

## 🧠 Notes for Team:

- Only light mode required for now.
- Make sure `generate.html` is highly intuitive and fun to use!
- Don’t stress on backend or AI right now — just dummy text boxes and output containers are fine.

---
