/**
 * Класс ImageViewer
 * Используется для взаимодействием блоком изображений
 * */
class ImageViewer {
  constructor( element ) {
    // 1. Полученный DOM элемент сохранить в свойство объекта класса
    this.element = element;

    // 1.2. Сохраняем блок предпросмотра изображения
    this.previewContainer = this.element.querySelector('.column.six.wide img');

    // 1.3. Сохраняем блок, в котором будут отрисовываться все изображения
    const rows = this.element.querySelectorAll('.ui.grid .row');
    this.imagesGrid = rows.length > 1 ? rows[1] : null;

    if (!this.imagesGrid) {      
      const grid = this.element.querySelector('.ui.grid');
      if (grid) {
        // Создаем новую строку для изображений
        const newRow = document.createElement('div');
        newRow.className = 'row';
        // Вставляем после первой строки (с кнопками)
        const firstRow = grid.querySelector('.row:first-child');
        if (firstRow) {
          grid.insertBefore(newRow, firstRow.nextSibling);
        } else {
          grid.appendChild(newRow);
        }
        this.imagesGrid = newRow;
      }
    }

    this.registerEvents()
  }

  /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по изображению меняет класс активности у изображения
   * 2. Двойной клик по изображению отображает изображаения в блоке предпросмотра
   * 3. Клик по кнопке выделения всех изображений проверяет у всех ли изображений есть класс активности?
   * Добавляет или удаляет класс активности у всех изображений
   * 4. Клик по кнопке "Посмотреть загруженные файлы" открывает всплывающее окно просмотра загруженных файлов
   * 5. Клик по кнопке "Отправить на диск" открывает всплывающее окно для загрузки файлов
   */
  registerEvents(){
    // Обработчик двойного клика на весь блок с изображениями
    if (this.imagesGrid) {
      this.imagesGrid.addEventListener('dblclick', (event) => {
        const target = event.target;
        // Проверяем, был ли двойной клик на изображении
        if (target.tagName === 'IMG') {
          if (this.previewContainerreview) {
            this.previewContainer.src = target.src;
          }          
        }
      });

      // Обработчик одиночного клика на весь блок с изображениями
      this.imagesGrid.addEventListener('click', (event) => {
        const target = event.target;
        // Проверяем, был ли клик на изображении
        if (target.tagName === 'IMG') {
          // Инвертируем наличие класса selected
          const imageWrapper = target.closest('.image-wrapper');
          if (imageWrapper) {
            imageWrapper.classList.toggle('selected');
          }
          this.checkButtonText();
        }
      });
    }

    // Обработчик клика по кнопке "Выбрать всё" / "Снять выделение"
    const selectAllButton = this.element.querySelector('.select-all');
    if (selectAllButton) {
      selectAllButton.addEventListener('click', () => {
        // Получаем все изображения
        const imageWrappers = this.imagesGrid ? this.imagesGrid.querySelectorAll('.image-wrapper') : [];

        // Проверяем, есть ли хотя бы одно изображение с классом selected
        const hasSelected = Array.from(imageWrappers).some(wrapper => 
          wrapper.classList.contains('selected')
        );

        // Если есть хотя бы одно выделенное, снимаем выделение со всех
        if (hasSelected) {
          imageWrappers.forEach(wrapper => {
            wrapper.classList.remove('selected');
          });
        } else {
          // Если ни одно не выделено, выделяем все
          imageWrappers.forEach(wrapper => {
            wrapper.classList.add('selected')
          });
        }
        this.checkButtonText();
      });
    }

    // Обработчик клика по кнопке "Посмотреть загруженные файлы"
    const showUploadedButton = this.element.querySelector('.show-uploaded-files');
    if (showUploadedButton) {
      showUploadedButton.addEventListener('click', () => {
        // Получаем модальное окно просмотра загруженных изображений
        const previewModal = App.getModal('filePreviewer');

        if (!previewModal) {
          console.error('Модальное окно preview не найдено');
          return;
        }

        // Отображаем большой лоадер
        const content = previewModal.domElement.querySelector('.scrolling.content');
        if (content) {
          content.innerHTML = '<i class="asterisk loading icon massive"></i>';
        }

        // Открываем модальное окно
        previewModal.open();

        // Получаем все загруженные изображения
        Yandex.getUploadedFiles((error, response) => {
          if (error) {
            console.error('Ошибка получения файлов:', error);
            if (content) {
              content.innerHTML = '<div class="ui negative message">Ошибка загрузки файлов</div>';
            }            
            return;
          }

          if (response && response.items) {
            // Отрисовываем все полученные изображения
            previewModal.showImages(response.items);
          } else {
            if (content) {
              content.innerHTML = '<div class="ui info message">Нет загруженных файлов</div>';
            }            
          }
        });
      });
    }

    // Обработчик клика по кнопке "Отправить на диск"
    const sendButton = this.element.querySelector('.send');
    if (sendButton) {
      sendButton.addEventListener('click', () => {
        // Получаем модальное окно загрузки изображений
        const uploadModal = App.getModal('fileUploader');

        if (!uploadModal) {
          console.error('Модальное окно upload не найдено');
          return;
        }

        // Получаем все выделенные изображения (с классом selected)
        const selectedWrappers = this.imagesGrid ? this.imagesGrid.querySelectorAll('.image-wrapper.selected') : [];
        const selectedImages = Array.from(selectedWrappers).map(wrapper => {
          const img = wrapper.querySelector('img');
          return {
            url: img ? img.src : '',
            id: img ? img.dataset.id || Date.now() + Math.random() : Date.now()
          };
        });

        if (selectedImages.length === 0) {
          alert('Выберите хотя бы одно изображение');
          return;
        }

        // Открываем модальное окно
        uploadModal.open();

        // Отрисовываем все выделенные изображения
        uploadModal.showImages(selectedImages);
      });
    }
  }

  /**
   * Очищает отрисованные изображения
   */
  clear() {
    if (this.imagesGrid) {
      this.imagesGrid.innerHTML = '';
    }
    // Сбрасываем предпросмотр
    if (this.previewContainer) {
      this.previewContainer.src = 'https://yugcleaning.ru/wp-content/themes/consultix/images/no-image-found-360x250.png';
    }
    // Обновляем состояние кнопок
    this.checkButtonText();
  }

  /**
   * Отрисовывает изображения.
  */
  drawImages(images) {
    // Очищаем предыдущие изображения
    this.clear();

    // Проверяем количество переданных изображений
    const selectAllButton = this.element.querySelector('.select-all');
    const sendButton = this.element.querySelector('.send');

    if (images && images.length > 0) {
      // Если количество изображений положительное, удаляем класс disabled у кнопки "Выбрать всё"
      if (selectAllButton) {
        selectAllButton.classList.remove('disabled');
      }

      // Для каждого изображения формируем разметку
      const imagesHTML = images.map(image => {
        return `<div class='four wide column ui medium image-wrapper'>
                  <img src="${image.url}" data-id="${image.id}" />
                </div>`;
      });

      // Добавляем сформированную разметку к уже существующей
      if (this.imagesGrid) {
        this.imagesGrid.innerHTML = imagesHTML.join('');
      }      

      // Обновляем состояние кнопок
      this.checkButtonText();
    } else {
      if (selectAllButton) {
        selectAllButton.classList.add('disabled');
      }
      this.checkButtonText();
    }
  }

  /**
   * Контроллирует кнопки выделения всех изображений и отправки изображений на диск
   */
  checkButtonText(){
    // Получаем все отрисованные изображения
    const imageWrappers = this.imagesGrid ? this.imagesGrid.querySelectorAll('.image-wrapper') : [];

    // Получаем кнопки с классом select-all и send
    const selectAllButton = this.element.querySelector('.select-all');
    const sendButton = this.element.querySelector('.send');

    if (imageWrappers.length === 0) {
      // Если нет изображений, блокируем кнопки
      if (selectAllButton) {
        selectAllButton.textContent = 'Выбрать всё';
        selectAllButton.classList.add('disabled');
      }
      if (sendButton) {
        sendButton.classList.add('disabled');
      }
      return;
    }
    
    // Проверяем, все ли изображения имеют класс selected
    const allSelected = Array.from(imageWrappers).every(wrapper =>
      wrapper.classList.contains('selected')
    );

    // Проверяем, есть ли хотя бы одно изображение с классом selected
    const hasSelected = Array.from(imageWrappers).some(wrapper =>
    wrapper.classList.contains('selected')
    );

    // Обновляем текст кнопки select-all
    if (selectAllButton) {
      if (allSelected && imageWrappers.length > 0) {
        selectAllButton.textContent = 'Снять выделение';
      } else {
        selectAllButton.textContent = 'Выбрать всё';
      }
    }

    // Обновляем состояние кнопки send
    if (sendButton) {
      if (hasSelected) {
        sendButton.classList.remove('disabled');
      } else {
        sendButton.classList.add('disabled');
      }
    }
  }
}