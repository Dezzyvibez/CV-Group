const express = require('express');
const path = require('path'); // Fixed: required the path module
const app = express();

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.render('index', { page_name: 'index' }));
app.get('/about', (req, res) => res.render('about', { page_name: 'about' }));
app.get('/artist', (req, res) => res.render('artist', { page_name: 'artist' }));
app.get('/service', (req, res) => res.render('service', { page_name: 'service' }));
app.get('/contact', (req, res) => res.render('contact', { page_name: 'contact' }));


// ... error handlers ...

app.listen(app.get('port'), () => {
    console.log(`Chopvibe Server running on port ${app.get('port')}`);
});