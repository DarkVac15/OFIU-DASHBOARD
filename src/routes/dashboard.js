const express = require('express');
const router = express.Router();
const { db, auth } = require("../config/firebase");

// Ruta para mostrar el dashboard, protegida con el middleware de autenticación

router.get('/', async (req, res) => {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    if (endDate) {
        endDate.setHours(23, 59, 59, 999); // Incluir todo el día completo
    }

    // Consulta de usuarios (filtrada por fechas si existen)
    let usersQuery = db.collection('users');
    if (startDate && endDate) {
        usersQuery = usersQuery.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
    }

    const usersSnapshot = await usersQuery.get();
    const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));

    // Variables para conteo
    let totalUsers = usersData.length;
    let totalProfessionals = 0;
    let subcategoryCount = {};
    let categoryCount = {};
    let stateCount = {};
    let cityCount = {};

    // Obtener datos de profesionales
    const professionalPromises = usersData.map(async user => {
        const professionalSnapshot = await db.collection('users').doc(user.id).collection('professionalData').doc('data').get();
        return professionalSnapshot.exists ? professionalSnapshot.data() : null;
    });

    const professionals = await Promise.all(professionalPromises);

    // Procesar los datos de los profesionales
    professionals.forEach(professionalData => {
        if (professionalData) {
            const professionalCreatedAt = professionalData.createdAt;
            const city = professionalData.city;

            // Filtrar por rango de fechas
            if ((!startDate && !endDate) || (professionalCreatedAt && professionalCreatedAt.toDate() >= startDate && professionalCreatedAt.toDate() <= endDate)) {
                totalProfessionals++;

                // Contar subcategorías
                (professionalData.skills || []).forEach(skill => {
                    subcategoryCount[skill] = (subcategoryCount[skill] || 0) + 1;
                });

                // Contar profesionales en la ciudad
                if (city) {
                    cityCount[city] = (cityCount[city] || 0) + 1;
                }
            }
        }
    });

    // Consulta de tickets (filtrada por fechas si existen)
    let ticketsQuery = db.collection('tickets');
    if (startDate && endDate) {
        ticketsQuery = ticketsQuery.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
    }

    const ticketsSnapshot = await ticketsQuery.get();
    const totalTickets = ticketsSnapshot.size;

    // Contar categorías y estados
    ticketsSnapshot.docs.forEach(ticketDoc => {
        const ticketData = ticketDoc.data();

        (ticketData.tags || []).forEach(tag => {
            categoryCount[tag] = (categoryCount[tag] || 0) + 1;
        });

        const state = ticketData.state;
        stateCount[state] = (stateCount[state] || 0) + 1;
    });

    // Preparar métricas para las tarjetas
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
        {
            title_card: 'Tickets Creados',
            value: totalTickets,
            description: startDate && endDate ? `Tickets creados del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}` : 'Total de tickets creados'
        }
    ];

    // Pasar los datos a la vista
    res.render('dashboard', {
        metrics,
        layout: 'main',
        showNavbar: true,
        startDate: startDate ? startDate.toISOString().split('T')[0] : null,
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        barChartLabels: JSON.stringify(Object.keys(stateCount)),
        barChartData: JSON.stringify(Object.values(stateCount)),
        categoryChartLabels: JSON.stringify(Object.keys(categoryCount)),
        categoryChartData: JSON.stringify(Object.values(categoryCount)),
        subcategoryChartLabels: JSON.stringify(Object.keys(subcategoryCount)),
        subcategoryChartData: JSON.stringify(Object.values(subcategoryCount)),
        cityChartLabels: JSON.stringify(Object.keys(cityCount)),
        cityChartData: JSON.stringify(Object.values(cityCount))
    });
});



module.exports = router;
