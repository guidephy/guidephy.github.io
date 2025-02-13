// 處理 GET 請求
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('隨身家教')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

// 處理 POST 請求,用於儲存筆記
function doPost(e) {
  try {
    // 解析請求數據
    const { chatLog, username } = e;
    if (!username || !chatLog) {
      throw new Error('缺少必要參數');
    }

    // 取得或創建試算表
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('筆記') || ss.insertSheet('筆記');

    // 添加時間戳記
    const timestamp = new Date().toLocaleString('zh-TW', { 
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // 格式化筆記內容
    const noteContent = `時間：${timestamp}\n\n${chatLog}`;

    // 尋找用戶名對應的列
    const usernameColumn = sheet.getRange("A:A");
    const usernameFinder = usernameColumn.createTextFinder(username).matchEntireCell(true);
    const userRow = usernameFinder.findNext();

    if (!userRow) {
      // 新用戶：在最後一列添加新記錄
      const lastRow = Math.max(sheet.getLastRow(), 1);
      sheet.getRange(lastRow + 1, 1).setValue(username);
      sheet.getRange(lastRow + 1, 2).setValue(noteContent);
    } else {
      // 現有用戶：在該列找到第一個空欄位
      const rowNum = userRow.getRow();
      const row = sheet.getRange(rowNum, 1, 1, sheet.getMaxColumns());
      const rowValues = row.getValues()[0];
      let firstEmptyCol = -1;
      
      for (let i = 1; i < rowValues.length; i++) {
        if (!rowValues[i]) {
          firstEmptyCol = i + 1;
          break;
        }
      }

      // 如果找不到空欄位，就在最後添加一個
      if (firstEmptyCol === -1) {
        firstEmptyCol = rowValues.length + 1;
      }

      sheet.getRange(rowNum, firstEmptyCol).setValue(noteContent);
    }

    return { 
      status: 'success', 
      message: '筆記已成功儲存' 
    };

  } catch (error) {
    return { 
      status: 'error', 
      error: error.toString() 
    };
  }
}

// 獲取特定用戶的所有筆記
function getNotes(username) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('筆記');
    
    if (!sheet) {
      return { 
        status: 'error', 
        error: '找不到筆記頁面' 
      };
    }

    // 尋找用戶名對應的列
    const usernameColumn = sheet.getRange("A:A");
    const usernameFinder = usernameColumn.createTextFinder(username).matchEntireCell(true);
    const userRow = usernameFinder.findNext();

    if (!userRow) {
      return { 
        status: 'error', 
        error: '找不到該用戶的筆記' 
      };
    }

    // 獲取該列所有的筆記
    const rowNum = userRow.getRow();
    const row = sheet.getRange(rowNum, 1, 1, sheet.getMaxColumns());
    const rowValues = row.getValues()[0];

    // 過濾掉空值並格式化筆記
    const notes = rowValues.slice(1).filter(note => note !== '');

    return {
      status: 'success',
      notes: notes
    };

  } catch (error) {
    return {
      status: 'error',
      error: error.toString()
    };
  }
}

// 初始化試算表
function initializeSpreadsheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('筆記') || ss.insertSheet('筆記');
    
    // 設定第一列為標題
    sheet.getRange('A1').setValue('使用者帳號');
    sheet.getRange('B1').setValue('筆記1');
    sheet.getRange('C1').setValue('筆記2');
    sheet.getRange('D1').setValue('筆記3');
    
    // 凍結第一列
    sheet.setFrozenRows(1);
    
    // 設定欄寬
    sheet.setColumnWidth(1, 150); // 帳號欄
    sheet.setColumnWidths(2, sheet.getMaxColumns() - 1, 300); // 筆記欄位
    
    return { 
      status: 'success', 
      message: '試算表初始化完成' 
    };
  } catch (error) {
    return { 
      status: 'error', 
      error: error.toString() 
    };
  }
}


// 儲存測驗結果
function saveTestResult(e) {
  try {
    // 解析請求數據
    const { username, testData } = e;
    if (!username || !testData) {
      throw new Error('缺少必要參數');
    }

    // 取得或創建試算表
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('測驗資料') || ss.insertSheet('測驗資料');

    // 添加時間戳記
    const timestamp = new Date().toLocaleString('zh-TW', { 
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // 格式化測驗內容
    const testContent = `時間：${timestamp}\n\n${testData}`;

    // 尋找用戶名對應的列
    const usernameColumn = sheet.getRange("A:A");
    const usernameFinder = usernameColumn.createTextFinder(username).matchEntireCell(true);
    const userRow = usernameFinder.findNext();

    if (!userRow) {
      // 新用戶：在最後一列添加新記錄
      const lastRow = Math.max(sheet.getLastRow(), 1);
      sheet.getRange(lastRow + 1, 1).setValue(username);
      sheet.getRange(lastRow + 1, 2).setValue(testContent);
    } else {
      // 現有用戶：在該列找到第一個空欄位
      const rowNum = userRow.getRow();
      const row = sheet.getRange(rowNum, 1, 1, sheet.getMaxColumns());
      const rowValues = row.getValues()[0];
      let firstEmptyCol = -1;
      
      for (let i = 1; i < rowValues.length; i++) {
        if (!rowValues[i]) {
          firstEmptyCol = i + 1;
          break;
        }
      }

      // 如果找不到空欄位，就在最後添加一個
      if (firstEmptyCol === -1) {
        firstEmptyCol = rowValues.length + 1;
      }

      sheet.getRange(rowNum, firstEmptyCol).setValue(testContent);
    }

    return { 
      status: 'success', 
      message: '測驗結果已成功儲存' 
    };

  } catch (error) {
    return { 
      status: 'error', 
      error: error.toString() 
    };
  }
}



// 獲取測驗結果題目
function getTestRecords(username) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('測驗資料');
    
    if (!sheet) {
      return { 
        status: 'error', 
        error: '找不到測驗資料頁面' 
      };
    }

    // 尋找用戶名對應的列
    const usernameColumn = sheet.getRange("A:A");
    const usernameFinder = usernameColumn.createTextFinder(username).matchEntireCell(true);
    const userRow = usernameFinder.findNext();

    if (!userRow) {
      return { 
        status: 'error', 
        error: '找不到該用戶的測驗記錄' 
      };
    }

    // 獲取該列所有的測驗記錄
    const rowNum = userRow.getRow();
    const row = sheet.getRange(rowNum, 1, 1, sheet.getMaxColumns());
    const rowValues = row.getValues()[0];

    // 過濾掉空值並解析測驗記錄
    const records = rowValues.slice(1).filter(record => record !== '');
    let allQuestions = [];

    records.forEach(record => {
      const lines = record.split('\n');
      let currentQuestion = null;
      let collectingOptions = false;
      let tempOptions = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('題目：')) {
          if (currentQuestion) {
            currentQuestion.options = tempOptions;
            allQuestions.push(currentQuestion);
          }
          currentQuestion = {
            question: line.split('：')[1].trim(),
            options: [],
            userAnswer: null,
            correctAnswer: null,
            isCorrect: false,
            explanation: ''
          };
          tempOptions = [];
          collectingOptions = true;
        } else if (collectingOptions && line.match(/^[A-D]\./)) {
          tempOptions.push(line.trim());
        } else if (line.startsWith('您的答案：')) {
          collectingOptions = false;
          if (currentQuestion) {
            currentQuestion.userAnswer = line.split('：')[1].trim();
          }
        } else if (line.startsWith('正確答案：')) {
          if (currentQuestion) {
            currentQuestion.correctAnswer = line.split('：')[1].trim();
          }
        } else if (line.startsWith('結果：')) {
          if (currentQuestion) {
            currentQuestion.isCorrect = line.includes('正確');
          }
        } else if (line.startsWith('解釋：')) {
          if (currentQuestion) {
            currentQuestion.explanation = line.split('：')[1].trim();
            currentQuestion.options = tempOptions;
            allQuestions.push(currentQuestion);
            currentQuestion = null;
            tempOptions = [];
          }
        }
      }

      // 處理最後一個題目
      if (currentQuestion) {
        currentQuestion.options = tempOptions;
        allQuestions.push(currentQuestion);
      }
    });

    // 確保每個題目都有選項
    allQuestions = allQuestions.filter(q => q.options && q.options.length === 4);

    // 過濾出錯誤的題目
    const wrongQuestions = allQuestions.filter(q => !q.isCorrect);

    // 印出日誌以檢查解析結果
    console.log('解析後的題目：', JSON.stringify(allQuestions));

    return {
      status: 'success',
      allQuestions: allQuestions,
      wrongQuestions: wrongQuestions
    };

  } catch (error) {
    console.error('處理測驗記錄時出錯：', error);
    return {
      status: 'error',
      error: error.toString()
    };
  }
}
