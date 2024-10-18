//
//card de tickets creados
//ticktes conectaods por campo de estado
//
//
//
//

const { db, auth } = require("../config/firebase");
const express = require('express');

const FieldValue = require('firebase-admin').firestore.FieldValue;

const router = express.Router();
   
router.get('/test-firestore', async (req, res) => {
    try {
      const snapshot = await db.collection('tickets').get();
      const data = [];
  
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() }); // Guarda los datos en un array
      });
  
      res.status(200).json(data); // Devuelve los datos en formato JSON
    } catch (error) {
      console.error("Error al acceder a Firestore:", error);
      res.status(500).json({ error: 'Error al acceder a Firestore' });
    }
  });

    router.get('/', async (req, res) => {
        try {         
            const snapshot = await db.collection('category').get();    
            const etiquetas = []; // Para almacenar las categorías y subcategorías    
            snapshot.forEach(doc => {
                const data = doc.data(); // Obtén los datos del documento
                // Verificar si el documento tiene subcategorías
                let hasSubcategories = false;    
                // Iterar sobre cada subcategoría en el documento
                for (const [key, value] of Object.entries(data)) {
                    if (value && typeof value === 'object') {
                        hasSubcategories = true;
                        etiquetas.push({
                            category: doc.id, // Nombre de la categoría (nombre del documento)
                            subcategory: key, // Nombre de la subcategoría
                            description: value.desc, // Descripción de la subcategoría
                            image: value.image // Imagen de la subcategoría
                        });
                    }
                }
    
                // Si no hay subcategorías, agrega la categoría como vacía
                if (!hasSubcategories) {
                    etiquetas.push({
                        category: doc.id, // Nombre de la categoría
                        subcategory: 'N/A', // Indicador de que no hay subcategoría
                        description: 'Sin descripción', // Descripción por defecto
                        image: '', // Imagen vacía
                    });
                }
            });
            res.render('tags', { title: 'Gestión de Etiquetas', etiquetas, layout: 'main', showNavbar: true });
        } catch (error) {
            console.error('Error al obtener etiquetas:', error);
            res.status(500).send('Error al obtener etiquetas');
        }
    });
    
   // res.render('tags', { layout: 'main', showNavbar: true })  // Reemplaza [] con las etiquetas reales


   router.post('/add-category', async (req, res) => {
    const { category, } = req.body;

    try {
        // Crea un nuevo documento con el ID igual a la categoría
        await db.collection('category').doc(category).set({
            // Puedes agregar otros campos si es necesario, por ejemplo:
            // Campo de ejemplo
        });

        res.status(201).send('Categoría agregada'); // Responde con un estado 201
    } catch (error) {
        console.error('Error agregando categoría: ', error);
        res.status(500).send('Error al agregar categoría');
    }
});


router.post('/add-subcategory',  async (req, res) => {
    const { categoriaId, subcategoria, descripcion,image } = req.body;
    if (!categoriaId || !subcategoria || !descripcion || !image ) {
        return res.status(400).send('Todos los campos son requeridos');
    }
   try {
        const categoryDoc = db.collection('category').doc(categoriaId);      
        await categoryDoc.set({
            [subcategoria]: {
                desc: descripcion,
                image: image
            }
        }, { merge: true });  // Utiliza merge para no sobrescribir otros datos del documento

        res.status(201).send('Subcategoría agregada');
    } catch (error) {
        console.error('Error agregando subcategoría: ', error);
        res.status(500).send('Error al agregar subcategoría');
    }
});

// Ruta para eliminar subcategoría

// Ruta para eliminar un campo de un documento
router.delete('/delete-subcategory/:categoryId/:subcategoryId', async (req, res) => {
    const { categoryId, subcategoryId } = req.params;

    try {
        const docRef = db.collection('category').doc(categoryId); // Referencia al documento
        await docRef.update({
            [subcategoryId]: FieldValue.delete() // Elimina el campo
        });

        res.status(200).send({ message: 'Campo eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar el campo:', error);
        res.status(500).send({ message: 'Error al eliminar el campo' });
    }
});





module.exports = router; 