const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors()); // Cho phép frontend gửi yêu cầu đến backend

// Kết nối MongoDB (loại bỏ các tùy chọn deprecated)
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Kết nối MongoDB thành công'))
    .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Schema người dùng
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    wins: { type: Number, default: 0 },
    coins: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Middleware xác minh JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Không có token' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token không hợp lệ' });
        req.user = user;
        next();
    });
};

// Endpoint đăng ký
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Yêu cầu tên người dùng và mật khẩu' });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Tên người dùng đã tồn tại' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
});

// Endpoint đăng nhập
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' });
        }
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { username: user.username, wins: user.wins, coins: user.coins } });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
});

// Endpoint lấy dữ liệu người dùng (bảo mật)
app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
});

// Endpoint cập nhật dữ liệu trò chơi (bảo mật)
app.put('/api/user', authenticateToken, async (req, res) => {
    try {
        const { wins, coins } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { wins, coins },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error });
    }
});

// Endpoint kiểm tra server
app.get('/', (req, res) => {
    res.send('Backend Ô Ăn Quan đang chạy!');
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));