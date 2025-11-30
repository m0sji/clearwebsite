// website/contact.js
// Secure contact form that includes Django CSRF token from cookie.
// Expects the API endpoint at /api/contact/

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const result = document.getElementById('contact-result');
  const sendBtn = document.getElementById('contact-send');

  if (!form) return;

  // Helper: get cookie value by name
  function getCookie(name) {
    const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? decodeURIComponent(v.pop()) : null;
  }

  function setResult(text, statusClass) {
    result.textContent = text;
    result.className = 'result ' + (statusClass || '');
  }

  async function submitData(data) {
    const csrfToken = getCookie('csrftoken');

    const res = await fetch('/api/contact/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || ''
      },
      credentials: 'same-origin', // ensures cookies are sent
      body: JSON.stringify(data)
    });

    return res;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic HTML5 validation check
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim()
    };

    // UI
    sendBtn.disabled = true;
    setResult('Sending...');

    try {
      const res = await submitData(payload);
      if (res.status === 201) {
        setResult('Message sent — thank you!', 'success');
        form.reset();
      } else {
        const body = await res.json().catch(() => null);
        // Prefer server message if present, otherwise fallback
        const errMsg = body && (body.detail || JSON.stringify(body)) || 'Server error';
        setResult('Error: ' + errMsg, 'error');
      }
    } catch (err) {
      console.error(err);
      setResult('Network error — please try again later.', 'error');
    } finally {
      sendBtn.disabled = false;
    }
  });
});
