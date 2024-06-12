document.addEventListener('DOMContentLoaded', () => {
    const listForm = document.getElementById('listForm');
    const listNameInput = document.getElementById('listName');
    const listContainer = document.getElementById('listContainer');
    const wordForm = document.getElementById('wordForm');
    const wordList = document.getElementById('wordList');
    const testButton = document.getElementById('testButton');
    const testArea = document.getElementById('testArea');
    const testWord = document.getElementById('testWord');
    const remainingCount = document.getElementById('remainingCount');
    const userAnswer = document.getElementById('userAnswer');
    const submitAnswer = document.getElementById('submitAnswer');
    const result = document.getElementById('result');
    
    let lists = JSON.parse(localStorage.getItem('lists')) || {};
    let selectedList = null;
    let shuffledWords = [];
    let currentWordIndex = 0;
    let correctCount = 0;
    let incorrectWords = [];

    const saveLists = () => {
        localStorage.setItem('lists', JSON.stringify(lists));
    };

    const updateListSelect = () => {
        listContainer.innerHTML = '';
        Object.keys(lists).forEach(listName => {
            const div = document.createElement('div');
            div.className = 'list-item';
            const listButton = document.createElement('button');
            listButton.textContent = listName;
            listButton.addEventListener('click', () => {
                selectedList = listName;
                wordForm.style.display = 'block';
                testButton.style.display = 'block';
                displayWords(listName);
            });
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '삭제';
            deleteButton.className = 'delete-list';
            deleteButton.addEventListener('click', () => {
                if (confirm(`${listName} 리스트를 삭제하시겠습니까?`)) {
                    delete lists[listName];
                    saveLists();
                    updateListSelect();
                    wordForm.style.display = 'none';
                    testButton.style.display = 'none';
                    wordList.innerHTML = '';
                }
            });
            div.appendChild(listButton);
            div.appendChild(deleteButton);
            listContainer.appendChild(div);
        });
    };

    const displayWords = (listName) => {
        wordList.innerHTML = '';
        const words = lists[listName] || [];
        words.forEach(({ word, meaning }, index) => {
            const li = document.createElement('li');
            li.textContent = `${word} - ${meaning}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '삭제';
            deleteButton.className = 'delete';
            deleteButton.addEventListener('click', () => {
                lists[listName].splice(index, 1);
                saveLists();
                displayWords(listName);
            });
            li.appendChild(deleteButton);
            wordList.appendChild(li);
        });
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const updateRemainingCount = () => {
        remainingCount.textContent = `남은 문제: ${shuffledWords.length - currentWordIndex}`;
    };

    const displayNextWord = () => {
        if (currentWordIndex < shuffledWords.length) {
            testWord.textContent = shuffledWords[currentWordIndex].word;
            testArea.style.display = 'block';
            result.textContent = '';
            userAnswer.value = '';
            userAnswer.focus();
            updateRemainingCount();
        } else {
            const params = new URLSearchParams();
            params.append('correctCount', correctCount);
            params.append('totalCount', shuffledWords.length);
            params.append('incorrectWords', JSON.stringify(incorrectWords));
            window.location.href = `results.html?${params.toString()}`;
        }
    };

    const checkAnswer = () => {
        const currentWord = testWord.textContent;
        const answer = userAnswer.value;
        const correctMeaning = shuffledWords[currentWordIndex].meaning;
        if (answer.trim() === correctMeaning.trim()) {
            correctCount++;
            result.textContent = '정답입니다!';
            result.style.color = 'green';
        } else {
            result.textContent = `틀렸습니다. 정답은 ${correctMeaning} 입니다.`;
            result.style.color = 'red';
            incorrectWords.push(shuffledWords[currentWordIndex]);
        }
        currentWordIndex++;
        setTimeout(displayNextWord, 1000);
    };

    listForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const listName = listNameInput.value;
        if (!lists[listName]) {
            lists[listName] = [];
            saveLists();
            updateListSelect();
        }
        listNameInput.value = '';
    });

    wordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const word = document.getElementById('word').value;
        const meaning = document.getElementById('meaning').value;
        if (selectedList) {
            lists[selectedList].push({ word, meaning });
            saveLists();
            displayWords(selectedList);
            wordForm.reset();
        } else {
            alert('리스트를 선택하세요.');
        }
    });

    testButton.addEventListener('click', () => {
        if (selectedList) {
            const words = lists[selectedList];
            if (words.length === 0) {
                alert('단어 리스트가 비어 있습니다!');
                return;
            }
            shuffledWords = shuffleArray([...words]);
            currentWordIndex = 0;
            correctCount = 0;
            incorrectWords = [];
            displayNextWord();
        } else {
            alert('리스트를 선택하세요.');
        }
    });

    submitAnswer.addEventListener('click', (e) => {
        e.preventDefault();
        checkAnswer();
    });

    userAnswer.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkAnswer();
        }
    });

    updateListSelect();
});
