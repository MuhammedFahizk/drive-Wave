/* eslint-disable no-unused-vars */
function validateForm() {
  // Clear previous error messages
  const error = document.getElementById('error-message');
  error.innerHTML = '';
  // Get values from the form
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  // Regular expression for a valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if email is valid
  if (!emailRegex.test(email)) {
    error.innerHTML = 'Please enter a valid email address.';
    return false;
  }

  // Check if the password is at least 8 characters long
  if (password.length < 8) {
    error.innerHTML = 'Password must be at least 8 characters long.';
    return false;
  }

  // If everything is valid, the form will be submitted
  return true;
}
