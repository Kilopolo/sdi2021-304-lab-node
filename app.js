// Módulos
let express = require('express');
let app = express();

let fileUpload = require('express-fileupload');
app.use(fileUpload());

let mongo = require('mongodb');
//, declaramos la ruta public como estática en app.js
app.use(express.static('public'));
//añadimos el require del módulo “body-parser”
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//La variable mongo debe inicializarse ANTES de llamar a
// gestorDB.init
let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);

// incluir el motor de plantillas en la aplicación
let swig = require('swig');

// Variables
app.set('port', 8081);
app.set('db', 'mongodb://admin:sdi@tiendamusica-shard-00-00.any5v.mongodb.net:27017,' +
    'tiendamusica-shard-00-01.any5v.mongodb.net:27017,' +
    'tiendamusica-shard-00-02.any5v.mongodb.net:27017' +
    '/myFirstDatabase?ssl=true' +
    '&replicaSet=atlas-exyqcf-shard-0' +
    '&authSource=admin' +
    '&retryWrites=true' +
    '&w=majority');


//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorBD); // (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app, swig, gestorBD); // (app, param1, param2, etc.)
require("./routes/rautores.js")(app, swig); // (app, param1, param2, etc.)
// Lanzar el servidor
app.listen(app.get('port'), function () {
    console.log('Servidor activo');
});