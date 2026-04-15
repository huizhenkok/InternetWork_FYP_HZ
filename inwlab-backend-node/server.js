const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json()); // 替代 Spring 的 @RequestBody

// 🌟 1. 数据库连接 (完美复刻 application.properties)
// 请填入你在 cPanel 上的数据库名、用户名和密码
const sequelize = new Sequelize('interne3_inwlab', 'interne3_dbuser', 'Q(3jfF[!effp', {
    host: 'internetworks.my',
    dialect: 'mysql',
    timezone: '+08:00', // 马来西亚时间
    logging: false
});

// 🌟 2. 定义数据模型 (完美替代 Java Entity 和 Hibernate ddl-auto=update)
const User = sequelize.define('User', {
    email: { type: DataTypes.STRING, primaryKey: true },
    password: { type: DataTypes.STRING, allowNull: false },
    fullName: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    matricNumber: { type: DataTypes.STRING },
    secAnsColor: { type: DataTypes.STRING },
    secAnsState: { type: DataTypes.STRING },
    secAnsFruit: { type: DataTypes.STRING }
});

const CmsData = sequelize.define('CmsData', {
    pageKey: { type: DataTypes.STRING, primaryKey: true },
    contentJson: { type: DataTypes.TEXT('long') } // 支持大段 JSON
});

const ContactMessage = sequelize.define('ContactMessage', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    subject: DataTypes.STRING,
    message: DataTypes.TEXT,
    status: { type: DataTypes.STRING, defaultValue: 'Unread' }
});

const EventRsvp = sequelize.define('EventRsvp', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    affiliation: DataTypes.STRING,
    status: { type: DataTypes.STRING, defaultValue: 'Pending' }
});

const LabBooking = sequelize.define('LabBooking', {
    userName: DataTypes.STRING,
    userEmail: DataTypes.STRING,
    date: DataTypes.STRING,
    timeSlot: DataTypes.STRING,
    purpose: DataTypes.TEXT,
    status: { type: DataTypes.STRING, defaultValue: 'Pending' }
});

// 🌟 3. 初始化 Admin 账号 (完美复刻 @PostConstruct)
async function initAdmin() {
    const adminEmail = "IOT_admin123@gmail.com";
    const user = await User.findByPk(adminEmail);
    if (!user) {
        const hashedPassword = await bcrypt.hash("Enjoyurday_123", 10);
        await User.create({
            email: adminEmail,
            password: hashedPassword,
            fullName: "System Admin",
            role: "Admin",
            matricNumber: "ADMIN-001",
            secAnsColor: "black",
            secAnsState: "kedah",
            secAnsFruit: "apple"
        });
        console.log("✅ Security Alert: Default Admin account initialized.");
    }
}

// 🌟 4. 本地文件上传配置 (Multer 替代 Spring 上传，直接存硬盘！)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir); // 如果没有 uploads 文件夹就自动建一个

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // 生成唯一文件名
    }
});
const upload = multer({ storage: storage });

// 开放 uploads 文件夹，让外界可以通过网址直接访问图片！
app.use('/uploads', express.static(uploadDir));

app.post('/api/upload/image', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(500).json({ error: "File upload failed" });
    // 动态生成文件网址 (无论你在本地跑还是服务器跑，它都能自动识别正确的前缀)
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});


// ==========================================
// 🌟 5. API 路由 (完美复刻你的 Controllers)
// ==========================================

// --- CMS Controller ---
app.get('/api/cms/:pageKey', async (req, res) => {
    const data = await CmsData.findByPk(req.params.pageKey);
    data ? res.json(data) : res.status(404).send();
});
app.post('/api/cms/:pageKey', async (req, res) => {
    const [data] = await CmsData.upsert({ pageKey: req.params.pageKey, contentJson: JSON.stringify(req.body) });
    res.json(data);
});

// --- User Controller ---
app.post('/api/users/register', async (req, res) => {
    const { email, password, secAnsColor, secAnsState, secAnsFruit, ...rest } = req.body;
    if (await User.findByPk(email)) return res.status(400).send("Error: Email is already in use!");
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        email, password: hashedPassword,
        secAnsColor: secAnsColor?.toLowerCase().trim(),
        secAnsState: secAnsState?.toLowerCase().trim(),
        secAnsFruit: secAnsFruit?.toLowerCase().trim(),
        ...rest
    });
    res.json(user);
});

app.post('/api/users/login', async (req, res) => {
    const user = await User.findByPk(req.body.email);
    if (user && await bcrypt.compare(req.body.password, user.password)) return res.json(user);
    res.status(401).send("Error: Invalid email or password");
});

app.get('/api/users/all', async (req, res) => res.json(await User.findAll()));

// --- Contact Message Controller ---
app.post('/api/contact/submit', async (req, res) => res.json(await ContactMessage.create(req.body)));
app.get('/api/contact/all', async (req, res) => res.json(await ContactMessage.findAll({ order: [['createdAt', 'DESC']] })));
app.put('/api/contact/:id/read', async (req, res) => {
    await ContactMessage.update({ status: 'Read' }, { where: { id: req.params.id } });
    res.json({ success: true });
});
app.delete('/api/contact/:id', async (req, res) => {
    await ContactMessage.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
});

// --- RSVP Controller ---
app.post('/api/rsvps/submit', async (req, res) => res.json(await EventRsvp.create(req.body)));
app.get('/api/rsvps/all', async (req, res) => res.json(await EventRsvp.findAll({ order: [['createdAt', 'DESC']] })));
app.put('/api/rsvps/:id/:action', async (req, res) => {
    const status = req.params.action === 'approve' ? 'Approved' : 'Rejected';
    await EventRsvp.update({ status }, { where: { id: req.params.id } });
    res.json({ success: true });
});

// --- Lab Booking Controller ---
app.post('/api/bookings/submit', async (req, res) => res.json(await LabBooking.create(req.body)));
app.get('/api/bookings/all', async (req, res) => res.json(await LabBooking.findAll({ order: [['createdAt', 'DESC']] })));
app.put('/api/bookings/:id/:action', async (req, res) => {
    const status = req.params.action === 'approve' ? 'Approved' : 'Rejected';
    await LabBooking.update({ status }, { where: { id: req.params.id } });
    res.json({ success: true });
});


// 🌟 6. 启动服务器与数据库同步
const PORT = process.env.PORT || 8080;
sequelize.sync({ alter: true }).then(() => {
    console.log("✅ Database synced successfully.");
    initAdmin(); // 确保管理员存在
    app.listen(PORT, () => console.log(`🚀 Node.js server running on port ${PORT}`));
}).catch(err => console.error("❌ Database connection error:", err));