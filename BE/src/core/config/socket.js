const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middlewares/auth');

let io;
// Map lưu trữ userId -> Set các socketId (1 user có thể login nhiều thiết bị)
const userSockets = new Map();

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // Middleware xác thực JWT cho Socket
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            socket.user = decoded; // { id, role, type, ... }
            next();
        });
    });

    io.on('connection', (socket) => {
        const userId = socket.user.id;
        
        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);
        
        console.log(`[Socket] User ${userId} connected (Socket ID: ${socket.id})`);

        socket.on('disconnect', () => {
            const userSet = userSockets.get(userId);
            if (userSet) {
                userSet.delete(socket.id);
                if (userSet.size === 0) {
                    userSockets.delete(userId);
                }
            }
            console.log(`[Socket] User ${userId} disconnected (Socket ID: ${socket.id})`);
        });
    });
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io chưa được khởi tạo!');
    }
    return io;
};

// Hàm bắn event cho 1 user cụ thể
const emitToUser = (userId, eventName, data) => {
    if (!io) return;
    const userSet = userSockets.get(userId);
    if (userSet && userSet.size > 0) {
        userSet.forEach(socketId => {
            io.to(socketId).emit(eventName, data);
        });
    }
};

// Hàm bắn event cho tất cả
const emitToAll = (eventName, data) => {
    if (!io) return;
    io.emit(eventName, data);
};

// Hàm lấy ra danh sách các admin online (Nếu cần)
const emitToAdmins = (eventName, data) => {
    if (!io) return;
    // Tạm thời chưa có map role riêng, broadcast cho tất cả?
    // Hoặc query mảng online?
};

module.exports = {
    initSocket,
    getIo,
    emitToUser,
    emitToAll
};
