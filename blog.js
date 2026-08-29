/**
 * Video Blog Content - Blog Viewer, Editor, and Management Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Helper to extract query parameters
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const blogId = getQueryParam('id') || VideoBlogStore.getCurrentBlogId();
  const currentBlog = VideoBlogStore.getBlogById(blogId);

  // ==========================================
  // 1. GENERATED BLOG VIEWER (blog.html)
  // ==========================================
  const blogViewContainer = document.getElementById('blog-view-container');
  if (blogViewContainer && currentBlog) {
    VideoBlogStore.setCurrentBlogId(currentBlog.id);

    const titleEl = document.getElementById('blog-display-title');
    const sourceEl = document.getElementById('blog-display-source');
    const dateEl = document.getElementById('blog-display-date');
    const introEl = document.getElementById('blog-display-intro');
    const sectionsContainer = document.getElementById('blog-display-sections');
    const pointsContainer = document.getElementById('blog-display-points');
    const conclusionEl = document.getElementById('blog-display-conclusion');

    if (titleEl) titleEl.textContent = currentBlog.title;
    if (sourceEl) sourceEl.textContent = `Source: ${currentBlog.sourceVideo}`;
    if (dateEl) dateEl.textContent = currentBlog.date;
    if (introEl) introEl.textContent = currentBlog.intro;

    if (sectionsContainer && currentBlog.sections) {
      sectionsContainer.innerHTML = currentBlog.sections.map((sec, idx) => `
        <div class="article-section">
          <h3 class="article-section-title">${sec.heading}</h3>
          <p>${sec.content}</p>
        </div>
      `).join('');
    }

    if (pointsContainer && currentBlog.importantPoints) {
      pointsContainer.innerHTML = currentBlog.importantPoints.map(point => `
        <li>${point}</li>
      `).join('');
    }

    if (conclusionEl) conclusionEl.textContent = currentBlog.conclusion;

    // Action button listeners
    const editBtn = document.getElementById('btn-edit-blog');
    const saveBtn = document.getElementById('btn-save-blog');
    const pdfBtn = document.getElementById('btn-download-pdf');
    const docxBtn = document.getElementById('btn-download-docx');

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        window.location.href = `edit-blog.html?id=${currentBlog.id}`;
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        showToast('Video blog content saved successfully.', 'success');
      });
    }

    if (pdfBtn) {
      pdfBtn.addEventListener('click', () => {
        showToast(`Preparing PDF export for "${currentBlog.title}"...`, 'info');
        setTimeout(() => {
          showToast('PDF download initiated.', 'success');
        }, 1200);
      });
    }

    if (docxBtn) {
      docxBtn.addEventListener('click', () => {
        showToast(`Preparing DOCX export for "${currentBlog.title}"...`, 'info');
        setTimeout(() => {
          showToast('DOCX download initiated.', 'success');
        }, 1200);
      });
    }
  }

  // ==========================================
  // 2. BLOG EDITOR (edit-blog.html)
  // ==========================================
  const editBlogForm = document.getElementById('edit-blog-form');
  if (editBlogForm && currentBlog) {
    const editTitleInput = document.getElementById('edit-title');
    const editIntroInput = document.getElementById('edit-intro');
    const editSectionsContainer = document.getElementById('edit-sections-wrapper');
    const editPointsInput = document.getElementById('edit-points');
    const editConclusionInput = document.getElementById('edit-conclusion');
    const addSectionBtn = document.getElementById('btn-add-section');
    const cancelBtn = document.getElementById('btn-cancel-edit');

    if (editTitleInput) editTitleInput.value = currentBlog.title || '';
    if (editIntroInput) editIntroInput.value = currentBlog.intro || '';
    if (editConclusionInput) editConclusionInput.value = currentBlog.conclusion || '';
    if (editPointsInput) {
      editPointsInput.value = (currentBlog.importantPoints || []).join('\n');
    }

    function renderSectionEditors(sections) {
      if (!editSectionsContainer) return;
      editSectionsContainer.innerHTML = '';

      sections.forEach((sec, idx) => {
        const item = document.createElement('div');
        item.className = 'section-editor-item';
        item.innerHTML = `
          <div class="section-editor-header">
            <h4>Section #${idx + 1}</h4>
            ${sections.length > 1 ? `<button type="button" class="btn btn-sm btn-danger-outline remove-section-btn" data-index="${idx}">Remove</button>` : ''}
          </div>
          <div class="form-group">
            <label class="form-label">Section Heading</label>
            <input type="text" class="form-control section-heading-input" value="${sec.heading.replace(/"/g, '&quot;')}" required />
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Section Content</label>
            <textarea class="form-control section-content-input" rows="4" required>${sec.content}</textarea>
          </div>
        `;
        editSectionsContainer.appendChild(item);
      });

      // Attach remove button handlers
      const removeButtons = editSectionsContainer.querySelectorAll('.remove-section-btn');
      removeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const indexToRemove = parseInt(e.target.getAttribute('data-index'), 10);
          currentBlog.sections.splice(indexToRemove, 1);
          renderSectionEditors(currentBlog.sections);
        });
      });
    }

    if (currentBlog.sections) {
      renderSectionEditors(currentBlog.sections);
    }

    if (addSectionBtn) {
      addSectionBtn.addEventListener('click', () => {
        currentBlog.sections.push({
          heading: `New Section ${currentBlog.sections.length + 1}`,
          content: 'Add detailed section information here.'
        });
        renderSectionEditors(currentBlog.sections);
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        window.location.href = `blog.html?id=${currentBlog.id}`;
      });
    }

    editBlogForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather sections
      const headingInputs = editSectionsContainer.querySelectorAll('.section-heading-input');
      const contentInputs = editSectionsContainer.querySelectorAll('.section-content-input');
      const updatedSections = [];

      for (let i = 0; i < headingInputs.length; i++) {
        updatedSections.push({
          heading: headingInputs[i].value.trim() || `Section ${i + 1}`,
          content: contentInputs[i].value.trim() || ''
        });
      }

      // Gather points
      const rawPoints = editPointsInput.value.split('\n').map(p => p.trim()).filter(p => p.length > 0);

      const updatedBlog = {
        ...currentBlog,
        title: editTitleInput.value.trim() || 'Untitled Video Blog',
        intro: editIntroInput.value.trim() || '',
        sections: updatedSections,
        importantPoints: rawPoints,
        conclusion: editConclusionInput.value.trim() || ''
      };

      VideoBlogStore.saveBlog(updatedBlog);
      VideoBlogStore.setCurrentBlogId(updatedBlog.id);

      sessionStorage.setItem('videoblog_flash_msg', JSON.stringify({
        text: 'Video blog content updated successfully.',
        type: 'success'
      }));

      window.location.href = `blog.html?id=${updatedBlog.id}`;
    });
  }

  // ==========================================
  // 3. MY BLOGS PAGE (my-blogs.html)
  // ==========================================
  const myBlogsList = document.getElementById('my-blogs-grid');
  const emptyBlogsState = document.getElementById('empty-my-blogs');

  function renderMyBlogs() {
    if (!myBlogsList) return;
    const blogs = VideoBlogStore.getBlogs();

    if (!blogs || blogs.length === 0) {
      myBlogsList.style.display = 'none';
      if (emptyBlogsState) emptyBlogsState.style.display = 'block';
      return;
    }

    if (emptyBlogsState) emptyBlogsState.style.display = 'none';
    myBlogsList.style.display = 'flex';

    myBlogsList.innerHTML = blogs.map(b => `
      <div class="blog-item-card" id="card-${b.id}">
        <div class="blog-item-info">
          <h3 class="blog-item-title">${b.title}</h3>
          <div class="blog-item-meta">
            <span>🎥 <strong>Source:</strong> ${b.sourceVideo}</span>
            <span>📅 <strong>Date:</strong> ${b.date}</span>
            <span><span class="badge badge-success"><span class="badge-dot"></span>${b.status}</span></span>
          </div>
        </div>
        <div class="blog-item-actions">
          <a href="blog.html?id=${b.id}" class="btn btn-sm btn-outline">View</a>
          <a href="edit-blog.html?id=${b.id}" class="btn btn-sm btn-secondary">Edit</a>
          <button type="button" class="btn btn-sm btn-danger-outline delete-blog-btn" data-id="${b.id}" data-title="${b.title.replace(/"/g, '&quot;')}">Delete</button>
        </div>
      </div>
    `).join('');

    // Attach delete listeners with confirm popup modal
    const deleteButtons = myBlogsList.querySelectorAll('.delete-blog-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');

        showConfirmModal({
          title: 'Delete Video Blog',
          message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          onConfirm: () => {
            VideoBlogStore.deleteBlog(id);
            showToast('Video blog deleted successfully.', 'success');
            renderMyBlogs();
          }
        });
      });
    });
  }

  if (myBlogsList) {
    renderMyBlogs();
  }
});
