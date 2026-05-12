function acceptTerms() {
  document.getElementById('overlay').style.display = 'none';
}

const prices = {
  bust: { sketch: 5, flat: 20, rendered: 40 },
  half: { sketch: 10, flat: 25, rendered: 65 },
  full: { sketch: 13, flat: 35, rendered: 85 },
};

function updatePrice() {
  const size = document.getElementById('sizeSelect').value;
  const type = document.getElementById('typeSelect').value;
  const deadline = document.getElementById('deadlineInput').value;

  let base = 0;
  let label = '— x — = 0.00 USD';

  if (size && type) {
    base = prices[size][type];
    const sizeLabel = size.charAt(0).toUpperCase() + size.slice(1);
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    label = `${sizeLabel} x ${typeLabel} = ${base.toFixed(2)} USD`;
  }

  let rush = 0;
  if (deadline) {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (0 <=days && days < 7) rush = base * 0.5;
    else if (0<=days && days<14) rush = base * 0.25;
  }

  document.getElementById('basePrice').textContent = label;
  document.getElementById('rushFee').textContent = `Rush order fee = ${rush.toFixed(2)} USD`;
  document.getElementById('subtotal').textContent = `Subtotal = ${(base + rush).toFixed(2)} USD`;
}

let uploadedFiles = [];

function handleFiles(files) {
  const list = document.getElementById('fileList');
  Array.from(files).forEach(file => {
    uploadedFiles.push(file);
    const tag = document.createElement('div');
    tag.className = 'file-tag';
    tag.innerHTML = `<span>${file.name}</span><button onclick="removeFile(this, '${file.name}')">🗑</button>`;
    list.appendChild(tag);
  });
  document.getElementById('fileInput').value = '';
}

function removeFile(btn, name) {
  uploadedFiles = uploadedFiles.filter(f => f.name !== name);
  btn.parentElement.remove();
}

function goHome() {
  window.location.href = 'index.html';
}


async function submitRequest() {
  const email = document.querySelector('input[type="email"]').value.trim();
  const fileTags = document.getElementById('fileList').children.length;
  const size = document.getElementById('sizeSelect').value;
  const type = document.getElementById('typeSelect').value;
  const deadline = document.getElementById('deadlineInput').value;
  const extra = document.querySelector('textarea').value;

  if (!email) { alert('Please fill in your contact information.'); return; }
  if (fileTags === 0) { alert('Please upload at least one reference.'); return; }
  if (!size || !type) { alert('Please select a commission size and type.'); return; }

  // Show loading
  document.getElementById('loadingOverlay').style.display = 'flex';
  document.querySelector('.submit-btn').disabled = true;
  
  const fileData = await Promise.all(uploadedFiles.map(file => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        name: file.name,
        type: file.type,
        data: reader.result.split(',')[1]
      });
      reader.readAsDataURL(file);
    });
  }));
const price = document.getElementById('subtotal').textContent;
fetch('https://script.google.com/macros/s/AKfycbyM9b1ibA192RYuq6BzEh4JiKU9MqL7mXYJNeCCcn-wzQS01q6g0a1aVuN4vVc2McmjrQ/exec', {
    method: 'POST',
    body: JSON.stringify({ email, size, type, deadline: deadline || 'none', extra: extra || 'none', price, files: fileData })
  }).then(() => {
    document.getElementById('loadingOverlay').style.display = 'none';
    document.getElementById('thankyouOverlay').style.display = 'flex';
  }).catch(() => {
    document.getElementById('loadingOverlay').style.display = 'none';
    document.querySelector('.submit-btn').disabled = false;
    alert('Something went wrong, please try again.');
  });
}