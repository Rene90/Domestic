document.addEventListener('DOMContentLoaded', () => {

  console.log('IronGenerator JS imported successfullyddd!');
  
  function cambiar(){
    var pdrs = document.getElementById('file-upload').files[0].name;
    document.getElementById('info').innerHTML = pdrs;
}

    
}, false);

