const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { db, auth } = require("../config/firebase");


// Ruta para mostrar el dashboard, protegida con el middleware de autenticación
router.get('/', async (req, res) => {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    let totalUsers = 0;
    let totalProfessionals = 0;
    let subcategoryCount = {};

    if (endDate) {
        endDate.setHours(23, 59, 59, 999); // Incluir todo el día completo
    }

    // Consulta de usuarios (filtrada por fechas si existen)
    let usersQuery = db.collection('users');
    if (startDate && endDate) {
        usersQuery = usersQuery.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
    }

    const usersSnapshot = await usersQuery.get(); // Ejecutamos la consulta de usuarios

    for (const userDoc of usersSnapshot.docs) {
        totalUsers++; // Contamos cada usuario dentro del rango

        // Verificar si el usuario tiene datos de profesional
        const professionalSnapshot = await db.collection('users')
            .doc(userDoc.id)
            .collection('professionalData')
            .doc('data') // Documento de datos profesionales
            .get();

        if (professionalSnapshot.exists) {
            const professionalData = professionalSnapshot.data();
            const professionalCreatedAt = professionalData.createdAt; // Fecha de creación del profesional

            // Filtrar por rango de fechas solo si están establecidos
            if ((!startDate && !endDate) || (professionalCreatedAt && professionalCreatedAt.toDate() >= startDate && professionalCreatedAt.toDate() <= endDate)) {
                totalProfessionals++; // Contar profesionales dentro del rango

                // Contar las subcategorías
                const subcategories = professionalData.skills || [];
                subcategories.forEach(skills => {
                    if (subcategoryCount[skills]) {
                        subcategoryCount[skills]++;
                    } else {
                        subcategoryCount[skills] = 1;
                    }
                });
            }
        }
    }
    // Preparar las métricas para las subcategorías en forma de lista
    const subcategoryMetrics = Object.keys(subcategoryCount).map(skills => ({
        title_card: `Profesionales en ${skills}`,
        value: subcategoryCount[skills],
        description: startDate && endDate ? `Registrados del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}` : 'Total de profesionales en esta subcategoría'
    }));

    // Preparar el resto de las métricas
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
        },
        ...subcategoryMetrics // Agregamos las métricas de las subcategorías
    ];

  res.render('dashboard', {
     metrics,
      layout: 'main',
       showNavbar: true,
       startDate: startDate ? startDate.toISOString().split('T')[0] : null,
       endDate: endDate ? endDate.toISOString().split('T')[0] : null});        // Si no hay fechas, enviar vacío}
});



module.exports = router;
// layout: 'main', showNavbar: true 
