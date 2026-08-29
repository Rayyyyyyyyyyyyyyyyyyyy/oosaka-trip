document.querySelectorAll('.day-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const day = button.closest('.day');
    const willOpen = !day.classList.contains('open');
    document.querySelectorAll('.day.open').forEach((item) => {
      item.classList.remove('open');
      item.querySelector('.day-toggle').setAttribute('aria-expanded', 'false');
    });
    if (willOpen) {
      day.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

const countdown = document.querySelector('#countdown');
const departure = new Date('2026-09-10T10:15:00+08:00');
const days = Math.ceil((departure - Date.now()) / 86400000);
if (days > 0) countdown.textContent = `距離出發還有 ${days} 天`;
else if (days >= -6) countdown.textContent = '旅行進行中！';
else countdown.textContent = '六日小旅行 · 完成';
