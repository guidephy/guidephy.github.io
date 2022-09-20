


function sendCheck(){


if(document.getElementById("passcode").value=="iqtsnoyijjbdp"){

document.getElementById("password").style.display='none';
document.getElementById("Btn").style.display='';

}



}


function send() { 

	
	document.getElementById("gradetable").style.display='';

	

	$.get("https://script.google.com/macros/s/AKfycbzu1ux3zWqX4F9AErJSaOsvI2fOZKi2uNtfDQV4F1GzBRCDESI/exec", {
 
         "selectClass":document.getElementById("selectClass").value

     }, function(data) {

     	    gradedata=data.split(",");

                 
            for(var i=3;i<123;i++){
　			document.getElementById(i+100).innerHTML=gradedata[i];
			}
       
      });


}


function addgrade(abc){




$.get("https://script.google.com/macros/s/AKfycbx4bb8KiigE_AQIED1X5axxJ1QxqgkCp8ahvllGUYvr1jPc6kJV/exec", {
 
         "selectClass":document.getElementById("selectClass").value,
         "j":abc.id

     }, function(data) {



     	 alert(document.getElementById(101+3*(abc.id)).innerHTML+"加1分");

         document.getElementById(102+3*(abc.id)).innerHTML=data;

       
      });


}

function minusgrade(abc){




$.get("https://script.google.com/macros/s/AKfycbyYaMUzDMDoLoO168f0a1woWgsyyV2JCEUrivakoBZLb7KL1o8/exec", {
 
         "selectClass":document.getElementById("selectClass").value,
         "j":abc.id-50

     }, function(data) {



         alert(document.getElementById(101+3*(abc.id-50)).innerHTML+"扣1分");

         document.getElementById(102+3*(abc.id-50)).innerHTML=data;

       
      });


}
