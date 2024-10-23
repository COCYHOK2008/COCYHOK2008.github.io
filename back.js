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





let rsaKeyPair;
let encryptedText, iv, encryptedAESKey;

// Генерация AES ключа для каждого сообщения
async function generateAESKey() {
    return await crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}


// Функция для расшифровки текста
async function decryptText(encryptedText, encryptedAESKey) {
    // Дешифровка AES ключа с использованием RSA приватного ключа
    const decryptedAESKey = await crypto.subtle.decrypt(
        {
            name: "RSA-OAEP",
        },
        rsaKeyPair.privateKey,
        encryptedAESKey
    );

    const aesKey = await crypto.subtle.importKey(
        "raw",
        decryptedAESKey,
        {
            name: "AES-GCM",
        },
        true,
        ["decrypt"]
    );

    // Дешифровка текста с использованием AES
    const decryptedText = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        aesKey,
        encryptedText
    );

    return new TextDecoder().decode(decryptedText);
}






// Функция для вызова шифрования
async function handleEncrypt() {
    const plaintext = document.getElementById('plaintext').value;
    if (!plaintext) {
        alert('Please enter some text.');
        return;
    }
    // Шифрование текста
    const { encryptedText: et, encryptedAESKey: eAESKey } = await encryptText(plaintext);
    encryptedText = et;
    encryptedAESKey = eAESKey;
    // Показываем зашифрованные данные и ключи
    document.getElementById('encryptedData').value = btoa(String.fromCharCode(...new Uint8Array(encryptedText)));
    document.getElementById('aesKey').value = btoa(String.fromCharCode(...new Uint8Array(encryptedAESKey)));
}




// Функция для вызова расшифровки
async function handleDecrypt() {
    if (!encryptedText || !encryptedAESKey) {
        document.getElementById('decryptedData').value = "Введите текст!!!";
        return;
    }
    // Дешифровка текста
    const decryptedText = await decryptText(encryptedText, encryptedAESKey);
    // Показываем расшифрованный текст
    document.getElementById('decryptedData').value = decryptedText;
}
