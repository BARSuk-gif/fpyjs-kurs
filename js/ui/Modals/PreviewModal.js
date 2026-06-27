/**
 * Класс PreviewModal
 * Используется как обозреватель загруженный файлов в облако
 */
class PreviewModal extends BaseModal {
  constructor( element ) {
    super(element),
    this.registerEvents()
  }

  /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по крестику на всплывающем окне, закрывает его
   * 2. Клик по контроллерам изображения: 
   * Отправляет запрос на удаление изображения, если клик был на кнопке delete
   * Скачивает изображение, если клик был на кнопке download
   */
  registerEvents() {
    const iconX =this.domElement.querySelector('.header .x.icon');
    if (iconX) {
      iconX.addEventListener('click', () => {
        this.close();
      });
    }

    const content = this.domElement.querySelector('.scrolling.content');
    if (content) {
      content.addEventListener('click', (event) => {
        const target = event.target;

        // Если клик был на элементе с классом delete
        const deleteButton = target.closest('.delete');
        if (deleteButton) {
          // В элемент иконки (i) присваиваем набор классов: 'icon spinner loading'
          const icon = deleteButton.querySelector('i');
          if (icon) {
            icon.className = 'icon spinner loading';
          }

          // Блокируем кнопку удаления, добавив класс disabled
          deleteButton.classList.add('disabled');

          // Получаем путь к файлу из data-атрибута
          const filePath = deleteButton.dataset.path;

          // Выполняем запрос на удаление файла
          Yandex.removeFile(filePath, (error, response) => {
            if (!error && response === null) {
              // В случае успешного запроса (если в ответе будет значение null)
              // Удаляем весь блок с информацией об изображении
              const imageContainer = deleteButton.closest('.image-preview-container');
              if (imageContainer) {
                imageContainer.remove();
              }
            } else {
              // Восстанавливаем кнопку при ошибке
              if (icon) {
                icon.className = 'trash icon';
              }
              deleteButton.classList.remove('disabled');
              console.error('Ошибка удаления:', error);
            }
          });
          return;
        }

        // Если клик был на элементе с классом download
        const downloadButton = target.closest('.download');
        if (downloadButton) {
          // Получаем ссылку на файл из data-атрибута
          const fileUrl = downloadButton.dataset.file;
          Yandex.downloadFileByUrl(fileUrl);
          return;
        }
      });
    }
  }


  /**
   * Отрисовывает изображения в блоке всплывающего окна
   */
  showImages(data) {
    // Меняем порядок на противоположный с помощью метода reverse
    const reversedData = [...data].reverse();

    // Для каждого изображения получаем блок контейнер
    const imagesHTML = reversedData.map(item => this.getImageInfo(item));

    // Объединяем все полученные разметки с помощью метода join
    const content = this.domElement.querySelector('.scrolling.content');
    if (content) {
      content.innerHTML = imagesHTML.join('');
    }
    this.open();
  }

  /**
   * Форматирует дату в формате 2021-12-30T20:40:02+00:00(строка)
   * в формат «30 декабря 2021 г. в 23:40» (учитывая временной пояс)
   * */
  formatDate(dateString) {
    const date = new Date(dateString);
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    // Получаем компоненты даты
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    let minutes = date.getMinutes();

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${day} ${month} ${year} г. в ${hours}:${minutes}`;
  }

  /**
   * Возвращает разметку из изображения, таблицы с описанием данных изображения и кнопок контроллеров (удаления и скачивания)
   */
  getImageInfo(item) {
    // Извлекаем имя файла из пути
    const fileName = item.name || item.path.split('/').pop()  || 'Неизвестный файл';

    // Fallback для даты
    const dateToFormat = item.created || item.modified || item.date || new Date().toISOString(); 
    // Получаем отформатированную дату
    const formattedDate = this.formatDate(dateToFormat);

    // Получаем размер файла в Кб
    const fileSize = item.size ? (item.size / 1024).toFixed(2) : '0';

    // Путь к изображению (миниатюра или сам файл)
    const imageUrl = item.preview || item.file || '#';
    const filePath = item.path || '';
    const fileUrl = item.file || '';

    return `<div class='image-preview-container'>
              <img src="${imageUrl}" alt='${fileName}' />
              <table class='ui celled table'>
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Создано</th>
                    <th>Размер</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${fileName}</td>
                    <td>${formattedDate}</td>
                    <td>${fileSize} Кб</td>
                  </tr>
                </tbody>
              </table>
              <div class='buttons-wrapper'>
                <button class="ui labeled icon red basic button delete" data-path='${filePath}'>
                  Удалить
                  <i class="trash icon"></i>
                </button>
                <button class="ui labeled icon violet basic button download" data-file='${fileUrl}'>
                  Скачать
                  <i class="download icon"></i>
                </button>
              </div>
            </div>`;    
  }
}
