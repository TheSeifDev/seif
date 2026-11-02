const OWNER_GITHUB_ACCOUNT_ID = '167328383';
const GITHUB_PROVIDER_ID = 'github';

function isAllowedGithubIdentity(profile) {
  if (!profile || typeof profile !== 'object') return false;
  return String(profile.id ?? '') === OWNER_GITHUB_ACCOUNT_ID;
}

function validateUserInfo({ source }) {
  if (
    source.method !== 'oauth' ||
    source.oauth?.providerId !== GITHUB_PROVIDER_ID ||
    !isAllowedGithubIdentity(source.oauth.profile)
  ) {
    return {
      error: 'github_identity_not_allowed',
      errorDescription: 'This GitHub identity is not allowed.',
    };
  }
  return { allowed: true };
}

const tests = [
  { name: 'Owner numeric ID (167328383)', input: { source: { method: 'oauth', oauth: { providerId: 'github', profile: { id: 167328383 } } } }, expectedAllowed: true },
  { name: 'Owner string ID ("167328383")', input: { source: { method: 'oauth', oauth: { providerId: 'github', profile: { id: '167328383' } } } }, expectedAllowed: true },
  { name: 'Non-owner numeric ID (99999999)', input: { source: { method: 'oauth', oauth: { providerId: 'github', profile: { id: 99999999 } } } }, expectedAllowed: false },
  { name: 'Attacker spoofing email/username with wrong ID', input: { source: { method: 'oauth', oauth: { providerId: 'github', profile: { id: 12345, login: 'TheSeifDev', email: 'safalmoaz16@gmail.com' } } } }, expectedAllowed: false },
  { name: 'Non-GitHub provider (Google)', input: { source: { method: 'oauth', oauth: { providerId: 'google', profile: { id: 167328383 } } } }, expectedAllowed: false },
  { name: 'Credentials method', input: { source: { method: 'credentials' } }, expectedAllowed: false },
  { name: 'Empty profile object', input: { source: { method: 'oauth', oauth: { providerId: 'github', profile: {} } } }, expectedAllowed: false },
  { name: 'Null profile', input: { source: { method: 'oauth', oauth: { providerId: 'github', profile: null } } }, expectedAllowed: false },
];

let allPassed = true;
for (const t of tests) {
  const res = validateUserInfo(t.input);
  const allowed = res.allowed === true;
  const pass = allowed === t.expectedAllowed;
  if (!pass) allPassed = false;
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${t.name} -> allowed: ${allowed} (expected: ${t.expectedAllowed})`);
}

if (!allPassed) {
  process.exit(1);
}
console.log('\nAll identity validation unit tests passed.');
