   window.onload = function() {
                const gradeSelect = document.getElementById('grade');
                const questionCountSelect = document.getElementById('questionCount');

                for (let i = 1; i <= 12; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.text = `${i}年級`;
                    gradeSelect.appendChild(option);
                }

                for (let i = 1; i <= 10; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.text = `${i}題`;
                    questionCountSelect.appendChild(option);
                }
            }

            const generateButton = document.getElementById('generateButton');
            generateButton.addEventListener('click', () => {
                if (customTopicTab.classList.contains('active')) {
                    generateQuestions();
                } else {
                    generateQuestionsFromChat();
                }
            });

            let questions = [];

            async function generateQuestionsFromChat() {
                if (thread.length === 0) {
                    alert('目前無聊天記錄，無法使用');
                    return;
                }

                const chatContent = thread.map(entry => {
                    const role = entry.role === 'user' ? '使用者' : '機器人';
                    const message = entry.parts.map(part => part.text).join('\n');
                    return `${role}: ${message}`;
                }).join('\n');

                generateQuestions(chatContent);
            }

            async function generateQuestions(chatContent = '') {
                const button = document.getElementById('generateButton');
                button.innerText = '生成題目中，請稍候...';

                let topic = '';
                let topicText = '';
                let grade = '';
                let questionCount = '';

                if (customTopicTab.classList.contains('active')) {
                    topic = document.getElementById('topic').value;
                    if (!topic) {
                        alert('請填寫主題！');
                        button.innerText = '生成題目';
                        return;
                    }
                    topicText = document.getElementById('topicText').value;
                    grade = document.getElementById('grade').value;
                    questionCount = document.getElementById('questionCount').value;
                } else {
                    topic = '以聊天記錄生成題目';
                    grade = '10';
                    questionCount = '5';
                }

                const conditions = "符合高中學科學習目標，並為該領域專家設計的符合使用者年級並結合生活情境之素養題，並確定選項中一定有答案。";
                const questionsDiv = document.getElementById('questions');
                const quizForm = document.getElementById('quizForm');
                quizForm.style.display = 'none';
                questionsDiv.innerHTML = '<p class="loading">生成題目中，請稍候...</p>';

                try {
                    const response = await fetch(geminiurl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: `請以繁體中文回答，不得使用簡體字或英文詞彙。

請根據下列資訊產生符合學科學習目標的素養題（選擇題）。  
每題有四個選項 (A、B、C、D)，並結合生活情境。  
年級：${grade} 年級  
題目數量：${questionCount} 題  
主題：${topic}  
${chatContent ? `參考文本(聊天紀錄)：${chatContent}` : (topicText ? `參考文本：${topicText}` : '')}

附加條件：${conditions}

重要要求：  
1. 請以自然、通順的繁體中文撰寫題目和選項。  
2. 務必提供唯一正確的答案，以數字0,1,2,3分別對應A,B,C,D選項。  
3. 請確保選項中的正確答案與解釋絕對一致，不得有不合理或矛盾的地方。  
4. 解答說明需明確指出為何該選項正確，其他選項為何不正確，並不得有不合理的論述。  
5. 若引用參考文本或聊天紀錄，需先理解再轉換為素養題，不可直接複製整段文字。  
6. 請自行檢查，保證題目、選項、正確答案及解釋完全匹配且無誤。

請用以下JSON格式回應（不得包含任何英文字詞在選項或題目中，但可保留JSON結構）：  
{
    "questions": [
        {
            "question": "題目",
            "options": ["A選項", "B選項", "C選項", "D選項"],
            "answer": 0,
            "explanation": "解答說明"
        }
    ]
}`
                                }]
                            }]
                        })
                    });

                    const data = await response.json();
                    if (data.candidates && data.candidates[0].content) {
                        const textContent = data.candidates[0].content.parts[0].text;
                        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            const parsedData = JSON.parse(jsonMatch[0]);
                            questions = parsedData.questions.map((q) => {
                                q.options = [...new Set(q.options)]; 
                                return q;
                            });
                            displayQuestions(questions);
                            quizForm.style.display = 'block';
                            quizForm.querySelector('.submit-button').style.display = 'block';
                            document.getElementById('copyContent').style.display = 'block';
                        } else {
                            throw new Error('無法解析回應格式');
                        }
                    } else {
                        throw new Error('API 回應格式不正確');
                    }
                } catch (error) {
                    questionsDiv.innerHTML = `<p class="loading">錯誤：${error.message}</p>`;
                }

                button.innerText = '重新生成題目';
            }

            function displayQuestions(questions) {
                const questionsDiv = document.getElementById('questions');
                questionsDiv.innerHTML = '';

                questions.forEach((q, i) => {
                    const uniqueOptions = [...new Set(q.options)];
                    const formattedOptions = uniqueOptions.map((option, index) => {
                        if (/^[A-D]\.\s/.test(option)) {
                            return option;
                        }
                        return `${['A', 'B', 'C', 'D'][index]}. ${option}`;
                    });

                    const questionHtml = `
                        <div class="question-card">
                            <p><strong>${i + 1}. ${q.question}</strong></p>
                            <div class="question-options">
                                ${formattedOptions.map((option, j) => `
                                    <label>
                                        <input type="radio" name="question${i}" value="${j}" required>
                                        ${option}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    questionsDiv.innerHTML += questionHtml;
                });
            }

            window.checkAnswers = function(event) {
                event.preventDefault();

                const formData = new FormData(document.getElementById('quizForm'));
                const results = [];

                questions.forEach((q, i) => {
                    const userAnswer = formData.get(`question${i}`);
                    const correctAnswer = q.answer;
                    const isCorrect = userAnswer !== null && parseInt(userAnswer) === correctAnswer;

                    results.push({
                        question: q.question,
                        options: q.options,
                        correct: isCorrect,
                        userAnswer: userAnswer !== null ? parseInt(userAnswer) : '未作答',
                        correctAnswer,
                        explanation: q.explanation
                    });
                });

                displayResults(results);
                const submitButton = document.querySelector('#quizForm .submit-button');
                submitButton.style.display = 'none';
            }

            function displayResults(results) {
                const questionsDiv = document.getElementById('questions');
                questionsDiv.innerHTML = results.map((result, i) => `
                    <div class="question-card">
                        <p><strong>${i + 1}. ${result.question}</strong></p>
                        <div class="question-options">
                            ${result.options.map((option, j) => `
                                <label style="background-color: ${j === result.correctAnswer ? '#28a745' : 
                                    (j === result.userAnswer ? '#dc3545' : '#ffffff')};
                                    color: ${j === result.correctAnswer || j === result.userAnswer ? 'white' : '#333'};">
                                    ${['A', 'B', 'C', 'D'][j]}. ${option}
                                </label>
                            `).join('')}
                        </div>
                        <p class="your-answer">您的答案：${result.userAnswer === '未作答' ? result.userAnswer : ['A', 'B', 'C', 'D'][result.userAnswer]} ${result.correct ? '✔️' : '❌'}</p>
                        ${!result.correct ? `<p class="correct-answer">正確答案：${['A', 'B', 'C', 'D'][result.correctAnswer]}</p>` : ''}
                        <p class="explanation">解答說明：${result.explanation}</p>
                    </div>
                `).join('');
            }

            document.getElementById('copyContent').addEventListener('click', copyContent);

            function copyContent() {
                if (questions.length === 0) {
                    alert('請先生成題目！');
                    return;
                }

                let content = '題目列表:\n';
                questions.forEach((q, index) => {
                    content += `${index + 1}. ${q.question}\n`;
                    q.options.forEach((option, i) => {
                        content += `   ${['A', 'B', 'C', 'D'][i]} ${option}\n`;
                    });
                });

                content += '\n正確答案與解答:\n';
                questions.forEach((q, index) => {
                    content += `${index + 1}. 正確答案: ${['A', 'B', 'C', 'D'][q.answer]}\n`;
                    content += `   解答說明: ${q.explanation}\n\n`;
                });

                navigator.clipboard.writeText(content)
                    .then(() => alert('內容已複製到剪貼簿！'))
                    .catch(err => alert('複製失敗：' + err));
            }

            // 以題出題生成
            document.getElementById('uploadQImage').addEventListener('change', previewQImage);
            function previewQImage(event) {
                const file = event.target.files[0];
                const preview = document.getElementById('imageQPreview');
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        preview.innerHTML = `<img src="${e.target.result}" alt="題目圖片" style="max-width: 100%; height: auto; border: 1px solid #ccc; border-radius: 8px;">`;
                    };
                    reader.readAsDataURL(file);
                } else {
                    preview.innerHTML = '';
                }
            }

            document.getElementById('generateFromQButton').addEventListener('click', generateSingleQuestion);

            let singleQuestionData = null;

            async function generateSingleQuestion() {
                const button = document.getElementById('generateFromQButton');
                const singleQuestionDiv = document.getElementById('singleQuestion');
                const singleQuizForm = document.getElementById('singleQuizForm');
                const copyQContent = document.getElementById('copyQContent');

                button.innerText = '生成中，請稍候...';
                button.disabled = true;
                singleQuizForm.style.display = 'none';
                singleQuestionDiv.innerHTML = '<p class="loading">生成題目中，請稍候...</p>';
                copyQContent.style.display = 'none';

                const imageQInput = document.getElementById('uploadQImage');
                const textQInput = document.getElementById('textQInput');

                let payload = {};
                let prompt = `請以繁體中文回答，不得使用簡體字或英文詞彙。

請根據下列資訊產生符合學科學習目標的素養題（選擇題）。  
每題有四個選項，並結合生活情境。  
題目數量：1題  
主題：請扮演該領域中具有嚴謹教學素養的資深教師。對於給定的題目（由圖片或文字提供）解題作為出題靈感，重新設計題目。
重要要求：  
1. 請以自然、通順的繁體中文撰寫題目和選項。  
2. 務必提供唯一正確的答案，以數字0,1,2,3分別對應A,B,C,D選項。  
3. 請確保選項中的正確答案與解釋絕對一致，不得有不合理或矛盾的地方。  
4. 解答說明需明確指出為何該選項正確，其他選項為何不正確，並不得有不合理的論述。  
5. 若引用參考文本或聊天紀錄，需先理解再轉換為素養題，不可直接複製整段文字。  
6. 請自行檢查，保證題目、選項、正確答案及解釋完全匹配且無誤。

請用以下JSON格式回應（不得包含任何英文字詞在選項或題目中，但可保留JSON結構）：  
{
    "questions": [
        {
            "question": "題目",
            "options": ["A選項", "B選項", "C選項", "D選項"],
            "answer": 0,
            "explanation": "解答說明"
        }
    ]
}`;

                try {
                    if (imageQTab.classList.contains('active') && imageQInput.files.length > 0) {
                        const base64Image = await convertImageToBase64(imageQInput.files[0]);
                        payload = {
                            contents: [
                                {
                                    parts: [
                                        {
                                            text: prompt
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
                    } else if (textQTab.classList.contains('active') && textQInput.value.trim()) {
                        payload = {
                            contents: [
                                {
                                    parts: [
                                        {
                                            text: `${prompt}
                                            題目內容：${textQInput.value.trim()}`
                                        }
                                    ]
                                }
                            ]
                        };
                    } else {
                        alert('請提供圖片或文字內容！');
                        button.innerText = '生成題目';
                        button.disabled = false;
                        singleQuestionDiv.innerHTML = '';
                        return;
                    }

                    const response = await fetch(geminiurl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });

                    const data = await response.json();
                    if (data.candidates && data.candidates[0].content) {
                        const textContent = data.candidates[0].content.parts[0].text;
                        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            const parsedData = JSON.parse(jsonMatch[0]);
                            const qList = parsedData.questions.map((q) => {
                                q.options = [...new Set(q.options)]; 
                                return q;
                            });
                            if (qList.length > 0) {
                                singleQuestionData = qList[0];
                                displaySingleQuestion(singleQuestionData);
                                singleQuizForm.style.display = 'block';
                                singleQuizForm.querySelector('.submit-button').style.display = 'block';
                                copyQContent.style.display = 'block';
                            } else {
                                throw new Error('沒有產生題目');
                            }
                        } else {
                            throw new Error('無法解析回應格式');
                        }
                    } else {
                        throw new Error('API 回應格式不正確');
                    }

                } catch (error) {
                    singleQuestionDiv.innerHTML = `<p class="loading">錯誤：${error.message}</p>`;
                }

                button.innerText = '生成題目';
                button.disabled = false;
            }

            function displaySingleQuestion(q) {
                const singleQuestionDiv = document.getElementById('singleQuestion');
                singleQuestionDiv.innerHTML = '';
                const uniqueOptions = [...new Set(q.options)];
                const formattedOptions = uniqueOptions.map((option, index) => {
                    if (/^[A-D]\.\s/.test(option)) {
                        return option;
                    }
                    return `${['A', 'B', 'C', 'D'][index]}. ${option}`;
                });

                const questionHtml = `
                    <div class="question-card">
                        <p><strong>${q.question}</strong></p>
                        <div class="question-options">
                            ${formattedOptions.map((option, j) => `
                                <label>
                                    <input type="radio" name="singleQ" value="${j}" required>
                                    ${option}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `;
                singleQuestionDiv.innerHTML += questionHtml;
            }

            window.checkSingleAnswer = function(event) {
                event.preventDefault();
                if (!singleQuestionData) return;

                const formData = new FormData(document.getElementById('singleQuizForm'));
                const userAnswer = formData.get('singleQ');
                const correctAnswer = singleQuestionData.answer;
                const isCorrect = userAnswer !== null && parseInt(userAnswer) === correctAnswer;

                const singleQuestionDiv = document.getElementById('singleQuestion');
                singleQuestionDiv.innerHTML = `
                    <div class="question-card">
                        <p><strong>${singleQuestionData.question}</strong></p>
                        <div class="question-options">
                            ${singleQuestionData.options.map((option, j) => `
                                <label style="background-color: ${j === correctAnswer ? '#28a745' : 
                                    (j === parseInt(userAnswer) ? '#dc3545' : '#ffffff')};
                                    color: ${j === correctAnswer || j === parseInt(userAnswer) ? 'white' : '#333'};">
                                    ${['A', 'B', 'C', 'D'][j]}. ${option}
                                </label>
                            `).join('')}
                        </div>
                        <p class="your-answer">您的答案：${userAnswer === null ? '未作答' : ['A', 'B', 'C', 'D'][userAnswer]} ${isCorrect ? '✔️' : '❌'}</p>
                        ${!isCorrect ? `<p class="correct-answer">正確答案：${['A', 'B', 'C', 'D'][correctAnswer]}</p>` : ''}
                        <p class="explanation">解答說明：${singleQuestionData.explanation}</p>
                    </div>
                `;

                document.querySelector('#singleQuizForm .submit-button').style.display = 'none';
            }

            document.getElementById('copyQContent').addEventListener('click', copySingleContent);
            function copySingleContent() {
                if (!singleQuestionData) {
                    alert('請先生成題目！');
                    return;
                }

                let content = '題目：\n';
                content += `${singleQuestionData.question}\n`;
                singleQuestionData.options.forEach((option, i) => {
                    content += `   ${['A', 'B', 'C', 'D'][i]} ${option}\n`;
                });

                content += '\n正確答案與解答:\n';
                content += `正確答案: ${['A', 'B', 'C', 'D'][singleQuestionData.answer]}\n`;
                content += `解答說明: ${singleQuestionData.explanation}\n`;

                navigator.clipboard.writeText(content)
                    .then(() => alert('內容已複製到剪貼簿！'))
                    .catch(err => alert('複製失敗：' + err));
            }