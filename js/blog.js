const filterButtons = document.querySelectorAll('.filter-btn');
const articleCards = document.querySelectorAll('.blog-card');
const articleCount = document.querySelector('[data-article-count]');

function updateCount(count) {
  if (articleCount) articleCount.textContent = `מציגים ${count} מאמרים`;
}

function activateFilter(category) {
  let visible = 0;
  filterButtons.forEach((btn) => {
    const isActive = btn.dataset.category === category;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  articleCards.forEach((card) => {
    const show = category === 'הכל' || card.dataset.category === category;
    card.style.display = show ? '' : 'none';
    if (show) visible += 1;
  });

  updateCount(visible);

  const emptyStateId = 'blog-empty-state';
  let emptyState = document.getElementById(emptyStateId);
  if (!visible) {
    if (!emptyState) {
      emptyState = document.createElement('p');
      emptyState.id = emptyStateId;
      emptyState.className = 'meta';
      emptyState.textContent = 'לא נמצאו מאמרים בקטגוריה הזו כרגע.';
      const cardsContainer = document.querySelector('#blog-grid');
      if (cardsContainer) cardsContainer.appendChild(emptyState);
    }
  } else if (emptyState) {
    emptyState.remove();
  }
}

if (filterButtons.length && articleCards.length) {
  updateCount(articleCards.length);

  const hash = decodeURIComponent(window.location.hash.replace('#category-', ''));
  const hasHashMatch = Array.from(filterButtons).some((btn) => btn.dataset.category === hash);
  if (hash && hasHashMatch) activateFilter(hash);

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      activateFilter(category);
      history.replaceState(null, '', `#category-${encodeURIComponent(category)}`);
    });
  });
}
