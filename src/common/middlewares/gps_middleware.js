const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'google',
    apiKey: process.env.GOOGLE_MAPS_API_KEY, // Replace with your actual API key
    formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

async function getGeoCoordinates(address) {
    if (!address || !address.street || !address.town || !address.CP) {
        console.log('Incomplete address information for geocoding:', address, 'street:', address.street, 'town:', address.town, 'CP:', address.CP);
        throw new Error('Incomplete address information for geocoding');
    }

    const query = `${address.number ? address.number + ' ' : ''}${address.street}, ${address.town}, ${address.CP}`;

    try {
        const res = await geocoder.geocode(query);

        if (res.length === 0) {
            throw new Error('No results found for the provided address.');
        }

        const location = res[0];
        return {
            latitude: location.latitude,
            longitude: location.longitude
        };
    } catch (error) {
        console.error('Geocoding failed:', error);
        throw new Error('Geocoding failed');
    }
}

module.exports = {getGeoCoordinates};