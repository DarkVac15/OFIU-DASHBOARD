const express = require('express');
const router = express.Router();
const { db } = require("../config/firebase"); // Solo usas `db`, eliminé `auth` para evitar redundancias
require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

router.post('/', async (req, res) => {
    const docId = req.query.id;
    
    if (!docId) {
        return res.status(400).json({ error: 'ID del documento no proporcionado' });
    }

    try {
        // Obtener subcategorías de Firestore
        const snapshot = await db.collection('category').get();
        const subcategories = []; // Almacenar solo subcategorías
        snapshot.forEach(doc => {
            const data = doc.data(); // Obtener los datos del documento
            // Iterar sobre cada subcategoría en el documento
            for (const [key, value] of Object.entries(data)) {
                if (value && typeof value === 'object') {
                    subcategories.push(key); // Añadir el nombre de la subcategoría
                }
            }
        });

        // Obtener el ticket del ID proporcionado
        const doc = await db.collection('tickets').doc(docId).get();
        if (!doc.exists) {
            console.error("Documento no encontrado para el ID:", docId);
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        const descripcion = doc.data().description;
        console.log(descripcion);

        // Inicializar la API de Google Generative AI
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Definir el prompt para la IA
        const prompt = `
        Dada la siguiente descripción: "${descripcion}", y esta lista de etiquetas: [${subcategories.join(', ')}], selecciona solo las etiquetas más relevantes para la descripción, separadas por coma. Si no encuentras ninguna relación, coloca "Sin etiqueta"`;

        // Llamada a la API para generar contenido
        const result = await model.generateContent(prompt);
        
        // Asegúrate de que el resultado devuelva la estructura correcta
        const responseText = result?.text || "Sin etiqueta"; 

        // Limpiar y formatear las etiquetas sugeridas
        const etiquetasSugeridas = responseText
            .trim() 
            .split(',')
            .map(etiqueta => etiqueta.trim());

        console.log("Etiquetas sugeridas:", etiquetasSugeridas);

        // Actualizar el documento en Firestore con las etiquetas sugeridas
        await db.collection('tickets').doc(docId).update({
            tags: etiquetasSugeridas
        });

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
