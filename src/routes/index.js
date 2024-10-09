const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.get('/', (req, res) => {
    res.render('landing', { layout: 'main',  showNavbar: false  }); /// buscar la clases dashnboard para la dsash

  });

  router.use(express.json());

// Ruta para el login y verificar el token
router.post('/login', async (req, res) => {
 
});




module.exports = router;