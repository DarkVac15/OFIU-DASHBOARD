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
   
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('category').get();
        const etiquetas = []; // Para almacenar las categorías y subcategorías

        // Usamos un bucle 'for' en lugar de 'forEach' para poder manejar la asincronía
        for (const doc of snapshot.docs) {
            const data = doc.data(); // Obtén los datos del documento de la categoría
            const categoryName = data.name; // Nombre de la categoría
            const categoryImage = data.image; // Imagen de la categoría
            const subcategoriesSnapshot = await doc.ref.collection('subcategories').get(); // Obtener las subcategorías

            if (subcategoriesSnapshot.empty) {
                // Si no hay subcategorías, agregamos la categoría como vacía
                etiquetas.push({
                    category: doc.id, // ID del documento de la categoría
                    categoryName: categoryName,
                    categoryImage: categoryImage,
                    subcategory: 'N/A', // Indicador de que no hay subcategoría
                    description: 'Sin descripción', // Descripción por defecto
                    image: '', // Imagen vacía
                });
            } else {
                // Si hay subcategorías, las iteramos
                subcategoriesSnapshot.forEach(subDoc => {
                    const subcategoryData = subDoc.data(); // Datos de cada subcategoría
                    etiquetas.push({
                        category: doc.id, // ID del documento de la categoría
                        categoryName: categoryName,
                        categoryImage: categoryImage,
                        subcategory: subDoc.id, // ID del documento de la subcategoría
                        description: subcategoryData.title, // Título de la subcategoría
                        image: subcategoryData.image, // Imagen de la subcategoría
                    });
                });
            }
        }

        // Renderizamos la vista con las etiquetas procesadas
        res.render('tags', {
            title: 'Gestión de Etiquetas',
            etiquetas,
            layout: 'main',
            showNavbar: true
        });
    } catch (error) {
        console.error('Error al obtener categorías y subcategorías:', error);
        res.status(500).send('Error al obtener categorías y subcategorías');
    }
});


    /*router.get('/', async (req, res) => {
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
    
                // Si naaao hay subcategorías, agrega la categoría como vacía
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
    });*/
    
   // res.render('tags', { layout: 'main', showNavbar: true })  // Reemplaza [] con las etiquetas reales


  /* router.post('/add-category', async (req, res) => {
    const { category, image} = req.body;

    try {
        // Crea un nuevo documento con el ID igual a la categoría
        await db.collection('category').doc(category).set({
            // Puedes agregar otros campos si es necesario, por ejemplo:
            // Campo de ejemplo
            image: image 
        });

        res.status(201).send('Categoría agregada'); // Responde con un estado 201
    } catch (error) {
        console.error('Error agregando categoría: ', error);
        res.status(500).send('Error al agregar categoría');
    }
});*/

router.post('/add-category', async (req, res) => {
    const { category, image } = req.body;

    try {
        // Crea un nuevo documento con el ID igual a la categoría
        await db.collection('category').doc(category).set({
            name: category, // Nombre de la categoría
            image: image  // Imagen de la categoría
          //  subcategories: [] // Inicializamos la subcolección de subcategorías como un arreglo vacío
        });

        res.status(201).send('Categoría agregada'); // Responde con un estado 201
    } catch (error) {
        console.error('Error agregando categoría: ', error);
        res.status(500).send('Error al agregar categoría');
    }
});

/*
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
});*/

router.post('/add-subcategory', async (req, res) => {
    const { categoriaId, subcategoria,  image } = req.body;
    
    // Validar que todos los campos necesarios estén presentes
    if (!categoriaId || !subcategoria  || !image) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    try {
        // Referencia al documento de la categoría
        const categoryRef = db.collection('category').doc(categoriaId);

        // Crear una nueva subcategoría en la subcolección 'subcategories'
        const subcategoryRef = categoryRef.collection('subcategories').doc(); // Documento con ID automático

        // Agregar la subcategoría con los datos recibidos
        await subcategoryRef.set({
            title: subcategoria,    // Nombre de la subcategoría
          //  description: descripcion, // Descripción de la subcategoría
            image: image            // Imagen de la subcategoría
        });

        res.status(201).send('Subcategoría agregada'); // Responder con un estado 201
    } catch (error) {
        console.error('Error agregando subcategoría: ', error);
        res.status(500).send('Error al agregar subcategoría');
    }
});

// Ruta para eliminar subcategoría

// Ruta para eliminar un campo de un documento
/*router.delete('/delete-subcategory/:categoryId/:subcategoryId', async (req, res) => {
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
});*/

router.delete('/delete-subcategory/:categoryId/:subcategoryId', async (req, res) => {
    const { categoryId, subcategoryId } = req.params;

    try {
        // Referencia al documento de la subcategoría dentro de la subcolección 'subcategories'
        const subcategoryRef = db.collection('category')
            .doc(categoryId)        // Documento de la categoría
            .collection('subcategories') // Subcolección de subcategorías
            .doc(subcategoryId);     // Documento de la subcategoría que deseas eliminar

        // Eliminar el documento de la subcategoría
        await subcategoryRef.delete();

        res.status(200).send({ message: 'Subcategoría eliminada con éxito' });
    } catch (error) {
        console.error('Error al eliminar la subcategoría:', error);
        res.status(500).send({ message: 'Error al eliminar la subcategoría' });
    }
});






module.exports = router; 