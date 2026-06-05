const http = require('http');

const data = JSON.stringify({
    name: "Áo thun test",
    description: "Test desc",
    variants: [
        { sku: "TSHIRT-001", size: "M", color: "Red", price: 100000, quantity: 50 }
    ]
});

const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/products',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
}, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        console.log('Response:', rawData);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
