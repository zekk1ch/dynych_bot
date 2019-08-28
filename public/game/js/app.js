import * as elements from './elements.js';

const chatId = window.location.pathname.split('/')[2];

export const handleNoteInput = () => {
    if (elements.note.innerText === '') {
        if (!elements.addNoteBtn.disabled) {
            elements.addNoteBtn.disabled = true;
        }
    } else {
        if (elements.addNoteBtn.disabled) {
            elements.addNoteBtn.disabled = false;
        }
    }
};

const reset = () => {
    elements.note.innerText = '';
    elements.addNoteBtn.disabled = true;
    elements.datePicker.reset();
    elements.timePicker.reset();
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

// TODO: display response
export const handleAddNoteClick = async () => {
    elements.spinner.hidden = false;

    try {
        const text = elements.note.innerText;
        const [year, month, day] = elements.datePicker.getDate('YYYY-MM-DD').split('-');
        const [hour, minute] = elements.timePicker.getDate('HH:mm').split(':');
        const date = Date.UTC(year, month, day, hour, minute);

        const res = await submitNote(text, date);
        console.log(res);

        reset();
    } catch (err) {
        console.error(err);
    } finally {
        elements.spinner.hidden = true;
    }
};
