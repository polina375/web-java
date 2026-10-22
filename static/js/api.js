
const API_URL = '/api/students';

async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (response.status === 204) {
            return null;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const message = data?.error?.message
                || data?.message
                || response.statusText
                || 'Неизвестная ошибка';

            const error = new Error(`Код ${response.status}: ${message}`);
            error.status = response.status;
            error.details = data?.error?.details || null;
            throw error;
        }

        return data;
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error('Не удалось подключиться к Spring Boot');
        }

        throw error;
    }
}

// Получение списка студентов с серверной фильтрацией
async function getStudents(filters = {}) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
        if (value !== '' && value !== null && value !== undefined) {
            params.append(key, value);
        }
    }

    // Параметры пагинации по умолчанию
    if (!params.has('page')) {
        params.set('page', '0');
    }

    if (!params.has('size')) {
        params.set('size', '20');
    }

    const result = await apiRequest(
        `${API_URL}/search?${params.toString()}`
    );

    // Сохраняем формат массива для старого frontend
    return result.content;
}

// Получение одного студента
function getStudentById(id) {
    return apiRequest(`${API_URL}/${id}`);
}

// Добавление студента
function addStudent(student) {
    return apiRequest(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(student)
    });
}

// Полное обновление студента
function updateStudent(id, student) {
    return apiRequest(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(student)
    });
}

// Удаление студента
function deleteStudent(id) {
    return apiRequest(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
}
