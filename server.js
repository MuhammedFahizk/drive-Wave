/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const adminRoute = require('./routes/adminRoute');
const admin = require('./models/admin');

const app = express();
const PORT = 5000;
app.use(session({
  secret: 'admin_Sid',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'hbs');
app.set('views', './views');
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/', adminRoute);
app.use('/login', adminRoute);
app.use('/adminDashboard', adminRoute);
app.use('/adminDashboardPage', adminRoute);
app.use('/adminCarPage', adminRoute);
app.use('/adminLogout', adminRoute);
app.use('/addCars', adminRoute);

app.use((req, res) => {
  res.status(404).render('404');
});

const server = app.listen(PORT, (err) => {
  if (err) {
    console.error('Error starting the server:', err);
  } else {
    console.warn(`Server is running on http://localhost:${PORT}`);
  }
});
