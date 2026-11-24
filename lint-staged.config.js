const quote = (files) => files.map((file) => JSON.stringify(file)).join(' ');
const authored = (files) => files.filter((file) => !file.includes('/ship/'));
const run = (commands) => (files) => {
  const kept = authored(files);
  return kept.length ? commands.map((command) => `${command} ${quote(kept)}`) : [];
};

export default {
  '*.{js,jsx,ts,tsx}': run(['prettier --write', 'eslint --fix --max-warnings 0']),
  '*.css': run(['prettier --write', 'stylelint --fix']),
  '*.{json,md}': run(['prettier --write']),
  'README.md': ['bash bin/check_readme_structure.sh'],
};
