import Destino from "../models/Destino.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./imagenes/destinos"); // Directorio de destino para los archivos subidos
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop(); // Obtiene la extensión del archivo original
    cb(null, `${Date.now()}.${ext}`); // Asigna un nombre único al archivo
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Verifica si es una solicitud de actualización y no hay archivo nuevo
    const isUpdateRequest = req.method === "PUT" && !req.file;

    if (isUpdateRequest) {
      // Si es una actualización y no hay archivo nuevo, acepta la solicitud sin un archivo
      cb(null, true);
    } else {
      // En otros casos, utiliza la lógica original para aceptar o rechazar el archivo
      const allowedFileTypes = /jpeg|jpg|png|avif|webp/;
      const extname = allowedFileTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype = allowedFileTypes.test(file.mimetype);

      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Solo se permiten archivos de imagen con extensiones jpeg, jpg, png, avif o webp."
          )
        );
      }
    }
  },
}).single("imagen");


// Obtener todos los destinos
const obtenerDestinos = async (req, res) => {
  try {
    const destinos = await Destino.find();
    res.json(destinos);
  } catch (error) {
    console.error("Error al obtener destinos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Crear un nuevo destino
const crearDestino = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, async (err) => {
        if (err) {
          reject({ status: 500, message: "Error al subir el archivo" });
          return;
        }

        const { nombre, codigoIATA } = req.body;

        try {
          const destinoExistente = await Destino.findOne({
            $or: [{ nombre }, { codigoIATA }],
          });

          if (destinoExistente) {
            fs.unlinkSync(req.file.path);
            reject({ status: 409, message: "El destino ya existe" });
            return;
          }

          const nuevoDestino = await Destino(req.body);
          nuevoDestino.imagen = req.file.filename;

          await nuevoDestino.save();

          resolve(res.json(nuevoDestino)); // Retorna el nuevo destino guardada en JSON
        } catch (error) {
          fs.unlinkSync(req.file.path);
          console.error("Error al buscar destino existente:", error);
          reject({
            status: 500,
            message: "Error interno al buscar destino existente",
          });
        }
      });
    });
  } catch (error) {
    console.error("Error al crear destino:", error);
    const errorMessage = error.message || "Error interno al crear destino";
    res.status(500).json({ message: errorMessage }); // 500 Internal Server Error
  }
};

// Actualizar un destino por ID
const actualizarDestino = async (req, res) => {

  try {
    const result = await new Promise((resolve, reject) => {
      upload(req, res, async (err) => {
        // Lógica de manejo de errores y subida de imagen
        if (err) {
          console.error("Error al cargar la imagen:", err);
          return reject({
            status: 500,
            message: "Error interno al cargar la imagen",
          });
        }

        const { id } = req.params;
        // Verifica si existe un archivo antes de acceder a sus propiedades
        const destinoActualizado = await Destino.findById(id);
        if (!destinoActualizado) {
          return reject({ status: 409, message: "El destino no existe" });
        }

        if (req.file) {
          if (
            fs.existsSync(
              `./imagenes/destinos/${destinoActualizado.imagen}`
            )
          ) {
            fs.unlinkSync(
              `./imagenes/destinos/${destinoActualizado.imagen}`
            );
          }
          destinoActualizado.imagen = req.file.filename;
        } else {
          // Actualiza el destino sin cambiar la imagen si no hay un archivo adjunto
          const { ...restoDatos } = req.body;
          Object.assign(destinoActualizado, restoDatos);
        }

        // Guarda el destino actualizado
        destinoActualizado
          .save()
          .then(() => resolve(destinoActualizado))
          .catch((error) =>
            reject({
              status: 500,
              message: error.message || "Error interno al actualizar destino",
            })
          );
      });
    });

    res.status(201).json(result);
  } catch (error) {
    fs.unlinkSync(req.file.path);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Error interno del servidor" });
  }

  const { id } = req.params;
  try {
    const destinoActualizado = await Destino.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!destinoActualizado) {
      return res.status(404).json({ error: "Destino no encontrado" });
    }
    res.json(destinoActualizado);
  } catch (error) {
    console.error("Error al actualizar destino:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar un destino por ID
const eliminarDestino = async (req, res) => {
  const { id } = req.params;
  try {
    const destinoEliminado = await Destino.findByIdAndDelete(id);
    if (!destinoEliminado) {
      return res.status(404).json({ error: "Destino no encontrado" });
    }
    res.json({ mensaje: "Destino eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar destino:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export { obtenerDestinos, crearDestino, actualizarDestino, eliminarDestino };
