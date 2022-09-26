const express = require('express');
const session = require('express-session');
const redis = require('redis');
const connectRedis = require('connect-redis');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const port = 3001;

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/redis');
}

const RedisStore = connectRedis(session);

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
  legacyMode: true,
});

redisClient.connect().catch(console.error);

app.use(
  session({
    store: new RedisStore({ client: redisClient, ttl: 10 }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
  }),
);

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

app.get('/', async (req, res) => {
  const session = req.session;

  if (!session.sessionId) {
    return res.status(401).json('Unauthorized');
  }

  return res.status(200).json(session);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
