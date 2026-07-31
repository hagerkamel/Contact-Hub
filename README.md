# ContactHub — Smart Contact Manager

A responsive contact management web app built with vanilla JavaScript, Bootstrap 5, and SweetAlert2. Add, edit, search, favorite, and flag contacts as emergency contacts — all stored locally in the browser.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![SweetAlert2](https://img.shields.io/badge/SweetAlert2-FF6B6B?style=for-the-badge&logo=javascript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## ✨ Features

- Add / edit / delete contacts with live field validation (name, Egyptian phone format, optional email)
- Mark contacts as **Favorite** ⭐ or **Emergency** 🩺 with quick-access side panels
- Live search by name or phone number
- Profile photo upload with instant preview
- Fully responsive layout (mobile, tablet, desktop)
- Data persisted in `localStorage` — no backend required


## 🧩 Tech Stack

| Layer          | Tools                              |
|----------------|-------------------------------------|
| Structure      | HTML5                               |
| Styling        | CSS3, Bootstrap 5, Font Awesome     |
| Logic          | Vanilla JavaScript (ES6)            |
| Alerts/Modals  | SweetAlert2                         |
| Storage        | Browser `localStorage`              |

## 📁 Project Structure

```
contacthub/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── images/
│   └── (uploaded avatars & default assets)
└── README.md
```

## 🔄 App Flow

```mermaid
flowchart TD
    A[Open App] --> B[loadContacts from localStorage]
    B --> C[Render Contact List + Summary Counts]

    D[Click + Add Contact] --> E[Fill Form]
    E --> F{Validate Fields}
    F -- Invalid --> G[Show Error Alert]
    G --> E
    F -- Valid --> H[Save Contact to Array + localStorage]

    H --> C
    H --> I[Update Favorites Panel]
    H --> J[Update Emergency Panel]

    C --> K[Toggle Favorite / Emergency]
    K --> H

    C --> L[Edit Contact]
    L --> E

    C --> M[Delete Contact]
    M --> N{Confirm Delete?}
    N -- Yes --> H
    N -- No --> C
```

## 🏗️ File Relationships

```mermaid
graph LR
    HTML[index.html] --> CSS[style.css]
    HTML --> JS[script.js]
    JS --> LS[(Browser localStorage)]
    JS --> Swal[SweetAlert2 CDN]
    HTML --> BS[Bootstrap 5 CDN]
    HTML --> FA[Font Awesome CDN]
```

## 🚀 Getting Started

No build step needed — it's a static site.

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

Then just open `index.html` in your browser, or serve it locally:

```bash
# Option 1: VS Code Live Server extension
# Option 2: Python
python3 -m http.server 5500
```

## 📄 License

This project is licensed under the MIT License.
