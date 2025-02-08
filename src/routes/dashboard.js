const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/web');
const dashboardController = require('../controller/dashboardController');


router.get('/', verifyToken, dashboardController.dataDashboard);//para que cargue todos los datos

router.get('/export-pdf', dashboardController.dataReports);


router.get('/generate-pdf', verifyToken, async (req, res) => {
    try {
        await dashboardController.generatePDF(req, res);
    } catch (error) {
        console.error('Error generando el PDF:', error);
        res.redirect('/dashboard?message=Hubo un error al generar el PDF');
    }
});




module.exports = router;
