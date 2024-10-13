const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { db, auth } = require("../config/firebase");


// Ruta para mostrar el dashboard, protegida con el middleware de autenticación
router.get('/', async (req, res) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null; // Convertir la fecha de inicio a un objeto Date
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null; // Convertir la fecha de fin a un objeto Date

  let totalUsers = 0;
  let totalProfessionals = 0;

  // Ajustamos endDate para incluir el día completo
  if (endDate) {
      endDate.setHours(23, 59, 59, 999); // Esto asegura que se incluye el último día completo
  }

  // Consulta general sin rango de fechas
  let usersQuery = db.collection('users');
  
  // Si hay un rango de fechas, aplicamos el filtro
  if (startDate && endDate) {
      usersQuery = usersQuery.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
  }

  const usersSnapshot = await usersQuery.get(); // Ejecutamos la consulta

  for (const userDoc of usersSnapshot.docs) {
      totalUsers++; // Contar usuario en el rango de fechas

      // Verificar si el usuario tiene datos de profesional
      const professionalSnapshot = await db.collection('users')
          .doc(userDoc.id)
          .collection('professionalData')
          .doc('data') // Documento de datos profesionales
          .get();

      if (professionalSnapshot.exists) {
          const professionalCreatedAt = professionalSnapshot.data().createdAt;

          // Si hay rango de fechas y el profesional cae dentro de ese rango, lo contamos
          if ((!startDate && !endDate) || (professionalCreatedAt && professionalCreatedAt.toDate() >= startDate && professionalCreatedAt.toDate() <= endDate)) {
              totalProfessionals++;
          }
      }
  }

  // Preparar métricas para la vista
  const metrics = [
      { 
          title_card: 'Usuarios Registrados', 
          value: totalUsers, 
          description: startDate && endDate ? `Usuarios registrados del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}` : 'Usuarios totales registrados' 
      },
      { 
          title_card: 'Profesionales Registrados', 
          value: totalProfessionals, 
          description: startDate && endDate ? `Profesionales registrados del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}` : 'Profesionales totales registrados' 
      }
  ];


  res.render('dashboard', { metrics, layout: 'main', showNavbar: true });        // Si no hay fechas, enviar vacío}


});



module.exports = router;
// layout: 'main', showNavbar: true 
