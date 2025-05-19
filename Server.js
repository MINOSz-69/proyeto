const express = require('express');
const app = express();
const controlador = require('./controlador'); // Importar métodos del controlador

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para usuario SIN cookies ni ningún otro paquete externo
// El usuario se enviará por POST o GET en cada petición (por ejemplo, como campo oculto en formularios o query string)
app.use((req, res, next) => {
    res.locals.usuario = null;
    if (req.body && req.body.usuario) {
        try {
            res.locals.usuario = JSON.parse(req.body.usuario);
        } catch {
            res.locals.usuario = null;
        }
    } else if (req.query && req.query.usuario) {
        try {
            res.locals.usuario = JSON.parse(req.query.usuario);
        } catch {
            res.locals.usuario = null;
        }
    }
    next();
});

// Ruta principal para mostrar el formulario de registro
app.get('/', (req, res) => {
    res.render('index');
});

// Ruta para guardar un usuario
app.post('/guardar', (req, res) => {
    const { nombre, correo, contra } = req.body;
    controlador.guardarUsuario(nombre, correo, contra, (err) => {
        if (err) {
            return res.status(500).send('Error al guardar el usuario: ' + err.message);
        }
        res.redirect('/login');
    });
});

// Ruta para manejar el inicio de sesión
app.post('/login', (req, res) => {
    const { correo, contra } = req.body;
    // Acceso especial para admin
    if (correo === 'admin@gmail.com' && contra === 'admin1234') {
        // Redirige pasando el usuario por query string
        const usuario = encodeURIComponent(JSON.stringify({ nombre: 'Administrador', correo: correo }));
        return res.redirect('/usuarios?usuario=' + usuario);
    }
    controlador.iniciarSesion(correo, contra, (err, usuario) => {
        if (err) {
            if (err.message === 'Correo o contraseña incorrectos') {
                return res.status(401).send(err.message);
            }
            return res.status(500).send('Error al iniciar sesión');
        }
        // Redirige pasando el usuario por query string
        const usuarioStr = encodeURIComponent(JSON.stringify(usuario));
        res.redirect('/principal?usuario=' + usuarioStr);
    });
});

// Ruta para mostrar el formulario de inicio de sesión
app.get('/login', (req, res) => {
    res.render('login');
});

// Ruta para cerrar sesión (solo redirige)
app.get('/logout', (req, res) => {
    res.redirect('/login');
});

// Rutas protegidas: requieren usuario en query o body
app.get('/principal', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/login');
    res.render('principal', { usuario: res.locals.usuario });
});

app.get('/usuarios', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/login');
    controlador.obtenerUsuarios((err, usuarios) => {
        if (err) {
            return res.status(500).send('Error al obtener usuarios');
        }
        res.render('usuarios', { usuarios, usuario: res.locals.usuario });
    });
});

// Mostrar página de ayuda
app.get('/ayuda', (req, res) => {
    res.render('ayuda', { usuario: res.locals.usuario });
});

// Mostrar tests
app.get('/test-depresion', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/login');
    res.render('test-depresion', { usuario: res.locals.usuario });
});
app.get('/test-ansiedad', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/login');
    res.render('test-ansiedad', { usuario: res.locals.usuario });
});
app.get('/test-estres', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/login');
    res.render('test-estres', { usuario: res.locals.usuario });
});

// Guardar respuestas de test (ejemplo para depresión)
app.post('/test-depresion', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/login');
    const respuestas = req.body.respuestas || req.body;
    const resultado = 'Leve'; // Ejemplo, reemplaza con tu lógica
    const porcentaje = 50;    // Ejemplo, reemplaza con tu lógica

    controlador.guardarRespuestasTest(
        res.locals.usuario.id,
        'depresion',
        respuestas,
        resultado,
        porcentaje,
        (err) => {
            if (err) return res.status(500).send('Error al guardar el test');
            // Redirige pasando el usuario por query string
            const usuarioStr = encodeURIComponent(JSON.stringify(res.locals.usuario));
            res.redirect('/resultados?usuario=' + usuarioStr);
        }
    );
});

// Mostrar historial de resultados del usuario
app.get('/resultados', (req, res) => {
    if (!res.locals.usuario) return res.redirect('/login');
    controlador.obtenerResultadosPorUsuario(res.locals.usuario.id, (err, resultados) => {
        if (err) return res.status(500).send('Error al obtener resultados');
        res.render('resultados', { resultados, usuario: res.locals.usuario });
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});