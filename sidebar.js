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
    target.innerHTML = source.innerHTML;

    // ensure hamburger has appropriate ARIA attributes
    if (hamburger) {
      hamburger.setAttribute('aria-controls', 'sidebar');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open sidebar menu');
      hamburger.style.display = ''; // ensure visible
      hamburger.removeAttribute('aria-hidden');
    }
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
