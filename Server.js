const express = require('express');
const app = express();
const controlador = require('./controlador'); // Importar métodos del controlador

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal para mostrar el formulario
app.get('/', (req, res) => {
    res.render('index', { message: 'Hello World!' }); // Renderizar una vista EJS
});

// Ruta para guardar un usuario
app.post('/guardar', (req, res) => {
    const { nombre, correo, contra } = req.body; // Obtener datos del cuerpo de la solicitud

    controlador.guardarUsuario(nombre, correo, contra, (err, results) => {
        if (err) {
            if (err.message === 'El nombre o el correo ya están registrados') {
                return res.status(400).send(err.message); // Enviar mensaje de error si hay duplicados
            }
            return res.status(500).send('Error al guardar el usuario'); // Error general
        }
        res.send('Usuario guardado con éxito'); // Confirmación de éxito
    });
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