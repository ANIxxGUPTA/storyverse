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

app.listen(4005, async () => {
  await connectDB();
  console.log("Started on 4005");
  
  let res = await fetch('http://localhost:4005/api/auth/me');
  console.log("/me =>", res.status, await res.text());

  res = await fetch('http://localhost:4005/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({username: "test99", email: "test99@test.com", password: "pwd"})
  });
  console.log("/signup =>", res.status, await res.text());

  process.exit(0);
});
