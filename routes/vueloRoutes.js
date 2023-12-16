import express from 'express';
import {
    obtenerVuelos,
    crearVuelo,
    actualizarVuelo,
    eliminarVuelo,
    obtenerVuelo,
    asignarAsiento,
    cancelarVuelo
} from '../controllers/vueloController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

// Ruta para obtener todos los vuelos
router.get('/', obtenerVuelos);
// Ruta para obtener vuelo
router.get('/:id', obtenerVuelo);

// Ruta para crear un nuevo vuelo
router.post('/', checkAuth, crearVuelo);

// Ruta para actualizar un vuelo por ID
router.put('/:id', checkAuth, actualizarVuelo);

// Ruta para cancelar un vuelo por ID
router.get('/:id/cancelar', checkAuth, cancelarVuelo);

// Ruta para eliminar un vuelo por ID
router.delete('/:id', checkAuth, eliminarVuelo);

// Asignar pasajero a asiento
router.post('/:id', checkAuth, asignarAsiento);

export default router;
