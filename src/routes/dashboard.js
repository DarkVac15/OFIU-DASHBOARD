const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const dashboardController = require('../controller/dashboardController');

//const { db, auth,serverTimestamp } = require("../config/firebase");


router.get('/', dashboardController.dataDashboard);
router.get('/export-pdf', dashboardController.dataReports);

router.get('/generate-pdf', dashboardController.generatePDF);


module.exports = router;
