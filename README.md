# Restaurant Review Portal - Backend

Backend REST API for the **Restaurant Review Portal - Group 3**, developed as part of the MSc group project.

The backend provides the business logic, API endpoints, authentication, restaurant management, review management, and database communication required by the Restaurant Review Portal frontend.

## Technology Stack

* Node.js
* Express.js
* TypeScript
* REST API
* npm
* Database integration

## Prerequisites

Before running the project, make sure the following are installed:

* Node.js
* npm
* Git

## Getting Started

### Run with Docker (backend + database)

For a step-by-step setup, sample data, API checks, and instructions to browse database tables, see the [Docker developer user guide](docs/docker-user-guide.md). Docker exposes the backend at `http://localhost:5001` and PostgreSQL at `localhost:5433`.

### 1. Clone the Repository

```bash
git clone https://github.com/SanjulaDilky/restaurant-review-portal-backend.git
```

### 2. Navigate to the Project

```bash
cd restaurant-review-portal-backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root.

Example:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=
JWT_SECRET=
```

Do not commit the actual `.env` file to GitHub.

An `.env.example` file should be maintained to show the required environment variables.

### 5. Run the Development Server

```bash
npm run dev
```

The API will run at:

```text
http://localhost:5000
```

## Project Structure

```text
src/
├── config/
├── controllers/
│   ├── auth.controller.ts
│   ├── restaurant.controller.ts
│   ├── review.controller.ts
│   └── user.controller.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validation.middleware.ts
├── models/
│   ├── user.model.ts
│   ├── restaurant.model.ts
│   └── review.model.ts
├── routes/
│   ├── auth.routes.ts
│   ├── restaurant.routes.ts
│   ├── review.routes.ts
│   └── user.routes.ts
├── services/
│   ├── auth.service.ts
│   ├── restaurant.service.ts
│   ├── review.service.ts
│   └── user.service.ts
├── utils/
├── app.ts
└── server.ts
```

## Application Architecture

The backend follows a layered architecture:

```text
Client Request
      ↓
Express Route
      ↓
Controller
      ↓
Service
      ↓
Model / Database
      ↓
Response
```

This structure helps separate API routing, business logic, and database operations.

## Main Features

The planned backend functionality includes:

* User registration and authentication
* User profile management
* Restaurant management
* Restaurant search
* Restaurant details
* Review creation
* Review retrieval
* Rating management
* Request validation
* Authentication middleware
* Error handling
* Database integration
* REST API integration with the Next.js frontend

## Example API Structure

Planned API routes may include:

```text
/api/auth
/api/users
/api/restaurants
/api/reviews
```

Examples:

```text
GET    /api/restaurants
GET    /api/restaurants/:id
POST   /api/restaurants
PUT    /api/restaurants/:id
DELETE /api/restaurants/:id

GET    /api/reviews
POST   /api/reviews
PUT    /api/reviews/:id
DELETE /api/reviews/:id
```

The final API endpoints may change as the project is developed.

## Available Scripts

Run the development server:

```bash
npm run dev
```

Build the TypeScript project:

```bash
npm run build
```

Run the compiled application:

```bash
npm start
```

## Environment Variables

Example `.env.example`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=
JWT_SECRET=
```

Sensitive information such as database passwords, API keys, and authentication secrets must not be committed to the repository.

## Frontend Integration

### Sri Lankan sample data for frontend testing

Run `npm run db:seed:local` to populate all 13 application tables in the database
configured by `DATABASE_URL`. `npm run db:seed:demo` remains an alias for the same dataset.
The six fictional venues are Cinnamon Gedara, Kandyan Bath Kade, Galle Muhudu Rasa,
Yaal Pachchai Kitchen, Udarata Tea Room and Negombo Wel Thera. Their menus contain
53 items across breakfast, mains, desserts and drinks, with sample prices in LKR.
They include chicken kottu, rice and curry, pol roti, kiribath, string hoppers,
kadala curry, seafood and watalappan, alongside cafe favourites.

Reruns update the seed-owned restaurant names, addresses, descriptions and menus
in place, including the old `Demo` names, without duplicating the dataset.
Existing restaurant/menu IDs, reviews, replies and unrelated records are retained.
Uploaded R2 photos and custom image URLs are preserved; known seed photos are refreshed.
The script also advances ID sequences if imported records left them behind.
Use `npm run db:seed` for only the original roles and rating types.

The dataset includes six restaurants (five active, one inactive), menus with
available and unavailable items, relevant public food and dining image URLs, ratings,
approved/pending/rejected reviews and comments, and comment replies. Images are
stock photos rather than photos of actual demo venues. Sources and attribution
are listed in [image credits](prisma/demo-image-credits.md). Demo menu prices are in LKR.

All new demo accounts use password `DemoPass123!`:

| Role | Email |
| --- | --- |
| Customer | customer@demo.example |
| Second customer | customer2@demo.example |
| Restaurant owner | owner@demo.example |
| Moderator | moderator@demo.example |
| Admin | admin@demo.example |

Existing demo accounts retain their passwords and role settings on reruns.

The backend is designed to communicate with the Restaurant Review Portal frontend application.

Frontend repository:

```text
restaurant-review-portal-frontend
```

Local frontend:

```text
http://localhost:3000
```

Local backend:

```text
http://localhost:5000
```

## Git Workflow

Create a separate branch for each feature or development task.

Example:

```bash
git checkout -b feature/review-api
```

After completing the work:

```bash
git add .
git commit -m "Add review API endpoints"
git push origin feature/review-api
```

The completed feature should be reviewed before being merged into the `main` branch.

## Project Status

This project is currently under development as part of an MSc group assignment.

## Team

Developed by the Restaurant Review Portal project team.

## License

This project is developed for academic purposes.
