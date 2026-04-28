const commands = {
  purchase: {
    path: '/payment/purchase',
    fields: ['amount', 'payment', 'referralcode', 'skipPrint'],
    required: ['amount', 'referralcode'],
  },
  void: {
    path: '/payment/void',
    fields: ['traceno', 'skipPrint'],
    required: ['traceno'],
  },
  inquiry: {
    path: '/payment/inquiry',
    fields: ['referralcode'],
    required: ['referralcode'],
  },
  settlement: {
    path: '/payment/settlement',
    fields: ['skipPrint'],
    required: [],
  },
  healthcheck: {
    path: '/payment/healthcheck',
    fields: [],
    required: [],
  },
  cancel: {
    path: '/payment/cancel',
    fields: ['skipPrint'],
    required: [],
  },
};

const inputs = {
  baseUrl: document.querySelector('#base-url'),
  clientId: document.querySelector('#client-id'),
  apiKey: document.querySelector('#api-key'),
  terminalIds: document.querySelector('#terminal-ids'),
};

const profileControls = {
  select: document.querySelector('#profile-select'),
  name: document.querySelector('#profile-name'),
  save: document.querySelector('#save-profile'),
  create: document.querySelector('#new-profile'),
  delete: document.querySelector('#delete-profile'),
};

const connectionFields = ['baseUrl', 'clientId', 'apiKey', 'terminalIds'];

const legacyCookieFields = {
  baseUrl: 'payproEcrBaseUrl',
  clientId: 'payproEcrClientId',
  apiKey: 'payproEcrApiKey',
  terminalIds: 'payproEcrTerminalIds',
};

const profileListCookie = 'payproEcrProfileNames';
const activeProfileCookie = 'payproEcrActiveProfile';
const defaultProfileName = 'Default';

const terminalCount = document.querySelector('#terminal-count');
const dedupeTerminalsButton = document.querySelector('#dedupe-terminals');
const refreshTabsButton = document.querySelector('#refresh-tabs');
const tabs = document.querySelector('#terminal-tabs');
const panels = document.querySelector('#terminal-panels');
const panelTemplate = document.querySelector('#terminal-panel-template');

const terminalState = new Map();
let activeTerminalId = '';
let activeProfileName = defaultProfileName;
let profileNames = [];

function getCookie(name) {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${encodeURIComponent(name)}=`));

  if (!cookie) {
    return '';
  }

  return decodeURIComponent(cookie.slice(cookie.indexOf('=') + 1));
}

function setCookie(name, value) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )}; max-age=31536000; path=/; SameSite=Lax`;
}

function deleteCookie(name) {
  document.cookie = `${encodeURIComponent(
    name,
  )}=; max-age=0; path=/; SameSite=Lax`;
}

function normalizeProfileName(name) {
  return String(name || '').trim();
}

function compactProfileNames(names) {
  const seen = new Set();
  return names
    .map(normalizeProfileName)
    .filter(Boolean)
    .filter((name) => {
      if (seen.has(name)) {
        return false;
      }
      seen.add(name);
      return true;
    });
}

function getProfileCookieName(profileName, field) {
  return `payproEcrProfile:${profileName}:${field}`;
}

function readJsonCookie(name, fallback) {
  const value = getCookie(name);
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function readProfileNames() {
  const names = readJsonCookie(profileListCookie, []);
  const normalized = Array.isArray(names) ? compactProfileNames(names) : [];
  return normalized.length ? normalized : [defaultProfileName];
}

function writeProfileNames(names) {
  profileNames = compactProfileNames(names);
  if (!profileNames.length) {
    profileNames = [defaultProfileName];
  }
  setCookie(profileListCookie, JSON.stringify(profileNames));
}

function readProfileSettings(profileName) {
  return connectionFields.reduce((settings, field) => {
    settings[field] = getCookie(getProfileCookieName(profileName, field));
    return settings;
  }, {});
}

function writeProfileSetting(profileName, field, value) {
  setCookie(getProfileCookieName(profileName, field), value.trim());
}

function deleteProfileSettings(profileName) {
  connectionFields.forEach((field) => {
    deleteCookie(getProfileCookieName(profileName, field));
  });
}

function readFormSettings() {
  return connectionFields.reduce((settings, field) => {
    settings[field] = inputs[field].value.trim();
    return settings;
  }, {});
}

function writeFormSettings(settings) {
  connectionFields.forEach((field) => {
    inputs[field].value = settings[field] || '';
  });
}

function saveCurrentProfileSettings() {
  const settings = readFormSettings();
  connectionFields.forEach((field) => {
    writeProfileSetting(activeProfileName, field, settings[field]);
  });
}

function saveConnectionCookie(field) {
  writeProfileSetting(activeProfileName, field, inputs[field].value.trim());
}

function ensureProfile(profileName) {
  const normalized = normalizeProfileName(profileName) || defaultProfileName;
  if (!profileNames.includes(normalized)) {
    writeProfileNames([...profileNames, normalized]);
  }
  return normalized;
}

function renderProfileSelect() {
  profileControls.select.innerHTML = '';
  profileNames.forEach((profileName) => {
    const option = document.createElement('option');
    option.value = profileName;
    option.textContent = profileName;
    profileControls.select.append(option);
  });
  profileControls.select.value = activeProfileName;
  profileControls.name.value = activeProfileName;
  profileControls.delete.disabled = profileNames.length <= 1;
}

function activateProfile(profileName) {
  activeProfileName = ensureProfile(profileName);
  setCookie(activeProfileCookie, activeProfileName);
  writeFormSettings(readProfileSettings(activeProfileName));
  renderProfileSelect();
  renderTerminalTabs();
  syncAllPreviews();
}

function saveProfileFromForm() {
  activeProfileName = ensureProfile(profileControls.name.value);
  setCookie(activeProfileCookie, activeProfileName);
  saveCurrentProfileSettings();
  renderProfileSelect();
  renderTerminalTabs();
  syncAllPreviews();
}

function getNextProfileName() {
  let index = profileNames.length + 1;
  let profileName = `Profile ${index}`;
  while (profileNames.includes(profileName)) {
    index += 1;
    profileName = `Profile ${index}`;
  }
  return profileName;
}

function createBlankProfile() {
  activeProfileName = ensureProfile(getNextProfileName());
  setCookie(activeProfileCookie, activeProfileName);
  writeFormSettings({});
  saveCurrentProfileSettings();
  renderProfileSelect();
  renderTerminalTabs();
  syncAllPreviews();
}

function deleteActiveProfile() {
  if (profileNames.length <= 1) {
    return;
  }

  const deletedIndex = profileNames.indexOf(activeProfileName);
  deleteProfileSettings(activeProfileName);
  writeProfileNames(
    profileNames.filter((profileName) => profileName !== activeProfileName),
  );
  const nextIndex = Math.max(
    0,
    Math.min(deletedIndex, profileNames.length - 1),
  );
  activeProfileName = profileNames[nextIndex] || defaultProfileName;
  setCookie(activeProfileCookie, activeProfileName);
  writeFormSettings(readProfileSettings(activeProfileName));
  renderProfileSelect();
  renderTerminalTabs();
  syncAllPreviews();
}

function migrateLegacyProfileCookies() {
  if (getCookie(profileListCookie)) {
    return;
  }

  writeProfileNames([defaultProfileName]);
  activeProfileName = defaultProfileName;
  setCookie(activeProfileCookie, activeProfileName);

  connectionFields.forEach((field) => {
    const value = getCookie(legacyCookieFields[field]).trim();
    if (value) {
      writeProfileSetting(defaultProfileName, field, value);
    }
  });
}

function loadConnectionCookies() {
  migrateLegacyProfileCookies();
  profileNames = readProfileNames();
  const savedActiveProfile = normalizeProfileName(
    getCookie(activeProfileCookie),
  );
  activeProfileName = profileNames.includes(savedActiveProfile)
    ? savedActiveProfile
    : profileNames[0];
  setCookie(activeProfileCookie, activeProfileName);
  writeFormSettings(readProfileSettings(activeProfileName));
  renderProfileSelect();
}

function parseTerminalIds() {
  return inputs.terminalIds.value
    .split(/[\s,;]+/)
    .map((terminalId) => terminalId.trim())
    .filter(Boolean);
}

function uniqueTerminalIds() {
  return [...new Set(parseTerminalIds())];
}

function createReferralCode() {
  const timePart = new Date()
    .toISOString()
    .replace(/\D/g, '')
    .slice(0, 14);
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `REF-${timePart}-${randomPart}`;
}

function normalizeBaseUrl(url) {
  return url.trim().replace(/\/+$/, '');
}

function getDefaultState() {
  return {
    command: 'purchase',
    amount: '1.10',
    payment: '1',
    referralcode: createReferralCode(),
    traceno: '',
    skipPrint: true,
    responseText: 'Response will appear here.',
    statusText: 'Ready',
    statusState: '',
  };
}

function ensureState(terminalId) {
  if (!terminalState.has(terminalId)) {
    terminalState.set(terminalId, getDefaultState());
  }

  return terminalState.get(terminalId);
}

function getPanel(terminalId) {
  return [...panels.querySelectorAll('[data-terminal-id]')].find(
    (panel) => panel.dataset.terminalId === terminalId,
  );
}

function getCommand(state) {
  return commands[state.command];
}

function buildPayload(terminalId, state) {
  const command = getCommand(state);
  const payload = { terminalId };

  if (command.fields.includes('amount')) {
    payload.amount = Number(state.amount);
  }
  if (command.fields.includes('payment')) {
    payload.payment = Number(state.payment);
  }
  if (command.fields.includes('referralcode')) {
    payload.referralcode = state.referralcode.trim();
  }
  if (command.fields.includes('traceno')) {
    payload.traceno = state.traceno.trim();
  }
  if (command.fields.includes('skipPrint')) {
    payload.skipPrint = state.skipPrint;
  }

  return payload;
}

function buildRequestInfo(terminalId, state) {
  const command = getCommand(state);
  const baseUrl = normalizeBaseUrl(inputs.baseUrl.value);

  return {
    method: 'POST',
    url: `${baseUrl}${command.path}`,
    headers: {
      'x-client-id': inputs.clientId.value.trim(),
      'x-api-key': inputs.apiKey.value.trim() ? '***' : '',
      'Content-Type': 'application/json',
    },
    body: buildPayload(terminalId, state),
  };
}

function validatePayload(payload, state) {
  const command = getCommand(state);
  const missing = [];

  if (!payload.terminalId) {
    missing.push('terminalId');
  }
  if (!inputs.clientId.value.trim()) {
    missing.push('clientId');
  }
  if (!inputs.apiKey.value.trim()) {
    missing.push('apiKey');
  }

  command.required.forEach((field) => {
    if (field === 'amount') {
      if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
        missing.push('amount');
      }
      return;
    }
    if (!payload[field]) {
      missing.push(field);
    }
  });

  return missing;
}

function setStatus(element, text, state) {
  element.textContent = text;
  element.classList.remove('is-loading', 'is-error', 'is-success');
  element.classList.add('status-pill');
  if (state) {
    element.classList.add(`is-${state}`);
  }
}

function updateTerminalCount() {
  const count = uniqueTerminalIds().length;
  terminalCount.textContent = `${count} terminal${count === 1 ? '' : 's'}`;
}

function syncPanelFromState(terminalId) {
  const panel = getPanel(terminalId);
  if (!panel) {
    return;
  }

  const state = ensureState(terminalId);
  const command = getCommand(state);

  panel.querySelectorAll('[data-command]').forEach((input) => {
    input.checked = input.value === state.command;
  });
  panel.querySelector('[data-input="amount"]').value = state.amount;
  panel.querySelector('[data-input="payment"]').value = state.payment;
  panel.querySelector('[data-input="referralcode"]').value = state.referralcode;
  panel.querySelector('[data-input="traceno"]').value = state.traceno;
  panel.querySelector('[data-input="skipPrint"]').checked = state.skipPrint;

  panel.querySelectorAll('[data-field]').forEach((wrapper) => {
    wrapper.classList.toggle('is-hidden', !command.fields.includes(wrapper.dataset.field));
  });

  panel.querySelector('[data-action="generate-ref"]').hidden =
    !command.fields.includes('referralcode');
  panel.querySelector('[data-output="request"]').textContent = JSON.stringify(
    buildRequestInfo(terminalId, state),
    null,
    2,
  );
  panel.querySelector('[data-output="response"]').textContent = state.responseText;
  setStatus(panel.querySelector('.terminal-status'), state.statusText, state.statusState);
}

function syncAllPreviews() {
  uniqueTerminalIds().forEach(syncPanelFromState);
}

function activateTerminal(terminalId) {
  activeTerminalId = terminalId;

  tabs.querySelectorAll('[role="tab"]').forEach((tab) => {
    const isActive = tab.dataset.terminalId === terminalId;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  panels.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
    panel.hidden = panel.dataset.terminalId !== terminalId;
  });
}

function wirePanel(panel, terminalId) {
  panel.querySelectorAll('[data-command]').forEach((input) => {
    input.name = `command-${terminalId}`;
    input.addEventListener('change', () => {
      const state = ensureState(terminalId);
      state.command = input.value;
      syncPanelFromState(terminalId);
    });
  });

  panel.querySelectorAll('[data-input]').forEach((input) => {
    input.addEventListener('input', () => {
      const state = ensureState(terminalId);
      state[input.dataset.input] =
        input.type === 'checkbox' ? input.checked : input.value;
      syncPanelFromState(terminalId);
    });
    input.addEventListener('change', () => {
      const state = ensureState(terminalId);
      state[input.dataset.input] =
        input.type === 'checkbox' ? input.checked : input.value;
      syncPanelFromState(terminalId);
    });
  });

  panel.querySelector('[data-action="generate-ref"]').addEventListener('click', () => {
    const state = ensureState(terminalId);
    state.referralcode = createReferralCode();
    syncPanelFromState(terminalId);
  });

  panel.querySelector('[data-action="send"]').addEventListener('click', () => {
    sendRequest(terminalId);
  });

  panel.querySelector('[data-action="cancel"]').addEventListener('click', () => {
    sendCancel(terminalId);
  });

  panel.querySelector('[data-action="copy-request"]').addEventListener('click', (event) => {
    copyText(panel.querySelector('[data-output="request"]'), event.currentTarget);
  });

  panel.querySelector('[data-action="copy-response"]').addEventListener('click', (event) => {
    copyText(panel.querySelector('[data-output="response"]'), event.currentTarget);
  });
}

function createTerminalPanel(terminalId) {
  const panel = panelTemplate.content.firstElementChild.cloneNode(true);
  panel.dataset.terminalId = terminalId;
  panel.querySelector('[data-terminal-title]').textContent = `Command · ${terminalId}`;
  wirePanel(panel, terminalId);
  panels.append(panel);
  syncPanelFromState(terminalId);
}

function createTerminalTab(terminalId) {
  const button = document.createElement('button');
  button.type = 'button';
  button.role = 'tab';
  button.dataset.terminalId = terminalId;
  button.textContent = terminalId;
  button.addEventListener('click', () => activateTerminal(terminalId));
  tabs.append(button);
}

function renderTerminalTabs() {
  const terminalIds = uniqueTerminalIds();
  updateTerminalCount();
  tabs.innerHTML = '';
  panels.innerHTML = '';

  terminalIds.forEach((terminalId) => {
    ensureState(terminalId);
    createTerminalTab(terminalId);
    createTerminalPanel(terminalId);
  });

  if (terminalIds.length === 0) {
    panels.innerHTML = '<p class="empty-message">Add a terminal ID to create a tab.</p>';
    return;
  }

  activateTerminal(terminalIds.includes(activeTerminalId) ? activeTerminalId : terminalIds[0]);
}

async function sendRequest(terminalId) {
  const panel = getPanel(terminalId);
  const state = ensureState(terminalId);
  const command = getCommand(state);
  const payload = buildPayload(terminalId, state);
  const missing = validatePayload(payload, state);
  const sendButton = panel.querySelector('[data-action="send"]');

  if (missing.length) {
    state.responseText = JSON.stringify(
      {
        succeed: false,
        message: `Missing or invalid: ${missing.join(', ')}`,
      },
      null,
      2,
    );
    state.statusText = 'Check fields';
    state.statusState = 'error';
    syncPanelFromState(terminalId);
    return;
  }

  const url = `${normalizeBaseUrl(inputs.baseUrl.value)}${command.path}`;
  sendButton.disabled = true;
  sendButton.classList.add('is-busy');
  state.statusText = 'Sending';
  state.statusState = 'loading';
  state.responseText = 'Waiting for response...';
  syncPanelFromState(terminalId);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-client-id': inputs.clientId.value.trim(),
        'x-api-key': inputs.apiKey.value.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    state.responseText = JSON.stringify(
      {
        httpStatus: response.status,
        ok: response.ok,
        body,
      },
      null,
      2,
    );
    state.statusText = response.ok ? 'Complete' : 'HTTP error';
    state.statusState = response.ok ? 'success' : 'error';
  } catch (error) {
    state.responseText = JSON.stringify(
      {
        succeed: false,
        message: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    );
    state.statusText = 'Failed';
    state.statusState = 'error';
  } finally {
    sendButton.disabled = false;
    sendButton.classList.remove('is-busy');
    syncPanelFromState(terminalId);
  }
}

async function sendCancel(terminalId) {
  const panel = getPanel(terminalId);
  const state = ensureState(terminalId);
  const cancelButton = panel.querySelector('[data-action="cancel"]');
  const payload = {
    terminalId,
    skipPrint: state.skipPrint,
  };
  const missing = validatePayload(payload, {
    command: 'cancel',
  });

  if (missing.length) {
    state.responseText = JSON.stringify(
      {
        succeed: false,
        message: `Missing or invalid: ${missing.join(', ')}`,
      },
      null,
      2,
    );
    state.statusText = 'Check fields';
    state.statusState = 'error';
    syncPanelFromState(terminalId);
    return;
  }

  const url = `${normalizeBaseUrl(inputs.baseUrl.value)}${commands.cancel.path}`;
  cancelButton.disabled = true;
  state.statusText = 'Cancelling';
  state.statusState = 'loading';
  state.responseText = 'Waiting for cancel response...';
  syncPanelFromState(terminalId);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-client-id': inputs.clientId.value.trim(),
        'x-api-key': inputs.apiKey.value.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    state.responseText = JSON.stringify(
      {
        command: 'cancel',
        httpStatus: response.status,
        ok: response.ok,
        body,
      },
      null,
      2,
    );
    state.statusText = response.ok ? 'Cancel sent' : 'HTTP error';
    state.statusState = response.ok ? 'success' : 'error';
  } catch (error) {
    state.responseText = JSON.stringify(
      {
        command: 'cancel',
        succeed: false,
        message: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    );
    state.statusText = 'Cancel failed';
    state.statusState = 'error';
  } finally {
    cancelButton.disabled = false;
    syncPanelFromState(terminalId);
  }
}

async function copyText(source, button) {
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(source.textContent);
    button.textContent = 'Copied';
  } catch (error) {
    button.textContent = 'Copy failed';
  }
  window.setTimeout(() => {
    button.textContent = original;
  }, 900);
}

dedupeTerminalsButton.addEventListener('click', () => {
  inputs.terminalIds.value = uniqueTerminalIds().join('\n');
  saveConnectionCookie('terminalIds');
  renderTerminalTabs();
});

refreshTabsButton.addEventListener('click', renderTerminalTabs);
profileControls.select.addEventListener('change', () => {
  activateProfile(profileControls.select.value);
});
profileControls.save.addEventListener('click', saveProfileFromForm);
profileControls.create.addEventListener('click', createBlankProfile);
profileControls.delete.addEventListener('click', deleteActiveProfile);
inputs.terminalIds.addEventListener('input', () => {
  saveConnectionCookie('terminalIds');
  updateTerminalCount();
});
inputs.baseUrl.addEventListener('input', () => {
  saveConnectionCookie('baseUrl');
  syncAllPreviews();
});
inputs.clientId.addEventListener('input', () => {
  saveConnectionCookie('clientId');
  syncAllPreviews();
});
inputs.apiKey.addEventListener('input', () => {
  saveConnectionCookie('apiKey');
  syncAllPreviews();
});

loadConnectionCookies();
renderTerminalTabs();
