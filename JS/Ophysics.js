questionAppearTime=5*1000;
    // 影片結束後顯示問題和按鈕
    document.querySelector('iframe').addEventListener('load', function () {
        document.getElementById('videoContainer').style.display = 'block';
    });

       setTimeout(function() {
            document.getElementById("Question").style.visibility='visible'; ;
        }, questionAppearTime); // 1分鐘 = 60,000毫秒

    function submitAnswers() {
        // 取得正確的答案
        q1CorrectAnswer="A";
        q2CorrectAnswer="D";
        q3CorrectAnswer="123";
        // 取得問題的答案
        var q1Answer = document.querySelector('input[name="q1"]:checked');
        var q2Answer = document.querySelector('input[name="q2"]:checked');
        var q3Answer = document.getElementById('q3Answer').value;

        // 在實際應用中，你可能需要進行答案的驗證和處理

       if(q1Answer.value==q1CorrectAnswer&&q2Answer.value==q2CorrectAnswer&&q3Answer.trim().toLowerCase() === q3CorrectAnswer.trim().toLowerCase()){
            alert("答對了");
        }else{
            alert("答案有誤，請重新作答，或再觀看影片找尋答案!");
        }

        // 這裡只是一個簡單的例子，可以在控制台中看到答案
        console.log('問題1答案：', q1Answer ? q1Answer.value : '未選擇');
        console.log('問題2答案：', q2Answer ? q2Answer.value : '未選擇');
        console.log('問題3答案：', q3Answer || '未填寫');
    }
