const path = require('path');
const express = require('express');
const Handlebars = require('handlebars');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const session = require('express-session');
const handlebars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const dotEnv = require('dotenv');
const mongoose = require('mongoose');
const adminRoute = require('./routes/adminRoute');
const userRoute = require('./routes/userRout');
const vendorRoute = require('./routes/vendorRoute');

dotEnv.config();
mongoose.connect(process.env.MONGODB_ATLAS, {
});

const app = express();
const PORT = 8080;
app.use(session({
  secret: 'admin_Sid',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

hbs.registerHelper('formatDate', (date) => { new Date(date).toLocaleDateString(); });

app.engine(
  'hbs',
  handlebars.engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '/views/layouts/'),
    partialsDir: path.join(__dirname, '/views/partials/'),
    layouts: {
      adminMain: 'adminMain',
    },
  }),
);

app.set('view engine', 'hbs');
app.set('views', './views');

app.use((req, res, next) => {
  res.locals.includeHeaderFooter = req.path.startsWith('/admin') || req.path.startsWith('/Vendor') || req.path.startsWith('/vendor');
  res.locals.excludeHeaderFooter = req.path.startsWith('/login') || req.path.startsWith('/register') || req.path.startsWith('/userLogin');

  next();
});
hbs.registerHelper('formatDate', (date) => { new Date(date).toLocaleDateString(); });
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

const excludeLayoutAndPartials = (req, res, next) => {
  res.locals.layout = false; // Disable layout
  res.locals.partials = false; // Disable partials
  next();
};

app.use('/admin', excludeLayoutAndPartials, adminRoute);
app.use('/vendor', excludeLayoutAndPartials, vendorRoute);
app.use('/', userRoute);

app.use((req, res) => {
  res.status(404).render('404');
});

// eslint-disable-next-line no-unused-vars
const server = app.listen(PORT, (err) => {
  if (err) {
    console.error('Error starting the server:', err);
  } else {
    console.warn(`Server is running on http://localhost:${PORT}`);
  }
});
