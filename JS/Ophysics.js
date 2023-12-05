    var parameter = {};
    var questiondata;
    var youtubeEmbedUrl;
    var iframe = document.getElementById('vedioUrl');
    var n=1;

    // 使用 jQuery 的 $.get 方法發送 GET 請求
    $.get("https://script.google.com/macros/s/AKfycbyBbvR9w9_wdQlOVi9h9P8u8iUs0BKNlsOGzZDR3muqRW4yWSKrKhsdB43v4nwaVDpL/exec", parameter, function(data) {
      questiondata = data.split(",");
      
     

    youtubeEmbedUrl = 'https://www.youtube.com/embed/' + questiondata[10];
      // 更改 <iframe> 的 src 屬性
     iframe.src = youtubeEmbedUrl;

      // 影片結束後顯示問題和按鈕
        questionAppearTime=questiondata[11]*1000;
       setTimeout(function() {
            document.getElementById("Question").style.visibility='visible'; ;
        }, questionAppearTime); // 1分鐘 = 60,000毫秒
    });



   
    document.querySelector('iframe').addEventListener('load', function () {
        document.getElementById('videoContainer').style.display = 'block';
    });


    function submitAnswers() {
        // 取得正確的答案
        q1CorrectAnswer="A";
        q2CorrectAnswer="D";
        q3CorrectAnswer="123";
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
            switch (n) {
            case 1:
                   youtubeEmbedUrl = 'https://www.youtube.com/embed/' + questiondata[19];
                   // 更改 <iframe> 的 src 屬性
                   iframe.src = youtubeEmbedUrl;
                   n=n+1;
            break;

            case 2:
                   youtubeEmbedUrl = 'https://www.youtube.com/embed/' + questiondata[28];
                   // 更改 <iframe> 的 src 屬性
                   iframe.src = youtubeEmbedUrl;
                   n=n+1;
            break;

            default:
                alert("做完了");
            }


        }else if(q1Answer==""){
            alert("請回答上面三個問題");

        }else{
            alert("答案有誤，請重新作答，或再觀看影片找尋答案!");
        }


    }
