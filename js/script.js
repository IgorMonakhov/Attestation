    // Холст для рисования изображений
    let canvas = document.getElementById("scene_canvas")

    // Текущее количество очков
    let score = 0

    // HTML-элемент для отображения количества очков
    let score_element = document.getElementById("score")
    let endofgame_element = document.getElementById("endofgame")

    // Число, задающее частоту кадров.
    // Означает количество времени в секундах, которое занимает обработка 1 кадра
    // При значении 0.01 частота кадров будет 100 FPS (в идельных условиях)
    let frame_time = 0.01

    // Ширина дороги
    let bodySize = document.body.getBoundingClientRect();
    canvas.width = bodySize.width * 1;
    canvas.height = bodySize.height * 0.9;

    // Ширина холста в пикселях
    function get_width() {
        return canvas.clientWidth
    }

    // Высота холста в пикселях
    function get_height() {
        return canvas.clientHeight
    }

    // Массив X-координат препятствий
    let obstacles_x = []

    // Массив Y-координат препятствий
    let obstacles_y = []

    // Вертикальная скорость движения препятствия (пикселей в секунду)
    let obstacle_speed = 200

    // Координаты автомобиля. Изначально располагается в центре холста
    let car_x = get_width() / 2
    let car_y = get_height() / 2

    // Ширина и высота автомибя в пикселях
    let car_width = 50
    let car_height = 100

    // Изображение автомобиля
    let car_image = new Image()
    car_image.src = "images/Car.png"

    // Ширина и высота препятствия в пикселях
    let obstacle_width = 50
    let obstacle_height = 50

    // Изображение препятствия
    let obstacle_image = new Image()
    obstacle_image.src = "images/Barricade.png"

    // Время в секундах до появления следующего препятствия. Обновляется каждый кадр
    let time_to_next_obstacle = 0

    // Время в секундах между появлением препятствий. Не изменяется.
    let obstacle_spawn_period = 0.25

    // Объект для отображения трёхмерной графики
    let ctx = canvas.getContext("2d")

    // При движении мыши получаем координату курсора и записываем в координаты автомобиля
    canvas.onmousemove = (event) => {
        event = event || window.event; // IE fix

        car_x = event.pageX
        car_y = event.pageY
    }

    // Функция отрисовки изображения
    // image - изображение
    // x_location - X координата на холсте в пикселях
    // y_location - Y координата на холсте в пикселях
    // width - ширина изображения в пикселях
    // height - высота изображения в пикселях
    function draw_image(image, x_location, y_location, width, height) {

        // Координаты изображения нужно сместить на половину ширины и высоты,
        // т.к. браузер рисует картинку начиная с её левого верхнего угла
        let x = x_location - width / 2
        let y = y_location - height / 2

        // Библиотечная функция рисования
        ctx.drawImage(image, x, y, width, height)
    }

    // Вспомогательная функция для рисования автомобиля
    function draw_car() {
        draw_image(car_image, car_x, car_y, car_width, car_height)
    }

    // Вспомогательная функция для рисования препятствия по указанному номеру 
    function draw_obstacle(index) {
        // Получаем координаты препятствия по номеру из массивов
        let x = obstacles_x[index]
        let y = obstacles_y[index]

        draw_image(obstacle_image, x, y, obstacle_width, obstacle_height)
    }

    // Вспомогательная функция для получения случайного числа в диапазоне [min, max]
    function random_range(min, max) {
        return Math.random() * (max - min) + min
    }

    // Создать новое препятствие на верху холста со случайной X координатой
    function create_obstacle() {
        let x_min = 0
        let x_max = get_width()
        let y = 0

        // Получаем случайную X координату между 0 и шириной холста
        let x = random_range(x_min, x_max)

        // Добавляем новые координаты препятствия в массивы
        obstacles_x.push(x)
        obstacles_y.push(y)
    }

    // Удаляет препятствие по номеру
    function remove_obstacle(index) {
        obstacles_x.splice(index, 1)
        obstacles_y.splice(index, 1)
    }

    // Рисование всех препятствий, смещение их вниз по холсту и определение столкновения с игроком
    function update_obstacles() {
        // Идём по массиву всех препятствий.
        // Используем массив obstacles_x, хотя можно и obstacles_y, их длина одинаковая
        for (let i = 0; i < obstacles_x.length; i++) {
            // Рисуем препятствие с номером i
            draw_obstacle(i)

            // Смещаем i-ое препятствие на obstacle_speed * frame_time вниз
            // obstacle_speed - это пиксели в секунду
            // Чтобы получить скорость в пикселях в КАДР, нужно умножить это значение 
            // на время одного кадра.
            obstacles_y[i] += obstacle_speed * frame_time

            // Определяем расстояние от i-ого препятствия до игрока
            let dx = car_x - obstacles_x[i]
            let dy = car_y - obstacles_y[i]

            let distance_to_car = Math.sqrt(dx * dx + dy * dy)

            // Если от i-го препятствия до игрока менее 50 пикселей, то игра закончена
            if (distance_to_car < 50) {
                // TODO Collision!
                console.log("Collision!")
                game_over()
            }

            // Если препятствие вылезло за пределы холста, удаляем его
            if (obstacles_y[i] >= get_height()) {
                remove_obstacle(i)

                // Т.к. размер массива изменился после удаления i-го препятствия,
                // нужно уменьшить i на единицу, чтобы не пропустить следующее препятствие
                i--
            }
        }
    }

    // Функция обработки кадра
    // Вызывается 100 раз в секунду, в теории достигая частоты кадров в 100 FPS
    function update_loop() {
        // Очищаем холст, удаляя всё, что было нарисовано в предыдущем кадре
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Изменяем время до появления следующего препятствия
        if (time_to_next_obstacle <= 0) {
            // Если таймер дошёл до нуля, создаем новое препятствие
            create_obstacle()

            // И перезапускаем таймер, записывая в него период появления препятствий
            time_to_next_obstacle = obstacle_spawn_period
        }
        else {
            // Если таймер еще не дошел до нуля, вычитаем из него время кадра.
            // Таким образом счётчик таймера будет уменьшатся на 0,01 каждые 10 миллисекунд,
            // что равно 1 каждую секунду.
            // Таким способом можно измерять прошедшее реальное время
            time_to_next_obstacle -= frame_time
        }

        // Рисуем препятствия, смещаем их вниз и определеяем столкновение с игроком
        update_obstacles()

        // Рисуем автомобиль
        draw_car()

        // Увеличиваем счётчик очков на время кадра
        // Таким образом количество очков будет равно времени игры в секундах
        score += frame_time

        // Выводим количество очков в HTML-элемент.
        // .toFixed(1) ограничивает количество символов после точки до 1
        // Например, число 3.1215 будет выведено как 3.1
        score_element.innerText = score.toFixed(1)
    }

    // Вызывается при поражении
    function game_over() {
        // Останавливаем обработку кадров. Игра полностью останавливается, перестают двигаться
        // препятствия, игрок, не определяются столкновения и т.д.
        clearInterval(timer_handler)
        endofgame_element.style.visibility = "visible"
    }

    // Устанавливаем интервальный таймер для функции update_loop()
    // Браузер будет вызывать функцию update_loop каждые frame_time секунд
    // setInterval принимает время в миллисекундах, поэтому умножаем frame_time на 1000
    let timer_handler = setInterval(() => update_loop(), frame_time * 1000)