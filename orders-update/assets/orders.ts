// @ts-nocheck
(function () {
    'use strict';
  
    const STORAGE_KEY = 'sizzle_orders';
    const ordersList = document.getElementById('orders-list');
  
    const activeTab = document.querySelector('.c7eb64632 .cb93d8af0');
    const otherTabs = document.querySelectorAll('.c7eb64632 .ca8e94988');
  
    let currentFilter = 'active';
  
    function getOrders() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch (_) {
        return [];
      }
    }
  
    function saveOrders(orders) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }
  
    function formatPrice(price) {
      return '$' + Number(price).toFixed(2);
    }
  
    function getNextStatus(currentStatus) {
      if (currentStatus === 'active') return 'preparing';
      if (currentStatus === 'preparing') return 'ready';
      if (currentStatus === 'ready') return 'completed';
      return 'completed';
    }
  
    function getActionLabel(currentStatus) {
      if (currentStatus === 'active') return 'Preparing';
      if (currentStatus === 'preparing') return 'Ready';
      if (currentStatus === 'ready') return 'Complete';
      return '';
    }
  
    function filterOrders(orders) {
      if (currentFilter === 'active') {
        return orders.filter(order =>
          order.status === 'active' ||
          order.status === 'preparing' ||
          order.status === 'ready'
        );
      }
  
      if (currentFilter === 'completed') {
        return orders.filter(order => order.status === 'completed');
      }
  
      return orders;
    }
  
    function setActiveTabUI() {
      if (activeTab) {
        activeTab.className = currentFilter === 'active' ? 'cb93d8af0' : 'ca8e94988';
      }
  
      otherTabs.forEach((tab, index) => {
        const label = tab.textContent.trim().toLowerCase();
  
        if (
          (label === 'completed' && currentFilter === 'completed') ||
          (label === 'all orders' && currentFilter === 'all')
        ) {
          tab.className = 'cb93d8af0';
        } else {
          tab.className = 'ca8e94988';
        }
      });
    }
  
    function renderOrders() {
      if (!ordersList) return;
  
      const orders = getOrders();
      const filteredOrders = filterOrders(orders);
  
      if (!filteredOrders.length) {
        ordersList.innerHTML = `
          <div class="c47e7aae8">
            <div class="c77a6b11a">
              <div class="c63a465e2">No ${currentFilter} orders found.</div>
              <div class="c101d052c">Try another tab or place a new order.</div>
            </div>
          </div>
        `;
        return;
      }
  
      ordersList.innerHTML = filteredOrders.map((order, index) => {
        const actionLabel = getActionLabel(order.status);
  
        return `
          <div class="c47e7aae8">
            <div class="cfb4d73af">
              <div class="c74702699">
                <div class="ce79502ad">#${String(order.id).slice(-4)}</div>
              </div>
            </div>
            <div class="c77a6b11a">
              <div class="c63a465e2">1x ${order.name}</div>
              <div class="c101d052c">Customer: Walk-in</div>
            </div>
            <div class="c413a3039">${order.time || 'Just now'}</div>
            <div class="c27413839">${formatPrice(order.price)}</div>
            <div class="c3d31e98a">
              <div class="c794b9361">
                <div class="c32b35c6f">${order.status}</div>
              </div>
            </div>
            <div class="c292f5fc9">
              ${
                order.status !== 'completed'
                  ? `<button class="c95226578 order-action-btn" data-id="${order.id}">
                      <div class="c693b5ace">${actionLabel}</div>
                    </button>`
                  : `<div class="c45d8e1e7">
                      <div class="c91280c5a">Done</div>
                    </div>`
              }
            </div>
          </div>
        `;
      }).join('');
  
      const actionButtons = document.querySelectorAll('.order-action-btn');
  
      actionButtons.forEach((btn) => {
        btn.addEventListener('click', function () {
          const orderId = Number(this.getAttribute('data-id'));
          const orders = getOrders();
  
          const updatedOrders = orders.map((order) => {
            if (order.id === orderId) {
              return {
                ...order,
                status: getNextStatus(order.status)
              };
            }
            return order;
          });
  
          saveOrders(updatedOrders);
          renderOrders();
        });
      });
    }
  
    if (activeTab) {
      activeTab.addEventListener('click', function () {
        currentFilter = 'active';
        setActiveTabUI();
        renderOrders();
      });
    }
  
    otherTabs.forEach((tab) => {
      tab.addEventListener('click', function () {
        const label = tab.textContent.trim().toLowerCase();
  
        if (label === 'completed') {
          currentFilter = 'completed';
        } else if (label === 'all orders') {
          currentFilter = 'all';
        }
  
        setActiveTabUI();
        renderOrders();
      });
    });
  
    setActiveTabUI();
    renderOrders();
  })();