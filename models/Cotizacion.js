const mongoose = require("mongoose");
const Schema   = mongoose.Schema;


const cotizacionSchema = new Schema({
  titulo:String,
  content:String,
  precio:Number,
  dateService:Date,

  peticionId:{
      type:Schema.Types.ObjectId,
      ref:'Peticion'
  }
  
}, {
  timestamps: true
});


const Cotizacion = mongoose.model("Cotizacion", cotizacionSchema);
module.exports = Cotizacion;