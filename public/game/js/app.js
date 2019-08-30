import * as elements from './elements.js';
const chatId = window.location.pathname.split('/')[2];

let errorTimeoutId;
const showError = (err) => {
    if (errorTimeoutId) {
        clearTimeout(errorTimeoutId);
    }

    const { groups: { field, message } } = err.message.trim().match(/^(?<field>text|date)[-: ]+(?<message>.+)$/i) || { groups: {} };

    switch (field) {
        case 'text':
            elements.error.innerText = message;
            elements.error.classList.remove('empty');
            break;
        case 'date':
            elements.dateError.innerText = message;
            elements.dateError.classList.remove('empty');
            break;
        default:
            elements.error.innerText = err.message || 'Ошибка сервера...';
            elements.error.classList.remove('empty');
    }

    errorTimeoutId = setTimeout(() => {
        elements.error.classList.add('empty');
        elements.dateError.classList.add('empty');
    }, 2000);
};

const showSuccess = () => {
    elements.note.classList.add('success');
    setTimeout(() => {
        elements.note.classList.remove('success');
    }, 1000);
};

const reset = () => {
    elements.note.innerText = '';
    elements.error.classList.add('empty');
    elements.dateError.classList.add('empty');
    if (errorTimeoutId) {
        clearTimeout(errorTimeoutId);
    }
    elements.addNoteBtn.disabled = true;
};

const submitNote = async (text, date) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chatId,
            text,
            date,
        }),
    };

    const response = await fetch('/api/reminder', options);
    const message = await response.text();

    if (response.ok) {
        return message;
    } else {
        throw new Error(message);
    }
};

export const handleAddNoteClick = async () => {
    try {
        const date = elements.date.get();
        const text = elements.note.innerText;

        elements.error.innerText = '';
        elements.dateError.innerText = '';
        elements.spinner.hidden = false;

        await submitNote(text, date);

        reset();
        showSuccess();
    } catch (err) {
        console.error(err);
        showError(err);
    }
    elements.spinner.hidden = true;
};

export const handleNoteKeydown = (e) => {
    if (e.keyCode === 13 && e.shiftKey) {
        e.preventDefault();
        if (elements.note.innerText) {
            handleAddNoteClick();
        }
    }
};

export const handleNoteInput = () => {
    if (elements.note.innerText.trim()) {
        if (elements.addNoteBtn.disabled) {
            elements.addNoteBtn.disabled = false;
        }
    } else {
        if (!elements.addNoteBtn.disabled) {
            elements.addNoteBtn.disabled = true;
        }
    }
};

export const updateSelectedDate = () => {
    const date = elements.date.getDate();
    elements.selectedDate.innerText = date.toLocaleString('ru');
};

let numOfPickersShown = 0;
export const handleDateControlChange = (type) => {
    let control, label, picker;

    switch (type) {
        case 'date':
            control = elements.showDatePicker;
            label = elements.showDatePickerLabel;
            picker = elements.datePicker;
            break;
        case 'time':
            control = elements.showTimePicker;
            label = elements.showTimePickerLabel;
            picker = elements.timePicker;
            break;
        default:
            throw new Error(`Unknown date control – "${type}"`);
    }

    if (control.checked) {
        label.classList.remove('crossed');
        picker.classList.remove('hidden');
        if (numOfPickersShown++ === 0) {
            elements.selectedDate.classList.add('empty');
        }
    } else {
        label.classList.add('crossed');
        picker.classList.add('hidden');
        updateSelectedDate();
        if (numOfPickersShown-- === 1) {
            elements.selectedDate.classList.remove('empty');
        }
    }
};
