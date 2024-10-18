const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  const message = req.query.message || null;
    res.render('landing', { layout: 'main',  showNavbar: false  }); /// buscar la clases dashnboard para la dsash

  });

  router.use(express.json());





module.exports = router;