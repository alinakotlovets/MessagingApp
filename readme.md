# Messaging App

Messaging App is a real-time communication platform that supports private and group conversations. Users can search for others, create chats, and exchange messages in both one-on-one and group environments.

The system includes role-based access control inside group chats, where admins can manage participants and moderate content. Users can also personalize their profiles and share images directly in conversations.

Real-time message updates are implemented using polling, ensuring that users receive new messages without manual refresh.


## Architecture & Tech Stack

The project is split into two main parts: a backend service and a frontend client.

The backend is built with Node.js and Express using TypeScript. It handles authentication, messaging logic, file uploads, real-time updates (via polling), and database interactions through Prisma with a PostgreSQL database. Additional services such as email verification and image storage are integrated through external providers.

The frontend is built with React and TypeScript using Vite as the build tool. It provides the user interface for authentication, chat management, real-time messaging, and profile interactions. Client-side routing is handled through React Router.


## Key Features

- Real-time private and group messaging
- Group chat roles with admin permissions (manage users and moderate content)
- User authentication with email verification
- Profile customization with avatar support
- Image sharing inside chats
- Search and create private or group conversations


## Core Entities

The system is built around a real-time messaging model with users, chats, messages, and verification flow.

**User** represents a registered account in the system. Each user has authentication credentials, profile information, and optional avatar. Users can participate in multiple chats, send messages, and receive verification codes during the registration process. A user becomes fully active only after email verification.

**Chat** is the central communication unit. It can be either private (between two users) or group-based. Each chat stores metadata such as name and avatar (for group chats) and keeps information about the last message to optimize UI rendering. Chats act as containers for messages and participants.

**ChatUser** is a junction entity that connects users with chats. It defines membership inside a chat and also stores the user’s role within that chat (regular user or admin). This is where permissions are enforced, such as adding or removing participants or moderating messages.

**Message** represents a single piece of communication inside a chat. It belongs to a sender and a chat, and can be either a text message or an image. Messages support editing and are ordered by creation time to maintain conversation flow.

**Code** is used for email verification. It is linked to a user and contains a time-limited verification code that must be confirmed before the account becomes active.


## Database Overview
![Database schema.png](frontend/src/assets/Database%20schema.png)


## Getting Started

To run the project locally, start by cloning the repository and installing dependencies in both frontend and backend directories.

Before starting the application, install backend dependencies and generate the Prisma client:

```bash
npx prisma generate
```

Then configure environment variables in the backend. Rename .env.example to .env and fill in all required values:

FRONTEND_LINK=

DATABASE_URL=

JWT_SECRET_KEY=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

SENDGRID_API_KEY=

SENDGRID_TEMPLATE_ID=


These variables are required for database connection, authentication, email verification, and file storage integration.

After environment setup, start both parts of the application in separate terminals:

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```