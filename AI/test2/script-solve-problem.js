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

    // 處理圖片預覽
    function previewImage(event) {
        const file = event.target.files[0];
        const uploadArea = document.querySelector('#solve-problem-content #imageContent .upload-area');
        
        // 先清除所有預覽區域
        resetAllPreviews();
        
        // 清除之前的分析結果
        resetAnalysis();

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageDataUrl = e.target.result;
                
                // 確保圖片完全載入後再更新預覽
                const img = new Image();
                img.onload = function() {
                    // 更新上傳區域的預覽
                    uploadArea.innerHTML = `
                        <div class="image-preview" style="margin-bottom: 15px;">
                            <img src="${imageDataUrl}" alt="題目圖片" style="max-width: 100%; border-radius: 8px;">
                        </div>
                        <button class="modern-button secondary" onclick="document.getElementById('uploadImage').click()">
                            更換圖片
                        </button>
                        <input type="file" id="uploadImage" accept="image/*" hidden>
                    `;

                    // 更新底部的預覽區域
                    const preview = document.getElementById('imagePreview');
                    if (preview) {
                        preview.innerHTML = `
                            <img src="${imageDataUrl}" alt="題目圖片" style="max-width: 100%; border-radius: 8px;">
                        `;
                    }

                    // 重新綁定事件監聽器
                    const newInput = document.getElementById('uploadImage');
                    if (newInput) {
                        newInput.addEventListener('change', previewImage);
                        newInput.value = ''; // 清除值以允許選擇相同的圖片
                    }
                };
                img.src = imageDataUrl;
            };
            reader.readAsDataURL(file);
        } else {
            // 重置為初始狀態
            resetToDefault();
        }

        // 重置分析按鈕狀態
        const analyzeButton = document.getElementById('analyzeButton');
        if (analyzeButton) {
            analyzeButton.innerText = '分析題目';
            analyzeButton.disabled = false;
        }
    }

    // 清除所有預覽區域
    function resetAllPreviews() {
        const uploadArea = document.querySelector('#solve-problem-content #imageContent .upload-area');
        const preview = document.getElementById('imagePreview');
        
        if (uploadArea) {
            uploadArea.innerHTML = '';
        }
        if (preview) {
            preview.innerHTML = '';
        }
    }

    // 重置為默認狀態
    function resetToDefault() {
        const uploadArea = document.querySelector('#solve-problem-content #imageContent .upload-area');
        const preview = document.getElementById('imagePreview');
        
        if (uploadArea) {
            uploadArea.innerHTML = `
                <div class="upload-icon">
                    <i class="fas fa-image"></i>
                </div>
                <p class="upload-text">點擊或拖曳上傳題目圖片</p>
                <button class="modern-button secondary" onclick="document.getElementById('uploadImage').click()">
                    選擇圖片
                </button>
                <input type="file" id="uploadImage" accept="image/*" hidden>
            `;
            
            // 重新綁定事件監聽器
            const newInput = document.getElementById('uploadImage');
            if (newInput) {
                newInput.addEventListener('change', previewImage);
                newInput.value = '';
            }
        }
        
        if (preview) {
            preview.innerHTML = '';
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
            if (hintContent) hintContent.innerHTML = '';
        }
        if (showNextHintButton) showNextHintButton.style.display = 'none';

        // 隱藏學習反思區域
        if (reflectionArea) {
            reflectionArea.style.display = 'none';
            if (reflectionContent) reflectionContent.innerHTML = '';
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

    // 重置分析結果
    function resetAnalysis() {
        const resultArea = document.getElementById('resultArea');
        const hintArea = document.getElementById('hintArea');
        const hintContent = document.getElementById('hintContent');
        const showNextHintButton = document.getElementById('showNextHintButton');
        const reflectionArea = document.getElementById('reflectionArea');
        const reflectionContent = document.getElementById('reflectionContent');

        if (resultArea) {
            resultArea.style.display = 'none';
            resultArea.innerHTML = '';
        }
        if (hintArea) {
            hintArea.style.display = 'none';
            hintContent.innerHTML = '';
        }
        if (showNextHintButton) {
            showNextHintButton.style.display = 'none';
        }
        if (reflectionArea) {
            reflectionArea.style.display = 'none';
            reflectionContent.innerHTML = '';
        }

        solutionSteps = [];
        currentStepIndex = 0;
    }

    // 分析輸入
async function analyzeInput() {
    const button = document.getElementById('analyzeButton');

    try {
        // 更改按鈕狀態
        button.innerText = '分析中，請稍候...';
        button.disabled = true;
        
        // 顯示載入提示
        resultArea.style.display = 'block';
        resultArea.innerHTML = '<p class="loading">正在處理...</p>';
        hintArea.style.display = 'none';
        hintContent.innerHTML = '';
        showNextHintButton.style.display = 'none';
        reflectionArea.style.display = 'none';
        reflectionContent.innerHTML = '';
        solutionSteps = [];
        currentStepIndex = 0;

        let payload = {};
        
        // 檢查當前選擇的輸入模式
        const textTab = document.getElementById('textTab');
        const isTextMode = textTab.classList.contains('active');
        
        if (!isTextMode) {
            // 圖片模式
            const uploadArea = document.querySelector('#solve-problem-content #imageContent .upload-area');
            const previewImage = uploadArea.querySelector('.image-preview img');
            
            if (!previewImage) {
                throw new Error('請上傳題目圖片！');
            }

            // 從當前顯示的圖片創建新的 Canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = previewImage.naturalWidth || previewImage.width;
            canvas.height = previewImage.naturalHeight || previewImage.height;
            ctx.drawImage(previewImage, 0, 0);
            
            // 將 Canvas 轉換為 base64
            const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
            
            payload = {
                contents: [{
                    parts: [{
                        text: `請以繁體中文回答，不得使用簡體字。請扮演該領域中具有嚴謹教學素養的資深教師。對於給定的題目，請依照下列格式詳盡解題並確保最終答案與推導過程無誤：
1. 題意分析：清楚解釋題目所問與重點。
2. 相關知識與理論：列出解題所需的正確理論或概念。
3. 解題流程：逐步邏輯推導，不得有不合理跳躍，確保每個步驟正確無誤。
4. 答案：給出唯一正確的答案，並保證答案絕對正確，與前面推導完全一致。
5. 學習反思：提供延伸思考方向或避免錯誤的建議。`
                        }, {
                            inline_data: {
                                mime_type: 'image/jpeg',
                                data: base64Image
                            }
                        }]
                    }]
                };
            } else {
                // 文字模式
                const textContent = textInput.value.trim();
                if (!textContent) {
                    throw new Error('請輸入題目內容！');
                }

                payload = {
                    contents: [{
                        parts: [{
                            text: `請以繁體中文回答。請扮演該領域中具有嚴謹教學素養的資深教師。對於以下題目，請依照以下格式詳盡解題並確保最終答案與推導過程無誤：

1. 題意分析：
2. 相關知識與理論：
3. 解題流程：
4. 答案：
5. 學習反思：

題目內容：${textContent}`
                        }]
                    }]
                };
            }

            const response = await fetch(geminiurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            if (!responseData.candidates || !responseData.candidates[0].content || 
                !responseData.candidates[0].content.parts || !responseData.candidates[0].content.parts[0].text) {
                throw new Error('API 回應格式不正確');
            }

           const answer = responseData.candidates[0].content.parts[0].text;
        console.log('原始回應:', answer);

        // 定義要搜尋的部分
        const parts = {
            '題意分析': '',
            '相關知識與理論': '',
            '解題流程': '',
            '答案': '',
            '學習反思': ''
        };

        // 分割成行
        const lines = answer.split('\n');
        let currentPart = '';

        // 遍歷每一行，找到對應的部分
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            // 檢查是否是新的部分開始
            const partMatch = line.match(/^\d+\.\s*(題意分析|相關知識與理論|解題流程|答案|學習反思)/);
            if (partMatch) {
                currentPart = partMatch[1];
                // 去除標題，只保留冒號後的內容
                const content = line.split(/[：:]/)[1];
                if (content) {
                    parts[currentPart] = content.trim();
                }
            } else if (currentPart && parts[currentPart]) {
                // 將這行加入到當前部分
                parts[currentPart] += '\n' + line;
            }
        }

        // 將內容轉換為陣列
        solutionSteps = Object.values(parts).map(content => content.trim());

        resultArea.innerHTML = '';
        hintArea.style.display = 'block';

        // 顯示第一部分
        if (solutionSteps.every(step => step)) {
            const titles = Object.keys(parts);
            hintContent.innerHTML = `<h3>${titles[0]}</h3><p>${formatText(solutionSteps[0])}</p>`;
            currentStepIndex = 0;
            showNextHintButton.style.display = 'inline-block';
        } else {
            throw new Error('無法正確解析所有部分的內容');
        }

        // 修改下一步按鈕的點擊事件
        showNextHintButton.onclick = function() {
            currentStepIndex++;
            if (currentStepIndex < 5) {
                const titles = Object.keys(parts);
                hintContent.innerHTML = `<h3>${titles[currentStepIndex]}</h3><p>${formatText(solutionSteps[currentStepIndex])}</p>`;
            }

            // 當到達最後一個部分時
            if (currentStepIndex === 4) {
                showNextHintButton.style.display = 'none';
            }
        };

    } catch (error) {
        console.error('分析題目時發生錯誤:', error);
        resultArea.innerHTML = `<p class="error-message">錯誤：${error.message}</p>`;
    } finally {
        button.innerText = '分析題目';
        button.disabled = false;
    }
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
