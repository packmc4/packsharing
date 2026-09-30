// ========================================================
// 1. CANVAS HẠT CÔNG NGHỆ TƯƠNG TÁC CHUỘT (TECH PARTICLES)
// ========================================================
const canvas = document.getElementById('techCanvas');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// Quản lý vị trí con trỏ chuột
const mouse = {
  x: null,
  y: null,
  radius: 140 // Bán kính kết nối tia sáng với chuột
};

window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

// Khởi tạo các hạt công nghệ
const particleCount = 75;
const particles = [];

class TechParticle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.7;
    this.vy = (Math.random() - 0.5) * 0.7;
    this.radius = Math.random() * 1.8 + 1.2;
    this.baseAlpha = Math.random() * 0.4 + 0.2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Va chạm cạnh màn hình
    if (this.x < 0 || this.x > width) this.vx = -this.vx;
    if (this.y < 0 || this.y > height) this.vy = -this.vy;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 240, 255, ${this.baseAlpha})`;
    ctx.fill();
  }
}

for (let i = 0; i < particleCount; i++) {
  particles.push(new TechParticle());
}

function animateParticles() {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    // Kết nối các hạt ở gần nhau
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - dist / 100)})`;
        ctx.lineWidth = 0.7;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }

    // Tương tác phát sáng và nối tia đến chuột
    if (mouse.x !== null && mouse.y !== null) {
      const mdx = particles[i].x - mouse.x;
      const mdy = particles[i].y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

      if (mdist < mouse.radius) {
        const factor = 1 - mdist / mouse.radius;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.45 * factor})`;
        ctx.lineWidth = 1.2;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();

        // Hạt rực sáng lên khi ở gần chuột
        ctx.beginPath();
        ctx.arc(particles[i].x, particles[i].y, particles[i].radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${factor * 0.9})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f0ff';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset blur
      }
    }
  }

  requestAnimationFrame(animateParticles);
}
animateParticles();

// ========================================================
// 2. LOGIC QUẢN LÝ DỮ LIỆU & RENDER PACK
// ========================================================
const packGrid = document.getElementById('packGrid');
const footerNote = document.getElementById('footerNote');
const packCounter = document.getElementById('packCounter');
const defaultPlaceholder = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80";

let currentVersion = 'java';
let searchQuery = '';

// Bộ lọc tìm kiếm theo tiêu đề hoặc từ khóa ngầm (key)
function filterPacks(list) {
  if (!searchQuery) return list;
  const q = searchQuery.toLowerCase().trim();

  return list.filter((pack) => {
    const titleMatch = pack.title && pack.title.toLowerCase().includes(q);
    let keyMatch = false;
    const packKey = pack.key || pack.keys;

    if (packKey) {
      if (Array.isArray(packKey)) {
        keyMatch = packKey.some((k) => String(k).toLowerCase().includes(q));
      } else if (typeof packKey === 'string') {
        keyMatch = packKey.toLowerCase().includes(q);
      }
    }
    return titleMatch || keyMatch;
  });
}

// Render danh sách pack
function renderPacks(list) {
  packGrid.innerHTML = '';
  packCounter.textContent = `ITEMS: ${list.length}`;

  if (!list || list.length === 0) {
    packGrid.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 1.8rem; margin-bottom: 8px;">[!] NO DATA FOUND</div>
        <div>Không tìm thấy pack nào với từ khóa "${searchQuery}"</div>
      </div>
    `;
    return;
  }

  list.forEach((pack) => {
    const card = document.createElement('div');
    card.className = 'pack-card';

    let currentIndex = 0;
    let intervalId = null;
    const totalImages = pack.images ? pack.images.length : 0;

    const slidesHtml = (pack.images || []).map(img => `
      <div class="carousel-slide">
        <img src="${img}" onerror="this.src='${defaultPlaceholder}'" alt="preview">
      </div>
    `).join('');

    const navHtml = totalImages > 1 ? `
      <button class="carousel-nav carousel-prev">❮</button>
      <button class="carousel-nav carousel-next">❯</button>
    ` : '';

    card.innerHTML = `
      <div class="carousel-wrap">
        <div class="carousel-track">${slidesHtml}</div>
        ${navHtml}
      </div>
      <div class="card-footer">
        <div class="card-title" title="${pack.title}">${pack.title}</div>
        <div class="card-meta">
          <span>${currentVersion.toUpperCase()}</span>
          <span>${totalImages} PICS</span>
        </div>
      </div>
    `;

    const track = card.querySelector('.carousel-track');

    function updateSlide(idx) {
      currentIndex = idx;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function nextSlide() {
      let nextIdx = (currentIndex + 1) % totalImages;
      updateSlide(nextIdx);
    }

    function prevSlide() {
      let prevIdx = (currentIndex - 1 + totalImages) % totalImages;
      updateSlide(prevIdx);
    }

    if (totalImages > 1) {
      card.querySelector('.carousel-next').addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
      });

      card.querySelector('.carousel-prev').addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
      });

      // Tự động lướt ảnh khi rê chuột vào card
      card.addEventListener('mouseenter', () => {
        intervalId = setInterval(nextSlide, 1600);
      });

      card.addEventListener('mouseleave', () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      });
    }

    // Nhấn vào card để xem chi tiết
    card.addEventListener('click', () => {
      openModal(pack, currentIndex);
    });

    packGrid.appendChild(card);
  });
}

function updateView() {
  if (currentVersion === 'java') {
    renderPacks(filterPacks(javaPackList));
    footerNote.textContent = notes.java;
  } else {
    renderPacks(filterPacks(bedrockPackList));
    footerNote.textContent = notes.bedrock;
  }
}

// Chuyển đổi tab Java / Bedrock
function switchVersion(type) {
  currentVersion = type;
  document.getElementById('tabJava').classList.toggle('active', type === 'java');
  document.getElementById('tabBedrock').classList.toggle('active', type === 'bedrock');
  updateView();
}

// ========================================================
// 3. TÌM KIẾM & TAGS NHANH
// ========================================================
const searchInput = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('searchClearBtn');
const cyberTags = document.querySelectorAll('.cyber-tag');

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  searchClearBtn.style.display = searchQuery ? 'block' : 'none';
  updateView();
});

searchClearBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClearBtn.style.display = 'none';
  searchInput.focus();
  updateView();
});

cyberTags.forEach((btn) => {
  btn.addEventListener('click', () => {
    const tag = btn.getAttribute('data-tag');
    searchInput.value = tag;
    searchQuery = tag;
    searchClearBtn.style.display = 'block';
    updateView();
  });
});

// ========================================================
// 4. MODAL CHI TIẾT PACK
// ========================================================
const detailModal = document.getElementById('detailModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const modalTrack = document.getElementById('modalCarouselTrack');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalLinkBtn = document.getElementById('modalLinkBtn');
const btnCopyLink = document.getElementById('btnCopyLink');

let modalIndex = 0;
let modalTotal = 0;
let activeLink = '';

function updateModalSlide(idx) {
  modalIndex = idx;
  modalTrack.style.transform = `translateX(-${modalIndex * 100}%)`;
}

modalNext.addEventListener('click', (e) => {
  e.stopPropagation();
  let next = (modalIndex + 1) % modalTotal;
  updateModalSlide(next);
});

modalPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  let prev = (modalIndex - 1 + modalTotal) % modalTotal;
  updateModalSlide(prev);
});

function openModal(pack, initialIdx = 0) {
  modalTotal = pack.images ? pack.images.length : 0;
  modalIndex = initialIdx;

  modalTrack.innerHTML = (pack.images || []).map(img => `
    <div class="carousel-slide">
      <img src="${img}" onerror="this.src='${defaultPlaceholder}'" alt="preview">
    </div>
  `).join('');

  if (modalTotal > 1) {
    modalPrev.style.display = 'flex';
    modalNext.style.display = 'flex';
  } else {
    modalPrev.style.display = 'none';
    modalNext.style.display = 'none';
  }

  updateModalSlide(modalIndex);
  modalTitle.textContent = pack.title;
  modalDesc.textContent = pack.desc || "Không có mô tả chi tiết cho pack này.";
  
  activeLink = pack.link;
  modalLinkBtn.href = pack.link;
  btnCopyLink.textContent = "📋 SAO CHÉP LINK";

  detailModal.classList.add('active');
}

function closeModal() {
  detailModal.classList.remove('active');
}

btnCloseModal.addEventListener('click', closeModal);
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) closeModal();
});

btnCopyLink.addEventListener('click', () => {
  navigator.clipboard.writeText(activeLink).then(() => {
    btnCopyLink.textContent = "✅ ĐÃ SAO CHÉP!";
    setTimeout(() => {
      btnCopyLink.textContent = "📋 SAO CHÉP LINK";
    }, 2000);
  });
});

// ========================================================
// 5. HỘP THƯ THỐNG BÁO
// ========================================================
const mailBtn = document.getElementById('mailBtn');
const mailModal = document.getElementById('mailModal');
const btnCloseMail = document.getElementById('btnCloseMail');
const btnConfirmMail = document.getElementById('btnConfirmMail');
const mailRedDot = document.getElementById('mailRedDot');

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

const letterHash = simpleHash(letterData.title + "::" + letterData.content);
const savedHash = localStorage.getItem('packmc_letter_hash');

if (savedHash !== letterHash) {
  mailRedDot.classList.add('show');
}

function openMail() {
  document.getElementById('mailTitle').textContent = letterData.title;
  document.getElementById('mailBody').textContent = letterData.content;
  mailModal.classList.add('active');

  localStorage.setItem('packmc_letter_hash', letterHash);
  mailRedDot.classList.remove('show');
}

function closeMail() {
  mailModal.classList.remove('active');
}

mailBtn.addEventListener('click', openMail);
btnCloseMail.addEventListener('click', closeMail);
btnConfirmMail.addEventListener('click', closeMail);
mailModal.addEventListener('click', (e) => {
  if (e.target === mailModal) closeMail();
});

// Khởi chạy ban đầu
updateView();