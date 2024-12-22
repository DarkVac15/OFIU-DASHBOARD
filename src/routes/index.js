const express = require('express');
const router = express.Router();
//import jwt from 'jsonwebtoken';

const mailController = require('../controller/mailController');

router.get('/', (req, res) => {
  const message = req.query.message || null;

  res.render('landingcopy', { layout: 'main_page',
    isPolitica: false,
    isHome: true,
    isTerminos: false

   }); // Envía el mensaje a la vista
});
 
router.get('/PoliticadePrivacidad', async (req, res) => {
    const message = req.query.message || null;
  res.render('politic', { errorMessage: message, layout: 'main_page',
    isPolitica: true,
    isHome: false,
    isTerminos: false
   })
});
router.get('/TerminosyCondicionesdeUso', async (req, res) => {
  const message = req.query.message || null;
  res.render('terms', { errorMessage: message, layout: 'main_page',
    isPolitica: false,
    isHome: false,
    isTerminos: true
   })
});

router.get('/reports', async (req, res) => {
  const message = req.query.message || null;
  res.render('reports', { errorMessage: message , })
});

router.post("/reports/submit", mailController.sendReport);

router.get('/support', async (req, res) => {
  const message = req.query.message || null;
  res.render('support', { errorMessage: message })
});

router.post("/support/submit", mailController.sendSupport);




router.post("/unsubscribe/submit", mailController.sendUnsubscribe);

router.get('/unsubscribe', async (req, res) => {
  const message = req.query.message || null;
  res.render('unsubscribe', { errorMessage: message })
});



router.post('/setToken', (req, res) => {
  const { token } = req.body;

  // Configura la cookie con opciones de seguridad
  res.cookie('token', token, {
    httpOnly: true,      // Impide que la cookie sea accesible desde JavaScript
    //   secure: true,        // Solo envía la cookie en HTTPS
    sameSite: 'Strict',  // Evita el envío de la cookie en solicitudes cross-site
    maxAge: 1000 * 60 * 60  // Expira en 1 día (ajusta según tus necesidades)
  });

  res.sendStatus(200); // Responde con éxito
});



router.post('/logout', (req, res) => {
  // Elimina la cookie del token
  res.clearCookie('token'); // Asegúrate de que el nombre de la cookie coincide
  res.status(200).json({ message: 'Sesión cerrada' });
});


//colocar un rol admi aun user

/*
router.get('/set-admin', async (req, res) => {
  const uid = "9fKtiZmpQEb7B05sK73E3Xlhls83";

  if (!uid) {
    return res.status(400).json({ message: 'UID es requerido' });
  }

  try {
    await auth.setCustomUserClaims(uid, { admin: true });
    res.status(200).json({ message: `Rol de admin asignado al usuario con UID: ${uid}` });
  } catch (error) {
    console.error("Error al asignar rol de admin:", error);
    res.status(500).json({ message: 'Error al asignar rol de admin' });
  }
});*/

module.exports = router;