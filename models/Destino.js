import mongoose from "mongoose";

const destinoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  codigoIATA: {
    type: String,
    required: true,
  },
  aeropuerto: {
    type: String,
    required: true,
  },
  imagen: {
    type: String
  }
});

const Destino = mongoose.model("Destino", destinoSchema);

export default Destino;
