// Módulos
let express = require('express');
let app = express();
//, declaramos la ruta public como estática en app.js
app.use(express.static('public'));
//añadimos el require del módulo “body-parser”
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// incluir el motor de plantillas en la aplicación
let swig = require('swig');

// Variables
app.set('port', 8081);

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app,swig); // (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app,swig); // (app, param1, param2, etc.)
require("./routes/rautores.js")(app,swig); // (app, param1, param2, etc.)
// Lanzar el servidor
app.listen(app.get('port'), function(){
    console.log('Servidor activo');
});