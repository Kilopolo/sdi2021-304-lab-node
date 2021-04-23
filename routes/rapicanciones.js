module.exports = function (app, gestorBD) {

    app.get("/api/cancion", function (req, res) {
        gestorBD.obtenerCanciones({}, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones));
            }
        });
    });

    function cancionValida(cancion) {
        if(cancion.nombre == null)
            return false
        if(cancion.genero == null)
            return false
        if(cancion.precio == null)
            return false
        // precio positivo, que el título tenga una longitud
        // mínima o máxima, etcétera.
        if (cancion.nombre.length > 25 || cancion.nombre.length < 3)
            return false
        if(cancion.precio <= 0)
            return false

    }
    function validaDatosCancion(cancion, funcionCallback) {
        let errors = new Array();
        if (cancion.nombre === null || typeof cancion.nombre === 'undefined' ||
            cancion.nombre === "")
            errors.push("El nombre de la canción no puede estar vacio")
        if (cancion.genero === null || typeof cancion.genero === 'undefined' ||
            cancion.genero === "")
            errors.push("El género de la canción no puede estar vacio")
        if (cancion.precio === null || typeof cancion.precio === 'undefined' ||
            cancion.precio < 0 || cancion.precio === "")
            errors.push("El precio de la canción no puede ser negativo")
        if (cancion.nombre.length > 25 || cancion.nombre.length < 3)
            errors.push("El nombre de la canción no puede ser mayor que 25 ni menor que 3 caracteres")
        if (errors.length <= 0)
            funcionCallback(null)
        else
            funcionCallback(errors)
    }

    app.post("/api/cancion", function (req, res) {
        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
        }


        // ¿Validar nombre, genero, precio?
        // if (cancionValida(cancion)) {
        //     res.status(500);
        //     res.json({
        //         error: "la cancion no es valida"
        //     })
        // }

        validaDatosCancion (cancion, function(errors){
            if (errors !== null && errors.length > 0) {
                res.status(403);
                res.json({
                    errores: errors
                })
            } else {
                gestorBD.insertarCancion(cancion, function (id) {
                    if (id == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else {
                        res.status(201);
                        res.json({
                            mensaje: "canción insertada",
                            _id: id
                        })
                    }
                });
            }
        })

    });

    function usuarioAutenticado(req, res) {
        let usuario = req.usuario.session ;
        if(usuario == null)
            return false;
    }

    function usuarioEsDuenyoDeLaCancion(cancion) {
        return false;
    }

    app.put("/api/cancion/:id", function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        let cancion = {}; // Solo los atributos a modificar
        if (req.body.nombre != null)
            cancion.nombre = req.body.nombre;
        if (req.body.genero != null)
            cancion.genero = req.body.genero;
        if (req.body.precio != null)
            cancion.precio = req.body.precio;

        if(!usuarioAutenticado(req,res)){
            res.status(500);
            res.json({
                error: "el usuario no esta autenticado"
            })
        }

        if(!usuarioEsDuenyoDeLaCancion(cancion)){
            res.status(500);
            res.json({
                error: "el usuario no es el dueño de la cancion"
            })
        }


        gestorBD.modificarCancion(criterio, cancion, function (result) {
            if (result == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.json({
                    mensaje: "canción modificada",
                    _id: req.params.id
                })
            }
        });
    });
    app.get("/api/cancion/:id", function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones[0]));
            }
        });
    });
    app.delete("/api/cancion/:id", function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}


        if(!usuarioAutenticado(req,res)){
            res.status(500);
            res.json({
                error: "el usuario no esta autenticado"
            })
        }

        if(!usuarioEsDuenyoDeLaCancion(cancion)){
            res.status(500);
            res.json({
                error: "el usuario no es el dueño de la cancion"
            })
        }


        gestorBD.eliminarCancion(criterio, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones));
            }
        });
    });
}