/**
 * Nalvost Beauty - Interactive Script Logic
 * Deskripsi: Mengatur animasi salju (canvas), modal pembelian, integrasi WhatsApp,
 * pesan toast, dan pengoptimalan tab aktif.
 */

const NALVOST_CONFIG = {
    whatsappNumber: "6281928636439",
    brandName: "Nalvost Beauty",
    ownerHandle: "@nadinfth",
    snowDensityMobile: 140,
    snowDensityDesktop: 260
};

// Global Application State
const state = {
    snowFlakes: [],
    animationFrameId: null,
    isTabActive: true
};

let canvas = null;
let ctx = null;

/**
 * Inisialisasi canvas salju dan mendengarkan event resize serta visibility window
 */
function initSnowCanvas() {
    canvas = document.getElementById('snow-canvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        initFlakes();
    });
    
    initFlakes();

    // Hentikan sementara animasi jika pengguna berpindah tab demi hemat daya
    document.addEventListener('visibilitychange', () => {
        state.isTabActive = !document.hidden;
        if (state.isTabActive) {
            drawSnow();
        }
    });
}

/**
 * Mengatur ukuran canvas sesuai dengan lebar & tinggi jendela layar
 */
function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Menghitung jumlah partikel salju berdasarkan ukuran layar
 */
function getFlakeCount() {
    return window.innerWidth < 768 
        ? NALVOST_CONFIG.snowDensityMobile 
        : NALVOST_CONFIG.snowDensityDesktop;
}

/**
 * Mengisi array salju dengan properti gerak, rotasi, ukuran, dan kristal
 */
function initFlakes() {
    if (!canvas) return;
    state.snowFlakes.length = 0;
    const numFlakes = getFlakeCount();

    for (let i = 0; i < numFlakes; i++) {
        const isCrystal = Math.random() > 0.55;
        state.snowFlakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: isCrystal ? Math.random() * 4.5 + 3 : Math.random() * 3 + 1.2,
            speedY: Math.random() * 1.1 + 0.35,
            speedX: Math.random() * 0.4 - 0.2,
            swayAngle: Math.random() * Math.PI * 2,
            swaySpeed: Math.random() * 0.02 + 0.01,
            opacity: Math.random() * 0.5 + 0.5,
            isCrystal: isCrystal,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.03
        });
    }
}

/**
 * Menggambar kristal salju simetris 6 sisi dengan nuansa ice blue
 */
function drawSnowflakeCrystal(x, y, radius, opacity, rotation) {
    if (!ctx) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fillStyle = `rgba(186, 230, 254, ${opacity * 0.95})`;
    ctx.lineWidth = 1.4;
    ctx.shadowColor = 'rgba(14, 165, 233, 0.75)';
    ctx.shadowBlur = 8;

    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -radius);
        ctx.stroke();

        if (radius > 3.2) {
            ctx.beginPath();
            ctx.moveTo(0, -radius * 0.5);
            ctx.lineTo(radius * 0.35, -radius * 0.75);
            ctx.moveTo(0, -radius * 0.5);
            ctx.lineTo(-radius * 0.35, -radius * 0.75);
            ctx.stroke();
        }

        ctx.rotate(Math.PI / 3);
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * Frame per frame render loop untuk animasi salju di seluruh layar
 */
function drawSnow() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < state.snowFlakes.length; i++) {
        const f = state.snowFlakes[i];
        f.swayAngle += f.swaySpeed;
        const currentX = f.x + Math.sin(f.swayAngle) * 2.5;

        if (f.isCrystal) {
            f.rotation += f.rotSpeed;
            drawSnowflakeCrystal(currentX, f.y, f.radius, f.opacity, f.rotation);
        } else {
            ctx.save();
            ctx.beginPath();
            ctx.arc(currentX, f.y, f.radius, 0, Math.PI * 2);
            
            const grad = ctx.createRadialGradient(currentX, f.y, 0, currentX, f.y, f.radius * 2);
            grad.addColorStop(0, `rgba(255, 255, 255, ${f.opacity})`);
            grad.addColorStop(0.5, `rgba(186, 230, 254, ${f.opacity * 0.85})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = grad;
            ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.restore();
        }

        f.y += f.speedY;
        f.x += f.speedX;

        // Reset partikel jika keluar dari layar
        if (f.y > canvas.height + 15) {
            f.y = -20;
            f.x = Math.random() * canvas.width;
        }
        if (f.x > canvas.width + 15) {
            f.x = -15;
        } else if (f.x < -15) {
            f.x = canvas.width + 15;
        }
    }

    if (state.isTabActive) {
        state.animationFrameId = requestAnimationFrame(drawSnow);
    }
}

/**
 * Membuka modal pemesanan dengan informasi produk & tautan WhatsApp terformat
 * @param {string} productName - Nama Produk
 * @param {string} price - Harga Produk
 */
function openBuyModal(productName, price) {
    const modalProductName = document.getElementById('modal-product-name');
    const modalProductPrice = document.getElementById('modal-product-price');
    const modalWaBtn = document.getElementById('modal-wa-btn');
    const buyModal = document.getElementById('buy-modal');

    if (modalProductName) modalProductName.innerText = productName;
    if (modalProductPrice) modalProductPrice.innerText = price;
    
    if (modalWaBtn) {
        const message = `Halo Admin ${NALVOST_CONFIG.brandName}, saya ingin memesan produk Best Seller: ${productName} (${price}). Apakah stok masih tersedia?`;
        const encodedMessage = encodeURIComponent(message);
        modalWaBtn.href = `https://wa.me/${NALVOST_CONFIG.whatsappNumber}?text=${encodedMessage}`;
    }

    if (buyModal) {
        buyModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Menutup modal pemesanan dan mengembalikan scroll halaman
 */
function closeBuyModal() {
    const buyModal = document.getElementById('buy-modal');
    if (buyModal) {
        buyModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

/**
 * Menampilkan notifikasi melayang di sudut kanan bawah
 * @param {string} message - Teks notifikasi
 * @param {string} type - Tipe: 'success' | 'info'
 */
function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-600' : 'bg-sky-600';
    toast.className = `${bgClass} text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 transition-all duration-300 transform translate-y-5 opacity-0 pointer-events-auto`;
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${message}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-5', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-y-5', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Salin teks ke papan klip dengan fallback aman
 * @param {string} text - Teks yang akan disalin
 */
function copyToClipboard(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
        document.execCommand('copy');
        showToast('Tautan berhasil disalin!');
    } catch (err) {
        console.error('Gagal menyalin:', err);
    }
    document.body.removeChild(tempInput);
}

document.addEventListener('DOMContentLoaded', () => {
    // Jalankan animasi salju
    initSnowCanvas();
    drawSnow();

    // Tutup modal jika menekan tombol Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeBuyModal();
        }
    });

    // Tutup modal jika mengklik area luar (overlay)
    const buyModal = document.getElementById('buy-modal');
    if (buyModal) {
        buyModal.addEventListener('click', (e) => {
            if (e.target === buyModal) {
                closeBuyModal();
            }
        });
    }

    // Efek bayangan header saat di-scroll
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('shadow-md');
            } else {
                header.classList.remove('shadow-md');
            }
        });
    }
});