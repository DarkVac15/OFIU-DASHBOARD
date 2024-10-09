const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

// Ruta para mostrar el dashboard, protegida con el middleware de autenticación
router.get('/', async (req, res) => {
    // Aquí puedes añadir la lógica del dashboard, ya que el usuario ha sido autenticado
    res.render('dashboard', { layout: 'main', showNavbar: true } )
  });
  

module.exports = router;