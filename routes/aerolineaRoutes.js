import express from 'express';
import {
    obtenerAerolineas,
    crearAerolinea,
    actualizarAerolinea,
    eliminarAerolinea
} from '../controllers/aerolineaController.js';

const router = express.Router();

// Ruta para obtener todos los Aerolineas
router.get('/', obtenerAerolineas);

// Ruta para crear un nuevo Aerolinea
router.post('/', crearAerolinea);

// Ruta para actualizar un Aerolinea por ID
router.put('/:id', actualizarAerolinea);

// Ruta para eliminar un Aerolinea por ID
router.delete('/:id', eliminarAerolinea);

export default router;
