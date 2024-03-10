

    var sectionTitle ;
    var questiondata;


    function handleSectionClick(section) {
    sectionTitle = section.textContent; // 獲取節標題的文字內容
    alert('你選擇的科別是：' + sectionTitle); // 彈出選擇的節標題

    parameter={"sectionTitle": sectionTitle};

       

        // 使用 jQuery 的 $.get 方法發送 GET 請求
    $.get("https://script.google.com/macros/s/AKfycbx70llR9-j9E0Vrv9W4g1b3ORv4g5tBRHSNnxKPsM651Qll1gZjjNTZhSOfOvnOtB6Y/exec", parameter, function(data) {
      

      questiondata = data.split(",");
    
     
    document.getElementById("Question").style.display="block";

    document.getElementById("unitName").textContent=sectionTitle;

    document.getElementById("hint").textContent="請選出各題正確答案";

    document.getElementById("chapterChoose").style.display="none";

    var numQuestions = questiondata[3];

// 獲取題目容器元素
var questionsContainer = document.getElementById('questions-container');

// 生成題目
for (var i = 1; i <= numQuestions; i++) {
    // 創建問題元素
    var questionDiv = document.createElement('div');
    questionDiv.classList.add('question');

    // 添加標題
    var questionTitle = document.createElement('h3');
    questionTitle.textContent = '問題 ' + i;
    questionDiv.appendChild(questionTitle);

    // 添加圖片
    var questionImage = document.createElement('img');
    questionImage.id = 'question' + i;
    questionImage.src = '';
    questionImage.alt = '問題' + i;
    questionDiv.appendChild(questionImage);

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

    alert(data);
  // 隱藏章節
  
  })
   }

   
