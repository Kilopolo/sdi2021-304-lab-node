module.exports = function (app, swig, gestorBD) {

    /*
    Nota: el método GET /canciones/agregar tiene que ir antes de /canciones/:id. El
    orden en el que escribimos los métodos GET y POST es importante puesto que indican
    PRIORIDAD
     */
    //posibilidad de responder a la petición GET /canciones/agregar
    app.get('/canciones/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/bagregar.html', {});
        res.send(respuesta);
    });

    app.get("/canciones", function (req, res) {
        // crearemos un array con 3 canciones
        let canciones = [{
            "nombre": "Blank space",
            "precio": "1.2"
        }, {
            "nombre": "See you again",
            "precio": "1.3"
        }, {
            "nombre": "Uptown Funk",
            "precio": "1.1"
        }];
        //retorno de la función será el HTML final procesado por la plantilla
        let respuesta = swig.renderFile('views/btienda.html', {
            vendedor: 'Tienda de canciones',
            canciones: canciones
        });
        // let respuesta = "";
        // if (req.query.nombre != null)
        //     respuesta+= 'Nombre: ' + req.query.nombre + '<br>' ;
        // if(typeof (req.query.autor) != "undefined")
        //     respuesta+= 'Autor: '+ req.query.autor;
        res.send(respuesta);
    });

    app.get('/suma', function (req, res) {
        let respuesta = parseInt(req.query.num1) + parseInt(req.query.num2);
        res.send(String(respuesta));
    });

    app.get('/canciones/:id', function (req, res) {
        let respuesta = 'id: ' + req.params.id;
        res.send(respuesta);
    });

    app.get('/canciones/:genero/:id', function (req, res) {
        let respuesta = 'id: ' + req.params.id + '<br>'
            + 'Género: ' + req.params.genero;
        res.send(respuesta);
    });

    //procese los atributos nombre, género y
    // precio enviados a través del formulario.
    app.post("/cancion", function (req, res) {
        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio
        }
// Conectarse
        gestorBD.insertarCancion(cancion, function (id) {
            if (id == null) {
                res.send("Error al insertar canción");
            } else {
                res.send("Agregada la canción ID: " + id);
            }
        });

        // Conectarse
        // mongo.MongoClient.connect(app.get('db'), function (err, db) {
        //     if (err) {
        //         res.send("Error de conexión: " + err);
        //     } else {
        //         let collection = db.collection('canciones');
        //         collection.insertOne(cancion, function (err, result) {
        //             if (err) {
        //                 res.send("Error al insertar " + err);
        //             } else {
        //                 res.send("Agregada id: " + result.ops[0]._id);
        //             }
        //             db.close();
        //         });
        //     }
        // });

        // res.send("Canción agregada:" + req.body.nombre + "<br>"
        //     + " genero" + req.body.genero + "<br>"
        //     + " precio: " + req.body.precio);
    });

    app.get('/promo*', function (req, res) {
        res.send('Respuesta patrón promo* ');
    })

};