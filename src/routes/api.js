// 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
//org-7PnWJXXmCnQEfNiat2VKJQn8


// api gemini  AIzaSyC6Wy640Uhf4h1C6g1w4K7t0BVhGZvR8gQ
const express = require('express');
const router = express.Router();
const { db, auth } = require("../config/firebase");
require('dotenv').config()

const { GoogleGenerativeAI } = require("@google/generative-ai");


router.post('/', async (req, res) => {
    const docId = req.query.id;
    try {
        // Obtener subcategorías de Firestore
        const snapshot = await db.collection('category').get();
        const subcategories = []; // Para almacenar solo las subcategorías
        snapshot.forEach(doc => {
            const data = doc.data(); // Obtén los datos del documento
            // Iterar sobre cada subcategoría en el documento
            for (const [key, value] of Object.entries(data)) {
                // Verificar si el valor es un objeto (lo que indicaría que es una subcategoría)
                if (value && typeof value === 'object') {
                    subcategories.push(key); // Agregar solo el nombre de la subcategoría
                }
            }
        });

        const doc = await db.collection('tickets').doc(docId).get();
        if (!doc.exists) {
            console.error("Documento no encontrado para el ID:", docId); // Log de error
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        const descripcion = doc.data().description;
        console.log(descripcion);        

        // Inicializar la API de Google Generative AI
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


        // Definir el prompt para la IA
        const prompt = `
        Dada la siguiente descripción: "${descripcion}", y esta lista de etiquetas: [${subcategories.join(', ')}], selecciona solamente las etiquetas que son más relevantes para la descripción, separadas por coma, y nada más. Si no encuentras ninguna relaciona coloca "Sin etiqueta"`;

        // Llamada a la API para generar contenido
        const result = await model.generateContent(prompt);

        const responseText = result.response.text();  // Asegúrate de que este método funcione según tu librería

        // Limpiar y formatear las etiquetas sugeridas
        const etiquetasSugeridas = responseText
            .trim() // Eliminar espacios en blanco
            .split(',') // Dividir en etiquetas separadas por comas
            .map(etiqueta => etiqueta.trim()); // Limpiar espacios alrededor de cada etiqueta

        console.log("Etiquetas sugeridas:", etiquetasSugeridas);

        // Actualizar el documento en Firestore con las etiquetas sugeridas
        await db.collection('tickets').doc(docId).update({
            tags: etiquetasSugeridas // Guardar el array de etiquetas
        });

        // Responder al cliente confirmando la actualización
        res.json({
            message: 'Etiquetas sugeridas guardadas con éxito',
            etiquetas_sugeridas: etiquetasSugeridas
        });

    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});



module.exports = router;