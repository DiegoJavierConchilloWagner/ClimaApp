const fs = require('fs');

const axios = require('axios');

class Busquedas {
    historial = [];
    dbPath = './db/db.json';

    constructor(){
        //Leer db si existe
        this.leerBd();
    }
    
    get historialCapitalizado(){
        //capitalizar cada palabra
        return this.historial.map( lugar => {

            let palabras = lugar.split(' ');
            palabras = palabras.map( p  => p[0].toUpperCase() + p.substring(1) );

            return palabras.join(' ');
        })
    }
    //completar con sus keys en .env
    get paramsMapbox(){
        return {
            access_token: process.env.MAPBOX_KEY || '',
            limit: 5,
            language: 'es'
        }
    }
    //completar con sus keys en .env
    get paramsOPENWEATHER(){
        return {
            appid: process.env.OPENWEATHER_KEY || '',
            units: 'metric',
            lang: 'es'
        }
    }

    async ciudad( lugar = '' ){
        try {
            //Peticion http
            // console.log("Ciudad",lugar);
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });
            const resp = await instance.get();
            return resp.data.features.map( lugar  => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0], 
                lat: lugar.center[1]
            }))

            return [];//retornar lugares
        } catch (error) {
            return [];
        }
    }
    async climaLugar ( lat, lon ){
        try {
            //instance axios create
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsOPENWEATHER, lat, lon }
            });
            const resp = await instance.get();
            const { weather , main } = resp.data
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
        } catch (error) {
            console.log(error)
        }
    }
    loading(){
        return 'Cargando...'.yellow
    }
    agregarHistorial( lugar = '' ){
        if (this.historial.includes( lugar.toLowerCase())) {
            return;
        }
        //hago que el historial solo muestre las ultimas 500
        this.historial = this.historial.slice(0,4);

        this.historial.unshift( lugar.toLowerCase() );

        //Grabar en bd
        this.guardarDb();
    };
    guardarDb(){
        const payload = {
            historial: this.historial,
        };
        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) )
    };
    leerBd(){
        if (!fs.existsSync(this.dbPath)) return;
        
        const info = fs.readFileSync( this.dbPath, { encoding: 'utf8' });
        const data = JSON.parse(info);
    
        this.historial = data.historial
    };
}

module.exports = Busquedas;