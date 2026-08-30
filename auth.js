/**
 * Video Blog Content - Authentication & Profile Frontend Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Helper for input validation error display
  function setError(inputElement, errorElement, message) {
    if (!inputElement || !errorElement) return;
    inputElement.classList.add('is-invalid');
    errorElement.textContent = message;
    errorElement.classList.add('visible');
  }

  function clearError(inputElement, errorElement) {
    if (!inputElement || !errorElement) return;
    inputElement.classList.remove('is-invalid');
    errorElement.textContent = '';
    errorElement.classList.remove('visible');
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // 1. REGISTER FORM LOGIC
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');
    const confirmPasswordInput = document.getElementById('reg-confirm-password');

    const nameError = document.getElementById('reg-name-error');
    const emailError = document.getElementById('reg-email-error');
    const passwordError = document.getElementById('reg-password-error');
    const confirmPasswordError = document.getElementById('reg-confirm-password-error');

    // Real-time input cleaning
    [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          input.classList.remove('is-invalid');
          const err = document.getElementById(`${input.id}-error`);
          if (err) err.classList.remove('visible');
        });
      }
    });

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim()) {
        setError(nameInput, nameError, 'Name is required.');
        isValid = false;
      } else {
        clearError(nameInput, nameError);
      }

      // Validate Email
      if (!emailInput.value.trim()) {
        setError(emailInput, emailError, 'Email address is required.');
        isValid = false;
      } else if (!isValidEmail(emailInput.value.trim())) {
        setError(emailInput, emailError, 'Please enter a valid email address.');
        isValid = false;
      } else {
        clearError(emailInput, emailError);
      }

      // Validate Password
      if (!passwordInput.value) {
        setError(passwordInput, passwordError, 'Password is required.');
        isValid = false;
      } else if (passwordInput.value.length < 6) {
        setError(passwordInput, passwordError, 'Password must be at least 6 characters long.');
        isValid = false;
      } else {
        clearError(passwordInput, passwordError);
      }

      // Validate Confirm Password
      if (!confirmPasswordInput.value) {
        setError(confirmPasswordInput, confirmPasswordError, 'Please confirm your password.');
        isValid = false;
      } else if (passwordInput.value !== confirmPasswordInput.value) {
        setError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match.');
        isValid = false;
      } else {
        clearError(confirmPasswordInput, confirmPasswordError);
      }

      if (isValid) {
        // Save mock registered user
        const userData = {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          isLoggedIn: false
        };
        VideoBlogStore.updateUser(userData);

        // Flash message and redirect to login
        sessionStorage.setItem('videoblog_flash_msg', JSON.stringify({
          text: 'Registration successful. Please login.',
          type: 'success'
        }));
        window.location.href = 'login.html';
      }
    });
  }

  // 2. LOGIN FORM LOGIC
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const emailError = document.getElementById('login-email-error');
    const passwordError = document.getElementById('login-password-error');

    [emailInput, passwordInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          input.classList.remove('is-invalid');
          const err = document.getElementById(`${input.id}-error`);
          if (err) err.classList.remove('visible');
        });
      }
    });

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate Email
      if (!emailInput.value.trim()) {
        setError(emailInput, emailError, 'Email address is required.');
        isValid = false;
      } else if (!isValidEmail(emailInput.value.trim())) {
        setError(emailInput, emailError, 'Please enter a valid email address.');
        isValid = false;
      } else {
        clearError(emailInput, emailError);
      }

      // Validate Password
      if (!passwordInput.value) {
        setError(passwordInput, passwordError, 'Password is required.');
        isValid = false;
      } else {
        clearError(passwordInput, passwordError);
      }

      if (isValid) {
        // Update user loggedIn state
        const existingUser = VideoBlogStore.getUser();
        VideoBlogStore.updateUser({
          ...existingUser,
          email: emailInput.value.trim(),
          isLoggedIn: true
        });

        // Flash message and redirect to dashboard
        sessionStorage.setItem('videoblog_flash_msg', JSON.stringify({
          text: 'Welcome to your Video Blog Content Dashboard!',
          type: 'success'
        }));
        window.location.href = 'dashboard.html';
      }
    });
  }

  // 3. PROFILE PAGE LOGIC
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const editBtn = document.getElementById('profile-edit-btn');
    const saveBtn = document.getElementById('profile-save-btn');
    const logoutBtn = document.getElementById('profile-logout-btn');

    // Populate profile from store
    const user = VideoBlogStore.getUser();
    if (nameInput) nameInput.value = user.name || 'Alex Johnson';
    if (emailInput) emailInput.value = user.email || 'alex.johnson@example.com';

    let isEditing = false;

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        isEditing = !isEditing;
        if (isEditing) {
          nameInput.removeAttribute('readonly');
          emailInput.removeAttribute('readonly');
          nameInput.focus();
          editBtn.textContent = 'Cancel Edit';
          saveBtn.removeAttribute('disabled');
        } else {
          nameInput.setAttribute('readonly', true);
          emailInput.setAttribute('readonly', true);
          nameInput.value = user.name;
          emailInput.value = user.email;
          editBtn.textContent = 'Edit Profile';
          saveBtn.setAttribute('disabled', true);
        }
      });
    }

    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedName = nameInput.value.trim();
        const updatedEmail = emailInput.value.trim();

        if (!updatedName || !updatedEmail || !isValidEmail(updatedEmail)) {
          showToast('Please provide a valid name and email address.', 'error');
          return;
        }

        VideoBlogStore.updateUser({
          ...user,
          name: updatedName,
          email: updatedEmail
        });

        nameInput.setAttribute('readonly', true);
        emailInput.setAttribute('readonly', true);
        if (editBtn) editBtn.textContent = 'Edit Profile';
        if (saveBtn) saveBtn.setAttribute('disabled', true);
        isEditing = false;

        showToast('Profile updated successfully.', 'success');
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        showConfirmModal({
          title: 'Sign Out',
          message: 'Are you sure you want to log out of Video Blog Content?',
          confirmText: 'Log Out',
          onConfirm: () => {
            const user = VideoBlogStore.getUser();
            VideoBlogStore.updateUser({ ...user, isLoggedIn: false });
            sessionStorage.setItem('videoblog_flash_msg', JSON.stringify({
              text: 'You have been logged out successfully.',
              type: 'info'
            }));
            window.location.href = 'login.html';
          }
        });
      });
    }
  }
});
