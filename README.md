# Library Management System - Frontend

A modern, responsive React single-page application (SPA) for managing library catalog, student members, and book issue/return operations.

## Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios (configured with `withCredentials: true` for HTTP sessions)
- **Routing**: React Router v7
- **Deployment**: Vercel (`vercel.json` same-origin API reverse proxy)

## Project Structure

```
├── public/              # Static public assets
├── src/
│   ├── components/      # UI components (Layout, Navigation, Alerts)
│   ├── pages/           # Pages (Login, Register, Dashboard, Books, Members, IssueReturn)
│   ├── api.js           # Axios instance with same-origin /api proxy configuration
│   ├── App.jsx          # Route definitions and session authentication listener
│   ├── main.jsx         # Application entry point
│   └── index.css        # Tailwind directives and design system tokens
├── index.html           # SPA root HTML
├── tailwind.config.cjs  # Tailwind CSS configuration
├── vite.config.js       # Vite configuration
└── vercel.json          # Production API proxy rewrite and SPA route fallback
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Server

```bash
npm run dev
```

The frontend will run locally on `http://localhost:5173`. By default in development, API requests point to `http://localhost:8081/api`.

### 3. Production Build

```bash
npm run build
```

The built production bundle is output to `dist/`.

## Environment Variables

- `VITE_BACKEND_URL`: *(Optional)* Backend API base URL for local development. Default: `http://localhost:8081/api`.
  *(In production on Vercel, requests automatically route through relative `/api` via `vercel.json`).*

## Production Deployment

This repository is ready for deployment on **Vercel**:
- Root Directory: `.`
- Build Command: `npm run build`
- Output Directory: `dist`
- The included `vercel.json` handles both reverse-proxying `/api/:path*` to the backend and rewriting SPA routes to `/index.html`.
