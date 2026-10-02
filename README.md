# DevBlog — Full-Stack Blog Application

A blog platform built for a school project, styled after X (Twitter):

- **Frontend:** React 18 + Vite, React Router, Axios
- **Backend:** Spring Boot 3 (Java 17), Spring Security + JWT
- **Database:** MySQL

## Features

- User registration & login (JWT-based auth); the homepage requires login, like X
- X-style feed: single-column posts, avatars, relative timestamps, "Show more" to load additional posts
- Create, edit, delete, and view blog posts, with an optional cover image URL
- Commenting on posts
- Likes, with a live count and heart toggle
- Follow / unfollow other users; profile pages showing join date, follower/following counts, and that user's posts
- Notifications for follows, likes, and comments, with an unread-count badge in the navbar
- Role-based access: post/comment owners (or admins) can edit/delete
- Admin dashboard: view stats, list all users, remove users
- Search posts by title (search results are not shuffled, so they're easy to scan)
- A default admin account is auto-created on first run

## Project structure

```
blog-app/
├── backend/          Spring Boot API (Java)
├── frontend/         React app (Vite)
└── database/         Reference SQL schema (optional — tables are auto-created)
```

## Prerequisites

1. **Java 17+** — `java -version`
2. **Maven 3.8+** — `mvn -version`
3. **Node.js 18+ and npm** — `node -version`
4. **MySQL 8+** running locally — `mysql --version`

## 1. Set up MySQL

Make sure a MySQL server is running locally on port 3306. The backend is
configured with `createDatabaseIfNotExist=true` and
`spring.jpa.hibernate.ddl-auto=update`, so it creates the `blog_db` database
and all tables automatically the first time it starts.

Open `backend/src/main/resources/application.properties` and update these
lines to match your actual MySQL root password:

```properties
spring.datasource.username=root
spring.datasource.password=root
```

If you're on MySQL 8's default `caching_sha2_password` authentication and see
a "Public Key Retrieval is not allowed" error, the JDBC URL already includes
`allowPublicKeyRetrieval=true` to handle that — no action needed.

## 2. Run the backend

```bash
cd backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**. On first startup it creates a
default admin account:

- **username:** `admin`
- **password:** `admin123`

### Key API endpoints

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/posts` | No | List posts (paginated, `?search=`, `?seed=` for shuffle) |
| GET | `/api/posts/{id}` | No | View a single post |
| POST | `/api/posts` | Yes | Create a post |
| PUT | `/api/posts/{id}` | Yes (owner/admin) | Edit a post |
| DELETE | `/api/posts/{id}` | Yes (owner/admin) | Delete a post |
| POST/DELETE | `/api/posts/{id}/like` | Yes | Like / unlike a post |
| GET | `/api/posts/{id}/comments` | No | List comments on a post |
| POST | `/api/posts/{id}/comments` | Yes | Add a comment |
| DELETE | `/api/comments/{id}` | Yes (owner/admin) | Delete a comment |
| GET | `/api/users/{username}` | No | Profile info (join date, counts, follow status) |
| GET | `/api/users/{username}/posts` | No | Posts by that user |
| GET | `/api/users/{username}/followers` / `/following` | No | Follower/following lists |
| POST/DELETE | `/api/users/{username}/follow` | Yes | Follow / unfollow |
| GET | `/api/notifications` | Yes | Your notifications |
| GET | `/api/notifications/unread-count` | Yes | Unread count for the navbar badge |
| POST | `/api/notifications/read` | Yes | Mark all notifications read |
| GET | `/api/admin/users` | Yes (admin) | List all users |
| DELETE | `/api/admin/users/{id}` | Yes (admin) | Delete a user |
| GET | `/api/admin/stats` | Yes (admin) | Total user/post counts |

## 3. Run the frontend

In a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

The app starts on **http://localhost:5173**, already configured to call the
backend at `http://localhost:8080/api`.

Since the homepage requires login (like X), you'll land on the login screen
first. Log in as `admin` / `admin123`, or register a new account.

## Troubleshooting

- **Lombok "cannot find symbol" errors on a fresh JDK** — newer JDKs (23+)
  need Lombok explicitly wired as an annotation processor. The `pom.xml`
  already does this and pins a recent Lombok version; if you still hit this,
  try bumping `lombok.version` in `pom.xml` further.
- **"Access denied for user 'root'@'localhost'"** — your MySQL password in
  `application.properties` doesn't match your actual MySQL root password.
- **"Could not load posts. Is the backend running?"** — make sure the
  Spring Boot app is running on port 8080 and MySQL is reachable.
- **CORS errors** — the backend only allows `http://localhost:5173` and
  `http://localhost:3000` by default. Update `app.cors.allowed-origins` in
  `application.properties` if your frontend runs on a different port (Vite
  auto-picks the next free port, e.g. 5174, if 5173 is already in use by
  another running instance).
- **Port already in use** — change `server.port` (backend) or run
  `npm run dev -- --port 5174` (frontend) and update CORS accordingly.

## Notes for extending this project

- Passwords are hashed with BCrypt; JWTs expire after 24 hours.
- The JWT secret in `application.properties` is a placeholder — replace it
  before any real deployment.
- Cover images and profile pages use plain URLs, not file uploads — pasting
  a URL from a site like Unsplash keeps it stable; some placeholder services
  (e.g. plain `picsum.photos/w/h` with no ID) can return a different photo
  on each request, so prefer a fixed-ID or real hosted URL for anything you
  want to stay the same over time.
- `spring.jpa.hibernate.ddl-auto=update` is convenient for a school project
  but isn't recommended for production; use a migration tool (e.g. Flyway)
  for a real app.
