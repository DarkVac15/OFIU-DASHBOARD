// src/middlewares/apiKeyMiddleware.js

const dotenv = require('dotenv');

dotenv.config(); // Cargar variables de entorno
// middleware/bearerAuth.js
const apiKeyMiddleware = (req, res, next) => {
    // Obtener el encabezado Authorization
    const authHeader = req.headers['authorization'];
    
    // Extraer la clave de API del encabezado
    const apiKey = authHeader && authHeader.split(' ')[1]; // Elimina "Bearer " y obtiene la clave

    // Verificar si la clave de API está presente y es válida
    if (!apiKey || apiKey !== process.env.API_KEY_OFIU) {
        return res.status(401).json({ error: 'Acceso denegado. Clave de API no válida.' });
    }

    // Si la clave es válida, continuar con la siguiente función de middleware
    next();
};

module.exports = apiKeyMiddleware;