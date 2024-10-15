// src/middlewares/apiKeyMiddleware.js

const dotenv = require('dotenv');

dotenv.config(); // Cargar variables de entorno

const checkApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key']; // La clave se enviará en el header 'x-api-key'

    if (!apiKey || apiKey !== process.env.API_KEY_OFIU) {
        return res.status(403).json({ error: 'Acceso denegado. Clave API inválida.' });
    }
    
    next(); // Si la clave es correcta, continuar con la siguiente función
};

module.exports = checkApiKey;
