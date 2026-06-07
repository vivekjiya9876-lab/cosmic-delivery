// GloboCrust State Management Module

const DEFAULT_STATE = {
  cart: [],
  location: null,          // Current active location object
  cartOpen: false,         // Cart drawer state
  trackerOpen: false,      // Order tracker state
  trackerStep: 0,          // Steps: 0 (Baked), 1 (Dispatched), 2 (Courier Transit), 3 (Arrived)
  orderActive: false,      // Has an active order been submitted?
  orderAddress: '',
  orderETA: 28,            // Mock remaining minutes
  customPizza: {
    crust: 'Classic Neapolitan',
    size: 'Large 14"',
    toppings: [],          // Array of topping strings
    basePrice: 19.99
  }
};

let state = { ...JSON.parse(JSON.stringify(DEFAULT_STATE)) };
const listeners = {};

// Subscribe to state changes
export function subscribe(event, callback) {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(callback);
}

// Trigger notify across all modules
export function notify(event, data) {
  if (listeners[event]) {
    listeners[event].forEach(cb => cb(data));
  }
  window.dispatchEvent(new CustomEvent(`globocrust-${event}`, { detail: data }));
}

// Retrieve current snapshot
export function getState() {
  return state;
}

// Reset state
export function resetState() {
  state = { ...JSON.parse(JSON.stringify(DEFAULT_STATE)) };
  notify('stateChange', state);
}

/* Cart Mutations */

export function addToCart(item) {
  // item: { id, name, basePrice, quantity, image, tags, isCustom, toppings, crust, size }
  
  if (item.isCustom) {
    // Custom pizzas are always unique items unless they have identical options
    const existingIndex = state.cart.findIndex(i => 
      i.isCustom && 
      i.crust === item.crust && 
      i.size === item.size && 
      JSON.stringify(i.toppings.sort()) === JSON.stringify(item.toppings.sort())
    );

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += item.quantity || 1;
    } else {
      state.cart.push({
        ...item,
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        quantity: item.quantity || 1
      });
    }
  } else {
    // Normal pizzas
    const existingItem = state.cart.find(i => i.id === item.id && !i.isCustom);
    if (existingItem) {
      existingItem.quantity += item.quantity || 1;
    } else {
      state.cart.push({
        ...item,
        quantity: item.quantity || 1
      });
    }
  }
  
  notify('cartChange', state.cart);
  notify('cartNotification', { message: `${item.name} added to box!`, type: 'add' });
}

export function updateQuantity(itemId, amount) {
  const itemIndex = state.cart.findIndex(i => i.id === itemId);
  if (itemIndex > -1) {
    state.cart[itemIndex].quantity += amount;
    if (state.cart[itemIndex].quantity <= 0) {
      const removedName = state.cart[itemIndex].name;
      state.cart.splice(itemIndex, 1);
      notify('cartNotification', { message: `${removedName} removed.`, type: 'remove' });
    }
    notify('cartChange', state.cart);
  }
}

export function clearCart() {
  state.cart = [];
  notify('cartChange', state.cart);
}

/* Location Mutations */

export function setLocation(locationObj) {
  state.location = locationObj;
  notify('locationChange', locationObj);
  notify('cartChange', state.cart); // Re-calculate prices under the new location currency
}

/* Drawer Controls */

export function setCartOpen(isOpen) {
  state.cartOpen = isOpen;
  notify('drawerChange', { cartOpen: state.cartOpen, trackerOpen: state.trackerOpen });
}

export function setTrackerOpen(isOpen) {
  state.trackerOpen = isOpen;
  notify('drawerChange', { cartOpen: state.cartOpen, trackerOpen: state.trackerOpen });
}

/* Order Submission and Progression */

export function startOrder(address, phone) {
  state.orderActive = true;
  state.orderAddress = address;
  state.orderETA = state.location ? state.location.etd : 28;
  state.trackerStep = 0;
  state.cart = []; // clear cart
  state.cartOpen = false;
  state.trackerOpen = true;

  notify('orderStarted', {
    address,
    phone,
    eta: state.orderETA,
    trackerStep: state.trackerStep
  });
  notify('cartChange', state.cart);
  notify('drawerChange', { cartOpen: state.cartOpen, trackerOpen: state.trackerOpen });
}

export function advanceTrackerStep() {
  if (!state.orderActive) return;
  
  if (state.trackerStep < 3) {
    state.trackerStep += 1;
    if (state.orderETA > 5) {
      state.orderETA -= Math.floor(Math.random() * 5) + 3; // Mock decreasing time
    } else {
      state.orderETA = 0;
    }
    notify('trackerChange', { step: state.trackerStep, eta: state.orderETA });
  } else {
    // Reset or stay at arrived
    notify('trackerComplete', {});
  }
}

/* Custom Pizza Builder Mutations */

export function updateCustomCrust(crust) {
  state.customPizza.crust = crust;
  notify('customPizzaChange', state.customPizza);
}

export function updateCustomSize(size) {
  state.customPizza.size = size;
  // Size updates base prices
  if (size.includes('10"')) state.customPizza.basePrice = 14.99;
  else if (size.includes('12"')) state.customPizza.basePrice = 17.99;
  else state.customPizza.basePrice = 19.99;
  
  notify('customPizzaChange', state.customPizza);
}

export function toggleCustomTopping(topping) {
  const index = state.customPizza.toppings.indexOf(topping);
  if (index > -1) {
    state.customPizza.toppings.splice(index, 1);
  } else {
    state.customPizza.toppings.push(topping);
  }
  notify('customPizzaChange', state.customPizza);
}

export function resetCustomPizza() {
  state.customPizza = {
    crust: 'Classic Neapolitan',
    size: 'Large 14"',
    toppings: [],
    basePrice: 19.99
  };
  notify('customPizzaChange', state.customPizza);
}

// Convert Base USD price to localized currency representation
export function formatPrice(usdValue) {
  if (!state.location) {
    return `$${usdValue.toFixed(2)}`;
  }
  
  const { symbol, exchangeRate } = state.location;
  const converted = usdValue * exchangeRate;
  
  if (symbol === '¥') {
    return `¥${Math.round(converted).toLocaleString()}`;
  }
  return `${symbol}${converted.toFixed(2)}`;
}
