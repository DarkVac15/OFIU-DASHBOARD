const express = require('express');
const router = express.Router();

const { db, auth } = require("../config/firebase");
//
//card de tickets creados
//ticktes conectaods por campo de estado
//
//

// Ruta para mostrar el dashboard, protegida con el middleware de autenticación
router.get('/', async (req, res) => {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    let totalUsers = 0;
    let totalProfessionals = 0;
    let subcategoryCount = {};
    let categoryCount = {};
    let stateCount = {};

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

    // Crear una lista HTML con las subcategorías
    let subcategorySummary = '<ul>';
    Object.keys(subcategoryCount).forEach(skills => {
        subcategorySummary += `<li>${skills}: ${subcategoryCount[skills]}</li>`;
    });
    subcategorySummary += '</ul>'; // Cerrar la lista

    // Consulta de tickets (filtrada por fechas si existen)
    let ticketsQuery = db.collection('tickets');

    if (startDate && endDate) {
        ticketsQuery = ticketsQuery.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
    }

    const ticketsSnapshot = await ticketsQuery.get(); // Ejecutamos la consulta de tickets

    const totalTickets = ticketsSnapshot.size; // Total de tickets dentro del rango

    // Contar las categorías más solicitadas (en el campo 'tags' que es un array)
    for (const ticketDoc of ticketsSnapshot.docs) {
        const ticketData = ticketDoc.data();

        const tags = ticketData.tags || [];
        tags.forEach(tag => {
            if (categoryCount[tag]) {
                categoryCount[tag]++;
            } else {
                categoryCount[tag] = 1;
            }
        });

        const state = ticketData.state; // Obtener el estado del ticket
        if (stateCount[state]) {
            stateCount[state]++;
        } else {
            stateCount[state] = 1;
        }


    }
    let sortedCategories = Object.entries(categoryCount)
        .sort(([, countA], [, countB]) => countB - countA); // Ordenar por el conteo en orden descendente

    // Crear una lista HTML con las categorías más solicitadas
    let categorySummary = '<ul>';
    sortedCategories.forEach(([tag, count]) => {
        categorySummary += `<li>${tag}: ${count}</li>`;
    });
    categorySummary += '</ul>'; // Cerrar la lista


    // Crear una lista HTML con los estados de los tickets
    let stateSummary = '<ul>';
    Object.entries(stateCount).forEach(([state, count]) => {
        stateSummary += `<li>${state}: ${count}</li>`;
    });
    stateSummary += '</ul>'; // Cerrar la lista


    // Preparar las métricas para las tarjetas
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
            title_card: 'Subcategorías Profesionales',
            value: subcategorySummary, // Mostrar la lista HTML
            description: startDate && endDate ? `Subcategorías del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}` : 'Total de subcategorías de profesionales',
            isHtml: true // Indicar que el contenido es HTML
        },
        {
            title_card: 'Tickets Creados',
            value: totalTickets,
            description: startDate && endDate ? `Tickets creados del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}` : 'Total de tickets creados'
        },
       
        {
            title_card: 'Categorías Más Solicitadas en Tickets',
            value: categorySummary, // Mostrar la lista HTML
            description: startDate && endDate ? `Categorías solicitadas del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}` : 'Total de categorías solicitadas en tickets',
            isHtml: true // Indicar que el contenido es HTML
        },
        { 
            title_card: 'Estado de Tickets', 
            value: stateSummary, // Mostrar la lista HTML
            description: startDate && endDate ? `Estados de tickets del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}` : 'Total de estados de tickets',
            isHtml: true // Indicar que el contenido es HTML
        }
    ];

    res.render('dashboard', {
        metrics,
        layout: 'main',
        showNavbar: true,
        startDate: startDate ? startDate.toISOString().split('T')[0] : null,
        endDate: endDate ? endDate.toISOString().split('T')[0] : null
    });
});



module.exports = router;
// layout: 'main', showNavbar: true 
