/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const adminRoute = require('./routes/adminRoute');

const app = express();
const PORT = 5000;
app.set('view engine', 'hbs');
app.set('views', './views');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/', adminRoute);

app.use((req, res, next) => {
  res.status(404).render('404');
  next();
});
const server = app.listen(PORT, (err) => {
  if (err) {
    console.error('Error starting the server:', err);
  } else {
    console.warn(`Server is running on http://localhost:${PORT}`);
  }
});
