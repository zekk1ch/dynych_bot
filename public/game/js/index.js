import * as elements from './elements.js';
import * as app from './app.js';

elements.note.addEventListener('input', app.handleNoteInput);
elements.note.addEventListener('keydown', app.handleNoteKeydown);
elements.addNoteBtn.addEventListener('click', app.handleAddNoteClick);

elements.note.focus();
