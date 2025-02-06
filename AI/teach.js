 document.getElementById('imageTab').addEventListener('click', () => switchTab('image'));
            document.getElementById('textTab').addEventListener('click', () => switchTab('text'));

            function switchTab(tab) {
                document.getElementById('imageContent').classList.toggle('active', tab === 'image');
                document.getElementById('textContent').classList.toggle('active', tab === 'text');
                document.getElementById('imageTab').classList.toggle('active', tab === 'image');
                document.getElementById('textTab').classList.toggle('active', tab === 'text');
            }

            document.getElementById('uploadImage').addEventListener('change', previewImage);

            function previewImage(event) {
                const file = event.target.files[0];
                const preview = document.getElementById('imagePreview');
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

            document.getElementById('analyzeButton').addEventListener('click', analyzeInput);

            let solutionSteps = [];
            let currentStepIndex = 0;

            async function analyzeInput() {
                const imageInput = document.getElementById('uploadImage');
                const textInput = document.getElementById('textInput');
                const button = document.getElementById('analyzeButton');
                const resultArea = document.getElementById('resultArea');
                const hintArea = document.getElementById('hintArea');
                const hintContent = document.getElementById('hintContent');
                const showNextHintButton = document.getElementById('showNextHintButton');
                const reflectionArea = document.getElementById('reflectionArea');
                const reflectionContent = document.getElementById('reflectionContent');

                // 重新初始化顯示區塊
                button.innerText = '分析中，請稍候...';
                button.disabled = true;
                resultArea.style.display = 'block';
                resultArea.innerHTML = '<p class="loading">正在處理...</p>';
                hintArea.style.display = 'none';
                hintContent.innerHTML = '';
                showNextHintButton.style.display = 'none';
                reflectionArea.style.display = 'none';
                reflectionContent.innerHTML = '';
                solutionSteps = [];
                currentStepIndex = 0;

                try {
                    let payload = {};
                    if (imageInput.files.length > 0 && document.getElementById('imageContent').classList.contains('active')) {
                        const base64Image = await convertImageToBase64(imageInput.files[0]);
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
                        geminiurl,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(payload),
                        }
                    );

                    const responseData = await response.json();
                    const answer = getNestedValue(responseData, 'text') || '無法獲取解答';

                    // 將回應依序分段
                    const sections = answer.split(/\d\.\s/).filter((section) => section.trim() !== '');
                    // 最後一段視為學習反思
                    const reflectionStep = sections.pop();
                    const stepsWithoutReflection = sections;

                    solutionSteps = stepsWithoutReflection.map(s => s.trim());
                    resultArea.innerHTML = '';
                    hintArea.style.display = 'block';

                    // 顯示第一個提示(題意分析)
                    if (solutionSteps.length > 0) {
                        hintContent.innerHTML = `<p>${formatText(solutionSteps[0])}</p>`;
                        currentStepIndex = 0;
                    }

                    // 若有超過一個步驟，顯示「下一提示」按鈕
                    if (solutionSteps.length > 1) {
                        showNextHintButton.style.display = 'inline-block';
                    }

                    showNextHintButton.onclick = function() {
                        currentStepIndex++;
                        if (currentStepIndex < solutionSteps.length) {
                            hintContent.innerHTML += `<hr><p>${formatText(solutionSteps[currentStepIndex])}</p>`;
                        }

                        // 所有步驟顯示完畢後，顯示學習反思
                        if (currentStepIndex === solutionSteps.length - 1) {
                            showNextHintButton.style.display = 'none';
                            reflectionArea.style.display = 'block';
                            reflectionContent.innerHTML = `<p>${formatText(reflectionStep)}</p>`;
                        }
                    };

                } catch (error) {
                    resultArea.innerHTML = `<p class="loading">錯誤：${error.message}</p>`;
                } finally {
                    button.innerText = '分析題目';
                    button.disabled = false;
                }
            }

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

            async function convertImageToBase64(imageFile) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(imageFile);
                });
            }
        });