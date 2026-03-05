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

    menuGrid.innerHTML = filteredMenu.map(item => {
        const isOutOfStock = localStorage.getItem(`stock_${item.id}`) === 'false';
        return `
            <div class="menu-card ${isOutOfStock ? 'out-of-stock' : ''}" data-aos="fade-up">
                ${isOutOfStock ? '<div class="stock-badge">Out of Stock</div>' : ''}
                <img src="${item.image}" alt="${item.name}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'">
                <div class="card-content">
                    <h3>${item.name}</h3>
                    <div class="card-price">₹${item.price}</div>
                    <p class="card-desc">${item.description}</p>
                    <button class="add-to-cart" onclick="addToCart(${item.id})" ${isOutOfStock ? 'disabled' : ''}>
                        ${isOutOfStock ? 'Unavailable' : 'Add to Basket'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
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
    document.querySelector('.nav-links').classList.remove('active');
};

window.showView = (view) => {
    const storeView = document.getElementById('store-view');
    const adminView = document.getElementById('admin-view');
    const checkoutView = document.getElementById('checkout-view');

    // Hide all
    storeView.classList.add('hidden');
    adminView.classList.add('hidden');
    checkoutView.classList.add('hidden');

    if (view === 'admin') {
        adminView.classList.remove('hidden');
        renderAdminOrders();
    } else if (view === 'checkout') {
        checkoutView.classList.remove('hidden');
        renderCheckoutSummaryView();
    } else {
        storeView.classList.remove('hidden');
    }
    window.scrollTo(0, 0);
};

function setupEventListeners() {
    const cartBtn = document.getElementById('cart-btn');
    const closeCart = document.getElementById('close-cart');
    const overlay = document.getElementById('overlay');
    const navbar = document.querySelector('.navbar');

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    cartBtn.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartSidebar);
    overlay.addEventListener('click', closeCartSidebar);

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

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
        openCheckoutModal();
    });

    // Checkout Page Toggles
    const typeDineInView = document.getElementById('type-dinein-view');
    const typeDeliveryView = document.getElementById('type-delivery-view');

    if (typeDineInView) {
        typeDineInView.addEventListener('change', () => {
            document.getElementById('dinein-details-view').classList.remove('hidden');
            document.getElementById('delivery-details-view').classList.add('hidden');
            document.getElementById('checkout-table-view').required = true;
            document.getElementById('checkout-address-view').required = false;
        });
    }

    if (typeDeliveryView) {
        typeDeliveryView.addEventListener('change', () => {
            document.getElementById('dinein-details-view').classList.add('hidden');
            document.getElementById('delivery-details-view').classList.remove('hidden');
            document.getElementById('checkout-table-view').required = false;
            document.getElementById('checkout-address-view').required = true;
        });
    }

    const checkoutFormView = document.getElementById('checkout-form-view');
    if (checkoutFormView) {
        checkoutFormView.addEventListener('submit', (e) => {
            e.preventDefault();
            finalPlaceOrderView();
        });
    }

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
        document.querySelector('.nav-links').classList.remove('active');
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

function openCheckoutModal() {
    showView('checkout');
    closeCartSidebar();
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.add('hidden');
    document.getElementById('overlay').classList.remove('visible');
}

function renderCheckoutSummaryView() {
    const list = document.getElementById('checkout-items-list-view');
    const subtotal = document.getElementById('summary-subtotal');
    const total = document.getElementById('summary-total');

    if (!list) return;

    list.innerHTML = cart.map(item => `
        <div class="checkout-item-mini">
            <span class="checkout-item-name">${item.name} x ${item.quantity}</span>
            <span class="checkout-item-price">₹${item.price * item.quantity}</span>
        </div>
    `).join('');

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    subtotal.textContent = `₹${totalAmount}`;
    total.textContent = `₹${totalAmount}`;
}

function finalPlaceOrderView() {
    const orderType = document.querySelector('input[name="orderTypeView"]:checked').value;
    const name = document.getElementById('checkout-name-view').value;
    const phone = document.getElementById('checkout-phone-view').value;
    const email = document.getElementById('checkout-email-view').value;
    const instructions = document.getElementById('checkout-instructions-view').value;

    const details = {
        name,
        phone,
        email,
        instructions,
        orderType
    };

    if (orderType === 'dinein') {
        details.tableNumber = document.getElementById('checkout-table-view').value;
    } else {
        details.address = document.getElementById('checkout-address-view').value;
    }

    const order = {
        id: Date.now(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'Pending',
        timestamp: new Date().toLocaleString(),
        customer: details
    };

    cart = [];
    saveCart();
    updateCartUI();

    // Go back to home state (conceptually)
    showView('store');

    // Show payment modal
    showPaymentModal(order);
}

// Payment & Confirmation Logic
function showPaymentModal(order) {
    const modal = document.getElementById('payment-modal');
    const amountSpan = document.getElementById('payment-amount');
    amountSpan.textContent = order.total;

    modal.classList.remove('hidden');
    document.getElementById('overlay').classList.add('visible');

    // Setup temporary order storage
    window.currentPendingOrder = order;

    document.getElementById('confirm-payment-btn').onclick = confirmPayment;
}

window.closePaymentModal = () => {
    document.getElementById('payment-modal').classList.add('hidden');
    if (!document.getElementById('checkout-modal').classList.contains('hidden') === false) {
        document.getElementById('overlay').classList.remove('visible');
    }
}

function confirmPayment() {
    const order = window.currentPendingOrder;
    if (!order) return;

    let orders = JSON.parse(localStorage.getItem('acharyans_orders')) || [];
    orders.push(order);
    localStorage.setItem('acharyans_orders', JSON.stringify(orders));

    // Update UI
    document.getElementById('confirm-payment-btn').classList.add('hidden');
    document.getElementById('whatsapp-notify-btn').classList.remove('hidden');

    const receiptBtn = document.createElement('button');
    receiptBtn.className = "btn btn-secondary btn-block border-accent";
    receiptBtn.innerHTML = '<i class="fas fa-file-invoice"></i> View Receipt';
    receiptBtn.onclick = () => showReceiptModal(order);
    document.querySelector('.payment-actions').appendChild(receiptBtn);

    document.getElementById('whatsapp-notify-btn').onclick = () => {
        sendWhatsAppNotification(order);
    };

    alert(`Order Confirmed! Your payment of ₹${order.total} has been received.`);
}

function showReceiptModal(order) {
    const modal = document.getElementById('receipt-modal');
    const details = document.getElementById('receipt-details');

    details.innerHTML = `
        <div class="receipt-info">
            <p><strong>Order ID:</strong> #${order.id.toString().slice(-6)}</p>
            <p><strong>Date:</strong> ${order.timestamp}</p>
            <p><strong>Customer:</strong> ${order.customer.name}</p>
            <p><strong>Type:</strong> ${order.customer.orderType.toUpperCase()}</p>
        </div>
        <div class="divider"></div>
        ${order.items.map(i => `
            <div class="receipt-row">
                <span>${i.name} x ${i.quantity}</span>
                <span>₹${i.price * i.quantity}</span>
            </div>
        `).join('')}
        <div class="receipt-row total">
            <span>Total Payable</span>
            <span>₹${order.total}</span>
        </div>
    `;

    modal.classList.remove('hidden');
    document.getElementById('payment-modal').classList.add('hidden');
}

window.closeReceiptModal = () => {
    document.getElementById('receipt-modal').classList.add('hidden');
    document.getElementById('overlay').classList.remove('visible');
}

function sendWhatsAppNotification(order) {
    const phone = "9632297927";
    const items = order.items.map(i => `${i.name} x${i.quantity}`).join(', ');
    const type = order.customer.orderType === 'dinein' ? `Dine-in (Table ${order.customer.tableNumber})` : `Delivery to ${order.customer.address}`;
    const message = `*New Order from Acharyans Cafe*%0A%0A*Order:* ${items}%0A*Total:* ₹${order.total}%0A*Type:* ${type}%0A*Customer:* ${order.customer.name} (${order.customer.phone})%0A*Status:* Paid Online`;

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

function placeOrder() {
    // This function is now superseded by finalPlaceOrder, 
    // but kept for reference or direct calls if needed.
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
    if (tab === 'menu_mgmt') renderAdminMenuMgmt();
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
                    <th>Type</th>
                    <th>Details</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${orders.reverse().map(order => `
                    <tr>
                        <td>#${order.id.toString().slice(-6)}</td>
                        <td>${order.timestamp}</td>
                        <td><span class="status-badge ${order.customer?.orderType === 'delivery' ? 'delivery' : 'dinein'}">${order.customer?.orderType?.toUpperCase() || 'N/A'}</span></td>
                        <td>
                            ${order.customer ? `
                                <strong>${order.customer.name}</strong><br>
                                ${order.customer.phone}<br>
                                ${order.customer.orderType === 'dinein' ? 'Table: ' + order.customer.tableNumber : order.customer.address}
                            ` : 'Direct Order'}
                        </td>
                        <td>${order.items.map(i => `${i.name} (${i.quantity})`).join(', ')}</td>
                        <td>₹${order.total}</td>
                        <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
                        <td>
                            <div class="action-btn-group">
                                ${order.status === 'Pending' ? `<button class="action-btn btn-status-next" onclick="updateOrderStatus(${order.id}, 'Preparing')">Prepare</button>` : ''}
                                ${order.status === 'Preparing' ? `<button class="action-btn btn-status-next" onclick="updateOrderStatus(${order.id}, 'Ready')">Ready</button>` : ''}
                                ${order.status === 'Ready' ? `<button class="action-btn btn-status-next" onclick="updateOrderStatus(${order.id}, 'Completed')">Done</button>` : ''}
                                <button class="action-btn btn-delete" onclick="deleteOrder(${order.id})"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

window.updateOrderStatus = (id, newStatus) => {
    let orders = JSON.parse(localStorage.getItem('acharyans_orders')) || [];
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
        orders[index].status = newStatus;
        localStorage.setItem('acharyans_orders', JSON.stringify(orders));
        renderAdminOrders();
    }
};

window.deleteOrder = (id) => {
    if (confirm('Delete this order?')) {
        let orders = JSON.parse(localStorage.getItem('acharyans_orders')) || [];
        orders = orders.filter(o => o.id !== id);
        localStorage.setItem('acharyans_orders', JSON.stringify(orders));
        renderAdminOrders();
    }
};

function renderAdminMenuMgmt() {
    const menuList = document.getElementById('admin-menu-list');
    menuList.innerHTML = menuData.map(item => {
        const isOutOfStock = localStorage.getItem(`stock_${item.id}`) === 'false';
        return `
            <div class="menu-mgmt-card">
                <div class="menu-mgmt-info">
                    <h4>${item.name}</h4>
                    <p>₹${item.price}</p>
                </div>
                <button class="stock-toggle-btn ${isOutOfStock ? 'out-of-stock' : 'in-stock'}" 
                    onclick="toggleStock(${item.id})">
                    ${isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                </button>
            </div>
        `;
    }).join('');
}

window.toggleStock = (id) => {
    const key = `stock_${id}`;
    const current = localStorage.getItem(key) !== 'false';
    localStorage.setItem(key, !current);
    renderAdminMenuMgmt();
    renderMenu(); // Update storefront
};

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
