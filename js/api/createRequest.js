/**
 * Основная функция для совершения запросов по Yandex API.
 * */
const createRequest = (options = {}) => {
    const method = options.method;
    let url = options.url;
    const data = options.data;
    const headers = options.headers
    const callback = options.callback;

    if (method === 'GET' && data) {
        const params = new URLSearchParams(data).toString();
        url = url + '?' + params;
    }

    const xhr = new XMLHttpRequest;

    xhr.onload = function() {
        if (xhr.status >=200 && xhr.status < 300) {
            callback(null, xhr.response);
        } else {
            const error = new Error(`Ошибка ${xhr.status}: ${xhr.statusText}`);
            callback(error, null)
        }
    };

    xhr.onerror = function() {
        callback(new Error('Ошибка сети'), null);
    };         

    try { 
        xhr.open(method, url);
        xhr.responseType = 'json';

        if (headers) {
            for (let key in headers) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }

        if (method !== 'GET' && data) {
            xhr.send(JSON.stringify(data));
        }  else {
            xhr.send();
        }
    }
    catch (err) {
        console.error(err);
        callback(err, null);
    }
};
