// OCSC Premium Clothes Shop Center Application Logic

// Global State
let cart = [];
let wishlist = [];
let currentUser = null;

// Product Database
const products = [
    {
        id: 1,
        title: "Classic Trench Coat",
        price: 189.00,
        originalPrice: 249.00,
        category: "Women's Fashion",
        rating: 4.8,
        image: "images/womens_fashion.png",
        description: "An iconic silhouette crafted in premium weather-resistant cotton gabardine. Features a double-breasted closure, structured shoulders, and an adjustable waist belt. The perfect outer layer for transitioning seasons with effortless sophistication."
    },
    {
        id: 2,
        title: "Tailored Wool Suit",
        price: 450.00,
        originalPrice: null,
        category: "Men's Fashion",
        rating: 4.9,
        image: "images/mens_fashion.png",
        description: "Masterfully cut from 100% fine Italian virgin wool. Features structural soft shoulders, notch lapels, and functional button cuffs. Complemented by flat-front trousers with a clean drape. Built for the modern gentleman."
    },
    {
        id: 3,
        title: "Minimalist Linen Blazer",
        price: 129.00,
        originalPrice: 159.00,
        category: "Women's Fashion",
        rating: 4.7,
        image: "images/product1.png",
        description: "Lightweight and fully lined blazer jacket woven from European flax linen. Tailored with single-button closure, notched lapels, and clean front flap pockets. A perfect smart-casual companion."
    },
    {
        id: 4,
        title: "Premium Leather Handbag",
        price: 299.00,
        originalPrice: 380.00,
        category: "Accessories",
        rating: 5.0,
        image: "images/accessories.png",
        description: "Structured handbag in full-grain calfskin leather, hand-finished with custom polished gold hardware. Features a suede-lined spacious interior with multiple organizational slip pockets and an adjustable crossbody strap."
    },
    {
        id: 5,
        title: "Kids Cashmere Sweater",
        price: 89.00,
        originalPrice: null,
        category: "Kids Fashion",
        rating: 4.6,
        image: "images/kids_fashion.png",
        description: "Luxuriously soft crewneck knitwear crafted from grade-A Mongolian cashmere. Hypoallergenic, exceptionally warm, yet breathable. Designed with double-reinforced cuffs to withstand playful activities."
    },
    {
        id: 6,
        title: "Chiffon Summer Dress",
        price: 119.00,
        originalPrice: null,
        category: "Women's Fashion",
        rating: 4.8,
        image: "images/womens_fashion.png",
        description: "Delicate flowing silhouette crafted in premium lightweight silk chiffon. Adorned with hand-painted floral prints, a tiered ruffle skirt, and a matching fabric belt to cinch the waist elegantly."
    },
    {
        id: 7,
        title: "Gold Anchor Cufflinks",
        price: 75.00,
        originalPrice: 95.00,
        category: "Accessories",
        rating: 4.5,
        image: "images/accessories.png",
        description: "Premium sterling silver cufflinks heavily plated in 18k yellow gold. Designed in a timeless nautilus anchor shape, polished to a mirror shine. Elevates any double-cuff shirt pairing."
    },
    {
        id: 8,
        title: "Tailored Oxford Shirt",
        price: 95.00,
        originalPrice: 120.00,
        category: "Men's Fashion",
        rating: 4.7,
        image: "images/mens_fashion.png",
        description: "Timeless button-down shirt constructed from heavy-gauge American Supima cotton Oxford fabric. Features custom mother-of-pearl buttons and a neat button-down collar that rolls perfectly under lapels."
    }
];

// Initialize DOM Events
document.addEventListener("DOMContentLoaded", () => {
    // 1. Loading screen & Auth Initial Setup
    setTimeout(() => {
        const loader = document.getElementById("loader");
        if (loader) {
            loader.classList.add("fade-out");
        }
    }, 1200);

    // --- Authentication Logic ---
    const authOverlay = document.getElementById("auth-overlay");
    const tabSignin = document.getElementById("tab-signin");
    const tabSignup = document.getElementById("tab-signup");
    const signinForm = document.getElementById("signin-form");
    const signupForm = document.getElementById("signup-form");
    const authSwitchBtn = document.getElementById("auth-switch-btn");
    const authSwitchText = document.getElementById("auth-switch-text");
    const crmViewBtn = document.getElementById("crm-view-btn");

    // Predefined admin emails
    const adminEmails = ["admin@ocsc.com", "soxibjon@ocsc.com"];

    // Default In-Memory Accounts list (always ensure admin credentials exist)
    let accounts = JSON.parse(localStorage.getItem("ocsc_accounts")) || [];
    
    // Ensure the predefined admins are always in the account list with correct password
    const defaultAdmins = [
        { name: "Administrator", email: "admin@ocsc.com", password: "admin", isAdmin: true },
        { name: "Soxibjon", email: "soxibjon@ocsc.com", password: "admin", isAdmin: true }
    ];

    defaultAdmins.forEach(defaultAdmin => {
        const index = accounts.findIndex(acc => acc.email === defaultAdmin.email);
        if (index > -1) {
            accounts[index].isAdmin = true; // Force admin state
        } else {
            accounts.push(defaultAdmin);
        }
    });
    localStorage.setItem("ocsc_accounts", JSON.stringify(accounts));

    currentUser = null;

    // Initially hide CRM button until signed in
    crmViewBtn.style.display = "none";

    // Nav Sign In Button -> Open Auth Modal
    const navSigninBtn = document.getElementById("nav-signin-btn");
    if (navSigninBtn) {
        navSigninBtn.addEventListener("click", () => {
            authOverlay.classList.add("active");
            showSignIn();
        });
    }

    // User Profile Dropdown Toggle
    const userProfileNav = document.getElementById("user-profile-nav");
    if (userProfileNav) {
        userProfileNav.addEventListener("click", (e) => {
            e.stopPropagation();
            userProfileNav.classList.toggle("open");
        });
        document.addEventListener("click", () => {
            userProfileNav.classList.remove("open");
        });
    }

    // Sign Out Button
    const dropdownSignout = document.getElementById("dropdown-signout");
    if (dropdownSignout) {
        dropdownSignout.addEventListener("click", () => {
            currentUser = null;
            // Reset UI
            document.getElementById("nav-signin-btn").style.display = "flex";
            document.getElementById("user-profile-nav").style.display = "none";
            crmViewBtn.style.display = "none";
            // If CRM is active, switch back to store
            if (isCrmActive) {
                isCrmActive = false;
                crmViewBtn.innerText = "CRM Panel";
                document.getElementById("crm-section").classList.remove("active");
                document.querySelectorAll("section:not(.crm-section)").forEach(sec => sec.style.display = "block");
                const navMenu = document.getElementById("nav-menu");
                if (navMenu) navMenu.style.display = "flex";
            }
            showToast("Tizimdan muvaffaqiyatli chiqdingiz!");
        });
    }

    // Switch between Tabs
    const showSignIn = () => {
        tabSignin.classList.add("active");
        tabSignup.classList.remove("active");
        signinForm.classList.add("active");
        signupForm.classList.remove("active");
        authSwitchText.innerHTML = `Don't have an account? <span id="auth-switch-btn">Sign Up</span>`;
        document.getElementById("auth-switch-btn").addEventListener("click", showSignUp);
    };

    const showSignUp = () => {
        tabSignin.classList.remove("active");
        tabSignup.classList.add("active");
        signinForm.classList.remove("active");
        signupForm.classList.add("active");
        authSwitchText.innerHTML = `Already have an account? <span id="auth-switch-btn">Sign In</span>`;
        document.getElementById("auth-switch-btn").addEventListener("click", showSignIn);
    };

    tabSignin.addEventListener("click", showSignIn);
    tabSignup.addEventListener("click", showSignUp);
    if (authSwitchBtn) {
        authSwitchBtn.addEventListener("click", showSignUp);
    }

    // Sign In Submission
    signinForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("signin-email").value.trim().toLowerCase();
        const password = document.getElementById("signin-password").value;

        // Search for account
        const account = accounts.find(acc => acc.email === email && acc.password === password);

        if (!account) {
            showToast("Noto'g'ri email yoki parol!");
            return;
        }

        // Determine if account is an admin
        const isAdmin = adminEmails.includes(account.email);
        account.isAdmin = isAdmin;

        currentUser = account;
        authOverlay.classList.remove("active");
        showToast(`Xush kelibsiz, ${account.name}!`);

        // Update Navbar: hide Sign In btn, show user profile
        const navSigninBtnEl = document.getElementById("nav-signin-btn");
        const userProfileNavEl = document.getElementById("user-profile-nav");
        if (navSigninBtnEl) navSigninBtnEl.style.display = "none";
        if (userProfileNavEl) {
            userProfileNavEl.style.display = "flex";
            // Set avatar initial and name
            const initial = account.name.charAt(0).toUpperCase();
            const avatarEl = document.getElementById("user-avatar-nav");
            const dropAvatar = document.getElementById("dropdown-avatar");
            const dropName = document.getElementById("dropdown-name");
            const dropEmail = document.getElementById("dropdown-email");
            const userNameEl = document.getElementById("user-name-nav");
            if (avatarEl) avatarEl.textContent = initial;
            if (dropAvatar) dropAvatar.textContent = initial;
            if (dropName) dropName.textContent = account.name;
            if (dropEmail) dropEmail.textContent = account.email;
            if (userNameEl) userNameEl.textContent = account.name.split(" ")[0];
        }

        if (isAdmin) {
            // Logged in as Admin: show CRM button in navbar, but do not auto redirect to CRM View
            crmViewBtn.style.display = "block";
        } else {
            // Logged in as Customer: ensure CRM button is hidden
            crmViewBtn.style.display = "none";
        }
    });

    // Sign Up Submission
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim().toLowerCase();
        const password = document.getElementById("signup-password").value;

        if (name === "" || email === "" || password === "") {
            showToast("Barcha maydonlarni to'ldiring!");
            return;
        }

        // Admin registration blocked via Sign Up
        if (adminEmails.includes(email)) {
            showToast("Ushbu email bilan ro'yxatdan o'tish taqiqlangan!");
            return;
        }

        if (accounts.some(acc => acc.email === email)) {
            showToast("Bu email allaqachon ro'yxatdan o'tgan!");
            return;
        }

        const newAccount = { name, email, password, isAdmin: false };
        accounts.push(newAccount);
        localStorage.setItem("ocsc_accounts", JSON.stringify(accounts));

        showToast("Hisob yaratildi! Tizimga kiring.");
        showSignIn();
        
        // Auto fill email to ease login
        document.getElementById("signin-email").value = email;
    });

    // Close auth modal
    const authClose = document.getElementById("auth-close");
    if (authClose) {
        authClose.addEventListener("click", () => {
            authOverlay.classList.remove("active");
        });
    }

    // Function to activate CRM view directly
    function activateCrmView() {
        const crmSection = document.getElementById("crm-section");
        crmViewBtn.innerText = "Store View";
        crmSection.classList.add("active");
        isCrmActive = true;
        // Hide storefront
        document.querySelectorAll("section:not(.crm-section)").forEach(sec => sec.style.display = "none");
        const navMenu = document.getElementById("nav-menu");
        if (navMenu) navMenu.style.display = "none";
        loadCrmDashboard();
    }



    // 2. Scroll Header styling
    window.addEventListener("scroll", () => {
        const header = document.getElementById("header");
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // 3. Theme Toggle Setup
    const themeBtn = document.getElementById("theme-toggle");
    const currentTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    updateThemeIcon(currentTheme);

    themeBtn.addEventListener("click", () => {
        let theme = document.documentElement.getAttribute("data-theme");
        let newTheme = theme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateThemeIcon(newTheme);
        showToast(`Switched to ${newTheme} theme`);
    });

    // 4. Burger mobile menu toggle
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("nav-menu");
    hamburger.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        hamburger.classList.toggle("active");
    });

    // 5. Promo Countdown Timer Setup
    startCountdown();

    // 6. Best Sellers Carousel Logic
    initCarousel();

    // 7. Event Delegation for Products (Add to Cart, Quick View, Wishlist)
    document.addEventListener("click", (e) => {
        const target = e.target;
        
        // Quick view
        if (target.closest(".quick-view-btn")) {
            const id = target.closest(".quick-view-btn").dataset.id;
            openQuickView(parseInt(id));
        }

        // Add to Cart
        if (target.closest(".add-to-cart-btn")) {
            if (!currentUser) {
                authOverlay.classList.add("active");
                showSignIn();
                showToast("Savatchaga qo\'shish uchun tizimga kiring!");
                return;
            }
            const id = target.closest(".add-to-cart-btn").dataset.id;
            addToCart(parseInt(id));
        }

        // Wishlist
        if (target.closest(".wishlist-btn")) {
            if (!currentUser) {
                authOverlay.classList.add("active");
                showSignIn();
                showToast("Like bosish uchun tizimga kiring!");
                return;
            }
            const id = target.closest(".wishlist-btn").dataset.id;
            toggleWishlist(parseInt(id), target.closest(".wishlist-btn"));
        }
    });

    // 8. Close Modal Controls
    const modal = document.getElementById("quickview-modal");
    const modalClose = document.getElementById("modal-close");
    if (modalClose) {
        modalClose.addEventListener("click", () => {
            modal.classList.remove("active");
        });
    }
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });

    // 9. Cart sidebar controls
    const cartToggle = document.getElementById("cart-toggle");
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartClose = document.getElementById("cart-close");
    const cartOverlay = document.getElementById("cart-overlay");

    cartToggle.addEventListener("click", () => {
        if (!currentUser) {
            authOverlay.classList.add("active");
            showSignIn();
            showToast("Savatchani ko\'rish uchun tizimga kiring!");
            return;
        }
        cartSidebar.classList.add("active");
        cartOverlay.classList.add("active");
    });

    const closeCartFn = () => {
        cartSidebar.classList.remove("active");
        cartOverlay.classList.remove("active");
    };

    cartClose.addEventListener("click", closeCartFn);
    cartOverlay.addEventListener("click", closeCartFn);

    // 10. Checkout action
    const checkoutBtn = document.getElementById("checkout-btn");
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            showToast("Your cart is empty!");
            return;
        }
        showToast("Processing premium checkout layout...");
        setTimeout(() => {
            showToast("Order placed successfully! Thank you for shopping with OCSC.");
            cart = [];
            updateCartUI();
            closeCartFn();
        }, 1500);
    });

    // 11. Custom micro-interaction: Search filter on trending products
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll(".products-grid .product-card");
        
        cards.forEach(card => {
            const title = card.querySelector(".product-title").innerText.toLowerCase();
            const category = card.querySelector(".product-category").innerText.toLowerCase();
            if (title.includes(query) || category.includes(query)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });

    // 12. Newsletter Form Submission
    const newsletterForm = document.getElementById("newsletter-form");
    newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector("input").value;
        if (email) {
            showToast("Subscribed! Receive your 15% discount code shortly.");
            newsletterForm.reset();
        }
    });

    // 13. CRM Toggling & Setup
    const crmSection = document.getElementById("crm-section");
    const storeSections = ["hero", "categories", "trending", "new-arrivals", "best-sellers", "sale"];
    let isCrmActive = false;

    crmViewBtn.addEventListener("click", () => {
        if (document.getElementById("crm-section").style.display === "block") {
            window.deactivateCrmView();
        } else {
            window.activateCrmView();
        }
    });

    // CRM Product Form Submission
    const crmProductForm = document.getElementById("crm-product-form");
    crmProductForm.addEventListener("submit", (e) => {
        e.preventDefault();
        saveCrmProduct();
    });

    // CRM Add new button reset form
    const addProductBtn = document.getElementById("add-product-btn");
    addProductBtn.addEventListener("click", () => {
        document.getElementById("crm-product-form").reset();
        document.getElementById("edit-product-id").value = "";
        document.getElementById("form-action-title").innerText = "Add Product";
    });
});

// Helper functions
function updateThemeIcon(theme) {
    const icon = document.getElementById("theme-icon");
    if (theme === "dark") {
        icon.className = "ri-sun-line";
    } else {
        icon.className = "ri-moon-line";
    }
}

// Toast Notifications System
function showToast(message) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="ri-checkbox-circle-fill" style="color: var(--accent);"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "none";
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Countdown Clock Function
function startCountdown() {
    // Set landing target end date to +5 days
    let targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);

    const updateTimer = () => {
        let now = new Date().getTime();
        let diff = targetDate.getTime() - now;

        if (diff <= 0) {
            clearInterval(timerInterval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = String(days).padStart(2, '0');
        document.getElementById("hours").innerText = String(hours).padStart(2, '0');
        document.getElementById("mins").innerText = String(mins).padStart(2, '0');
        document.getElementById("secs").innerText = String(secs).padStart(2, '0');
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
}

// Carousel Controls
function initCarousel() {
    const track = document.getElementById("carousel-track");
    const prev = document.getElementById("carousel-prev");
    const next = document.getElementById("carousel-next");
    if (!track) return;

    let index = 0;
    const getSlidesVisible = () => {
        if (window.innerWidth <= 480) return 1;
        if (window.innerWidth <= 768) return 2;
        if (window.innerWidth <= 1200) return 3;
        return 4;
    };

    const maxIndex = () => {
        const slides = track.querySelectorAll(".carousel-slide").length;
        return slides - getSlidesVisible();
    };

    const slideWidth = () => {
        const firstSlide = track.querySelector(".carousel-slide");
        return firstSlide.getBoundingClientRect().width + 30; // 30 is gap
    };

    next.addEventListener("click", () => {
        if (index < maxIndex()) {
            index++;
            track.style.transform = `translateX(-${index * slideWidth()}px)`;
        } else {
            index = 0; // wrap around
            track.style.transform = `translateX(0px)`;
        }
    });

    prev.addEventListener("click", () => {
        if (index > 0) {
            index--;
            track.style.transform = `translateX(-${index * slideWidth()}px)`;
        } else {
            index = maxIndex();
            track.style.transform = `translateX(-${index * slideWidth()}px)`;
        }
    });

    // Recalculate layout on window resize
    window.addEventListener("resize", () => {
        index = 0;
        track.style.transform = `translateX(0px)`;
    });
}

// Open Quick View Modal
function openQuickView(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const modal = document.getElementById("quickview-modal");
    const img = modal.querySelector(".modal-img-side img");
    const title = modal.querySelector(".modal-title");
    const price = modal.querySelector(".modal-price");
    const desc = modal.querySelector(".modal-desc");
    const cartBtn = modal.querySelector(".modal-cart-btn");

    img.src = product.image;
    img.alt = product.title;
    title.innerText = product.title;
    price.innerText = `$${product.price.toFixed(2)}`;
    desc.innerText = product.description;
    cartBtn.dataset.id = product.id;

    modal.classList.add("active");
}

// Add to Cart
function addToCart(id) {
    if (!currentUser) {
        showToast("Xarid qilish uchun avval hisobga kiring!");
        const authOverlay = document.getElementById("auth-overlay");
        if (authOverlay) authOverlay.classList.add("active");
        return;
    }

    const product = products.find(p => p.id === id);
    if (!product) return;

    const existing = cart.find(item => item.product.id === id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ product, quantity: 1 });
    }

    updateCartUI();
    showToast(`Added ${product.title} to your bag`);
}

// Toggle Wishlist
function toggleWishlist(id, btn) {
    if (!currentUser) {
        showToast("Sevimlilarga qo'shish uchun avval hisobga kiring!");
        const authOverlay = document.getElementById("auth-overlay");
        if (authOverlay) authOverlay.classList.add("active");
        return;
    }

    const idx = wishlist.indexOf(id);
    const icon = btn.querySelector("i");
    
    if (idx > -1) {
        wishlist.splice(idx, 1);
        icon.className = "ri-heart-line";
        showToast("Removed from wishlist");
    } else {
        wishlist.push(id);
        icon.className = "ri-heart-fill";
        showToast("Added to wishlist");
    }
    
    document.getElementById("wishlist-badge").innerText = wishlist.length;
}

// Update Cart Sidebar GUI
function updateCartUI() {
    const cartCount = document.getElementById("cart-badge");
    const cartItems = document.getElementById("cart-items");
    const cartSubtotal = document.getElementById("cart-subtotal");
    
    // Calculate totals
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    cartCount.innerText = count;
    cartSubtotal.innerText = `$${subtotal.toFixed(2)}`;

    // Build sidebar list
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); margin-top: 50px;">
                <i class="ri-shopping-bag-line" style="font-size: 40px; color: var(--accent); display: block; margin-bottom: 15px;"></i>
                <p>Your bag is empty.</p>
            </div>
        `;
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img class="cart-item-img" src="${item.product.image}" alt="${item.product.title}">
            <div class="cart-item-info">
                <h4 class="cart-item-title">${item.product.title}</h4>
                <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateQty(${item.product.id}, -1)">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQty(${item.product.id}, 1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeCartItem(${item.product.id})">
                <i class="ri-delete-bin-line"></i>
            </button>
        </div>
    `).join("");
}

// Qty adjuster inside cart sidebar
window.updateQty = function(id, direction) {
    const item = cart.find(item => item.product.id === id);
    if (!item) return;

    item.quantity += direction;
    if (item.quantity <= 0) {
        removeCartItem(id);
    } else {
        updateCartUI();
    }
};

// Remove single cart item
window.removeCartItem = function(id) {
    cart = cart.filter(item => item.product.id !== id);
    updateCartUI();
    showToast("Item removed from bag");
};

// CRM Dashboard Premium Logic
let crmOrders = [
    { id: "5", customer: "Denise Foley", date: "2026-06-14 09:32", total: 1450000, status: "KUTILMOQDA", items: "Slim Fit Djinsi Shim (30/Moviy) (1 ta), Trikotaj Erkaklar T-Shirt (S/Oq) (1 ta)" },
    { id: "4", customer: "Test User One", date: "2026-06-14 08:15", total: 1200000, status: "YETKAZILDI", items: "Kostyum (L/Qora) (1 ta)" },
    { id: "3", customer: "Kylan Carrillo", date: "2026-06-14 08:09", total: 150000, status: "YETKAZILDI", items: "Trikotaj Erkaklar T-Shirt (S/Oq) (1 ta)" },
    { id: "2", customer: "Kylan Carrillo", date: "2026-06-14 08:09", total: 500000, status: "KUTILMOQDA", items: "Slim Fit Djinsi Shim (30/Moviy) (1 ta)" },
    { id: "1", customer: "Dina Karimova", date: "2026-06-14 08:09", total: 1200000, status: "KUTILMOQDA", items: "Kostyum (L/Qora) (1 ta)" }
];

let crmCustomers = [
    { id: "7", name: "Denise Foley", phone: "+998990001122", email: "cofaculyx@shopco.com", totalBought: 1450000, ordersCount: 1 },
    { id: "6", name: "Test User One", phone: "+998990001122", email: "test1@shopco.com", totalBought: 1200000, ordersCount: 1 },
    { id: "5", name: "Kylan Carrillo", phone: "+998990001122", email: "cyvuzidime@shopco.com", totalBought: 650000, ordersCount: 2 },
    { id: "4", name: "Lois Fitzpatrick", phone: "+998990001122", email: "dupeq@shopco.com", totalBought: 0, ordersCount: 0 },
    { id: "3", name: "Anvar Sadullayev", phone: "+998901234567", email: "anvar@gmail.com", totalBought: 1550000, ordersCount: 1 },
    { id: "2", name: "Jasur Alimov", phone: "+998977778899", email: "jasur@alimov.uz", totalBought: 0, ordersCount: 0 },
    { id: "1", name: "Dina Karimova", phone: "+998935552211", email: "dina@mail.ru", totalBought: 1650000, ordersCount: 1 }
];

// CRM active tab state
let activeCrmTab = 'dashboard';

// Charts variables
let salesLineChartInstance = null;
let categoryDoughnutChartInstance = null;
let annualSalesBarChartInstance = null;

// Initialize CRM event listeners
document.addEventListener("DOMContentLoaded", () => {
    // Tab switching event listeners
    const navItems = document.querySelectorAll(".crm-sidebar .nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");
            const target = item.getAttribute("data-target");
            switchCrmTab(target);
        });
    });

    // Search events
    document.getElementById("search-products-input")?.addEventListener("input", (e) => {
        renderCrmProducts(e.target.value, document.getElementById("filter-category-select").value);
    });

    document.getElementById("filter-category-select")?.addEventListener("change", (e) => {
        renderCrmProducts(document.getElementById("search-products-input").value, e.target.value);
    });

    document.getElementById("search-orders-input")?.addEventListener("input", (e) => {
        renderCrmOrders(e.target.value);
    });

    document.getElementById("search-customers-input")?.addEventListener("input", (e) => {
        renderCrmCustomers(e.target.value);
    });
});

// Override active view activator
window.activateCrmView = function() {
    // Add class to body - CSS handles footer hiding via body.crm-active
    document.body.classList.add("crm-active");

    // Show CRM section
    const crmSec = document.getElementById("crm-section");
    if (crmSec) {
        crmSec.classList.add("active");
    }

    // Hide all store sections (but NOT the header - it stays visible with Store View button)
    document.querySelectorAll("section:not(#crm-section)").forEach(function(sec) {
        sec.style.display = "none";
    });

    // Update CRM button text to "Store View"
    const crmViewBtn = document.getElementById("crm-view-btn");
    if (crmViewBtn) {
        crmViewBtn.innerText = "Store View";
    }

    // Scroll to top
    window.scrollTo(0, 0);

    // Load Dashboard Tab
    switchCrmTab("dashboard");
};

window.deactivateCrmView = function() {
    // Remove body class - CSS stops hiding footer
    document.body.classList.remove("crm-active");

    // Hide CRM section
    const crmSec = document.getElementById("crm-section");
    if (crmSec) {
        crmSec.classList.remove("active");
    }

    // Restore all store sections
    document.querySelectorAll("section:not(#crm-section)").forEach(function(sec) {
        sec.style.removeProperty("display");
    });

    // Update button back to "CRM Panel"
    const crmViewBtn = document.getElementById("crm-view-btn");
    if (crmViewBtn) {
        crmViewBtn.innerText = "CRM Panel";
        crmViewBtn.style.display = "block";
    }

    // Scroll to top
    window.scrollTo(0, 0);

    showToast("Returned to Customer Storefront");
};

window.switchCrmTab = function(tabName) {
    activeCrmTab = tabName;
    
    // Switch active nav item highlight
    const navItems = document.querySelectorAll(".crm-sidebar .nav-item");
    navItems.forEach(item => {
        if (item.getAttribute("data-target") === tabName) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Update headers text
    const titleEl = document.getElementById("crm-page-title");
    const subEl = document.getElementById("crm-page-subtitle");
    
    const titles = {
        'dashboard': ['Boshqaruv Paneli', 'Do\'koningizdagi umumiy holat va ko\'rsatkichlar'],
        'mahsulotlar': ['Mahsulotlar Ombori', 'Kiyimlar ro\'yxati va inventarni boshqarish'],
        'buyurtmalar': ['Buyurtmalar Jurnali', 'Mijozlar buyurtmalarini boshqarish va nazorat qilish'],
        'mijozlar': ['Mijozlar Bazasi', 'Sodiq mijozlar va aloqa ma\'lumotlari'],
        'hisobotlar': ['Analitika va Hisobotlar', 'Savdo ko\'rsatkichlari bo\'yicha chuqur tahlillar'],
        'kuponlar': ['Chegirma Kuponlari', 'Aktiv promo-kodlar va kuponlar ro\'yxati'],
        'xodimlar': ['Xodimlar Boshqaruvi', 'Tizim foydalanuvchilari va rollari'],
        'profil': ['Foydalanuvchi Profili', 'Hisob ma\'lumotlari va sozlamalari']
    };

    if (titles[tabName]) {
        titleEl.innerText = titles[tabName][0];
        subEl.innerText = titles[tabName][1];
    }

    // Switch visible panes
    document.querySelectorAll(".crm-tab-pane").forEach(pane => {
        pane.classList.remove("active");
    });
    const targetPane = document.getElementById(`tab-${tabName}`);
    if (targetPane) targetPane.classList.add("active");

    // Load tab specific data
    if (tabName === 'dashboard') {
        loadCrmDashboard();
    } else if (tabName === 'mahsulotlar') {
        renderCrmProducts();
    } else if (tabName === 'buyurtmalar') {
        renderCrmOrders();
    } else if (tabName === 'mijozlar') {
        renderCrmCustomers();
    } else if (tabName === 'hisobotlar') {
        initHisobotlarCharts();
    }
};

// Calculate and load dashboard stats and charts
window.loadCrmDashboard = function() {
    // 1. Calculate general stats
    const totalRev = crmOrders.reduce((sum, o) => sum + o.total, 0);
    const lowStockCount = products.filter(p => (p.stock || 0) < 5).length;

    document.getElementById("stat-revenue").innerText = totalRev.toLocaleString('uz-UZ') + " UZS";
    document.getElementById("stat-orders").innerText = crmOrders.length + " ta";
    document.getElementById("stat-customers").innerText = crmCustomers.length + " ta";
    document.getElementById("stat-low-stock").innerText = lowStockCount + " ta";

    // 2. Render recent orders table
    const recentTbody = document.getElementById("dashboard-recent-orders");
    if (recentTbody) {
        recentTbody.innerHTML = crmOrders.slice(0, 5).map(o => `
            <tr>
                <td>#${o.id}</td>
                <td><strong>${o.customer}</strong></td>
                <td>${o.date}</td>
                <td>${o.total.toLocaleString('uz-UZ')} UZS</td>
                <td><span class="status-badge ${o.status.toLowerCase()}">${o.status}</span></td>
            </tr>
        `).join("");
    }

    // 3. Initialize charts
    initDashboardCharts();
};

function initDashboardCharts() {
    // Line Chart
    const lineCtx = document.getElementById('salesLineChart')?.getContext('2d');
    if (lineCtx) {
        if (salesLineChartInstance) salesLineChartInstance.destroy();
        
        salesLineChartInstance = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'],
                datasets: [{
                    label: 'Savdo hajmi (UZS)',
                    data: [1200000, 1800000, 3000000, 4800000, 2300000, 4900000, 3500000],
                    borderColor: '#e2b73c',
                    backgroundColor: 'rgba(226, 183, 60, 0.05)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#e2b73c'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        grid: { color: '#1f2a3c' },
                        ticks: { color: '#9aa8bc' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#9aa8bc' }
                    }
                }
            }
        });
    }

    // Doughnut Chart
    const doughnutCtx = document.getElementById('categoryDoughnutChart')?.getContext('2d');
    if (doughnutCtx) {
        if (categoryDoughnutChartInstance) categoryDoughnutChartInstance.destroy();

        categoryDoughnutChartInstance = new Chart(doughnutCtx, {
            type: 'doughnut',
            data: {
                labels: ['Futbolkalar', 'Kostyumlar', 'Kurtkalar', 'Poyabzallar', 'Shimlar'],
                datasets: [{
                    data: [20, 15, 12, 18, 35],
                    backgroundColor: [
                        '#e2b73c',
                        '#3b82f6',
                        '#10b981',
                        '#ef4444',
                        '#8b5cf6'
                    ],
                    borderWidth: 2,
                    borderColor: '#131924'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: '#9aa8bc', font: { size: 11 } }
                    }
                },
                cutout: '65%'
            }
        });
    }
}

function initHisobotlarCharts() {
    const barCtx = document.getElementById('annualSalesBarChart')?.getContext('2d');
    if (barCtx) {
        if (annualSalesBarChartInstance) annualSalesBarChartInstance.destroy();

        annualSalesBarChartInstance = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
                datasets: [{
                    label: 'Oylik daromad (UZS)',
                    data: [12000000, 15000000, 18000000, 23000000, 31000000, 4000000, 0, 0, 0, 0, 0, 0],
                    backgroundColor: '#e2b73c',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        grid: { color: '#1f2a3c' },
                        ticks: { color: '#9aa8bc' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#9aa8bc' }
                    }
                }
            }
        });
    }
}

// Render Products Tab Grid
window.renderCrmProducts = function(searchQuery = '', categoryFilter = 'all') {
    const container = document.getElementById("crm-products-grid-container");
    if (!container) return;

    let filtered = products;
    if (searchQuery) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(p => p.category === categoryFilter);
    }

    container.innerHTML = filtered.map(p => {
        // Ensure standard stock counts if undefined
        const stockCount = p.stock !== undefined ? p.stock : 15;
        const formattedPrice = (p.price * 10000).toLocaleString('uz-UZ') + " UZS"; // Adjust UZS prices

        return `
            <div class="crm-product-card">
                <div class="product-image-container">
                    <img src="${p.image}" alt="${p.title}">
                    <span class="category-tag">${p.category}</span>
                    <span class="stock-tag">Omborda: ${stockCount} ta</span>
                </div>
                <div class="product-card-body">
                    <h4>${p.title}</h4>
                    <div class="product-card-price">${formattedPrice}</div>
                </div>
                <div class="product-card-footer">
                    <button class="btn-edit" onclick="editProduct(${p.id})">
                        <i class="ri-edit-line"></i> Tahrirlash
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${p.id})" title="O'chirish">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </div>
        `;
    }).join("");
};

// Render Orders Tab List
window.renderCrmOrders = function(searchQuery = '') {
    const tbody = document.getElementById("orders-list-table");
    if (!tbody) return;

    let filtered = crmOrders;
    if (searchQuery) {
        filtered = filtered.filter(o => o.customer.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    tbody.innerHTML = filtered.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td><strong>${o.customer}</strong></td>
            <td>${o.date}</td>
            <td>${o.total.toLocaleString('uz-UZ')} UZS</td>
            <td>
                <select onchange="updateCrmOrderStatus('${o.id}', this.value)" class="status-badge ${o.status.toLowerCase()}">
                    <option value="KUTILMOQDA" ${o.status === 'KUTILMOQDA' ? 'selected' : ''}>KUTILMOQDA</option>
                    <option value="YETKAZILDI" ${o.status === 'YETKAZILDI' ? 'selected' : ''}>YETKAZILDI</option>
                </select>
            </td>
            <td><div style="max-width: 250px; font-size:12px; color:var(--crm-text-secondary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${o.items}</div></td>
            <td>
                <button class="btn btn-secondary" onclick="printReceipt('${o.id}')" style="padding: 6px 12px; font-size:12px;">
                    <i class="ri-printer-line"></i> Kvitansiya
                </button>
            </td>
        </tr>
    `).join("");
};

// Render Customers Tab List
window.renderCrmCustomers = function(searchQuery = '') {
    const tbody = document.getElementById("customers-list-table");
    if (!tbody) return;

    let filtered = crmCustomers;
    if (searchQuery) {
        filtered = filtered.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    tbody.innerHTML = filtered.map(c => `
        <tr>
            <td>#${c.id}</td>
            <td><strong>${c.name}</strong></td>
            <td>${c.phone}</td>
            <td>${c.email}</td>
            <td>${c.totalBought.toLocaleString('uz-UZ')} UZS</td>
            <td>${c.ordersCount} ta</td>
        </tr>
    `).join("");
};

// Product Modal controls
window.openAddProductModal = function() {
    document.getElementById("crm-product-editor-form").reset();
    document.getElementById("edit-prod-id").value = "";
    document.getElementById("product-modal-title").innerText = "Yangi mahsulot qo'shish";
    document.getElementById("crm-product-modal").classList.add("active");
};

window.closeProductModal = function() {
    document.getElementById("crm-product-modal").classList.remove("active");
};

window.editProduct = function(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    document.getElementById("edit-prod-id").value = p.id;
    document.getElementById("prod-title-input").value = p.title;
    document.getElementById("prod-category-input").value = p.category;
    document.getElementById("prod-price-input").value = p.price * 10000; // UZS representation adjustment
    document.getElementById("prod-qty-input").value = p.stock || 15;
    document.getElementById("prod-desc-input").value = p.description || "";

    document.getElementById("product-modal-title").innerText = "Mahsulotni tahrirlash";
    document.getElementById("crm-product-modal").classList.add("active");
};

window.handleProductSubmit = function(e) {
    e.preventDefault();
    const idVal = document.getElementById("edit-prod-id").value;
    const title = document.getElementById("prod-title-input").value;
    const category = document.getElementById("prod-category-input").value;
    const price = parseFloat(document.getElementById("prod-price-input").value) / 10000;
    const stock = parseInt(document.getElementById("prod-qty-input").value);
    const desc = document.getElementById("prod-desc-input").value;

    if (idVal) {
        // Update product
        const prod = products.find(p => p.id === parseInt(idVal));
        if (prod) {
            prod.title = title;
            prod.category = category;
            prod.price = price;
            prod.stock = stock;
            prod.description = desc;
            showToast("Mahsulot muvaffaqiyatli yangilandi!");
        }
    } else {
        // Add product
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const defaultImg = category === "Women's Fashion" ? "images/womens_fashion.png" 
                         : category === "Men's Fashion" ? "images/mens_fashion.png"
                         : category === "Kids Fashion" ? "images/kids_fashion.png"
                         : "images/accessories.png";
        products.push({
            id: newId,
            title: title,
            category: category,
            price: price,
            stock: stock,
            description: desc,
            rating: 5.0,
            image: defaultImg
        });
        showToast("Yangi mahsulot qo'shildi!");
    }

    closeProductModal();
    renderCrmProducts();
};

window.deleteProduct = function(id) {
    if (confirm("Ushbu mahsulotni o'chirishni xohlaysizmi?")) {
        products = products.filter(p => p.id !== id);
        renderCrmProducts();
        showToast("Mahsulot o'chirildi!");
    }
};

// Customer Modal controls
window.openAddCustomerModal = function() {
    document.getElementById("crm-customer-editor-form").reset();
    document.getElementById("crm-customer-modal").classList.add("active");
};

window.closeCustomerModal = function() {
    document.getElementById("crm-customer-modal").classList.remove("active");
};

window.handleCustomerSubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById("cust-name-input").value;
    const phone = document.getElementById("cust-phone-input").value;
    const email = document.getElementById("cust-email-input").value;
    
    const newId = crmCustomers.length > 0 ? Math.max(...crmCustomers.map(c => parseInt(c.id))) + 1 : 1;
    crmCustomers.push({
        id: String(newId),
        name: name,
        phone: phone,
        email: email,
        totalBought: 0,
        ordersCount: 0
    });

    closeCustomerModal();
    renderCrmCustomers();
    showToast("Mijoz ro'yxatga qo'shildi!");
};

// Order Modal Controls
window.openCreateOrderModal = function() {
    document.getElementById("crm-order-editor-form").reset();
    
    // Fill customer selector
    const custSelect = document.getElementById("order-cust-select");
    custSelect.innerHTML = crmCustomers.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
    
    // Fill products selector
    const prodSelect = document.getElementById("order-prod-select");
    prodSelect.innerHTML = products.map(p => `<option value="${p.id}">${p.title} (${(p.price*10000).toLocaleString('uz-UZ')} UZS)</option>`).join("");

    document.getElementById("crm-order-modal").classList.add("active");
};

window.closeOrderModal = function() {
    document.getElementById("crm-order-modal").classList.remove("active");
};

window.handleOrderSubmit = function(e) {
    e.preventDefault();
    const customer = document.getElementById("order-cust-select").value;
    const prodId = parseInt(document.getElementById("order-prod-select").value);
    const status = document.getElementById("order-status-select").value;
    
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    const totalVal = prod.price * 10000;
    const dateStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const newId = crmOrders.length > 0 ? Math.max(...crmOrders.map(o => parseInt(o.id))) + 1 : 1;
    
    crmOrders.push({
        id: String(newId),
        customer: customer,
        date: dateStr,
        total: totalVal,
        status: status,
        items: `${prod.title} (1 ta)`
    });

    // Update customer stats
    const custObj = crmCustomers.find(c => c.name === customer);
    if (custObj) {
        custObj.ordersCount += 1;
        custObj.totalBought += totalVal;
    }

    closeOrderModal();
    renderCrmOrders();
    showToast("Yangi buyurtma yaratildi!");
};

window.updateCrmOrderStatus = function(id, status) {
    const order = crmOrders.find(o => o.id === id);
    if (order) {
        order.status = status;
        showToast(`Buyurtma #${id} holati yangilandi!`);
        loadCrmDashboard();
    }
};

window.printReceipt = function(id) {
    const order = crmOrders.find(o => o.id === id);
    if (!order) return;
    
    const win = window.open("", "_blank");
    win.document.write(`
        <html>
            <head>
                <title>Kvitansiya #${order.id}</title>
                <style>
                    body { font-family: monospace; padding: 20px; color: #333; }
                    .receipt { max-width: 300px; margin: 0 auto; border: 1px dashed #ccc; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .header h2 { margin: 0; }
                    .item-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .total { border-top: 1px dashed #333; padding-top: 10px; font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <h2>ShopCo</h2>
                        <p>Tashkent, Uzbekistan</p>
                        <p>Buyurtma ID: #${order.id}</p>
                    </div>
                    <div class="content">
                        <p>Mijoz: <strong>${order.customer}</strong></p>
                        <p>Sana: ${order.date}</p>
                        <hr style="border:0; border-top:1px dashed #ccc;">
                        <div class="item-row">
                            <span>Mahsulotlar:</span>
                        </div>
                        <p style="font-size:12px;">${order.items}</p>
                        <div class="item-row total">
                            <span>JAMI:</span>
                            <span>${order.total.toLocaleString('uz-UZ')} UZS</span>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Xaridingiz uchun rahmat!</p>
                    </div>
                </div>
                <script>window.print();</script>
            </body>
        </html>
    `);
    win.document.close();
};
