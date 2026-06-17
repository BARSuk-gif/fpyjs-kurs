/**
 * Класс FileUploaderModal
 * Используется как всплывающее окно для загрузки изображений
 */
class FileUploaderModal extends BaseModal {
  constructor( element ) {
    super(element);  
    this.imageContainers = this.domElement.querySelectorAll('.image-preview-container');
    this.registerEvents(); 
  }

   /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по крестику на всплывающем окне, закрывает его
   * 2. Клик по кнопке "Закрыть" на всплывающем окне, закрывает его
   * 3. Клик по кнопке "Отправить все файлы" на всплывающем окне, вызывает метод sendAllImages
   * 4. Клик по кнопке загрузке по контроллерам изображения: 
   * убирает ошибку, если клик был по полю вода
   * отправляет одно изображение, если клик был по кнопке отправки
   */

  registerEvents() {
    const iconX = this.domElement.querySelector('.header .x.icon');
    if (iconX) {
      iconX.addEventListener('click', () => {
        this.close();
      });
    }

    const closeButton = this.domElement.querySelector('.close.button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.close();
      });
    }

    const buttonSendAll = this.domElement.querySelector('.send-all.button');
    if (buttonSendAll) {
      buttonSendAll.addEventListener('click', () => {
        this.sendAllImages();
      });
    }

    const content = this.domElement.querySelector('.scrolling.content');
    if (content) {
      content.addEventListener('click', (event) => {       
        const target = event.target;

        // Если клик был на поле ввода (input)
        if (target.classList && target.classList.contains('image-path')) {
          // Удаляем класс error у родительского блока с классом input
          const inputBlock = target.closest('.ui.action.input');
          if (inputBlock) {
            inputBlock.classList.remove('error');
          }          
        }

        // Если клик был на кнопке отправки отдельного изображения
        if (target.classList && target.classList.contains('upload-button')) {
          //  Находим контейнер изображения (ближайший родитель с классом image-preview-container)
          const imageContainer = target.closest('.image-preview-container');
          if (imageContainer) {
            this.sendImage(imageContainer);
          }
        }
      });
    }    
  }

  /**
   * Отображает все полученные изображения в теле всплывающего окна
   */
  showImages(images) {
    // Меняем порядок на противоположный с помощью метода reverse
    const reverseImages = [...images].reverse();

    // Для каждого изображения получаем блок контейнер
    const imagesHTML = reverseImages.map(image => this.getImageHTML(image));

    // Объединяем все полученные разметки с помощью метода join
    const content = this.domElement.querySelector('.scrolling.content')
    if (content) {
      content.innerHTML = imagesHTML.join('');
    }

    // Обновляем коллекцию контейнеров
    this.imageContainers = this.domElement.querySelectorAll('.image-preview-container');

    // Открываем модальное окно
    this.open();
  }

  /**
   * Формирует HTML разметку с изображением, полем ввода для имени файла и кнопкной загрузки
   */
  getImageHTML(item) {
    const defaultPath = `/VK_Backup/photo_${item.id}.jpg`;
    return `<div class="image-preview-container">
              <img src="${item.url}" alt="Фото ${item.id}" />
              <div class="ui action input">
                <input type="text" class="image-path" placeholder="Путь к файлу" value="${defaultPath}">
                <button class="ui button upload-button">
                  <i class="upload icon"></i>
                </button>
              </div>
            </div>`;
  }

  /**
   * Отправляет все изображения в облако
   */
  sendAllImages() {
    // Перебираем все блоки контейнеры изображений
    const containers = this.domElement.querySelectorAll('.image-preview-container');

    if (containers.length === 0) {
      alert('Нет изображений для загрузки');
      return;
    }

    // Для каждого вызываем метод sendImage
    containers.forEach(container => {
      this.sendImage(container);
    });
  }

  /**
   * Валидирует изображение и отправляет его на сервер
   */
  sendImage(imageContainer) {
    // Получаем значение поля ввода
    const inputElement = imageContainer.querySelector('.image-path');
    const uploadPath = inputElement ? inputElement.value.trim() : '';

    // Получаем родительский блок с классом input
    const inputBlock = imageContainer.querySelector('.ui.action.input');

    // Валидируем строку пути для загрузки изображения
    if (!uploadPath || uploadPath === '') {
      if (inputBlock) {
        inputBlock.classList.add('error');
      }
      return;
    }

    // Добавляем класс disabled семантик элементу поля ввода (блоку с классом input)
    if (inputBlock) {
      inputBlock.classList.add('disabled');
    }

    // Получаем путь добавляемого изображения из атрибута src элемента img
    const imgElement = imageContainer.querySelector('img');
    const imageUrl = imgElement ? imgElement.src : null;

    if(!imageUrl) {
      alert('Не удалось получить URL изображения');
      if (inputBlock) {
        inputBlock.classList.remove('disabled')
      }
      return;
    }

    // Выполняем запрос на отправку изображения
    Yandex.uploadFile(uploadPath, imageUrl, (error, response) => {

      // Удаляем блок контейнер добавленного изображения
      if (imageContainer && imageContainer.parentNode) {
        imageContainer.remove();
      }

      // Если не осталось никаких изображений в модалке, закрываем модальное окно
      const remainingImages = this.domElement.querySelectorAll('.image-preview-container');
      if (remainingImages.length === 0) {
        this.close();
      }

      // Обновляем коллекцию контейнеров
      this.imageContainers = this.domElement.querySelectorAll('.image-preview-container');

      if (error) {
        console.error('Ошибка загрузки:', error);
      }
    });
  }
}