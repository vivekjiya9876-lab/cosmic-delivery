// GloboCrust Global Menu Module

import { addToCart, formatPrice, subscribe } from './state.js';

export const PIZZAS = [
  {
    id: 'tokyo-umami',
    name: 'The Tokyo Umami',
    basePrice: 24.99,
    tags: ['Signature', 'Umami Fusion'],
    description: 'Thin bamboo-charcoal crust, shoyu-glazed wagyu brisket, sautéed shiitake mushrooms, shredded nori, and white truffle kewpie drizzle.',
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&q=80&w=600',
    spiceLevel: 1,
    isVegan: false
  },
  {
    id: 'neapolitan-classic',
    name: 'The Neapolitan Classic',
    basePrice: 18.99,
    tags: ['DOP Classic', 'Vegetarian'],
    description: 'Blistered San Marzano tomatoes, hand-torn DOP buffalo mozzarella, wild organic basil, and cold-pressed extra virgin olive oil.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=600',
    spiceLevel: 0,
    isVegan: false
  },
  {
    id: 'nyc-fold',
    name: 'The NYC Fold',
    basePrice: 19.99,
    tags: ['Foldable', 'Local Legend'],
    description: 'Wide, thin, hand-tossed 48-hour sourdough, dry-aged spicy pepperoni blend, low-moisture mozzarella, and organic hot honey drizzle.',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=600',
    spiceLevel: 2,
    isVegan: false
  },
  {
    id: 'crimson-truffle',
    name: 'The Crimson Truffle',
    basePrice: 26.99,
    tags: ['Luxury Chef Special', 'Spicy'],
    description: 'House recipe dough, crimson spicy \'nduja salami cream, fresh burrata pulp, gold leaf sprinkles, and shaved winter black truffles.',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&q=80&w=600',
    spiceLevel: 3,
    isVegan: false
  },
  {
    id: 'kyoto-garden',
    name: 'The Kyoto Garden',
    basePrice: 21.99,
    tags: ['Vegan', 'Gluten Free'],
    description: 'Crisp purple sweet potato base, house-made cashew mozzarella, heirloom cherry tomatoes, lotus root chips, and fresh micro-greens.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600',
    spiceLevel: 0,
    isVegan: true
  }
];

export function initMenu(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Render function
  const render = () => {
    container.innerHTML = PIZZAS.map(pizza => {
      // Tags formatting
      const tagBadges = pizza.tags.map(tag => {
        let colorClasses = 'border-white/20 text-white/80 bg-white/5';
        if (tag.includes('Signature') || tag.includes('Luxury')) {
          colorClasses = 'border-[#FF3B30]/30 text-[#FF3B30] bg-[#FF3B30]/10';
        } else if (tag.includes('Vegan')) {
          colorClasses = 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10';
        } else if (tag.includes('Classic')) {
          colorClasses = 'border-amber-500/30 text-amber-400 bg-amber-500/10';
        }
        return `<span class="px-2 py-0.5 text-xs font-medium uppercase tracking-widest border rounded-full ${colorClasses}">${tag}</span>`;
      }).join('');

      // Chili indicators for spice levels
      const spiceIndicator = pizza.spiceLevel > 0 
        ? `<div class="flex items-center gap-0.5 text-xs text-red-500">
            ${Array(pizza.spiceLevel).fill('<i class="fas fa-fire"></i>').join('')}
           </div>`
        : '';

      return `
        <div class="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 transition-all duration-300 hover:scale-[1.02] hover:border-[#FF3B30]/30 hover:shadow-[0_12px_30px_rgba(255,59,48,0.08)]">
          <!-- Pizza Image -->
          <div class="relative aspect-[4/3] overflow-hidden">
            <img 
              src="${pizza.image}" 
              alt="${pizza.name}" 
              class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
            
            <!-- Floating indicators -->
            <div class="absolute top-4 left-4 flex flex-wrap gap-1.5">
              ${tagBadges}
            </div>
            
            ${pizza.spiceLevel > 0 ? `
              <div class="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md px-2 py-1 rounded-lg border border-zinc-800">
                ${spiceIndicator}
              </div>
            ` : ''}
          </div>

          <!-- Card Content -->
          <div class="p-6 flex flex-col flex-grow justify-between">
            <div>
              <div class="flex items-baseline justify-between gap-2 mb-2">
                <h3 class="font-serif text-xl font-bold tracking-tight text-white group-hover:text-[#FF3B30] transition-colors duration-200">
                  ${pizza.name}
                </h3>
                <span class="text-lg font-bold font-sans text-white">
                  ${formatPrice(pizza.basePrice)}
                </span>
              </div>
              <p class="text-sm text-zinc-400 font-sans leading-relaxed mb-6">
                ${pizza.description}
              </p>
            </div>

            <!-- Footer / CTA -->
            <div>
              <button 
                data-id="${pizza.id}" 
                class="add-to-box-btn w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:border-[#FF3B30] hover:bg-[#FF3B30] hover:shadow-[0_0_15px_rgba(255,59,48,0.4)] active:scale-[0.98]"
              >
                <span>Add to Box</span>
                <i class="fas fa-plus text-xs opacity-75"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach listeners
    container.querySelectorAll('.add-to-box-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pizzaId = btn.getAttribute('data-id');
        const pizza = PIZZAS.find(p => p.id === pizzaId);
        if (pizza) {
          // Play micro animation on the button
          const originalHTML = btn.innerHTML;
          btn.innerHTML = `<span>Added!</span> <i class="fas fa-check"></i>`;
          btn.classList.add('bg-emerald-600', 'border-emerald-600');
          btn.classList.remove('hover:bg-[#FF3B30]', 'hover:border-[#FF3B30]');
          
          // Trigger add to cart
          addToCart({
            id: pizza.id,
            name: pizza.name,
            basePrice: pizza.basePrice,
            quantity: 1,
            image: pizza.image,
            tags: pizza.tags,
            isCustom: false
          });

          // Revert state
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('bg-emerald-600', 'border-emerald-600');
            btn.classList.add('hover:bg-[#FF3B30]', 'hover:border-[#FF3B30]');
          }, 1000);
        }
      });
    });
  };

  // Run initial render
  render();

  // Re-render when localization or other relevant details change
  subscribe('locationChange', render);
}
