require('dotenv').config()

const { leerInput, inquirerMenu, pause, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
    const busquedas = new Busquedas();
    let opt;

    do {

        opt = await inquirerMenu();

        switch (opt) {

            case 1:     
                //mostrar msj
                const termino = await leerInput('Ciudad: ')

                //buscar los lugares que
                const lugares = await busquedas.ciudad( termino );

                //seleccionar el lugar de
                const id = await listarLugares(lugares);
                if ( id === "0") continue;
                const lugarSel = lugares.find( l => l.id === id );

                //Guardar en Db
                busquedas.agregarHistorial( lugarSel.nombre );

                //Clima
                const clima = await busquedas.climaLugar( lugarSel.lat, lugarSel.lng )

                //Mostrar resultados
                console.clear();
                console.log('\ninformacion de la ciudad\n')
                console.log('Ciudad:', lugarSel.nombre.cyan)
                console.log('Lat:', lugarSel.lat)
                console.log('Lng:', lugarSel.lng)
                console.log('Temperatura:',clima.temp)
                console.log('Minima:',clima.min)
                console.log('Maxima:',clima.max)
                console.log('Clima actual:',clima.desc.cyan)

                break;
            case 2:
                busquedas.historialCapitalizado.forEach( (lugar,i) => {
                    const idx = `${i + 1}.`.green;
                    console.log( `${idx} ${lugar}` )
                })
        }

        if ( opt !== 0) await pause();
        
    } while (opt !== 0);
}
main();
