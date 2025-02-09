const { db, auth } = require("../config/firebase");
const puppeteer = require('puppeteer-core');//revisar en locl
const moment = require('moment-timezone');

let userArray = [];
let profArray = [];
let userHArray = [];
let ticketArray = [];
let startDate = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');
let endDate = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');;  // Hasta el final del día
const fechaActual = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');
let filteredStateCount = null;
let filteredCityCount = null;
let userTrendLabels, userTrendData = null;
let professionalTrendLabels, professionalTrendData = null;
let ticketTrendLabels = null;
let ticketTrendData = null;
let filteredLocationCount = {};
let subcategoryCount = {};
let categoryCount = {};
let totalUsers, totalProfessionals, totalTickets, totalDisabledUsers;
let filteredCategoryCount = null;

exports.dataDashboard = async (req, res) => {

    userArray = [];
    profArray = [];
    userHArray = [];
    ticketArray = [];


    totalProfessionals = 0;


    let stateCount = {};
    let cityCount = {};
    totalTickets = 0;
    let locationCount = {};
    totalUsers = 0;

    // Ajustar startDate y endDate a la zona horaria de Bogotá (UTC-5)
    // Obtén las fechas del query string
    startDate = req.query.startDate ? new Date(req.query.startDate + "T00:00:00Z") : null; // Considerar UTC
    endDate = req.query.endDate ? new Date(req.query.endDate + "T23:59:59Z") : null;  // Hasta el final del día

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

    ///user vliente
    let usersQuery = db.collection('users');
    if (startDate && endDate) {
        usersQuery = usersQuery.where('createdAt', '>=', startDate).where('createdAt', '<=', endDate);
    }

    const usersSnapshot = await usersQuery.get();
    const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()


    }));

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

            //guardar datos para mostar en un mdal
            userArray.push({
                name: user.data.name,
                email: user.data.email,
                createdAt: createdAt
            });

        });


        const sortedDates = Object.keys(usersByDate).sort();
        const labels = sortedDates;
        const data = sortedDates.map(date => usersByDate[date]);

        return { labels, data };
    };



    ({ labels: userTrendLabels, data: userTrendData } = getUsersByDateRange(usersData));



    //Obtener profesionales en la nueva colección "professionals"
    const getProfessionalsByDateRange = async () => {
        const professionalsByDate = {};

        let query = db.collection('professionals');

        // Filtro para excluir documentos donde createdAt sea null
        query = query.where('createdAt', '!=', null);

        // Añade filtros de fecha solo si startDate y endDate no son null
        if (startDate !== null && startDate !== undefined) {
            query = query.where('createdAt', '>=', startDate);
        }

        if (endDate !== null && endDate !== undefined) {
            query = query.where('createdAt', '<=', endDate);
        }

        // Ejecuta la consulta
        const professionalsSnapshot = await query.get();
        /*const professionalsSnapshot = await db.collection('professionals')
            .where('createdAt', '>=', startDate)
            .where('createdAt', '<=', endDate)
            .get();
*/

        // Usamos for...of en lugar de forEach para esperar a las promesas
        for (const doc of professionalsSnapshot.docs) {
            const professionalData = doc.data();
            const professionalId = doc.id; // La ID del documento

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
            // Obtener el documento del usuario de forma asincrónica
            const userDocRef = db.collection('users').doc(professionalId); // Se asume que 'doc' es el ID del usuario
            const userDoc = await userDocRef.get();

            if (userDoc.exists) {

                profArray.push({
                    name: userDoc.data().name, // Accede a los datos del usuario correctamente
                    email: userDoc.data().email,
                    city: professionalData.city,
                    phone: professionalData.phone,
                    skills: professionalData.skills,
                    createdAt: createdAt
                });
            } else {
                console.log(`Usuario no encontrado con ID: ${professionalData.doc}`);
            }//



        }

        // Ordenar fechas y preparar los datos para el gráfico
        const sortedDates = Object.keys(professionalsByDate).sort();
        const labels = sortedDates;
        const data = sortedDates.map(date => professionalsByDate[date]);

        // Puedes retornar los resultados si los necesitas para la vista o el análisis posterior
        return { labels, data }; // Devolver el array de usuarios también
    };


    ({ labels: professionalTrendLabels, data: professionalTrendData } = await getProfessionalsByDateRange());



    totalUsers = usersData.length;
    subcategoryCount = {};
    // Objeto para contar la cantidad de profesionales por subcategoría


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
    //console.log(subcategoryCount); // 
    categoryCount = {};
    const ticketsSnapshot = await db.collection('tickets').get();

    const ticketsByDate1 = {};

    ticketsSnapshot.forEach(ticketDoc => {
        const ticketData = ticketDoc.data();
        const ticketCreatedAt = ticketData.createdAt.toDate();
        const formattedDate = ticketCreatedAt.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }); // 'YYYY-MM-DD'

        // Verificar si el ticket está dentro del rango de fechas
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

            // Contar las categorías (subcategorías) dentro de 'tags' solo si el ticket está dentro del rango de fechas
            const tags = ticketData.tags;
            if (tags && Array.isArray(tags)) {
                tags.forEach(tag => {
                    categoryCount[tag] = (categoryCount[tag] || 0) + 1;
                });
            }

            // Guardar en el array los datos
            ticketArray.push({
                title: ticketData.title,
                createdAt: formattedDate,
                cityTicket: ticketData.cityTicket,
                state: ticketData.state,
                tags: ticketData.tags
            });
        }
    });

    const sortedDates = Object.keys(ticketsByDate1).sort();
    ticketTrendLabels = sortedDates;
    ticketTrendData = sortedDates.map(date => ticketsByDate1[date]);

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


    totalDisabledUsers = usersAuth.filter(user => user.disabled).length;
    const disabledUsers = usersAuth.filter(user => user.disabled);
    disabledUsers.forEach(user => {
        userHArray.push({
            name: user.displayName,
            email: user.email
        });

    });





    const filterData = (data) => {
        return Object.entries(data).filter(([key, value]) => value > 0).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
    };

    filteredCategoryCount = filterData(categoryCount);

    //console.log(" filteredCategoryCount =", filteredCategoryCount)
    filteredStateCount = filterData(stateCount);
    filteredCityCount = filterData(cityCount);
    filteredLocationCount = filterData(locationCount);


    const metrics = [
        {
            title_card: 'Usuarios Registrados',
            value: totalUsers,
            description: startDate && endDate ? `Usuarios registrados del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}` : 'Usuarios totales registrados',
            type: 'users' // Tipo para saber qué datos cargar en el modal
        },
        {
            title_card: 'Profesionales Registrados',
            value: totalProfessionals,
            description: startDate && endDate ? `Profesionales registrados del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}` : 'Profesionales totales registrados'
            , type: 'professionals' // Tipo para saber qué datos cargar en el modal
        },
        {
            title_card: 'Tickets Creados',
            value: totalTickets,
            description: startDate && endDate ? `Tickets creados del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}` : 'Tickets totales creados'
            , type: 'tickets'
        },
        {
            title_card: 'Usuarios Inhabilitados',
            value: totalDisabledUsers,
            description: 'Total de usuarios inhabilitados',
            type: 'disabled-users'
        }
    ];

    // Mostrar los datos en la consola
    //console.log("Datos de los usuarios:", userArray);
    /// console.log("Datos de los profesionales:", profArray);
    // console.log("Datos de los tickets:", ticketArray);
    //console.log("Datos de los usuarios inhabilirado :", userHArray);

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

        dataUser: jsonify(userArray),
        dataProf: jsonify(profArray),
        userBloq: jsonify(userHArray),
        dataticket: jsonify(ticketArray),


        isDashboard: true,
        isUser: false,
        isTags: false
    });
};



exports.dataReports = async (req, res) => {
    // Convertir startDate y endDate a objetos Date si son cadenas
    // Convertir startDate y endDate a objetos Date si son cadenas
    if (startDate && typeof startDate === 'string') {
        startDate = new Date(startDate + "T00:00:00Z"); // Asegúrate de que sea UTC
        if (isNaN(startDate.getTime())) { // Verifica si la fecha es válida
            startDate = null; // Si no es válida, asigna null
        }
    }

    if (endDate && typeof endDate === 'string') {
        endDate = new Date(endDate + "T23:59:59Z"); // Asegúrate de que sea UTC
        if (isNaN(endDate.getTime())) { // Verifica si la fecha es válida
            endDate = null; // Si no es válida, asigna null
        }
    }

    // Formatear las fechas solo si son válidas
    const formattedStartDate = startDate instanceof Date && !isNaN(startDate.getTime())
        ? startDate.toISOString().split('T')[0]
        : null;

    const formattedEndDate = endDate instanceof Date && !isNaN(endDate.getTime())
        ? endDate.toISOString().split('T')[0]
        : null;

    //const data_etiquetas_ticket = filterData(categoryCount)
    const jsonify = (data) => JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
    //uso de la ia metodo

    const message = await getGreeting(
        fechaActual,
        totalUsers,
        totalProfessionals,
        totalTickets,
        totalDisabledUsers,
        formattedStartDate,
        formattedEndDate,
        filteredStateCount,
        filteredCategoryCount,
        filteredLocationCount,
        filteredCityCount//errp aaqui es de ticket po ciudad no de prof


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

        totalUsers,//total usuarios/metrics de la otra
        totalProfessionals,// total profesionales
        totalTickets,//totatl de tickets
        totalDisabledUsers,// total de usuarios inhablitiados

        startDate: startDate ? startDate.toISOString().split('T')[0] : null,
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,

        filteredStateCount,
        //data_etiquetas_ticket,
        filteredCategoryCount,
        filteredCityCount,
        filteredLocationCount,
        //filteredCityCountProfesional,
        //filteredCityCount,

        locationChartLabels: jsonify(Object.keys(filteredCityCount)),
        locationChartData: jsonify(Object.values(filteredCityCount)),

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

}


exports.generatePDF = async (req, res) => {
    try {
      
    
      const { startDate, endDate } = req.query;

       const url = startDate && endDate
            ? `http://localhost:3000/dashboard/export-pdf?startDate=${startDate}&endDate=${endDate}`
            : `http://localhost:3000/dashboard/export-pdf`;


        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser',
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Evita problemas de memoria en entornos limitados
                '--disable-accelerated-2d-canvas',
                '--disable-gpu', // Desactiva la GPU si no es necesaria
                '--remote-debugging-port=9222', // Opcional: habilita el debugging remoto
                '--single-process', // Útil para entornos con recursos limitados
            ],
        });
        
        const page = await browser.newPage();
        // Navegar a la URL y esperar a que la red esté inactiva
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 120000
        });
        // Esperar a que las gráficas se rendericen
        // Generar el PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
        });

        // Cerrar el navegador
        await browser.close();

        // Enviar el PDF como respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="informe.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer);
       
    } catch (error) {
        console.error("Error al generar el PDF:", error);
        
        res.status(500).json({ error: "Hubo un error al generar el PDF" });

    }
};


const { GoogleGenerativeAI } = require("@google/generative-ai");
async function getGreeting(
    fechaActual,
    totalUsers,
    totalProfessionals,
    totalTickets,
    totalDisabledUsers,
    startDate,
    endDate,
    filteredStateCount,
    data_etiquetas_ticket,
    data_ticket_city,
    filteredCityCount
) {
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
   - Tickets por ubicación: ${JSON.stringify(data_ticket_city /*mal */)}
   - Profesionales por ciudad: ${JSON.stringify(filteredCityCount/*bien */)}
   Proporciona hallazgos, recomendaciones y perspectivas futuras basadas en estos datos, y después de cada punto coloca "\n"
 `;
    // Llamada a la API para generar contenido
    //console.log(prompt)
    const result = await model.generateContent(prompt);
    const responseText = result.response.candidates[0]?.content.parts[0]?.text || "Sin etiqueta";
    return (responseText);
}


