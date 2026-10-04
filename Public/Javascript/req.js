require('dotenv').config();
const express = require('express');
const session = require('express-session');
// FOR VERSION 6.0.0, you must add .default or use destructuring
const MongoStore = require('connect-mongo').default;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const flash = require('connect-flash');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

/* ==============================
    DATABASE CONNECTION
============================== */
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

/* ==============================
    MODELS
============================== */
// User Model (This was missing from your snippet but called in Login)
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    brandName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plan: { type: String, default: 'Free' },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);


// Event Model
const eventSchema = new mongoose.Schema({
    eventName: String,
    eventname: String, 
    description: String,
    location: String,
    category: { type: String, default: 'Other' }, // ADD THIS LINE
    date: String,
    image: String,
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tickets: [{
        tier: String,
        price: Number,
        capacity: Number
    }]
}, { timestamps: true });
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

// Booking Model
const bookingSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    ticketTier: String,
    quantity: Number,
    totalPaid: Number,
    paymentStatus: { type: String, default: 'pending' }, // 'pending', 'success', 'failed'
    paymentReference: { type: String, unique: true }, // Add this
    createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// Signup Model
const Signup = mongoose.models.Signup || mongoose.model('Signup', new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    joinedAt: { type: Date, default: Date.now }
}));

/* ==============================
    APP CONFIG & MIDDLEWARE
============================== */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', 1);

// ... later in your session config (line 98) ...
app.use(session({
    secret: process.env.SESSION_SECRET || 'safarisecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
    }),
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production'
    }
}));

app.use(flash());

// Global Variables
app.use(async (req, res, next) => {
    res.locals.currentPath = req.path;
    res.locals.user = req.session.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    
    try {
        if (mongoose.connection.readyState === 1) {
            res.locals.events = await Event.find().sort({ createdAt: -1 }).limit(10).lean();
        } else {
            res.locals.events = [];
        }
    } catch (err) {
        res.locals.events = [];
    }
    next();
});

/* ==============================
    FILE UPLOAD SETUP
============================== */
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

/* ==============================
    AUTH MIDDLEWARE
============================== */
function ensureAuth(req, res, next) {
    if (req.session.user) return next();
    req.flash('error_msg', 'Please log in to proceed');
    res.redirect('/Login');
}


app.set('trust proxy', 1); // Trust Render's proxy for secure cookies
/* ==============================
    PUBLIC ROUTES
============================== */
app.get('/', (req, res) => res.render('index', { page_name: 'index' }));
app.get('/about', (req, res) => res.render('about', { page_name: 'about' }));
app.get('/contact', (req, res) => res.render('contact', { page_name: 'contact' }));
app.get('/how', (req, res) => res.render('how', { page_name: 'how' }));
app.get('/Pricing', (req, res) => res.render('Pricing', { page_name: 'Pricing' }));
app.get('/Register', (req, res) => res.render('Register'));
app.get('/discover', async (req, res) => {
    try {
        const { search, category, timeframe } = req.query;
        let query = {};

        // 1. Text Search Logic
        if (search) {
            query.$or = [
                { eventName: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        // 2. Category Logic
        if (category && category !== 'All') {
            query.category = category;
        }

        // 3. Date/Timeframe Logic
        const now = new Date();
        if (timeframe === 'Today') {
            const todayStr = now.toISOString().split('T')[0]; 
            query.date = { $regex: todayStr };
        } else if (timeframe === 'This Month') {
            const monthStr = now.toISOString().slice(0, 7); 
            query.date = { $regex: monthStr };
        }

        // Fetch Main Events
        const events = await Event.find(query).sort({ date: 1 }).lean();
        
        // Fetch Featured Events (Top 3 latest)
        const featuredEvents = await Event.find().limit(4).sort({ createdAt: -1 }).lean();
        
        // CRITICAL: Ensure 'category' and others are passed even if they are null
        res.render('discover', { 
            page_name: 'discover', 
            events: events || [],
            featuredEvents: featuredEvents || [],
            searchTerm: search || '',
            activeCategory: category || 'All',
            category: category || 'All', // Added this to prevent the "category is not defined" error
            activeTimeframe: timeframe || 'All'
        });
    } catch (err) {
        console.error("Discover Error:", err);
        res.status(500).send("Filter Error: " + err.message);
    }
});



app.get('/blog', (req, res) => res.render('blog', { page_name: 'blog' }));
app.get('/terms', (req, res) => res.render('terms', { page_name: 'terms' }));
app.get('/privacy', (req, res) => res.render('privacy', { page_name: 'privacy' }));

app.get('/event-detail/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).lean();
        if (!event) return res.redirect('/');
        res.render('event-detail', { event, page_name: 'event-detail' });
    } catch (err) {
        res.redirect('/');
    }
});

/* ==============================
    AUTH ROUTES
============================== */
app.get('/Login', (req, res) => res.render('Login'));

app.post('/Login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                req.session.user = {
                    id: user._id,
                    firstname: user.firstName,
                    brand: user.brandName,
                    email: user.email
                };
                return req.session.save(() => res.redirect('/organizersdash'));
            }
        }
        req.flash('error_msg', 'Invalid email or password');
        res.redirect('/Login');
    } catch (err) {
        res.redirect('/Login');
    }
});

app.post('/Register', async (req, res) => {
    try {
        const { firstName, lastName, brandName, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).send("Email already in use");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ firstName, lastName, brandName, email, password: hashedPassword });
        await newUser.save();
        res.redirect('/Login');
    } catch (err) {
        res.status(500).send("Registration Error");
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

/* ==============================
    DASHBOARD & EVENT ROUTES
============================== */
app.get('/organizersdash', ensureAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const events = await Event.find({ organizer: userId });
        const bookings = await Booking.find({ organizer: userId, paymentStatus: 'success' });

        const totalGross = bookings.reduce((sum, b) => sum + (b.totalPaid || 0), 0);
        const totalAttendees = bookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
        
        const now = new Date();
        const upcoming = events.filter(e => new Date(e.date) >= now).length;

        res.render('organizersdash', { 
            events, 
            user: req.session.user,
            stats: {
                grossEarnings: totalGross.toLocaleString(),
                netEarnings: (totalGross * 0.95).toLocaleString(),
                totalAttendees,
                upcomingEvents: upcoming,
                totalEvents: events.length
            }
        });
    } catch (err) {
        res.redirect('/');
    }
});

app.post('/add-event', ensureAuth, upload.single('image'), async (req, res) => {
    try {
        const { eventname, description, location, date, ticketTiers, ticketPrices, ticketCapacities } = req.body;
        
        let ticketsArray = [];
        if (ticketTiers) {
            if (Array.isArray(ticketTiers)) {
                ticketsArray = ticketTiers.map((tier, i) => ({
                    tier,
                    price: Number(ticketPrices[i]) || 0,
                    capacity: Number(ticketCapacities[i]) || 0
                }));
            } else {
                ticketsArray.push({
                    tier: ticketTiers,
                    price: Number(ticketPrices) || 0,
                    capacity: Number(ticketCapacities) || 0
                });
            }
        }

        const newEvent = new Event({
            eventName: eventname,
            eventname: eventname,
            description,
            location,
            date,
            tickets: ticketsArray,
            image: req.file ? `/uploads/${req.file.filename}` : '/img/default-event.jpg',
            organizer: req.session.user.id
        });

        await newEvent.save();
        res.redirect('/organizersdash');
    } catch (err) {
        res.status(500).send("Database Error: " + err.message);
    }
});

/* ==============================
    CHECKOUT & PAYMENTS
============================== */
app.get('/event-detail/:id/checkout', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.redirect('/');
        
        const unitPrice = Number(req.query.tier) || 0;
        const quantity = Number(req.query.quantity) || 1;
        const tierName = req.query.tierName || 'Ticket';
        
        res.render('checkout', { 
            event, 
            totalAmount: unitPrice * quantity, 
            quantity, 
            tierName,
            page_name: 'checkout'
        });
    } catch (err) {
        res.redirect('/');
    }
});

app.post('/checkout', async (req, res) => {
    try {
        const { eventId, customerName, customerEmail, tierName, quantity, totalAmount } = req.body;
        const event = await Event.findById(eventId);
        
        const newBooking = new Booking({
            event: eventId,
            organizer: event.organizer,
            customerName,
            customerEmail,
            ticketTier: tierName,
            quantity: Number(quantity),
            totalPaid: Number(totalAmount)
        });

        await newBooking.save();
        res.redirect('/organizersdash'); 
    } catch (err) {
        res.status(500).send("Checkout Error: " + err.message);
    }
});

app.get('/api/payout/verify-account', async (req, res) => { 
    const { accountNumber, bankCode } = req.query;
    try {
        const response = await axios.get(
            `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
            { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
        );
        res.json({ success: true, accountName: response.data.data.account_name });
    } catch (error) {
        res.status(400).json({ success: false, message: "Verification failed" });
    }
});


app.post('/paystack/webhook', async (req, res) => {
    // 1. Verify the event came from Paystack using your Secret Key
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
                       .update(JSON.stringify(req.body))
                       .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
        return res.sendStatus(400); // Not from Paystack
    }

    const event = req.body;

    // 2. Check if the payment was successful
    if (event.event === 'charge.success') {
        const { reference, metadata } = event.data;

        // 3. Find the booking and update status
        await Booking.findOneAndUpdate(
            { paymentReference: reference },
            { paymentStatus: 'success' }
        );
        
        console.log(`✅ Payment successful for Ref: ${reference}`);
    }

    res.sendStatus(200); // Tell Paystack you received the message
});


/* ==============================
    EDIT EVENT ROUTES
============================== */

// 1. Show the Edit Page
app.get('/edit-event/:id', ensureAuth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        // Safety Check: Ensure only the organizer who created it can edit it
        if (!event || event.organizer.toString() !== req.session.user.id) {
            req.flash('error_msg', 'Unauthorized access');
            return res.redirect('/organizersdash');
        }

        res.render('edit-event', { event, page_name: 'edit-event' });
    } catch (err) {
        console.error(err);
        res.redirect('/organizersdash');
    }
});

// 2. Handle the Edit Form Submission
app.post('/edit-event/:id', ensureAuth, upload.single('image'), async (req, res) => {
    try {
        const { eventname, description, location, date } = req.body;
        
        const updateData = {
            eventName: eventname,
            eventname: eventname,
            description,
            location,
            date
        };

        // If a new image was uploaded, update the path
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        const updatedEvent = await Event.findOneAndUpdate(
            { _id: req.params.id, organizer: req.session.user.id },
            updateData,
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(404).send("Event not found or unauthorized");
        }

        req.flash('success_msg', 'Event updated successfully!');
        res.redirect('/organizersdash');
    } catch (err) {
        console.error("Edit Error:", err);
        res.status(500).send("Error updating event: " + err.message);
    }
});


/* ==============================
    PROFILE UPDATE ROUTE
============================== */
app.post('/update-profile', ensureAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { firstName, lastName, brandName } = req.body;

        // Update the user in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { firstName, lastName, brandName },
            { new: true } // Return the updated document
        );

        // Update the session so the dashboard reflects the new name/brand immediately
        req.session.user.firstname = updatedUser.firstName;
        req.session.user.brand = updatedUser.brandName;

        req.flash('success_msg', 'Profile updated successfully!');
        res.redirect('/organizersdash');
    } catch (err) {
        console.error("Profile Update Error:", err);
        req.flash('error_msg', 'Failed to update profile.');
        res.redirect('/organizersdash');
    }
});

/* ==============================
    START SERVER
============================== */
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Rixxa is running at http://localhost:${PORT}`);
});