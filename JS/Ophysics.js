  var parameter = {};
    var questiondata;
    var youtubeEmbedUrl;
    var question1;
    var question2;
    var question3;
    var iframe = document.getElementById('vedioUrl');
    var n=1;
    var questionNumber;

    // 使用 jQuery 的 $.get 方法發送 GET 請求
    $.get("https://script.google.com/macros/s/AKfycbyMlsAc7r01-bYvCV025eUTQh0rK88RsYpECZA5Q8uXOPgglembu5hLICEjcX-nhmS8/exec", parameter, function(data) {
      questiondata = data.split(",");
    
     
     questionNumber=questiondata[0];

    youtubeEmbedUrl = 'https://www.youtube.com/embed/' + questiondata[10];
      // 更改 <iframe> 的 src 屬性
     iframe.src = youtubeEmbedUrl;
     //問題的圖片
     document.getElementById('question1').src=questiondata[12];

     document.getElementById('question2').src=questiondata[14];

     document.getElementById('question3').src=questiondata[16];



     

      // 影片結束後顯示問題和按鈕
        questionAppearTime=questiondata[11]*1000;
       setTimeout(function() {
            document.getElementById("Question").style.display="block";
        }, questionAppearTime); // 1分鐘 = 60,000毫秒

         //第一題答案
        q1CorrectAnswer=questiondata[13];
        q2CorrectAnswer=questiondata[15];
        q3CorrectAnswer=questiondata[17];
    });



   
    document.querySelector('iframe').addEventListener('load', function () {
        document.getElementById('videoContainer').style.display = 'block';
    });


    function submitAnswers() {
        // 取得正確的答案
    
        // 取得問題的答案
        var q1Answer = document.querySelector('input[name="q1"]:checked');
        var q2Answer = document.querySelector('input[name="q2"]:checked');
        var q3Answer = document.getElementById('q3Answer').value;



       if (!q1Answer || !q2Answer || q3Answer.trim() === '') {
            alert("請先回答上面的問題");
            return;
        }
        // 在實際應用中，你可能需要進行答案的驗證和處理



       if(q1Answer.value==q1CorrectAnswer&&q2Answer.value==q2CorrectAnswer&&q3Answer.trim().toLowerCase() === q3CorrectAnswer.trim().toLowerCase()){
            alert("答對了");
            

            if(n<questionNumber){


                document.querySelectorAll('input[type="radio"][name="q1"]').forEach(function(radioButton) {
                radioButton.checked = false;
                });

                document.querySelectorAll('input[type="radio"][name="q2"]').forEach(function(radioButton) {
                radioButton.checked = false;
                });

                document.getElementById('q3Answer').value = '';

                youtubeEmbedUrl = 'https://www.youtube.com/embed/' + questiondata[10+9*n];
                   // 更改 <iframe> 的 src 屬性
                   iframe.src = youtubeEmbedUrl;


                document.getElementById("Question").style.display="none";
                questionAppearTime=questiondata[11+9*n]*1000;
                setTimeout(function() {
                document.getElementById("Question").style.display="block";
                }, questionAppearTime); // 1分鐘 = 60,000毫秒

                  
                   document.getElementById('question1').src=questiondata[12+9*n];

                   document.getElementById('question2').src=questiondata[14+9*n];

                   document.getElementById('question3').src=questiondata[16+9*n];

                   q1CorrectAnswer=questiondata[13+9*n];
                   q2CorrectAnswer=questiondata[15+9*n];
                   q3CorrectAnswer=questiondata[17+9*n];

                   n=n+1;

            }else{
                alert("你完成此單元的測驗了");
            }

            


        }else if(q1Answer==""){
            alert("請回答上面三個問題");

        }else{
            alert("答案有誤，請重新作答，或再觀看影片找尋答案!");
        }


    }
