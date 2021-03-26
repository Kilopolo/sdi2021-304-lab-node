module.exports = function (app, swig) {

    let autores = [{
        "nombre": "Matthew Charles Sanders",
        "grupo": "Avenged Sevenfold",
        "rol": "Cantante"
    }, {
        "nombre": "Zacky Vengeance",
        "grupo": "Avenged Sevenfold",
        "rol": "Guitarrista"
    }, {
        "nombre": "Brian Elwin Haner Jr.",
        "grupo": "Avenged Sevenfold",
        "rol": "Guitarrista"
    }, {
        "nombre": "Johnny Christ",
        "grupo": "Avenged Sevenfold",
        "rol": "Bajista"
    }, {
        "nombre": "Brooks Wackerman",
        "grupo": "Avenged Sevenfold",
        "rol": "Batería"
    }];

    /*    a. autores/agregar: Mostrar un formulario (vista: autores-agregar.html) que
        permita añadir autores con los siguientes parámetros: nombre, grupo y rol
        (posibles valores: cantante, batería, guitarrista, bajista o teclista). 20%.*/

    app.get('/autores/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/autores-agregar.html', {});
        res.send(respuesta);
    });

    /*    b. Versión POST del anterior. Mostrará la información enviada por el formulario
        anterior. En el caso de que algún parámetro sea undefined, se mostrará el
        mensaje: “<Parámetro> no enviado en la petición.”. 15%.*/
    app.post("/autores/agregar", function (req, res) {

        let respuesta = "";
        if (req.body.nombre != null) {
            respuesta += "Autor agregado:" + req.body.nombre + "<br>";
        } else {
            respuesta += "Autor no enviado en la petición." + "<br>";
        }
        if (typeof (req.body.grupo) != "undefined") {
            respuesta += 'Grupo: ' + req.body.grupo + "<br>";
        } else {
            respuesta += "Grupo no enviado en la petición." + "<br>";
        }
        if (req.body.rol != null) {
            respuesta += "Rol:" + req.body.rol + "<br>";
        } else {
            respuesta += "Rol no enviado en la petición." + "<br>";
        }

        autores.push({
            "nombre": req.body.nombre,
            "grupo": req.body.grupo,
            "rol": req.body.rol
        });

        res.send(respuesta);


    });

    /*        c. autores/: contendrá una variable de autores predefinidos, tal y como en la
            práctica lo tiene canciones. Enviará esta lista a la vista (autores.html) y mostrará
            por pantalla los datos (nombre, grupo y rol) de cada autor. 20%.*/
    app.get("/autores", function (req, res) {
        // crearemos un array con 5 autores

        //retorno de la función será el HTML final procesado por la plantilla
        let respuesta = swig.renderFile('views/autores.html', {
            vendedor: 'Tienda de canciones',
            autores: autores
        });
        // let respuesta = "";
        // if (req.query.nombre != null)
        //     respuesta+= 'Nombre: ' + req.query.nombre + '<br>' ;
        // if(typeof (req.query.autor) != "undefined")
        //     respuesta+= 'Autor: '+ req.query.autor;
        res.send(respuesta);
    });

    /*        d. Crear un método GET para controlar, mediante comodines, las rutas que
            incluyan parámetros a autores/. Deberán redirigir (método: res.redirect) a
            autores/. Contrólese la posición de este método en el código, los métodos
            anteriores deben seguir funcionando. 10%.*/
    app.get('/autores*', function (req, res) {
        res.redirect('/autores');
    });

};