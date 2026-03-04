// app.js

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// State Management
let cart = JSON.parse(localStorage.getItem('acharyans_cart')) || [];
let currentCategory = 'All';

function initApp() {
    renderMenu();
    renderFilters();
    updateCartUI();
    setupEventListeners();
    updateContactInfo();
}

function updateContactInfo() {
    document.getElementById('footer-address').textContent = cafeInfo.address;
    document.getElementById('contact-address').textContent = cafeInfo.address;
    document.getElementById('contact-phone').textContent = cafeInfo.phone;
    document.getElementById('contact-email').textContent = cafeInfo.email;
}

// Rendering Functions
function renderFilters() {
    const filterContainer = document.getElementById('category-filters');
    const categories = ['All', ...new Set(menuData.map(item => item.category))];

    filterContainer.innerHTML = categories.map(cat => `
        <button class="filter-btn ${cat === currentCategory ? 'active' : ''}" data-category="${cat}">
            ${cat}
        </button>
    `).join('');

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentCategory = e.target.dataset.category;
            renderFilters();
            renderMenu();
        });
    });
}

function renderMenu() {
    const menuGrid = document.getElementById('menu-grid');
    const filteredMenu = currentCategory === 'All'
        ? menuData
        : menuData.filter(item => item.category === currentCategory);

    menuGrid.innerHTML = filteredMenu.map(item => `
        <div class="menu-card" data-aos="fade-up">
            <img src="${item.image}" alt="${item.name}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'">
            <div class="card-content">
                <h3>${item.name}</h3>
                <div class="card-price">₹${item.price}</div>
                <p class="card-desc">${item.description}</p>
                <button class="add-to-cart" onclick="addToCart(${item.id})">
                    Add to Basket
                </button>
            </div>
        </div>
    `).join('');
}

// Cart Logic
window.addToCart = (id) => {
    const item = menuData.find(m => m.id === id);
    const existing = cart.find(c => c.id === id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    openCart();
};

window.updateQty = (id, delta) => {
    const index = cart.findIndex(c => c.id === id);
    if (index !== -1) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
    }
    saveCart();
    updateCartUI();
};

function saveCart() {
    localStorage.setItem('acharyans_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalPrice = document.getElementById('total-price');

    // Update Count
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;

    // Update Items
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart-msg">Your basket is empty.</div>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">₹${item.price * item.quantity}</div>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
            </div>
        `).join('');
    }

    // Update Total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPrice.textContent = `₹${total}`;
}

// UI Helpers
window.scrollToSection = (e, id) => {
    e.preventDefault();
    showView('store');
    const section = document.getElementById(id);
    const navHeight = document.querySelector('.navbar').offsetHeight;
    const offset = section.offsetTop - navHeight;

    window.scrollTo({
        top: offset,
        behavior: 'smooth'
    });

    // Update active class
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
        }
    });

    // Close mobile menu if open
    // (Add logic here if mobile menu is implemented)
};

window.showView = (view) => {
    const storeView = document.getElementById('store-view');
    const adminView = document.getElementById('admin-view');

    if (view === 'admin') {
        storeView.classList.add('hidden');
        adminView.classList.remove('hidden');
        renderAdminOrders();
        window.scrollTo(0, 0);
    } else {
        storeView.classList.remove('hidden');
        adminView.classList.add('hidden');
    }
};

function setupEventListeners() {
    const cartBtn = document.getElementById('cart-btn');
    const closeCart = document.getElementById('close-cart');
    const overlay = document.getElementById('overlay');
    const navbar = document.querySelector('.navbar');

    cartBtn.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartSidebar);
    overlay.addEventListener('click', closeCartSidebar);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active link on scroll
        const sections = ['home', 'menu', 'about', 'reservation', 'contact'];
        let current = '';
        const navHeight = document.querySelector('.navbar').offsetHeight + 100;

        sections.forEach(id => {
            const section = document.getElementById(id);
            if (section && window.pageYOffset >= section.offsetTop - navHeight) {
                current = id;
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your basket is empty!');
            return;
        }
        placeOrder();
    });

    // Contact Form
    document.getElementById('contact-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        e.target.reset();
    });

    // Reservation Form
    document.getElementById('reservation-form').addEventListener('submit', (e) => {
        e.preventDefault();
        placeReservation();
    });

    // Admin Panel Navigation
    document.querySelector('.admin-link').addEventListener('click', (e) => {
        e.preventDefault();
        checkAdminSession();
    });

    // Admin Login Form
    document.getElementById('admin-login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleAdminLogin();
    });
}

function checkAdminSession() {
    const isAdmin = sessionStorage.getItem('acharyans_admin_session');
    if (isAdmin === 'true') {
        showView('admin');
    } else {
        showLoginModal();
    }
}

function showLoginModal() {
    document.getElementById('admin-login-modal').classList.remove('hidden');
    document.getElementById('admin-password').focus();
}

window.hideLoginModal = () => {
    document.getElementById('admin-login-modal').classList.add('hidden');
    document.getElementById('auth-error').classList.add('hidden');
    document.getElementById('admin-password').value = '';
}

function handleAdminLogin() {
    const password = document.getElementById('admin-password').value;
    const correctPassword = 'admin123'; // Predefined password

    if (password === correctPassword) {
        sessionStorage.setItem('acharyans_admin_session', 'true');
        hideLoginModal();
        showView('admin');
    } else {
        const errorMsg = document.getElementById('auth-error');
        errorMsg.classList.remove('hidden');
        document.getElementById('admin-password').value = '';
    }
}

function openCart() {
    document.getElementById('cart-sidebar').classList.add('open');
    document.getElementById('overlay').classList.add('visible');
}

function closeCartSidebar() {
    document.getElementById('cart-sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('visible');
}

function placeOrder() {
    const order = {
        id: Date.now(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'Pending',
        timestamp: new Date().toLocaleString()
    };

    let orders = JSON.parse(localStorage.getItem('acharyans_orders')) || [];
    orders.push(order);
    localStorage.setItem('acharyans_orders', JSON.stringify(orders));

    cart = [];
    saveCart();
    updateCartUI();
    closeCartSidebar();

    alert('Order Placed Successfully! Your delicious food is being prepared.');
}

function placeReservation() {
    const reservation = {
        id: Date.now(),
        date: document.getElementById('reserve-date').value,
        time: document.getElementById('reserve-time').value,
        guests: document.getElementById('reserve-guests').value,
        occasion: document.getElementById('reserve-occasion').value,
        notes: document.getElementById('reserve-notes').value,
        status: 'Confirmed',
        timestamp: new Date().toLocaleString()
    };

    let reservations = JSON.parse(localStorage.getItem('acharyans_reservations')) || [];
    reservations.push(reservation);
    localStorage.setItem('acharyans_reservations', JSON.stringify(reservations));

    document.getElementById('reservation-form').reset();
    alert('Table Reserved Successfully! We look forward to celebrating with you.');
}

// Admin Panel Logic
window.switchAdminTab = (tab) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`admin-${tab}`).classList.add('active');

    if (tab === 'orders') renderAdminOrders();
    if (tab === 'reservations') renderAdminReservations();
};

function renderAdminOrders() {
    const ordersList = document.getElementById('admin-orders');
    const orders = JSON.parse(localStorage.getItem('acharyans_orders')) || [];

    if (orders.length === 0) {
        ordersList.innerHTML = '<p>No orders yet.</p>';
        return;
    }

    ordersList.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${orders.reverse().map(order => `
                    <tr>
                        <td>#${order.id.toString().slice(-6)}</td>
                        <td>${order.timestamp}</td>
                        <td>${order.items.map(i => `${i.name} (${i.quantity})`).join(', ')}</td>
                        <td>₹${order.total}</td>
                        <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderAdminReservations() {
    const resList = document.getElementById('admin-reservations');
    const reservations = JSON.parse(localStorage.getItem('acharyans_reservations')) || [];

    if (reservations.length === 0) {
        resList.innerHTML = '<p>No reservations yet.</p>';
        return;
    }

    resList.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Guests</th>
                    <th>Occasion</th>
                    <th>Notes</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${reservations.reverse().map(res => `
                    <tr>
                        <td>${res.date}</td>
                        <td>${res.time}</td>
                        <td>${res.guests}</td>
                        <td>${res.occasion}</td>
                        <td title="${res.notes}">${res.notes.slice(0, 20)}${res.notes.length > 20 ? '...' : ''}</td>
                        <td><span class="status-badge confirmed">${res.status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
