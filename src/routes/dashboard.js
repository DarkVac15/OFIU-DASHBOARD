const express = require('express');
const router = express.Router();

const dashboardController = require('../controller/dashboardController');

router.get('/', dashboardController.dataDashboard);
router.get('/export-pdf', dashboardController.dataReports);


/*router.get('/', async (req, res) => {
    // Ajustar startDate y endDate a la zona horaria de Bogotá (UTC-5)
 // Obtén las fechas del query string
 const startDate = req.query.startDate ? new Date(req.query.startDate + "T00:00:00Z") : null; // Considerar UTC
    const endDate = req.query.endDate ? new Date(req.query.endDate + "T23:59:59Z") : null;  // Hasta el final del día

    // Ajustar las fechas a la zona horaria de Bogotá (UTC-5)
    if (startDate) {
        startDate.setHours(startDate.getHours() - 5); // Ajustar la fecha de inicio
    }

    if (endDate) {
        endDate.setHours(endDate.getHours() - 5); // Ajustar la fecha de fin
    }

    // Obtener las categorías desde Firestore
    const tagsSnapshot = await db.collection('tags').get();
    const tagToCategory = {};

    tagsSnapshot.forEach(doc => {
        const data = doc.data();
    });

    let usersQuery = db.collection('users');
    if (startDate && endDate) {
        usersQuery = usersQuery.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
    }

    const usersSnapshot = await usersQuery.get();
    const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));

    // Obtener usuarios normales
    const getUsersByDateRange = (usersData) => {
        const usersByDate = {};

        usersData.forEach((user) => {
            const createdAt = user.data.createdAt.toDate().toLocaleString('en-CA', { timeZone: 'America/Bogota' }).split(',')[0];
        
            if (!usersByDate[createdAt]) {
                usersByDate[createdAt] = 1;
            } else {
                usersByDate[createdAt] += 1;
            }
        });

        const sortedDates = Object.keys(usersByDate).sort();
        const labels = sortedDates;
        const data = sortedDates.map(date => usersByDate[date]);

        return { labels, data };
    };

    const { labels: userTrendLabels, data: userTrendData } = getUsersByDateRange(usersData);

    // Obtener profesionales en la nueva colección "professionals"
    const getProfessionalsByDateRange = async () => {
        const professionalsByDate = {};

        const professionalsSnapshot = await db.collection('professionals').get();
        professionalsSnapshot.forEach(doc => {
            const professionalData = doc.data();

            const createdAt = professionalData.createdAt
            ?.toDate()
            .toLocaleString('en-CA', { timeZone: 'America/Bogota' })
            .split(',')[0];
        

            if (createdAt) {
                if (!professionalsByDate[createdAt]) {
                    professionalsByDate[createdAt] = 1;
                } else {
                    professionalsByDate[createdAt] += 1;
                }
            }
        });

        const sortedDates = Object.keys(professionalsByDate).sort();
        const labels = sortedDates;
        const data = sortedDates.map(date => professionalsByDate[date]);

        return { labels, data };
    };

    const { labels: professionalTrendLabels, data: professionalTrendData } = await getProfessionalsByDateRange();

    let totalUsers = usersData.length;
    let totalProfessionals = 0;
    let subcategoryCount = {};
    let categoryCount = {};
    let stateCount = {};
    let cityCount = {};
    let totalTickets = 0;
    let locationCount = {};

    const categoriesSnapshot = await db.collection('category').get();
    const categories = categoriesSnapshot.docs;

    const subcategoryToCategory = {};

    categories.forEach(doc => {
        const categoryId = doc.id;
        const subcategoryMap = doc.data();

        Object.keys(subcategoryMap).forEach(subcategory => {
            subcategoryToCategory[subcategory] = categoryId;
            if (!categoryCount[categoryId]) {
                categoryCount[categoryId] = 0;
            }
        });
    });

    // Contar profesionales desde la nueva colección "professionals"
    const professionalsSnapshot = await db.collection('professionals').get();
    professionalsSnapshot.forEach(doc => {
        const professionalData = doc.data();
        const professionalCreatedAt = professionalData.createdAt;
        const city = professionalData.city;

        if ((!startDate && !endDate) || (professionalCreatedAt && professionalCreatedAt.toDate() >= startDate && professionalCreatedAt.toDate() <= endDate)) {
            totalProfessionals++;

            (professionalData.skills || []).forEach(skill => {
                subcategoryCount[skill] = (subcategoryCount[skill] || 0) + 1;
            });

            if (city) {
                cityCount[city] = (cityCount[city] || 0) + 1;
            }
        }
    });

    // Obtener tickets
    const ticketsSnapshot = await db.collection('tickets').get();
    const countedCategories = new Set();
    const ticketsByDate1 = {};
    ticketsSnapshot.forEach(ticketDoc => {
        const ticketData = ticketDoc.data();
  
     const ticketCreatedAt = ticketData.createdAt.toDate();
     const formattedDate = ticketCreatedAt.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }); // 'YYYY-MM-DD'


     if ((!startDate && !endDate) || (ticketCreatedAt >= startDate && ticketCreatedAt <= endDate)) {

      
            if (!ticketsByDate1[formattedDate]) {
                ticketsByDate1[formattedDate] = 1;
            } else {
                ticketsByDate1[formattedDate] += 1;
            }
       


         totalTickets++;
         (ticketData.tags || []).forEach(tag => {
             const category = subcategoryToCategory[tag];
             if (category && !countedCategories.has(category)) {
                 categoryCount[category] = (categoryCount[category] || 0) + 1;
                 countedCategories.add(category);
             }
         });
     
         const state = ticketData.state;
         if (state) {
             stateCount[state] = (stateCount[state] || 0) + 1;
         }
     
         const location = ticketData.cityTicket;
         if (state === "Abierto" && location) {
             locationCount[location] = (locationCount[location] || 0) + 1;
         }
     } 
     
    });
    const sortedDates = Object.keys(ticketsByDate1).sort();
    const ticketTrendLabels = sortedDates;
    const ticketTrendData = sortedDates.map(date => ticketsByDate1[date]);
    // Consultar usuarios inhabilitados desde Firebase Auth
    const listAllUsers = async (nextPageToken) => {
        const result = await auth.listUsers(1000, nextPageToken);
        return result.users;
    };

    let usersAuth = [];
    let nextPageToken;
    do {
        const users = await listAllUsers(nextPageToken);
        usersAuth = usersAuth.concat(users);
        nextPageToken = users.pageToken;
    } while (nextPageToken);

    const totalDisabledUsers = usersAuth.filter(user => user.disabled).length;

    const filterData = (data) => {
        return Object.entries(data).filter(([key, value]) => value > 0).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
    };

    const filteredCategoryCount = filterData(categoryCount);
    const filteredStateCount = filterData(stateCount);
    const filteredSubcategoryCount = filterData(subcategoryCount);
    const filteredCityCount = filterData(cityCount);
    const filteredLocationCount = filterData(locationCount);

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
            description: startDate && endDate ? `Tickets creados del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}` : 'Tickets totales creados'
        },
        {
            title_card: 'Usuarios Inhabilitados',
            value: totalDisabledUsers,
            description: 'Total de usuarios inhabilitados'
        }
    ];

    const jsonify = (data) => JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

    res.render('dashboard', {
        metrics,
        layout: 'main',
        showNavbar: true,
        startDate: startDate ? startDate.toISOString().split('T')[0] : null,
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        barChartLabels: jsonify(Object.keys(filteredStateCount)),
        barChartData: jsonify(Object.values(filteredStateCount)),
        categoryChartLabels: jsonify(Object.keys(filteredCategoryCount)),
        categoryChartData: jsonify(Object.values(filteredCategoryCount)),
        subcategoryChartLabels: jsonify(Object.keys(filteredSubcategoryCount)),
        subcategoryChartData: jsonify(Object.values(filteredSubcategoryCount)),
        cityChartLabels: jsonify(Object.keys(filteredCityCount)),
        cityChartData: jsonify(Object.values(filteredCityCount)),
        userTrendLabels: jsonify(userTrendLabels),
        userTrendData: jsonify(userTrendData),
        professionalTrendLabels: jsonify(professionalTrendLabels), // Convierte a JSON
        professionalTrendData: jsonify(professionalTrendData) ,   // Convierte a JSON
        ticketTrendLabels: jsonify(ticketTrendLabels),
        ticketTrendData: jsonify(ticketTrendData),
        locationChartLabels: jsonify(Object.keys(filteredLocationCount)),
        locationChartData: jsonify(Object.values(filteredLocationCount))
    });
});

*/

router.get('/pdf', async (req, res) => {res.render('inform')});

module.exports = router;
