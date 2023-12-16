import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import conexion from './config/db.js'
import usuarioRoutes from './routes/usuarioRoutes.js'
import vueloRoutes from './routes/vueloRoutes.js'
import destinoRoutes from './routes/destinoRoutes.js'
import aerolineaRoutes from './routes/aerolineaRoutes.js'
// import insertarVuelosEnDB from './seed.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 4000
app.use(express.json())
dotenv.config()
conexion()

const whitelist = [process.env.FRONTEND_URL, process.env.NATIVE_URL, 'http://localhost:19006', 'http://192.168.0.15:8081']

const corsOptions = {
    origin:function(origin, callback) {
        if(!origin){ //Postman request have not origin 
            return callback(null, true)
        }else if (whitelist.includes(origin)){
            callback(null, true)
        }else{
            callback(new Error("Cors Error"))
        }
    }
}
app.use(cors(corsOptions))

app.use('/dorado', usuarioRoutes)
app.use('/dorado/vuelos', vueloRoutes)
app.use('/dorado/destinos', destinoRoutes)
app.use('/dorado/aerolineas', aerolineaRoutes)
app.use('/imagenes', express.static('imagenes'));
// insertarVuelosEnDB()

app.listen(PORT, ()=>{
    console.log(`Servidor escuchando por los cambios en el puerto ${PORT}`)
})