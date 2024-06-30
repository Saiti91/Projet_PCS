const { Router } = require("express");
const stripe = require('stripe')('sk_test_51PX7r7FYikej8zQ92PzU69B6ZFGBUmAmGdNe7wy2Xn12XKbyiZSG6f6WongLxfkKlK3Dzvh1I9olr6rmMFAzPmq700j0Yakkws');
const router = Router();

router.post('/charge', async (req, res) => {
    try {
        const { paymentMethodId } = req.body;

        if (!paymentMethodId) {
            return res.status(400).send({ error: 'PaymentMethodId est requis' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 2000,
            currency: 'eur',
            payment_method: paymentMethodId,
            confirm: true,
            return_url: 'http://localhost:5173/payment-success'
        });

        res.send({ success: true, paymentIntent });
    } catch (error) {
        console.error('Erreur lors de la création du PaymentIntent:', error.message);
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
