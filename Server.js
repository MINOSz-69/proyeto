const express = require('express');
const app = express();
const controlador = require('./controlador'); // Importar métodos del controlador

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // Ruta a la carpeta de vistas

// Ruta principal
app.get('/', (req, res) => {
    res.render('index', { message: 'Hello World!' }); // Renderizar una vista EJS
});

// Exportar métodos del controlador como ejemplo
app.get('/data', (req, res) => {
    controlador.getData((err, data) => {
        if (err) {
            return res.status(500).send('Error al obtener datos');
        }
        res.render('data', { data }); // Renderizar datos en una vista EJS
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});