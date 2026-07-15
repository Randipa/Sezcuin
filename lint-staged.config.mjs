/** @type {import('lint-staged').Config} */
export default {
  'backend/{src,test}/**/*.ts': (files) => {
    const eslintTargets = files
      .map((file) => file.replace(/^backend\//, ''))
      .join(' ');

    return [
      `prettier --write ${files.join(' ')} --config backend/.prettierrc`,
      `cd backend && npx eslint --fix --max-warnings 0 ${eslintTargets}`,
    ];
  },
  'frontend/src/**/*.{ts,tsx,css}': (files) => {
    const eslintTargets = files
      .map((file) => file.replace(/^frontend\//, ''))
      .join(' ');

    return [
      `prettier --write ${files.join(' ')} --config frontend/.prettierrc`,
      `cd frontend && npx eslint --fix --max-warnings 0 ${eslintTargets}`,
    ];
  },
};
