var correctAnswer;
var usernamevalue;
var times;
var parameter;

var questiondata;



var score;

var x=[];

var correctAnswerArray=[];
var choiceAnswerArray=[];
var questionnumber;






var questionexcel=10;

function send() { 

  if (document.getElementById("username").value==""){
         alert("請輪入姓名"); 
      }else if(document.getElementById("selectTest").value=="請選擇練習單元"){
        alert("請選擇練習單元"); 

      }else{

    
    $.get("https://script.google.com/macros/s/AKfycbzMPT8umxfBHTdJ39IJUNdFSXPu1fFB9Er-_gTxpKHIhFJY6GEn/exec", {
         "selectTest": document.getElementById("selectTest").value

     }, function(data) {
        
              questiondata=data.split(",");

              questionnumber=questiondata[0]-1;     

              usernamevalue=document.getElementById("username").value;

                score=0;

                times=1;

        var index = 1;

        while (index < 11) {

                       var flag = true;
                       var num = Math.floor(Math.random() * questionnumber)+1;
                       for (var i in x) {
                       if (x[i] == num) {
                       flag = false;
                       }
                       }
                       if (flag == true) {
                       x[index] = num;
                       index++;
                       }
                    }

        document.getElementById("username").style.display='none';
        document.getElementById("forusername").style.display='none';
        document.getElementById("sendBtn").style.display='none';
        document.getElementById("Btn").style.display='none';

        document.getElementById("question").style.visibility='visible'; 
        document.getElementById("answer").style.visibility='visible'; 


        
        document.getElementById("questionTitle").innerHTML="題目"+times;
        document.getElementById("fromyear").innerHTML="&nbsp&nbsp&nbsp出自"+questiondata[x[times]*questionexcel];
        
        document.getElementById("question").src=questiondata[x[times]*questionexcel+3];

        document.getElementById("chooseAnswer").innerHTML="請選擇答案";

        correctAnswer=questiondata[x[times]*questionexcel+4];


        var answerarray=[questiondata[x[times]*questionexcel+4],questiondata[x[times]*questionexcel+5],questiondata[x[times]*questionexcel+6],questiondata[x[times]*questionexcel+7],questiondata[x[times]*questionexcel+8]];

        answerarray.sort();

        document.getElementById("answer1").innerHTML=answerarray[0];
        document.getElementById("answer2").innerHTML=answerarray[1];
        document.getElementById("answer3").innerHTML=answerarray[2];
        document.getElementById("answer4").innerHTML=answerarray[3];
        document.getElementById("answer5").innerHTML=answerarray[4];


        document.getElementById("q1").src=questiondata[x[1]*questionexcel+3];
        document.getElementById("q2").src=questiondata[x[2]*questionexcel+3];
        document.getElementById("q3").src=questiondata[x[3]*questionexcel+3];
        document.getElementById("q4").src=questiondata[x[4]*questionexcel+3];
        document.getElementById("q5").src=questiondata[x[5]*questionexcel+3];
        document.getElementById("q6").src=questiondata[x[6]*questionexcel+3];
        document.getElementById("q7").src=questiondata[x[7]*questionexcel+3];
        document.getElementById("q8").src=questiondata[x[8]*questionexcel+3];
        document.getElementById("q9").src=questiondata[x[9]*questionexcel+3];
        document.getElementById("q10").src=questiondata[x[10]*questionexcel+3];

        document.getElementById("a1").innerHTML=questiondata[x[1]*questionexcel+4];
        document.getElementById("a2").innerHTML=questiondata[x[2]*questionexcel+4];
        document.getElementById("a3").innerHTML=questiondata[x[3]*questionexcel+4];
        document.getElementById("a4").innerHTML=questiondata[x[4]*questionexcel+4];
        document.getElementById("a5").innerHTML=questiondata[x[5]*questionexcel+4];
        document.getElementById("a6").innerHTML=questiondata[x[6]*questionexcel+4];
        document.getElementById("a7").innerHTML=questiondata[x[7]*questionexcel+4];
        document.getElementById("a8").innerHTML=questiondata[x[8]*questionexcel+4];
        document.getElementById("a9").innerHTML=questiondata[x[9]*questionexcel+4];
        document.getElementById("a10").innerHTML=questiondata[x[10]*questionexcel+4];

        document.getElementById("ad1").href=questiondata[x[1]*questionexcel+9];
        document.getElementById("ad2").href=questiondata[x[2]*questionexcel+9];
        document.getElementById("ad3").href=questiondata[x[3]*questionexcel+9];
        document.getElementById("ad4").href=questiondata[x[4]*questionexcel+9];
        document.getElementById("ad5").href=questiondata[x[5]*questionexcel+9];
        document.getElementById("ad6").href=questiondata[x[6]*questionexcel+9];
        document.getElementById("ad7").href=questiondata[x[7]*questionexcel+9];
        document.getElementById("ad8").href=questiondata[x[8]*questionexcel+9];
        document.getElementById("ad9").href=questiondata[x[9]*questionexcel+9];
        document.getElementById("ad10").href=questiondata[x[10]*questionexcel+9];
 
             
      });




           
        


      }
}

 

 
 function check(id) { 

    choiceAnswerArray[times]=id.innerHTML;
    document.getElementById(times).innerHTML=id.innerHTML;


    if(id.innerHTML==correctAnswer&&times<10){
      
      score=score+10;

      times=times+1;

       
      

        document.getElementById("questionTitle").innerHTML="題目"+times;
        document.getElementById("fromyear").innerHTML="&nbsp&nbsp&nbsp出自"+questiondata[x[times]*questionexcel];
        
        document.getElementById("question").src=questiondata[x[times]*questionexcel+3];

        document.getElementById("chooseAnswer").innerHTML="請選擇答案";

        correctAnswer=questiondata[x[times]*questionexcel+4];

        var answerarray=[questiondata[x[times]*questionexcel+4],questiondata[x[times]*questionexcel+5],questiondata[x[times]*questionexcel+6],questiondata[x[times]*questionexcel+7],questiondata[x[times]*questionexcel+8]];
        answerarray.sort();
        document.getElementById("answer1").innerHTML=answerarray[0];
        document.getElementById("answer2").innerHTML=answerarray[1];
        document.getElementById("answer3").innerHTML=answerarray[2];
        document.getElementById("answer4").innerHTML=answerarray[3];
        document.getElementById("answer5").innerHTML=answerarray[4];

    }else if (id.innerHTML==correctAnswer&&times==10) {

    score=score+10;
    
    alert("完成測驗");

     var gametime=new Date();

     $.get("https://script.google.com/macros/s/AKfycbzPf_3QE5-pPyjEhv42hnw5_mglVWhEf7E_pnIZ/exec", {
         "name": document.getElementById("username").value,
         "gametime":gametime,
         "gamescore":score,
         "selectTest":document.getElementById("selectTest").value

     }, function(data) {
        
             alert("成績已登記");
             
      });
    document.getElementById("score").innerHTML="本次測驗得分:"+score+"分"


    document.getElementById("questionTitle").style.display='none';
    document.getElementById("fromyear").style.display='none';
    document.getElementById("question").style.display='none';
    document.getElementById("chooseAnswer").style.display='none';
    document.getElementById("answer").style.display='none';
    document.getElementById("score").style.visibility='visible'; 
    document.getElementById("testtable").style.visibility='visible';

   



    }else if (times==10) {

    
    alert("完成測驗");

     var gametime=new Date();

     $.get("https://script.google.com/macros/s/AKfycbzPf_3QE5-pPyjEhv42hnw5_mglVWhEf7E_pnIZ/exec", {
         "name": document.getElementById("username").value,
         "gametime":gametime,
         "gamescore":score,
         "selectTest":document.getElementById("selectTest").value

     }, function(data) {
        
             alert("成績已登記");
             
      });
    

    document.getElementById("score").innerHTML="本次測驗得分:"+score+"分";

    var gametime=new Date();

    


    document.getElementById("questionTitle").style.display='none';
    document.getElementById("fromyear").style.display='none';
    document.getElementById("question").style.display='none';
    document.getElementById("chooseAnswer").style.display='none';
    document.getElementById("answer").style.display='none';
    document.getElementById("score").style.visibility='visible';
    document.getElementById("testtable").style.visibility='visible';

    }else{
    
    times=times+1;
      

        document.getElementById("questionTitle").innerHTML="題目"+times;
        document.getElementById("fromyear").innerHTML="&nbsp&nbsp&nbsp出自"+questiondata[x[times]*questionexcel];
        
        document.getElementById("question").src=questiondata[x[times]*questionexcel+3];

        document.getElementById("chooseAnswer").innerHTML="請選擇答案";

        correctAnswer=questiondata[x[times]*questionexcel+4];

        var answerarray=[questiondata[x[times]*questionexcel+4],questiondata[x[times]*questionexcel+5],questiondata[x[times]*questionexcel+6],questiondata[x[times]*questionexcel+7],questiondata[x[times]*questionexcel+8]];
        answerarray.sort();
        document.getElementById("answer1").innerHTML=answerarray[0];
        document.getElementById("answer2").innerHTML=answerarray[1];
        document.getElementById("answer3").innerHTML=answerarray[2];
        document.getElementById("answer4").innerHTML=answerarray[3];
        document.getElementById("answer5").innerHTML=answerarray[4];
    }
 }
