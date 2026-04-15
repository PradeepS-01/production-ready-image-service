# 📸 Image-Serve

A Dockerized image upload and serving application built with **Node.js (Express)**, **Nginx**, and **Docker Compose**.

Upload single or multiple images via a clean web UI, get shareable links instantly, and serve them through a high-performance Nginx reverse proxy.

---

## 🏗 Project Structure

```
image-serve/
├── docker-compose.yaml        # Orchestrates all services
├── nginx.conf                 # Nginx routing and proxy config
├── .gitignore
├── .dockerignore
├── backend/
│   ├── Dockerfile             # Backend container configuration
│   ├── server.js              # Express API — handles uploads
│   ├── package.json
│   └── uploads/               # Uploaded images (auto-created)
└── frontend/
    ├── index.html             # Upload UI
    ├── script.js              # Client-side logic
    └── style.css              # Styles for upload result cards
```

---

## ⚙️ How It Works

```
Browser (port 8080)
      │
      ▼
  Nginx Container
  ├─ GET  /           → Serves frontend (index.html)
  ├─ POST /api/upload → Proxies to backend:5000/upload
  └─ GET  /images/    → Serves uploaded images from disk
      │
      ▼
  Backend Container (Node.js:5000)
  └─ Saves images to /app/uploads
  └─ Returns relative image URLs to the browser
```

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed and running
- [Docker Compose](https://docs.docker.com/compose/) (included with Docker Desktop)

### Run the Application

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd image-serve

# 2. Build and start the containers
docker compose up --build

# 3. Open the app in your browser
open http://localhost:8080
```

### Stop the Application

```bash
docker compose down
```

---

## 🔌 API Reference

### `POST /api/upload`

Uploads one or more images.

**Form Body (multipart/form-data)**

| Field        | Type     | Required | Description                                    |
| :----------- | :------- | :------- | :--------------------------------------------- |
| `images`     | `file[]` | ✅ Yes   | One or more image files                        |
| `uploadType` | `string` | ✅ Yes   | `"single"` or `"multiple"`                     |
| `folderName` | `string` | ⬜ No   | Subfolder name (required when type=`multiple`) |

**Response (200 OK)**

```json
{
  "urls": [
    "/images/my-folder/3f4a...-uuid.jpg",
    "/images/my-folder/8c2b...-uuid.png"
  ]
}
```

---

## 🖼 Viewing Images

After uploading, images are accessible directly via Nginx:

```
http://localhost:8080/images/<filename>
http://localhost:8080/images/<folder>/<filename>
```

To browse all uploaded images, open the images directory in your browser:

```
http://localhost:8080/images/
```

---

## 🐳 Service Details

| Service   | Technology     | Internal Port | External Port |
| :-------- | :------------- | :------------ | :------------ |
| `backend` | Node.js 18     | 5000          | Not exposed   |
| `nginx`   | Nginx (latest) | 80            | **8080**      |

---

## 📦 Tech Stack

- **[Express.js](https://expressjs.com/)** — Node.js web framework
- **[Multer](https://github.com/expressjs/multer)** — Multipart file upload middleware
- **[Nginx](https://nginx.org/)** — Reverse proxy and static file server
- **[Docker Compose](https://docs.docker.com/compose/)** — Multi-container orchestration
- **Vanilla JS + HTML + CSS** — Frontend UI

---

## 🗃 Data Persistence

Uploaded images are stored on your **host machine** via a Docker volume:

```yaml
- ./backend/uploads:/app/uploads
```

This means uploaded images **persist even if the containers are stopped or removed**.

---

## 🛠 Development Notes

- The backend uses Node's built-in `crypto.randomUUID()` to generate unique filenames, preventing name collisions.
- The frontend sends requests to `/api/upload` (a relative path), which Nginx proxies to the backend internally. No hardcoded ports in the frontend.
- CORS is enabled on the backend for development flexibility.
