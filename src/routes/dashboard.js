const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/web');
const dashboardController = require('../controller/dashboardController');


router.get('/', dashboardController.dataDashboard);//para que cargue todos los datos

router.get('/export-pdf', dashboardController.dataReports);

router.get('/generate-pdf', dashboardController.generatePDF);


module.exports = router;
