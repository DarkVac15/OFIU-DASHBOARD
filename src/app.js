const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphs = require("express-handlebars");
const app = express();
const checkApiKey = require('./middleware/api');
const verifyToken = require('./middleware/web');

const cookieParser = require("cookie-parser"); 

app.use(cookieParser()); // Configura cookie-parser para habilitar la lectura de cookies

// Configuración de vistas
app.set("views", path.join(__dirname, "views"));

app.engine(".hbs", exphs.create({
    defaultLayout: "main",
    extname: ".hbs",
    partialsDir: path.join(__dirname, 'views/partials/'), // Asegúrate de que esta ruta es correcta
}).engine);

app.set('view engine', 'hbs');

// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // Cambiado extend a extended

// Usa las rutas, especificando un path base para cada una
app.use('/', require("./routes/index"));  // Rutas generales como login y registro

app.use('/etiquetas',verifyToken, require('./routes/tags'));  // Rutas para etiquetas
app.use('/dashboard',  require('./routes/dashboard'));  // Rutas para etiquetas
app.use('/user',verifyToken,  require('./routes/users'));  // Rutas para user
app.use('/api',checkApiKey, require('./routes/api'));  //


// Carpeta de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;