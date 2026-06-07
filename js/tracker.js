// GloboCrust Order Tracker Drawer Module

import { getState, advanceTrackerStep, setTrackerOpen, subscribe, resetState } from './state.js';

let intervalId = null;
let secondsRemaining = 10;
let progressIntervalId = null;

const STEPS = [
  {
    title: 'Order Baked',
    desc: 'Artisanal crust blistered to perfection in our volcanic basalt brick hearth.',
    icon: 'fa-fire-burner'
  },
  {
    title: 'Dispatched',
    desc: 'Thermal case sealed and secured. Handed off to our courier team.',
    icon: 'fa-box-open'
  },
  {
    title: 'Courier Flight',
    desc: 'En route via supersonic drone / carbon-neutral electric aircraft.',
    icon: 'fa-plane-departure'
  },
  {
    title: 'Arrived at Doorstep',
    desc: 'Hand-delivered to your concierge or doorstep. Buon Appetito!',
    icon: 'fa-house-chimney-user'
  }
];

export function initTracker(drawerId, overlayId, containerId) {
  const drawer = document.getElementById(drawerId);
  const overlay = document.getElementById(overlayId);
  const container = document.getElementById(containerId);

  if (!drawer || !overlay || !container) return;

  const render = () => {
    const { orderActive, trackerStep, orderAddress, orderETA, location } = getState();

    if (!orderActive) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 px-6 text-center h-full">
          <div class="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-6">
            <i class="fas fa-radar text-3xl"></i>
          </div>
          <h3 class="font-serif text-xl font-semibold text-white mb-2">No Active Deliveries</h3>
          <p class="text-sm text-zinc-400 font-sans max-w-xs leading-relaxed">
            Place an order from the cart to track your courier flight in real-time.
          </p>
        </div>
      `;
      return;
    }

    const currentStep = STEPS[trackerStep];
    const isCompleted = trackerStep === 3;

    // Build Stepper nodes HTML
    const stepsHTML = STEPS.map((step, idx) => {
      const isDone = idx < trackerStep;
      const isCurrent = idx === trackerStep;
      
      // Styling rules for different stages
      let nodeStyle = 'border-zinc-800 bg-zinc-950 text-zinc-600';
      let lineStyle = 'bg-zinc-800';
      let labelStyle = 'text-zinc-500';
      let descStyle = 'text-zinc-500';

      if (isDone) {
        nodeStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
        lineStyle = 'bg-emerald-500';
        labelStyle = 'text-white font-semibold';
        descStyle = 'text-zinc-400';
      } else if (isCurrent) {
        nodeStyle = 'border-[#FF3B30] bg-[#FF3B30]/10 text-[#FF3B30] animate-pulse-dot';
        lineStyle = 'bg-zinc-800';
        labelStyle = 'text-[#FF3B30] font-bold';
        descStyle = 'text-zinc-300';
      }

      const isLast = idx === STEPS.length - 1;

      return `
        <div class="flex gap-4 relative">
          <!-- Connector Line -->
          ${!isLast ? `<div class="absolute left-6 top-12 bottom-0 w-0.5 ${lineStyle} transition-colors duration-500 z-0"></div>` : ''}
          
          <!-- Step Circle -->
          <div class="w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 font-sans text-sm transition-all duration-500 shrink-0 ${nodeStyle}">
            ${isDone ? '<i class="fas fa-check"></i>' : `<i class="fas ${step.icon}"></i>`}
          </div>

          <!-- Step content -->
          <div class="pb-8 flex-grow">
            <h4 class="text-sm font-sans tracking-wide uppercase ${labelStyle}">${step.title}</h4>
            <p class="text-xs font-sans leading-relaxed mt-1 ${descStyle}">${step.desc}</p>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="flex flex-col h-full justify-between">
        <!-- Scrollable content -->
        <div class="flex-grow overflow-y-auto px-6 py-6 space-y-6">
          
          <!-- Order ID Header -->
          <div class="flex justify-between items-center bg-zinc-950/80 p-4 rounded-xl border border-zinc-900">
            <div>
              <div class="text-[10px] uppercase tracking-widest text-[#FF3B30] font-bold">Order Tracking</div>
              <div class="text-sm font-serif font-bold text-white mt-0.5">ID: #GC-${Math.floor(100000 + Math.random() * 900000)}</div>
            </div>
            <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 rounded-md text-white">
              ${isCompleted ? 'Delivered' : 'In Transit'}
            </span>
          </div>

          <!-- Flight Info Block -->
          <div class="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 flex items-center gap-4 relative overflow-hidden">
            <!-- Supersonic wave visual -->
            <div class="absolute -right-10 -bottom-10 w-28 h-28 rounded-full bg-[#FF3B30]/5 blur-2xl"></div>

            <div class="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#FF3B30] text-xl shrink-0 animate-float">
              <i class="fas ${isCompleted ? 'fa-bowl-food' : 'fa-plane'}"></i>
            </div>
            <div>
              <div class="text-[10px] uppercase tracking-wider text-zinc-400">Estimated Delivery Time</div>
              <div class="text-xl font-serif font-bold text-white mt-0.5">
                ${isCompleted ? 'Arrived!' : `${orderETA} mins`}
              </div>
              <div class="text-xs text-zinc-500 font-sans mt-0.5">
                Destination: ${orderAddress.split(' - ')[0]}
              </div>
            </div>
          </div>

          <!-- Stepper timeline -->
          <div class="py-4">
            ${stepsHTML}
          </div>
        </div>

        <!-- Simulation Progress / Footer -->
        <div class="border-t border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md px-6 py-6 space-y-4">
          ${!isCompleted ? `
            <div class="space-y-2">
              <div class="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500 font-sans">
                <span>Simulating Courier Telemetry</span>
                <span id="tracker-countdown-text">Update in ${secondsRemaining}s</span>
              </div>
              <!-- Progress Bar -->
              <div class="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                <div id="tracker-progress-bar" class="h-full bg-[#FF3B30] transition-all duration-200" style="width: 0%;"></div>
              </div>
            </div>
          ` : `
            <div class="space-y-4 text-center">
              <p class="text-xs text-zinc-400 font-sans leading-relaxed">
                Thank you for ordering with GloboCrust! Your luxury kitchen is standing by for your next global craving.
              </p>
              <button 
                id="reset-order-btn"
                class="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Order Another Crust</span>
                <i class="fas fa-rotate-right text-xs"></i>
              </button>
            </div>
          `}
        </div>
      </div>
    `;

    // Add reset button listener
    const resetBtn = document.getElementById('reset-order-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetState();
        setTrackerOpen(false);
      });
    }
  };

  // Toggle slider styles
  const toggleDrawerState = (drawerStates) => {
    if (drawerStates.trackerOpen) {
      drawer.classList.remove('translate-x-full');
      overlay.classList.remove('pointer-events-none', 'opacity-0');
      overlay.classList.add('opacity-100');
    } else {
      drawer.classList.add('translate-x-full');
      // If cart is also closed, then fade overlay
      if (!drawerStates.cartOpen) {
        overlay.classList.add('pointer-events-none', 'opacity-0');
        overlay.classList.remove('opacity-100');
      }
    }
  };

  // Set up the telemetry simulation countdown
  const startSimulation = () => {
    stopSimulation(); // Clear previous runs
    
    secondsRemaining = 10;
    
    // Smooth progress bar update (every 200ms)
    let elapsedMs = 0;
    progressIntervalId = setInterval(() => {
      const { orderActive, trackerStep } = getState();
      if (!orderActive || trackerStep === 3) {
        clearInterval(progressIntervalId);
        return;
      }
      
      elapsedMs += 200;
      const pct = Math.min((elapsedMs / 10000) * 100, 100);
      const bar = document.getElementById('tracker-progress-bar');
      if (bar) {
        bar.style.width = `${pct}%`;
      }
      
      // Update seconds reading
      const countdownText = document.getElementById('tracker-countdown-text');
      if (countdownText) {
        const remaining = Math.max(10 - Math.floor(elapsedMs / 1000), 0);
        countdownText.textContent = `Update in ${remaining}s`;
      }
    }, 200);

    // Trigger step advance every 10s
    intervalId = setInterval(() => {
      const { trackerStep } = getState();
      if (trackerStep < 3) {
        advanceTrackerStep();
        // Reset countdown timers
        secondsRemaining = 10;
        elapsedMs = 0;
      } else {
        stopSimulation();
      }
    }, 10000);
  };

  const stopSimulation = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (progressIntervalId) {
      clearInterval(progressIntervalId);
      progressIntervalId = null;
    }
  };

  // Listen to order submission to spin up timer
  subscribe('orderStarted', () => {
    startSimulation();
    render();
  });

  // Re-draw when step changes
  subscribe('trackerChange', () => {
    // Reset secondary progress bars but keep interval going
    startSimulation();
    render();
  });

  subscribe('trackerComplete', () => {
    stopSimulation();
    render();
  });

  // Drawer trigger subscriptions
  subscribe('drawerChange', toggleDrawerState);
  subscribe('stateChange', render);

  // Initial draw
  render();
}
