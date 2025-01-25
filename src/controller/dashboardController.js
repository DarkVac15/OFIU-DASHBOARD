const { db, auth } = require("../config/firebase");
const puppeteer = require('puppeteer');


exports.dataDashboard = async (req, res) => {

    let totalProfessionals = 0;
    let categoryCount = {};

    let stateCount = {};
    let cityCount = {};
    let totalTickets = 0;
    let locationCount = {};
    // let totalUsers = 0;

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
    const categoriesSnapshot = await db.collection('category').get(); // Obtener todas las categorías
    const categoriasConSubcategorias = []; // Array para almacenar las categorías con sus subcategorías
    for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryId = categoryDoc.id; // ID de la categoría
        const categoryData = categoryDoc.data(); // Datos de la categoría
        // Obtener las subcategorías de la categoría actual
        const subcategoriesSnapshot = await db.collection(`category/${categoryId}/subcategories`).get();
        const subcategoryTitles = subcategoriesSnapshot.docs.map(subDoc => subDoc.data().title); // Extraer solo los títulos
        // Agregar categoría con sus subcategorías al array
        categoriasConSubcategorias.push({
            categoria: categoryData.name, // Nombre de la categoría
            subcategories: subcategoryTitles, // Array de títulos de subcategorías
        });
    }


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

    //Obtener profesionales en la nueva colección "professionals"
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

    let subcategoryCount = {};  // Objeto para contar la cantidad de profesionales por subcategoría


    // Contar profesionales desde la nueva colección "professionals"
    const professionalsSnapshot = await db.collection('professionals').get();
    professionalsSnapshot.forEach(doc => {
        const professionalData = doc.data();
        const professionalCreatedAt = professionalData.createdAt;
        const city = professionalData.city;
        const skills = professionalData.skills;  // Aquí es donde están las subcategorías

        if ((!startDate && !endDate) || (professionalCreatedAt && professionalCreatedAt.toDate() >= startDate && professionalCreatedAt.toDate() <= endDate)) {
            totalProfessionals++;

            // Contar las subcategorías en el array skills
            if (skills && Array.isArray(skills)) {
                skills.forEach(subcategory => {
                    subcategoryCount[subcategory] = (subcategoryCount[subcategory] || 0) + 1;
                });
            }
            if (city) {
                cityCount[city] = (cityCount[city] || 0) + 1;
            }
        }

    });


    // Ahora tienes los conteos de subcategorías en el objeto subcategoryCount
    //console.log(subcategoryCount); // Imprime el resultado o lo puedes devolver com

    const ticketsSnapshot = await db.collection('tickets').get();

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

            const state = ticketData.state;
            if (state) {
                stateCount[state] = (stateCount[state] || 0) + 1;
            }
            const location = ticketData.cityTicket;
            if (state === "Abierto" && location) {
                locationCount[location] = (locationCount[location] || 0) + 1;
            }
            // Contar las categorías (subcategorías) dentro de 'tags'
            const tags = ticketData.tags;
            if (tags && Array.isArray(tags)) {
                tags.forEach(tag => {
                    categoryCount[tag] = (categoryCount[tag] || 0) + 1;
                });

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
        cityChartLabels: jsonify(Object.keys(filteredCityCount)),
        cityChartData: jsonify(Object.values(filteredCityCount)),
        userTrendLabels: jsonify(userTrendLabels),
        userTrendData: jsonify(userTrendData),
        professionalTrendLabels: jsonify(professionalTrendLabels), // Convierte a JSON
        professionalTrendData: jsonify(professionalTrendData),   // Convierte a JSON
        ticketTrendLabels: jsonify(ticketTrendLabels),
        ticketTrendData: jsonify(ticketTrendData),
        locationChartLabels: jsonify(Object.keys(filteredLocationCount)),
        locationChartData: jsonify(Object.values(filteredLocationCount)),
        labelCategoryProf: jsonify(Object.keys(subcategoryCount)),
        valueProf: jsonify(Object.values(subcategoryCount)),

        isDashboard: true,
        isUser: false,
        isTags: false
    });
};


exports.dataReports = async (req, res) => {
    // Ajustar startDate y endDate a la zona horaria de Bogotá (UTC-5)
    const startDate = req.query.startDate ? new Date(req.query.startDate + "T00:00:00Z") : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate + "T23:59:59Z") : null;

    // Ajustar las fechas a la zona horaria de Bogotá (UTC-5)
    if (startDate) {
        startDate.setHours(startDate.getHours() - 5); // Ajustar la fecha de inicio
    }
    if (endDate) {
        endDate.setHours(endDate.getHours() - 5); // Ajustar la fecha de fin
    }

    // Obtener las categorías desde Firestore
    categoriesSnapshot = await db.collection('category').get(); // Obtener todas las categorías
    const categoriasConSubcategorias = []; // Array para almacenar las categorías con sus subcategorías
    for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryId = categoryDoc.id; // ID de la categoría
        const categoryData = categoryDoc.data(); // Datos de la categoría
        // Obtener las subcategorías de la categoría actual
        const subcategoriesSnapshot = await db.collection(`category/${categoryId}/subcategories`).get();
        const subcategoryTitles = subcategoriesSnapshot.docs.map(subDoc => subDoc.data().title); // Extraer solo los títulos
        // Agregar categoría con sus subcategorías al array
        categoriasConSubcategorias.push({
            categoria: categoryData.name, // Nombre de la categoría
            subcategories: subcategoryTitles, // Array de títulos de subcategorías
        });
    }


    let usersQuery = db.collection('users');
    if (startDate && endDate) {
        usersQuery = usersQuery.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
    }

    const usersSnapshot = await usersQuery.get();
    const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));

    // Procesamiento de usuarios y datos de registros
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
            const createdAt = professionalData.createdAt?.toDate().toLocaleString('en-CA', { timeZone: 'America/Bogota' }).split(',')[0];
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
    let categoryCount = {};
    let stateCount = {};
    let cityCount = {};
    let totalTickets = 0;
    // Contar profesionales
    const professionalsSnapshot = await db.collection('professionals').get();
    professionalsSnapshot.forEach(doc => {
        const professionalData = doc.data();
        const city = professionalData.city;
        totalProfessionals++;
        (professionalData.skills || []).forEach(skill => {
            categoryCount[skill] = (categoryCount[skill] || 0) + 1;
        });

        if (city) {
            cityCount[city] = (cityCount[city] || 0) + 1;///// aqui se cuantos profesionale stiene cada ciudaddddddddddddddddddddddd
        }
    });

    // Obtener tickets
    const cityCount1 = {}
    categoriasConSubcategorias
    const categoryCount1 = {};
    const ticketsByDate1 = {};

    const ticketsSnapshot = await db.collection('tickets').get();
    ticketsSnapshot.forEach(ticketDoc => {
        const ticketData = ticketDoc.data();
        const ticketCreatedAt = ticketData.createdAt.toDate();
        const formattedDate = ticketCreatedAt.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }); // 'YYYY-MM-DD'
        // Validar el rango de fechas
        if ((!startDate && !endDate) || (ticketCreatedAt >= startDate && ticketCreatedAt <= endDate)) {

            if (!ticketsByDate1[formattedDate]) {
                ticketsByDate1[formattedDate] = 1;
            } else {
                ticketsByDate1[formattedDate] += 1;
            }
            totalTickets++;
            // Contar el estado de los tickets
            const state = ticketData.state;
            if (state) {
                stateCount[state] = (stateCount[state] || 0) + 1;
            }
            // Contar las ciudades de los tickets
            const location = ticketData.cityTicket;
            if (state === "Abierto" && location) {
                cityCount1[location] = (cityCount1[location] || 0) + 1;
            }
            const tags = ticketData.tags;
            if (tags && Array.isArray(tags)) {
                tags.forEach(tag => {
                    categoryCount1[tag] = (categoryCount1[tag] || 0) + 1;
                });

            }
        }
    });


    // Filtrar los datos para enviar solo los que tengan valores mayores a 0
    const filterData = (data) => {
        return Object.entries(data).filter(([key, value]) => value > 0).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
    };

    const data_etiquetas_ticket = filterData(categoryCount1)

    const filteredStateCount = filterData(stateCount);
    const filteredCityCountProfesional = filterData(cityCount);//ciudades de los tickets
    const filteredLocationCountTicket = filterData(cityCount1);

    const sortedDates = Object.keys(ticketsByDate1).sort();
    const ticketTrendLabels = sortedDates;
    const ticketTrendData = sortedDates.map(date => ticketsByDate1[date]);
    const data_ticket_city = filterData(filteredLocationCountTicket)
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

    // Pasar los datos a la vista de informes
    const moment = require('moment-timezone');
    const fechaActual = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');

    const jsonify = (data) => JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
    //uso de la ia metodo

    const message = await getGreeting(
        fechaActual, totalUsers, totalProfessionals, totalTickets, totalDisabledUsers, startDate ? startDate.toISOString().split('T')[0] : null, endDate ? endDate.toISOString().split('T')[0] : null,
        filteredStateCount, data_etiquetas_ticket, filteredLocationCountTicket, filteredCityCountProfesional,
        data_ticket_city, jsonify(userTrendLabels), jsonify(userTrendData),
        jsonify(professionalTrendLabels), jsonify(professionalTrendData), jsonify(ticketTrendLabels),
        jsonify(ticketTrendData)
    );

    const texto = String(message);
    //console.log(texto)
    // Expresiones regulares más flexibles
    
    const hallazgosMatch = texto.match(/(?<=\*\*Hallazgos:\*\*\n)([\s\S]*?)(?=\n\*\*Recomendaciones:\*\*)/);
    const recomendacionesMatch = texto.match(/(?<=\*\*Recomendaciones:\*\*\n)([\s\S]*?)(?=\n\*\*Perspectivas futuras:\*\*)/i);
    const perspectivasFuturasMatch = texto.match(/(?<=\*\*Perspectivas futuras:\*\*\n)([\s\S]*)/i);
    
    const hallazgos = hallazgosMatch ? hallazgosMatch[0].trim() : "No se encontraron hallazgos";
    const recomendaciones = recomendacionesMatch ? recomendacionesMatch[0].trim() : "No se encontraron recomendaciones";
    const perspectivasFuturas = perspectivasFuturasMatch ? perspectivasFuturasMatch[0].trim() : "No se encontraron perspectivas futuras";
    


    const formattedHallazgos = hallazgos
        .split(/\n\* /) // Dividir por el asterisco inicial de cada ítem de la lista
        .filter(item => item.trim() !== '') // Eliminar elementos vacíos
        .map(item => {
            // Eliminar los asteriscos y limpiar saltos de línea
            const cleanedItem = item.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();
            return `<li>${cleanedItem}</li>`;
        })
        .join(''); // Unir todo como cadena


    const formattedRecomendaciones = recomendaciones
        .split(/\n\* /) // Dividir por el asterisco inicial de cada ítem de la lista
        .filter(item => item.trim() !== '') // Eliminar elementos vacíos
        .map(item => {
            // Eliminar los asteriscos y limpiar saltos de línea
            const cleanedItem = item.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();
            return `<li>${cleanedItem}</li>`;
        })
        .join(''); // Unir todo como cadena

    const formattedPerspectivasFuturas = perspectivasFuturas
        .split(/\n\* /) // Dividir por el asterisco inicial de cada ítem de la lista
        .filter(item => item.trim() !== '') // Eliminar elementos vacíos
        .map(item => {
            // Eliminar los asteriscos y limpiar saltos de línea
            const cleanedItem = item.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();
            return `<li>${cleanedItem}</li>`;
        })
        .join(''); // Unir todo como cadena


    //envio de datos a la vista
    res.render('inform', {
        fechaActual,
        totalUsers,//total usuarios
        totalProfessionals,// total profesionales
        totalTickets,//totatl de tickets
        totalDisabledUsers,// total de usuarios inhablitiados
        startDate: startDate ? startDate.toISOString().split('T')[0] : null,
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        filteredStateCount,
        data_etiquetas_ticket,
        filteredLocationCountTicket,
        filteredCityCountProfesional,
        locationChartLabels: jsonify(Object.keys(filteredLocationCountTicket)),
        locationChartData: jsonify(Object.values(filteredLocationCountTicket)),
        userTrendLabels: jsonify(userTrendLabels),
        userTrendData: jsonify(userTrendData),
        professionalTrendLabels: jsonify(professionalTrendLabels),
        professionalTrendData: jsonify(professionalTrendData),
        ticketTrendLabels: jsonify(ticketTrendLabels),
        ticketTrendData: jsonify(ticketTrendData),
        formattedHallazgos,
        formattedRecomendaciones,
        formattedPerspectivasFuturas

    });


};


exports.generatePDF = async (req, res) => {

    try {
        const { startDate, endDate } = req.query;
        // URL de la página que deseas imprimir, en este caso la ruta de 'inform'
        const url = startDate && endDate
            ? `http://localhost:3000/dashboard/export-pdf?startDate=${startDate}&endDate=${endDate}`
            : `http://localhost:3000/dashboard/export-pdf`; // URL sin parámetros si no se pasan fechas


        //    console.log('Token obtenido:', req.cookies.token);


        // Iniciar Puppeteer
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        } //quitar esto para probar en local*/
        );

        const page = await browser.newPage();

        // Navegar a la URL de la página de la cual deseas hacer el PDF
        await page.goto(url, {
            waitUntil: 'networkidle0', timeout: 60000
        });

        // Generar el PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // Para incluir el fondo y los estilos de la página
            margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
        });

        // Cerrar el navegador
        await browser.close();

        // Enviar el PDF como respuesta para que el navegador lo descargue
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="informe.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length);

        res.end(pdfBuffer);
    } catch (error) {
        console.error("Error generando el PDF:", error);
        res.status(500).send("Hubo un error al generar el PDF.", error);
    }
};






const { GoogleGenerativeAI } = require("@google/generative-ai");
async function getGreeting(fechaActual, totalUsers, totalProfessionals, totalTickets, totalDisabledUsers, startDate, endDate, filteredStateCount, data_etiquetas_ticket, data_ticket_city, filteredCityCountProfesional, filteredLocationCountTicket, userTrendLabels, userTrendData, professionalTrendLabels, professionalTrendData, ticketTrendLabels, ticketTrendData) {
    //console.log(fechaActual)
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // Definir el prompt para la IA
    const prompt = `
   Estos son los datos del informe:
   - Fecha actual: ${fechaActual}
   - Total de usuarios: ${totalUsers}
   - Total de profesionales: ${totalProfessionals}
   - Total de tickets: ${totalTickets}
   - Total de usuarios deshabilitados: ${totalDisabledUsers}
   - Rangos de fecha: desde ${startDate} hasta ${endDate}
   - Estados de tickets: ${JSON.stringify(filteredStateCount)}
   - Etiquetas de ticket por categoría: ${JSON.stringify(data_etiquetas_ticket)}
   - Tickets por ubicación: ${JSON.stringify(data_ticket_city)}
   - Profesionales por ciudad: ${JSON.stringify(filteredCityCountProfesional)}
   Proporciona hallazgos, recomendaciones y perspectivas futuras basadas en estos datos, y después de cada punto coloca "\n"
 `;
    // Llamada a la API para generar contenido

    const result = await model.generateContent(prompt);

    const responseText = result.response.candidates[0]?.content.parts[0]?.text || "Sin etiqueta";
    //


    return (responseText);
}