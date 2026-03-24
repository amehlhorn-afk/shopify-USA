/**
 * GEO FAQ - Enhanced FAQ section with section-level accordions
 * Handles both section-level and item-level accordion behavior
 * Plus anchor navigation integration
 */

class GeoFaqSection {
  constructor(container) {
    this.container = container;
    this.sectionHeaders = container.querySelectorAll('.geo-faq__section-header');
    this.anchorLinks = container.querySelectorAll('.js_faq_heading');
    this.faqItems = container.querySelectorAll('.block__tabs_title');
    
    this.init();
  }

  init() {
    // Initialize section-level accordions
    this.sectionHeaders.forEach(header => {
      header.addEventListener('click', (e) => this.toggleSection(e.currentTarget));
    });

    // Initialize FAQ item accordions (existing behavior)
    this.faqItems.forEach(item => {
      item.addEventListener('click', (e) => this.toggleFaqItem(e.currentTarget));
    });

    // Initialize anchor navigation
    this.anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handleAnchorClick(e));
    });

    // Initialize mobile dropdown
    const mobileHeader = this.container.querySelector('.block__faq-category-mobile');
    if (mobileHeader) {
      mobileHeader.addEventListener('click', (e) => this.toggleMobileDropdown(e));
    }

    // Check if first section should be open by default
    const firstSection = this.container.querySelector('.geo-faq__section-header');
    const shouldOpenFirst = this.container.closest('section').dataset.firstOpen === 'true';
    
    if (shouldOpenFirst && firstSection) {
      this.openSection(firstSection);
    }

    // Handle URL hash on page load
    if (window.location.hash) {
      this.handleHashNavigation();
    }
  }

  /**
   * Toggle section-level accordion
   * Only one section open at a time
   */
  toggleSection(header) {
    const isExpanded = header.getAttribute('aria-expanded') === 'true';
    const content = header.nextElementSibling;

    if (isExpanded) {
      // Close this section
      this.closeSection(header);
    } else {
      // Close all sections first
      this.closeAllSections();
      // Then open this one
      this.openSection(header);
    }
  }

  openSection(header) {
    const content = header.nextElementSibling;
    header.setAttribute('aria-expanded', 'true');
    content.classList.add('is-open');
    
    // Update anchor link active state
    const sectionId = header.closest('.geo-faq__section').getAttribute('id');
    this.updateActiveAnchor(sectionId);
  }

  closeSection(header) {
    const content = header.nextElementSibling;
    header.setAttribute('aria-expanded', 'false');
    content.classList.remove('is-open');
  }

  closeAllSections() {
    this.sectionHeaders.forEach(header => {
      this.closeSection(header);
    });
  }

  /**
   * Toggle individual FAQ item (question/answer)
   * Existing behavior preserved
   */
  toggleFaqItem(titleElement) {
    const faqSlide = titleElement.closest('.block__faq-slide');
    const panel = faqSlide.querySelector('.block__faq-panel');
    const isOpen = faqSlide.classList.contains('change_icon');

    if (isOpen) {
      // Close this FAQ
      faqSlide.classList.remove('change_icon');
      if (panel) panel.style.display = 'none';
    } else {
      // Close all FAQs in this section
      const section = titleElement.closest('.geo-faq__section-content');
      if (section) {
        section.querySelectorAll('.block__faq-slide').forEach(slide => {
          slide.classList.remove('change_icon');
          const slidePanel = slide.querySelector('.block__faq-panel');
          if (slidePanel) slidePanel.style.display = 'none';
        });
      }

      // Open this FAQ
      faqSlide.classList.add('change_icon');
      if (panel) panel.style.display = 'block';
    }
  }

  /**
   * Handle anchor link clicks
   * Scrolls to section and opens it
   */
  handleAnchorClick(e) {
    const link = e.currentTarget;
    const targetId = link.getAttribute('data_id');
    const targetSection = this.container.querySelector(`#${targetId}`);
    
    if (targetSection) {
      e.preventDefault();
      
      // Find the section header button
      const sectionHeader = targetSection.querySelector('.geo-faq__section-header');
      
      // Close all sections and open target
      this.closeAllSections();
      if (sectionHeader) {
        this.openSection(sectionHeader);
      }
      
      // Close mobile dropdown if open
      const categoryWrapper = this.container.querySelector('.block__faq-category');
      if (categoryWrapper && categoryWrapper.classList.contains('mobile-open')) {
        categoryWrapper.classList.remove('mobile-open');
      }
      
      // Wait for section to open (animation) before scrolling
      setTimeout(() => {
        // Scroll to section with offset for fixed headers and mobile menu
        const offset = window.innerWidth < 750 ? 120 : 100; // Larger offset on mobile for sticky menu
        const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }, 450); // Wait for max-height transition (400ms) + small buffer
      
      // Update URL hash without jumping
      history.pushState(null, null, `#${targetId}`);
    }
  }

  /**
   * Handle direct URL hash navigation
   */
  handleHashNavigation() {
    const hash = window.location.hash.substring(1);
    const targetSection = this.container.querySelector(`#${hash}`);
    
    if (targetSection) {
      const sectionHeader = targetSection.querySelector('.geo-faq__section-header');
      
      // Small delay to ensure page is loaded
      setTimeout(() => {
        this.closeAllSections();
        if (sectionHeader) {
          this.openSection(sectionHeader);
        }
        
        const offset = 100;
        const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  }

  /**
   * Update active state on anchor links
   */
  updateActiveAnchor(sectionId) {
    this.anchorLinks.forEach(link => {
      const linkId = link.getAttribute('data_id');
      if (linkId === sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Toggle mobile dropdown menu
   */
  toggleMobileDropdown(e) {
    const categoryWrapper = this.container.querySelector('.block__faq-category');
    if (categoryWrapper) {
      categoryWrapper.classList.toggle('mobile-open');
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const faqSections = document.querySelectorAll('.section-faqs');
  faqSections.forEach(section => {
    new GeoFaqSection(section);
  });
});

// Also initialize for Shopify theme editor
if (Shopify && Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    const section = event.target.querySelector('.section-faqs');
    if (section) {
      new GeoFaqSection(section);
    }
  });
}
