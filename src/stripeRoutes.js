// stripeRoutes.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')('SECRET_KEY'); // Remplace par ta clé secrète

router.post('/charge', async (req, res) => {
    try {
        const { token } = req.body;
        const charge = await stripe.charges.create({
            amount: 2000, // Montant en cents
            currency: 'usd',
            source: token,
            description: 'Paiement de test',
        });
        res.send({ success: true, charge });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
