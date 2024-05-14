const axios = require("axios");

async function getGeoCoordinates(address) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: process.env.GOOGLE_MAPS_API_KEY // Assurez-vous que la clé API est stockée de manière sécurisée
            }
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            return { latitude: lat, longitude: lng };
        } else {
            throw new Error(`Failed to geocode address. Status: ${response.data.status}`);
        }
    } catch (error) {
        console.error("Geocoding failed:", error);
        throw new Error("Geocoding failed");
    }
}
