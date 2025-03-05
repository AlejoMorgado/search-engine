Search Engine Backend

This project is the backend for a search engine application. It is built with Node.js, Express, PostgreSQL, and Redis. The backend provides an API for searching user data stored in a PostgreSQL database and caches the results in Redis for improved performance.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- Redis

### Installation

1.  Clone the repository:

    ```sh
    git clone <repository-url>
    cd search-engine-backend
    ```

2.  Install the dependencies:

    ```sh
    npm install
    ```

3.  Configure the PostgreSQL and Redis connections in `server.js`:

    ```js
    const pool = new Pool({
      user: "postgres",
      host: "localhost",
      database: "postgres",
      password: "your_password",
      port: 5433,
    });

    const redisClient = redis.createClient({
      socket: {
        host: "127.0.0.1",
        port: 6379,
      },
    });
    ```

### Setting Up the Database

1.  Start the PostgreSQL server.

2.  Run the provided SQL script to set up the database and insert initial data:

    ```sh
    psql -U postgres -d postgres -f script.sql
    ```

    This will create a `users` table and populate it with sample data.

### Running the Server

1.  Start the PostgreSQL and Redis servers.

2.  Start the Express server:

```sh

npm start

```

3.  The server will be running on `http://localhost:5001`.

## API Endpoints

### Search

- **URL:** `/api/search`

- **Method:** `GET`

- **Query Parameters:**

- `q` (string, required): The search query.

- `page` (number, optional): The page number for pagination (default is 1).

- **Response:**

- `200 OK`: Returns the search results and pagination information.

- `400 Bad Request`: If the query parameter `q` is missing or invalid.

- `404 Not Found`: If no results are found.

- `429 Too Many Requests`: If the rate limit is exceeded.

- `500 Internal Server Error`: If an error occurs while fetching results.

## Rate Limiting

The server uses the `express-rate-limit` middleware to limit the number of requests from each IP address to 100 requests per 15 minutes.

## Caching

The server uses Redis to cache search results for 60 seconds to improve performance.

## Error Handling

The server handles various errors, including validation errors, database errors, and Redis errors, and returns appropriate HTTP status codes and error messages.
