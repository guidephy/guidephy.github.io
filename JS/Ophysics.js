var parameter = {};
var questiondata;
var youtubeEmbedUrl;
var question1;
var question2;
var question3;
var iframe = document.getElementById('vedioUrl');
var n = 1;
var questionNumber;
var answerTimes = 0;
var score = 0;
var sectionTitle;

function submitAnswers() {
    answerTimes += 1;

    var q1Answer = document.querySelector('input[name="q1"]:checked');
    var q2Answer = document.querySelector('input[name="q2"]:checked');
    var q3Answer = document.getElementById('q3Answer').value.trim();

    if (!q1Answer || !q2Answer || q3Answer === '') {
        alert("請先回答上面的問題");
        return;
    }

    // 验证答案
    if (q1Answer.value === q1CorrectAnswer && q2Answer.value === q2CorrectAnswer && q3Answer.toLowerCase() === q3CorrectAnswer.toLowerCase()) {
        alert("答對了");

        if (n < questionNumber) {
            resetQuestions();

            youtubeEmbedUrl = 'https://www.youtube.com/embed/' + questiondata[10 + 9 * n];
            iframe.src = youtubeEmbedUrl;

            document.getElementById("Question").style.display = "none";
            questionAppearTime = questiondata[11 + 9 * n] * 1000;
            setTimeout(function () {
                document.getElementById("Question").style.display = "block";
            }, questionAppearTime);

            document.getElementById('question1').src = questiondata[12 + 9 * n];
            document.getElementById('question2').src = questiondata[14 + 9 * n];
            document.getElementById('question3').src = questiondata[16 + 9 * n];

            q1CorrectAnswer = questiondata[13 + 9 * n];
            q2CorrectAnswer = questiondata[15 + 9 * n];
            q3CorrectAnswer = questiondata[17 + 9 * n];

            n += 1;
        } else {
            endQuiz();
        }
    } else {
        alert("答案有誤，請重新作答，或再觀看影片找尋答案");
    }
}

function resetQuestions() {
    document.querySelectorAll('input[type="radio"][name="q1"]').forEach(function (radioButton) {
        radioButton.checked = false;
    });
    document.querySelectorAll('input[type="radio"][name="q2"]').forEach(function (radioButton) {
        radioButton.checked = false;
    });
    document.getElementById('q3Answer').value = '';
}

function endQuiz() {
    document.getElementById('videoContainer').style.display = 'none';
    document.getElementById('restartButton').style.display = 'block';
    document.getElementById("hint").textContent = "";
    alert("你完成此單元的測驗");
    score = (questionNumber / answerTimes * 100).toFixed(2);
    alert("答對率為" + score + " %");
}

function handleSectionClick(section) {
    sectionTitle = section.textContent; 
    alert('你選擇的單元是：' + sectionTitle); 

    parameter = { "sectionTitle": sectionTitle };

    $.get("https://script.google.com/macros/s/AKfycbx6S9WYY36HFdKW6VlDvKgzGlwbKXbXBZSza2k8FrGlwr7h77gm4J1wriBf8fERg_4/exec", parameter, function (data) {
        questiondata = data.split(",");
        questionNumber = questiondata[0];

        youtubeEmbedUrl = 'https://www.youtube.com/embed/' + questiondata[10];
        iframe.src = youtubeEmbedUrl;

        document.getElementById('question1').src = questiondata[12];
        document.getElementById('question2').src = questiondata[14];
        document.getElementById('question3').src = questiondata[16];

        questionAppearTime = questiondata[11] * 1000;
        setTimeout(function () {
            document.getElementById("Question").style.display = "block";
        }, questionAppearTime);

        q1CorrectAnswer = questiondata[13];
        q2CorrectAnswer = questiondata[15];
        q3CorrectAnswer = questiondata[17];
    });

    document.getElementById("unitName").textContent = sectionTitle;
    document.getElementById("hint").textContent = "影片讀取中...";

    iframe.addEventListener('load', function () {
        document.getElementById('videoContainer').style.display = 'block';
        document.getElementById("hint").textContent = "題目將於影片結束後出現";
    });

    document.getElementById("chapterChoose").style.display = "none";
}

function scoreData() {
    document.getElementById("registerScore").style.display = "block";
    document.getElementById("restartButton").style.display = "none";
}

function registerScore() {
    var school = document.getElementById('selectSchool').value;
    var className = document.getElementById('class').value;
    var seatNumber = document.getElementById('seat').value;
    var userName = document.getElementById('name').value;

    // 基本防呆：不改 UI，只在缺資料時提示
    if (!sectionTitle) {
        alert("尚未選擇單元，請先選擇單元並完成測驗後再登記。");
        return;
    }
    if (score === 0 || score === "0" || score === "" || score == null) {
        // 你的 score 是在 endQuiz() 才算出來:contentReference[oaicite:2]{index=2}
        alert("尚未產生成績，請完成此單元測驗後再登記。");
        return;
    }
    if (!school || school === "請選擇學校" || !className || !seatNumber || !userName) {
        alert("請完整填寫學校、班級、座號、姓名後再登記。");
        return;
    }

    var url = "https://script.google.com/macros/s/AKfycby4jNSeXw5wVMwD6OUgZQKteaTax3-THO0R5V9c9MPfcRtdS8FaOFfPdIV1LBq4afFi/exec";

    // 同時提供 script 常見的兩種命名：className / class、seatNumber / seat
    // 不影響你現有後端；只提升相容性
    parameter = {
        sectionTitle: sectionTitle,
        score: score,
        school: school,
        className: className,
        "class": className,
        seatNumber: seatNumber,
        seat: seatNumber,
        userName: userName,
        name: userName,
        // 避免瀏覽器快取同一個請求造成「以為沒送出」
        _ts: Date.now()
    };

    // 先用 POST（很多 Apps Script 會只處理 doPost），失敗再 fallback GET（相容你原本邏輯）:contentReference[oaicite:3]{index=3}
    $.ajax({
        url: url,
        method: "POST",
        data: parameter,
        dataType: "text",
        timeout: 15000
    }).done(function (data) {
        alert(data || "登記完成");

        document.getElementById("registerScore").style.display = "none";
        document.getElementById("restartButton").style.display = "block";
        document.getElementById("scoreData").style.display = "none";
        document.getElementById("lookScore").style.display = "block";
    }).fail(function () {
        // POST 失敗 → fallback GET
        $.ajax({
            url: url,
            method: "GET",
            data: parameter,
            dataType: "text",
            timeout: 15000
        }).done(function (data) {
            alert(data || "登記完成");

            document.getElementById("registerScore").style.display = "none";
            document.getElementById("restartButton").style.display = "block";
            document.getElementById("scoreData").style.display = "none";
            document.getElementById("lookScore").style.display = "block";
        }).fail(function (xhr, status, err) {
            // 失敗時給明確訊息（不改 UI，只多一個提示）
            var msg = "登記失敗。";
            if (status) msg += "\n狀態: " + status;
            if (xhr && typeof xhr.status !== "undefined") msg += "\nHTTP: " + xhr.status;
            if (err) msg += "\n錯誤: " + err;
            msg += "\n\n請確認：Apps Script 已部署為 Web App（/exec），並允許任何人存取。";
            alert(msg);
        });
    });
}

