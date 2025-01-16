const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/web');
const dashboardController = require('../controller/dashboardController');


router.get('/',verifyToken, dashboardController.dataDashboard);
router.get('/export-pdf',verifyToken, dashboardController.dataReports);

router.get('/generate-pdf', dashboardController.generatePDF);


module.exports = router;
