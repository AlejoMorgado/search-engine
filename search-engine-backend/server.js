const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const redis = require("redis");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
console.log(process.env.USER, process.env.HOST, process.env.DATABASE, process.env.PASSWORD);
const pool = new Pool({
  user: process.env.USERNAME,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: 5433,
});

const redisClient = redis.createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379,
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redisClient.connect().catch((err) => {
  console.error("Failed to connect to Redis", err);
});

app.get("/api/search", async (req, res) => {
  const { q: query, page = 1 } = req.query;

  if (!query || typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({ error: "Query parameter 'q' is required and must be a non-empty string." });
  }

  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  const cacheKey = `search:${query}:${page}`;
  let cachedResults;

  try {
    cachedResults = await redisClient.get(cacheKey);
  } catch (redisErr) {
    console.error("Redis error:", redisErr);
  }

  if (cachedResults) {
    return res.status(200).json(JSON.parse(cachedResults));
  }

  try {
    const { rows } = await pool.query(`SELECT * FROM users WHERE name ILIKE $1 ORDER BY id LIMIT $2 OFFSET $3`, [`%${query}%`, pageSize, offset]);

    const { rows: countRows } = await pool.query(`SELECT COUNT(*) FROM users WHERE name ILIKE $1`, [`%${query}%`]);
    const totalRecords = parseInt(countRows[0].count, 10);
    const totalPages = Math.ceil(totalRecords / pageSize);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No results found." });
    }

    const response = { results: rows, totalPages, currentPage: page };

    try {
      await redisClient.set(cacheKey, JSON.stringify(response), {
        EX: 60,
      });
    } catch (redisErr) {
      console.error("Redis error:", redisErr);
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while fetching results." });
  }
});

app.use((req, res, next) => {
  if (req.rateLimit.remaining === 0) {
    return res.status(429).json({
      error: "Too many requests. Please try again later.",
    });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
