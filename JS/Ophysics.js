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



       if (!q1Answer || !q2Answer || q3Answer.trim() === '') {
            alert("請先回答上面的問題");
            return;
        }
        // 在實際應用中，你可能需要進行答案的驗證和處理



       if(q1Answer.value==q1CorrectAnswer&&q2Answer.value==q2CorrectAnswer&&q3Answer.trim().toLowerCase() === q3CorrectAnswer.trim().toLowerCase()){
            alert("答對了");
        }else if(q1Answer==""){
            alert("請回答上面三個問題");

        }else{
            alert("答案有誤，請重新作答，或再觀看影片找尋答案!");
        }


    }
