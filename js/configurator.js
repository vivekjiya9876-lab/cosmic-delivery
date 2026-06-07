// GloboCrust Build-Your-Own-Crust Configurator Module

import { addToCart, formatPrice, getState, subscribe, toggleCustomTopping, updateCustomCrust, updateCustomSize, resetCustomPizza } from './state.js';

// Configuration details
export const OPTIONS = {
  sizes: [
    { name: 'Personal 10"', basePrice: 14.99 },
    { name: 'Medium 12"', basePrice: 17.99 },
    { name: 'Large 14"', basePrice: 19.99 }
  ],
  crusts: [
    { name: 'Classic Neapolitan', price: 0.00, color: '#d88e40', border: '#b86d25', desc: 'Light, airy, with authentic leopard spots' },
    { name: 'Activated Charcoal Crust', price: 2.00, color: '#2b2b2b', border: '#171717', desc: 'Striking dark luxury crust infused with health-benefits' },
    { name: 'Gluten-Free Sweet Potato', price: 2.50, color: '#e8aa55', border: '#cc8833', desc: 'Reddish golden, slightly sweet, completely wheat-free' },
    { name: 'Decadent Cheese Stuffed', price: 3.50, color: '#f3c466', border: '#dfa637', desc: 'Thick hand-rolled edges filled with rich Mozzarella' }
  ],
  toppings: [
    { id: 'pepperoni', name: 'Dry-Aged Pepperoni', price: 2.50, category: 'proteins', color: '#c4281a', shape: 'circle' },
    { id: 'wagyu', name: 'Shoyu Wagyu Brisket', price: 3.50, category: 'proteins', color: '#663322', shape: 'strip' },
    { id: 'nduja', name: 'Spicy \'Nduja Salami', price: 2.50, category: 'proteins', color: '#a81c0c', shape: 'blob' },
    { id: 'mozzarella', name: 'DOP Buffalo Mozzarella', price: 2.00, category: 'cheeses', color: '#faf9f5', shape: 'blob' },
    { id: 'burrata', name: 'Creamy Burrata Pulp', price: 2.50, category: 'cheeses', color: '#fffff0', shape: 'cloud' },
    { id: 'pecorino', name: 'Shaved Pecorino Romano', price: 2.00, category: 'cheeses', color: '#ece8d8', shape: 'shave' },
    { id: 'mushrooms', name: 'Wild Porcini Mushrooms', price: 1.50, category: 'veggies', color: '#a08365', shape: 'mushroom' },
    { id: 'onions', name: 'Caramelized Balsamic Onion', price: 1.50, category: 'veggies', color: '#7a3e65', shape: 'onion' },
    { id: 'basil', name: 'Fresh Micro-Basil', price: 1.00, category: 'finishes', color: '#38b000', shape: 'leaf' },
    { id: 'gold', name: 'Edible Gold Leaf', price: 3.00, category: 'finishes', color: '#ffd700', shape: 'star' },
    { id: 'truffle', name: 'Winter Black Truffle Oil', price: 2.50, category: 'finishes', color: '#4a3b32', shape: 'drizzle' }
  ]
};

// Generates stable random coordinates for drawing toppings visually
const TOPPING_COORDINATES = {};
function getToppingPositions(toppingId) {
  if (TOPPING_COORDINATES[toppingId]) return TOPPING_COORDINATES[toppingId];
  
  // Create 10 positions in rings of radius (inner, mid, outer)
  const coords = [];
  const rings = [
    { r: 40, count: 2 },
    { r: 80, count: 4 },
    { r: 120, count: 5 }
  ];

  rings.forEach(ring => {
    for (let i = 0; i < ring.count; i++) {
      const angle = (i / ring.count) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const randomOffset = Math.random() * 10 - 5;
      const x = (ring.r + randomOffset) * Math.cos(angle);
      const y = (ring.r + randomOffset) * Math.sin(angle);
      const rot = Math.random() * 360;
      coords.push({ x, y, rot });
    }
  });

  TOPPING_COORDINATES[toppingId] = coords;
  return coords;
}

export function initConfigurator(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const render = () => {
    const { customPizza } = getState();
    
    // Calculate totals
    const currentCrustObj = OPTIONS.crusts.find(c => c.name === customPizza.crust) || OPTIONS.crusts[0];
    const totalUSD = customPizza.basePrice + currentCrustObj.price + customPizza.toppings.reduce((sum, topName) => {
      const topObj = OPTIONS.toppings.find(t => t.name === topName);
      return sum + (topObj ? topObj.price : 0);
    }, 0);

    // Render HTML layout
    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <!-- Visual Interactive Pizza Board (Left 5 cols) -->
        <div class="lg:col-span-6 flex flex-col items-center justify-center bg-zinc-900/40 rounded-3xl border border-zinc-800/80 p-8 min-h-[380px] lg:min-h-[500px]">
          <div class="relative w-full max-w-[340px] md:max-w-[400px] aspect-square flex items-center justify-center">
            
            <!-- Dark Slate Stone Serving Board -->
            <div class="absolute inset-0 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 shadow-[0_15px_35px_rgba(0,0,0,0.7)] border border-neutral-700 flex items-center justify-center">
              <!-- Slate wood rings -->
              <div class="w-[96%] h-[96%] rounded-full border border-neutral-800/40 opacity-70"></div>
              <div class="absolute w-[80%] h-[80%] rounded-full border border-neutral-800/20 opacity-40"></div>
            </div>

            <!-- Interactive SVG Pizza Drawing -->
            <svg id="pizza-svg" viewBox="-200 -200 400 400" class="absolute w-[86%] h-[86%] select-none z-10">
              <!-- Definitions for Gradients -->
              <defs>
                <!-- Sauce gradient -->
                <radialGradient id="sauceGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                  <stop offset="0%" stop-color="#b12117" />
                  <stop offset="70%" stop-color="#8c120a" />
                  <stop offset="100%" stop-color="#6e0500" />
                </radialGradient>
                <!-- Cheese gradient -->
                <radialGradient id="cheeseGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#fff8db" />
                  <stop offset="90%" stop-color="#ffecad" />
                  <stop offset="100%" stop-color="#eed48c" />
                </radialGradient>
                <!-- Herb drop shadow -->
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="1" dy="2" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.4"/>
                </filter>
              </defs>

              <!-- Pizza Crust Circle (changes color based on selection) -->
              <circle cx="0" cy="0" r="170" fill="${currentCrustObj.color}" stroke="${currentCrustObj.border}" stroke-width="14" class="transition-all duration-500 shadow-xl" />
              
              <!-- Blistered Leopard Spots (if classic crust) -->
              ${customPizza.crust === 'Classic Neapolitan' ? `
                <circle cx="-135" cy="-80" r="6" fill="#3c2111" opacity="0.6"/>
                <circle cx="150" cy="20" r="7" fill="#3c2111" opacity="0.75"/>
                <circle cx="20" cy="155" r="5" fill="#3c2111" opacity="0.65"/>
                <circle cx="-70" cy="140" r="8" fill="#3c2111" opacity="0.8"/>
                <circle cx="110" cy="-110" r="5" fill="#3c2111" opacity="0.7"/>
                <circle cx="-30" cy="-150" r="6" fill="#3c2111" opacity="0.75"/>
              ` : ''}

              <!-- Stuffed crust cheese line -->
              ${customPizza.crust === 'Decadent Cheese Stuffed' ? `
                <circle cx="0" cy="0" r="162" fill="none" stroke="#fff8cf" stroke-width="4" stroke-dasharray="10 6" opacity="0.85" />
              ` : ''}

              <!-- Rich Tomato Sauce Layer -->
              <circle cx="0" cy="0" r="150" fill="url(#sauceGrad)" />

              <!-- Creamy Mozzarella cheese patches -->
              <g id="cheese-layer" fill="url(#cheeseGrad)" filter="url(#shadow)">
                <circle cx="-60" cy="-40" r="28" />
                <circle cx="50" cy="-60" r="32" />
                <circle cx="-40" cy="60" r="30" />
                <circle cx="60" cy="40" r="28" />
                <circle cx="-10" cy="-90" r="24" />
                <circle cx="80" cy="-10" r="25" />
                <circle cx="-90" cy="10" r="26" />
                <circle cx="10" cy="90" r="28" />
                <circle cx="0" cy="0" r="38" />
                <!-- Extra small melt blobs -->
                <circle cx="-90" cy="-80" r="10" />
                <circle cx="90" cy="90" r="12" />
                <circle cx="120" cy="-50" r="8" />
                <circle cx="-110" cy="70" r="9" />
              </g>

              <!-- Dynamic Toppings Layer -->
              <g id="toppings-container">
                ${customPizza.toppings.map(toppingName => {
                  const topObj = OPTIONS.toppings.find(t => t.name === toppingName);
                  if (!topObj) return '';
                  
                  const positions = getToppingPositions(topObj.id);
                  
                  return positions.map((pos, idx) => {
                    let svgElem = '';
                    
                    // Render specific visual shapes for premium ingredients
                    switch(topObj.shape) {
                      case 'circle': // Pepperoni
                        svgElem = `<circle cx="0" cy="0" r="14" fill="${topObj.color}" stroke="#93130c" stroke-width="1.5"/>
                                   <circle cx="3" cy="-3" r="10" fill="none" stroke="#680b06" stroke-width="1" opacity="0.5"/>`;
                        break;
                      case 'strip': // Wagyu
                        svgElem = `<rect x="-18" y="-5" width="36" height="10" rx="3" fill="${topObj.color}"/>
                                   <path d="M-10 -3 Q -2 -1 8 -3" stroke="#aa7766" stroke-width="1.5" fill="none"/>`;
                        break;
                      case 'blob': // Mozzarella / Nduja
                        svgElem = `<path d="M -12,-8 Q 0,-15 10,-7 Q 15,5 2,12 Q -12,10 -12,-8 Z" fill="${topObj.color}" filter="url(#shadow)"/>`;
                        break;
                      case 'cloud': // Burrata
                        svgElem = `<path d="M-15,0 C-15,-10 -5,-15 5,-12 C10,-15 20,-10 18,0 C22,5 15,15 5,12 C-5,15 -18,10 -15,0 Z" fill="${topObj.color}" filter="url(#shadow)" opacity="0.95"/>`;
                        break;
                      case 'shave': // Pecorino
                        svgElem = `<polygon points="-16,-4 16,-6 10,6 -12,4" fill="${topObj.color}" opacity="0.9"/>`;
                        break;
                      case 'mushroom': // Porcini
                        svgElem = `
                          <!-- Cap -->
                          <path d="M-12,0 C-12,-12 12,-12 12,0 Z" fill="${topObj.color}"/>
                          <!-- Stem -->
                          <rect x="-4" y="0" width="8" height="10" rx="2" fill="#d8cbb8"/>
                        `;
                        break;
                      case 'onion': // Caramelized onion
                        svgElem = `<path d="M-14,0 C-14,-10 14,-10 14,0 C10,12 -10,12 -14,0" fill="none" stroke="${topObj.color}" stroke-width="3" opacity="0.8"/>`;
                        break;
                      case 'leaf': // Basil
                        svgElem = `
                          <path d="M0,0 Q -10,-12 0,-22 Q 10,-12 0,0 Z" fill="${topObj.color}" filter="url(#shadow)"/>
                          <path d="M0,0 Q -4,-8 0,-18 Q 4,-8 0,0 Z" fill="#2b8a00"/>
                        `;
                        break;
                      case 'star': // Gold Leaf
                        svgElem = `<polygon points="0,-12 3,-3 12,-3 5,2 8,11 0,5 -8,11 -5,2 -12,-3 -3,-3" fill="${topObj.color}" filter="url(#shadow)"/>`;
                        break;
                      case 'drizzle': // Truffle oil
                        svgElem = `<path d="M-15,-15 Q -5,12 15,10" fill="none" stroke="${topObj.color}" stroke-width="2.5" opacity="0.6"/>`;
                        break;
                    }
                    
                    return `
                      <g 
                        transform="translate(${pos.x}, ${pos.y}) rotate(${pos.rot})" 
                        class="topping-item"
                        style="animation-delay: ${idx * 0.03}s; --tw-translate-x: ${pos.x}px;"
                      >
                        ${svgElem}
                      </g>
                    `;
                  }).join('');
                }).join('')}
              </g>
            </svg>
          </div>
          
          <!-- Summary specs below preview -->
          <div class="mt-6 text-center">
            <h4 class="font-serif text-lg font-bold text-white mb-1">
              Your Custom Masterpiece
            </h4>
            <p class="text-xs text-zinc-400 font-sans tracking-wide">
              ${customPizza.size} &bull; ${customPizza.crust} &bull; ${customPizza.toppings.length} Gourmet Toppings
            </p>
          </div>
        </div>

        <!-- Controls (Right 6 cols) -->
        <div class="lg:col-span-6 flex flex-col justify-between">
          <div class="space-y-6">
            <!-- 1. Size Selection -->
            <div>
              <label class="text-xs uppercase tracking-widest text-[#FF3B30] font-bold block mb-3">1. Select Dimensions</label>
              <div class="grid grid-cols-3 gap-3">
                ${OPTIONS.sizes.map(size => {
                  const isActive = customPizza.size === size.name;
                  return `
                    <button 
                      data-size="${size.name}"
                      class="size-select-btn py-3 px-2 rounded-xl text-center border font-sans text-sm font-semibold transition-all duration-300 ${
                        isActive 
                          ? 'border-[#FF3B30] bg-[#FF3B30]/10 text-white' 
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }"
                    >
                      <div class="text-white">${size.name.split(' ')[0]}</div>
                      <div class="text-xs opacity-60 mt-0.5">${size.name.split(' ')[1]}</div>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- 2. Crust selection -->
            <div>
              <label class="text-xs uppercase tracking-widest text-[#FF3B30] font-bold block mb-3">2. Choose Artisanal Crust</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${OPTIONS.crusts.map(crust => {
                  const isActive = customPizza.crust === crust.name;
                  const displayCrustPrice = crust.price > 0 ? `+${formatPrice(crust.price)}` : 'Included';
                  return `
                    <button 
                      data-crust="${crust.name}"
                      class="crust-select-btn text-left p-4 rounded-xl border font-sans transition-all duration-300 flex flex-col justify-between min-h-[90px] ${
                        isActive 
                          ? 'border-[#FF3B30] bg-[#FF3B30]/10 text-white' 
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }"
                    >
                      <div class="flex justify-between items-baseline w-full">
                        <span class="font-bold text-sm text-white">${crust.name.replace(' Crust', '')}</span>
                        <span class="text-xs font-semibold ${isActive ? 'text-[#FF3B30]' : 'text-zinc-500'}">${displayCrustPrice}</span>
                      </div>
                      <p class="text-[11px] text-zinc-400 leading-tight mt-1">
                        ${crust.desc}
                      </p>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- 3. Toppings Categories -->
            <div>
              <label class="text-xs uppercase tracking-widest text-[#FF3B30] font-bold block mb-3">3. Pile Premium Toppings</label>
              
              <!-- Tab Headers -->
              <div class="flex border-b border-zinc-800 mb-4 text-xs font-semibold uppercase tracking-wider">
                <button data-cat="proteins" class="cat-tab-btn py-2 px-3 text-[#FF3B30] border-b-2 border-[#FF3B30] focus:outline-none">Proteins</button>
                <button data-cat="cheeses" class="cat-tab-btn py-2 px-3 text-zinc-500 hover:text-white focus:outline-none">Cheeses</button>
                <button data-cat="veggies" class="cat-tab-btn py-2 px-3 text-zinc-500 hover:text-white focus:outline-none">Veggies</button>
                <button data-cat="finishes" class="cat-tab-btn py-2 px-3 text-zinc-500 hover:text-white focus:outline-none">Finishes</button>
              </div>

              <!-- Categories Wrapper -->
              <div id="toppings-options-grid" class="grid grid-cols-2 gap-3 min-h-[140px]">
                <!-- Loaded dynamically by current category tab -->
              </div>
            </div>
          </div>

          <!-- Bottom Action Deck -->
          <div class="mt-8 pt-6 border-t border-zinc-800/80 flex items-center justify-between gap-4">
            <div>
              <div class="text-[11px] uppercase tracking-wider text-zinc-400">Total Price</div>
              <div class="text-3xl font-bold font-sans text-white mt-0.5" id="configurator-price-display">
                ${formatPrice(totalUSD)}
              </div>
            </div>
            <button 
              id="add-custom-to-box-btn"
              class="flex-grow md:flex-grow-0 py-4 px-8 rounded-xl bg-[#FF3B30] text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-[#E03025] hover:shadow-[0_0_20px_rgba(255,59,48,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Add Custom to Box</span>
              <i class="fas fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    // Active tab tracking state (local to render instance)
    let activeCat = container.dataset.activeCategory || 'proteins';

    // Toppings grid loading utility
    const loadToppingsGrid = (category) => {
      activeCat = category;
      container.dataset.activeCategory = category;
      
      const grid = document.getElementById('toppings-options-grid');
      if (!grid) return;

      const filtered = OPTIONS.toppings.filter(t => t.category === category);
      grid.innerHTML = filtered.map(top => {
        const isSelected = customPizza.toppings.includes(top.name);
        return `
          <button 
            data-topping-name="${top.name}"
            class="topping-select-btn flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left ${
              isSelected 
                ? 'border-[#FF3B30]/60 bg-[#FF3B30]/5 text-white' 
                : 'border-zinc-800/60 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-white'
            }"
          >
            <div class="flex items-center gap-2.5">
              <!-- Visual Indicator -->
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${top.color};"></span>
              <span class="text-xs font-semibold text-white leading-tight">${top.name}</span>
            </div>
            <span class="text-[11px] font-semibold ${isSelected ? 'text-[#FF3B30]' : 'text-zinc-500'}">
              +${formatPrice(top.price)}
            </span>
          </button>
        `;
      }).join('');

      // Add listeners to new buttons
      grid.querySelectorAll('.topping-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const topName = btn.getAttribute('data-topping-name');
          toggleCustomTopping(topName);
        });
      });
    };

    // Load initial toppings category
    loadToppingsGrid(activeCat);

    // Event listener mapping
    // Tabs switching
    container.querySelectorAll('.cat-tab-btn').forEach(tabBtn => {
      const cat = tabBtn.getAttribute('data-cat');
      // Highlight correct tab header on loading activeCat
      if (cat === activeCat) {
        tabBtn.className = 'cat-tab-btn py-2 px-3 text-[#FF3B30] border-b-2 border-[#FF3B30] focus:outline-none';
      } else {
        tabBtn.className = 'cat-tab-btn py-2 px-3 text-zinc-500 hover:text-white focus:outline-none';
      }

      tabBtn.addEventListener('click', () => {
        container.querySelectorAll('.cat-tab-btn').forEach(b => {
          b.className = 'cat-tab-btn py-2 px-3 text-zinc-500 hover:text-white focus:outline-none';
        });
        tabBtn.className = 'cat-tab-btn py-2 px-3 text-[#FF3B30] border-b-2 border-[#FF3B30] focus:outline-none';
        loadToppingsGrid(cat);
      });
    });

    // Size select
    container.querySelectorAll('.size-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        updateCustomSize(btn.getAttribute('data-size'));
      });
    });

    // Crust select
    container.querySelectorAll('.crust-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        updateCustomCrust(btn.getAttribute('data-crust'));
      });
    });

    // Add to cart main CTA
    const mainBtn = document.getElementById('add-custom-to-box-btn');
    if (mainBtn) {
      mainBtn.addEventListener('click', () => {
        // Trigger state addition
        addToCart({
          id: `custom-crust-pizza`,
          name: `Custom ${customPizza.size.split(' ')[0]} Pizza`,
          basePrice: totalUSD, // cart handles conversion logic
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600',
          tags: ['Custom Build', customPizza.crust.replace(' Crust', '')],
          isCustom: true,
          toppings: [...customPizza.toppings],
          crust: customPizza.crust,
          size: customPizza.size
        });

        // Flash confirmation
        const originalHTML = mainBtn.innerHTML;
        mainBtn.innerHTML = `<span>Added Custom Box!</span> <i class="fas fa-check"></i>`;
        mainBtn.className = "flex-grow md:flex-grow-0 py-4 px-8 rounded-xl bg-emerald-600 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2";
        
        // Reset custom selections
        setTimeout(() => {
          resetCustomPizza();
        }, 600);
      });
    }
  };

  // Build initial UI
  render();

  // Listen to changes
  subscribe('customPizzaChange', render);
  subscribe('locationChange', render);
}
