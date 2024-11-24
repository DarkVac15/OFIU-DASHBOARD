const express = require('express');
const router = express.Router();
const { db } = require("../config/firebase"); // Solo usas `db`, eliminé `auth` para evitar redundancias
const mailController = require('../controller/mailController');
require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

router.post('/tags_jobs', async (req, res) => {
    const docId = req.body.id;
    // console.log(docId);

    if (!docId) {
        return res.status(400).json({ error: 'ID del documento no proporcionado' });
    }

    try {
        // Obtener subcategorías de Firestore


        const categoriesSnapshot = await db.collection('category').get(); // Obtener todas las categorías
        const subcategorias = []; // Array para almacenar las categorías con sus subcategorías
        for (const categoryDoc of categoriesSnapshot.docs) {
            const categoryId = categoryDoc.id; // ID de la categoría
            //const categoryData = categoryDoc.data(); // Datos de la categoría
            // Obtener las subcategorías de la categoría actual
            const subcategoriesSnapshot = await db.collection(`category/${categoryId}/subcategories`).get();
         
            const subcategoryTitles = subcategoriesSnapshot.docs.map(subDoc => subDoc.data().title); // Extraer solo los títulos
            
            subcategorias.push(...subcategoryTitles); 
        }
        console.log(subcategorias)

        // console.log(subcategories);
        // Obtener el ticket del ID proporcionado
        const doc = await db.collection('tickets').doc(docId).get();
        if (!doc.exists) {

            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        const descripcion = doc.data().description;

        // Inicializar la API de Google Generative AI
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Definir el prompt para la IA
        const prompt = `
    Dada la descripción: "${descripcion}", y la lista de etiquetas: [${subcategorias.join(', ')}], selecciona solo las etiquetas que tengan una relación lógica y directa con la descripción proporcionada. Devuelve únicamente las etiquetas relevantes, separadas por coma. Si ninguna etiqueta es relevante, responde con "Sin etiqueta".`;

        // Llamada a la API para generar contenido

        const result = await model.generateContent(prompt);

        const responseText = result.response.candidates[0]?.content.parts[0]?.text || "Sin etiqueta";
        console.log(prompt)

        // Limpiar y formatear las etiquetas sugeridas
        const etiquetasSugeridas = responseText
            .trim()
            .split(',')
            .map(etiqueta => etiqueta.trim());
        // Actualizar el documento en Firestore con las etiquetas sugeridas
        await db.collection('tickets').doc(docId).update({
            tags: etiquetasSugeridas
        });

         res.status(200).json("ok");

    } catch (error) {

        res.status(500).json({ error: "Error interno del servidor", details: error.message });


    }
});

router.get('/reports', async (req, res) => {
    const message = req.query.message || null;
    res.render('reports', { errorMessage: message })
});

router.post("/reports/submit", mailController.sendReport);

router.get('/support', async (req, res) => {
    const message = req.query.message || null;
    res.render('support', { errorMessage: message })
});

router.post("/support/submit", mailController.sendSupport);


module.exports = router;
