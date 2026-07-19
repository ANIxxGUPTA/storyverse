const { connectDB } = require('./dist/config/db');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./dist/config/passport').default;
const authRoutes = require('./dist/routes/auth.routes').default;
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'test',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/auth', authRoutes);

app.listen(4006, async () => {
  await connectDB();
  console.log("Started on 4006");

  // Test real user login
  const res = await fetch('http://localhost:4006/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({email: "george@example.com", password: "password123"})
  });
  console.log("/login (Real User) =>", res.status, await res.text());

  process.exit(0);
});
