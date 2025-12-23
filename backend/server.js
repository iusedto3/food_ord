// server.js
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
// 1. Import thêm 2 thư viện này
import { createServer } from "http";
import { Server } from "socket.io"; 

import foodRouter from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import 'dotenv/config.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import promotionRouter from './routes/promotionRoute.js';
import adminRoute from "./routes/adminRoute.js";
import addressRoute from "./routes/addressRoute.js";
import paymentRouter from './routes/paymentRoute.js';

// app config
const app = express();
const port = 4000;

// 2. Tạo HTTP Server bọc lấy app express
const server = createServer(app);

// 3. Khởi tạo Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Hoặc điền chính xác "http://localhost:5173" để bảo mật hơn
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// middlewares
app.use(express.json());
app.use(cors());

// 4. 🔥 QUAN TRỌNG: Middleware gắn io vào req
// Giúp bạn dùng được "req.io" ở bất kỳ controller nào
app.use((req, res, next) => {
  req.io = io;
  next();
});

// db connection
connectDB();

// --- LOGIC SOCKET CƠ BẢN ---
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // User join room riêng của mình (để nhận noti riêng)
  socket.on("join_room", (userId) => {
    if(userId) socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
});

// api endpoints
app.use("/api/payment", paymentRouter);
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/promotion", promotionRouter);
app.use("/api/admin", adminRoute);
app.use("/api/address", addressRoute);

app.get("/", (req, res) => {
    res.send("Hello from backend");
});

// 5. Đổi app.listen thành server.listen
server.listen(port, () => {
    console.log(`Server running on localhost:${port}`);
});