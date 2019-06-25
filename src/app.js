const express = require('express');
const path = require('path');
const hbs = require('hbs');

const app = express();
const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '..', 'public');
const viewPath = path.join(__dirname, '..', 'templates', 'views');
const partialsPath = path.join(__dirname, '..', 'templates', 'partials');

hbs.registerPartials(partialsPath);

app.set('view engine', 'hbs');
app.set('views', viewPath);

app.use(express.static(publicDirectoryPath));

app.get('', (req, res) => {
    res.render('index');
});

app.get('/about', (req, res) => {
    res.render('about');
})

app.get('/resume', (req, res) => {
    res.render('resume');
})

app.get('*', (req, res) => {
    res.render('errorpage');
})

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});