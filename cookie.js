class cookie {
    constructor() {

    }

    // Функция для установки куки
    setCookie(name, value, days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Срок хранения куки
        let expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }
            
    // Функция для получения куки
    getCookie(name) {
        let matches = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return matches ? matches[2] : null;
    }
}
