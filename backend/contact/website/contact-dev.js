// website/contact-dev.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const result = document.getElementById('contact-result');
  const sendBtn = document.getElementById('contact-send');
  if (!form) return;

  function setResult(text, statusClass) {
    result.textContent = text;
    result.className = 'result ' + (statusClass || '');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim()
    };

    sendBtn.disabled = true;
    setResult('Sending...');

    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });

      if (res.status === 201) {
        setResult('Message sent — thank you!', 'success');
        form.reset();
      } else {
        const body = await res.json().catch(() => null);
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
