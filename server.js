const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

const PORT = process.env.PORT || 3000;

// Diagnostic checks
console.log('PROJECT ROOT:', __dirname);
console.log('VIEWS PATH:', path.join(__dirname, 'views'));
console.log(
    'INDEX.EJS EXISTS:',
    fs.existsSync(path.join(__dirname, 'views', 'index.ejs'))
);
console.log(
    'VIEWS CONTENTS:',
    fs.existsSync(path.join(__dirname, 'views'))
        ? fs.readdirSync(path.join(__dirname, 'views'))
        : 'VIEWS FOLDER NOT FOUND'
);

// EJS configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('index', { page_name: 'index' });
});

app.get('/about', (req, res) => {
    res.render('about', { page_name: 'about' });
});

app.get('/artist', (req, res) => {
    res.render('artist', { page_name: 'artist' });
});

app.get('/service', (req, res) => {
    res.render('service', { page_name: 'service' });
});

app.get('/contact', (req, res) => {
    res.render('contact', { page_name: 'contact' });
});

app.listen(PORT, () => {
    console.log(`Chopvibe Server running on port ${PORT}`);
});
