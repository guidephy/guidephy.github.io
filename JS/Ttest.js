

    var sectionTitle ;
    var questiondata;
    var allQuestionNumber;

    var numQuestions

    var selectedNumbers = []; // 用於存儲選擇的數字

    var correctAnswer=[];

    var score=0;



    function handleSectionClick(section) {
    sectionTitle = section.textContent; // 獲取節標題的文字內容
    alert('你選擇的科別是：' + sectionTitle); // 彈出選擇的節標題

    parameter={"sectionTitle": sectionTitle};

       

        // 使用 jQuery 的 $.get 方法發送 GET 請求
    $.get("https://script.google.com/macros/s/AKfycbwYvmPn1Ae-ahIP2b-VKu63wOQzega35ZQLkhoYqsYw1d2BdpMG3KkPE7t0Yr19UmsM/exec", parameter, function(data) {
      

      questiondata = data.split(",");

     
    document.getElementById("Question").style.display="block";

    document.getElementById("unitName").textContent=sectionTitle;

    document.getElementById("hint").textContent="請選出各題正確答案";

    document.getElementById("chapterChoose").style.display="none";

    allQuestionNumber=questiondata[0];

    allQuestionNumber = parseInt(allQuestionNumber);

    allQuestionNumber=allQuestionNumber-1;

    numQuestions = questiondata[1];


    for (var i = 0; i <= numQuestions; i++) {
    var randomNum;
    do {
        // 生成一個介於 1 到 250 之間的隨機整數
        randomNum = Math.floor(Math.random() *allQuestionNumber) + 1;
    } while (selectedNumbers.includes(randomNum)); // 如果已經選擇過，則重新選擇

    // 將選擇的數字存入數組中
    selectedNumbers.push(randomNum);
    }

    var answer=[];




// 獲取題目容器元素
var questionsContainer = document.getElementById('questions-container');

// 生成題目
for (var i = 1; i <=numQuestions; i++) {

    // 創建問題元素
    var questionDiv = document.createElement('div');
    questionDiv.classList.add('question');

    // 添加標題
    var questionTitle = document.createElement('h3');
    questionTitle.id='questionTitle'+i;
    questionTitle.textContent = '問題 ' + i;
    questionDiv.appendChild(questionTitle);

    // 添加圖片
    var questionImage = document.createElement('img');
    questionImage.id = 'question' + i;
    questionImage.src = questiondata[4*(selectedNumbers[i]-1)+2];
    questionImage.alt = '問題' + i;
    questionDiv.appendChild(questionImage);

    correctAnswer[i]=questiondata[4*(selectedNumbers[i]-1)+3];

    // 添加選項
    var radioContainer = document.createElement('div');
    radioContainer.classList.add('radio-container');
    for (var j = 1; j <= 4; j++) {
        var label = document.createElement('label');
        var input = document.createElement('input');
        input.type = 'radio';
        input.name = 'q' + i;
        input.value = j;
        label.appendChild(input);
        label.appendChild(document.createTextNode(' ' + j));
        radioContainer.appendChild(label);
    }
    questionDiv.appendChild(radioContainer);

    // 添加問題元素到容器中
    questionsContainer.appendChild(questionDiv);

    // 添加一行空白
    questionsContainer.appendChild(document.createElement('br'));

}


  
  })
   }

function submitAnswers() {


   document.getElementById("submitButton").style.display="none";

 var answers = []; // 儲存所有答案的數組

// 遍歷每個問題
for (var i = 1; i <= numQuestions; i++) {
    // 構建查詢器字符串，動態獲取每個問題的答案元素
    var querySelectorString = 'input[name="q' + i + '"]:checked';
    var answer = document.querySelector(querySelectorString);

    // 如果找到了答案元素，將其值添加到答案數組中
    if (answer) {
        answers.push(answer.value);
        if(answer.value==correctAnswer[i]){
            score=score+100/numQuestions;
        }else{
             document.getElementById('questionTitle' + i).classList.add('red-text');
             document.getElementById('questionTitle' + i).textContent = '✗ ' + document.getElementById('questionTitle' + i).textContent+"，原題號:"+selectedNumbers[i]+"，正確答案為:"+correctAnswer[i];
        }
       
    }
}

    alert("本次作答的分數為"+score+"分!");



 
    var userName = document.getElementById('name').value;

    parameter={"sectionTitle": sectionTitle,"score":score,"userName":userName};

    $.get("https://script.google.com/macros/s/AKfycbz_taXoWyTaBTaruJp5eF_-mFDmWFTX6qxBzo8UPnTgaV2R7g17YWQA2QQdiY6SOvYH/exec", parameter, function(data) {
      
    
      alert(data);


      document.getElementById("againButton").style.display="block";
    
    });
    

}


function refreshPage() {
    location.reload(); // 重新整理網頁
}

   
