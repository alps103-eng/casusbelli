let _sidebarOpen = false;
let _backdrop = null;

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  const hamburger = document.querySelector(".hamburger");
  if (!sidebar) return;

  sidebar.classList.add("open");
  _sidebarOpen = true;

  // create backdrop if missing
  if (!document.getElementById('sidebar-backdrop')) {
    _backdrop = document.createElement('div');
    _backdrop.id = 'sidebar-backdrop';
    _backdrop.className = 'sidebar-backdrop visible';
    _backdrop.addEventListener('click', closeSidebar);
    document.body.appendChild(_backdrop);
  } else {
    _backdrop = document.getElementById('sidebar-backdrop');
    _backdrop.classList.add('visible');
  }

  // lock body scroll
  document.body.style.overflow = 'hidden';

  // set aria
  if (hamburger) hamburger.setAttribute('aria-expanded', 'true');

  // focus first link inside sidebar
  const firstLink = sidebar.querySelector('a');
  if (firstLink) firstLink.focus();

  // close on ESC
  document.addEventListener('keydown', _handleKeydown);
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const hamburger = document.querySelector(".hamburger");
  if (!sidebar) return;

  sidebar.classList.remove("open");
  _sidebarOpen = false;

  if (_backdrop) _backdrop.classList.remove('visible');

  document.body.style.overflow = '';

  if (hamburger) hamburger.setAttribute('aria-expanded', 'false');

  document.removeEventListener('keydown', _handleKeydown);
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  if (_sidebarOpen) closeSidebar(); else openSidebar();
}

function _handleKeydown(e) {
  if (e.key === 'Escape') closeSidebar();
}

// copy "Viimased" into mobile sidebar (with fallback) and add aria attributes
document.addEventListener("DOMContentLoaded", () => {
  const source = document.getElementById("latestSidebar");
  const target = document.getElementById("sidebar");
  const hamburger = document.querySelector('.hamburger');

  if (!target) return;

  if (source) {
    // try to fetch articles.json and build the list from it; fallback to static source
    fetch('articles.json', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('no articles.json');
        return res.json();
      })
      .then(items => {
        // sort by date desc if present, otherwise keep order
        items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        const list = items.slice(0, 3).map(it => `<li><a href="${it.url}">${it.title}</a></li>`).join('\n');
        source.innerHTML = `<h3>Viimased</h3>\n<ul>\n${list}\n</ul>`;
        // populate mobile sidebar from the generated source
        target.innerHTML = source.innerHTML;

        // ensure hamburger visible and accessible
        if (hamburger) {
          hamburger.setAttribute('aria-controls', 'sidebar');
          hamburger.setAttribute('aria-expanded', 'false');
          hamburger.setAttribute('aria-label', 'Open sidebar menu');
          hamburger.style.display = '';
          hamburger.removeAttribute('aria-hidden');
        }
      })
      .catch(() => {
        // fallback to using the static HTML inside the page
        target.innerHTML = source.innerHTML;
        if (hamburger) {
          hamburger.setAttribute('aria-controls', 'sidebar');
          hamburger.setAttribute('aria-expanded', 'false');
          hamburger.setAttribute('aria-label', 'Open sidebar menu');
          hamburger.style.display = '';
          hamburger.removeAttribute('aria-hidden');
        }
      });
  } else {
    // no desktop "Viimased" on this page — hide hamburger and remove mobile sidebar
    if (hamburger) {
      hamburger.style.display = 'none';
      hamburger.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
    }

    if (target) {
      target.parentNode && target.parentNode.removeChild(target);
    }

    // nothing more to do
    return;
  }

  // set sidebar sticky offset to match header bottom (so it sits parallel to the title)
  function updateSidebarOffset() {
    const header = document.querySelector('.site-header');
    const sidebar = document.querySelector('.sidebar-desktop');
    if (!header || !sidebar) return;
    const headerHeight = Math.ceil(header.getBoundingClientRect().height);
    // a small gap after the header
    sidebar.style.top = (headerHeight + 8) + 'px';
  }

  // run on load and on resize; also shortly after DOMContentLoaded to account for fonts/images
  updateSidebarOffset();
  window.addEventListener('resize', updateSidebarOffset);
  window.addEventListener('load', updateSidebarOffset);

  // small retry in case fonts change layout after load
  setTimeout(updateSidebarOffset, 500);
});
