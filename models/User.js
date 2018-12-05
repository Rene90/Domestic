const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema =  new Schema({
  username: String,
  email: String,
  password:String,
  photoUrl:{
    type:String,
    default:'/pics/default.jpg'
  },
  photoName:{
    type:String,
    default:"deafult"
  },
  address: String,
  phoneNumber: Number,
  
  role:{
    type:String,
    enum:["Plomero","Electricista","Client"]
  },
  cotizaciones:[{
    type:Schema.Types.ObjectId,
    ref:'Cotizacion'
}],
  Rating:{
    type:Number,
    default:0
  },

  peticiones:[{
      type:Schema.Types.ObjectId,
      ref:'Peticion'
  }],
  location:{
    type:{
      type:String,
      default:"Point"
    },
    coordinates:[Number]
  }
 
  
}, {
  timestamps: true
});
UserSchema.index({ location: '2dsphere' });
UserSchema.plugin(passportLocalMongoose,{usernameField:'username'})
const User = mongoose.model('User', UserSchema);

module.exports = User;