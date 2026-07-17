'use strict';

const express = require('express');
const router = require('express').Router();
const webhookController = require('../controllers/webhookController');

router.post('/paypal',       express.json(), webhookController.handlePayPal);
router.post('/mercadopago',  express.json(), webhookController.handleMercadoPago);

module.exports = router;
