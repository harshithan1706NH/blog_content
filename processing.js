/**
 * Video Blog Content - Simulated Video Processing Pipeline
 * Demonstrates 5-stage workflow with real-time percentage progression.
 */

document.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.getElementById('processing-progress-bar');
  const percentageText = document.getElementById('processing-percentage-text');
  const completedSection = document.getElementById('processing-completed-section');
  const viewBlogBtn = document.getElementById('view-blog-btn');
  const videoNameLabel = document.getElementById('processing-video-name');

  const steps = [
    { id: 'step-video-selected', label: 'Video Selected', threshold: 15 },
    { id: 'step-audio-extraction', label: 'Audio Extraction', threshold: 40 },
    { id: 'step-speech-recognition', label: 'Speech Recognition', threshold: 65 },
    { id: 'step-transcript-processing', label: 'Transcript Processing', threshold: 88 },
    { id: 'step-blog-generation', label: 'Video Blog Content Generation', threshold: 100 }
  ];

  const tempVideo = VideoBlogStore.getTempUploadedVideo() || {
    name: 'uploaded-presentation.mp4',
    size: '18.4 MB',
    duration: '08:45',
    uploadedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  };

  if (videoNameLabel) {
    videoNameLabel.textContent = `Source: ${tempVideo.name}`;
  }

  let currentPercent = 0;
  const targetDurationMs = 3800; // total animation time ~3.8 seconds
  const intervalMs = 60;
  const incrementStep = 100 / (targetDurationMs / intervalMs);

  function updateStepsState(percent) {
    steps.forEach((step, index) => {
      const stepEl = document.getElementById(step.id);
      if (!stepEl) return;

      const iconEl = stepEl.querySelector('.step-icon-state');

      if (percent >= step.threshold) {
        stepEl.className = 'processing-step-item completed';
        if (iconEl) iconEl.innerHTML = '✓';
      } else if (index === 0 || percent >= steps[index - 1].threshold) {
        stepEl.className = 'processing-step-item active';
        if (iconEl) iconEl.innerHTML = '●';
      } else {
        stepEl.className = 'processing-step-item';
        if (iconEl) iconEl.innerHTML = '○';
      }
    });
  }

  function completeProcessing() {
    if (progressBar) progressBar.style.width = '100%';
    if (percentageText) {
      percentageText.textContent = 'Processing Complete (100%)';
      percentageText.style.color = 'var(--color-success)';
    }

    // Set all steps to completed
    steps.forEach(step => {
      const stepEl = document.getElementById(step.id);
      if (stepEl) {
        stepEl.className = 'processing-step-item completed';
        const iconEl = stepEl.querySelector('.step-icon-state');
        if (iconEl) iconEl.innerHTML = '✓';
      }
    });

    // Create newly generated mock blog in store
    const newBlogId = 'blog-' + Date.now();
    const cleanTitle = tempVideo.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const formattedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    const newBlog = {
      id: newBlogId,
      title: formattedTitle || 'Automated Video Blog Content & Knowledge Guide',
      sourceVideo: tempVideo.name,
      date: tempVideo.uploadedAt,
      status: 'Completed',
      intro: `This video blog article was automatically synthesized from the video recording "${tempVideo.name}". It extracts key architectural concepts, workflow demonstrations, and core takeaways discussed throughout the session.`,
      sections: [
        {
          heading: 'Core Concepts and Conceptual Architecture',
          content: 'The presentation begins by outlining essential theoretical principles and core architectural workflows. It demonstrates how disparate systems integrate efficiently through well-defined interfaces, reducing operational friction and improving overall reliability.'
        },
        {
          heading: 'Implementation Strategies and Best Practices',
          content: 'The second portion of the video demonstrates practical execution steps. Emphasis is placed on structured data flow, modular component design, and automated validation checkpoints to ensure robustness across diverse runtime environments.'
        }
      ],
      importantPoints: [
        'Automated speech recognition and language modeling enable rapid knowledge extraction.',
        'High-density technical videos can be converted into readable, structured summaries.',
        'Key discussion topics are organized hierarchically with clear headings.',
        'Actionable conclusions provide immediate value for asynchronous review.'
      ],
      conclusion: 'In summary, translating recorded audio-visual knowledge into clean written video blog content provides an accessible reference for teams and readers. Continued application of these structured methods maximizes content reach and retention.'
    };

    VideoBlogStore.saveBlog(newBlog);
    VideoBlogStore.setCurrentBlogId(newBlogId);

    // Show completion section
    if (completedSection) {
      completedSection.style.display = 'block';
    }
  }

  // Run progress simulation
  const progressTimer = setInterval(() => {
    currentPercent += incrementStep + (Math.random() * 2 - 1);
    if (currentPercent >= 100) {
      currentPercent = 100;
      clearInterval(progressTimer);
      completeProcessing();
    } else {
      if (progressBar) progressBar.style.width = `${Math.round(currentPercent)}%`;
      if (percentageText) percentageText.textContent = `Processing... ${Math.round(currentPercent)}%`;
      updateStepsState(currentPercent);
    }
  }, intervalMs);

  if (viewBlogBtn) {
    viewBlogBtn.addEventListener('click', () => {
      window.location.href = 'blog.html';
    });
  }
});
