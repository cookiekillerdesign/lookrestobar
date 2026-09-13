/** Moves one item inside a list and returns a new array. */
export function move(list, from, to) {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * HTML5 drag-and-drop wiring shared by the project list and the media grid.
 *
 * Native DnD does not fire on touch screens at all, which is why every list
 * that uses this also renders up/down buttons — that pair covers phones and
 * keyboards, not just a mouse.
 */
export function dragProps(index, dragIndex, setDragIndex, onDrop) {
  return {
    draggable: true,
    onDragStart: (e) => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      // Firefox refuses to start a drag unless some data is set.
      try { e.dataTransfer.setData('text/plain', String(index)); } catch { /* ignore */ }
    },
    onDragOver: (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; },
    onDrop: (e) => {
      e.preventDefault();
      if (dragIndex !== null && dragIndex !== index) onDrop(dragIndex, index);
      setDragIndex(null);
    },
    onDragEnd: () => setDragIndex(null)
  };
}
