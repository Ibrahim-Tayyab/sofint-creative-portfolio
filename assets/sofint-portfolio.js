/**
 * SOFINT DIGITAL AGENCY - CREATIVE PORTFOLIO JAVASCRIPT
 * Clean, Peaceful, Marketplace & Freelancer.com Policy-Compliant Showcase
 */

(function () {
  'use strict';

  // Config: Direct studio contact (kept discreet for marketplace policy compliance)
  const SOFINT_WHATSAPP_NUMBER = '923218944510';
  const SOFINT_EMAIL = 'contact@sofintsolutions.tech';

  let galleryItems = [];
  let currentIndex = 0;
  let shortlist = JSON.parse(localStorage.getItem('sofint_portfolio_shortlist') || '[]');

  // Lightbox DOM references
  const lightbox = document.getElementById('sofint-lightbox');
  const lightboxImg = document.getElementById('lightbox-main-img');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxOpenOriginal = document.getElementById('lightbox-open-original');
  const searchInput = document.getElementById('gallery-search');

  /* ==========================================================================
     INITIALIZATION & DYNAMIC ENHANCEMENTS
     ========================================================================== */
  function initGallery() {
    const cards = document.querySelectorAll('.gallery-card');
    galleryItems = [];

    cards.forEach((card, idx) => {
      const full = card.getAttribute('data-full');
      const title = card.getAttribute('data-title') || ('Design Concept #' + (idx + 1));
      const id = 'design-' + (idx + 1);
      
      card.setAttribute('data-id', id);

      galleryItems.push({
        id: id,
        element: card,
        src: full,
        title: title,
        index: idx
      });

      // Enhance Card with Heart (Shortlist) Button
      enhanceCardWithHeart(card, id, title, full);

      // Enhance Card Info with Inquire action
      enhanceCardInfo(card, id, title, full);

      // Click to open lightbox
      card.addEventListener('click', function(e) {
        if (e.target.closest('.card-heart-btn') || e.target.closest('.card-quick-inquire-btn') || e.target.closest('.card-btn-inquire')) {
          return;
        }
        e.preventDefault();
        openLightbox(idx);
      });
    });

    // Inject Grid Layout Switcher (Spacious vs Compact)
    setupLayoutSwitcher();

    // Inject Conversion Elements (Shortlist Drawer & Clean Inquiry Modal)
    // NOTE: Floating WhatsApp button is omitted to ensure 100% compliance with Freelancer.com & Upwork policies
    setupShortlistDrawer();
    setupInquiryModal();
    setupLightboxActions();
    setupEstimator();

    updateShortlistUI();
  }

  /* ==========================================================================
     GLOBAL HELPER: DIRECT INQUIRY
     ========================================================================== */
  window.openDirectInquiry = function(contextTitle) {
    openInquiryModal(contextTitle || 'Custom Creative Project', 'assets/sofint-logo.png');
  };

  /* ==========================================================================
     CARD ENHANCEMENTS
     ========================================================================== */
  function enhanceCardWithHeart(card, id, title, src) {
    const thumbWrap = card.querySelector('.gallery-card-thumb-wrap');
    if (!thumbWrap || thumbWrap.querySelector('.card-heart-btn')) return;

    const heartBtn = document.createElement('button');
    heartBtn.className = 'card-heart-btn' + (isShortlisted(id) ? ' shortlisted' : '');
    heartBtn.title = 'Add to Shortlist / Favorites';
    heartBtn.setAttribute('aria-label', 'Save to Shortlist');
    heartBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="${isShortlisted(id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    `;

    heartBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleShortlist(id, title, src);
      heartBtn.classList.toggle('shortlisted', isShortlisted(id));
      const svg = heartBtn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', isShortlisted(id) ? 'currentColor' : 'none');
      }
    });

    thumbWrap.appendChild(heartBtn);

    // Overlay Action Buttons
    const overlay = card.querySelector('.gallery-card-overlay');
    if (overlay && !overlay.querySelector('.card-overlay-actions')) {
      const actionsWrap = document.createElement('div');
      actionsWrap.className = 'card-overlay-actions';
      actionsWrap.innerHTML = `
        <span class="card-overlay-btn card-btn-preview">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          Preview HD
        </span>
        <button type="button" class="card-overlay-btn card-btn-inquire">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          Inquire
        </button>
      `;

      actionsWrap.querySelector('.card-btn-inquire').addEventListener('click', function(ev) {
        ev.stopPropagation();
        openInquiryModal(title, src);
      });

      overlay.appendChild(actionsWrap);
    }
  }

  function enhanceCardInfo(card, id, title, src) {
    const infoWrap = card.querySelector('.gallery-card-info');
    if (!infoWrap || infoWrap.querySelector('.card-quick-inquire-btn')) return;

    const actionContainer = document.createElement('div');
    actionContainer.className = 'card-action-pills';

    const quickBtn = document.createElement('button');
    quickBtn.className = 'card-quick-inquire-btn';
    quickBtn.textContent = 'Inquire';
    quickBtn.title = 'Inquire about getting a similar design concept';
    quickBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      openInquiryModal(title, src);
    });

    const zoomIcon = infoWrap.querySelector('.card-zoom-icon');
    if (zoomIcon) {
      actionContainer.appendChild(quickBtn);
      actionContainer.appendChild(zoomIcon);
      infoWrap.appendChild(actionContainer);
    } else {
      infoWrap.appendChild(quickBtn);
    }
  }

  /* ==========================================================================
     LAYOUT SWITCHER (Spacious vs Compact)
     ========================================================================== */
  function setupLayoutSwitcher() {
    const searchWrap = document.querySelector('.gallery-search-wrap');
    const controlsWrap = document.querySelector('.gallery-controls-wrap');
    const grid = document.querySelector('.modern-gallery-grid');
    if (!grid) return;

    const savedLayout = localStorage.getItem('sofint_grid_layout') || 'spacious';
    if (savedLayout === 'compact') {
      grid.classList.add('grid-compact');
      grid.classList.remove('grid-spacious');
    } else {
      grid.classList.add('grid-spacious');
      grid.classList.remove('grid-compact');
    }

    const switcher = document.createElement('div');
    switcher.className = 'grid-view-switcher';
    switcher.innerHTML = `
      <button class="view-switch-btn ${savedLayout === 'spacious' ? 'active' : ''}" data-view="spacious" title="Relaxed & Spacious View">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        Spacious
      </button>
      <button class="view-switch-btn ${savedLayout === 'compact' ? 'active' : ''}" data-view="compact" title="Compact Multi-Column View">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="4" height="4"></rect><rect x="10" y="3" width="4" height="4"></rect><rect x="17" y="3" width="4" height="4"></rect><rect x="3" y="10" width="4" height="4"></rect><rect x="10" y="10" width="4" height="4"></rect><rect x="17" y="10" width="4" height="4"></rect><rect x="3" y="17" width="4" height="4"></rect><rect x="10" y="17" width="4" height="4"></rect><rect x="17" y="17" width="4" height="4"></rect></svg>
        Compact
      </button>
    `;

    switcher.querySelectorAll('.view-switch-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const view = this.getAttribute('data-view');
        switcher.querySelectorAll('.view-switch-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        if (view === 'compact') {
          grid.classList.add('grid-compact');
          grid.classList.remove('grid-spacious');
          localStorage.setItem('sofint_grid_layout', 'compact');
        } else {
          grid.classList.add('grid-spacious');
          grid.classList.remove('grid-compact');
          localStorage.setItem('sofint_grid_layout', 'spacious');
        }
      });
    });

    if (controlsWrap) {
      controlsWrap.appendChild(switcher);
    } else if (searchWrap && searchWrap.parentElement) {
      const newWrap = document.createElement('div');
      newWrap.className = 'gallery-controls-wrap';
      searchWrap.parentNode.insertBefore(newWrap, searchWrap);
      newWrap.appendChild(searchWrap);
      newWrap.appendChild(switcher);
    }
  }

  /* ==========================================================================
     SHORTLIST / FAVORITES SYSTEM (With Clipboard Copy for Freelancer.com Chat)
     ========================================================================== */
  function isShortlisted(id) {
    return shortlist.some(item => item.id === id);
  }

  function toggleShortlist(id, title, src) {
    if (isShortlisted(id)) {
      shortlist = shortlist.filter(item => item.id !== id);
    } else {
      shortlist.push({ id, title, src });
    }
    localStorage.setItem('sofint_portfolio_shortlist', JSON.stringify(shortlist));
    updateShortlistUI();
  }

  function removeShortlistItem(id) {
    shortlist = shortlist.filter(item => item.id !== id);
    localStorage.setItem('sofint_portfolio_shortlist', JSON.stringify(shortlist));
    
    const card = document.querySelector(`.gallery-card[data-id="${id}"]`);
    if (card) {
      const btn = card.querySelector('.card-heart-btn');
      if (btn) {
        btn.classList.remove('shortlisted');
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', 'none');
      }
    }

    updateShortlistUI();
  }

  function updateShortlistUI() {
    const badge = document.getElementById('floating-shortlist-badge');
    const countPills = document.querySelectorAll('.shortlist-count-pill');
    const drawerBody = document.getElementById('shortlist-drawer-body');
    const footerActions = document.getElementById('shortlist-footer-actions');

    countPills.forEach(p => p.textContent = shortlist.length);

    if (badge) {
      if (shortlist.length > 0) {
        badge.classList.add('show');
      } else {
        badge.classList.remove('show');
      }
    }

    if (drawerBody) {
      if (shortlist.length === 0) {
        drawerBody.innerHTML = `
          <div class="shortlist-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <p><strong>No designs shortlisted yet.</strong><br>Click the ❤️ icon on any sample to bookmark it. You can copy the shortlist list in 1-click to paste into your Freelancer.com chat or proposal.</p>
          </div>
        `;
        if (footerActions) footerActions.style.display = 'none';
      } else {
        if (footerActions) footerActions.style.display = 'block';
        drawerBody.innerHTML = '';

        shortlist.forEach(item => {
          const row = document.createElement('div');
          row.className = 'shortlist-item';
          row.innerHTML = `
            <img src="${item.src}" alt="${item.title}" class="shortlist-item-thumb">
            <div class="shortlist-item-meta">
              <h4 class="shortlist-item-title">${item.title}</h4>
              <span class="shortlist-item-subtitle">Sofint Creative Showcase</span>
            </div>
            <button class="shortlist-item-remove" title="Remove from shortlist" data-id="${item.id}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          `;

          row.querySelector('.shortlist-item-remove').addEventListener('click', function() {
            removeShortlistItem(item.id);
          });

          drawerBody.appendChild(row);
        });
      }
    }
  }

  function setupShortlistDrawer() {
    if (document.getElementById('floating-shortlist-badge')) return;

    // Floating Badge (Bottom Right)
    const badge = document.createElement('div');
    badge.id = 'floating-shortlist-badge';
    badge.className = 'floating-shortlist-badge';
    badge.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      <span>Shortlisted Samples</span>
      <span class="shortlist-count-pill">0</span>
    `;

    // Slide-over Drawer
    const backdrop = document.createElement('div');
    backdrop.id = 'shortlist-drawer-backdrop';
    backdrop.className = 'shortlist-drawer-backdrop';

    const drawer = document.createElement('div');
    drawer.id = 'shortlist-drawer';
    drawer.className = 'shortlist-drawer';
    drawer.innerHTML = `
      <div class="shortlist-drawer-header">
        <h3 class="shortlist-drawer-title">
          <span>❤️ Your Selected Samples</span>
          <span class="shortlist-count-pill">0</span>
        </h3>
        <button class="shortlist-drawer-close" id="shortlist-drawer-close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="shortlist-drawer-body" id="shortlist-drawer-body"></div>
      <div class="shortlist-drawer-footer" id="shortlist-footer-actions">
        <button id="btn-copy-shortlist" class="btn-shortlist-copy">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          <span id="copy-btn-text">Copy Shortlist to Clipboard</span>
        </button>
        <button id="btn-inquire-shortlist" class="btn-shortlist-inquire">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          Submit Inquiry to Studio
        </button>
        <div class="discreet-contact-note">
          <a href="mailto:${SOFINT_EMAIL}" class="discreet-chat-link">Studio Contact: ${SOFINT_EMAIL}</a>
          <a href="https://wa.me/${SOFINT_WHATSAPP_NUMBER}" target="_blank" rel="noopener noreferrer" class="discreet-chat-link">Direct chat ↗</a>
        </div>
      </div>
    `;

    document.body.appendChild(badge);
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    const openDrawer = () => {
      backdrop.classList.add('active');
      drawer.classList.add('active');
    };

    const closeDrawer = () => {
      backdrop.classList.remove('active');
      drawer.classList.remove('active');
    };

    badge.addEventListener('click', openDrawer);
    backdrop.addEventListener('click', closeDrawer);
    document.getElementById('shortlist-drawer-close').addEventListener('click', closeDrawer);

    // 1-Click Copy Shortlist to Clipboard (Perfect for Freelancer.com chat/proposal!)
    document.getElementById('btn-copy-shortlist').addEventListener('click', function() {
      if (shortlist.length === 0) return;
      const text = `Hi, I selected the following design samples from Sofint Solutions portfolio:\n` +
        shortlist.map((item, idx) => `${idx + 1}. ${item.title}`).join('\n') +
        `\nPlease let me know your thoughts/pricing for a similar style.`;

      navigator.clipboard.writeText(text).then(() => {
        const btnText = document.getElementById('copy-btn-text');
        btnText.textContent = '✓ Copied to Clipboard!';
        setTimeout(() => {
          btnText.textContent = 'Copy Shortlist to Clipboard';
        }, 2500);
      }).catch(() => {
        alert('Shortlist:\n' + text);
      });
    });

    document.getElementById('btn-inquire-shortlist').addEventListener('click', function() {
      const titles = shortlist.map(i => i.title).join(', ');
      closeDrawer();
      openInquiryModal(`Selected: ${titles}`, shortlist[0]?.src || 'assets/sofint-logo.png');
    });
  }

  /* ==========================================================================
     CLEAN & COMPLIANT PROJECT INQUIRY MODAL
     ========================================================================== */
  function setupInquiryModal() {
    if (document.getElementById('inquiry-modal-backdrop')) return;

    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'inquiry-modal-backdrop';
    modalBackdrop.className = 'inquiry-modal-backdrop';
    modalBackdrop.innerHTML = `
      <div class="inquiry-modal-card">
        <div class="inquiry-modal-header">
          <h3 class="inquiry-modal-title">Request a Project Proposal</h3>
          <button class="inquiry-modal-close" id="inquiry-modal-close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="inquiry-modal-body">
          <div class="inquiry-selected-preview" id="inquiry-preview-box">
            <img id="inquiry-preview-img" src="" alt="Selected Design" class="inquiry-preview-thumb">
            <div>
              <strong id="inquiry-preview-title" style="display:block; color:var(--text-main); font-size:0.95rem;"></strong>
              <span style="font-size:0.8rem; color:var(--text-muted);">Sofint Solutions Creative Portfolio</span>
            </div>
          </div>
          
          <div class="inquiry-form-group">
            <label class="inquiry-form-label">Your Name / Client ID</label>
            <input type="text" id="inquiry-name" class="inquiry-form-input" placeholder="e.g. Alex M.">
          </div>
          <div class="inquiry-form-group">
            <label class="inquiry-form-label">Brand / Business Name</label>
            <input type="text" id="inquiry-brand" class="inquiry-form-input" placeholder="e.g. Horizon Labs">
          </div>
          <div class="inquiry-form-group">
            <label class="inquiry-form-label">Project Scope</label>
            <select id="inquiry-service" class="inquiry-form-select">
              <option value="Logo Design Concept">Logo Design (3 Custom Directions + Vector Master Files)</option>
              <option value="Complete Brand Identity">Complete Brand Identity & Style Guidelines</option>
              <option value="Print & Marketing Collateral">Marketing & Print Collateral (Brochure / Stationery)</option>
              <option value="Packaging & Labels">Product Packaging Box & Label Designs</option>
            </select>
          </div>
          <div class="inquiry-form-group">
            <label class="inquiry-form-label">Project Notes / Specifications</label>
            <textarea id="inquiry-notes" class="inquiry-form-textarea" rows="2" placeholder="Briefly describe your style preferences or industry..."></textarea>
          </div>

          <div class="inquiry-modal-actions">
            <button id="inquiry-copy-brief" class="btn-inquiry-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span id="copy-brief-text">Copy Project Brief for Chat</span>
            </button>
            <a id="inquiry-send-email" class="btn-inquiry-secondary" href="mailto:${SOFINT_EMAIL}?subject=Design%20Project%20Inquiry%20-%20Sofint%20Solutions">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span>Contact via Email</span>
            </a>
            
            <div class="discreet-modal-footer">
              <a href="mailto:${SOFINT_EMAIL}" class="discreet-chat-link">Direct Studio Email: ${SOFINT_EMAIL}</a>
              <a href="https://wa.me/${SOFINT_WHATSAPP_NUMBER}" target="_blank" rel="noopener noreferrer" class="discreet-chat-link">Direct chat ↗</a>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    const closeModal = () => modalBackdrop.classList.remove('active');
    document.getElementById('inquiry-modal-close').addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', function(e) {
      if (e.target === modalBackdrop) closeModal();
    });

    // Copy brief to clipboard (Seamless for pasting in Freelancer chat / proposal)
    document.getElementById('inquiry-copy-brief').addEventListener('click', function() {
      const name = document.getElementById('inquiry-name').value.trim() || 'Client';
      const brand = document.getElementById('inquiry-brand').value.trim() || 'Brand Project';
      const service = document.getElementById('inquiry-service').value;
      const concept = document.getElementById('inquiry-preview-title').textContent;
      const notes = document.getElementById('inquiry-notes').value.trim();

      const briefText = `PROJECT INQUIRY - SOFINT SOLUTIONS\nClient: ${name}\nBrand: ${brand}\nReference: ${concept}\nScope: ${service}\n${notes ? 'Notes: ' + notes + '\n' : ''}\nPlease provide pricing and estimated timeline.`;

      navigator.clipboard.writeText(briefText).then(() => {
        const label = document.getElementById('copy-brief-text');
        label.textContent = '✓ Copied Brief to Clipboard!';
        setTimeout(() => {
          label.textContent = 'Copy Project Brief for Chat';
        }, 2500);
      }).catch(() => {
        alert(briefText);
      });
    });

    // Email link update logic
    function updateEmailLink() {
      const emailBtn = document.getElementById('inquiry-send-email');
      if (!emailBtn) return;

      const name = document.getElementById('inquiry-name')?.value.trim() || 'Client';
      const brand = document.getElementById('inquiry-brand')?.value.trim() || 'Brand Project';
      const service = document.getElementById('inquiry-service')?.value || 'Design Scope';
      const concept = document.getElementById('inquiry-preview-title')?.textContent || 'Design Concept';
      const notes = document.getElementById('inquiry-notes')?.value.trim() || '';

      const subject = encodeURIComponent(`Design Inquiry: ${brand} - ${service}`);
      const body = encodeURIComponent(`Hi Sofint Solutions,\n\nI am contacting you from your creative portfolio showcase regarding a project:\n\n• Client: ${name}\n• Brand: ${brand}\n• Design Reference: ${concept}\n• Scope: ${service}${notes ? '\n• Project Brief / Notes: ' + notes : ''}\n\nPlease let me know your availability and estimated project quote.\n\nThank you,\n${name}`);
      emailBtn.href = `mailto:${SOFINT_EMAIL}?subject=${subject}&body=${body}`;
    }

    ['inquiry-name', 'inquiry-brand', 'inquiry-service', 'inquiry-notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updateEmailLink);
        el.addEventListener('change', updateEmailLink);
      }
    });

    // Direct click trigger on inquiry-send-email to guarantee navigation
    const emailLinkBtn = document.getElementById('inquiry-send-email');
    if (emailLinkBtn) {
      emailLinkBtn.addEventListener('click', function(e) {
        updateEmailLink();
        const href = this.getAttribute('href');
        if (href && href.startsWith('mailto:')) {
          window.location.href = href;
        }
      });
    }

    // Initialize email link with default values
    updateEmailLink();
  }

  function openInquiryModal(title, src) {
    const backdrop = document.getElementById('inquiry-modal-backdrop');
    if (!backdrop) return;

    document.getElementById('inquiry-preview-title').textContent = title;
    document.getElementById('inquiry-preview-img').src = src;
    backdrop.classList.add('active');

    // Dynamically re-trigger email link update with the opened design title
    const name = document.getElementById('inquiry-name')?.value.trim() || 'Client';
    const brand = document.getElementById('inquiry-brand')?.value.trim() || 'Brand Project';
    const service = document.getElementById('inquiry-service')?.value || 'Design Scope';
    const notes = document.getElementById('inquiry-notes')?.value.trim() || '';
    const emailBtn = document.getElementById('inquiry-send-email');
    if (emailBtn) {
      const subject = encodeURIComponent(`Design Inquiry: ${brand} - ${service}`);
      const body = encodeURIComponent(`Hi Sofint Solutions,\n\nI am contacting you from your creative portfolio showcase regarding a project:\n\n• Client: ${name}\n• Brand: ${brand}\n• Design Reference: ${title}\n• Scope: ${service}${notes ? '\n• Project Brief / Notes: ' + notes : ''}\n\nPlease let me know your availability and estimated project quote.\n\nThank you,\n${name}`);
      emailBtn.href = `mailto:${SOFINT_EMAIL}?subject=${subject}&body=${body}`;
    }
  }

  /* ==========================================================================
     LIGHTBOX ACTIONS
     ========================================================================== */
  function setupLightboxActions() {
    const controls = document.querySelector('.lightbox-controls');
    if (!controls || controls.querySelector('.lightbox-btn-inquire')) return;

    const inquireBtn = document.createElement('button');
    inquireBtn.className = 'lightbox-btn lightbox-btn-inquire';
    inquireBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      <span>Inquire Concept</span>
    `;

    inquireBtn.addEventListener('click', function() {
      const item = galleryItems[currentIndex];
      if (item) {
        openInquiryModal(item.title, item.src);
      }
    });

    controls.insertBefore(inquireBtn, controls.firstChild);
  }

  /* ==========================================================================
     PACKAGE ESTIMATOR INTERACTION
     ========================================================================== */
  function setupEstimator() {
    const serviceSel = document.getElementById('calc-service');
    const speedSel = document.getElementById('calc-speed');
    const dealTitle = document.getElementById('calc-deal-title');
    const dealFeatures = document.getElementById('calc-deal-features');
    const dealBtn = document.getElementById('calc-inquiry-btn') || document.getElementById('calc-whatsapp-btn');

    if (!serviceSel || !speedSel || !dealTitle) return;

    function updateEstimate() {
      const service = serviceSel.value;
      const speed = speedSel.value;

      if (service === 'logo') {
        dealTitle.textContent = speed === 'express' ? 'Express Logo Design Kit' : 'Curated Logo Identity Kit';
        dealFeatures.innerHTML = `
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> 3 Unique Custom Logo Concepts</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> ${speed === 'express' ? '⚡ 24-48 Hours Express Delivery' : 'Standard 3-4 Days Delivery'}</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Vector Formats (AI, EPS, SVG, PNG, PDF)</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Full Commercial Rights & Copyright Transfer</li>
        `;
      } else if (service === 'brand') {
        dealTitle.textContent = 'Complete Brand Guidelines Kit';
        dealFeatures.innerHTML = `
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Master Logo + Color Palette + Font Hierarchy</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> 15-Page Brand Style Guidelines PDF</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Social Media Kit & Profile Avatars</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Unlimited Concept Revisions</li>
        `;
      } else {
        dealTitle.textContent = 'Print & Packaging Suite';
        dealFeatures.innerHTML = `
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Packaging Box / Label / Brochure Design</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> 300 DPI CMYK Print-Ready Dielines</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Photorealistic 3D Mockup Renders</li>
          <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Direct Printer File Handoff Support</li>
        `;
      }

      if (dealBtn) {
        dealBtn.onclick = function(e) {
          e.preventDefault();
          openInquiryModal(`Package: ${dealTitle.textContent}`, 'assets/sofint-logo.png');
        };
      }
    }

    serviceSel.addEventListener('change', updateEstimate);
    speedSel.addEventListener('change', updateEstimate);
    updateEstimate();
  }

  /* ==========================================================================
     CORE LIGHTBOX LOGIC
     ========================================================================== */
  function openLightbox(index) {
    if (!lightbox || index < 0 || index >= galleryItems.length) return;
    currentIndex = index;
    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function updateLightboxContent() {
    const item = galleryItems[currentIndex];
    if (!item) return;

    lightboxImg.style.opacity = '0';
    lightboxImg.src = item.src;
    lightboxImg.onload = function() {
      lightboxImg.style.opacity = '1';
    };

    if (lightboxCounter) {
      lightboxCounter.textContent = (currentIndex + 1) + ' / ' + galleryItems.length;
    }
    if (lightboxTitle) {
      lightboxTitle.textContent = item.title;
    }
    if (lightboxOpenOriginal) {
      lightboxOpenOriginal.href = item.src;
    }
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showNext() {
    if (galleryItems.length === 0) return;
    currentIndex = (currentIndex + 1) % galleryItems.length;
    updateLightboxContent();
  }

  function showPrev() {
    if (galleryItems.length === 0) return;
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightboxContent();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', function(e) { e.stopPropagation(); showNext(); });
  if (lightboxPrev) lightboxPrev.addEventListener('click', function(e) { e.stopPropagation(); showPrev(); });

  if (lightbox) {
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox-stage') || e.target.classList.contains('lightbox-img-wrapper')) {
        closeLightbox();
      }
    });
  }

  window.addEventListener('keydown', function(e) {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') showNext();
    else if (e.key === 'ArrowLeft') showPrev();
  });

  /* ==========================================================================
     SEARCH & FILTERING
     ========================================================================== */
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.gallery-card');
      let visibleCount = 0;

      cards.forEach(function(card) {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const full = (card.getAttribute('data-full') || '').toLowerCase();
        
        if (!query || title.indexOf(query) !== -1 || full.indexOf(query) !== -1) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      const countDisplay = document.getElementById('search-results-count');
      if (countDisplay) {
        countDisplay.textContent = query 
          ? `Showing ${visibleCount} design samples found for "${query}"`
          : `Showing 66 curated design samples. Click any item for fullscreen high-resolution view.`;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
  } else {
    initGallery();
  }
})();
