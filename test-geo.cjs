const https = require('https');
https.get('https://nominatim.openstreetmap.org/search?format=json&q=Rua+S%C3%A3o+Jos%C3%A9,+Mangal%C3%B4,+Alagoinhas,+BA', {
  headers: { 'User-Agent': 'ChellBurgerApp/1.0' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Nominatim:', data));
});
