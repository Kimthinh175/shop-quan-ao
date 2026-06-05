const http = require('http');

const callApi = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
};

async function test() {
  try {
    console.log('--- Đang gọi API Seed... ---');
    const seedResult = await callApi('/api/seed');
    console.log('Kết quả Seed:', JSON.stringify(seedResult, null, 2));

    console.log('\n--- Đang gọi API Products... ---');
    const productsResult = await callApi('/api/products');
    console.log('Số lượng sản phẩm lấy được:', productsResult.data ? productsResult.data.length : 0);
    if (productsResult.data && productsResult.data.length > 0) {
      console.log('Dữ liệu sản phẩm đầu tiên:', JSON.stringify(productsResult.data[0], null, 2));
    }
  } catch (error) {
    console.error('Lỗi khi test API:', error.message);
  }
}

test();
