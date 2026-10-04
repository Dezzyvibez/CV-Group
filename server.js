const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

const PORT = process.env.PORT || 3000;
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


// Tell Express exactly where the EJS templates are
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', async (req, res) => {
  try {
    res.render('index', { 
      page_name: 'index',
      headerClass: '',
      
      user: req.session?.user || null 
    });
  } catch (err) {
    console.error('🔥 Error rendering homepage template:', err.message);
    // Fallback redirect to discover if the homepage view file errors out
    res.redirect('/about');
  }
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

// Start server
app.listen(PORT, () => {
    console.log(`Chopvibe Server running on port ${PORT}`);
});
