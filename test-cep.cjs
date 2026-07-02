const https = require('https');
https.get('https://brasilapi.com.br/api/cep/v1/48060500', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('BrasilAPI:', data));
});
https.get('https://viacep.com.br/ws/48060500/json/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('ViaCEP:', data));
});
