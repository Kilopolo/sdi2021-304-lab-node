function error(res,swig, msg) {
    // res.send(msg);
    // res.redirect("views/error.html")
    let respuesta = swig.renderFile('views/error.html',
        {
            mensaje: msg
        });
    res.send(respuesta);
}

module.exports = function (app, swig, gestorBD) {


    app.get('/compras', function (req, res) {
        let criterio = {"usuario": req.session.usuario};
        gestorBD.obtenerCompras(criterio, function (compras) {
            if (compras == null) {
                error(res,swig, "Error al listar ");

            } else {
                let cancionesCompradasIds = [];
                for (i = 0; i < compras.length; i++) {
                    cancionesCompradasIds.push(compras[i].cancionId);
                }
                let criterio = {"_id": {$in: cancionesCompradasIds}}
                gestorBD.obtenerCanciones(criterio, function (canciones) {
                    let respuesta = swig.renderFile('views/bcompras.html',
                        {
                            canciones: canciones
                        });
                    res.send(respuesta);
                });
            }
        });
    });

    app.get('/cancion/comprar/:id', function (req, res) {
        let cancionId = gestorBD.mongo.ObjectID(req.params.id);
        let compra = {
            usuario: req.session.usuario,
            cancionId: cancionId
        }
        let criterioUsuario = {"usuario": req.session.usuario, "cancion_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerCompras(criterioUsuario, function (compras) {
            let comprada = compras[0] != null;
            if (!comprada)
                gestorBD.insertarCompra(compra, function (idCompra) {
                    if (idCompra == null) {
                        res.send(respuesta);
                    } else {
                        res.redirect("/compras");
                    }
                });
        });
    });

    app.get('/cancion/eliminar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.eliminarCancion(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    });

    app.get('/cancion/modificar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                let respuesta = swig.renderFile('views/bcancionModificar.html',
                    {
                        cancion: canciones[0]
                    });
                res.send(respuesta);
            }
        });
    });
    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = {"_id": gestorBD.mongo.ObjectID(id)};
        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio
        }
        gestorBD.modificarCancion(criterio, cancion, function (result) {
            if (result == null) {
                // res.send("Error al modificar ");
                error(res,swig,"Error al modificar ")
            } else {
                // res.send("Modificado "+result);
                paso1ModificarPortada(req.files, id, function (result) {
                    if (result == null) {
                        error(res,swig,"Error en la modificación")
                    } else {
                        // res.send("Modificado");
                        res.redirect("/publicaciones");
                    }
                });
            }
        });
    });

    function paso1ModificarPortada(files, id, callback) {
        if (files && files.portada != null) {
            let imagen = files.portada;
            imagen.mv('public/portadas/' + id + '.png', function (err) {
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

    function paso2ModificarAudio(files, id, callback) {
        if (files && files.audio != null) {
            let audio = files.audio;
            audio.mv('public/audios/' + id + '.mp3', function (err) {
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
                res.send(respuesta);
            } else {
                let configuracion = {
                    url: "https://www.freeforexapi.com/api/live?pairs=EURUSD",
                    method: "get",
                    headers: {
                        "token": "ejemplo",
                    }
                }
                let rest = app.get("rest");
                rest(configuracion, function (error, response, body) {
                    console.log("cod: " + response.statusCode + " Cuerpo :" + body);
                    let objetoRespuesta = JSON.parse(body);
                    let cambioUSD = objetoRespuesta.rates.EURUSD.rate;
// nuevo campo "usd"
                    canciones[0].usd = cambioUSD * canciones[0].precio;
                    let respuesta = swig.renderFile('views/bcancion.html',
                        {
                            cancion: canciones[0]
                        });
                    res.send(respuesta);
                })
                let respuesta = swig.renderFile('views/bcancion.html',
                    {
                        cancion : canciones[0]
                    });
            }
        });


        //--------------------------------complementerios anteriores adaptar-----------------------------------------
        //--------------------------------------------------------------------------------
        // if (req.session.usuario == null) {
        //     res.redirect("/identificarse");
        //     return;
        // }
        //
        //
        // let cancionesCompradas = [];
        // let comprada = false;
        // let comentarios = [];
        //
        // let criterioIdCancion = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        // let criterioIdCancionComentarios = {"cancion_id": gestorBD.mongo.ObjectID(req.params.id)};
        // let criterioUsuario = {"usuario": req.session.usuario, "cancion_id": gestorBD.mongo.ObjectID(req.params.id)};
        //
        // //obtengo la cancion
        // //obtengo los comentarios de la cancion
        // //obtengo las canciones compradas
        //
        // gestorBD.obtenerCanciones(criterioIdCancion, function (pCancion) {
        //     if (pCancion == null) {
        //         let msgErr = "Error al recuperar la cancion.";
        //         // res.send(msgErr);
        //         error(res,swig,msgErr)
        //     } else {
        //         gestorBD.obtenerListadoComentariosCancion(criterioIdCancionComentarios, function (pComentarios) {
        //                 gestorBD.obtenerCompras(criterioUsuario, function (compras) {
        //                         comprada = compras[0] != null;
        //
        //                         console.log(pCancion);
        //                         console.log(comprada);
        //
        //                         let respuesta = swig.renderFile('views/bcancion.html',
        //                             {
        //                                 cancion: pCancion[0],
        //                                 comentarios: pComentarios,
        //                                 comprada: comprada
        //                             });
        //                         res.send(respuesta);
        //                     }
        //                 );
        //
        //             }
        //         );
        //     }
        // });
        //--------------------------------------------------------------------------------

        // let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        // gestorBD.obtenerCanciones(criterio, function (canciones) {
        //     if (canciones == null) {
        //         res.send("Error al recuperar la canción.");
        //     } else {
        //         let criterio2 = {"cancion_id": gestorBD.mongo.ObjectID(req.params.id)};
        //         gestorBD.obtenerListadoComentariosCancion(criterio2, function (comentarios) {
        //             if (comentarios == null) {
        //                 res.send("Error al recuperar el listado de comentarios.");
        //             } else {
        //                 let respuesta = swig.renderFile('views/bcancion.html',
        //                     {
        //                         cancion: canciones[0],
        //                         comentarios: comentarios
        //                     });
        //                 res.send(respuesta);
        //             }
        //         });
        //     }
        // });
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
                // res.send("Error al insertar canción");
                error(res,swig,"Error al insertar canción")
            } else {
                //borrar la línea res.send() porque no se puede seguir procesando la
                // petición una vez se ha enviado la respuesta.
                // res.send("Agregada la canción ID: " + id);
                //La respuesta se enviará una vez
                // que se complete la subida de los ficheros
                if (req.files.portada != null) {
                    var imagen = req.files.portada;
                    imagen.mv('public/portadas/' + id + '.png', function (err) {
                        if (err) {
                            // res.send("Error al subir la portada");
                            error(res,swig,"Error al subir la canción")
                        } else {
                            // res.send("Agregada id: " + id);
                            if (req.files.audio != null) {
                                let audio = req.files.audio;
                                audio.mv('public/audios/' + id + '.mp3', function (err) {
                                    if (err) {
                                        // res.send("Error al subir el audio");
                                        error(res,swig,"Error al subir el audio")
                                    } else {
                                        // res.send("Agregada id: " + id);
                                        res.redirect("/publicaciones");
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
        let pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerCancionesPg(criterio, pg, function (canciones, total) {
            if (canciones == null) {
                // res.send("Error al listar ");
                error(res,swig,"Error al listar ")
            } else {
                let ultimaPg = total / 4;
                if (total % 4 > 0) { // Sobran decimales
                    ultimaPg = ultimaPg + 1;
                }
                let paginas = []; // paginas mostrar
                for (let i = pg - 2; i <= pg + 2; i++) {
                    if (i > 0 && i <= ultimaPg) {
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones: canciones,
                        paginas: paginas,
                        actual: pg
                    });
                res.send(respuesta);
            }
        });

        // gestorBD.obtenerCanciones(criterio, function (canciones) {
        //     if (canciones == null) {
        //         res.send("Error al listar ");
        //     } else {
        //         let respuesta = swig.renderFile('views/btienda.html',
        //             {
        //                 canciones: canciones
        //             });
        //         res.send(respuesta);
        //     }
        // });
    });

    app.get('/promo*', function (req, res) {
        res.send('Respuesta patrón promo* ');
    });


}
;