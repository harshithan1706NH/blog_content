const fileInput = document.getElementById("video-file-input");
const browseBtn = document.getElementById("browse-video-btn");
const dropzone = document.getElementById("upload-dropzone");

const previewCard = document.getElementById("file-preview-card");
const previewName = document.getElementById("preview-file-name");
const previewSize = document.getElementById("preview-file-size");
const previewPlayer = document.getElementById("video-preview-player");

const removeBtn = document.getElementById("remove-video-btn");
const processBtn = document.getElementById("start-processing-btn");

const errorAlert = document.getElementById("upload-error-alert");
const errorText = document.getElementById("upload-error-text");

let selectedVideo = null;


// Choose Video button
browseBtn.addEventListener("click", function () {
    fileInput.click();
});


// File selected
fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
        handleVideo(fileInput.files[0]);
    }
});


// Handle selected video
function handleVideo(file) {

    errorAlert.style.display = "none";

    // Check MP4
    if (!file.name.toLowerCase().endsWith(".mp4")) {
        showError("Only MP4 videos are supported.");
        return;
    }

    selectedVideo = file;

    // Show file information
    previewName.textContent = file.name;
    previewSize.textContent =
        (file.size / (1024 * 1024)).toFixed(2) + " MB";

    // Show video preview
    previewPlayer.src = URL.createObjectURL(file);

    dropzone.style.display = "none";
    previewCard.style.display = "block";
}


// Remove video
removeBtn.addEventListener("click", function () {

    selectedVideo = null;

    previewPlayer.src = "";
    fileInput.value = "";

    previewCard.style.display = "none";
    dropzone.style.display = "block";

    errorAlert.style.display = "none";
});


// Start Processing
processBtn.addEventListener("click", async function () {

    if (!selectedVideo) {
        showError("Please select a video first.");
        return;
    }

    processBtn.disabled = true;
    processBtn.textContent = "Uploading...";

    const formData = new FormData();

    formData.append("video", selectedVideo);

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (data.success) {

            alert(
                "Video uploaded successfully!\n\n" +
                "Video ID: " + data.video_id + "\n" +
                "Filename: " + data.filename
            );

            console.log("Backend response:", data);

      } else {

    showError(
        data.error || data.message || "Video processing failed"
    );

    console.error("Backend error:", data);

}

    } catch (error) {

        console.error(error);

        showError(
            "Could not connect to the Flask backend. " +
            "Make sure app.py is running."
        );

    } finally {

        processBtn.disabled = false;
        processBtn.textContent = "Start Processing →";
    }
});


// Show error
function showError(message) {

    errorText.textContent = message;
    errorAlert.style.display = "flex";
}