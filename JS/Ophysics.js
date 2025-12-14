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

    $.get("https://script.google.com/macros/s/AKfycbypZjEE5Uz9CVZOj4IXEuFcKzxnsTstNa8-jyXNhiWLrvdhA71agZBaD7BB6OvwKTR8/exec", parameter, function (data) {
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

    if (!sectionTitle) {
        alert("尚未選擇單元，請先選擇單元並完成測驗後再登記。");
        return;
    }
    if (score === 0 || score === "0" || score === "" || score == null) {
        alert("尚未產生成績，請完成此單元測驗後再登記。");
        return;
    }
    if (!school || school === "請選擇學校" || !className || !seatNumber || !userName) {
        alert("請完整填寫學校、班級、座號、姓名後再登記。");
        return;
    }

    var url = "https://script.google.com/macros/s/AKfycbypZjEE5Uz9CVZOj4IXEuFcKzxnsTstNa8-jyXNhiWLrvdhA71agZBaD7BB6OvwKTR8/exec";

    // 參數同時給兩套命名，提高相容性
    var parameter = {
        sectionTitle: sectionTitle,
        score: score,
        school: school,
        className: className,
        "class": className,
        seatNumber: seatNumber,
        seat: seatNumber,
        userName: userName,
        name: userName,
        _ts: Date.now()
    };

    // 先嘗試 XHR（如果後端允許跨域且不 redirect，就能看到回應）
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
    }).fail(function () {
        // XHR 被擋（你現在就是這種情況，HTTP 0）→ 用 Beacon / Image 強制送出（不需要 CORS）
        var sent = false;

        // 1) sendBeacon：最穩（POST），但拿不到回應
        try {
            if (navigator.sendBeacon) {
                var body = new URLSearchParams(parameter).toString();
                sent = navigator.sendBeacon(url, new Blob([body], { type: "application/x-www-form-urlencoded" }));
            }
        } catch (e) {}

        // 2) Image GET 備援：同樣不需要 CORS
        if (!sent) {
            try {
                var qs = Object.keys(parameter)
                    .map(function(k){ return encodeURIComponent(k) + "=" + encodeURIComponent(parameter[k]); })
                    .join("&");
                var img = new Image();
                img.src = url + "?" + qs;
                sent = true;
            } catch (e) {}
        }

        if (sent) {
            // 送出成功與否無法由前端確認（因為繞過 CORS），但流程不變
            alert("已送出登記資料（若網路正常，成績將寫入試算表）。");
            document.getElementById("registerScore").style.display = "none";
            document.getElementById("restartButton").style.display = "block";
            document.getElementById("scoreData").style.display = "none";
            document.getElementById("lookScore").style.display = "block";
        } else {
            alert("登記失敗：瀏覽器無法送出請求。請確認網路、或 Apps Script Web App 是否可公開存取。");
        }
    });
}


