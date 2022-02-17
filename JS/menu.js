

function myFunction1() {
  if (document.getElementById("myDropdown1").style.visibility=='hidden') {
    document.getElementById("myDropdown1").style.visibility='visible';
  }else{
    document.getElementById("myDropdown1").style.visibility='hidden';
  }
}

function myFunction2() {
    document.getElementById("myDropdown2").classList.toggle("show");
}

function myFunction3() {
    document.getElementById("myDropdown3").classList.toggle("show");
}

function myFunction4() {
    document.getElementById("myDropdown4").classList.toggle("show");
}


// Close the dropdown if the user clicks outside of it
window.onclick = function(e) {
  if (!e.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var d = 0; d < dropdowns.length; d++) {
      var openDropdown = dropdowns[d];
      if (openDropdown.classList.contains('show')) {
        //openDropdown.classList.remove('show');
      }
    }
  }
}
