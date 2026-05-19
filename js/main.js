const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

function closeMenu() {
  if (!menuToggle || !nav) return;
  nav.classList.remove('open');
  menuToggle.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'פתח תפריט');
  document.body.classList.remove('menu-open');
}

function openMenu() {
  if (!menuToggle || !nav) return;
  nav.classList.add('open');
  menuToggle.classList.add('is-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'סגור תפריט');
  document.body.classList.add('menu-open');
}

if (window.addEventListener) {
  window.addEventListener('scroll', () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 10);
  });
}

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!nav.classList.contains('open')) return;
    const clickedInsideMenu = nav.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);
    if (!clickedInsideMenu && !clickedToggle) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

document.querySelectorAll('.faq-trigger').forEach((button, index) => {
  if (button.dataset.faqBound === 'true') return;
  button.dataset.faqBound = 'true';

  const item = button.closest('.faq-item');
  const panel = item?.querySelector('.faq-answer, .faq-panel');
  if (!item || !panel) return;

  if (!panel.id) {
    panel.id = `faq-panel-${index + 1}`;
  }
  if (!button.id) {
    button.id = `faq-trigger-${index + 1}`;
  }

  button.setAttribute('aria-controls', panel.id);
  panel.setAttribute('aria-labelledby', button.id);

  const setPanelState = (isOpen) => {
    item.classList.toggle('is-open', isOpen);
    item.classList.toggle('open', isOpen);
    button.setAttribute('aria-expanded', String(isOpen));
    panel.style.maxHeight = isOpen ? `${panel.scrollHeight}px` : '0px';
  };

  setPanelState(item.classList.contains('is-open') || item.classList.contains('open'));

  button.addEventListener('click', () => {
    const accordion = item.closest('[data-accordion]');
    const singleMode = accordion?.dataset.accordion === 'single';
    const isOpen = item.classList.contains('is-open') || item.classList.contains('open');

    if (singleMode && !isOpen) {
      accordion.querySelectorAll('.faq-item.is-open, .faq-item.open').forEach((openItem) => {
        if (openItem === item) return;
        const openButton = openItem.querySelector('.faq-trigger');
        const openPanel = openItem.querySelector('.faq-answer, .faq-panel');
        openItem.classList.remove('is-open', 'open');
        if (openButton) openButton.setAttribute('aria-expanded', 'false');
        if (openPanel) {
          openPanel.style.maxHeight = '0px';
        }
      });
    }

    setPanelState(!isOpen);
  });
});

document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;
    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        valid = false;
        field.setAttribute('aria-invalid', 'true');
      } else {
        field.removeAttribute('aria-invalid');
      }
    });
    if (!valid) {
      event.preventDefault();
      alert('אנא מלאו את כל שדות החובה.');
    }
  });
});

function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }

  return new Promise((resolve, reject) => {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'absolute';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    temp.select();
    try {
      document.execCommand('copy');
      resolve();
    } catch (error) {
      reject(error);
    }
    document.body.removeChild(temp);
  });
}

document.querySelectorAll('[data-share]').forEach((shareBlock) => {
  const pageUrl = window.location.href;
  const pageTitle = document.querySelector('h1')?.textContent?.trim() || document.title;
  const feedback = shareBlock.querySelector('[data-share-feedback]');
  const setFeedback = (message) => {
    if (!feedback) return;
    feedback.textContent = message;
    window.setTimeout(() => {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2200);
  };

  const platforms = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${pageTitle} ${pageUrl}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`
  };

  shareBlock.querySelectorAll('[data-share-platform], [data-share-network]').forEach((link) => {
    const platform = link.getAttribute('data-share-platform') || link.getAttribute('data-share-network');
    const href = platforms[platform];
    if (!href) return;
    link.setAttribute('href', href);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  shareBlock.querySelector('[data-share-native]')?.addEventListener('click', async () => {
    if (!navigator.share) {
      setFeedback('שיתוף מהיר לא נתמך בדפדפן זה');
      return;
    }
    try {
      await navigator.share({ title: pageTitle, url: pageUrl });
    } catch (_error) {
      // User cancelled share dialog.
    }
  });

  shareBlock.querySelector('[data-share-copy]')?.addEventListener('click', async () => {
    try {
      await copyTextToClipboard(pageUrl);
      setFeedback('הקישור הועתק');
    } catch (_error) {
      setFeedback('לא ניתן להעתיק כרגע');
    }
  });

  shareBlock.querySelector('[data-share-instagram]')?.addEventListener('click', async () => {
    try {
      await copyTextToClipboard(pageUrl);
      setFeedback('הקישור הועתק, ניתן לשתף באינסטגרם');
    } catch (_error) {
      setFeedback('לא ניתן להעתיק כרגע');
    }
  });

  shareBlock.querySelector('[data-copy-share="copy"]')?.addEventListener('click', async () => {
    try {
      await copyTextToClipboard(pageUrl);
      setFeedback('הקישור הועתק');
    } catch (_error) {
      setFeedback('לא ניתן להעתיק כרגע');
    }
  });

  shareBlock.querySelector('[data-copy-share="instagram"]')?.addEventListener('click', async () => {
    try {
      await copyTextToClipboard(pageUrl);
      setFeedback('הקישור הועתק, ניתן לשתף באינסטגרם');
    } catch (_error) {
      setFeedback('לא ניתן להעתיק כרגע');
    }
  });
});
