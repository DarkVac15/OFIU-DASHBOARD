const express = require('express');
const router = express.Router();
const { db, auth } = require("../config/firebase");
//const verifyToken = require('../middleware/web');

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



const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

async function exportDashboardToPDF(metrics, stateCount, categoryCount, cityCount, startDate, endDate) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // Tamaño A4
    const { width, height } = page.getSize();

    // Fuentes y colores
    const fontTitle = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontContent = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let currentY = height - 50;
    const marginLeft = 50;

    // Título del PDF
    page.drawText('Reporte de Dashboard', {
        x: marginLeft,
        y: currentY,
        size: 20,
        font: fontTitle,
        color: rgb(0, 0.5, 0.7),
    });

    // Agregar fecha de generación
    const generationDate = new Date().toLocaleDateString();
    page.drawText(`Fecha de generación: ${generationDate}`, {
        x: marginLeft,
        y: currentY - 30,
        size: 12,
        font: fontContent,
        color: rgb(0, 0, 0),
    });

    // Agregar el rango de fechas (si está definido)
    if (startDate && endDate) {
        page.drawText(`Rango de fechas: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, {
            x: marginLeft,
            y: currentY - 50,
            size: 12,
            font: fontContent,
            color: rgb(0, 0, 0),
        });
        currentY -= 70; // Ajuste para dejar espacio después del rango de fechas
    } else {
        currentY -= 50; // Ajuste si no hay rango de fechas
    }

    // Iterar sobre las métricas principales
    metrics.forEach(metric => {
        page.drawText(`${metric.title_card}: ${metric.value}`, {
            x: marginLeft,
            y: currentY,
            size: 14,
            font: fontTitle,
            color: rgb(0.2, 0.4, 0.6),
        });
        currentY -= 20;
        page.drawText(metric.description, {
            x: marginLeft,
            y: currentY,
            size: 12,
            font: fontContent,
            color: rgb(0, 0, 0),
        });
        currentY -= 30;
    });

    // Sección para los gráficos de estado, categoría y ciudad
    function drawSection(title, data) {
        if (Object.keys(data).length > 0) {
            page.drawText(title, {
                x: marginLeft,
                y: currentY,
                size: 14,
                font: fontTitle,
                color: rgb(0.3, 0.5, 0.7),
            });
            currentY -= 20;

            Object.entries(data).forEach(([key, value]) => {
                page.drawText(`- ${key}: ${value}`, {
                    x: marginLeft + 20,
                    y: currentY,
                    size: 12,
                    font: fontContent,
                    color: rgb(0, 0, 0),
                });
                currentY -= 15;
            });
            currentY -= 20;
        }
    }

    drawSection('Estados de Tickets', stateCount);
    drawSection('Categorías de Tickets', categoryCount);
    drawSection('Usuarios profesionales por Ciudad', cityCount);

    // Guarda y exporta el PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('dashboard-report.pdf', pdfBytes);
}

module.exports = exportDashboardToPDF;



// Ruta para exportar el dashboard a PDF
router.get('/export-pdf', async (req, res) => {
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

    // Generar el PDF y enviar como respuesta
    await exportDashboardToPDF(metrics, stateCount, categoryCount, cityCount);

    res.download('dashboard-report.pdf', 'dashboard-report.pdf', (err) => {
        if (err) {
            console.error("Error al descargar el archivo PDF:", err);
        } else {
            fs.unlinkSync('dashboard-report.pdf'); // Eliminar el archivo PDF después de la descarga
        }
    });
});






module.exports = router;
