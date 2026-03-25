// ============================================
// PAGE LOADER
// ============================================
window.addEventListener('load', () => {
  const pageLoader = document.getElementById('pageLoader');
  if (pageLoader) {
    pageLoader.classList.add('hidden');
    setTimeout(() => { pageLoader.remove(); }, 400);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // CHECK FOR REDUCED MOTION PREFERENCE
  // ============================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================
  // LAZY LOADING IMAGES
  // ============================================
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.addEventListener('load', () => {
            img.classList.add('loaded');
          });
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    lazyImages.forEach(img => img.classList.add('loaded'));
  }

  // ============================================
  // MOBILE NAVIGATION
  // ============================================
  const navToggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.nav__mobile-links a');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isActive = navToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', isActive);

      // Prevent body scroll when menu is open
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    // Close menu when clicking any link (nav links + CTA)
    const allMobileLinks = mobileMenu.querySelectorAll('a');
    allMobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ============================================
  // LENIS SMOOTH SCROLL (Optional)
  // ============================================
  let lenis = null;
  if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Smooth scroll to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement, {
            offset: -80, // Account for fixed nav
            duration: 1.2
          });
        }
      });
    });
  } else {
    // Fallback smooth scroll for browsers without Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const offsetTop = targetElement.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
        }
      });
    });
  }

  // ============================================
  // SIMPLE SCROLL REVEAL - Intersection Observer
  // ============================================
  if (!prefersReducedMotion) {
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
      const revealElements = section.querySelectorAll('.scroll-reveal');
      let revealedCount = 0;

      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add stagger delay per section
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, revealedCount * 80);
            revealedCount++;
            revealObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      revealElements.forEach(el => {
        revealObserver.observe(el);
      });
    });
  } else {
    // If reduced motion is preferred, make all elements visible immediately
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      el.classList.add('visible');
    });
  }

  // ============================================
  // NUMBER COUNTER ANIMATION
  // ============================================
  const numberElements = document.querySelectorAll('.numbers__value');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const text = element.textContent;
        const hasPercent = text.includes('%');
        const hasPlus = text.includes('+');
        const hasYears = text.includes('Years');

        // Extract number
        const numberMatch = text.match(/[\d.]+/);
        if (numberMatch) {
          const endValue = parseFloat(numberMatch[0]);
          const isDecimal = text.includes('.');
          const duration = 2000; // 2 seconds
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = easeProgress * endValue;

            // Format the number
            let displayValue = isDecimal ? currentValue.toFixed(1) : Math.floor(currentValue).toString();
            if (hasPercent) displayValue += '%';
            if (hasYears) displayValue += '+ Years';
            else if (hasPlus) displayValue += '+';

            element.textContent = displayValue;

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }

        counterObserver.unobserve(element);
      }
    });
  }, {
    threshold: 0.5
  });

  numberElements.forEach(el => {
    counterObserver.observe(el);
  });

  // ============================================
  // FORM SUBMISSION
  // ============================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic validation
      const nameInput = contactForm.querySelector('#name');
      const emailInput = contactForm.querySelector('#email');
      const messageInput = contactForm.querySelector('#message');

      if (!nameInput.value.trim()) {
        nameInput.focus();
        showFormError(nameInput, 'Name is required');
        return;
      }

      if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
        emailInput.focus();
        showFormError(emailInput, 'Valid email is required');
        return;
      }

      if (!messageInput.value.trim()) {
        messageInput.focus();
        showFormError(messageInput, 'Project details are required');
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      try {
        // TODO: Replace with actual backend endpoint
        // const response = await fetch('/api/contact', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data)
        // });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Form submitted:', data);

        // Success state
        submitBtn.innerHTML = 'Sent! ✓';
        submitBtn.style.background = '#10B981';

        // Show success message
        showSuccessMessage('Thank you for your inquiry! We will get back to you within 24 hours.');

        // Reset form after delay
        setTimeout(() => {
          contactForm.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          submitBtn.style.background = '';
        }, 3000);

      } catch (error) {
        console.error('Form submission error:', error);
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        showFormError(submitBtn, 'An error occurred. Please try again.');
      }
    });

    // Real-time validation feedback
    const inputs = contactForm.querySelectorAll('.form-input');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        validateInput(input);
      });
      input.addEventListener('input', () => {
        removeFormError(input);
      });
    });
  }

  // Helper functions
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFormError(input, message) {
    removeFormError(input);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.style.cssText = 'color: var(--color-red); font-size: var(--text-xs); margin-top: var(--space-2); font-weight: 500;';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
    input.style.borderColor = 'var(--color-red)';
  }

  function removeFormError(input) {
    const errorDiv = input.parentElement.querySelector('.form-error');
    if (errorDiv) errorDiv.remove();
    input.style.borderColor = '';
  }

  function validateInput(input) {
    if (input.hasAttribute('required') && !input.value.trim()) {
      showFormError(input, 'This field is required');
      return false;
    }
    if (input.type === 'email' && input.value && !isValidEmail(input.value)) {
      showFormError(input, 'Please enter a valid email address');
      return false;
    }
    return true;
  }

  function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: #10B981;
      color: white;
      padding: var(--space-4) var(--space-6);
      border-radius: 4px;
      font-weight: 500;
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
      successDiv.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => successDiv.remove(), 300);
    }, 4000);
  }

  // ============================================
  // GSAP BLUR-FADE ANIMATIONS — HERO + SERVICES
  // ============================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // --- Word-split utility: wraps each word in a span ---
    function splitIntoWords(element) {
      const childNodes = Array.from(element.childNodes);
      let html = '';

      childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const words = node.textContent.split(/(\s+)/);
          words.forEach(word => {
            if (word.match(/^\s+$/)) {
              html += '<span class="word-space"> </span>';
            } else if (word.length > 0) {
              html += '<span class="word">' + word + '</span>';
            }
          });
        } else if (node.nodeName === 'BR') {
          html += '<br>';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = node.tagName.toLowerCase();
          const attrs = Array.from(node.attributes).map(a => a.name + '="' + a.value + '"').join(' ');
          const innerWords = node.textContent.split(/(\s+)/);
          let innerHtml = '';
          innerWords.forEach(word => {
            if (word.match(/^\s+$/)) {
              innerHtml += '<span class="word-space"> </span>';
            } else if (word.length > 0) {
              innerHtml += '<span class="word">' + word + '</span>';
            }
          });
          html += '<' + tag + (attrs ? ' ' + attrs : '') + '>' + innerHtml + '</' + tag + '>';
        }
      });

      element.innerHTML = html;
      element.classList.add('word-split');
      return element.querySelectorAll('.word');
    }

    // ===========================================
    // HERO — blur-fade word animation on page load
    // ===========================================
    const heroTl = gsap.timeline({ delay: 0.3 });

    // 1) Label — fade in as a block
    heroTl.to('.hero__label', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    });

    // 2) Title — split into words, blur-fade each
    const heroTitle = document.querySelector('.hero__title');
    if (heroTitle) {
      // Make container visible so words can show
      heroTl.to(heroTitle, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.01 }, '-=0.3');
      const titleWords = splitIntoWords(heroTitle);
      heroTl.to(titleWords, {
        opacity: 1,
          y: 0,
        duration: 0.45,
        ease: 'power2.out',
        stagger: 0.05
      }, '-=0.3');
    }

    // 3) Description — split into words, blur-fade each
    const heroDesc = document.querySelector('.hero__desc');
    if (heroDesc) {
      heroTl.to(heroDesc, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.01 }, '-=0.15');
      const descWords = splitIntoWords(heroDesc);
      heroTl.to(descWords, {
        opacity: 1,
          y: 0,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.025
      }, '-=0.15');
    }

    // 4) Actions — fade in as a block
    heroTl.to('.hero__actions', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.2');

    // 5) Scroll indicator
    heroTl.to('.hero__scroll', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out'
    }, '-=0.3');

    // ===========================================
    // SERVICES HEADER — word blur-fade on scroll
    // ===========================================
    const servicesHeader = document.querySelector('.services__header');

    if (servicesHeader) {
      // Reveal the header container
      gsap.to(servicesHeader, {
        opacity: 1,
          y: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: servicesHeader,
          start: 'top 85%',
          once: true
        }
      });

      // Split text elements into words and animate with blur-fade
      const textElements = servicesHeader.querySelectorAll('.services__header-label, .services__header-title, .services__header-desc');

      textElements.forEach((el, elIndex) => {
        const words = splitIntoWords(el);

        gsap.to(words, {
          opacity: 1,
              y: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.04,
          delay: 0.15 + (elIndex * 0.15),
          scrollTrigger: {
            trigger: servicesHeader,
            start: 'top 85%',
            once: true
          }
        });
      });
    }

    // ===========================================
    // SERVICE CARDS — stacking scroll effect (desktop only)
    // Each card scales down + dims slightly as the next one stacks on top
    // ===========================================
    ScrollTrigger.matchMedia({
      '(min-width: 769px)': function() {
        const serviceCards = gsap.utils.toArray('.service');

        serviceCards.forEach((card, index) => {
          if (index === serviceCards.length - 1) return;

          ScrollTrigger.create({
            trigger: card,
            start: 'top 64px',
            end: 'bottom 64px',
            scrub: true,
            onUpdate: (self) => {
              const progress = self.progress;
              const scale = 1 - (progress * 0.04);
              const brightness = 1 - (progress * 0.08);
              gsap.set(card, {
                scale: scale,
                filter: 'brightness(' + brightness + ')',
                transformOrigin: 'center top'
              });
            },
            onLeaveBack: () => {
              gsap.set(card, { scale: 1, filter: 'brightness(1)' });
            }
          });
        });
      }
    });
  } else if (prefersReducedMotion) {
    // Respect reduced motion — show everything immediately
    document.querySelectorAll('.gsap-reveal, .hero__label, .hero__title, .hero__desc, .hero__actions, .hero__scroll').forEach(el => {
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.style.transform = 'none';
    });
  }
});

// ============================================
// HERO 3D PARTICLE SYSTEM (deferred to reduce TBT)
// ============================================
(window.requestIdleCallback||function(cb){setTimeout(cb,80)})(function(){
  if (typeof THREE === 'undefined') return;

  const container = document.getElementById('canvas-container');
  const serviceListEl = document.getElementById('service-list');
  const counterEl = document.getElementById('counter');
  const shapeLabelEl = document.getElementById('shape-label');
  if (!container || !counterEl) return;

  const services = [
    { name:'Web Based Applications' },
    { name:'Custom Business Solutions' },
    { name:'Integration Services' },
    { name:'Payment Gateway Integration' },
    { name:'Process Automation' },
    { name:'Business Efficiency Optimization' },
  ];

  services.forEach((_,i)=>{
    const d=document.createElement('div');
    d.className='dot'+(i===0?' active':'');
    d.addEventListener('click',()=>goToShape(i));
    counterEl.appendChild(d);
  });

  if (shapeLabelEl) shapeLabelEl.textContent = services[0].name;

  const scene = new THREE.Scene();
  // transparent background — blends with hero
  const frustum = 3.0;
  let aspect = container.clientWidth / (container.clientHeight || 1);
  const camera = new THREE.OrthographicCamera(
    -frustum*aspect, frustum*aspect, frustum, -frustum, -50, 50
  );
  camera.position.set(8,8,8);
  camera.lookAt(0,0,0);

  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const worldGroup = new THREE.Group();
  worldGroup.position.set(-.5, -.2, 0);
  scene.add(worldGroup);

  const PALETTE = [
    new THREE.Color(0xC8102E),
    new THREE.Color(0xD4283F),
    new THREE.Color(0xA01025),
    new THREE.Color(0xE85A6F),
    new THREE.Color(0x8A0B1E),
    new THREE.Color(0xB01228),
    new THREE.Color(0xF07080),
  ];

  const PARTICLE_COUNT = 12000;

  function sampleBox(w,h,d,count){
    const pts=[];
    for(let i=0;i<count;i++){
      const f=Math.floor(Math.random()*6);
      let x,y,z;
      switch(f){
        case 0:x=w/2;y=(Math.random()-.5)*h;z=(Math.random()-.5)*d;break;
        case 1:x=-w/2;y=(Math.random()-.5)*h;z=(Math.random()-.5)*d;break;
        case 2:x=(Math.random()-.5)*w;y=h/2;z=(Math.random()-.5)*d;break;
        case 3:x=(Math.random()-.5)*w;y=-h/2;z=(Math.random()-.5)*d;break;
        case 4:x=(Math.random()-.5)*w;y=(Math.random()-.5)*h;z=d/2;break;
        default:x=(Math.random()-.5)*w;y=(Math.random()-.5)*h;z=-d/2;
      }
      if(Math.random()<.1){x=(Math.random()-.5)*w;y=(Math.random()-.5)*h;z=(Math.random()-.5)*d;}
      pts.push(x,y,z);
    }
    return pts;
  }

  function sampleCylinder(r,h,count){
    const pts=[];
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2;
      const rd=Math.random()>.1?r:(r*.7+Math.random()*r*.3);
      pts.push(Math.cos(a)*rd,(Math.random()-.5)*h,Math.sin(a)*rd);
    }
    return pts;
  }

  function sampleSphere(r,count){
    const pts=[];
    for(let i=0;i<count;i++){
      const u=Math.random(),v=Math.random();
      const th=2*Math.PI*u,ph=Math.acos(2*v-1);
      const rd=Math.random()>.1?r:(r*.75+Math.random()*r*.25);
      pts.push(rd*Math.sin(ph)*Math.cos(th),rd*Math.sin(ph)*Math.sin(th),rd*Math.cos(ph));
    }
    return pts;
  }

  function pad(arr,count){
    const p=[...arr];
    while(p.length<count*3){
      const idx=Math.floor(Math.random()*(p.length/3))*3;
      p.push(p[idx]+(Math.random()-.5)*.008,p[idx+1]+(Math.random()-.5)*.008,p[idx+2]+(Math.random()-.5)*.008);
    }
    return p.slice(0,count*3);
  }

  function genMonitor(){
    const pts=[];
    const screen=sampleBox(3,1.9,.15,6000);
    for(let i=0;i<screen.length;i+=3){pts.push(screen[i],screen[i+1]+.6,screen[i+2]);}
    const inner=sampleBox(2.6,1.5,.02,3000);
    for(let i=0;i<inner.length;i+=3){pts.push(inner[i],inner[i+1]+.6,inner[i+2]+.08);}
    const neck=sampleBox(.2,1,.14,1200);
    for(let i=0;i<neck.length;i+=3){pts.push(neck[i],neck[i+1]-.8,neck[i+2]);}
    const base=sampleBox(1.6,.12,.8,1800);
    for(let i=0;i<base.length;i+=3){pts.push(base[i],base[i+1]-1.35,base[i+2]);}
    for(let l=0;l<6;l++){
      const w=.6+Math.random()*1.4;
      const line=sampleBox(w,.03,.01,250);
      for(let i=0;i<line.length;i+=3){pts.push(line[i]-.3+Math.random()*.2,line[i+1]+.35-l*.2,line[i+2]+.1);}
    }
    return pad(pts,PARTICLE_COUNT);
  }

  function genServer(){
    const pts=[];
    pts.push(...sampleBox(2,3.2,1.2,7000));
    for(let r=0;r<6;r++){
      const slot=sampleBox(1.6,.06,1.05,500);
      for(let i=0;i<slot.length;i+=3){pts.push(slot[i],slot[i+1]+1.2-r*.48,slot[i+2]+.02);}
    }
    for(let r=0;r<6;r++){
      const dot=sampleSphere(.07,150);
      for(let i=0;i<dot.length;i+=3){pts.push(dot[i]+.72,dot[i+1]+1.2-r*.48,dot[i+2]+.63);}
    }
    const base2=sampleBox(2.2,.12,1.3,1200);
    for(let i=0;i<base2.length;i+=3){pts.push(base2[i],base2[i+1]-1.65,base2[i+2]);}
    return pad(pts,PARTICLE_COUNT);
  }

  function genHub(){
    const pts=[];
    pts.push(...sampleSphere(.9,3500));
    pts.push(...sampleCylinder(1.3,.1,2000));
    pts.push(...sampleCylinder(1.8,.06,1500));
    for(let a=0;a<6;a++){
      const angle=a*Math.PI/3;
      const arm=sampleBox(.8,.06,.06,400);
      for(let i=0;i<arm.length;i+=3){pts.push(arm[i]+Math.cos(angle)*2,arm[i+1],arm[i+2]+Math.sin(angle)*2);}
      const tip=sampleSphere(.2,300);
      for(let i=0;i<tip.length;i+=3){pts.push(tip[i]+Math.cos(angle)*2.6,tip[i+1],tip[i+2]+Math.sin(angle)*2.6);}
    }
    pts.push(...sampleCylinder(.4,.22,800));
    return pad(pts,PARTICLE_COUNT);
  }

  function genCard(){
    const pts=[];
    pts.push(...sampleBox(3,1.9,.12,8000));
    const chip=sampleBox(.6,.45,.08,1500);
    for(let i=0;i<chip.length;i+=3){pts.push(chip[i]-.8,chip[i+1]+.2,chip[i+2]+.08);}
    for(let l=0;l<3;l++){
      const cl=sampleBox(.5,.02,.04,120);
      for(let i=0;i<cl.length;i+=3){pts.push(cl[i]-.8,cl[i+1]+.08+l*.12,cl[i+2]+.1);}
    }
    const stripe=sampleBox(2.6,.15,.06,1000);
    for(let i=0;i<stripe.length;i+=3){pts.push(stripe[i],stripe[i+1]-.45,stripe[i+2]+.08);}
    for(let g=0;g<4;g++){
      for(let d=0;d<4;d++){
        const dot=sampleSphere(.045,60);
        for(let i=0;i<dot.length;i+=3){pts.push(dot[i]-1+g*.65+d*.12,dot[i+1]-.15,dot[i+2]+.08);}
      }
    }
    return pad(pts,PARTICLE_COUNT);
  }

  function genGear(){
    const pts=[];
    pts.push(...sampleCylinder(.55,.35,1400));
    pts.push(...sampleCylinder(1,.3,2000));
    const teeth=14;
    for(let t=0;t<teeth;t++){
      const a=t*Math.PI*2/teeth;
      const tooth=sampleBox(.32,.32,.3,200);
      for(let i=0;i<tooth.length;i+=3){pts.push(tooth[i]+Math.cos(a)*1.25,tooth[i+1],tooth[i+2]+Math.sin(a)*1.25);}
    }
    const ox=1.2,oy=1,oz=0;
    const c2=sampleCylinder(.35,.25,1000);
    for(let i=0;i<c2.length;i+=3){pts.push(c2[i]+ox,c2[i+1]+oy,c2[i+2]+oz);}
    const c2r=sampleCylinder(.65,.22,1200);
    for(let i=0;i<c2r.length;i+=3){pts.push(c2r[i]+ox,c2r[i+1]+oy,c2r[i+2]+oz);}
    const teeth2=10;
    for(let t=0;t<teeth2;t++){
      const a=t*Math.PI*2/teeth2+Math.PI/10;
      const tooth=sampleBox(.25,.22,.22,140);
      for(let i=0;i<tooth.length;i+=3){pts.push(tooth[i]+Math.cos(a)*.85+ox,tooth[i+1]+oy,tooth[i+2]+Math.sin(a)*.85+oz);}
    }
    pts.push(...sampleCylinder(.14,.5,400));
    const ax2=sampleCylinder(.1,.4,400);
    for(let i=0;i<ax2.length;i+=3){pts.push(ax2[i]+ox,ax2[i+1]+oy,ax2[i+2]+oz);}
    return pad(pts,PARTICLE_COUNT);
  }

  function genChart(){
    const pts=[];
    const xa=sampleBox(3.2,.06,.06,700);
    for(let i=0;i<xa.length;i+=3){pts.push(xa[i],xa[i+1]-1.2,xa[i+2]);}
    const ya=sampleBox(.06,2.8,.06,700);
    for(let i=0;i<ya.length;i+=3){pts.push(ya[i]-1.6,ya[i+1]+.1,ya[i+2]);}
    const barH=[.7,1.2,1.8,1.1,2.3,1.6,2.6];
    for(let b=0;b<barH.length;b++){
      const h=barH[b];
      const bar=sampleBox(.34,h,.34,1500);
      for(let i=0;i<bar.length;i+=3){pts.push(bar[i]-1.2+b*.44,bar[i+1]-1.2+h/2,bar[i+2]);}
    }
    const tN=1200;
    for(let i=0;i<tN;i++){
      const t=i/tN;
      const x=-1.5+t*3.2;
      const y=-.6+Math.sin(t*2.5)*.25+t*.8;
      pts.push(x+(Math.random()-.5)*.015,y+(Math.random()-.5)*.015,(Math.random()-.5)*.015+.22);
    }
    return pad(pts,PARTICLE_COUNT);
  }

  const shapeGenerators = [genMonitor,genServer,genHub,genCard,genGear,genChart];
  // Generate only first shape immediately; defer rest to reduce TBT
  const shapes = new Array(shapeGenerators.length);
  shapes[0] = shapeGenerators[0]();
  var shapesReady = 1;
  function generateRemainingShapes(){
    for(var s=shapesReady;s<shapeGenerators.length;s++){
      shapes[s]=shapeGenerators[s]();
    }
    shapesReady=shapeGenerators.length;
  }
  (window.requestIdleCallback||function(cb){setTimeout(cb,100)})(generateRemainingShapes);

  const positions = new Float32Array(PARTICLE_COUNT*3);
  const colors = new Float32Array(PARTICLE_COUNT*3);
  const targetFrom = new Float32Array(PARTICLE_COUNT*3);
  const targetTo = new Float32Array(PARTICLE_COUNT*3);
  const disperseDir = new Float32Array(PARTICLE_COUNT*3);

  for(let i=0;i<PARTICLE_COUNT;i++){
    const i3=i*3;
    positions[i3]=shapes[0][i3];positions[i3+1]=shapes[0][i3+1];positions[i3+2]=shapes[0][i3+2];
    targetFrom[i3]=shapes[0][i3];targetFrom[i3+1]=shapes[0][i3+1];targetFrom[i3+2]=shapes[0][i3+2];
    targetTo[i3]=shapes[0][i3];targetTo[i3+1]=shapes[0][i3+1];targetTo[i3+2]=shapes[0][i3+2];
    const c=PALETTE[Math.floor(Math.random()*PALETTE.length)];
    colors[i3]=c.r;colors[i3+1]=c.g;colors[i3+2]=c.b;
    const dx=positions[i3],dy=positions[i3+1],dz=positions[i3+2];
    const len=Math.sqrt(dx*dx+dy*dy+dz*dz)||1;
    disperseDir[i3]=(dx/len)*.5+(Math.random()-.5)*.7;
    disperseDir[i3+1]=(dy/len)*.5+(Math.random()-.5)*.7;
    disperseDir[i3+2]=(dz/len)*.5+(Math.random()-.5)*.7;
  }

  const geom=new THREE.BufferGeometry();
  geom.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geom.setAttribute('color',new THREE.BufferAttribute(colors,3));

  const mat=new THREE.PointsMaterial({size:.038,vertexColors:true,transparent:true,opacity:1,sizeAttenuation:true,depthWrite:false});
  const pointMesh=new THREE.Points(geom,mat);
  worldGroup.add(pointMesh);

  const dustN=1000;
  const dustGeo=new THREE.BufferGeometry();
  const dustPos=new Float32Array(dustN*3);
  const dustCol=new Float32Array(dustN*3);
  for(let i=0;i<dustN;i++){
    const i3=i*3;
    dustPos[i3]=(Math.random()-.5)*18;dustPos[i3+1]=(Math.random()-.5)*14;dustPos[i3+2]=(Math.random()-.5)*18;
    const c=PALETTE[Math.floor(Math.random()*PALETTE.length)];
    dustCol[i3]=c.r;dustCol[i3+1]=c.g;dustCol[i3+2]=c.b;
  }
  dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));
  dustGeo.setAttribute('color',new THREE.BufferAttribute(dustCol,3));
  scene.add(new THREE.Points(dustGeo,new THREE.PointsMaterial({size:.012,vertexColors:true,transparent:true,opacity:.07,sizeAttenuation:true,depthWrite:false})));

  let currentShape=0,morphT=1,morphing=false,hoverAmount=0,isHovered=false,rotY=0,time=0,autoTimer=0;
  const AUTO_INTERVAL=4,MORPH_DURATION=2;
  let morphElapsed=0;

  function goToShape(idx){
    if(idx===currentShape && morphT>=1) return;
    // Generate shape on demand if not yet ready
    if(!shapes[idx]) shapes[idx]=shapeGenerators[idx]();
    const posArr=geom.attributes.position.array;
    const s=shapes[idx];
    for(let i=0;i<PARTICLE_COUNT*3;i++){targetFrom[i]=posArr[i];targetTo[i]=s[i];}
    morphT=0;morphElapsed=0;morphing=true;currentShape=idx;autoTimer=0;
    updateUI(idx);
    for(let i=0;i<PARTICLE_COUNT;i++){
      const i3=i*3;
      const dx=s[i3],dy=s[i3+1],dz=s[i3+2];
      const len=Math.sqrt(dx*dx+dy*dy+dz*dz)||1;
      disperseDir[i3]=(dx/len)*.5+(Math.random()-.5)*.7;
      disperseDir[i3+1]=(dy/len)*.5+(Math.random()-.5)*.7;
      disperseDir[i3+2]=(dz/len)*.5+(Math.random()-.5)*.7;
    }
  }

  function nextShape(){ goToShape((currentShape+1)%services.length); }

  function updateUI(idx){
    document.querySelectorAll('.dot').forEach(function(el,i){ el.classList.toggle('active',i===idx); });
    if (shapeLabelEl) {
      shapeLabelEl.style.opacity = '0';
      setTimeout(function(){ shapeLabelEl.textContent = services[idx].name; shapeLabelEl.style.opacity = '1'; }, 200);
    }
  }

  const raycaster=new THREE.Raycaster();
  const mouse=new THREE.Vector2(-99,-99);
  const hoverSphere=new THREE.Sphere(new THREE.Vector3(-.5,-.2,0),3.5);

  renderer.domElement.addEventListener('mousemove',function(e){
    const rect=renderer.domElement.getBoundingClientRect();
    mouse.x=((e.clientX-rect.left)/rect.width)*2-1;
    mouse.y=-((e.clientY-rect.top)/rect.height)*2+1;
  });
  renderer.domElement.addEventListener('mouseleave',function(){
    mouse.set(-99,-99);
    isHovered=false;
  });
  renderer.domElement.addEventListener('click',function(){ nextShape(); });
  renderer.domElement.addEventListener('touchend',function(){ nextShape(); });

  function checkHover(){
    raycaster.setFromCamera(mouse,camera);
    isHovered=raycaster.ray.intersectsSphere(hoverSphere);
    renderer.domElement.style.cursor=isHovered?'pointer':'default';
  }

  function easeInOutCubic(t){ return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; }

  let lastTime=performance.now();

  function animate(now){
    requestAnimationFrame(animate);
    const dt=Math.min((now-lastTime)/1000,.05);
    lastTime=now;
    time+=dt;
    checkHover();
    if(!morphing){ autoTimer+=dt; if(autoTimer>=AUTO_INTERVAL) nextShape(); }
    if(morphing){ morphElapsed+=dt; morphT=Math.min(morphElapsed/MORPH_DURATION,1); if(morphT>=1) morphing=false; }
    const ease=easeInOutCubic(morphT);
    const hoverTarget=isHovered?1:0;
    const hoverSpeed=isHovered?4.5:14;
    hoverAmount+=(hoverTarget-hoverAmount)*dt*hoverSpeed;
    if(!isHovered && hoverAmount<0.01) hoverAmount=0;
    const rotSpeed=isHovered?.3:.12;
    rotY+=rotSpeed*dt;
    pointMesh.rotation.y=rotY;
    pointMesh.position.y=Math.sin(time*.5)*.04;
    const posArr=geom.attributes.position.array;
    for(let i=0;i<PARTICLE_COUNT;i++){
      const i3=i*3;
      const fx=targetFrom[i3],fy=targetFrom[i3+1],fz=targetFrom[i3+2];
      const tx=targetTo[i3],ty=targetTo[i3+1],tz=targetTo[i3+2];
      const bx=fx+(tx-fx)*ease,by=fy+(ty-fy)*ease,bz=fz+(tz-fz)*ease;
      const hd=hoverAmount*.6;
      posArr[i3]=bx+disperseDir[i3]*hd;
      posArr[i3+1]=by+disperseDir[i3+1]*hd;
      posArr[i3+2]=bz+disperseDir[i3+2]*hd;
    }
    geom.attributes.position.needsUpdate=true;
    mat.opacity=1-hoverAmount*.25;
    mat.size=.038+hoverAmount*.008;
    renderer.render(scene,camera);
  }

  animate(performance.now());

  window.addEventListener('resize',function(){
    const w = container.clientWidth;
    const h = container.clientHeight || 1;
    aspect = w / h;
    camera.left=-frustum*aspect;camera.right=frustum*aspect;
    camera.top=frustum;camera.bottom=-frustum;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();
