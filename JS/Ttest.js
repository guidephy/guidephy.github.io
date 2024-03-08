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
    var score=0;
    var sectionTitle ;





   
    


    function submitAnswers() {

      


    }


    function handleSectionClick(section) {
    sectionTitle = section.textContent; // 獲取節標題的文字內容
    alert('你選擇的科別是：' + sectionTitle); // 彈出選擇的節標題

    parameter={"sectionTitle": sectionTitle};

        // 使用 jQuery 的 $.get 方法發送 GET 請求
    
     

      

    
        document.getElementById("Question").style.display="block";

        

    




    document.getElementById("unitName").textContent=sectionTitle;

    document.getElementById("hint").textContent="請選出各題正確答案";

   
  

    document.getElementById("chapterChoose").style.display="none";
  // 隱藏章節
  
   }

   
