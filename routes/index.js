const express = require('express');
const router  = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});
router.get('/tecnicos', (req, res, next) => {
  res.render('tecnicos');
});
router.get('/somos',(req,res,next)=>{
  res.render('somos');
});
router.get('/aviso',(req,res,next)=>{
  res.render('aviso');
});
router.get('/preguntas',(req,res,next)=>{
  res.render('preguntas');
});
router.get('/contacto',(req,res,next)=>{
  res.render('contacto');
});

module.exports = router;
