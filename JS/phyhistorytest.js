 var t;
     var x=[];
     var y=[];
     var q=[];
     var starttime;
      
      
     var wrong;
     var questionNumber;
     var questioncontent;
     var answercontent;
      
      sendBtn = $('#sendBtn');
      show = $('#question');
      questionTitle= $('#questionTitle');    
      answer1=$('#answer1');
      answer2=$('#answer2');
      answer3=$('#answer3');
      answer4=$('#answer4');
      chooseAnswer=$('#chooseAnswer');
      correctAnswer=$('#correctAnswer');


   
      
     var times;
     var parameter = {};

     parameter = {
            startRow: x,
            startColumn: 2
                    };
        $.get("https://script.google.com/macros/s/AKfycbzUbcZB6H3X_ZiiYxFHH8dBMNHkrMm3Zm2jZ-7tw-qGgZ3gu6g/exec", parameter, function(data) {
        
              questioncontent=data.split(",");

              $.get("https://script.google.com/macros/s/AKfycbw4O63qhdjUXWsRxY9xrRYc_jIqOLiPjdMD7leVbt4Usrnfb2sg/exec", parameter, function(data) {
     
             answercontent=data.split(","); 
             });       

      });

   
     var myVar=setInterval(function(){myTimer()},10);

    
   

      function rank(){

        var rankdata=[];

        
        $.get("https://script.google.com/macros/s/AKfycbwgVZ6sftnho_eTei7TpjPmdIp_5wWjzdE8hZv6512Qm89EvOWm/exec", parameter, function(data) {
        
               rankdata=data.split(",");
               alert("共玩了:"+rankdata[20]+"次，平均時間:"+rankdata[21]+"秒\n第一名:"+rankdata[0]+"，花了"+rankdata[10]+"秒\n第二名:"+rankdata[1]+"，花了"+rankdata[11]+"秒\n第三名:"+rankdata[2]+"，花了"+rankdata[12]+"秒\n第四名:"+rankdata[3]+"，花了"+rankdata[13]+"秒\n第五名:"+rankdata[4]+"，花了"+rankdata[14]+"秒\n第六名:"+rankdata[5]+"，花了"+rankdata[15]+"秒\n第七名:"+rankdata[6]+"，花了"+rankdata[16]+"秒\n第八名:"+rankdata[7]+"，花了"+rankdata[17]+"秒\n第九名:"+rankdata[8]+"，花了"+rankdata[18]+"秒\n第十名:"+rankdata[9]+"，花了"+rankdata[19]+"秒");
        
      });
         
    }


     sendBtn.on('click',function() {
      if (document.getElementById("username").value==""){
         alert("請輪入姓名"); 
      }else if(document.getElementById("username").value=="看排名"){
        var rankdata=[];
 
        $.get("https://script.google.com/macros/s/AKfycbwgVZ6sftnho_eTei7TpjPmdIp_5wWjzdE8hZv6512Qm89EvOWm/exec", parameter, function(data) {
        
               rankdata=data.split(",");
               alert("共玩了:"+rankdata[20]+"次，平均時間:"+rankdata[21]+"秒\n第一名:"+rankdata[0]+"，花了"+rankdata[10]+"秒\n第二名:"+rankdata[1]+"，花了"+rankdata[11]+"秒\n第三名:"+rankdata[2]+"，花了"+rankdata[12]+"秒\n第四名:"+rankdata[3]+"，花了"+rankdata[13]+"秒\n第五名:"+rankdata[4]+"，花了"+rankdata[14]+"秒\n第六名:"+rankdata[5]+"，花了"+rankdata[15]+"秒\n第七名:"+rankdata[6]+"，花了"+rankdata[16]+"秒\n第八名:"+rankdata[7]+"，花了"+rankdata[17]+"秒\n第九名:"+rankdata[8]+"，花了"+rankdata[18]+"秒\n第十名:"+rankdata[9]+"，花了"+rankdata[19]+"秒");
        });
      }else if(document.getElementById("username").value=="更新成績"){
       $.get("https://script.google.com/a/gish.tyc.edu.tw/macros/s/AKfycbzqJGez7RsHyOGkSpcc7hDx4LQYiBt4q-gvAEiG/exec", {
                       
                    },
                    function (data) {
                       alert("成績已更新!");
                    });
      
      }else if(answercontent==null){
         alert("題目下載中，請再試一次"); 
      }else{
        starttime = new Date();
        clearInterval(myVar);
        myVar=setInterval(function(){myTimer()},10);
 
      function myTimer()
      {
         
        
        document.getElementById("timer").innerHTML="遊戲時間:"+Math.floor((new Date-starttime)/1000+wrong*5)+"秒";
      }

        wrong=0;
        questionNumber=10;
        document.getElementById("username").style.visibility='hidden';
         document.getElementById("forusername").style.display='none';
        
        t=0;
        document.getElementById("spendtime").style.visibility='hidden';
        document.getElementById("spendtime").innerHTML="";
        chooseAnswer.text("");  
        
        
        times=1;

        var index = 1;


        while (index < 11) {


                       var flag = true;
                       var num = Math.floor(Math.random() * questioncontent[0])+2;
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

        var index1=0;

        while (index1 < 4) {


                       var flag = true;
                       var num = Math.floor(Math.random() * 83)+2;
                       for (var i in y) {
                       if (y[i] == num||num==x[times]) {
                       flag = false;
                       }
                       }
                       if (flag == true) {
                       y[index1] = num;
                       index1++;
                       }
                    }



             document.getElementById("sendBtn").style.visibility='hidden';
             
             show.text(questioncontent[x[times]]);
            
     
             y[0]=x[times];
             y=y.sort(function() {return Math.random() - 0.5});

             answer1.text(answercontent[y[0]]);
             answer2.text(answercontent[y[1]]);
             answer3.text(answercontent[y[2]]);
             answer4.text(answercontent[y[3]]);

     
             questionTitle.text("題目"+times);
             chooseAnswer.text("請選擇答案");        
             sendBtn.text("再玩一次");  
             correctAnswer.text(answercontent[x[times]]);

              
        document.getElementById("question").style.visibility='visible';
        document.getElementById("answer").style.visibility='visible'; 
       
     }

     });
         
        
          
         
       
   
   function check(id) { 
     
            if(id.innerHTML==document.getElementById("correctAnswer").innerHTML&&times<10){
              q[times]=x[times];
              times=times+1;
              
              parameter = {
              startRow: x,
              startColumn: 2
             };
      
          document.getElementById("answer").style.visibility='hidden'; 
          document.getElementById("question").style.visibility='hidden';
           //alert("答對了，再來一題");  
          questionTitle.text("題目"+times);
           show.text(questioncontent[x[times]]);
            

            var index1=0;

        while (index1 < 4) {


                       var flag = true;
                       var num = Math.floor(Math.random() * 83)+2;
                       for (var i in y) {
                       if (y[i] == num||num==x[times]) {
                       flag = false;
                       }
                       }
                       if (flag == true) {
                       y[index1] = num;
                       index1++;
                       }
                    }
             y[0]=x[times];
             y=y.sort(function() {return Math.random() - 0.5});
             answer1.text(answercontent[y[0]]);
             answer2.text(answercontent[y[1]]);
             answer3.text(answercontent[y[2]]);
             answer4.text(answercontent[y[3]]);


             questionTitle.text("題目"+times);
             chooseAnswer.text("請選擇答案");        
             
             correctAnswer.text(answercontent[x[times]]);
          
  
          document.getElementById("answer").style.visibility='visible'; 
          document.getElementById("question").style.visibility='visible';  
          
        
         }else if(id.innerHTML==document.getElementById("correctAnswer").innerHTML && times==10){
          q[times]=x[times];
          var gametime=(new Date-starttime)/1000+wrong*5;
          gametime=gametime.toFixed(2);
          var correctRatio=100*(questionNumber-wrong)/questionNumber;
          correctRatio = correctRatio.toFixed(2);
          var gamedata=new Date();

          document.getElementById("answer").style.visibility='hidden'; 
          document.getElementById("question").style.visibility='hidden';
     
          questionTitle.text("");
          show.text("");
          answer1.text("");
          answer2.text("");
          answer3.text("");
          answer4.text("");
          document.getElementById("spendtime").style.visibility='visible';
            $.get("https://script.google.com/macros/s/AKfycbwDmtyIaKjs5UvMjC0ybhXC7PCLGpuSgyQsmUacQWW5hu6O5Bzt/exec", {
                        "name": document.getElementById("username").value,
                        "gamedata":gamedata.getFullYear()+ "/" + (gamedata.getMonth()+1) + "/" + gamedata.getDate()+" "+gamedata.getHours()+":"+gamedata.getMinutes()  ,
                        "gametime":gametime,
                        "correctRatio":correctRatio,
                        "questiondata":q[1]+","+q[2]+","+q[3]+","+q[4]+","+q[5]+","+q[6]+","+q[7]+","+q[8]+","+q[9]+","+q[10]
              
                    },
                    function (data) {
                       
                    });
                    
        

          document.getElementById("spendtime").innerHTML=document.getElementById("username").value+"<br>恭喜你完成測驗，<br>此次測驗共花了"+gametime+"秒，<br>答對率="+correctRatio+"%";
          chooseAnswer.text(""); 
          document.getElementById("playagain").style.display='';
          document.getElementById("rankBtn").style.visibility='visible';  
          
    }else{
      questionNumber=questionNumber+1;
      t=t+500;
      wrong=wrong+1;
      alert("答錯了，遊戲時間+5秒");
    };
        }
