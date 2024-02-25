const Handlebars = require('handlebars');

Handlebars.registerHelper('eq', (a, b, options) => (a === b ? options.fn(this) : options.inverse(this)));
