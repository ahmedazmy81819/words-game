// مؤثرات صوتية (اختياري - تحتاج ملفات صوتية)
const keyPressSound = new Audio('assets/sounds/key-press.mp3');
const winSound = new Audio('assets/sounds/win.mp3');
const loseSound = new Audio('assets/sounds/lose.mp3');

// قائمة كلمات عشوائية
const words = [
    "تفاحة", "برتقال", "موز", "فراولة", "عنب", "مانجو", "بطيخ", "شمام", "خوخ", "كمثرى",
    "طائرة", "سيارة", "قطار", "دراجة", "سفينة", "غواصة", "طائرة", "سيارة", "قطار", "دراجة",
    "مدرسة", "جامعة", "مكتبة", "مستشفى", "فندق", "مطعم", "سوق", "حديقة", "ملعب", "مسبح",
    "كمبيوتر", "هاتف", "شاشة", "لوحة", "قلم", "ورقة", "مكتب", "كرسي", "ساعة", "نظارة"
];

let usedWords = JSON.parse(localStorage.getItem('usedWords')) || [];
let secretWord = getRandomWord();
const wordLength = secretWord.length;
let attempts = 6;
let currentAttempt = 0;
let hintUsed = false;

// عناصر DOM
const wordGrid = document.getElementById('word-grid');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');
const checkButton = document.getElementById('check-button');
const resultScreen = document.getElementById('result-screen');
const resultMessage = document.getElementById('result-message');
const nextButton = document.getElementById('next-button');
const homeButton = document.getElementById('home-button');

// متغيرات الإحصائيات
let wins = parseInt(localStorage.getItem('wins')) || 0;
let losses = parseInt(localStorage.getItem('losses')) || 0;
let bestScore = parseInt(localStorage.getItem('bestScore')) || 0;

// تحديث عرض الإحصائيات
updateStatsDisplay();

// ** الدوال **

function initializeGame() {
    // تحقق من وجود ملفات الصوت (اختياري)
    if (keyPressSound && winSound && loseSound) {
        console.log("Sounds loaded successfully!");
    }

    // إعداد واجهة اللعبة
    createGrid();
    createKeyboard();

    // إضافة أحداث للأزرار
    checkButton.addEventListener('click', checkWord);
    nextButton.addEventListener('click', resetGame);
    homeButton.addEventListener('click', goHome);

    // إضافة أحداث لوحة المفاتيح
    document.addEventListener('keydown', handleKeyboardInput);

    // التحقق من اتجاه الشاشة
    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    // تعديل التنسيق للهواتف
    adjustLayoutForMobile();
}

//  *  دوال تتعامل مع كلمات اللعبة
function getRandomWord() {
    const availableWords = words.filter(word => !usedWords.includes(word));

    if (availableWords.length === 0) {
        usedWords = [];
        localStorage.setItem('usedWords', JSON.stringify(usedWords));
        return words[Math.floor(Math.random() * words.length)];
    }

    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    usedWords.push(randomWord);
    localStorage.setItem('usedWords', JSON.stringify(usedWords));
    return randomWord;
}

//  * دوال تتعامل مع واجهة اللعبة
function createGrid() {
    wordGrid.innerHTML = '';
    wordGrid.style.gridTemplateColumns = `repeat(${wordLength}, 60px)`;

    for (let i = 0; i < attempts; i++) {
        for (let j = 0; j < wordLength; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            wordGrid.appendChild(cell);
        }
    }
}

//  * دوال تتعامل مع لوحة المفاتيح
function createKeyboard() {
    keyboard.innerHTML = '';
    const keys = [
        ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'].reverse(),
        ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط', 'ذ'].reverse(),
        ['ظ', 'ز', 'و', 'ة', 'ر', 'لا', 'ى', 'ء', 'ؤ', 'ئ', '⌫'].reverse()
    ];

    const keyboardLayout = [];

    keys.forEach(row => {
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');

        const keyboardRow = []; // Store the keys in the row

        row.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('key');
            keyElement.textContent = key;
            keyElement.setAttribute('data-key', key);

            if (key === '⌫') {
                keyElement.classList.add('backspace');
                keyElement.addEventListener('click', deleteLastLetter);
            } else {
                keyElement.addEventListener('click', () => handleKeyPress(key));
            }

            rowElement.appendChild(keyElement);
            keyboardRow.push(keyElement); // Add the key to the row
        });

        keyboard.appendChild(rowElement);
        keyboardLayout.push(keyboardRow); // Store the entire row
    });

    // Store the keyboard layout for getNearbyKeys
    keyboard.keyboardLayout = keyboardLayout;
}

//  * الدوال التي تتعامل مع مدخلات المستخدم

// التعامل مع الضغط على الحروف
function handleKeyPress(key) {
    playSound(keyPressSound);
    updateCells(key);
    triggerKeyEffect(key);
}

//  * دوال تتعامل مع خلايا الشبكة
function updateCells(key) {
    const cells = document.querySelectorAll('.cell');
    const startIndex = currentAttempt * wordLength;
    const endIndex = startIndex + wordLength;

    for (let i = startIndex; i < endIndex; i++) {
        if (!cells[i].textContent) {
            cells[i].textContent = key;
            break;
        }
    }
}

// مسح آخر حرف
function deleteLastLetter() {
    const cells = document.querySelectorAll('.cell');
    const startIndex = currentAttempt * wordLength;
    const endIndex = startIndex + wordLength;

    for (let i = endIndex - 1; i >= startIndex; i--) {
        if (cells[i].textContent) {
            cells[i].textContent = '';
            break;
        }
    }
}

// التحقق من الكلمة المدخلة
function checkWord() {
    const cells = document.querySelectorAll('.cell');
    const startIndex = currentAttempt * wordLength;
    const endIndex = startIndex + wordLength;
    const guessedWord = Array.from(cells).slice(startIndex, endIndex).map(cell => cell.textContent).join('');

    if (guessedWord.length === wordLength) {
        let correctCount = 0;
        for (let i = 0; i < wordLength; i++) {
            const cell = cells[startIndex + i];
            const key = document.querySelector(`.key[data-key='${guessedWord[i]}']`);

            if (guessedWord[i] === secretWord[i]) {
                cell.classList.add('correct');
                key.classList.add('correct');
                correctCount++;
            } else if (secretWord.includes(guessedWord[i])) {
                cell.classList.add('present');
                key.classList.add('present');
            } else {
                cell.classList.add('absent');
                key.classList.add('absent');
            }
        }

        if (correctCount === wordLength) {
            updateScore();
            updateStats("win");
            showResult("مبروك! انت فزت!", "#6aaa64");
            playSound(winSound);
        } else {
            currentAttempt++;
            if (currentAttempt === attempts) {
                updateStats("loss");
                showResult(`للأسف! الكلمة الصحيحة كانت: ${secretWord}`, "#ff4d4d");
                playSound(loseSound);
            }
        }
    }
}

//  * الدوال التي تتعامل مع العرض المرئي
function updateStatsDisplay() {
    document.getElementById('wins').textContent = wins;
    document.getElementById('losses').textContent = losses;
    document.getElementById('best-score').textContent = bestScore;
}

function showResult(msg, color) {
    resultMessage.textContent = msg;
    resultMessage.style.color = color;
    resultScreen.classList.remove('hidden');
}

function triggerKeyEffect(key) {
    const keyElement = document.querySelector(`.key[data-key='${key}']`);
    keyElement.classList.add('active');

    //Get Keyboard Layout
    const layout = keyboard.keyboardLayout;

    //Get NearbyKeys
    const nearbyKeys = getNearbyKeys(keyElement, layout);

    nearbyKeys.forEach((k, index) => {
        setTimeout(() => {
            k.classList.add('color-effect');
        }, index * 10); // Adjust the delay as needed
    });

    // Clean up the effects
    setTimeout(() => {
        keyElement.classList.remove('active');
        nearbyKeys.forEach(k => {
            k.classList.remove('color-effect');
        });
    }, nearbyKeys.length * 10 + 100); // Adjust the total delay
}

function getNearbyKeys(keyElement, layout) {
    const rowIndex = layout.findIndex(row => row.includes(keyElement));
    const keyIndex = layout[rowIndex].indexOf(keyElement);
    const nearbyKeys = [];

    // Check surrounding keys
    for (let i = Math.max(0, rowIndex - 1); i <= Math.min(layout.length - 1, rowIndex + 1); i++) {
        for (let j = Math.max(0, keyIndex - 1); j <= Math.min(layout[i].length - 1, keyIndex + 1); j++) {
            if (i !== rowIndex || j !== keyIndex) { // Exclude the key itself
                nearbyKeys.push(layout[i][j]);
            }
        }
    }

    return nearbyKeys;
}

//  * الدوال التي تتعامل مع المؤثرات الصوتية
function playSound(sound) {
    if (sound) {
        sound.play();
    }
}

//  * دوال تتعامل مع سير اللعبة
function resetGame() {
    secretWord = getRandomWord();
    currentAttempt = 0;
    hintUsed = false; // Reset the hint flag
    createGrid();
    resetKeyboardColors(); // Reset colors on keys
    resultScreen.classList.add('hidden');
}

// Reset Keyboard Colors
function resetKeyboardColors() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });
}

function goHome() {
    //في صفحة رئيسية مينفعش يرجع لصفحة رئيسية
    window.location.reload();
}

//  * الدوال التي تتعامل مع الإحصائيات
function updateStats(result) {
    if (result === "win") {
        wins++;
        bestScore = Math.max(bestScore, attempts - currentAttempt); // Simplified best score calculation
    } else {
        losses++;
    }

    // Update display and localStorage
    updateStatsDisplay();
    localStorage.setItem('wins', wins.toString());
    localStorage.setItem('losses', losses.toString());
    localStorage.setItem('bestScore', bestScore.toString());
}

//  * الدوال التي تتعامل مع النقاط
let score = 0; // Initialize score

function updateScore() {
    const points = attempts - currentAttempt;
    score += points * 10;
    console.log(`Score: ${score}`); // For debugging purposes
}

//  * الدوال التي تتعامل مع المدخلات
function handleKeyboardInput(event) {
    const key = event.key;

    if (key === 'Backspace') {
        deleteLastLetter();
    } else if (key === 'Enter') {
        checkWord();
    } else if (/^[\u0600-\u06FF]$/.test(key)) {
        handleKeyPress(key);
    }
}

//  * دوال متنوعة

function checkOrientation() {
    if (window.innerHeight > window.innerWidth) {
        document.getElementById('rotate-message').style.display = 'flex';
        document.getElementById('game-container').style.display = 'none';
    } else {
        document.getElementById('rotate-message').style.display = 'none';
        document.getElementById('game-container').style.display = 'flex';
    }
}

function adjustLayoutForMobile() {
    if (window.innerWidth < 768) {
        // تعديل العناصر للشاشات الصغيرة
        document.body.style.fontSize = '14px';
        document.querySelectorAll('.cell').forEach(cell => {
            cell.style.width = '10vw';
            cell.style.height = '10vw';
            cell.style.fontSize = '4vw';
        });
        document.querySelectorAll('.key').forEach(key => {
            key.style.padding = '2vw';
            key.style.fontSize = '4vw';
            key.style.minWidth = '6vw';
        });
        document.getElementById('message').style.fontSize = '5vw';
        document.querySelectorAll('.button-container button').forEach(button => {
            button.style.padding = '2vw 4vw';
            button.style.fontSize = '3vw';
        });
    }
}

function showHint() {
    if (hintUsed) {
        message.textContent = "لقد استخدمت التلميح بالفعل!";
        return;
    }

    let correctLetters = [];
    for (let i = 0; i < secretWord.length; i++) {
        correctLetters.push(secretWord[i]);
    }

    let hint = null;
    while (hint === null) {
        let randomIndex = Math.floor(Math.random() * correctLetters.length);
        let randomLetter = correctLetters[randomIndex];

        let letterUsed = false;
        const cells = document.querySelectorAll('.cell');
        const startIndex = currentAttempt * wordLength;
        const endIndex = startIndex + wordLength;

        for (let i = startIndex; i < endIndex; i++) {
            if (cells[i].textContent === randomLetter) {
                letterUsed = true;
                break;
            }
        }

        if (!letterUsed) {
            hint = randomLetter;
        }
    }

    message.textContent = `يوجد حرف '${hint}' في الكلمة، ولكنه ليس في مكانه الصحيح.`;
    hintUsed = true;
}