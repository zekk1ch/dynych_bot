import * as elements from './elements.js';

const setNoteHeight = (px) => {
    elements.note.style.height = `${px}px`;
};

export const handleNoteInput = (ev) => {
    if (ev.target.value === '') {
        if (!elements.addNoteBtn.disabled) {
            elements.addNoteBtn.disabled = true;
        }
    } else {
        if (elements.addNoteBtn.disabled) {
            elements.addNoteBtn.disabled = false;
        }
    }
};

export const handleAddNoteClick = () => {
};
