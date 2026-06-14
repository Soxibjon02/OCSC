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
            // Logged in as Admin: show CRM button & redirect automatically to CRM View
            crmViewBtn.style.display = "block";
            activateCrmView();
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
        isCrmActive = !isCrmActive;
        if (isCrmActive) {
            crmViewBtn.innerText = "Store View";
            crmSection.classList.add("active");
            // Hide all standard storefront wrappers
            document.querySelectorAll("section:not(.crm-section)").forEach(sec => sec.style.display = "none");
            // Hide storefront navigation links
            const navMenu = document.getElementById("nav-menu");
            if (navMenu) navMenu.style.display = "none";
            loadCrmDashboard();
            showToast("OCSC Management CRM Dashboard Activated");
        } else {
            crmViewBtn.innerText = "CRM Panel";
            crmSection.classList.remove("active");
            // Show all standard storefront wrappers
            document.querySelectorAll("section:not(.crm-section)").forEach(sec => sec.style.display = "block");
            // Show storefront navigation links
            const navMenu = document.getElementById("nav-menu");
            if (navMenu) navMenu.style.display = "flex";
            showToast("Returned to Customer Storefront");
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

// CRM Dashboard Initial Dummy Orders
let crmOrders = [
    { id: "1092", customer: "Sarah Jenkins", items: "1x Classic Trench Coat", total: 189.00, status: "completed" },
    { id: "1093", customer: "David Miller", items: "1x Tailored Wool Suit", total: 450.00, status: "processing" },
    { id: "1094", customer: "Elena Rostova", items: "1x Minimalist Linen Blazer", total: 129.00, status: "pending" },
    { id: "1095", customer: "Marcus Aurelius", items: "2x Gold Anchor Cufflinks", total: 150.00, status: "completed" },
    { id: "1096", customer: "Sophia Loren", items: "1x Premium Leather Handbag", total: 299.00, status: "completed" },
    { id: "1097", customer: "Lucas H.", items: "1x Kids Cashmere Sweater", total: 89.00, status: "pending" }
];

// Load and Render OCSC CRM Data
function loadCrmDashboard() {
    // 1. Calculate and update stats counters
    const totalRev = crmOrders.reduce((sum, ord) => sum + ord.total, 0);
    document.getElementById("crm-revenue").innerText = `$${totalRev.toFixed(2)}`;
    document.getElementById("crm-orders").innerText = crmOrders.length;
    document.getElementById("crm-products-count").innerText = products.length;

    // 2. Render Orders Table
    const ordersTbody = document.getElementById("crm-orders-list");
    ordersTbody.innerHTML = crmOrders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td><strong>${order.customer}</strong></td>
            <td>${order.items}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
            <td>
                <div class="crm-actions-cell">
                    <button class="crm-action-btn" onclick="updateOrderStatus('${order.id}', 'completed')">Complete</button>
                    <button class="crm-action-btn delete" onclick="deleteCrmOrder('${order.id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join("");

    // 3. Render Products List Table
    const productsTbody = document.getElementById("crm-products-list");
    productsTbody.innerHTML = products.map(prod => `
        <tr>
            <td>${prod.id}</td>
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${prod.image}" style="width:35px; height:35px; object-fit:cover;">
                    <strong>${prod.title}</strong>
                </div>
            </td>
            <td>${prod.category}</td>
            <td>$${prod.price.toFixed(2)}</td>
            <td>★ ${prod.rating.toFixed(1)}</td>
            <td>
                <div class="crm-actions-cell">
                    <button class="crm-action-btn" onclick="editCrmProduct(${prod.id})">Edit</button>
                    <button class="crm-action-btn delete" onclick="deleteCrmProduct(${prod.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join("");
}

// Update CRM Order Status
window.updateOrderStatus = function(orderId, newStatus) {
    const order = crmOrders.find(ord => ord.id === orderId);
    if (order) {
        order.status = newStatus;
        loadCrmDashboard();
        showToast(`Order #${orderId} marked as ${newStatus}`);
    }
};

// Delete CRM Order
window.deleteCrmOrder = function(orderId) {
    crmOrders = crmOrders.filter(ord => ord.id !== orderId);
    loadCrmDashboard();
    showToast(`Order #${orderId} deleted`);
};

// Edit Existing Product inside CRM Form
window.editCrmProduct = function(id) {
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    document.getElementById("edit-product-id").value = prod.id;
    document.getElementById("prod-name").value = prod.title;
    document.getElementById("prod-category").value = prod.category;
    document.getElementById("prod-price").value = prod.price;
    document.getElementById("prod-desc").value = prod.description;

    document.getElementById("form-action-title").innerText = `Edit Product #${prod.id}`;
    showToast(`Loaded ${prod.title} details for editing`);
};

// Save Product Details
function saveCrmProduct() {
    const idVal = document.getElementById("edit-product-id").value;
    const name = document.getElementById("prod-name").value;
    const category = document.getElementById("prod-category").value;
    const price = parseFloat(document.getElementById("prod-price").value);
    const desc = document.getElementById("prod-desc").value;

    if (idVal) {
        // Edit mode
        const prodId = parseInt(idVal);
        const index = products.findIndex(p => p.id === prodId);
        if (index > -1) {
            products[index].title = name;
            products[index].category = category;
            products[index].price = price;
            products[index].description = desc;
            showToast("Product updated successfully");
        }
    } else {
        // Add mode
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const defaultImg = category === "Women's Fashion" ? "images/womens_fashion.png" 
                         : category === "Men's Fashion" ? "images/mens_fashion.png"
                         : category === "Kids Fashion" ? "images/kids_fashion.png"
                         : "images/accessories.png";
        
        products.push({
            id: newId,
            title: name,
            price: price,
            originalPrice: null,
            category: category,
            rating: 5.0,
            image: defaultImg,
            description: desc
        });
        showToast("New product added to store");
    }

    document.getElementById("crm-product-form").reset();
    document.getElementById("edit-product-id").value = "";
    document.getElementById("form-action-title").innerText = "Add Product";
    loadCrmDashboard();
}

// Delete CRM Product
window.deleteCrmProduct = function(id) {
    const index = products.findIndex(p => p.id === id);
    if (index > -1) {
        const title = products[index].title;
        products.splice(index, 1);
        loadCrmDashboard();
        showToast(`"${title}" deleted from catalog`);
    }
};

