// script-english-learning.js
const englishLearningModule = (() => {
    // DOM 元素參考
    let mainSelection, 
        levelSelection, 
        scenarioSelection, 
        vocabularyContent, 
        conversationContent,
        loadingSection,
        vocabularyLevel,
        conversationScenario;
    
    // 按鈕元素
    let vocabularyBtn, 
        conversationBtn, 
        levelBtns, 
        scenarioBtns,
        backFromVocabulary,
        backFromConversation,
        newVocabularyContentBtn,
        newConversationContentBtn;

    // 全局變數
    let selectedCategory = '';
    let selectedLevel = '';
    let selectedScenario = '';

    // 初始化 DOM 元素
    function initializeDOMElements() {
        // 主要區域
        mainSelection = document.getElementById('english-main-selection');
        levelSelection = document.getElementById('english-level-selection');
        scenarioSelection = document.getElementById('english-scenario-selection');
        vocabularyContent = document.getElementById('vocabulary-content');
        conversationContent = document.getElementById('conversation-content');
        loadingSection = document.getElementById('english-loading');
        
        // 顯示標籤
        vocabularyLevel = document.getElementById('vocabulary-level');
        conversationScenario = document.getElementById('conversation-scenario');
        
        // 按鈕
        vocabularyBtn = document.getElementById('vocabulary-btn');
        conversationBtn = document.getElementById('conversation-btn');
        levelBtns = document.querySelectorAll('#english-level-selection .modern-button');
        scenarioBtns = document.querySelectorAll('#english-scenario-selection .modern-button');
        backFromVocabulary = document.getElementById('back-from-vocabulary');
        backFromConversation = document.getElementById('back-from-conversation');
        newVocabularyContentBtn = document.getElementById('new-vocabulary-content');
        newConversationContentBtn = document.getElementById('new-conversation-content');
        
        // 檢查必要元素是否存在
        const requiredElements = [
            { element: mainSelection, name: 'mainSelection' },
            { element: levelSelection, name: 'levelSelection' },
            { element: vocabularyBtn, name: 'vocabularyBtn' },
            { element: conversationBtn, name: 'conversationBtn' }
        ];

        const missingElements = requiredElements
            .filter(({ element, name }) => !element)
            .map(({ name }) => name);

        if (missingElements.length > 0) {
            console.error('找不到必要的 DOM 元素:', missingElements.join(', '));
            return false;
        }

        return true;
    }

    // 綁定事件處理函數
    function bindEventHandlers() {
        // 單字學習按鈕點擊事件
        vocabularyBtn.addEventListener('click', () => {
            console.log("單字學習按鈕被點擊");
            selectedCategory = 'vocabulary';
            showLevelSelection();
            vocabularyBtn.classList.add('active');
            conversationBtn.classList.remove('active');
        });

        // 對話練習按鈕點擊事件
        conversationBtn.addEventListener('click', () => {
            console.log("對話練習按鈕被點擊");
            selectedCategory = 'conversation';
            showScenarioSelection();
            conversationBtn.classList.add('active');
            vocabularyBtn.classList.remove('active');
        });

        // 等級選擇按鈕點擊事件
        levelBtns.forEach(btn => {
            btn.addEventListener('click', async function() {
                console.log("等級按鈕點擊:", this.dataset.level);
                const level = this.dataset.level;
                selectedLevel = level;
                loadingSection.style.display = 'block';
                levelSelection.style.display = 'none';

                try {
                    console.log("正在請求 API 內容...");
                    const apiContent = await fetchGeminiContent(level, selectedCategory);
                    console.log("API 內容獲取成功:", apiContent);

                    loadingSection.style.display = 'none';

                    if (apiContent) {
                        updateVocabularyContent(apiContent);
                        vocabularyContent.style.display = 'block';
                        updateLevelDisplay(vocabularyLevel, level);
                        setupAudioElements();
                    } else {
                        console.error("fetchGeminiContent 回傳 null");
                        alert("無法取得AI內容，請稍後再試。");
                        showLevelSelection();
                    }
                } catch (error) {
                    console.error("取得AI內容時發生錯誤:", error);
                    alert("無法取得AI內容，請稍後再試。");
                    loadingSection.style.display = 'none';
                    showLevelSelection();
                }
            });
        });

        // 情境選擇按鈕點擊事件
        scenarioBtns.forEach(btn => {
            btn.addEventListener('click', async function() {
                console.log("情境按鈕點擊:", this.dataset.scenario);
                const scenario = this.dataset.scenario;
                selectedScenario = scenario;
                loadingSection.style.display = 'block';
                scenarioSelection.style.display = 'none';

                try {
                    console.log("正在請求情境對話 API 內容...");
                    const apiContent = await fetchGeminiScenarioContent(scenario);
                    console.log("情境對話 API 內容獲取成功:", apiContent);

                    loadingSection.style.display = 'none';

                    if (apiContent) {
                        updateConversationContent(apiContent);
                        conversationContent.style.display = 'block';
                        updateScenarioDisplay(conversationScenario, scenario);
                        setupAudioElements();
                    } else {
                        console.error("fetchGeminiScenarioContent 回傳 null");
                        alert("無法取得AI內容，請稍後再試。");
                        showScenarioSelection();
                    }
                } catch (error) {
                    console.error("取得AI情境對話內容時發生錯誤:", error);
                    alert("無法取得AI內容，請稍後再試。");
                    loadingSection.style.display = 'none';
                    showScenarioSelection();
                }
            });
        });

        // 返回按鈕點擊事件
        backFromVocabulary.addEventListener('click', () => {
            vocabularyContent.style.display = 'none';
            showMainSelection();
        });

        backFromConversation.addEventListener('click', () => {
            conversationContent.style.display = 'none';
            showMainSelection();
        });

        // 產生新內容按鈕點擊事件
        newVocabularyContentBtn.addEventListener('click', async () => {
            console.log("點擊產生新單字學習內容按鈕");
            loadingSection.style.display = 'block';
            vocabularyContent.style.display = 'none';

            try {
                const apiContent = await fetchGeminiContent(selectedLevel, selectedCategory);
                loadingSection.style.display = 'none';

                if (apiContent) {
                    updateVocabularyContent(apiContent);
                    vocabularyContent.style.display = 'block';
                    setupAudioElements();
                } else {
                    console.error("fetchGeminiContent 回傳 null");
                    alert("無法取得AI內容，請稍後再試。");
                }
            } catch (error) {
                console.error("取得AI內容時發生錯誤:", error);
                alert("無法取得AI內容，請稍後再試。");
                loadingSection.style.display = 'none';
                vocabularyContent.style.display = 'block';
            }
        });

        newConversationContentBtn.addEventListener('click', async () => {
            console.log("點擊產生新對話練習內容按鈕");
            loadingSection.style.display = 'block';
            conversationContent.style.display = 'none';

            try {
                const apiContent = await fetchGeminiScenarioContent(selectedScenario);
                loadingSection.style.display = 'none';

                if (apiContent) {
                    updateConversationContent(apiContent);
                    conversationContent.style.display = 'block';
                    setupAudioElements();
                } else {
                    console.error("fetchGeminiScenarioContent 回傳 null");
                    alert("無法取得AI內容，請稍後再試。");
                }
            } catch (error) {
                console.error("取得AI情境對話內容時發生錯誤:", error);
                alert("無法取得AI內容，請稍後再試。");
                loadingSection.style.display = 'none';
                conversationContent.style.display = 'block';
            }
        });
    }
    // 顯示等級選擇
    function showLevelSelection() {
        console.log("顯示等級選擇");
        mainSelection.style.display = 'none';
        levelSelection.style.display = 'block';
    }

    // 顯示情境選擇
    function showScenarioSelection() {
        console.log("顯示情境選擇");
        mainSelection.style.display = 'none';
        scenarioSelection.style.display = 'block';
    }

    // 顯示主選單
    function showMainSelection() {
        mainSelection.style.display = 'block';
        selectedCategory = '';
        selectedLevel = '';
        selectedScenario = '';
        vocabularyBtn.classList.remove('active');
        conversationBtn.classList.remove('active');
    }

    // 更新等級顯示
    function updateLevelDisplay(element, level) {
        switch (level) {
            case 'a':
                element.textContent = '初級 (A)';
                element.style.backgroundColor = '#3498db';
                break;
            case 'b':
                element.textContent = '中級 (B)';
                element.style.backgroundColor = '#e67e22';
                break;
            case 'c':
                element.textContent = '高級 (C)';
                element.style.backgroundColor = '#9b59b6';
                break;
        }
    }

    // 更新情境顯示
    function updateScenarioDisplay(element, scenario) {
        let bgColor;
        let displayText;

        switch (scenario) {
            case 'school':
                displayText = '學校';
                bgColor = '#2196f3';
                break;
            case 'restaurant':
                displayText = '餐廳';
                bgColor = '#ff9800';
                break;
            case 'travel':
                displayText = '旅遊';
                bgColor = '#4caf50';
                break;
            case 'workplace':
                displayText = '職場';
                bgColor = '#00bcd4';
                break;
            case 'sports':
                displayText = '運動';
                bgColor = '#f44336';
                break;
            case 'hobby':
                displayText = '興趣';
                bgColor = '#9c27b0';
                break;
            case 'chat':
                displayText = '閒聊';
                bgColor = '#3f51b5';
                break;
            case 'festival':
                displayText = '節慶';
                bgColor = '#e91e63';
                break;
            case 'random':
                displayText = '隨機';
                bgColor = '#9e9e9e';
                break;
            default:
                displayText = '對話情境';
                bgColor = '#6772e5';
        }

        element.textContent = displayText;
        element.style.backgroundColor = bgColor;
    }

    // 使用 Web Speech API 播放文字
    function speakText(text, icon, wordElement = null) {
        if ('speechSynthesis' in window) {
            // 先取消任何正在進行的語音
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';

            utterance.onend = function () {
                // 語音播放完成後還原圖標
                if (icon) {
                    icon.classList.remove('fa-volume-high');
                    icon.classList.add('fa-volume-up');
                }
                if (wordElement) {
                    setTimeout(() => {
                        wordElement.removeChild(icon);
                    }, 500);
                }
            };

            // 視覺反饋
            if (icon) {
                icon.classList.remove('fa-volume-up');
                icon.classList.add('fa-volume-high');
            }

            window.speechSynthesis.speak(utterance);
        } else {
            alert('您的瀏覽器不支援語音功能，請更換瀏覽器或更新版本。');
        }
    }

    // 設置音訊播放功能
    function setupAudioElements() {
        console.log("設置音訊元素");
        // 設置單字和整篇文章/對話的語音播放
        const listenElements = document.querySelectorAll('.listen-article, .listen-dialogue, .listen-word');
        listenElements.forEach(element => {
            element.onclick = function() {
                const icon = element.querySelector('i');
                let textToSpeak = '';

                // 判斷要播放什麼文字內容
                if (element.classList.contains('listen-word')) {
                    // 播放單字
                    const parentItem = element.closest('.vocabulary-item');
                    textToSpeak = parentItem.querySelector('.word-english').textContent.trim();
                } else if (element.classList.contains('listen-article')) {
                    // 播放整篇文章
                    const articleContainer = element.closest('.article-container');
                    textToSpeak = articleContainer.querySelector('.article-text').textContent;
                } else if (element.classList.contains('listen-dialogue')) {
                    // 播放整段對話
                    const dialogueContainer = element.closest('.dialogue');
                    textToSpeak = dialogueContainer.querySelector('.dialogue-text').textContent;
                }

                // 播放文字
                speakText(textToSpeak, icon);
            };
        });

        // 設置高亮單字的點擊事件
        const highlightWords = document.querySelectorAll('.highlight');
        highlightWords.forEach(word => {
            word.onclick = function() {
                const wordText = word.textContent;
                // 視覺反饋
                const icon = document.createElement('i');
                icon.className = 'fas fa-volume-high';
                icon.style.marginLeft = '5px';
                icon.style.color = 'var(--primary)';
                word.appendChild(icon);
                speakText(wordText, icon, word);

                // 在單字列表中高亮對應的單字
                const vocabItems = document.querySelectorAll('.vocabulary-item');
                vocabItems.forEach(item => {
                    const itemWord = item.querySelector('.word-english').textContent.trim();
                    if (itemWord === wordText) {
                        item.style.backgroundColor = '#e8f4fc';
                        setTimeout(() => {
                            item.style.backgroundColor = '#f8f9fa';
                        }, 1500);
                    }
                });
            };
        });
    }

    // 創建單字學習的 Gemini API 提示詞
    function createGeminiPrompt(level, type) {
        let cefr = '';
        switch (level) {
            case 'a':
                cefr = 'CEFR A1-A2 初級';
                break;
            case 'b':
                cefr = 'CEFR B1-B2 中級';
                break;
            case 'c':
                cefr = 'CEFR C1-C2 高級';
                break;
        }

        let prompt = `請為${cefr}水平的英語學習者生成一份全新的單字學習內容。請隨機選擇5個適合該水平的單字，確保本次選擇的單字組合與之前的學習內容完全不同，並且盡可能涵蓋不同領域的單字。請為每個單字提供詞性、繁體中文意思、音標和例句。創作一篇包含這些單字的短文，短文的主題也應該是隨機的，避免重複，並在文章中使用不同的時態。文章長度約 50-100 字。

另外，請提供一個重要的文法點及其在文章中的具體例句（完整句子），這樣我們可以在界面上標記這個句子。

重要：請僅回應一個有效的JSON對象，不要包含任何其他文字、解釋或標記。您的回應應該可以直接通過 JSON.parse() 解析。所有中文翻譯和解釋都必須是繁體中文。

JSON格式如下：
{
    "words": [
        {"english": "單字1", "chinese": "繁體中文意思", "pronunciation": "音標", "part_of_speech": "詞性", "example": "例句"},
        {"english": "單字2", "chinese": "繁體中文意思", "pronunciation": "音標", "part_of_speech": "詞性", "example": "例句"},
        {"english": "單字3", "chinese": "繁體中文意思", "pronunciation": "音標", "part_of_speech": "詞性", "example": "例句"},
        {"english": "單字4", "chinese": "繁體中文意思", "pronunciation": "音標", "part_of_speech": "詞性", "example": "例句"},
        {"english": "單字5", "chinese": "繁體中文意思", "pronunciation": "音標", "part_of_speech": "詞性", "example": "例句"}
    ],
    "article": "包含這些單字的短文",
    "grammar_point": {
        "title": "重要文法點標題",
        "explanation": "文法點的繁體中文有效學習說明，包含結構、用法和與文章內容相關的時態說明",
        "example_sentence": "文章中使用該文法的完整句子（這個句子必須出現在文章中）"
    }
}

注意：單字難度應符合${cefr}水平，文章長度應適中（50-100字），文法點應該是文章中使用的一個重要文法概念。所有文法解釋必須是繁體中文，不可使用英文。確保例句是文章中的一個完整句子。`;

        return prompt;
    }
   // 創建情境對話的 Gemini API 提示詞
    function createGeminiScenarioPrompt(scenario) {
        let scenarioDesc = '';
        
        switch (scenario) {
            case 'school':
                scenarioDesc = '學校環境中的對話，可以包括課堂、學生活動、師生互動等';
                break;
            case 'restaurant':
                scenarioDesc = '餐廳環境中的對話，可以包括點餐、用餐、向服務員詢問等';
                break;
            case 'travel':
                scenarioDesc = '旅遊相關的對話，可以包括問路、購票、住宿、景點觀光等';
                break;
            case 'workplace':
                scenarioDesc = '職場環境中的對話，可以包括會議、與同事交流、商務談判等';
                break;
            case 'sports':
                scenarioDesc = '運動相關的對話，可以包括討論運動規則、體育比賽、健身活動等';
                break;
            case 'hobby':
                scenarioDesc = '興趣愛好相關的對話，可以包括音樂、繪畫、攝影、閱讀等';
                break;
            case 'chat':
                scenarioDesc = '日常閒聊的對話，可以包括天氣、最近發生的事情、個人經驗分享等';
                break;
            case 'festival':
                scenarioDesc = '節慶相關的對話，可以包括各種傳統節日、慶祝活動、送禮等';
                break;
            case 'random':
                scenarioDesc = '隨機選擇一個有趣且常見的生活情境，避免與其他類別重複';
                break;
        }

        const prompt = `請為英語學習者生成一份以「${scenarioDesc}」為主題的對話練習內容。請隨機選擇5個與該情境相關且適合日常使用的英語單字，為每個單字提供詞性、繁體中文意思、音標和例句。

然後，請創作一段兩人之間的對話（至少4個來回的對話，共8句以上），主題必須圍繞「${scenarioDesc}」情境，並在對話中自然地使用這些單字。對話內容應簡潔明了，符合真實生活情境。

請同時提供一個重要的文法點及其在對話中的例句（確保該句子出現在對話中）。

重要：請僅回應一個有效的JSON對象，不要包含任何其他文字、解釋或標記。您的回應應該可以直接通過 JSON.parse() 解析。所有中文翻譯和解釋都必須是繁體中文。

JSON格式如下：
{
    "words": [
        {"english": "單字1", "chinese": "繁體中文意思", "pronunciation": "音標", "part_of_speech": "詞性", "example": "例句"},
        {"english": "單字2", "chinese": "繁體中文意思", "pronunciation": "音標", "part_of_speech": "詞性", "example": "例句"},
        {"english": "單字3", "chinese": "繁體中文意思", "pronunciation": "音標", "part_of_speech": "詞性", "example": "例句"},
        {"english": "單字4", "chinese": "繁體中文意思", "pronunciation": "音標", "part_of_speech": "詞性", "example": "例句"},
        {"english": "單字5", "chinese": "繁體中文意思", "pronunciation": "音標", "part_of_speech": "詞性", "example": "例句"}
    ],
    "conversation": [
        {"speaker": "人物A", "text": "對話內容1"},
        {"speaker": "人物B", "text": "對話內容2"},
        {"speaker": "人物A", "text": "對話內容3"},
        {"speaker": "人物B", "text": "對話內容4"}
    ],
    "grammar_point": {
        "title": "重要文法點標題",
        "explanation": "文法點的繁體中文說明，包含結構、用法和與對話內容相關的實用應用",
        "example_sentence": "對話中使用該文法的完整句子（這個句子必須出現在對話中）"
    }
}

注意：確保對話自然流暢，單字使用恰當，並且文法點的例句必須是對話中的一個完整句子。所有文法解釋必須是繁體中文。`;

        return prompt;
    }

    // 使用 Gemini API 獲取單字學習內容
    async function fetchGeminiContent(level, type) {
        const prompt = createGeminiPrompt(level, type);

        try {
            console.log("發送請求到 Gemini API...");

            // 使用全局API URL和相同的請求格式
            const response = await fetch(geminiurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API 請求失敗: ${response.status} - ${errorText}`);
                throw new Error(`API 請求失敗: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("收到 API 回應:", data);

            // 處理 Gemini API 的回應
            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
                const textContent = data.candidates[0].content.parts[0].text;

                // 嘗試解析JSON
                try {
                    const parsedData = JSON.parse(textContent);
                    console.log("成功解析 JSON 回應", parsedData);
                    return parsedData;
                } catch (parseError) {
                    // 嘗試尋找JSON部分
                    console.log("直接解析失敗，嘗試尋找 JSON 部分");
                    const jsonMatch = textContent.match(/\{[\s\S]*\}/);

                    if (jsonMatch) {
                        try {
                            const parsedData = JSON.parse(jsonMatch[0]);
                            console.log("從文本中提取並解析 JSON 成功", parsedData);
                            return parsedData;
                        } catch (extractError) {
                            console.error("無法從文本中提取 JSON:", extractError);
                            console.error("原始文本:", textContent);
                            throw new Error("無法解析 AI 回應中的 JSON");
                        }
                    } else {
                        console.error("回應中找不到 JSON 格式");
                        console.error("原始文本:", textContent);
                        throw new Error("回應中找不到 JSON 格式");
                    }
                }
            } else {
                console.error("API 回應格式不符合預期:", data);
                throw new Error("API 回應格式不符合預期");
            }
        } catch (error) {
            console.error("Gemini API 調用失敗:", error);
            throw error;
        }
    }

    // 使用 Gemini API 獲取情境對話內容
    async function fetchGeminiScenarioContent(scenario) {
        const prompt = createGeminiScenarioPrompt(scenario);

        try {
            console.log("發送情境對話請求到 Gemini API...");

            // 使用全局API URL和相同的請求格式
            const response = await fetch(geminiurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`情境對話 API 請求失敗: ${response.status} - ${errorText}`);
                throw new Error(`情境對話 API 請求失敗: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("收到情境對話 API 回應:", data);

            // 處理回應
            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
                const textContent = data.candidates[0].content.parts[0].text;

                // 嘗試解析JSON
                try {
                    const parsedData = JSON.parse(textContent);
                    console.log("成功解析情境對話 JSON 回應", parsedData);
                    return parsedData;
                } catch (parseError) {
                    // 嘗試尋找JSON部分
                    console.log("直接解析失敗，嘗試尋找 JSON 部分");
                    const jsonMatch = textContent.match(/\{[\s\S]*\}/);

                    if (jsonMatch) {
                        try {
                            const parsedData = JSON.parse(jsonMatch[0]);
                            console.log("從文本中提取並解析情境對話 JSON 成功", parsedData);
                            return parsedData;
                        } catch (extractError) {
                            console.error("無法從文本中提取情境對話 JSON:", extractError);
                            console.error("原始文本:", textContent);
                            throw new Error("無法解析 AI 回應中的情境對話 JSON");
                        }
                    } else {
                        console.error("回應中找不到情境對話 JSON 格式");
                        console.error("原始文本:", textContent);
                        throw new Error("回應中找不到情境對話 JSON 格式");
                    }
                }
            } else {
                console.error("情境對話 API 回應格式不符合預期:", data);
                throw new Error("情境對話 API 回應格式不符合預期");
            }
        } catch (error) {
            console.error("情境對話 Gemini API 調用失敗:", error);
            throw error;
        }
    }
    // 更新單字學習內容
    function updateVocabularyContent(data) {
        console.log("更新單字學習內容", data);
        
        // 檢查數據完整性
        if (!data || !data.article || !data.words || !data.grammar_point) {
            console.error("數據不完整:", data);
            alert("獲取的學習內容不完整，請重試。");
            return;
        }
        
        // 提取文法句子
        const grammarSentence = data.grammar_point.example_sentence.trim();
        console.log("文法句子:", grammarSentence);
        
        // 更新文章，標記單字和文法高亮
        const articleText = document.getElementById('vocabulary-article-text');
        let article = data.article;

        // 移除文章中所有 HTML 標籤
        article = article.replace(/<[^>]*>?/gm, '');
        
        // 如果文章中包含文法句子，使用特殊標記替換它
        let hasHighlightedGrammar = false;
        if (article.includes(grammarSentence)) {
            // 使用特殊標記替換文法句子，以便後續處理
            const marker = "__GRAMMAR_HIGHLIGHT__";
            article = article.replace(grammarSentence, marker);
            hasHighlightedGrammar = true;
        }
        
        // 為文章中的目標單字添加高亮標記
        data.words.forEach(word => {
            const regex = new RegExp(`\\b${word.english}(s|ed|ing)?\\b`, 'gi');
            article = article.replace(regex, match => `<a href="#" class="highlight">${match}</a>`);
        });
        
        // 如果找到了文法句子，處理它的高亮
        if (hasHighlightedGrammar) {
            // 準備高亮版本的文法句子
            let highlightedSentence = grammarSentence;
            
            // 確保文法句子中的單字也被高亮
            data.words.forEach(word => {
                const regex = new RegExp(`\\b${word.english}(s|ed|ing)?\\b`, 'gi');
                highlightedSentence = highlightedSentence.replace(regex, match => `<a href="#" class="highlight">${match}</a>`);
            });
            
            // 將特殊標記替換為帶有文法高亮的句子
            article = article.replace("__GRAMMAR_HIGHLIGHT__", `<span class="grammar-highlight" title="${data.grammar_point.title}">${highlightedSentence}</span>`);
        } else {
            // 如果沒有找到精確匹配的文法句子，嘗試更寬鬆的匹配
            console.log("未找到精確匹配的文法句子，嘗試寬鬆匹配");
            
            // 去除標點符號進行比較
            const cleanGrammar = grammarSentence.replace(/[^\w\s]/g, '').toLowerCase().trim();
            
            // 將文章拆分為句子
            const sentences = article.split(/[.!?]+/).map(s => s.trim());
            
            // 尋找最佳匹配句子
            for (const sentence of sentences) {
                const cleanSentence = sentence.replace(/[^\w\s]/g, '').toLowerCase().trim();
                if (cleanSentence.includes(cleanGrammar) || cleanGrammar.includes(cleanSentence)) {
                    console.log("找到模糊匹配的句子:", sentence);
                    
                    // 完整句子，包括標點符號
                    const fullSentence = sentence + '.';
                    
                    // 替換為高亮版本
                    article = article.replace(fullSentence, `<span class="grammar-highlight" title="${data.grammar_point.title}">${fullSentence}</span>`);
                    hasHighlightedGrammar = true;
                    break;
                }
            }
            
            // 如果仍然沒有找到匹配，在文章末尾添加例句
            if (!hasHighlightedGrammar) {
                console.log("在文章中未找到匹配的文法句子，添加例句區域");
                
                // 準備高亮版本的文法句子
                let highlightedSentence = grammarSentence;
                
                // 確保文法句子中的單字也被高亮
                data.words.forEach(word => {
                    const regex = new RegExp(`\\b${word.english}(s|ed|ing)?\\b`, 'gi');
                    highlightedSentence = highlightedSentence.replace(regex, match => `<a href="#" class="highlight">${match}</a>`);
                });
                
                // 添加例句區域
                article += '\n\n<div style="margin-top:15px;border-top:1px dashed #ccc;padding-top:10px;">';
                article += `<p><strong>文法點示例：</strong> <span class="grammar-highlight" title="${data.grammar_point.title}">${highlightedSentence}</span></p>`;
                article += '</div>';
            }
        }
        
        // 更新DOM
        articleText.innerHTML = article;
        
        // 更新單字列表
        const vocabItems = document.getElementById('vocabulary-items');
        vocabItems.innerHTML = '';

        data.words.forEach(word => {
            const item = document.createElement('div');
            item.className = 'vocabulary-item';
            item.innerHTML = `
                <div class="word-english">${word.english} <i class="fas fa-volume-up listen-word"></i></div>
                <div class="pronunciation">${word.pronunciation}</div>
                <div class="word-part-of-speech">${word.part_of_speech}</div>
                <div class="word-chinese">${word.chinese}</div>
                <div class="word-example">${word.example}</div>
            `;
            vocabItems.appendChild(item);
        });

        // 更新文法重點
        const grammarContent = document.getElementById('vocabulary-grammar');
        grammarContent.innerHTML = '';

        const grammarPoint = document.createElement('div');
        grammarPoint.className = 'grammar-point';
        grammarPoint.innerHTML = `
            <div class="grammar-title">${data.grammar_point.title}</div>
            <div class="grammar-explanation">${data.grammar_point.explanation}</div>
            <div class="grammar-example"><em>例句：</em> <span class="grammar-highlight">${data.grammar_point.example_sentence}</span></div>
        `;
        grammarContent.appendChild(grammarPoint);
    }
    // 更新對話學習內容 
    function updateConversationContent(data) {
        console.log("更新對話學習內容", data);
        
        // 檢查數據完整性
        if (!data) {
            console.error("對話數據為空");
            alert("獲取的對話學習內容為空，請重試。");
            return;
        }
        
        if (!data.conversation || !Array.isArray(data.conversation) || data.conversation.length === 0) {
            console.error("對話數據格式不正確:", data);
            alert("對話數據格式不正確，請重試。");
            return;
        }
        
        if (!data.grammar_point || !data.grammar_point.example_sentence) {
            console.error("文法點數據不完整:", data);
            alert("文法點數據不完整，請重試。");
            return;
        }
        
        // 提取文法句子
        const grammarSentence = data.grammar_point.example_sentence.trim();
        console.log("對話文法句子:", grammarSentence);
        
        // 更新對話
        const dialogueContainer = document.getElementById('dialogue-container');
        dialogueContainer.innerHTML = '';
        
        // 標記哪個對話包含文法句子
        let foundGrammarInDialogue = false;
        
        // 處理對話段落
        data.conversation.forEach((item, index) => {
            const speakerClass = index % 2 === 0 ? 'speaker-a' : 'speaker-b';
            let dialogueText = item.text;
            
            // 移除對話文字中所有 HTML 標籤
            dialogueText = dialogueText.replace(/<[^>]*>?/gm, '');
            
            // 標記是否需要高亮此對話
            let highlightThisDialogue = false;
            
            // 檢查這個對話是否包含文法句子
            if (!foundGrammarInDialogue && dialogueText.includes(grammarSentence)) {
                console.log(`對話 ${index+1} 包含文法句子`);
                highlightThisDialogue = true;
                foundGrammarInDialogue = true;
            }
            
            // 為對話中的目標單字添加高亮標記
            data.words.forEach(word => {
                const regex = new RegExp(`\\b${word.english}(s|ed|ing)?\\b`, 'gi');
                dialogueText = dialogueText.replace(regex, match => `<a href="#" class="highlight">${match}</a>`);
            });
            
            // 如果需要高亮，添加高亮標記
            if (highlightThisDialogue) {
                // 只有包含文法句子的部分需要高亮，而不是整個對話
                // 先檢查精確的文法句子
                if (dialogueText.includes(grammarSentence)) {
                    // 用特殊標記替換文法句子
                    const marker = "__GRAMMAR_HIGHLIGHT__";
                    dialogueText = dialogueText.replace(grammarSentence, marker);
                    
                    // 確保文法句子中的單字也被高亮
                    let highlightedSentence = grammarSentence;
                    data.words.forEach(word => {
                        const regex = new RegExp(`\\b${word.english}(s|ed|ing)?\\b`, 'gi');
                        highlightedSentence = highlightedSentence.replace(regex, match => `<a href="#" class="highlight">${match}</a>`);
                    });
                    
                    // 將特殊標記替換為帶有文法高亮的句子
                    dialogueText = dialogueText.replace(marker, `<span class="grammar-highlight" title="${data.grammar_point.title}">${highlightedSentence}</span>`);
                }
            }
            
            // 創建對話元素
            const dialogue = document.createElement('div');
            dialogue.className = speakerClass;
            dialogue.innerHTML = `
                <div class="speaker">${item.speaker}</div>
                <div class="dialogue">
                    <div class="dialogue-text">${dialogueText}</div>
                    <div class="listen-dialogue">
                        <i class="fas fa-volume-up"></i> 點擊聆聽
                    </div>
                </div>
            `;
            dialogueContainer.appendChild(dialogue);
        });
        
        // 如果沒有找到包含文法句子的對話，嘗試在所有對話中搜尋相似句子
        if (!foundGrammarInDialogue) {
            console.log("未找到完全匹配的文法句子，嘗試模糊匹配");
            
            // 去除標點符號的文法句子
            const cleanGrammar = grammarSentence.replace(/[^\w\s]/g, '').toLowerCase().trim();
            
            // 尋找最佳匹配
            const dialogueTexts = dialogueContainer.querySelectorAll('.dialogue-text');
            let foundMatch = false;
            
            dialogueTexts.forEach(dialogueElement => {
                if (foundMatch) return; // 如果已找到匹配則跳過
                
                const dialogueText = dialogueElement.textContent;
                
                // 將對話拆分為句子
                const sentences = dialogueText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
                
                // 尋找最佳匹配句子
                for (const sentence of sentences) {
                    const cleanSentence = sentence.replace(/[^\w\s]/g, '').toLowerCase().trim();
                    
                    if (cleanSentence.includes(cleanGrammar) || cleanGrammar.includes(cleanSentence)) {
                        console.log("找到模糊匹配的句子:", sentence);
                        
                        // 在對話中高亮該句子
                        let highlightedHtml = dialogueElement.innerHTML;
                        const sentenceWithPunc = sentence + '.'; // 添加標點
                        
                        // 將句子替換為高亮版本
                        highlightedHtml = highlightedHtml.replace(
                            new RegExp(sentenceWithPunc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
                            `<span class="grammar-highlight" title="${data.grammar_point.title}">${sentenceWithPunc}</span>`
                        );
                        
                        dialogueElement.innerHTML = highlightedHtml;
                        foundMatch = true;
                        break;
                    }
                }
            });
            
            // 如果仍然沒有找到匹配，高亮整個第一個對話
            if (!foundMatch && dialogueTexts.length > 0) {
                console.log("未找到匹配句子，高亮第一個對話");
                const firstDialogue = dialogueTexts[0];
                firstDialogue.innerHTML = `<span class="grammar-highlight" title="${data.grammar_point.title}">${firstDialogue.innerHTML}</span>`;
            }
        }
        
        // 更新單字列表
        const vocabItems = document.getElementById('conversation-items');
        vocabItems.innerHTML = '';

        data.words.forEach(word => {
            const item = document.createElement('div');
            item.className = 'vocabulary-item';
            item.innerHTML = `
                <div class="word-english">${word.english} <i class="fas fa-volume-up listen-word"></i></div>
                <div class="pronunciation">${word.pronunciation}</div>
                <div class="word-part-of-speech">${word.part_of_speech}</div>
                <div class="word-chinese">${word.chinese}</div>
                <div class="word-example">${word.example}</div>
            `;
            vocabItems.appendChild(item);
        });

        // 更新文法重點
        const grammarContent = document.getElementById('conversation-grammar');
        grammarContent.innerHTML = '';

        const grammarPoint = document.createElement('div');
        grammarPoint.className = 'grammar-point';
        grammarPoint.innerHTML = `
            <div class="grammar-title">${data.grammar_point.title}</div>
            <div class="grammar-explanation">${data.grammar_point.explanation}</div>
            <div class="grammar-example"><em>例句：</em> <span class="grammar-highlight">${data.grammar_point.example_sentence}</span></div>
        `;
        grammarContent.appendChild(grammarPoint);
    }
    
    // 添加樣式
    function addStyles() {
        // 檢查是否已存在樣式，避免重複添加
        if (document.getElementById('english-learning-styles')) {
            return;
        }
        
        const englishStyles = document.createElement('style');
        englishStyles.id = 'english-learning-styles';
        englishStyles.textContent = `
            /* 英語學習區域 */
            .selection-heading, .level-heading, .scenario-heading {
                margin-bottom: 20px;
                color: #333;
                text-align: center;
            }
            
            .category-buttons, .level-buttons, .scenario-buttons {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .scenario-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 10px;
            }
            
            .content-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .content-level {
                display: inline-block;
                padding: 5px 15px;
                border-radius: 15px;
                color: white;
                font-weight: bold;
            }
            
            .vocabulary-container, .conversation-container {
                background: white;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .article-container, .dialogue-container {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }
            
            .article-text, .dialogue-text {
                line-height: 1.6;
                margin-bottom: 10px;
            }
            
            .listen-article, .listen-dialogue {
                cursor: pointer;
                color: #3498db;
                font-size: 14px;
            }
            
            .listen-article:hover, .listen-dialogue:hover {
                text-decoration: underline;
            }
            
            .vocabulary-list, .grammar-container {
                margin-top: 20px;
            }
            
            .vocabulary-heading, .grammar-heading {
                font-size: 18px;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px dashed #ddd;
            }
            
            .vocabulary-item {
                background: #f8f9fa;
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 5px;
                transition: background-color 0.3s;
            }
            
            .word-english {
                font-size: 18px;
                font-weight: bold;
                color: #333;
                margin-bottom: 5px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .pronunciation {
                font-family: monospace;
                color: #666;
                margin-bottom: 5px;
            }
            
            .word-part-of-speech {
                font-style: italic;
                color: #666;
                margin-bottom: 5px;
            }
            
            .word-chinese {
                font-weight: bold;
                color: #333;
                margin-bottom: 5px;
            }
            
            .word-example {
                color: #333;
                padding-left: 10px;
                border-left: 3px solid #ddd;
                font-style: italic;
            }
            
            .listen-word {
                cursor: pointer;
                color: #3498db;
                font-size: 16px;
            }
            
            .grammar-point {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
            }
            
            .grammar-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
            }
            
            .grammar-explanation {
                line-height: 1.6;
                margin-bottom: 10px;
            }
            
            .grammar-example {
                font-style: italic;
                color: #333;
                padding-left: 10px;
                border-left: 3px solid #ddd;
            }
            
            .highlight {
                background-color: #fffacd;
                padding: 2px 4px;
                border-radius: 3px;
                cursor: pointer;
                text-decoration: none;
                color: #333;
                transition: background-color 0.3s;
            }
            
            .highlight:hover {
                background-color: #fff176;
            }
            
            .grammar-highlight {
                background-color: #e8f4fc;
                padding: 2px 4px;
                border-radius: 3px;
                border-bottom: 2px solid #3498db;
            }
            
            .speaker-a, .speaker-b {
                display: flex;
                margin-bottom: 20px;
            }
            
            .speaker-a {
                justify-content: flex-start;
            }
            
            .speaker-b {
                justify-content: flex-end;
                flex-direction: row-reverse;
            }
            
            .speaker {
                margin: 0 10px;
                align-self: flex-start;
                background: #eee;
                padding: 5px 10px;
                border-radius: 15px;
                font-weight: bold;
            }
            
            .dialogue {
                max-width: 70%;
                background: #f8f9fa;
                padding: 15px;
                border-radius: 10px;
                position: relative;
            }
            
            .speaker-a .dialogue:before {
                content: '';
                position: absolute;
                left: -10px;
                top: 10px;
                border-width: 10px 10px 10px 0;
                border-style: solid;
                border-color: transparent #f8f9fa transparent transparent;
            }
            
            .speaker-b .dialogue:before {
                content: '';
                position: absolute;
                right: -10px;
                top: 10px;
                border-width: 10px 0 10px 10px;
                border-style: solid;
                border-color: transparent transparent transparent #f8f9fa;
            }

            @media (max-width: 768px) {
                .category-buttons, .level-buttons {
                    flex-direction: column;
                    gap: 10px;
                }

                .scenario-buttons {
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                }

                .dialogue {
                    max-width: 85%;
                }
            }
        `;
        document.head.appendChild(englishStyles);
    }
    
    // 初始化功能
    function init() {
        console.log("初始化英語學習模組...");
        
        // 初始化DOM元素
        if (!initializeDOMElements()) {
            console.error('初始化英語學習模組DOM元素失敗');
            return;
        }
        
        // 綁定事件處理函數
        bindEventHandlers();
        
        // 添加自定義 CSS 樣式
        addStyles();
        
        console.log("英語學習模組初始化成功");
    }
    
    // 返回公開的函數
    return {
        init,
        clearImage: () => {
            // 清除圖片預覽的公開接口
            if (imagePreviewContainer) {
                imagePreviewContainer.innerHTML = '';
                imagePreviewContainer.style.display = 'none';
            }
            if (uploadImage) {
                uploadImage.value = '';
            }
        }
    };
})();

// 初始化模組
englishLearningModule.init();