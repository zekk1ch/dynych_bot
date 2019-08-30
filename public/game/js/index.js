import * as elements from './elements.js';
import * as app from './app.js';

app.updateSelectedDate();
elements.note.addEventListener('input', app.handleNoteInput);
elements.note.addEventListener('keydown', app.handleNoteKeydown);
elements.addNoteBtn.addEventListener('click', app.handleAddNoteClick);
elements.showDatePicker.addEventListener('input', () => app.handleDateControlChange('date'));
elements.showTimePicker.addEventListener('input', () => app.handleDateControlChange('time'));

elements.note.focus();
