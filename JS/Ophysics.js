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
    document.getElementById("hint").textContent = "題目將於影片結束後出現";

    iframe.addEventListener('load', function () {
        document.getElementById('videoContainer').style.display = 'block';
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

    parameter = {
        "sectionTitle": sectionTitle,
        "score": score,
        "school": school,
        "className": className,
        "seatNumber": seatNumber,
        "userName": userName
    };

    $.get("https://script.google.com/macros/s/AKfycby4jNSeXw5wVMwD6OUgZQKteaTax3-THO0R5V9c9MPfcRtdS8FaOFfPdIV1LBq4afFi/exec", parameter, function (data) {
        alert(data);

        document.getElementById("registerScore").style.display = "none";
        document.getElementById("restartButton").style.display = "block";
        document.getElementById("scoreData").style.display = "none";
        document.getElementById("lookScore").style.display = "block";
    });
}
