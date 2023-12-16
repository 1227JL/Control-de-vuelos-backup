import Aerolinea from "../models/Aerolinea.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./imagenes/aerolineas"); // Directorio de destino para los archivos subidos
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
      const allowedFileTypes = /jpeg|jpg|png/;
      const extname = allowedFileTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype = allowedFileTypes.test(file.mimetype);

      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Solo se permiten archivos de imagen con extensiones jpeg, jpg o png."
          )
        );
      }
    }
  },
}).single("imagen");

// Obtener todos los Aerolineas
const obtenerAerolineas = async (req, res) => {
  try {
    const aerolineas = await Aerolinea.find();
    res.json(aerolineas);
  } catch (error) {
    console.error("Error al obtener aerolineas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const crearAerolinea = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, async (err) => {
        if (err) {
          reject({ status: 500, message: "Error al subir el archivo" });
          return;
        }

        const { nombre } = req.body;
        try {
          const aerolineaExiste = await Aerolinea.findOne({ nombre });

          if (aerolineaExiste) {
            fs.unlinkSync(req.file.path);
            reject({ status: 409, message: "La aerolínea ya existe" });
            return;
          }

          const nuevaAerolinea = await Aerolinea(req.body);
          nuevaAerolinea.imagen = req.file.filename;

          await nuevaAerolinea.save();

          resolve(res.json(nuevaAerolinea)); // Retorna la nueva aerolínea guardada en JSON
        } catch (error) {
          fs.unlinkSync(req.file.path);
          console.error("Error al buscar aerolínea existente:", error);
          reject({
            status: 500,
            message: "Error interno al buscar aerolínea existente",
          });
        }
      });
    });
  } catch (error) {
    console.error("Error al crear aerolínea:", error);
    const errorMessage = error.message || "Error interno al crear aerolínea";
    res.status(500).json({ message: errorMessage }); // 500 Internal Server Error
  }
};

const actualizarAerolinea = async (req, res) => {
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
        const aerolineaActualizado = await Aerolinea.findById(id);
        if (!aerolineaActualizado) {
          return reject({ status: 409, message: "La aerolínea no existe" });
        }

        if (req.file) {
          if (
            fs.existsSync(
              `./imagenes/aerolineas/${aerolineaActualizado.imagen}`
            )
          ) {
            fs.unlinkSync(
              `./imagenes/aerolineas/${aerolineaActualizado.imagen}`
            );
          }
          aerolineaActualizado.imagen = req.file.filename;
        } else {
          // Actualiza la aerolínea sin cambiar la imagen si no hay un archivo adjunto
          const { ...restoDatos } = req.body;
          Object.assign(aerolineaActualizado, restoDatos);
        }

        // Guarda la aerolínea actualizada
        aerolineaActualizado
          .save()
          .then(() => resolve(aerolineaActualizado))
          .catch((error) =>
            reject({
              status: 500,
              message: error.message || "Error interno al actualizar aerolínea",
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
};

// Eliminar un destino por ID
const eliminarAerolinea = async (req, res) => {
  const { id } = req.params;
  try {
    const aerolineaEliminado = await Aerolinea.findByIdAndDelete(id);
    if (!aerolineaEliminado) {
      return res.status(404).json({ error: "Aerolinea no encontrada" });
    }
    res.json({ mensaje: "Aerolinea eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar destino:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export {
  obtenerAerolineas,
  crearAerolinea,
  actualizarAerolinea,
  eliminarAerolinea,
};
