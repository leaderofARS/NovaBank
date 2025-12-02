# 📂 Public Directory

The `public/` directory serves **static assets** for the NovaBank application. These files are accessible directly by the client's browser and are not processed by the server logic.

## 📦 Contents

### 🎨 CSS (Stylesheets)
- **`styles.css`**: The main stylesheet for the application. It defines the visual theme, layout, and responsiveness of the web pages.
- *(If you have other CSS files, list them here)*

### 🖼️ Images & Icons
- Stores logos, banners, icons, and other graphical assets used in the UI.
- Example: `logo.png`, `background.jpg`.

### 📜 JavaScript (Client-Side)
- Contains scripts that run in the browser to enhance interactivity (e.g., form validation, dynamic UI updates).
- *Note: Core business logic is handled in the backend (`server.js`), not here.*

## 🚀 Usage
In your EJS views, these assets are referenced relative to the root:
```html
<link rel="stylesheet" href="/styles.css">
<img src="/logo.png" alt="NovaBank Logo">
```
(Express is configured to serve this folder as static: `app.use(express.static('public'))`)
