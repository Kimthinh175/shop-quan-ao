require('dotenv').config();
const http = require('http');
const connectDB = require('./src/core/config/db');
const app = require('./src/app');

// Connect to Database
connectDB();

const server = http.createServer(app);

// 3. Khởi tạo Socket.IO
const { initSocket } = require('./src/core/config/socket');
initSocket(server);

// 4. Khởi chạy Cronjobs (Background Tasks)
const { startCron } = require('./src/cron/orderExpiration');
startCron();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`
    ################################################
    🚀  Server listening on port: ${PORT} 🚀
    ################################################
    Health check: http://localhost:${PORT}/api/users/status
    ################################################
    `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
