import mongoose from "mongoose";

const vueloSchema = new mongoose.Schema({
  idVuelo: {
    type: String,
    required: true,
  },
  infoVuelo: {
    aerolinea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Aerolinea",
    },
    origen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destino",
    },
    destino: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destino",
    },
    fechaSalida: {
      type: Date,
      required: true,
    },
    horaSalida: {
      type: Date,
      required: true,
    },
    fechaLlegada: {
      type: Date,
      required: true,
    },
    horaLlegada: {
      type: Date,
      required: true,
    },
    estado: {
      type: String,
      enum: ["Pendiente", "Activo", "Realizado", "Cancelado"],
      default: "Pendiente",
      required: true,
    },
    pasajeros: [
      {
        usuario: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Usuario",
        },
        asiento: String,
      },
    ],
  },
});

const Vuelo = mongoose.model("Vuelo", vueloSchema);

export default Vuelo;
