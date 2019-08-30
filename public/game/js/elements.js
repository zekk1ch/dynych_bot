import Picker from '/js/pickerjs/picker.esm.js';
const isMobile = window.outerWidth < 600;
const monthNames = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const months = monthNames.reduce((acc, curr, index) => ({
    ...acc,
    [curr]: {
        index,
        name: curr,
    },
}), {});

export const note = document.querySelector('#note');
export const addNoteBtn = document.querySelector('#add-note');
export const spinner = document.querySelector('#overlay-spinner');
export const error = document.querySelector('#error');
export const dateError = document.querySelector('#date-error');
export const showDatePicker = document.querySelector('#show-date-picker');
export const showDatePickerLabel = document.querySelector('label[for="show-date-picker"]');
export const showTimePicker = document.querySelector('#show-time-picker');
export const showTimePickerLabel = document.querySelector('label[for="show-time-picker"]');
export const datePicker = document.querySelector('#date-picker');
export const timePicker = document.querySelector('#time-picker');
const DatePicker = new Picker(datePicker, {
    format: 'YYYY-MMMM-DD',
    headers: true,
    controls: !isMobile,
    inline: true,
    rows: 3,
    text: {
        year: 'Год',
        month: 'Месяц',
        day: 'День',
    },
    months: monthNames,
});
const TimePicker = new Picker(timePicker, {
    format: 'HH:mm',
    headers: true,
    controls: !isMobile,
    inline: true,
    rows: 3,
    text: {
        hour: 'Часов',
        minute: 'Минут',
    },
});
export const date = {
    get: () => {
        const [year, month, day] = DatePicker.getDate('YYYY-MMM-DD').split('-');
        const [hour, minute] = TimePicker.getDate('HH:mm').split(':');
        const date = new Date(year, months[month].index, day, hour, minute).getTime();

        let now = Date.now();
        now = now - now % 60000;
        if (now > date) {
            throw new Error('date: Дата уже прошла');
        }

        return date;
    },
    reset: () => {
        const now = new Date();
        DatePicker.setDate(now);
        TimePicker.setDate(now);
    },
};
