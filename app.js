const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');
const trucksRoute = require('./routes/trucks');
const loadsRoute = require('./routes/loads');

app.use(express.urlencoded({extended: false}));
mongoose.connect(process.env.server, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, ()=>{
  console.log('Connected to db');
});

app.use(express.json());

app.use('/api/auth', authRoute);

app.use('/api/users', usersRoute);

app.use('/api/trucks', trucksRoute);

app.use('/api/loads', loadsRoute);

app.listen(process.env.port, () => {
  console.log(`Server is working`);
});
