const mongoose = require("mongoose");
const Schema   = mongoose.Schema;


const peticionSchema = new Schema({
  titulo:String,
 
  status:{
        type:Boolean,
        default:false
  },
  content:String,
  imgURL:String,
  imgName:String,
  clientId:{
      type:Schema.Types.ObjectId,
      ref:'Client'
  },
  workerId:{
    type:Schema.Types.ObjectId,
    ref:'Worker'
}
  
}, {
  timestamps: true
});


const Peticion = mongoose.model("Peticion", peticionSchema);
module.exports = Peticion;