import express from 'express';
import {
    obtenerDestinos,
    crearDestino,
    actualizarDestino,
    eliminarDestino
} from '../controllers/destinoController.js';

const router = express.Router();

// Ruta para obtener todos los destinos
router.get('/', obtenerDestinos);

// Ruta para crear un nuevo destino
router.post('/', crearDestino);

// Ruta para actualizar un destino por ID
router.put('/:id', actualizarDestino);

// Ruta para eliminar un destino por ID
router.delete('/:id', eliminarDestino);

export default router;
