const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Peticion = require('../models/Peticion')
const Cotizacion = require('../models/Cotizacion')
const passport = require("passport")
const multer     = require('multer')
const upload   = multer ({dest:'./public/pics'})
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const {welcomeMail} =require('../passport/mailer')

//middlewares
function checkRoles(role) {
  return function(req, res, next) {
    if ((role === 'Plomero' || role === 'Electricidad') && req.isAuthenticated()){
        return next();
    }
    else if (req.isAuthenticated() && req.user.role === role) {
      return next();
    } else {
      res.redirect('/')
    }
  }
}
const checkPlomero  = checkRoles('Plomero');
const checkElectricista  = checkRoles('Electricista');
const checkClient  = checkRoles('Client');

router.get("/login", (req, res, next) => {
    res.render("auth/login", { "message": req.flash("error") });
  });
  
  router.post("/login", passport.authenticate("local", {
    
    failureRedirect: "/auth/login",
    failureFlash: true,
    passReqToCallback: true
  }),(req,res,next)=>{
      const role = req.user.role
      const id = req.user._id
        if(role !== "Client"){
            res.redirect(`/auth/detailt/${id}`)
        }else{
            res.redirect(`/auth/detailc/${id}`)
        }
  });


  
  router.get('/signup', ensureLoggedOut(),(req,res,next)=>{
    const action = '/auth/signup'
    res.render('auth/signup')
  })
  
  

  router.post("/signup",upload.single('photo'), (req, res, next) => {
     
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const address = req.body.address;
    const phoneNumber = req.body.phoneNumber;
    const role = req.body.role;
    const purl = `/pics/${req.file.filename}`
    const pname = req.file.originalname
   
  
    

    if (username === "" || password === "") {
      res.render("auth/signup", { message: "Indicate username and password" });
      return;
    }
  
    User.findOne({ username }, "username", (err, user) => {
      if (user !== null) {
        res.render("auth/signup", { message: "The username already exists" });
        return;
      }
  
      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);
      
  
      const newUser = new User({
        username:username,
        password: hashPass,
        email:email,
        address:address,
        role: role,
        phoneNumber:phoneNumber,
        photoUrl: purl,
        photoName: pname
        
      });
      console.log(newUser)
  
      newUser.save()
      .then(user => {
        
    
  
        
        res.redirect("/auth/login");
      })
      .catch(err => {
        res.render("auth/signup", { message: "Something went wrong" });
      })
    });
  });



router.get('/detailt/:id',checkPlomero,(req,res,next)=>{
    const {id} = req.params
    console.log("rene")
    User.findById(id).populate('peticiones').populate('cotizaciones')
  .then(user=>{
    console.log(user)
    res.render('auth/detailt',{user})
  }).catch(e=>next(e))

})

router.get('/detailc/:id',checkClient,(req,res,next)=>{
    const {id} = req.params
    const {peticiones} = req.user.peticiones
   

    User.findById(id).populate('peticiones').populate('cotizaciones')
  .then(user=>{
    
    res.render('auth/detailc',user)
  }).catch(e=>next(e))
    
})

router.get("/logout",(req,res)=>{
    req.logOut(),
    res.redirect('/')
  
  } )
router.get("/update/:id",ensureLoggedIn(),(req,res,next)=>{
    User.findById(req.params.id)
  .then(user=>{
    const action = `/auth/update/${req.params.id}`
    res.render('auth/signup',{user, action})
  }).catch(e=>next(e))
})


router.post('/update/:id', upload.single('photo'),(req, res, next) => {
    
    const newbody = {
      username:req.body.username,
      email:req.body.email,
      phoneNumber:req.body.phoneNumber,
      address:req.body.address,
      role:req.body.role,
      photoUrl: `/pics/${req.file.filename}`,
      photoName:req.file.originalname
}


    User.findByIdAndUpdate(req.params.id,{$set:newbody},{new:true})
    .then(user=>{
        const role = user.role
        const id = user._id
          if(role !== "Client"){
              res.redirect(`/auth/detailt/${id}`)
          }else{
              res.redirect(`/auth/detailc/${id}`)
          }
      
      
    }).catch(e=>next(e))
  });
router.get("/listae",checkClient,(req,res,next)=>{
    User.find({role:"Electricista"}).populate('peticiones')
    .then(elec=>{
        res.render('electricistas',{elec})
    }).catch(e=>next(e))

})
router.get("/listap",checkClient,(req,res,next)=>{
    User.find({role:"Plomero"}).populate('peticiones')
    .then(plom=>{
        res.render('plomeros',{plom})
    }).catch(e=>next(e))

})
router.get("/peticion/:id",checkClient,(req,res,next)=>{
    const {id} = req.params
    const action = `/auth/peticion/${id}`
    res.render('peticion',{action})
})
router.post("/peticion/:id",upload.single('photo'),(req,res,next)=>{
    const {id} = req.params
    const peticion = new Peticion({
        titulo: req.body.titulo,
        content: req.body.content,
        imgURL: `/pics/${req.file.filename}`,
        imgName: req.file.originalname,
        clientId: req.user._id,
        workerId: id
      });
    Peticion.create(peticion)
    .then(peticion=>{
        const pet = peticion
       
        
        User.findByIdAndUpdate(id,{$push:{peticiones:pet._id}})
        .then(result=>{
            console.log(pet)
            
            User.findByIdAndUpdate(req.user._id,{$push:{peticiones:pet._id}})
            .then(resul=>{
                var message = `El usuario ${resul.username} ha solicitado un trabajo con usted`
                welcomeMail(result.email,message)
                res.redirect(`/auth/detailc/${req.user._id}`)
            }).catch(e=>next(e))
            
          }).catch(e=>next(e))
          
        }).catch(error=>{
          console.log(error)
        })
})
router.get('/detallePet/:id',ensureLoggedIn(),(req,res,next)=>{
    const {id} = req.params
    const idd=req.user._id
    const role = req.user.role
    var inicial
    if(role !== "Client"){
         inicial = "t"
    }else{
         inicial = "c"
    }
    console.log(inicial)
    Peticion.findById(id)
    .then(peticion=>{
        User.findById(peticion.clientId).then(cliente=>{
            User.findById(peticion.workerId).then(worker=>{
                res.render('peticionDetalle',{peticion,cliente,worker,idd,inicial})
            }).catch(e=>next(e))
        }).catch(e=>next(e))
        

    }).catch(e=>next(e))

})
router.get("/cotizacion/:id",checkPlomero,(req,res,next)=>{
    const {id} = req.params
    const action = `/auth/cotizacion/${id}`
    Peticion.findById(id)
    .then(peti=>{
        res.render('cotizacion',{action,peti})
    }).catch(e=>next(e))
   
    
})

router.post("/cotizacion/:id",(req,res,next)=>{
    const {id} = req.params
    const cotizacion = new Cotizacion({
        titulo: req.body.titulo,
        content: req.body.content,
        precio:req.body.precio,
        dateService:req.body.dateService,
        peticionId: id
      });
    Cotizacion.create(cotizacion)
    .then(cotizacion=>{
        const cot = cotizacion
        Peticion.findById(cot.peticionId)
        .then(pet=>{
            const cid = pet.clientId
            const wid = pet.workerId

        
        User.findByIdAndUpdate(wid,{$push:{cotizaciones:cot._id}})
        .then(result=>{
            
            User.findByIdAndUpdate(cid,{$push:{cotizaciones:cot._id}})
            .then(resul=>{
                var message = `El usuario ${result.username} ha respondido a una solicitud que usted hizo`
                welcomeMail(resul.email,message)
                res.redirect(`/auth/detailt/${req.user._id}`)
            }).catch(e=>next(e))
            
          }).catch(e=>next(e))
        }).catch(e=>next(e))
          
        }).catch(error=>{
          console.log(error)
        })
})
router.get('/detalleCot/:id',ensureLoggedIn(),(req,res,next)=>{
    const {id} = req.params
    const idd=req.user._id
    const role = req.user.role
    var inicial
    if(role !== "Client"){
         inicial = "t"
    }else{
         inicial = "c"
    }
    
    Cotizacion.findById(id)
    .then(cotizacion=>{
        const peid = cotizacion.peticionId
        Peticion.findById(peid)
        .then(peticion=>{
            


        
        User.findById(peticion.clientId).then(cliente=>{
            User.findById(peticion.workerId).then(worker=>{
                res.render('cotizacionDetalle',{cotizacion,cliente,worker,idd,inicial})
            }).catch(e=>next(e))
        }).catch(e=>next(e))
        
    }).catch(e=>next(e))
    }).catch(e=>next(e))

})
router.get('/borrarCot/:id', ensureLoggedIn(), (req, res, next) => {
    Cotizacion.findByIdAndRemove(req.params.id)

    .then(place=>{
      res.redirect(`/auth/detailt/${req.user._id}`)
    }).catch(e=>next(e))
  });
  router.get('/borrarPet/:id', ensureLoggedIn(), (req, res, next) => {
    Peticion.findByIdAndRemove(req.params.id)

    .then(place=>{
      res.redirect(`/auth/detailc/${req.user._id}`)
    }).catch(e=>next(e))
  });
// router.get("/updatePeticion/:id",checkClient,(req,res,next)=>{
//     User.findById(req.params.id)
//     .then(user=>{
//       const action = `/auth/update/${req.params.id}`
//       res.render('auth/signup',{user, action})
//     }).catch(e=>next(e))
// })
// router.post("/updatePeticion/:id",upload.single('photo'),(req,res,next)=>{

// })
module.exports = router