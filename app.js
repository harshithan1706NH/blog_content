/**
 * Video Blog Content - Global Shared Utilities & Mock Store
 * Vanilla JavaScript implementation for Frontend Prototype
 */

const DEFAULT_SAMPLE_BLOGS = [
  {
    id: 'blog-1',
    title: 'Introduction to Artificial Intelligence',
    sourceVideo: 'ai-introduction.mp4',
    date: '27 August 2026',
    status: 'Completed',
    intro: 'Artificial Intelligence (AI) has rapidly transformed from a speculative science fiction concept into a cornerstone of modern digital technology. From recommendation algorithms to autonomous systems, AI is reshaping how we work, communicate, and solve complex problems.',
    sections: [
      {
        heading: 'What is Artificial Intelligence?',
        content: 'At its core, Artificial Intelligence refers to computational systems capable of performing tasks that typically require human cognition. These tasks include visual perception, speech recognition, decision-making, and natural language translation. Rather than relying solely on rigid, rule-based instructions, modern AI leverages statistical patterns and feedback loops.'
      },
      {
        heading: 'Key Subfields of AI',
        content: 'The landscape of AI encompasses several specialized domains: Machine Learning (ML), where systems learn from historical datasets; Deep Learning (DL), utilizing multi-layered neural networks; Natural Language Processing (NLP) for human language comprehension; and Computer Vision for image understanding.'
      }
    ],
    importantPoints: [
      'AI systems learn representations from data rather than static hard-coded rule sets.',
      'Machine Learning and Deep Learning are specialized, foundational subfields within AI.',
      'Real-world applications span healthcare diagnostics, financial forecasting, and automated content generation.',
      'Ethical considerations regarding algorithmic fairness and data governance remain paramount.'
    ],
    conclusion: 'As AI technology continues to mature, its integration into everyday workflows will deepen. Understanding its foundational principles is essential for builders, creators, and leaders across every sector.'
  },
  {
    id: 'blog-2',
    title: 'Web Development Basics',
    sourceVideo: 'web-dev-basics.mp4',
    date: '24 August 2026',
    status: 'Completed',
    intro: 'Building modern web experiences requires a solid grasp of web standards, responsive design principles, and client-side architecture. Understanding the interplay of foundational technologies is key to crafting accessible and resilient applications.',
    sections: [
      {
        heading: 'The Core Web Trio: HTML, CSS, and JavaScript',
        content: 'HTML provides the semantic skeleton and accessibility landmarks. CSS defines visual aesthetics, typography, and responsive grid layouts. JavaScript injects dynamic client-side interactivity, state management, and asynchronous network coordination.'
      },
      {
        heading: 'Responsive & Mobile-First Principles',
        content: 'With mobile devices accounting for over half of global web traffic, adopting mobile-first fluid grids, flexible media, and CSS media queries ensures seamless viewing experiences across all viewport sizes.'
      }
    ],
    importantPoints: [
      'Semantic HTML improves accessibility, screen-reader support, and SEO indexing.',
      'Modern CSS Flexbox and Grid provide powerful tools for two-dimensional responsive layouts.',
      'Vanilla JavaScript can accomplish complex user interactions without heavy runtime overhead.'
    ],
    conclusion: 'Mastering the core building blocks of the web creates a robust foundation for adopting advanced frameworks and building scalable applications.'
  },
  {
    id: 'blog-3',
    title: 'Machine Learning Fundamentals',
    sourceVideo: 'ml-fundamentals.mp4',
    date: '20 August 2026',
    status: 'Completed',
    intro: 'Machine Learning empowers computer algorithms to extract knowledge from historical observations and make accurate inferences on unseen data without explicit task-specific programming.',
    sections: [
      {
        heading: 'Supervised vs. Unsupervised Learning',
        content: 'Supervised learning relies on labeled input-output pairs to optimize predictive accuracy (e.g., classification and regression). Unsupervised learning discovers latent patterns, groupings, and clusters in unlabeled datasets.'
      },
      {
        heading: 'Model Evaluation & Generalization',
        content: 'Preventing overfitting through cross-validation, regularization, and separate testing datasets is critical to producing models that generalize effectively to real-world production environments.'
      }
    ],
    importantPoints: [
      'Data preparation and feature engineering represent the majority of real-world ML engineering.',
      'Model performance must be balanced against interpretability and computational latency.',
      'Continuous production monitoring is essential to detect data drift and model degradation.'
    ],
    conclusion: 'Machine learning is an iterative engineering discipline that bridges statistical theory with practical software engineering.'
  }
];

const DEFAULT_USER = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  isLoggedIn: true
};

// Storage keys
const STORAGE_KEYS = {
  BLOGS: 'videoblog_blogs',
  USER: 'videoblog_user',
  TEMP_VIDEO: 'videoblog_temp_video',
  CURRENT_BLOG_ID: 'videoblog_current_blog_id'
};

// Data Store Layer
const VideoBlogStore = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.BLOGS)) {
      localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(DEFAULT_SAMPLE_BLOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    }
  },

  getBlogs() {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BLOGS);
      return data ? JSON.parse(data) : DEFAULT_SAMPLE_BLOGS;
    } catch (e) {
      console.error('Error reading blogs from storage', e);
      return DEFAULT_SAMPLE_BLOGS;
    }
  },

  getBlogById(id) {
    const blogs = this.getBlogs();
    return blogs.find(b => b.id === id) || blogs[0];
  },

  saveBlog(blog) {
    const blogs = this.getBlogs();
    const existingIndex = blogs.findIndex(b => b.id === blog.id);
    if (existingIndex >= 0) {
      blogs[existingIndex] = blog;
    } else {
      blogs.unshift(blog);
    }
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
    return blog;
  },

  deleteBlog(id) {
    let blogs = this.getBlogs();
    blogs = blogs.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
    return blogs;
  },

  getUser() {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch (e) {
      return DEFAULT_USER;
    }
  },

  updateUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  setTempUploadedVideo(videoData) {
    sessionStorage.setItem(STORAGE_KEYS.TEMP_VIDEO, JSON.stringify(videoData));
  },

  getTempUploadedVideo() {
    const data = sessionStorage.getItem(STORAGE_KEYS.TEMP_VIDEO);
    return data ? JSON.parse(data) : null;
  },

  setCurrentBlogId(id) {
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_BLOG_ID, id);
  },

  getCurrentBlogId() {
    return sessionStorage.getItem(STORAGE_KEYS.CURRENT_BLOG_ID) || 'blog-1';
  }
};

// UI Notification (Toast) System
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  
  let icon = '✓';
  if (type === 'error') icon = '✕';
  if (type === 'info') icon = 'ℹ';

  toast.innerHTML = `
    <span style="font-weight: bold;">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3500);
}

// Confirmation Modal Dialog System
function showConfirmModal({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm }) {
  let modal = document.getElementById('global-confirm-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'global-confirm-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-box">
        <h3 class="modal-title" id="modal-title-text">Confirm Action</h3>
        <p class="modal-body" id="modal-body-text">Are you sure?</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
          <button type="button" class="btn btn-danger" id="modal-confirm-btn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const titleEl = document.getElementById('modal-title-text');
  const bodyEl = document.getElementById('modal-body-text');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const confirmBtn = document.getElementById('modal-confirm-btn');

  titleEl.textContent = title || 'Confirm Action';
  bodyEl.textContent = message || 'Are you sure you want to proceed?';
  confirmBtn.textContent = confirmText;
  cancelBtn.textContent = cancelText;

  const closeModal = () => {
    modal.classList.remove('open');
  };

  cancelBtn.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  confirmBtn.onclick = () => {
    closeModal();
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  };

  modal.classList.add('open');
}

// Shared Navigation & Header initialization
document.addEventListener('DOMContentLoaded', () => {
  VideoBlogStore.init();

  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Active navigation highlight
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.nav-link');
  navItems.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Check and display stored flash message if any
  const flashMessage = sessionStorage.getItem('videoblog_flash_msg');
  if (flashMessage) {
    try {
      const parsed = JSON.parse(flashMessage);
      showToast(parsed.text, parsed.type || 'success');
    } catch (e) {
      showToast(flashMessage, 'success');
    }
    sessionStorage.removeItem('videoblog_flash_msg');
  }
});
