const router = require('express').Router();
const Joi    = require('joi');
const walletController = require('../controllers/walletController');
const auth     = require('../middleware/auth');
const validate = require('../middleware/validate');

const depositSchema = Joi.object({
  amount: Joi.number().positive().precision(4).max(10000).required(),
  method: Joi.string().valid('crypto', 'paypal', 'manual', 'mercadopago').default('manual'),
});

router.use(auth);

router.get('/balance',             walletController.getBalance);
router.get('/',                    walletController.getWallet);
router.get('/transactions',        walletController.getTransactions);
router.get('/deposits',            walletController.getDeposits);
router.post('/deposit',            validate(depositSchema), walletController.requestDeposit);
router.post('/add-funds',          validate(depositSchema), walletController.requestDeposit);

router.post('/deposit/paypal/create-order',    walletController.createPayPalOrder);
router.post('/deposit/paypal/capture/:paypalOrderId', walletController.capturePayPalOrder);
router.post('/deposit/mercadopago/create',      walletController.createMercadoPagoPreference);
router.get('/invoice/:id',                     walletController.getInvoice);

module.exports = router;