/**
 * Класс SearchBlock
 * Используется для взаимодействием со строкой ввода и поиска изображений
 * */
class SearchBlock {
  constructor( element ) {
    this.element = element;
    this.registerEvents();
  }

  /**
   * Выполняет подписку на кнопки "Заменить" и "Добавить"
   * Клик по кнопкам выполняет запрос на получение изображений и отрисовывает их,
   * только клик по кнопке "Заменить" перед отрисовкой очищает все отрисованные ранее изображения
   */
  registerEvents(){
    // Получаем поле ввода
    const input = this.element.querySelector('input[type="text"]');

    // Получаем кнопку "Заменить"
    const replaceButton = this.element.querySelector('.replace');
    if (replaceButton) {
      replaceButton.addEventListener('click', () => {
        // Проверяем поле ввода идентификатора пользователя
        const userId = input ? input.value.trim() : '';

        // Если поле ввода пустое, никакой запрос не выполняем
        if (!userId || userId === '') {
          alert('Введите ID пользователя');
          return;
        }

        // Выполняем запрос на сервер для получения изображений
        VK.get(userId, (error, images) => {
          if (error) {
            console.error('Ошибка получения изображений:', error);
            return;
          }

          if (images && images.length > 0) {
            // Удаляем ранее отрисованные изображения (для кнопки "Заменить")
            App.imageViewer.clear();

            // Отрисовываем все полученные изображения
            App.imageViewer.drawImages(images);
          } else {
            alert('Изображения не найдены');
          }
        });
      });
    }

    // Получаем кнопку "Добавить"
    const addButton = this.element.querySelector('.add');
    if (addButton) {
      addButton.addEventListener('click', () => {
        // Проверяем поле ввода идентификатора пользователя
        const userId = input ? input.value.trim() : '';

        // Если поле ввода пустое, никакой запрос не выполняем
        if (!userId || userId === '') {
          alert('Введите ID пользователя');
          return;
        }

        // Выполняем запрос на сервер для получения изображений
        VK.get(userId, (error, images) => {
          if (error) {
            console.error('Ошибка получения изображений:', error);
            alert('Не удалось получить изображения. Проверьте ID пользователя.');
            return;
          }

          if (images && images.length > 0) {
            // Отрисовываем все полученные изображения (без очистки)
            App.imageViewer.drawImages(images);
          } else {
            alert('Изображения не найдены');
          }
        });
      });
    }
  }
}