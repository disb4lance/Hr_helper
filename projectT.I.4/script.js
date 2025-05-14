document.addEventListener('DOMContentLoaded', function() {
    const skillsContainer = document.getElementById('skillsContainer');
    const addSkillBtn = document.getElementById('addSkillBtn');
    const submitBtn = document.getElementById('submitBtn');
    const resultContainer = document.getElementById('resultContainer');
    const resultOutput = document.getElementById('resultOutput');
    
    addSkillField();
    
    addSkillBtn.addEventListener('click', addSkillField);
    
    submitBtn.addEventListener('click', submitSkills);
    
    function addSkillField() {
        const skillGroup = document.createElement('div');
        skillGroup.className = 'skill-input-group';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'skill-input';
        input.placeholder = 'Введите навык...';
        input.autocomplete = 'off';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-skill';
        removeBtn.innerHTML = '×';
        removeBtn.title = 'Удалить поле';
        removeBtn.addEventListener('click', function() {
            if (skillsContainer.querySelectorAll('.skill-input-group').length > 1) {
                skillsContainer.removeChild(skillGroup);
            } else {
                input.value = '';
            }
        });
        
        const autocompleteList = document.createElement('div');
        autocompleteList.className = 'autocomplete-list';
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error';
        
        input.addEventListener('input', function() {
            const value = this.value.trim();
            autocompleteList.innerHTML = '';
            
            if (value.length > 0) {
                const regex = new RegExp(value, 'i');
                const matches = skillsDatabase.filter(skill => regex.test(skill));
                
                if (matches.length > 0) {
                    matches.slice(0, 5).forEach(match => {
                        const item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        item.textContent = match;
                        item.addEventListener('click', function() {
                            input.value = match;
                            autocompleteList.style.display = 'none';
                            validateSkill(input);
                        });
                        autocompleteList.appendChild(item);
                    });
                    autocompleteList.style.display = 'block';
                } else {
                    autocompleteList.style.display = 'none';
                }
            } else {
                autocompleteList.style.display = 'none';
            }
        });
        
        document.addEventListener('click', function(e) {
            if (e.target !== input && e.target !== autocompleteList) {
                autocompleteList.style.display = 'none';
            }
        });
        
        input.addEventListener('blur', function() {
            validateSkill(input);
        });
        
        skillGroup.appendChild(input);
        skillGroup.appendChild(removeBtn);
        skillGroup.appendChild(autocompleteList);
        skillGroup.appendChild(errorMsg);
        skillsContainer.appendChild(skillGroup);
        
        input.focus();
    }
    
    function validateSkill(inputElement) {
        const skillGroup = inputElement.parentElement;
        const errorMsg = skillGroup.querySelector('.error');
        const value = inputElement.value.trim();
        
        if (value === '') {
            errorMsg.textContent = '';
            return false;
        }
        
        if (!skillsDatabase.includes(value)) {
            errorMsg.textContent = 'Такого навыка нет в базе';
            return false;
        } else {
            errorMsg.textContent = '';
            return true;
        }
    }
    
    function submitSkills() {
        const inputs = document.querySelectorAll('.skill-input');
        const skills = [];
        let isValid = true;
        
        inputs.forEach(input => {
            const value = input.value.trim();
            if (value !== '') {
                if (validateSkill(input)) {
                    skills.push(value);
                } else {
                    isValid = false;
                }
            }
        });
        
        if (!isValid) {
            alert('Пожалуйста, исправьте ошибки в введенных навыках');
            return;
        }
        
        if (skills.length === 0) {
            alert('Пожалуйста, введите хотя бы один навык');
            return;
        }
        
        // Отправка запроса на сервер
        sendSkillsToServer(skills);
    }
    
    // Функция для отправки навыков на сервер
    async function sendSkillsToServer(skills) {
        try {
            const response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: skills.join(', ')
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // Отображение результата
            if (result.prediction && result.prediction.length > 0) {
                resultOutput.innerHTML = result.prediction.map(([profession, score]) => 
                    `<div class="profession-item">
                        <span class="profession-name">${profession}</span>
                        <span class="profession-score">${score.toFixed(2)}</span>
                    </div>`
                ).join('');
            } else {
                resultOutput.textContent = 'Подходящие профессии не найдены';
            }
            resultContainer.style.display = 'block';
            
            // Плавная прокрутка к результату
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            alert('Произошла ошибка при отправке запроса на сервер. Пожалуйста, попробуйте позже.');
        }
    }
});