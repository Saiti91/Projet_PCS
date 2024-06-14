const axios = require("axios");

async function getGeoCoordinates(address) {
    try {
        // Construire l'adresse en chaîne de caractères
        const addressString = `${address.number} ${address.street}, ${address.CP} ${address.town}`;
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: addressString,
                key: process.env.GOOGLE_MAPS_API_KEY // Assurez-vous que la clé API est stockée en toute sécurité
            }
        });

        switch (response.data.status) {
            case 'OK':
                if (response.data.results.length > 0) {
                    const { lat, lng } = response.data.results[0].geometry.location;
                    return { latitude: lat, longitude: lng };
                }
                break;
            case 'ZERO_RESULTS':
                throw new Error('No results found for the provided address.');
            default:
                throw new Error(`Failed to geocode address. Status: ${response.data.status}`);
        }
    } catch (error) {
        console.error("Geocoding failed:", error);
        throw new Error("Geocoding failed");
    }
}

module.exports = { getGeoCoordinates };
