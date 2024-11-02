let tg = window.Telegram.WebApp;

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

document.querySelectorAll("button").forEach(button => {button.addEventListener("click", () => {tg.HapticFeedback.impactOccurred('medium');})})







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

// Функция для шифрования данных (AES для данных)
function safeEncodeBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/:/g, '_COLON_')
        .replace(/\//g, '_SLASH_')
        .replace(/\+/g, '_PLUS_');
}

async function encryptData() {
    const plaintext = document.getElementById('plaintext').value;

    if (!plaintext) return;

    aesKey = await importAESKey(base64Key);
    iv = crypto.getRandomValues(new Uint8Array(12));
    let encodedText = new TextEncoder().encode(plaintext);

    encryptedText = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        aesKey,
        encodedText
    );

    // Коды для IV и зашифрованного текста через безопасную функцию
    const ivEncoded = safeEncodeBase64(iv);
    const encryptedEncoded = safeEncodeBase64(encryptedText);

    // Объединяем безопасно
    document.getElementById('encryptedData').value = `${ivEncoded}:${encryptedEncoded}`;
}


function safeDecodeBase64(str) {
    return atob(
        str.replace(/_COLON_/g, ':')
           .replace(/_SLASH_/g, '/')
           .replace(/_PLUS_/g, '+')
    );
}

async function decryptData() {
    aesKey = await importAESKey(base64Key);
    
    let decodemes = document.getElementById('encryptedData').value;
    if (decodemes === null) return;

    // Разделяем IV и зашифрованное сообщение
    let [ivEncoded, encryptedEncoded] = decodemes.split(":");

    // Декодируем обратно IV и зашифрованное сообщение
    let ivAr = Uint8Array.from(safeDecodeBase64(ivEncoded), c => c.charCodeAt(0));
    let encry = Uint8Array.from(safeDecodeBase64(encryptedEncoded), c => c.charCodeAt(0));

    // Дешифруем текст с использованием AES-GCM
    let decryptedText = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: ivAr,
        },
        aesKey,
        encry
    );

    // Отображаем расшифрованный текст
    document.getElementById('decryptedData').value = 
        new TextDecoder().decode(decryptedText);
}

function copyTo(elementId) {
    const copyText = document.getElementById(elementId).value;
    navigator.clipboard.writeText(copyText);
}

function generateQRCodeWithDynamicSize(text) {
    // Вычисляем размер на основе длины текста и округляем его, чтобы не было проблем с остатками
    const size = Math.min(Math.ceil(text.length / 50) * 128, 1024);  // Ограничиваем до 1024

    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = "";  // Очищаем div перед генерацией нового кода

    const qrCode = new QRCode(qrDiv, {
      text: text,
      width: size,
      height: size,
      correctLevel: QRCode.CorrectLevel.L  // Низкий уровень коррекции ошибок для большего объема данных
    });
  }

  async function sendQRCode() {
    const text = document.getElementById("qrtext").value;  // Используем ссылку на Google
    const botToken = "6451117715:AAFD9CtdQ3yG_UidTUI7R7rxK5l3X7AJKZc";  // Замени на свой токен бота
    const chatId = `${tg.initDataUnsafe.user.id}`;  // Замени на нужный chat_id

    try {
      // Генерируем QR-код и конвертируем его в Blob
      generateQRCodeWithDynamicSize(text);
      const canvas = document.querySelector("#qrcode canvas");

      if (!canvas) throw new Error("QR-код не был сгенерирован");

      // Конвертируем canvas в Blob
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));

      // Отправляем QR-код через Telegram Bot API
      const formData = new FormData();
      formData.append("chat_id", chatId);
      formData.append("photo", blob, "qrcode.png");

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: "POST",
        body: formData
      });


    } catch (error) {
      console.error("Ошибка:", error);
    }
  }
