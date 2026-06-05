// ==== GLOBAL STATE ====
let cart = JSON.parse(localStorage.getItem('luminaCart')) || [];
let currentTheme = localStorage.getItem('luminaTheme') || 'dark';
const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // Apply saved theme
    document.body.dataset.theme = currentTheme;
    updateThemeIcon();

    // V3 Anim #18: Page Curtains Out
    gsap.to(".curtain-left", { x: "-100%", duration: 1, ease: "power4.inOut" });
    gsap.to(".curtain-right", { x: "100%", duration: 1, ease: "power4.inOut" });

    initNavigation();
    initCart();
    initThemeToggle();
    if (!isTouchDevice) {
        initCursor();
        initMagneticButtons();
        initBeanTrail();
    }
    initScrollProgress();

    // V3 Fix #1: Lottie Preloader
    const preloader = document.getElementById("preloader");
    if(preloader) {
        initPreloader();
    } else {
        triggerPageSpecificInits();
    }
});

function triggerPageSpecificInits() {
    if (document.querySelector(".menu-grid")) initMenuLogic();
    if (document.querySelector("#custom-cup-svg")) initCustomizerLogic();
    initMaskReveals();
}

// ==== V3 Anim #8: MASK REVEALS ====
function initMaskReveals() {
    document.querySelectorAll(".mask-reveal").forEach(el => {
        gsap.to(el, {
            y: 0, opacity: 1, duration: 1, ease: "power4.out",
            scrollTrigger: { trigger: el, start: "top 85%" }
        });
    });
}

// ==== Preloader 4.0: Bouncing Beans ====
function initPreloader() {
    // Check if the user has already seen the preloader in this session
    if (sessionStorage.getItem('luminaLoaded')) {
        gsap.set("#preloader", { display: "none" });
        if (document.querySelector(".hero")) initHomeLogic();
        triggerPageSpecificInits();
        return;
    }
    
    // Set the flag so it doesn't show again this session
    sessionStorage.setItem('luminaLoaded', 'true');

    const tl = gsap.timeline({
        onComplete: () => {
            gsap.to("#preloader", { yPercent: -100, duration: 1.2, ease: "power4.inOut", force3D: true });
            if (document.querySelector(".hero")) initHomeLogic();
            triggerPageSpecificInits();
        }
    });

    // Animate the beans jumping in sequence
    tl.fromTo(".loader-bean", 
        { y: 0, rotation: -15, scale: 0.9 },
        { 
            y: -40, 
            rotation: 15, 
            scale: 1.1,
            duration: 0.4, 
            stagger: 0.15, 
            yoyo: true, 
            repeat: 5, 
            ease: "sine.inOut", 
            force3D: true 
        }
    )
    .to(".preloader-text", { opacity: 0, duration: 0.5, force3D: true }, "-=0.5");
}

// ==== V3 Anim #3 & #4: ELASTIC NAV LINKS & PILL ====
function initNavigation() {
    const navLinks = document.querySelectorAll('.elastic-link');
    const navPill = document.getElementById('nav-pill');

    if (!isTouchDevice && navPill) {
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                const rect = e.target.getBoundingClientRect();
                const parentRect = e.target.parentElement.parentElement.getBoundingClientRect();
                gsap.to(navPill, {
                    x: rect.left - parentRect.left,
                    y: rect.top - parentRect.top,
                    width: rect.width, height: rect.height,
                    opacity: 1, duration: 0.4, ease: "elastic.out(1, 0.5)"
                });
            });

            // Elastic Pull
            link.addEventListener('mousemove', (e) => {
                const rect = link.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(link, { x: x * 0.3, y: y * 0.3, duration: 0.3 });
            });
            link.addEventListener('mouseleave', () => {
                gsap.to(link, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
            });
        });
        document.getElementById('nav-links').addEventListener('mouseleave', () => gsap.to(navPill, { opacity: 0, duration: 0.3 }));
    }

    // Page Curtains Trigger
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            gsap.to(".curtain-left", { x: "0%", duration: 0.8, ease: "power4.inOut" });
            gsap.to(".curtain-right", { x: "0%", duration: 0.8, ease: "power4.inOut", onComplete: () => window.location.href = target });
        });
    });
}

// ==== V3 Anim #5: DARK MODE RADIAL WIPE ====
function initThemeToggle() {
    const toggle = document.getElementById("theme-toggle");
    const circle = document.getElementById("theme-wipe-circle");

    toggle.addEventListener("click", (e) => {
        const isDark = currentTheme === "dark";
        const nextTheme = isDark ? "light" : "dark";
        const nextBg = isDark ? "#F5F5F0" : "#0A0A0A";

        circle.style.left = e.clientX + "px";
        circle.style.top = e.clientY + "px";
        circle.style.backgroundColor = nextBg;

        gsap.fromTo(circle, { scale: 0 }, {
            scale: 150, duration: 1, ease: "power3.inOut",
            onComplete: () => {
                currentTheme = nextTheme;
                document.body.dataset.theme = currentTheme;
                localStorage.setItem('luminaTheme', currentTheme);
                updateThemeIcon();
                gsap.set(circle, { scale: 0 });
            }
        });
    });
}

function updateThemeIcon() {
    if (currentTheme === 'light') {
        document.getElementById('hot-icon').style.display = 'none';
        document.getElementById('iced-icon').style.display = 'block';
    } else {
        document.getElementById('hot-icon').style.display = 'block';
        document.getElementById('iced-icon').style.display = 'none';
    }
}

// ==== V3 Anim #1: CURSOR BLEND MODE & COFFEE BEAN ROTATION ====
function initCursor() {
    const dot = document.getElementById("cursor-dot");
    const outline = document.getElementById("cursor-outline");
    const text = document.getElementById("cursor-text");

    const xToDot = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
    const yToDot = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });
    const rotToDot = gsap.quickTo(dot, "rotation", { duration: 0.2, ease: "power2.out" });

    const xToOut = gsap.quickTo(outline, "x", { duration: 0.3, ease: "power3" });
    const yToOut = gsap.quickTo(outline, "y", { duration: 0.3, ease: "power3" });

    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;

    window.addEventListener("mousemove", (e) => {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;

        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            rotToDot(angle);
        }

        lastX = e.clientX;
        lastY = e.clientY;

        xToDot(e.clientX); yToDot(e.clientY);
        xToOut(e.clientX); yToOut(e.clientY);
        gsap.to([dot, outline], { opacity: 1, duration: 0.2 });
    });

    document.querySelectorAll(".hover-view").forEach(el => {
        el.addEventListener("mouseenter", () => {
            gsap.to(outline, { width: 80, height: 80, backgroundColor: "#fff", border: "none", mixBlendMode: "normal", duration: 0.3 });
            text.innerText = "VIEW";
            gsap.to(text, { opacity: 1, color: "#000", duration: 0.3 });
        });
        el.addEventListener("mouseleave", () => {
            gsap.to(outline, { width: 40, height: 40, backgroundColor: "transparent", border: "1px solid var(--accent)", mixBlendMode: "difference", duration: 0.3 });
            gsap.to(text, { opacity: 0, duration: 0.3 });
        });
    });
}

// ==== MAGNETIC BUTTONS ====
function initMagneticButtons() {
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
            gsap.to(btn, { x, y, duration: 0.3 });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
        });
    });
}

// ==== V3 Fix #10 & Anim #27: CART REWORK & 3D STAGGER ====
function initCart() {
    const overlay = document.getElementById("cart-overlay");
    const panel = document.getElementById("cart-panel");
    const toggle = document.getElementById("cart-toggle");
    updateCartUI();

    toggle.addEventListener("click", () => {
        gsap.to(overlay, { opacity: 1, pointerEvents: "auto", duration: 0.3 });
        gsap.to(panel, { x: 0, duration: 0.6, ease: "power4.out" });
        renderCart();
    });

    const closeCart = () => {
        gsap.to(overlay, { opacity: 0, pointerEvents: "none", duration: 0.3 });
        gsap.to(panel, { x: "100%", duration: 0.5, ease: "power3.in" });
    };
    document.getElementById("close-cart").addEventListener("click", closeCart);
    overlay.addEventListener("click", closeCart);

    document.body.addEventListener("click", (e) => {
        const addToCartBtn = e.target.closest(".add-to-cart");
        const addCustomBtn = e.target.closest("#add-custom-cart");
        const qtyUpBtn = e.target.closest(".qty-up");
        const qtyDownBtn = e.target.closest(".qty-down");
        const clearCartBtn = e.target.closest("#clear-cart");
        const checkoutBtn = e.target.closest("#checkout-btn");

        if (addToCartBtn || addCustomBtn) {
            let item;
            if (addCustomBtn) {
                const size = document.querySelector(".size-btn.active").dataset.size;
                const milk = document.querySelector(".milk-btn.active").dataset.milk;
                item = { id: `custom-${Date.now()}`, name: `Custom ${size} (${milk})`, price: parseFloat(document.getElementById("custom-price").innerText), qty: 1 };
            } else {
                item = { id: addToCartBtn.dataset.id, name: addToCartBtn.dataset.name, price: parseFloat(addToCartBtn.dataset.price), qty: 1 };
            }

            const existing = cart.find(i => i.id === item.id);
            if (existing) existing.qty++; else cart.push(item);

            localStorage.setItem('luminaCart', JSON.stringify(cart));
            updateCartUI();

            // Anim #28: Price Drop to Cart
            const rect = (addToCartBtn || addCustomBtn).getBoundingClientRect();
            const cartRect = document.getElementById("cart-toggle").getBoundingClientRect();
            const drop = document.getElementById("price-drop-anim");
            gsap.fromTo(drop, { x: rect.left, y: rect.top, opacity: 1, scale: 1 }, {
                x: cartRect.left, y: cartRect.top, opacity: 0, scale: 0.5, duration: 0.8, ease: "power2.in"
            });

            document.getElementById("cart-count").classList.remove("badge-bounce");
            void document.getElementById("cart-count").offsetWidth;
            document.getElementById("cart-count").classList.add("badge-bounce");
        }

        if (qtyUpBtn) { cart[qtyUpBtn.dataset.index].qty++; saveAndRender(); }
        if (qtyDownBtn) { cart[qtyDownBtn.dataset.index].qty--; if (cart[qtyDownBtn.dataset.index].qty <= 0) cart.splice(qtyDownBtn.dataset.index, 1); saveAndRender(); }
        if (clearCartBtn) { cart = []; saveAndRender(); }

        // V3 Anim #30: Confetti Explosion
        if (checkoutBtn && cart.length > 0) {
            triggerConfetti();
            cart = [];
            checkoutBtn.innerText = "Order Placed! 🎉";
            saveAndRender(false);
            setTimeout(() => checkoutBtn.innerText = "Checkout", 3000);
        }
    });

    function saveAndRender(doRender = true) {
        localStorage.setItem('luminaCart', JSON.stringify(cart));
        updateCartUI();
        if (doRender) renderCart();
    }
}

function renderCart() {
    const container = document.getElementById("cart-items");
    const emptyState = document.getElementById("empty-cart-state");

    if (cart.length === 0) {
        emptyState.style.display = "flex";
        Array.from(container.children).forEach(c => { if (c.id !== "empty-cart-state") c.remove(); });
    } else {
        emptyState.style.display = "none";
        container.innerHTML = "";
    }

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price * item.qty;
        const div = document.createElement("div");
        div.className = "cart-item stagger-cart";
        div.innerHTML = `
            <div class="cart-item-info"><h4>${item.name}</h4><p>$${item.price.toFixed(2)}</p></div>
            <div class="cart-controls"><button class="qty-down" data-index="${index}">-</button><span>${item.qty}</span><button class="qty-up" data-index="${index}">+</button></div>
        `;
        container.appendChild(div);
        // Anim #27: Cart 3D Stagger
        gsap.fromTo(div, { x: 100, rotateY: 45, opacity: 0 }, { x: 0, rotateY: 0, opacity: 1, duration: 0.6, delay: index * 0.1, ease: "power3.out" });
    });

    gsap.to({ val: parseFloat(document.getElementById("cart-total-price").innerText) }, {
        val: total, duration: 0.5, onUpdate: function () { document.getElementById("cart-total-price").innerText = this.targets()[0].val.toFixed(2); }
    });
}

function updateCartUI() { document.getElementById("cart-count").innerText = cart.reduce((acc, item) => acc + item.qty, 0); }

// ==== V3 Anim #30: CANVAS CONFETTI ====
function triggerConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const pieces = [];
    for (let i = 0; i < 100; i++) {
        pieces.push({ x: canvas.width / 2, y: canvas.height - 50, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 1) * 20, size: Math.random() * 10 + 5, color: Math.random() > 0.5 ? '#D5B48A' : '#ffffff' });
    }
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.5; // Gravity
            ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        if (pieces[0].y < canvas.height + 100) requestAnimationFrame(animate);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    animate();
}

// ==== V3 BACK TO TOP RING FIX ====
function initScrollProgress() {
    const circle = document.querySelector('.progress-ring-circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    window.addEventListener('scroll', () => {
        const percent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        circle.style.strokeDashoffset = circumference - percent * circumference;
    });

    document.getElementById('back-to-top').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==== V3 Anim #9: KINETIC MARQUEE ====
let lastScrollTop = window.scrollY;
window.addEventListener("scroll", () => {
    const st = window.scrollY;

    // Kinetic Marquee direction
    document.querySelectorAll(".footer-marquee").forEach(mq => {
        const dir = st > lastScrollTop ? -1 : 1;
        gsap.to(mq, { x: "+=" + (dir * 20), duration: 0.5 });
    });

    lastScrollTop = st;
});

// ==== PAGE: HOME ====
function initHomeLogic() {
    // V3 Anim #7: Hero Scramble Reveal
    const title = document.querySelector(".hero-title");
    const text = title.dataset.text;
    const chars = "!<>-_\\\\/[]{}—=+*^?#________";
    let iterations = 0;
    const interval = setInterval(() => {
        title.innerText = text.split("").map((l, i) => {
            if (i < iterations) return text[i];
            return chars[Math.floor(Math.random() * chars.length)]
        }).join("");
        if (iterations >= text.length) { clearInterval(interval); title.style.opacity = 1; }
        iterations += 1 / 3;
    }, 30);
    title.style.opacity = 1;

    gsap.fromTo(".hero-subtitle", { y: 20, opacity: 0 }, { y: 0, opacity: 0.8, duration: 0.8, delay: 1 });
    gsap.fromTo(".cta-button", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, delay: 1.2, ease: "elastic.out(1, 0.5)" });
    gsap.fromTo(".hero-graphic", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, delay: 1 });

    // Hero Steam
    gsap.fromTo(".steam", { y: 0, opacity: 0, scale: 0.8 }, { y: -800, opacity: 0, scale: 2, duration: 4, stagger: 1.2, repeat: -1, ease: "power1.inOut", keyframes: { "50%": { opacity: 0.6 } } });

    // Story Parallax
    gsap.to(".story-image", { yPercent: -20, ease: "none", scrollTrigger: { trigger: ".story-image-wrapper", scrub: true } });

    // Horizontal Scroll (Anim #19 & #21 Momentum)
    const track = document.querySelector(".showcase-track");
    if (track) {
        gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth), ease: "none",
            scrollTrigger: {
                trigger: ".horizontal-showcase", pin: true, scrub: 1, end: () => "+=" + track.scrollWidth,
                onUpdate: (self) => {
                    const skew = self.getVelocity() / -300;
                    gsap.to(".momentum-skew", { skewX: skew, duration: 0.5 });
                }
            }
        });
        ScrollTrigger.addEventListener("scrollEnd", () => gsap.to(".momentum-skew", { skewX: 0, duration: 0.5 }));
    }
}

// ==== PAGE: MENU ====
function initMenuLogic() {
    gsap.fromTo(".menu-header", { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.2 });
    gsap.fromTo(".menu-card", { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.4, ease: "power2.out" });
    gsap.to(".menu-bg-text", { y: 200, scrollTrigger: { trigger: ".menu-page-container", scrub: true } });

    const cards = document.querySelectorAll(".menu-card");
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const filter = btn.dataset.filter;
            cards.forEach(card => {
                if (filter === "all" || card.dataset.category === filter) {
                    if (card.style.display === "none" || !card.style.display) {
                        card.style.display = "block";
                        gsap.fromTo(card, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)", force3D: true });
                    } else {
                        gsap.to(card, { scale: 1, opacity: 1, duration: 0.4 });
                    }
                } else {
                    card.style.display = "none";
                }
            });
        });
    });

    // V3 Anim #11: Floating Menu Prices
    cards.forEach(card => {
        const price = card.querySelector(".float-price");
        if (price) {
            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
                gsap.to(price, { x, y, duration: 0.3 });
            });
            card.addEventListener("mouseleave", () => gsap.to(price, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }));
        }
    });

    // V3 Anim #2 & #5: Add Beans to BG
    const bgBeans = document.getElementById("bg-beans-container");
    if (bgBeans) {
        for (let i = 0; i < 12; i++) {
            const bean = document.createElement("div");
            bean.className = "bg-bean";
            bean.style.left = Math.random() * 100 + "vw";
            bean.style.top = Math.random() * 100 + "vh";
            bean.style.width = (Math.random() * 20 + 10) + "px";
            bean.style.height = (Math.random() * 30 + 15) + "px";
            bean.style.borderRadius = "50%";
            bean.style.background = "var(--accent)";
            bean.style.position = "absolute";
            bean.style.opacity = Math.random() * 0.5 + 0.1;
            bgBeans.appendChild(bean);

            gsap.to(bean, {
                y: "100vh", rotation: 360, duration: Math.random() * 10 + 15,
                repeat: -1, ease: "linear", delay: Math.random() * -10, force3D: true
            });
        }
    }
}

// ==== V3 Anim #2: BEAN TRAIL ====
function initBeanTrail() {
    const canvas = document.getElementById("bean-trail-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const beans = [];
    let trailReq;
    window.addEventListener("mousemove", (e) => {
        if (Math.random() > 0.8) {
            beans.push({ x: e.clientX, y: e.clientY, size: 5, rot: Math.random() * 360, alpha: 1 });
            if (!trailReq) draw();
        }
    });
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;
        for (let i = beans.length - 1; i >= 0; i--) {
            const b = beans[i];
            b.alpha -= 0.02; b.rot += 5;
            if (b.alpha <= 0) {
                beans.splice(i, 1);
            } else {
                active = true;
                ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot * Math.PI / 180);
                ctx.fillStyle = `rgba(213, 180, 138, ${b.alpha})`;
                ctx.beginPath(); ctx.ellipse(0, 0, b.size, b.size * 1.5, 0, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
        }
        if (active) trailReq = requestAnimationFrame(draw);
        else trailReq = null;
    }
}

// ==== PAGE: CUSTOMIZER ====
function initCustomizerLogic() {
    const cupPath = document.getElementById("cc-body");
    const cupRim = document.getElementById("cc-rim");
    const liquid = document.getElementById("cc-liquid");
    const priceEl = document.getElementById("custom-price");
    const glow = document.getElementById("morph-glow");

    // Customizer Scroll Entrance Animations (Part 3 #7)
    gsap.fromTo(".customizer-visual", { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 1, delay: 0.2, ease: "power3.out" });
    gsap.fromTo(".customizer-controls", { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 1, delay: 0.2, ease: "power3.out" });
    gsap.fromTo(".stagger-group-1 .size-btn", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.5, ease: "back.out(1.7)" });
    gsap.fromTo(".stagger-group-2 .milk-btn", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.7, ease: "back.out(1.7)" });

    const sizes = {
        small: { path: "M 70 100 L 75 160 Q 80 170 100 170 Q 120 170 125 160 L 130 100 Z", rx: 30, ry: 8, lrx: 26, lry: 6, price: 4.00, yOff: 20 },
        medium: { path: "M 60 80 L 70 160 Q 75 175 100 175 Q 125 175 130 160 L 140 80 Z", rx: 40, ry: 10, lrx: 35, lry: 8, price: 5.00, yOff: 0 },
        large: { path: "M 45 50 L 65 170 Q 70 185 100 185 Q 130 185 135 170 L 155 50 Z", rx: 55, ry: 14, lrx: 48, lry: 11, price: 6.00, yOff: -30 }
    };

    let currentMilkPrice = 0;

    // V3 Anim #26: Draw Dashed Lines
    gsap.to("#step-1-ind", { '--dash': 0, scrollTrigger: { trigger: ".customizer-controls", start: "top center" } });

    document.querySelectorAll(".size-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const config = sizes[btn.dataset.size];
            gsap.to(cupPath, { attr: { d: config.path }, duration: 0.8, ease: "elastic.out(1, 0.5)" });
            gsap.to(cupRim, { attr: { rx: config.rx, ry: config.ry }, y: config.yOff, duration: 0.8, ease: "elastic.out(1, 0.5)" });
            gsap.to(liquid, { attr: { rx: config.lrx, ry: config.lry }, y: config.yOff, duration: 0.8, ease: "elastic.out(1, 0.5)" });

            // V3 Anim #22: Neon Glow Pulse
            gsap.fromTo(glow, { opacity: 0.8, scale: 0.8 }, { opacity: 0, scale: 1.5, duration: 1 });
            updatePrice();
        });
    });

    document.querySelectorAll(".milk-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".milk-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const type = btn.dataset.milk;
            currentMilkPrice = 0;
            liquid.style.fill = "";

            if (type === "none") { liquid.style.fill = "url(#cremaGrad)"; animateCremaSwirl(); }
            if (type === "oat") { liquid.style.fill = "#B08D6A"; currentMilkPrice = 0.75; animateOatVortex(); }
            if (type === "almond") { liquid.style.fill = "#C4A484"; currentMilkPrice = 1.00; animateAlmondSplash(); }

            updatePrice();
        });
    });

    function animateCremaSwirl() {
        gsap.killTweensOf(liquid);
        gsap.fromTo(liquid, { rotation: 0, scale: 0.9, transformOrigin: "center center" }, { rotation: 360, scale: 1, duration: 2.5, ease: "power2.out", force3D: true });
        gsap.fromTo(".crema-center", { attr: { "stop-color": "#1A0900" } }, { attr: { "stop-color": "#8c5e3c" }, duration: 1.5, yoyo: true, repeat: 1, ease: "sine.inOut" });
    }

    function animateOatVortex() {
        const displacement = document.getElementById("oat-displacement");
        const noise = document.getElementById("oat-noise");

        gsap.killTweensOf(displacement);
        gsap.killTweensOf(noise);
        gsap.killTweensOf(liquid);

        // Ensure starting state
        gsap.set(displacement, { attr: { scale: 0 } });
        gsap.set(noise, { attr: { baseFrequency: 0.015 } });

        const tl = gsap.timeline();

        // Animate turbulence scale (the blooming distortion)
        // This will aggressively ripple and warp the surface of the coffee
        tl.to(displacement, { attr: { scale: 45 }, duration: 1.5, ease: "power2.out" })
            .to(displacement, { attr: { scale: 0 }, duration: 2.0, ease: "power2.inOut" });

        // Subtly animate the fractal noise frequency to make it "boil" while mixing
        tl.to(noise, { attr: { baseFrequency: 0.035 }, duration: 1.5, ease: "power1.inOut" }, 0)
            .to(noise, { attr: { baseFrequency: 0.015 }, duration: 2.0, ease: "power1.inOut" }, 1.5);

        // Morph the main cup color to simulate full mixing of milk
        gsap.fromTo(liquid, { fill: "#4A2F1D" }, { fill: "#B08D6A", duration: 3.5, ease: "power2.inOut" });
    }

    function animateAlmondSplash() {
        const container = document.getElementById("almond-drops-container");
        if (!container) return;
        container.innerHTML = ""; // Clear existing drops

        // Morph the main cup color to simulate full mixing of milk
        gsap.killTweensOf(liquid);
        gsap.fromTo(liquid, { fill: "#4A2F1D" }, { fill: "#C4A484", duration: 3.5, ease: "power2.inOut" });

        // Create drops and animate them falling into the metaball pool
        for (let i = 0; i < 12; i++) {
            const drop = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            // Random start position above the cup
            const startX = 85 + Math.random() * 30;
            const startY = -20 - Math.random() * 60;
            const size = 5 + Math.random() * 8;

            drop.setAttribute("cx", startX);
            drop.setAttribute("cy", startY);
            drop.setAttribute("r", size);
            drop.setAttribute("fill", "#FFF5E1"); // Bright milk color
            container.appendChild(drop);

            // GSAP physics animation for dropping into the liquid surface (cy: 80)
            gsap.to(drop, {
                cy: 80,
                cx: startX + (Math.random() - 0.5) * 15,
                duration: 0.6 + Math.random() * 0.5,
                ease: "power2.in",
                delay: Math.random() * 0.5,
                onComplete: () => {
                    // As it hits the liquid, it fuses (handled by metaball filter)
                    // We just scale it up and fade it out so the fusion organically dissipates
                    gsap.to(drop, {
                        attr: { r: size * 4 },
                        opacity: 0,
                        duration: 1.5,
                        ease: "power2.out",
                        onComplete: () => drop.remove()
                    });
                }
            });
        }
    }

    function updatePrice() {
        const sizePrice = sizes[document.querySelector(".size-btn.active").dataset.size].price;
        const total = sizePrice + currentMilkPrice;
        gsap.to({ val: parseFloat(priceEl.innerText) }, { val: total, duration: 0.5, onUpdate: function () { priceEl.innerText = this.targets()[0].val.toFixed(2); } });
    }
}
