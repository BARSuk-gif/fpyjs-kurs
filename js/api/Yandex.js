/**
 * Класс Yandex
 * Используется для управления облаком.
 * Имеет свойство HOST
 * */
class Yandex {
	static HOST = 'https://cloud-api.yandex.net/v1/disk';

	/**
	 * Метод формирования и сохранения токена для Yandex API
	 */
	static getToken(){
		const yandexToken = localStorage.getItem('yandex_token');

		if (yandexToken) {
			return yandexToken;
		} else {
			let userInput = prompt("Введите ваш токен для Yandex API:");      

			// Проверяем, не нажал ли пользователь Отмена
			while (userInput === null || userInput.trim() === '') {
				userInput = prompt("Токен не может быть пустым! Введите ваш токен для Yandex API:");         
			}

			const trimmedToken = userInput.trim();
			localStorage.setItem('yandex_token', trimmedToken);
			return trimmedToken;
		}
	}

	/**
	 * Метод загрузки файла в облако
	 */
	static uploadFile(path, url, callback){
		const params = new URLSearchParams({
			path: path,
			url: url,
		}).toString();

		const fullUrl = `${this.HOST}/resources/upload?${params}`;

		let options = {
			method: 'POST',
			url: fullUrl,
			headers: {
				Authorization: `OAuth ${this.getToken()}`,
			},    
			callback: callback,
		};
		createRequest(options);
	};

	/**
	 * Метод удаления файла из облака
	 */
	static removeFile(path, callback){
		const params = new URLSearchParams({
			path: path,
		})

		const fullUrl = `${this.HOST}/resources?${params}`;

		let options = {
			method: 'DELETE',
			url: fullUrl,
			headers: {
				Authorization: `OAuth ${this.getToken()}`,
			},    
			callback: callback,
		};
		createRequest(options);    
	};

	/**
	 * Метод получения всех загруженных файлов в облаке
	 */
	static getUploadedFiles(callback){
		let options = {
			method: 'GET',
			url: `${this.HOST}/resources/files`,
			headers: {
				Authorization: `OAuth ${this.getToken()}`,
			},
			callback: callback,
		};
		createRequest(options)
	}

	/**
	 * Метод скачивания файлов
	 */
	static downloadFileByUrl(url){
		const link = document.createElement("a");
		link.href = url;
		link.download = '';
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);		
	}
}
