// GloboCrust Cart & Checkout Drawer Module

import { getState, updateQuantity, formatPrice, setCartOpen, startOrder, subscribe } from './state.js';

export function initCart(drawerId, overlayId, containerId) {
  const drawer = document.getElementById(drawerId);
  const overlay = document.getElementById(overlayId);
  const container = document.getElementById(containerId);
  
  if (!drawer || !overlay || !container) return;

  // Render Cart Contents
  const render = () => {
    const { cart, location } = getState();
    
    // Core subtotals (USD)
    const subtotalUSD = cart.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);
    const deliveryUSD = subtotalUSD > 0 ? 3.99 : 0.00;
    const taxUSD = subtotalUSD * 0.08;
    const totalUSD = subtotalUSD + deliveryUSD + taxUSD;

    // Toggle close button and items count in header
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountBadge = document.getElementById('nav-cart-count');
    if (cartCountBadge) {
      cartCountBadge.textContent = cartCount;
      if (cartCount > 0) {
        cartCountBadge.classList.remove('scale-0');
        cartCountBadge.classList.add('scale-100');
      } else {
        cartCountBadge.classList.remove('scale-100');
        cartCountBadge.classList.add('scale-0');
      }
    }

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 px-6 text-center h-full">
          <div class="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-6 animate-pulse">
            <i class="fas fa-shopping-basket text-3xl"></i>
          </div>
          <h3 class="font-serif text-xl font-semibold text-white mb-2">Your box is empty</h3>
          <p class="text-sm text-zinc-400 font-sans max-w-xs leading-relaxed mb-8">
            Add local specialties or design your own bespoke crust from the global menu to start.
          </p>
          <button 
            id="cart-empty-close-btn"
            class="px-6 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-semibold uppercase tracking-wider text-white hover:border-[#FF3B30] hover:text-[#FF3B30] transition-all duration-300"
          >
            Start Exploring
          </button>
        </div>
      `;
      
      const emptyCloseBtn = document.getElementById('cart-empty-close-btn');
      if (emptyCloseBtn) {
        emptyCloseBtn.addEventListener('click', () => setCartOpen(false));
      }
      return;
    }

    // Render items and form
    container.innerHTML = `
      <div class="flex flex-col h-full justify-between">
        <!-- 1. Cart Items List -->
        <div class="flex-grow overflow-y-auto px-6 py-4 space-y-4">
          <div class="text-[11px] uppercase tracking-widest text-[#FF3B30] font-bold mb-2">Your Selections (${cartCount})</div>
          
          ${cart.map(item => {
            const subtitle = item.isCustom 
              ? `<span class="text-zinc-500">${item.size} &bull; ${item.crust}</span>
                 <div class="text-[11px] text-zinc-400 mt-1 font-sans">
                   + ${item.toppings.length > 0 ? item.toppings.join(', ') : 'No extra toppings'}
                 </div>`
              : `<span class="text-zinc-400">${item.tags ? item.tags.join(' &bull; ') : ''}</span>`;
              
            return `
              <div class="flex gap-4 p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 transition-all duration-200">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover border border-zinc-800" />
                <div class="flex-grow flex flex-col justify-between">
                  <div>
                    <div class="flex justify-between items-start gap-2">
                      <h4 class="font-serif text-sm font-semibold text-white leading-snug">${item.name}</h4>
                      <span class="text-sm font-bold text-white">${formatPrice(item.basePrice * item.quantity)}</span>
                    </div>
                    <div class="text-xs mt-0.5 leading-relaxed font-sans">${subtitle}</div>
                  </div>
                  
                  <!-- Quantity adjuster -->
                  <div class="flex items-center justify-between mt-3">
                    <span class="text-[11px] text-zinc-500 font-sans">${formatPrice(item.basePrice)} each</span>
                    <div class="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
                      <button data-id="${item.id}" data-change="-1" class="qty-btn text-zinc-500 hover:text-white transition-colors duration-150 px-1 text-xs">
                        <i class="fas fa-minus"></i>
                      </button>
                      <span class="text-xs font-bold font-sans text-white min-w-[14px] text-center">${item.quantity}</span>
                      <button data-id="${item.id}" data-change="1" class="qty-btn text-zinc-500 hover:text-[#FF3B30] transition-colors duration-150 px-1 text-xs">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- 2. Cost Summary & Shipping Form -->
        <div class="border-t border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md px-6 py-6 space-y-6">
          <!-- Cost Ticker -->
          <div class="space-y-2 text-xs font-semibold text-zinc-400 font-sans">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="text-white">${formatPrice(subtotalUSD)}</span>
            </div>
            <div class="flex justify-between">
              <span>Hyper-Local Delivery</span>
              <span class="text-white">${deliveryUSD > 0 ? formatPrice(deliveryUSD) : 'Free'}</span>
            </div>
            <div class="flex justify-between pb-2 border-b border-zinc-800">
              <span>Dynamic VAT / Tax (8%)</span>
              <span class="text-white">${formatPrice(taxUSD)}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-white pt-2">
              <span class="font-serif">Total Due</span>
              <span>${formatPrice(totalUSD)}</span>
            </div>
          </div>

          <!-- Checkout Form -->
          <form id="checkout-form" class="space-y-4 text-left">
            <div class="text-[11px] uppercase tracking-widest text-[#FF3B30] font-bold">Delivery Coordinator</div>
            
            <!-- Address Input -->
            <div>
              <label class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Street Address</label>
              <input 
                type="text" 
                id="shipping-address" 
                placeholder="123 Luxury Lane" 
                required
                class="w-full px-4 py-2.5 rounded-lg text-sm bg-zinc-950 border border-zinc-800 text-white focus:border-[#FF3B30]/60 focus:outline-none transition-colors duration-200"
              />
              <span id="address-err" class="text-[11px] text-[#FF3B30] font-sans mt-1 hidden">Please specify delivery address.</span>
            </div>

            <!-- Double Column: Localized Postcode & Phone -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Postal Code</label>
                <input 
                  type="text" 
                  id="shipping-postcode" 
                  placeholder="${location ? location.postalPlaceholder : '10001'}" 
                  required
                  class="w-full px-4 py-2.5 rounded-lg text-sm bg-zinc-950 border border-zinc-800 text-white focus:border-[#FF3B30]/60 focus:outline-none transition-colors duration-200 uppercase"
                />
                <span id="postcode-err" class="text-[10px] text-[#FF3B30] font-sans mt-1 leading-tight hidden">Invalid for ${location ? location.shortName : 'US'}.</span>
              </div>
              <div>
                <label class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Phone Number</label>
                <div class="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                  <span class="px-2.5 text-xs text-zinc-500 border-r border-zinc-800 bg-zinc-900 font-sans">
                    ${location ? location.phonePrefix : '+1'}
                  </span>
                  <input 
                    type="tel" 
                    id="shipping-phone" 
                    placeholder="${location ? location.phonePlaceholder : '555-0100'}" 
                    required
                    class="w-full px-3 py-2.5 text-sm bg-transparent text-white focus:outline-none"
                  />
                </div>
                <span id="phone-err" class="text-[10px] text-[#FF3B30] font-sans mt-1 leading-tight hidden">Invalid phone prefix.</span>
              </div>
            </div>

            <!-- Submit CTA -->
            <button 
              type="submit"
              class="w-full py-4 rounded-xl bg-[#FF3B30] text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-[#E03025] hover:shadow-[0_0_20px_rgba(255,59,48,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Dispatch Delivery</span>
              <i class="fas fa-paper-plane text-xs opacity-80"></i>
            </button>
          </form>
        </div>
      </div>
    `;

    // Listeners for quantity adjusters
    container.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const change = parseInt(btn.getAttribute('data-change'));
        updateQuantity(id, change);
      });
    });

    // Shipping validation & submission
    const form = document.getElementById('checkout-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const addrInput = document.getElementById('shipping-address');
        const pcInput = document.getElementById('shipping-postcode');
        const phoneInput = document.getElementById('shipping-phone');
        
        const addrErr = document.getElementById('address-err');
        const pcErr = document.getElementById('postcode-err');
        const phoneErr = document.getElementById('phone-err');

        let isValid = true;

        // 1. Street Address Validation
        if (!addrInput.value.trim() || addrInput.value.length < 5) {
          addrInput.classList.add('border-red-600');
          addrErr.classList.remove('hidden');
          isValid = false;
        } else {
          addrInput.classList.remove('border-red-600');
          addrErr.classList.add('hidden');
        }

        // 2. Postal Code validation (matching regex defined in selected location profile)
        const activeLoc = location || { postalRegex: '^\\d{5}$' };
        const pcRegex = new RegExp(activeLoc.postalRegex);
        if (!pcRegex.test(pcInput.value.trim())) {
          pcInput.classList.add('border-red-600');
          pcErr.classList.remove('hidden');
          isValid = false;
        } else {
          pcInput.classList.remove('border-red-600');
          pcErr.classList.add('hidden');
        }

        // 3. Phone validation
        if (phoneInput.value.replace(/\D/g, '').length < 6) {
          phoneInput.parentElement.classList.add('border-red-600');
          phoneErr.classList.remove('hidden');
          isValid = false;
        } else {
          phoneInput.parentElement.classList.remove('border-red-600');
          phoneErr.classList.add('hidden');
        }

        if (isValid) {
          const fullAddress = `${addrInput.value.trim()}, ${pcInput.value.trim()} - ${activeLoc.shortName}`;
          const fullPhone = `${activeLoc.phonePrefix} ${phoneInput.value.trim()}`;
          startOrder(fullAddress, fullPhone);
        }
      });
    }
  };

  // Drawer slider animations toggle
  const toggleDrawerState = (drawerStates) => {
    if (drawerStates.cartOpen) {
      drawer.classList.remove('translate-x-full');
      overlay.classList.remove('pointer-events-none', 'opacity-0');
      overlay.classList.add('opacity-100');
    } else {
      drawer.classList.add('translate-x-full');
      overlay.classList.add('pointer-events-none', 'opacity-0');
      overlay.classList.remove('opacity-100');
    }
  };

  // Initial draw
  render();

  // Subscriptions
  subscribe('cartChange', render);
  subscribe('drawerChange', toggleDrawerState);
}
