// Получаем все input элементы на странице
const inputs = document.querySelectorAll('input');

document.body.addEventListener('click', function(event) {
    // Проверяем, не кликнули ли мы по какому-либо полю ввода
    let isInputClicked = false;
    inputs.forEach(input => {
        if (input.contains(event.target)) {
            isInputClicked = true;
        }
    });
    // Если не кликнули по input, убираем фокус
    if (!isInputClicked) {
        inputs.forEach(input => input.blur());
    }
});








// Функция для установки куки
function setCookie(name, value, days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Срок хранения куки
    let expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}
        
// Функция для получения куки
function getCookie(name) {
    let matches = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return matches ? matches[2] : null;
}

function darkmode() {
    document.documentElement.style.setProperty("--color-text", "#ffffff");
    document.documentElement.style.setProperty("--color-btn", "#5b5b5b");
}

function whitemode() {
    document.documentElement.style.setProperty("--color-text", "#aaaaaa");
    document.documentElement.style.setProperty("--color-btn", "#eeeeee");
}


let aesKey;          // Переменная для AES-ключа, который будет использован для шифрования текста
let encryptedAESKey; // Переменная для хранения зашифрованного AES-ключа
let encryptedText;   // Переменная для хранения зашифрованного текста
let iv;              // Вектор инициализации (IV) для алгоритма AES-GCM
const base64Key = "rnE8UZo1OpmIe2gBA9pAKfhEWMvst4zHvDapoepwWeU=";

// Импорт ключа из Base64 строки
async function importAESKey(base64Key) {
    const rawKey = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
    return await crypto.subtle.importKey(
        "raw",
        rawKey,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
    );
}

// Функция для шифрования данных (гибридное шифрование: AES для данных, RSA для ключа AES)
async function encryptData() {
    const plaintext = document.getElementById('plaintext').value; // Получаем текст из поля для ввода

    if (!plaintext) { // Если текст пустой, выводим предупреждение
        return;
    }

    // Инициализация AES-ключа из Base64 (замени на свой реальный ключ)
    // Пример ключа в Base64
    aesKey = await importAESKey(base64Key);

    // Генерация случайного вектора инициализации (IV) для AES
    iv = crypto.getRandomValues(new Uint8Array(12));  // 12 байт для IV (рекомендуется для AES-GCM)
    const encodedText = new TextEncoder().encode(plaintext); // Кодируем текст в формат Uint8Array

    // Шифруем текст с использованием AES-GCM
    encryptedText = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",              // Используем AES-GCM для шифрования
            iv: iv,                       // Передаем сгенерированный IV
        },
        aesKey,                            // Используем сгенерированный AES-ключ
        encodedText                        // Текст для шифрования (закодирован как Uint8Array)
    );

    // Отображаем зашифрованный текст в поле вывода
    document.getElementById('encryptedData').value = 
    btoa(String.fromCharCode(...new Uint8Array(iv))) + ":" + btoa(String.fromCharCode(...new Uint8Array(encryptedText)));
}

// Функция для дешифрования данных
async function decryptData() {

    
    aesKey = await importAESKey(base64Key);
    
    let decodemes = document.getElementById('encryptedData').value;
    if (decodemes === null) return;
    const [re, wi] = (String(decodemes)).split(":");
    const ivAr = Uint8Array.from(atob(re), c => c.charCodeAt(0));
    const encry = new Uint8Array(atob(wi).split("").map(c => c.charCodeAt(0)));

    // Дешифруем текст с использованием AES-GCM
    const decryptedText = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",              // Алгоритм AES-GCM для расшифровки
            iv: ivAr,                       // Передаем тот же IV, что использовался при шифровании
        },
        aesKey,                         // Используем восстановленный AES-ключ
        encry                   // Зашифрованный текст для расшифровки
    );

    // Отображаем расшифрованный текст в поле вывода
    document.getElementById('decryptedData').value = 
    new TextDecoder().decode(decryptedText); // Декодируем Uint8Array обратно в строку
}
