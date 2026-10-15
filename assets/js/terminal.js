(() => {
  const panels = [...document.querySelectorAll('.content-section')];
  const nav = document.getElementById('section-nav');
  const path = document.getElementById('terminal-path');
  if (!panels.length || !nav) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer, restore = () => {};
  const finish = () => { clearTimeout(timer); restore(); };
  const links = panels.map(panel => {
    const link = document.createElement('a');
    link.href = '#' + panel.id;
    link.textContent = panel.dataset.label;
    nav.appendChild(link);
    return link;
  });
  const show = (panel, animate) => {
    finish();
    panels.forEach((p, i) => {
      p.hidden = p !== panel;
      links[i].toggleAttribute('aria-current', p === panel);
    });
    path.textContent = '~/bofan/' + panel.dataset.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (!animate || reduce.matches) return;
    const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
    const items = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.textContent.trim()) items.push({node, text: node.textContent});
    }
    restore = () => items.forEach(({node, text}) => { node.textContent = text; });
    items.forEach(({node}) => { node.textContent = ''; });
    let index = 0, offset = 0;
    const step = () => {
      if (index >= items.length) { finish(); return; }
      const item = items[index];
      offset = Math.min(item.text.length, offset + 6);
      item.node.textContent = item.text.slice(0, offset);
      if (offset === item.text.length) { index++; offset = 0; }
      timer = setTimeout(step, 12);
    };
    step();
  };
  const fromHash = () => panels.find(p => '#' + p.id === location.hash || p.querySelector('[id="' + location.hash.slice(1).replace(/[^a-z0-9-]/gi, '') + '"]')) || panels[0];
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const panel = panels[links.indexOf(link)];
    history.replaceState(null, '', '#' + panel.id);
    show(panel, true);
  });
  window.addEventListener('hashchange', () => show(fromHash(), true));
  document.documentElement.classList.add('panels-ready');
  show(fromHash(), true);
})();
