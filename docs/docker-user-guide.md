# Developer guide: run the backend and view database data

This guide runs the backend and PostgreSQL together on your own computer. Run all commands from the `restaurant-review-portal-backend` folder. You do not need to install Node.js or PostgreSQL locally for this Docker workflow.

## 1. Install and open Docker

Install [Docker Desktop](https://docs.docker.com/get-started/get-docker/) for your operating system and open it. Wait until the Docker engine is running. You also need Git to clone the repository.

Check your terminal:

```bash
docker --version
docker compose version
```

## 2. Get the project

```bash
git clone https://github.com/SanjulaDilky/restaurant-review-portal-backend.git
cd restaurant-review-portal-backend
```

If you already have the project, open a terminal in its folder and use your team's normal Git workflow to get the latest changes.

## 3. Create the Docker configuration

Create a file named `.env.docker` in the project root by copying `.env.example`. You can do this in your editor or file manager. On macOS/Linux:

```bash
cp .env.example .env.docker
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.docker
```

If `.env.docker` already exists, edit it rather than replacing it. Set these values:

```dotenv
PORT=5001
POSTGRES_DB=restaurant_review_portal
POSTGRES_USER=dinerate
POSTGRES_PASSWORD=LocalDevPass123
DATABASE_URL=postgresql://dinerate:LocalDevPass123@postgres:5432/restaurant_review_portal?schema=public
JWT_SECRET=replace_with_a_long_random_local_secret

R2_ACCOUNT_ID=replace_with_team_r2_account_id
R2_ACCESS_KEY_ID=replace_with_team_r2_access_key_id
R2_SECRET_ACCESS_KEY=replace_with_team_r2_secret_access_key
R2_BUCKET_NAME=replace_with_team_r2_bucket_name
R2_ENDPOINT=https://replace_with_team_r2_account_id.r2.cloudflarestorage.com
R2_PUBLIC_BASE_URL=replace_with_team_public_image_base_url
```

The database password above is an example for local development. If you change it, update it in **both** `POSTGRES_PASSWORD` and `DATABASE_URL`. Special characters in the URL password must be URL-encoded; an alphanumeric password avoids that extra step.

Ask the project maintainer for the team's development R2 settings through your team's private credential-sharing method. Replace all R2 placeholders. The current backend checks R2 settings during startup even when you only want to read data; valid credentials are needed for uploads. Choose your own long, random `JWT_SECRET` for this local setup.

Keep `.env.docker` private; it is ignored by Git. You do not need to edit `.env` for this workflow. Every Compose command below uses `--env-file .env.docker` so PostgreSQL and the backend use matching settings. Exported shell variables such as `POSTGRES_PASSWORD` can override Compose's file values, so remove conflicting exports if you have them. See [Docker's environment configuration documentation](https://docs.docker.com/compose/how-tos/environment-variables/envvars/).

## 4. Start the backend and database

```bash
docker compose --env-file .env.docker config --quiet
docker compose --env-file .env.docker up -d --build
docker compose --env-file .env.docker ps
```

The first command validates the configuration; success normally produces no output. The first build needs internet access and may take a few minutes.

Docker starts PostgreSQL, waits for it to become healthy, builds the backend, applies Prisma migrations to create/update the tables, and starts the API. Wait until PostgreSQL is healthy and the backend stays running.

View startup logs:

```bash
docker compose --env-file .env.docker logs --tail=100 backend
```

Open <http://localhost:5001/api/health> in your browser. Expected response:

```json
{"success":true,"message":"Restaurant Review Portal API is running"}
```

This checks that the API is running. The restaurant request in the next step also checks database access.

## 5. Load sample data

A new Docker database starts without your teammate's existing records. Migrations create the tables, but do not automatically load sample records. For local frontend testing, run:

```bash
docker compose --env-file .env.docker exec backend npm run db:seed:demo
```

Wait for `Database seed completed successfully.` The demo contains six restaurants (five active and one inactive), menus, images, ratings, reviews, comments, and users. Public API results may hide inactive restaurants and unapproved content.

The demo seed preserves existing records and skips existing demo restaurants. It can refresh original demo image placeholders and repair ID sequences. Existing demo users keep their passwords and roles. Run it against your local development database.

If you only want the base roles and rating types, use this instead:

```bash
docker compose --env-file .env.docker exec backend npm run db:seed
```

New demo accounts all use password `DemoPass123!`:

| Role | Email |
| --- | --- |
| Customer | customer@demo.example |
| Second customer | customer2@demo.example |
| Restaurant owner | owner@demo.example |
| Moderator | moderator@demo.example |
| Admin | admin@demo.example |

Demo seeding gives you sample data, not a copy of another developer's database. To get their exact records, ask them for a database export and coordinate the import separately.

## 6. See data through the backend

Open these URLs in a browser, or send GET requests using Postman:

| Data | URL |
| --- | --- |
| Restaurants | http://localhost:5001/api/restaurants |
| Restaurant categories | http://localhost:5001/api/restaurant-categories |
| Rating types | http://localhost:5001/api/rating-types |

Copy a restaurant's actual `id` from the restaurant response. Replace `ID` in these URLs:

```text
http://localhost:5001/api/restaurants/ID
http://localhost:5001/api/restaurants/ID/menu-items
http://localhost:5001/api/restaurants/ID/reviews
http://localhost:5001/api/restaurants/ID/rating-summary
```

For login in Postman, use **POST** `http://localhost:5001/api/auth/login`, select **Body → raw → JSON**, and send:

```json
{"email":"customer@demo.example","password":"DemoPass123!"}
```

Use the returned token as a Bearer token for protected endpoints. Configure your frontend's backend/API base URL to use `http://localhost:5001` (including `/api` if that is how the frontend builds its request URLs).

## 7. See database tables in a graphical viewer

Use an installed PostgreSQL viewer such as pgAdmin or DBeaver. It runs on your computer and connects to the PostgreSQL container with these settings:

| Setting | Value |
| --- | --- |
| Database type | PostgreSQL |
| Host | `localhost` |
| Port | `5433` |
| Database | `restaurant_review_portal` |
| Username | `dinerate` |
| Password | Your `.env.docker` `POSTGRES_PASSWORD` |

If you changed the database name or username, use your configured values instead.

For pgAdmin:

1. Open pgAdmin and right-click **Servers → Register → Server**.
2. In **General**, enter a name such as `DineRate Local`.
3. In **Connection**, enter host `localhost`, port `5433`, maintenance database `restaurant_review_portal`, username `dinerate`, and your database password.
4. Click **Save**, then expand **Servers → DineRate Local → Databases → restaurant_review_portal → Schemas → public → Tables**.
5. Right-click `restaurant` and choose **View/Edit Data → All Rows** to see the seeded restaurants. Repeat for other tables. See [pgAdmin's data viewer documentation](https://www.pgadmin.org/docs/pgadmin4/latest/editgrid.html).

For DBeaver, create a new PostgreSQL connection, enter the table's connection settings, then connect and expand **Schemas → public → Tables**. Open a table's **Data** tab.

Useful tables include `restaurant`, `menu_item`, `review`, `review_comment`, `user`, `role`, and `rating_type`. Raw tables include records that public API endpoints may filter out.

**Port distinction:** your computer's viewer connects to `localhost:5433`. The backend inside Docker connects to `postgres:5432`. Keep `postgres:5432` in `.env.docker`'s `DATABASE_URL`.

## 8. See data from the terminal

No separate database viewer is needed. Open PostgreSQL's SQL terminal inside the container:

```bash
docker compose --env-file .env.docker exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

The command uses your configured database/user automatically. At the `psql` prompt, run:

```sql
-- List application tables.
\dt

-- View restaurants.
SELECT id, name, city, status FROM restaurant ORDER BY id;

-- View menus and prices.
SELECT id, restaurant_id, name, price, is_available
FROM menu_item ORDER BY restaurant_id, id;

-- View reviews, including moderation status.
SELECT id, restaurant_id, title, overall_rating, moderation_status
FROM review ORDER BY id;

-- View users and their roles. "user" needs double quotes in SQL.
SELECT u.id, u.first_name, u.email, r.role_name
FROM "user" AS u JOIN role AS r ON r.id = u.role_id
ORDER BY u.id;

-- Count restaurant records.
SELECT COUNT(*) FROM restaurant;
```

Each SQL query ends with `;`. If output opens a pager, press `q` to return to the SQL prompt. Exit with:

```text
\q
```

## 9. Daily commands

| Task | Command |
| --- | --- |
| Start again | `docker compose --env-file .env.docker up -d` |
| View status | `docker compose --env-file .env.docker ps` |
| Follow backend logs | `docker compose --env-file .env.docker logs -f backend` |
| Stop containers | `docker compose --env-file .env.docker stop` |
| Stop and remove containers, preserving database data | `docker compose --env-file .env.docker down` |
| Rebuild after backend code or Dockerfile changes | `docker compose --env-file .env.docker up -d --build` |
| Apply edited backend environment settings | `docker compose --env-file .env.docker up -d --force-recreate backend` |

Press Ctrl+C to stop following logs; the containers keep running. Code is copied into the image, so rebuild after pulling backend changes. This Docker setup does not provide live reload.

Database records are stored in the named `postgres_data` volume and survive normal stop/down commands. **Adding `--volumes` or `-v` to `down` deletes that database volume and its records.** See [Docker's down command documentation](https://docs.docker.com/reference/cli/docker/compose/down/).

## 10. Troubleshooting

| Problem | What to check |
| --- | --- |
| Cannot connect to Docker daemon | Open Docker Desktop and wait for the engine to start. |
| `.env.docker` missing | Create it in the same folder as `docker-compose.yml`. Check that your editor did not name it `.env.docker.txt`. |
| Empty `POSTGRES_*` variables | Use the full commands above, including `--env-file .env.docker`, and fill in the file. |
| Backend exits or restarts | Run `docker compose --env-file .env.docker logs --tail=100 backend` and address the reported error. |
| Missing Cloudflare R2 environment variables | Fill in R2 settings, then recreate the backend with the command above. |
| Port already allocated | Stop the other service using port `5001` or `5433`, or change the host-side port in Compose and use that new port locally. |
| Database password authentication failed | Ensure the URL password matches `POSTGRES_PASSWORD`. Existing volumes keep their original database credentials; editing the env file does not change that stored password. Restore the original values or arrange a database password change. |
| Database viewer cannot connect | Keep Docker running; use host `localhost`, port `5433`, and the configured credentials. These settings assume the viewer runs directly on your computer. |
| Restaurant response is empty | Run the demo seed. A fresh database has no restaurants until you seed or create them. |
| Seed fails | Ensure the backend is running and migrations completed; inspect backend logs and seed output. |
| New code does not appear | Rebuild using `up -d --build`. |

When requesting help from your teammate, send the failed command and relevant error/log lines. Remove passwords, tokens, connection strings, and R2 secrets before sharing.
