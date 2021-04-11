module.exports = function (app, swig, gestorBD) {

    app.get('/cancion/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarCancion(criterio,function(canciones){
            if ( canciones == null ){
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    });

    app.get('/cancion/modificar/:id', function (req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.send(respuesta);
            } else {
                let respuesta = swig.renderFile('views/bcancionModificar.html',
                    {
                        cancion : canciones[0]
                    });
                res.send(respuesta);
            }
        });
    });
    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = { "_id" : gestorBD.mongo.ObjectID(id) };
        let cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio
        }
        gestorBD.modificarCancion(criterio, cancion, function(result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                // res.send("Modificado "+result);
                paso1ModificarPortada(req.files, id, function (result) {
                    if( result == null){
                        res.send("Error en la modificación");
                    } else {
                        res.send("Modificado");
                    }
                });
            }
        });
    });
    function paso1ModificarPortada(files, id, callback){
        if (files && files.portada != null) {
            let imagen =files.portada;
            imagen.mv('public/portadas/' + id + '.png', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback); // SIGUIENTE
        }
    };
    function paso2ModificarAudio(files, id, callback){
        if (files && files.audio != null) {
            let audio = files.audio;
            audio.mv('public/audios/'+id+'.mp3', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    };
    /*
    Nota: el método GET /canciones/agregar tiene que ir antes de /canciones/:id. El
    orden en el que escribimos los métodos GET y POST es importante puesto que indican
    PRIORIDAD
     */
    //posibilidad de responder a la petición GET /canciones/agregar
    app.get('/canciones/agregar', function (req, res) {
        if (req.session.usuario == null) {
            res.redirect("/tienda");
            return;
        }
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

    app.get('/cancion/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send("Error al recuperar la canción.");
            } else {
                let criterio2 = {"cancion_id": gestorBD.mongo.ObjectID(req.params.id)};
                gestorBD.obtenerListadoComentariosCancion(criterio2, function (comentarios) {
                    if (comentarios == null) {
                        res.send("Error al recuperar el listado de comentarios.");
                    } else {
                        let respuesta = swig.renderFile('views/bcancion.html',
                            {
                                cancion: canciones[0],
                                comentarios: comentarios
                            });
                        res.send(respuesta);
                    }
                });
            }
        });
    });
    //procese los atributos nombre, género y
    // precio enviados a través del formulario.
    app.post("/cancion", function (req, res) {
        if (req.session.usuario == null) {
            res.redirect("/tienda");
            return;
        }
        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
            autor: req.session.usuario
        }

        // Conectarse
        gestorBD.insertarCancion(cancion, function (id) {
            if (id == null) {
                res.send("Error al insertar canción");
            } else {
                //borrar la línea res.send() porque no se puede seguir procesando la
                // petición una vez se ha enviado la respuesta.
                // res.send("Agregada la canción ID: " + id);
                //La respuesta se enviará una vez
                // que se complete la subida de los ficheros
                if (req.files.portada != null) {
                    var imagen = req.files.portada;
                    imagen.mv('public/portadas/' + id + '.png', function(err) {
                        if (err) {
                            res.send("Error al subir la portada");
                        } else {
                            // res.send("Agregada id: " + id);
                            if (req.files.audio != null) {
                                let audio = req.files.audio;
                                audio.mv('public/audios/' + id + '.mp3', function (err) {
                                    if (err) {
                                        res.send("Error al subir el audio");
                                    } else {
                                        res.send("Agregada id: " + id);
                                    }
                                });
                            }
                        }
                    });
                }

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
    app.get("/tienda", function (req, res) {
        let criterio = {};
        if (req.query.busqueda != null) {
            criterio = {"nombre": {$regex: ".*" + req.query.busqueda + ".*"}};
        }
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones: canciones
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/promo*', function (req, res) {
        res.send('Respuesta patrón promo* ');
    });

};