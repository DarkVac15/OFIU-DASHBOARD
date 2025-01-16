const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/web');
const dashboardController = require('../controller/dashboardController');


router.get('/',verifyToken, dashboardController.dataDashboard);
router.get('/export-pdf', dashboardController.dataReports);

router.get('/generate-pdf',verifyToken, dashboardController.generatePDF);


module.exports = router;
