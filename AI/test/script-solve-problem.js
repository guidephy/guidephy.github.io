// script-solve-problem.js (教我解題)

const solveProblemModule = (() => {
    // 獲取 DOM 元素
    const imageTab = document.getElementById('imageTab');
    const textTab = document.getElementById('textTab');
    const imageContent = document.getElementById('imageContent');
    const textContent = document.getElementById('textContent');
    const uploadImage = document.getElementById('uploadImage');
    const imagePreview = document.getElementById('imagePreview');
    const textInput = document.getElementById('textInput');
    const analyzeButton = document.getElementById('analyzeButton');
    const resultArea = document.getElementById('resultArea');
    const hintArea = document.getElementById('hintArea');
    const hintContent = document.getElementById('hintContent');
    const showNextHintButton = document.getElementById('showNextHintButton');
    const reflectionArea = document.getElementById('reflectionArea');
    const reflectionContent = document.getElementById('reflectionContent');

    let solutionSteps = []; // 儲存解題步驟
    let currentStepIndex = 0; // 目前步驟的索引

    // 切換分頁
    function switchTab(tab) {
        // 切換 active 狀態，並根據 tab 參數顯示或隱藏對應的內容
        imageContent.classList.toggle('active', tab === 'image');
        textContent.classList.toggle('active', tab === 'text');
        imageTab.classList.toggle('active', tab === 'image');
        textTab.classList.toggle('active', tab === 'text');
        resetSolveProblemPage(); // 切換 Tab 時重置頁面
    }

    // 預覽圖片
function previewImage(event) {
    const file = event.target.files[0];
    const uploadArea = document.querySelector('#solve-problem-content #imageContent .upload-area');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // 直接替換圖片預覽區域
             imagePreview.innerHTML = `<div class="image-preview"><img src="${e.target.result}" alt="題目圖片" style="max-width: 100%; border-radius: 8px;"></div>`;
        };
        reader.readAsDataURL(file);

        uploadArea.querySelector('.modern-button').style.display = 'none';
        uploadArea.querySelector('.upload-icon').style.display = 'none';
        uploadArea.querySelector('.upload-text').style.display = 'none';
    } else {
      uploadArea.querySelector('.modern-button').style.display = 'inline-block';
      uploadArea.querySelector('.upload-icon').style.display = 'block';
      uploadArea.querySelector('.upload-text').style.display = 'block';
    }
}

    // 重置頁面
    function resetSolveProblemPage() {
        // 重置輸入
        if (uploadImage) uploadImage.value = '';
        if (textInput) textInput.value = '';

        // 重置圖片預覽
        if (imagePreview) imagePreview.innerHTML = '';

        // 隱藏結果區域
        if (resultArea) {
            resultArea.style.display = 'none';
            resultArea.innerHTML = '';
        }

        // 隱藏提示區域
        if (hintArea) {
            hintArea.style.display = 'none';
            hintContent.innerHTML = '';
        }
        if (showNextHintButton) showNextHintButton.style.display = 'none';

        // 隱藏學習反思區域
        if (reflectionArea) {
            reflectionArea.style.display = 'none';
            reflectionContent.innerHTML = '';
        }

        // 重置解題步驟和索引
        solutionSteps = [];
        currentStepIndex = 0;

        // 重置分析按鈕
        if (analyzeButton) {
            analyzeButton.innerText = '分析題目';
            analyzeButton.disabled = false;
        }
    }

    // 分析輸入 (主要函數)
    async function analyzeInput() {
        const button = document.getElementById('analyzeButton');

        // 重新初始化顯示區塊
        button.innerText = '分析中，請稍候...'; // 更改按鈕文字為「分析中，請稍候...」
        button.disabled = true; // 禁用按鈕，防止重複點擊
        resultArea.style.display = 'block'; // 顯示結果區域
        resultArea.innerHTML = '<p class="loading">正在處理...</p>'; // 顯示載入提示
        hintArea.style.display = 'none'; // 隱藏提示區域
        hintContent.innerHTML = ''; // 清空提示內容
        showNextHintButton.style.display = 'none'; // 隱藏「顯示下一提示」按鈕
        reflectionArea.style.display = 'none'; // 隱藏學習反思區域
        reflectionContent.innerHTML = ''; // 清空學習反思內容
        solutionSteps = []; // 清空解題步驟
        currentStepIndex = 0; // 重置目前步驟索引

        try {
            let payload = {}; // 請求的資料
            if (uploadImage.files.length > 0 && document.getElementById('imageContent').classList.contains('active')) {
                // 圖片模式
                const base64Image = await convertImageToBase64(uploadImage.files[0]);
                payload = {
                    contents: [
                        {
                            parts: [
                                {
                                    text: `請以繁體中文回答，不得使用簡體字或英文詞彙。

請扮演該領域中具有嚴謹教學素養的資深教師。對於給定的題目（由圖片或文字提供），請依照下列格式詳盡解題並確保最終答案與推導過程無誤：
1. 題意分析：清楚解釋題目所問與重點。
2. 相關知識與理論：列出解題所需的正確理論或概念。
3. 解題流程：逐步邏輯推導，不得有不合理跳躍，確保每個步驟正確無誤。
4. 答案：給出唯一正確的答案，並保證答案絕對正確，與前面推導完全一致。
5. 學習反思：提供延伸思考方向或避免錯誤的建議。

請務必謹慎檢查，不能有矛盾或錯誤的內容。所有論述必須合理、一致，並以自然流暢的繁體中文呈現。`
                                },
                                {
                                    inline_data: {
                                        mime_type: 'image/jpeg',
                                        data: base64Image
                                    }
                                }
                            ]
                        }
                    ]
                };
            } else if (textInput.value.trim()) {
                // 文字模式
                payload = {
                    contents: [
                        {
                            parts: [
                                {
                                    text: `請以繁體中文回答，不使用簡體字或英文。
                                    請扮演該領域中具有嚴謹教學素養的資深教師。對於給定的題目（由圖片或文字提供），請依照下列格式詳盡解題並確保最終答案與推導過程無誤：
                                    1. 題意分析：
                                    2. 相關知識與理論：
                                    3. 解題流程：
                                    4. 答案：
                                    5. 學習反思：

                                    題目內容：${textInput.value.trim()}

                                    請詳細分述解題步驟並在最後給出學習反思與延伸建議。`
                                }
                            ]
                        }
                    ]
                };
            } else {
                alert('請提供圖片或文字內容！');
                button.innerText = '分析題目';
                button.disabled = false;
                return;
            }

            const response = await fetch(
                geminiurl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            const responseData = await response.json();
            const answer = getNestedValue(responseData, 'text') || '無法獲取解答'; // 獲取解答文字

            // 將回應依序分段
            const sections = answer.split(/\d\.\s/).filter((section) => section.trim() !== '');
            // 最後一段視為學習反思
            const reflectionStep = sections.pop();
            const stepsWithoutReflection = sections;

            solutionSteps = stepsWithoutReflection.map(s => s.trim()); // 儲存解題步驟
            resultArea.innerHTML = ''; // 清空結果區域
            hintArea.style.display = 'block'; // 顯示提示區域

            // 顯示第一個提示 (題意分析)
            if (solutionSteps.length > 0) {
                hintContent.innerHTML = `<p>${formatText(solutionSteps[0])}</p>`;
                currentStepIndex = 0; // 設定目前步驟索引為 0
            }

            // 若有超過一個步驟，顯示「下一提示」按鈕
            if (solutionSteps.length > 1) {
                showNextHintButton.style.display = 'inline-block'; // 顯示「下一提示」按鈕
            }

            // 設定「下一提示」按鈕的點擊事件
            showNextHintButton.onclick = function() {
                currentStepIndex++;
                if (currentStepIndex < solutionSteps.length) {
                    // 顯示下一個步驟，並加上分隔線
                    hintContent.innerHTML += `<hr><p>${formatText(solutionSteps[currentStepIndex])}</p>`;
                }

                // 所有步驟顯示完畢後，顯示學習反思
                if (currentStepIndex === solutionSteps.length - 1) {
                    showNextHintButton.style.display = 'none'; // 隱藏「下一提示」按鈕
                    reflectionArea.style.display = 'block'; // 顯示學習反思區域
                    reflectionContent.innerHTML = `<p>${formatText(reflectionStep)}</p>`; // 顯示學習反思內容
                }
            };

        } catch (error) {
            resultArea.innerHTML = `<p class="loading">錯誤：${error.message}</p>`; // 顯示錯誤訊息
        } finally {
            button.innerText = '分析題目'; // 恢復按鈕文字
            button.disabled = false; // 啟用按鈕
        }
    }

    // 從巢狀物件中取得指定鍵的值
    function getNestedValue(data, key) {
        // 如果 data 是物件且不為 null
        if (typeof data === 'object' && data !== null) {
            for (const [k, v] of Object.entries(data)) { // 遍歷物件的鍵值對
                if (k === key) return v; // 如果找到指定的鍵，則返回對應的值
                const nestedValue = getNestedValue(v, key); // 遞迴尋找巢狀物件
                if (nestedValue) return nestedValue; // 如果找到值，則返回
            }
        }
        return null; // 如果找不到指定的鍵，則返回 null
    }

    // 格式化文字
    function formatText(text) {
        if (!text) return '';
        
        let formatted = text;
        // 移除 Markdown 標題標記 (移除所有的 # 符號和後面的空格)
        formatted = formatted.replace(/^#+\s*/gm, '');
        // 轉換換行符
        formatted = formatted.replace(/\n/g, '<br>');
        // 轉換粗體
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // 去除多餘空白
        formatted = formatted.trim();
        
        return formatted;
    }

    // 將圖片轉換為 Base64
    async function convertImageToBase64(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(imageFile);
        });
    }

    // 初始化模組
    function init() {
        console.log('Initializing Solve Problem Module...');
        
        // 確保所有結果區域一開始是隱藏的
        if (resultArea) resultArea.style.display = 'none';
        if (hintArea) hintArea.style.display = 'none';
        if (reflectionArea) reflectionArea.style.display = 'none';
        
        // 綁定事件監聽器
        if (imageTab) imageTab.addEventListener('click', () => switchTab('image'));
        if (textTab) textTab.addEventListener('click', () => switchTab('text'));
        if (uploadImage) uploadImage.addEventListener('change', previewImage);
        if (analyzeButton) analyzeButton.addEventListener('click', analyzeInput);
        
        // 設置初始狀態
        switchTab('image');
        
        console.log('Solve Problem Module initialized successfully');
    }

    // 返回公開的函數
    return {
        init
    };
})();

// 初始化模組
solveProblemModule.init();
