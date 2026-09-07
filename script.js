// GitHub Actions Landing Page Interactive Script

document.addEventListener('DOMContentLoaded', () => {
  initSimulator();
  initPlayground();
  initBadgeGenerator();
  initMatrixHover();
  initSecretToggle();
});

/* ==========================================
   1. PIPELINE WORKFLOW SIMULATOR LOGIC
   ========================================== */
const jobsData = [
  {
    id: 'setup',
    name: 'Setup & Dependency Cache',
    status: 'success',
    duration: '12s',
    logs: [
      { time: '00:01', text: 'Set up job runner on ubuntu-latest', type: 'info' },
      { time: '00:02', text: 'actions/checkout@v4', type: 'cmd' },
      { time: '00:03', text: 'Syncing repository refs...', type: 'info' },
      { time: '00:05', text: 'actions/setup-node@v4 (node-version: 20.x)', type: 'cmd' },
      { time: '00:07', text: 'Found cache key node-cache-ubuntu-20.x-sha256:e3b0c44', type: 'info' },
      { time: '00:10', text: 'Restored 142MB from cache in 2.4s', type: 'success' },
      { time: '00:12', text: '✓ Job completed successfully in 12s', type: 'success' }
    ]
  },
  {
    id: 'test',
    name: 'Unit & Integration Tests',
    status: 'running',
    duration: '28s',
    logs: [
      { time: '00:13', text: 'Starting job: Unit & Integration Tests', type: 'group' },
      { time: '00:14', text: 'npm test -- --coverage', type: 'cmd' },
      { time: '00:16', text: 'PASS src/components/Pipeline.test.js (4.2s)', type: 'success' },
      { time: '00:19', text: 'PASS src/services/workflow.test.js (6.1s)', type: 'success' },
      { time: '00:23', text: 'PASS src/utils/matrix.test.js (3.8s)', type: 'success' },
      { time: '00:28', text: 'Test Suites: 14 passed, 14 total', type: 'success' },
      { time: '00:32', text: 'Tests:       128 passed, 128 total', type: 'success' },
      { time: '00:38', text: 'Coverage:    94.6% statements', type: 'info' },
      { time: '00:41', text: '✓ All test assertions passed cleanly', type: 'success' }
    ]
  },
  {
    id: 'security',
    name: 'CodeQL Security Scan',
    status: 'queued',
    duration: '18s',
    logs: [
      { time: '00:42', text: 'github/codeql-action/init@v3', type: 'cmd' },
      { time: '00:44', text: 'Initializing CodeQL database for [javascript, typescript]...', type: 'info' },
      { time: '00:50', text: 'github/codeql-action/analyze@v3', type: 'cmd' },
      { time: '00:55', text: 'Analysis complete: 0 vulnerabilities, 0 security alerts', type: 'success' },
      { time: '01:00', text: '✓ Security check passed', type: 'success' }
    ]
  },
  {
    id: 'deploy',
    name: 'Deploy to Production',
    status: 'queued',
    duration: '22s',
    logs: [
      { time: '01:01', text: 'Environment: Production (https://api.github.com)', type: 'group' },
      { time: '01:03', text: 'docker build -t ghcr.io/org/app:v2.4.0 .', type: 'cmd' },
      { time: '01:10', text: 'Building image layer [████████████████] 100%', type: 'info' },
      { time: '01:15', text: 'Pushing image to GitHub Packages Container Registry...', type: 'info' },
      { time: '01:20', text: 'Triggering deployment webhook to edge nodes...', type: 'info' },
      { time: '01:23', text: '🚀 Deployed successfully to https://actions.dev-app.internal', type: 'success' }
    ]
  }
];

let activeJobIndex = 0;
let simInterval = null;
let isRunningSim = false;

function initSimulator() {
  const terminal = document.getElementById('terminalLog');
  const jobItems = document.querySelectorAll('.job-item');
  const btnRun = document.getElementById('btnRunSim');
  const btnReset = document.getElementById('btnResetSim');

  function renderJobLogs(jobIndex) {
    terminal.innerHTML = '';
    const job = jobsData[jobIndex];
    job.logs.forEach(log => {
      const line = document.createElement('div');
      line.className = 'log-line';
      line.innerHTML = `
        <span class="log-time">[${log.time}]</span>
        <span class="log-content log-${log.type}">${escapeHtml(log.text)}</span>
      `;
      terminal.appendChild(line);
    });
    terminal.scrollTop = terminal.scrollHeight;
  }

  jobItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      jobItems.forEach(j => j.classList.remove('active'));
      item.classList.add('active');
      activeJobIndex = index;
      renderJobLogs(index);
    });
  });

  // Initial render
  renderJobLogs(0);

  if (btnRun) {
    btnRun.addEventListener('click', () => {
      if (isRunningSim) return;
      isRunningSim = true;
      btnRun.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg> Running...`;
      
      let step = 0;
      simInterval = setInterval(() => {
        if (step < jobsData.length) {
          jobItems.forEach(j => j.classList.remove('active'));
          jobItems[step].classList.add('active');
          
          // Update status icon
          const iconContainer = jobItems[step].querySelector('.job-status-icon');
          iconContainer.className = 'job-status-icon status-running';
          iconContainer.innerHTML = '⚙️';
          
          renderJobLogs(step);

          setTimeout(() => {
            iconContainer.className = 'job-status-icon status-success';
            iconContainer.innerHTML = '✓';
          }, 800);

          step++;
        } else {
          clearInterval(simInterval);
          isRunningSim = false;
          btnRun.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Run Workflow`;
          showToast('Workflow executed successfully across 4 parallel jobs!');
        }
      }, 1500);
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (simInterval) clearInterval(simInterval);
      isRunningSim = false;
      if (btnRun) btnRun.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Run Workflow`;
      
      jobItems.forEach((j, idx) => {
        const icon = j.querySelector('.job-status-icon');
        if (idx === 0 || idx === 1) {
          icon.className = 'job-status-icon status-success';
          icon.innerHTML = '✓';
        } else {
          icon.className = 'job-status-icon status-queued';
          icon.innerHTML = '⏱';
        }
      });
      jobItems[0].classList.add('active');
      renderJobLogs(0);
      showToast('Simulator reset to initial state');
    });
  }
}

/* ==========================================
   2. WORKFLOW PLAYGROUND LOGIC
   ========================================== */
const workflowTemplates = {
  ci: `name: Node.js CI Pipeline

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Repository
      uses: actions/checkout@v4

    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'

    - name: Install Dependencies
      run: npm ci

    - name: Run Test Suite
      run: npm test -- --coverage`,

  matrix: `name: Cross-Platform Matrix Test

on: [push, pull_request]

jobs:
  test-matrix:
    runs-on: \${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18.x, 20.x, 22.x]

    steps:
    - uses: actions/checkout@v4
    - name: Setup Node \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
    - run: npm ci
    - run: npm test`,

  docker: `name: Build & Push Docker Image

on:
  push:
    tags: [ 'v*.*.*' ]

jobs:
  docker-build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
    - uses: actions/checkout@v4

    - name: Log in to GHCR
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: \${{ github.actor }}
        password: \${{ secrets.GITHUB_TOKEN }}

    - name: Build & Push Container
      uses: docker/build-push-action@v5
      with:
        push: true
        tags: ghcr.io/\${{ github.repository }}:latest`,

  release: `name: Automated Release & Changelog

on:
  push:
    branches: [ "main" ]

jobs:
  create-release:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Generate Release Notes
      uses: softprops/action-gh-release@v1
      if: startsWith(github.ref, 'refs/tags/')
      with:
        generate_release_notes: true
        draft: false
        prerelease: false`
};

function initPlayground() {
  const tabs = document.querySelectorAll('.editor-tab');
  const codeBlock = document.getElementById('yamlCodeBlock');
  const btnCopy = document.getElementById('copyYamlBtn');
  const triggerChips = document.querySelectorAll('.trigger-chip');

  let currentTemplateKey = 'ci';

  function updateCodeDisplay() {
    let rawYaml = workflowTemplates[currentTemplateKey];
    codeBlock.innerHTML = highlightYaml(rawYaml);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTemplateKey = tab.getAttribute('data-template');
      updateCodeDisplay();
    });
  });

  triggerChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      showToast(`Trigger configuration updated`);
    });
  });

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const rawText = workflowTemplates[currentTemplateKey];
      navigator.clipboard.writeText(rawText).then(() => {
        showToast('YAML workflow copied to clipboard!');
      }).catch(() => {
        showToast('Copied workflow snippet!');
      });
    });
  }

  updateCodeDisplay();
}

function highlightYaml(text) {
  return escapeHtml(text)
    .replace(/^([a-zA-Z0-9_\-]+):/gm, '<span class="yaml-key">$1</span>:')
    .replace(/(uses|run|with|on|jobs|strategy|matrix|steps|runs-on):/g, '<span class="yaml-kw">$1</span>:')
    .replace(/('.*?'|".*?")/g, '<span class="yaml-str">$1</span>')
    .replace(/(#.*$)/gm, '<span class="yaml-cmt">$1</span>');
}

/* ==========================================
   3. STATUS BADGE GENERATOR LOGIC
   ========================================== */
function initBadgeGenerator() {
  const inputRepo = document.getElementById('badgeRepoInput');
  const selectBranch = document.getElementById('badgeBranchSelect');
  const selectStatus = document.getElementById('badgeStatusSelect');
  const badgeDisplay = document.getElementById('badgeDisplay');
  const badgeCode = document.getElementById('badgeCodeOutput');
  const btnCopyBadge = document.getElementById('copyBadgeBtn');

  function updateBadge() {
    const repo = inputRepo.value || 'owner/repo';
    const branch = selectBranch.value || 'main';
    const status = selectStatus.value || 'passing';

    badgeDisplay.className = `badge-display badge-${status}`;
    
    let iconSymbol = status === 'passing' ? '✓' : status === 'failing' ? '✕' : '⚙';
    let textLabel = status === 'passing' ? 'build passing' : status === 'failing' ? 'build failing' : 'building...';
    
    badgeDisplay.innerHTML = `<span>build</span> <span>|</span> <span>${iconSymbol} ${status}</span>`;

    const mdString = `![${repo} CI](https://github.com/${repo}/actions/workflows/main.yml/badge.svg?branch=${branch})`;
    badgeCode.textContent = mdString;
  }

  if (inputRepo) inputRepo.addEventListener('input', updateBadge);
  if (selectBranch) selectBranch.addEventListener('change', updateBadge);
  if (selectStatus) selectStatus.addEventListener('change', updateBadge);

  if (btnCopyBadge) {
    btnCopyBadge.addEventListener('click', () => {
      navigator.clipboard.writeText(badgeCode.textContent).then(() => {
        showToast('Badge Markdown copied!');
      });
    });
  }

  if (badgeDisplay) updateBadge();
}

/* ==========================================
   4. INTERACTIVE MATRIX HOVER & SECRETS
   ========================================== */
function initMatrixHover() {
  const cells = document.querySelectorAll('.matrix-cell');
  cells.forEach(cell => {
    cell.addEventListener('mouseenter', () => {
      cells.forEach(c => c.classList.remove('active'));
      cell.classList.add('active');
    });
  });
}

function initSecretToggle() {
  const toggle = document.getElementById('secretToggleBtn');
  const secretText = document.getElementById('secretValueText');
  let revealed = false;

  if (toggle && secretText) {
    toggle.addEventListener('click', () => {
      revealed = !revealed;
      if (revealed) {
        secretText.textContent = 'ghp_9f82KxaL0918237198273918273';
        toggle.textContent = 'Hide';
      } else {
        secretText.textContent = '••••••••••••••••••••••••';
        toggle.textContent = 'Reveal';
      }
    });
  }
}

/* ==========================================
   UTILITY & TOAST NOTIFICATION
   ========================================== */
function showToast(msg) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <span>${escapeHtml(msg)}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
