  var parameter = {};
    var questiondata;
    var youtubeEmbedUrl;
    var question1;
    var question2;
    var question3;
    var iframe = document.getElementById('vedioUrl');
    var n=1;
    var questionNumber;
    var answerTimes=0;






   
    


    function submitAnswers() {

        answerTimes=answerTimes+1;
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

        document.getElementById('videoContainer').style.display = 'none';
        document.getElementById('restartButton').style.display = 'block';
        document.getElementById("hint").textContent="";
                alert("你完成此單元的測驗了");
                var score=questionNumber/answerTimes*100;
                alert("答對率為"+score.toFixed(2)+" %");

            }

            


        }else if(q1Answer==""){
            alert("請回答上面三個問題");

        }else{
            alert("答案有誤，請重新作答，或再觀看影片找尋答案!");
        }


    }


    function handleSectionClick(section) {
    var sectionTitle = section.textContent; // 獲取節標題的文字內容
    alert('你選擇的單元是：' + sectionTitle); // 彈出選擇的節標題

    parameter={"sectionTitle": sectionTitle};

        // 使用 jQuery 的 $.get 方法發送 GET 請求
    $.get("https://script.google.com/macros/s/AKfycbx6S9WYY36HFdKW6VlDvKgzGlwbKXbXBZSza2k8FrGlwr7h77gm4J1wriBf8fERg_4/exec", parameter, function(data) {
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


    document.getElementById("unitName").textContent=sectionTitle;

    document.getElementById("hint").textContent="題目將於影片結束後出現";

    document.querySelector('iframe').addEventListener('load', function () {
        document.getElementById('videoContainer').style.display = 'block';
    });
  

    document.getElementById("chapterChoose").style.display="none";
  // 隱藏章節
  
   }
