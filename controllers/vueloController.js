import Usuario from "../models/Usuario.js";
import Vuelo from "../models/Vuelo.js";

// Obtener todos los vuelos
const obtenerVuelos = async (req, res) => {
  try {
    let query = Vuelo.find()
      .populate("infoVuelo.origen infoVuelo.destino infoVuelo.aerolinea")
      .select("-infoVuelo.pasajeros");
      
    // Si el usuario es 'Administrador', excluye los vuelos con estado 'Cancelado'
    if (req.usuario.rol !== "Administrador") {
      query = query.where("infoVuelo.estado").ne("Cancelado");
    }

    const vuelos = await query.exec();
    res.json(vuelos);
  } catch (error) {
    console.error("Error al obtener vuelos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener todos los vuelos
const obtenerVuelo = async (req, res) => {
  const { id } = req.params;
  try {
    const vuelo = await Vuelo.findById(id)
      .populate("infoVuelo.origen infoVuelo.destino infoVuelo.aerolinea")
      .populate({
        path: "infoVuelo.pasajeros.usuario",
        select: "-confirmado -createdAt -password -rol -token -updatedAt",
      });
    res.json(vuelo);
  } catch (error) {
    console.error("Error al obtener vuelo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Crear un nuevo vuelo
const crearVuelo = async (req, res) => {
  const { idVuelo } = req.body;

  try {

    if(req.usuario.rol !== 'Administrador'){
      return res.status(401).json({msg: 'No estás autorizado a realizar esta acción'})
    }

    const vueloExistente = await Vuelo.findOne({ idVuelo });

    if (vueloExistente) {
      return res.status(409).json({ error: "El vuelo ya existe" }); // 409 Conflict
    }

    const nuevoVuelo = await Vuelo.create(req.body);

    const vueloPopulado = await Vuelo.findById(nuevoVuelo._id)
      .populate("infoVuelo.aerolinea") // Popula la referencia a la colección "Aerolinea"
      .populate("infoVuelo.origen") // Popula la referencia a la colección "Origen"
      .populate("infoVuelo.destino"); // Popula la referencia a la colección "Destino"
    res.status(201).json(vueloPopulado); // 201 Created
  } catch (error) {
    console.error("Error al crear vuelo:", error);
    const errorMessage = error.message || "Error interno al crear vuelo";
    res.status(500).json({ error: errorMessage }); // 500 Internal Server Error
  }
};

// Actualizar un vuelo por ID
const actualizarVuelo = async (req, res) => {
  const { id } = req.params;

  const { _id, ...actualizacion } = req.body;

  
  try {
    
    // Obtener el vuelo actual
    const vuelo = await Vuelo.findById(id);

    if(req.usuario.rol !== 'Administrador'){
      return res.status(401).json({msg: 'No estás autorizado a realizar esta acción'})
    }
    
    // Verificar si el vuelo existe
    if (!vuelo) {
      return res.status(404).json({ error: "Vuelo no encontrado" });
    }

    // Actualizar el vuelo
    const vueloActualizado = await Vuelo.findByIdAndUpdate(id, actualizacion, {
      new: true,
    })
      .populate("infoVuelo.origen infoVuelo.destino infoVuelo.aerolinea")
      .populate({
        path: "infoVuelo.pasajeros.usuario",
        select: "-confirmado -createdAt -password -rol -token -updatedAt",
      });

    // Responder con el vuelo actualizado
    res.json(vueloActualizado);
  } catch (error) {
    console.error("Error al actualizar vuelo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar un vuelo por ID
const eliminarVuelo = async (req, res) => {
  const { id } = req.params;
  try {

    if(req.usuario.rol !== 'Administrador'){
      return res.status(401).json({msg: 'No estás autorizado a realizar esta acción'})
    }

    const vueloEliminado = await Vuelo.findByIdAndDelete(id);
    if (!vueloEliminado) {
      return res.status(404).json({ error: "Vuelo no encontrado" });
    }
    
    res.json({ mensaje: "Vuelo eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar vuelo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar un vuelo por ID
const cancelarVuelo = async (req, res) => {
  const { id } = req.params;
  try {

    if(req.usuario.rol !== 'Administrador'){
      return res.status(401).json({msg: 'No estás autorizado a realizar esta acción'})
    }

    // Obtener el vuelo por ID
    const vuelo = await Vuelo.findById(id);

    // Verificar si el vuelo existe
    if (!vuelo) {
      return res.status(404).json({ error: "Vuelo no encontrado" });
    }

    // Verificar si el vuelo está en estado 'Pendiente'
    if (vuelo.infoVuelo.estado != "Pendiente") {
      return res.status(400).json({
        error: "No puedes cancelar un vuelo que no está en estado 'Pendiente'",
      });
    }

    // Actualizar el estado del vuelo a 'Cancelado'
    vuelo.infoVuelo.estado = "Cancelado";
    await vuelo.save();

    const vueloAlmacenado = await Vuelo.findById(vuelo._id)
      .populate("infoVuelo.origen infoVuelo.destino infoVuelo.aerolinea")
      .populate({
        path: "infoVuelo.pasajeros.usuario",
        select: "-confirmado -createdAt -password -rol -token -updatedAt",
      });

    res.json(vueloAlmacenado);
  } catch (error) {
    console.error("Error al cancelar vuelo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const asignarAsiento = async (req, res) => {
  const { id } = req.params
  const { usuario } = req

  try {
    const vueloExiste = await Vuelo.findById(id);

    if (!vueloExiste) {
      return res.status(404).json({ error: "El vuelo no existe" }); // Cambiado a 404 Not Found
    }

    const usuarioExiste = await Usuario.findById(usuario._id);

    if (!usuarioExiste) {
      return res.status(404).json({ error: "El usuario no existe" }); // Cambiado a 404 Not Found
    }

    // Supongamos que la información del asiento se encuentra en req.body.asiento
    const { asiento } = req.body;

    // Verificar si el asiento ya está ocupado
    const asientoOcupado = vueloExiste.infoVuelo.pasajeros.some(
      (pasajero) => pasajero.asiento === asiento
    );

    if (asientoOcupado) {
      return res.status(409).json({ error: "El asiento ya está ocupado" }); // 409 Conflict
    }

    // Asignar el asiento al usuario
    vueloExiste.infoVuelo.pasajeros.push({
      usuario: usuario._id,
      asiento,
    });

    // Guardar el cambio en la base de datos
    await vueloExiste.save();

    res.status(200).json({ msg: "Asiento asignado exitosamente" }); // 200 OK
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" }); // 500 Internal Server Error
  }
};

export {
  obtenerVuelos,
  crearVuelo,
  actualizarVuelo,
  eliminarVuelo,
  cancelarVuelo,
  obtenerVuelo,
  asignarAsiento,
};
