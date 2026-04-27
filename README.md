###### Coder Santiago Chaparro ⛴︎

# Active Orders Manager

A modern web application for managing active orders in real time. Built with Next.js, React, and PostgreSQL.

## What This App Does

This application helps teams track and manage customer orders through every stage — from pending to in progress to delivered. It includes secure user authentication, role-based permissions, and live order updates without needing to refresh the page.

## Main Features

- **User Authentication** — Secure login and registration using JSON Web Tokens (JWT). Access tokens and refresh tokens are stored in HTTP-only cookies for better security.
- **Role-Based Access** — Two user roles: `admin` and `user`. Only admins can delete orders.
- **Order Management** — Create, read, update, and delete orders. Each order includes a client name, list of products, total price, and current status.
- **Order Items** — Every order can contain multiple products with individual prices and quantities.
- **Status Workflow** — Orders move through three statuses: `PENDING` → `IN_PROGRESS` → `DELIVERED`.
- **Real-Time Updates** — The orders page receives live updates using Server-Sent Events (SSE). When any order changes, it updates automatically on all connected screens.
- **Status Filtering** — Quickly filter orders by status: All, Pending, In Progress, or Delivered.
- **Pagination** — Orders are loaded in pages of 10 to keep the interface fast and clean.
- **Protected Routes** — API routes and pages require authentication. Unauthenticated users are redirected to the login page.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | React framework for the web app |
| React 19 | UI library |
| TypeScript | Type-safe code |
| Tailwind CSS 4 | Utility-first styling |
| Prisma 7 | Database ORM |
| PostgreSQL | Relational database |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT creation and verification |

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Database models
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Login, register, logout, me, refresh
│   │   │   └── orders/        # Orders CRUD + SSE stream
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── orders/            # Main orders dashboard
│   │   └── page.tsx           # Redirects to /orders
│   ├── lib/
│   │   ├── auth.ts            # Authentication helpers
│   │   ├── jwt.ts             # Token utilities
│   │   └── prisma.ts          # Prisma client setup
│   └── utils/
│       ├── cookies.ts         # Cookie handling
│       └── response.ts        # Response helpers
├── create-user.mjs            # Seed script for demo users
└── package.json
```

## Database Models

### User
- `id` — Unique identifier
- `email` — Unique email address
- `name` — Full name
- `password` — Hashed password
- `role` — `admin` or `user`
- `status` — `ACTIVE` or inactive

### Order
- `id` — Unique identifier
- `client` — Customer name
- `total` — Order total price
- `status` — `PENDING`, `IN_PROGRESS`, or `DELIVERED`
- `items` — Related order items

### OrderItem
- `id` — Unique identifier
- `name` — Product name
- `price` — Unit price
- `quantity` — Amount purchased
- `orderId` — Parent order reference

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd view-ordenes-activas
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root folder and add:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-secret-key-for-access-tokens"
REFRESH_SECRET="your-secret-key-for-refresh-tokens"
```

### 4. Set Up the Database

Run the Prisma migrations to create the tables:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

### 5. Seed Demo Users

Create the default admin and regular user accounts:

```bash
node create-user.mjs
```

Default credentials:
| Role | Email | Password |
|---|---|---|
| Admin | `admin@test.com` | `admin123` |
| User | `user@test.com` | `user123` |

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

### Authentication

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Log in and receive tokens |
| POST | `/api/auth/logout` | Clear authentication cookies |
| GET | `/api/auth/me` | Get current user info |
| POST | `/api/auth/refresh` | Refresh access token |

### Orders

| Method | Route | Description |
|---|---|---|
| GET | `/api/orders` | List orders with optional `status` filter and `page` |
| POST | `/api/orders` | Create a new order |
| GET | `/api/orders/stream` | Server-Sent Events stream for live order updates |
| PUT | `/api/orders/[id]` | Update an order (status or items) |
| DELETE | `/api/orders/[id]` | Delete an order (admin only) |

## Authentication Flow

1. The user submits their email and password to `/api/auth/login`.
2. The server checks the credentials and creates two tokens:
   - **Access token** — short-lived, used for API requests.
   - **Refresh token** — long-lived, used to get a new access token.
3. Both tokens are sent to the browser as HTTP-only cookies.
4. Every API request includes the access token automatically via cookies.
5. When the access token expires, the refresh token requests a new one silently.
6. Logging out clears both cookies.

## Real-Time Orders

The `/api/orders/stream` endpoint uses Server-Sent Events. The frontend connects to this stream and receives a fresh list of all orders every 2 seconds. This allows multiple users to see order changes instantly without refreshing the browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the app for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `node create-user.mjs` | Seed demo users into the database |

## License

MIT
