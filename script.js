// قائمة كلمات عشوائية (5 و 6 حروف فقط)
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

// إنشاء الشبكة
const wordGrid = document.getElementById('word-grid');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');
const checkButton = document.getElementById('check-button');
const resultScreen = document.getElementById('result-screen');
const resultMessage = document.getElementById('result-message');
const nextButton = document.getElementById('next-button');
const homeButton = document.getElementById('home-button');

// ترتيب الكيبورد الجديد
const keys = [
    ['د', 'ج', 'ح', 'خ', 'ه', 'ع', 'غ', 'ف', 'ق', 'ث', 'ص', 'ض', 'ط', 'ك', 'م', 'ن', 'ت', 'ا', 'ل', 'ب', 'ي', 'س', 'ش', 'ظ', 'ز', 'و', 'ة', 'ى', 'ل', 'ا', 'ر', 'ؤ', 'ء', 'ئ'],
    ['⌫'] // زرار المسح
];

// اختيار كلمة عشوائية
function getRandomWord() {
    const availableWords = words.filter(word => !usedWords.includes(word));
    if (availableWords.length === 0) {
        alert("لقد لعبت كل الكلمات!");
        return words[0]; // إرجاع كلمة افتراضية إذا انتهت الكلمات
    }
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    usedWords.push(randomWord);
    localStorage.setItem('usedWords', JSON.stringify(usedWords));
    return randomWord;
}

// إنشاء خانات الكلمات بناءً على عدد حروف الكلمة
function createGrid() {
    wordGrid.innerHTML = '';
    wordGrid.style.gridTemplateColumns = `repeat(${wordLength}, 60px)`; // عدد الخانات حسب عدد الحروف
    for (let i = 0; i < attempts; i++) {
        for (let j = 0; j < wordLength; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            wordGrid.appendChild(cell);
        }
    }
}

// إنشاء الكيبورد
function createKeyboard() {
    keyboard.innerHTML = '';
    keys.forEach(row => {
        const rowElement = document.createElement('div');
        rowElement.classList.add('keyboard-row');
        row.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('key');
            keyElement.textContent = key;
            keyElement.setAttribute('data-key', key);
            if (key === '⌫') {
                keyElement.classList.add('delete-key');
                keyElement.addEventListener('click', deleteLastLetter);
            } else {
                keyElement.addEventListener('click', () => handleKeyPress(key));
            }
            rowElement.appendChild(keyElement);
        });
        keyboard.appendChild(rowElement);
    });
}

// التعامل مع الضغط على الحروف
function handleKeyPress(key) {
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
        for (let i = 0; i < wordLength; i++) {
            const cell = cells[startIndex + i];
            const key = document.querySelector(`.key[data-key='${guessedWord[i]}']`);

            if (guessedWord[i] === secretWord[i]) {
                cell.classList.add('correct');
                key.classList.add('correct');
            } else if (secretWord.includes(guessedWord[i])) {
                cell.classList.add('present');
                key.classList.add('present');
            } else {
                cell.classList.add('absent');
                key.classList.add('absent');
            }
        }

        if (guessedWord === secretWord) {
            showResult("مبروك! انت فزت!", "#6aaa64");
        } else {
            currentAttempt++;
            if (currentAttempt === attempts) {
                showResult(`للأسف! الكلمة الصحيحة كانت: ${secretWord}`, "#ff4d4d");
            }
        }
    }
}

// عرض شاشة النتيجة
function showResult(msg, color) {
    resultMessage.textContent = msg;
    resultMessage.style.color = color;
    resultScreen.classList.remove('hidden');
}

// إعادة تعيين اللعبة
function resetGame() {
    secretWord = getRandomWord();
    currentAttempt = 0;
    createGrid();
    createKeyboard();
    resultScreen.classList.add('hidden');
}

// العودة للصفحة الرئيسية
function goHome() {
    window.location.href = "index.html"; // يمكنك تغيير هذا ليناسب الصفحة الرئيسية
}

// بدء اللعبة
createGrid();
createKeyboard();

// إضافة أحداث للأزرار
checkButton.addEventListener('click', checkWord);
nextButton.addEventListener('click', resetGame);
homeButton.addEventListener('click', goHome);
