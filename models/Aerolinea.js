import mongoose from 'mongoose';

const aerolineaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  imagen:{
    type: String,
    required: true
  }
});

const Aerolinea = mongoose.model('Aerolinea', aerolineaSchema);

export default Aerolinea;
