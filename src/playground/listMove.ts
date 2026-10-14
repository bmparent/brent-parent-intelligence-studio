/** Pointer sorting for bounded editor lists. Only dedicated handles suppress touch scrolling. */
type ListTarget = { list: HTMLElement; before: HTMLElement | null; label: string };
export function startListMove(event: React.PointerEvent<HTMLButtonElement>, valid: () => boolean, commit: (id: string, before: string, parent?: string) => void, settings: {nested?: boolean} = {}): () => void {
  if (!event.isPrimary || event.button !== 0) return () => {};
  const handle = event.currentTarget, row = handle.closest<HTMLElement>('[data-sort-id]'), list = row?.parentElement;
  if (!row || !list) return () => {};
  const scope = settings.nested ? list.closest<HTMLElement>('.pg-block-tree') : list;
  if (!scope) return () => {};
  event.preventDefault(); event.stopPropagation();
  const abort = new AbortController(), options = {signal: abort.signal};
  const pointer = event.pointerId, startX = event.clientX, startY = event.clientY, rect = row.getBoundingClientRect();
  let x = startX, y = startY, moved = false, ghost: HTMLElement | null = null, marker: HTMLElement | null = null, frame = 0, marked: HTMLElement | null = null, last = 0;
  function cancel() {
    abort.abort(); cancelAnimationFrame(frame); ghost?.remove(); marker?.remove(); row!.style.opacity = '';
    marked?.classList.remove('pg-list-target');
    if (handle.hasPointerCapture(pointer)) handle.releasePointerCapture(pointer);
  }
  function locate(): ListTarget | null {
    const destination = settings.nested ? document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-sort-container]') : list;
    if (!destination || !scope!.contains(destination) || row!.contains(destination)) return null;
    const bounds = destination.getBoundingClientRect();
    if (x < bounds.left || x > bounds.right || y < Math.max(0, bounds.top) || y > Math.min(innerHeight, bounds.bottom)) return null;
    const rows = Array.from(destination.children).filter((el): el is HTMLElement => el instanceof HTMLElement && !!el.dataset.sortId && el !== row);
    const before = rows.find(el => { const r = (el.firstElementChild || el).getBoundingClientRect(); return y < r.top + r.height / 2; }) || null;
    // Section lists keep their pinned footer as the final target; nested block lists allow append.
    if (!before && !settings.nested) return null;
    const name = destination.dataset.sortName || 'container';
    return {list: destination, before, label: before ? `Before ${before.firstElementChild?.textContent?.trim() || 'element'} in ${name}` : `At end of ${name}`};
  }
  function paint(time: number) {
    if (!valid()) { cancel(); return; }
    const dt = Math.min(32, time - (last || time - 16)); last = time;
    const scroller = scope!.closest<HTMLElement>('.pg-sidebar');
    if (scroller) { const r = scroller.getBoundingClientRect(); if (y < r.top + 36) scroller.scrollTop -= dt * .5; else if (y > r.bottom - 36) scroller.scrollTop += dt * .5; }
    const target = locate();
    if (target?.list !== marked) { marked?.classList.remove('pg-list-target'); marked = target?.list || null; marked?.classList.add('pg-list-target'); }
    if (marker) {
      marker.hidden = !target;
      if (target) { const r = (target.before || target.list).getBoundingClientRect(); Object.assign(marker.style, {left: r.left + 'px', top: (target.before ? r.top : r.bottom - 22) + 'px', width: r.width + 'px'}); marker.textContent = target.label; }
    }
    if (ghost) ghost.style.transform = `translate3d(${x - (startX - rect.left)}px,${y - (startY - rect.top)}px,0)`;
    frame = requestAnimationFrame(paint);
  }
  handle.setPointerCapture(pointer);
  document.addEventListener('pointermove', e => {
    if (e.pointerId !== pointer) return; x = e.clientX; y = e.clientY;
    if (!moved && Math.hypot(x - startX, y - startY) >= 6) {
      moved = true; ghost = row.cloneNode(true) as HTMLElement; ghost.removeAttribute('data-sort-id'); ghost.querySelectorAll('[id]').forEach(el => el.removeAttribute('id')); ghost.inert = true; ghost.setAttribute('aria-hidden', 'true');
      Object.assign(ghost.style, {position: 'fixed', left: '0', top: '0', width: rect.width + 'px', height: rect.height + 'px', zIndex: '10000', pointerEvents: 'none', background: '#f4f7ed', opacity: '.65', boxShadow: '0 8px 24px #0004'}); document.body.append(ghost); row.style.opacity = '.3';
      marker = document.createElement('div'); marker.className = 'pg-list-insertion'; marker.setAttribute('role', 'status'); Object.assign(marker.style, {position: 'fixed', pointerEvents: 'none', zIndex: '10001', borderTop: '2px solid #517835', background: '#edf5df', color: '#21331c', font: '12px system-ui', minHeight: '20px'}); document.body.append(marker);
      frame = requestAnimationFrame(paint);
    }
    if (moved) e.preventDefault();
  }, {...options, passive: false});
  document.addEventListener('pointerup', e => { if (e.pointerId !== pointer) return; x = e.clientX; y = e.clientY; const target = locate(), apply = moved && valid() && target; cancel(); if (apply) commit(row.dataset.sortId!, target!.before?.dataset.sortId || '', target!.list.dataset.sortContainer); }, options);
  document.addEventListener('pointercancel', cancel, options); handle.addEventListener('lostpointercapture', cancel, options); window.addEventListener('blur', cancel, options); window.addEventListener('resize', cancel, options); document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); }, options); document.addEventListener('keydown', e => { if (e.key === 'Escape') cancel(); }, options);
  return cancel;
}
