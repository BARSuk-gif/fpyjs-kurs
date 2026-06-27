/**
 * Класс VK
 * Управляет изображениями из VK. С помощью VK API.
 * С помощью этого класса будет выполняться загрузка изображений из vk.
 * Имеет свойства ACCESS_TOKEN и lastCallback
 * */
class VK {

  static ACCESS_TOKEN = '958eb5d439726565e9333aa30e50e0f937ee432e927f0dbd541c541887d919a7c56f95c04217915c32008';
  static lastCallback;

  /**
   * Получает изображения
   * */
  static get(id = '', callback) {
	
	this.lastCallback = callback;

	// Генерируем уникальное имя для callback функции
	const callbackName = 'vk_callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

	// Создаем временную глобальную функцию для обработки ответа
	window[callbackName] = (response) => {
	  this.processData(response, callbackName);
	};

	const script = document.createElement('script');

	// Формируем URL с параметрами для JSONP запроса
	const url = `https://api.vk.com/method/photos.get?` + 
				`owner_id=${id}&` +
				`album_id=profile&` +
				`v=5.199&` +
				`access_token=${this.ACCESS_TOKEN}&` +
				`callback=${callbackName}`;
   
	script.src = url;
	script.className = 'vk-jsonp-script';
	script.id = callbackName;

	document.body.appendChild(script);
  }

  /**
   * Передаётся в запрос VK API для обработки ответа.
   * Является обработчиком ответа от сервера.
   */
  static processData(response, scriptId){
	const scriptElement = document.getElementById(scriptId);
	if (scriptElement) {
		scriptElement.remove();
	}

	// Удаляем временную глобальную функцию
	if (window[scriptId]) {
		delete window[scriptId];
	}

	if (response && response.error) {
		alert(`Ошибка VK API: ${response.error.error_code} - ${response.error.error_msg}`);
		return;
	}
	
	// Проверяем, что ответ содержит фотографии
	if (response && response.response && response.response.items) {
		const photos = response.response.items;

		const images = photos.map(photo => {
			const sizes = photo.sizes;
			let largestSize = sizes[0];
			for (let i = 1; i < sizes.length; i++) {
				const currentArea = sizes[i].width * sizes[i].height;
				const largestArea = largestSize.width * largestSize.height;
				if (currentArea > largestArea) {
					largestSize = sizes[i];
				}
			}
			return {
				url: largestSize.url,
				width: largestSize.width,
				height: largestSize.height,
				id: photo.id,
				owner_id: photo.owner_id,
				date: photo.date,
			};
		});

		// Передаём изображения в колбек, который сохранялся в lastCallback
		if (this.lastCallback && typeof this.lastCallback === 'function') {
			this.lastCallback(null, images);
		}        
	} else {
		alert('Не удалось получить фотографии. Проверьте ID пользователя.');
	}

	this.lastCallback = () => {};
  }
}


