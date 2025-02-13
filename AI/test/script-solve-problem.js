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
    let reflectionStep = ''; // 儲存學習反思內容

    // 初始化分析區域
    function initializeAnalysisArea() {
        resultArea.style.display = 'none';
        hintArea.style.display = 'none';
        reflectionArea.style.display = 'none';
        hintContent.innerHTML = '';
        showNextHintButton.style.display = 'none';
        reflectionContent.innerHTML = '';
        solutionSteps = [];
        currentStepIndex = 0;
        reflectionStep = '';
    }

    // 切換分頁
    function switchTab(tab) {
        imageContent.classList.toggle('active', tab === 'image');
        textContent.classList.toggle('active', tab === 'text');
        imageTab.classList.toggle('active', tab === 'image');
        textTab.classList.toggle('active', tab === 'text');

        // 切換分頁時重置所有狀態
        initializeAnalysisArea();
        imagePreview.style.display = 'none';
        imagePreview.innerHTML = '';
        textInput.value = '';
    }

    // 預覽圖片
    function previewImage(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="題目圖片" class="image-preview-img">`;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.innerHTML = '';
            imagePreview.style.display = 'none';
        }
    }

    // 分析輸入 (主要函數)
    async function analyzeInput() {
        // 重置所有顯示狀態
        initializeAnalysisArea();

        const button = document.getElementById('analyzeButton');
        button.innerText = '分析中，請稍候...';
        button.disabled = true;

        try {
            let payload = {};
            if (uploadImage.files.length > 0 && document.getElementById('imageContent').classList.contains('active')) {
                // 圖片模式
                const base64Image = await convertImageToBase64(uploadImage.files[0]);
                payload = {
                    contents: [{
                        parts: [{
                            text: `請以繁體中文回答，不得使用簡體字或英文詞彙。

請扮演該領域中具有嚴謹教學素養的資深教師。對於給定的題目（由圖片或文字提供），請依照下列格式詳盡解題並確保最終答案與推導過程無誤：
1. 題意分析：清楚解釋題目所問與重點。
2. 相關知識與理論：列出解題所需的正確理論或概念。
3. 解題流程：逐步邏輯推導，不得有不合理跳躍，確保每個步驟正確無誤。
4. 答案：給出唯一正確的答案，並保證答案絕對正確，與前面推導完全一致。
5. 學習反思：提供延伸思考方向或避免錯誤的建議。

請務必謹慎檢查，不能有矛盾或錯誤的內容。所有論述必須合理、一致，並以自然流暢的繁體中文呈現。`
                        }, {
                            inline_data: {
                                mime_type: 'image/jpeg',
                                data: base64Image
                            }
                        }]
                    }]
                };
            } else if (textInput.value.trim()) {
                // 文字模式
                payload = {
                    contents: [{
                        parts: [{
                            text: `請以繁體中文回答，不使用簡體字或英文。
                            請扮演該領域中具有嚴謹教學素養的資深教師。對於給定的題目（由圖片或文字提供），請依照下列格式詳盡解題並確保最終答案與推導過程無誤：
                            1. 題意分析：
                            2. 相關知識與理論：
                            3. 解題流程：
                            4. 答案：
                            5. 學習反思：

                            題目內容：${textInput.value.trim()}

                            請詳細分述解題步驟並在最後給出學習反思與延伸建議。`
                        }]
                    }]
                };
            } else {
                alert('請提供圖片或文字內容！');
                button.innerText = '分析題目';
                button.disabled = false;
                return;
            }

            const response = await fetch(geminiurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();
            const answer = getNestedValue(responseData, 'text') || '無法獲取解答';

            // 將回應依序分段
            const sections = answer.split(/\d\.\s/).filter((section) => section.trim() !== '');
            // 最後一段視為學習反思
            reflectionStep = sections.pop();
            solutionSteps = sections.map(s => s.trim());

            // 顯示第一個提示 (題意分析)
            if (solutionSteps.length > 0) {
                resultArea.style.display = 'block';
                hintArea.style.display = 'block';
                hintContent.innerHTML = `<p>${formatText(solutionSteps[0])}</p>`;
                currentStepIndex = 0;

                // 若有超過一個步驟，顯示「下一提示」按鈕
                if (solutionSteps.length > 1) {
                    showNextHintButton.style.display = 'block';
                }
            }

        } catch (error) {
            resultArea.style.display = 'block';
            resultArea.innerHTML = `<p class="loading">錯誤：${error.message}</p>`;
        } finally {
            button.innerText = '分析題目';
            button.disabled = false;
        }
    }

    // 從巢狀物件中取得指定鍵的值
    function getNestedValue(data, key) {
        if (typeof data === 'object' && data !== null) {
            for (const [k, v] of Object.entries(data)) {
                if (k === key) return v;
                const nestedValue = getNestedValue(v, key);
                if (nestedValue) return nestedValue;
            }
        }
        return null;
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

    // 顯示下一個提示
    function setupNextHintButton() {
        showNextHintButton.onclick = function() {
            currentStepIndex++;
            if (currentStepIndex < solutionSteps.length) {
                hintContent.innerHTML += `<hr><p>${formatText(solutionSteps[currentStepIndex])}</p>`;

                // 當所有解題步驟都顯示完後，顯示反思區域
                if (currentStepIndex === solutionSteps.length - 1) {
                    showNextHintButton.style.display = 'none';
                    reflectionArea.style.display = 'block';
                    reflectionContent.innerHTML = `<p>${formatText(reflectionStep)}</p>`;
                }
            }
        };
    }

    // 事件監聽器綁定
    function initializeEventListeners() {
        imageTab.addEventListener('click', () => switchTab('image'));
        textTab.addEventListener('click', () => switchTab('text'));
        uploadImage.addEventListener('change', previewImage);
        analyzeButton.addEventListener('click', analyzeInput);
        setupNextHintButton();
    }

    // 格式化文字
    function formatText(text) {
        if (!text) return '';
        let formatted = text;
        formatted = formatted.replace(/\n/g, '<br>');
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return formatted;
    }

    // 初始化
    function init() {
        initializeEventListeners();
        initializeAnalysisArea();
    }

    // 暴露需要外部訪問的函數
    return {
        init
    };
})();

// 初始化模組
solveProblemModule.init();
