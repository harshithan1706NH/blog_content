/**
 * Video Blog Content - Video Upload Logic & Frontend Validation
 * Checks: File selected, MP4 format, and maximum duration of 30 minutes.
 */

document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('video-file-input');
  const browseBtn = document.getElementById('browse-video-btn');
  const errorAlert = document.getElementById('upload-error-alert');
  const errorMessage = document.getElementById('upload-error-text');

  const previewCard = document.getElementById('file-preview-card');
  const previewVideo = document.getElementById('video-preview-player');
  const fileNameDisplay = document.getElementById('preview-file-name');
  const fileSizeDisplay = document.getElementById('preview-file-size');
  const fileDurationDisplay = document.getElementById('preview-file-duration');
  const removeVideoBtn = document.getElementById('remove-video-btn');
  const startProcessingBtn = document.getElementById('start-processing-btn');

  let currentVideoFile = null;
  let currentVideoDuration = 0;
  let currentObjectUrl = null;

  // Format file size nicely
  function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat(
      (bytes / Math.pow(k, i)).toFixed(dm)
    )} ${sizes[i]}`;
  }

  // Format seconds to mm:ss
  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function showError(msg) {
    if (errorMessage && errorAlert) {
      errorMessage.textContent = msg;
      errorAlert.style.display = 'flex';

      errorAlert.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }

  function hideError() {
    if (errorAlert) {
      errorAlert.style.display = 'none';
    }
  }

  function resetUpload() {
    currentVideoFile = null;
    currentVideoDuration = 0;

    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }

    if (fileInput) {
      fileInput.value = '';
    }

    if (previewCard) {
      previewCard.style.display = 'none';
    }

    if (dropzone) {
      dropzone.style.display = 'block';
    }

    if (previewVideo) {
      previewVideo.removeAttribute('src');
      previewVideo.load();
    }

    hideError();
  }

  // Handle selected file validation
  function handleFile(file) {
    hideError();

    if (!file) {
      return;
    }

    // 1. Validate MP4 format
    const isMp4 =
      file.type === 'video/mp4' ||
      file.name.toLowerCase().endsWith('.mp4');

    if (!isMp4) {
      showError('Only MP4 videos are supported.');
      return;
    }

    // Load video metadata to validate duration
    const tempVideo = document.createElement('video');

    tempVideo.preload = 'metadata';

    const objectUrl = URL.createObjectURL(file);

    tempVideo.onloadedmetadata = function () {
      const duration = tempVideo.duration;

      const MAX_DURATION_SECONDS = 30 * 60;

      if (duration > MAX_DURATION_SECONDS) {
        URL.revokeObjectURL(objectUrl);

        showError(
          'Video duration must not exceed 30 minutes.'
        );

        return;
      }

      // Valid file
      currentVideoFile = file;
      currentVideoDuration = duration;
      currentObjectUrl = objectUrl;

      // Update UI preview
      if (fileNameDisplay) {
        fileNameDisplay.textContent = file.name;
      }

      if (fileSizeDisplay) {
        fileSizeDisplay.textContent = formatBytes(file.size);
      }

      if (fileDurationDisplay) {
        fileDurationDisplay.textContent =
          `Duration: ${formatDuration(duration)}`;
      }

      if (previewVideo) {
        previewVideo.src = objectUrl;
      }

      if (dropzone) {
        dropzone.style.display = 'none';
      }

      if (previewCard) {
        previewCard.style.display = 'block';
      }
    };

    tempVideo.onerror = function () {
      URL.revokeObjectURL(objectUrl);

      showError(
        'Could not read the video file. Please select a valid MP4 video.'
      );
    };

    tempVideo.src = objectUrl;
  }

  // Browse button
  if (browseBtn && fileInput) {
    browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  // File input
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (
        e.target.files &&
        e.target.files.length > 0
      ) {
        handleFile(e.target.files[0]);
      }
    });
  }

  // Drag and Drop
  if (dropzone) {

    dropzone.addEventListener('click', () => {
      if (fileInput) {
        fileInput.click();
      }
    });

    ['dragenter', 'dragover'].forEach(eventName => {

      dropzone.addEventListener(eventName, (e) => {

        e.preventDefault();
        e.stopPropagation();

        dropzone.classList.add('drag-over');

      });

    });

    ['dragleave', 'drop'].forEach(eventName => {

      dropzone.addEventListener(eventName, (e) => {

        e.preventDefault();
        e.stopPropagation();

        dropzone.classList.remove('drag-over');

      });

    });

    dropzone.addEventListener('drop', (e) => {

      if (
        e.dataTransfer &&
        e.dataTransfer.files &&
        e.dataTransfer.files.length > 0
      ) {

        handleFile(
          e.dataTransfer.files[0]
        );

      }

    });
  }

  // Remove video button
  if (removeVideoBtn) {
    removeVideoBtn.addEventListener(
      'click',
      resetUpload
    );
  }

  // Start Processing Button
  if (startProcessingBtn) {

    startProcessingBtn.addEventListener(
      'click',
      async () => {

        if (!currentVideoFile) {

          showError(
            'Please select an MP4 video to continue.'
          );

          return;
        }

        // Disable button while uploading
        startProcessingBtn.disabled = true;
        startProcessingBtn.textContent = 'Uploading...';

        hideError();

        try {

          // Create multipart/form-data
          const formData = new FormData();

          // IMPORTANT:
          // "video" must match Flask's request.files["video"]
          formData.append(
            'video',
            currentVideoFile
          );

          // Send video to Flask backend
          const response = await fetch(
            'http://127.0.0.1:5000/upload',
            {
              method: 'POST',
              body: formData
            }
          );

          // Convert Flask JSON response
          const result = await response.json();

          // Handle backend failure
          if (
            !response.ok ||
            !result.success
          ) {

            throw new Error(
              result.message ||
              'Video upload failed.'
            );
          }

          // Store backend response
          // in sessionStorage through VideoBlogStore
          VideoBlogStore.setTempUploadedVideo({

            name: result.filename,

            size: formatBytes(
              currentVideoFile.size
            ),

            duration: result.duration_seconds,

            public_id: result.public_id,

            video_url: result.video_url,

            audio_file: result.audio_file,

            uploadedAt:
              new Date().toLocaleDateString(
                'en-GB',
                {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }
              )

          });

          // Move to processing page
          window.location.href =
            'processing.html';

        } catch (error) {

          console.error(
            'Video upload error:',
            error
          );

          showError(
            error.message ||
            'Could not upload the video.'
          );

          // Re-enable button
          startProcessingBtn.disabled = false;

          startProcessingBtn.textContent =
            'Start Processing →';
        }

      }
    );

  }

});