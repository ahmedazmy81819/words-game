// قائمة كلمات عشوائية
const words = ["كتاب", "شمس", "قمر", "بحر", "جبل", "ورد", "عسل", "فجر", "ليل", "نهار"];
const secretWord = words[Math.floor(Math.random() * words.length)];
const wordLength = secretWord.length;
let attempts = 6;
let currentAttempt = 0;

// إنشاء الشبكة
const wordGrid = document.getElementById('word-grid');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');
const checkButton = document.getElementById('check-button');

// ترتيب الكيبورد العربي (QWERTY)
const keys = [
    'ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح',
    'ج', 'د', 'ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن',
    'م', 'ك', 'ط', 'ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة',
    'و', 'ز', 'ظ'
];

// إنشاء خانات الكلمات
function createGrid() {
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
    keys.forEach(key => {
        const keyElement = document.createElement('div');
        keyElement.classList.add('key');
        keyElement.textContent = key;
        keyElement.setAttribute('data-key', key); // إضافة خاصية data-key
        keyElement.addEventListener('click', () => handleKeyPress(key));
        keyboard.appendChild(keyElement);
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
                cell.classList.add('correct'); // أخضر
                key.classList.add('correct');
            } else if (secretWord.includes(guessedWord[i])) {
                cell.classList.add('present'); // أصفر
                key.classList.add('present');
            } else {
                cell.classList.add('absent'); // رمادي
                key.classList.add('absent');
            }
        }

        if (guessedWord === secretWord) {
            message.textContent = "مبروك! انت فزت!";
            message.style.color = "#6aaa64";
            disableKeyboard();
        } else {
            currentAttempt++;
            if (currentAttempt === attempts) {
                message.textContent = `للأسف! الكلمة الصحيحة كانت: ${secretWord}`;
                message.style.color = "#ff4d4d";
                disableKeyboard();
            }
        }
    }
}

// تعطيل الكيبورد بعد الفوز أو الخسارة
function disableKeyboard() {
    document.querySelectorAll('.key').forEach(key => key.style.pointerEvents = 'none');
}

// بدء اللعبة
createGrid();
createKeyboard();

// إضافة حدث لزر التحقق
checkButton.addEventListener('click', checkWord);
