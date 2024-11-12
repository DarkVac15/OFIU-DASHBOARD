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
    Dada la descripción: "${descripcion}", y la lista de etiquetas: [${subcategories.join(', ')}], selecciona solo las etiquetas que tengan una relación lógica y directa con la descripción proporcionada. Devuelve únicamente las etiquetas relevantes, separadas por coma. Si ninguna etiqueta es relevante, responde con "Sin etiqueta".`;

        // Llamada a la API para generar contenido
    
        const result = await model.generateContent(prompt);
      
        const responseText = result.response.candidates[0]?.content.parts[0]?.text || "Sin etiqueta";

        // Limpiar y formatear las etiquetas sugeridas
        const etiquetasSugeridas = responseText
            .trim() 
            .split(',')
            .map(etiqueta => etiqueta.trim());
        // Actualizar el documento en Firestore con las etiquetas sugeridas
        await db.collection('tickets').doc(docId).update({
            tags: etiquetasSugeridas
        });

        res.json({ message: "OK" });

    } catch (error) {
        
        res.status(500).json({ error: "Error interno del servidor", details: error.message });
       
        
    }
});

router.get('/reports', async (req, res)=>{
    const message = req.query.message || null;
    res.render('reports',{errorMessage: message})
});

router.post("/reports/submit", mailController.sendReport);

router.get('/support', async (req, res)=>{
    const message = req.query.message || null;
    res.render('support',{errorMessage: message})
});

router.post("/support/submit", mailController.sendSupport );


module.exports = router;
