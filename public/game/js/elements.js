import Picker from '/js/pickerjs/picker.esm.js';

export const note = document.querySelector('#note');
export const addNoteBtn = document.querySelector('#add-note');
export const spinner = document.querySelector('#overlay-spinner');
export const datePicker = new Picker(document.querySelector('#date-picker'), {
    format: 'YYYY-MM-DD',
    headers: true,
    controls: true,
    inline: true,
    rows: 3,
    text: {
        year: 'Год',
        month: 'Месяц',
        day: 'День',
        hour: 'Часов',
    },
});
export const timePicker = new Picker(document.querySelector('#time-picker'), {
    format: 'HH:mm',
    headers: true,
    controls: true,
    inline: true,
    rows: 3,
    text: {
        hour: 'Часов',
        minute: 'Минут',
    },
});

