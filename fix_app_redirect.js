import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /handleLogin\(result\.session\);/,
  "setCurrentSession(result.session);\n          setSession(result.session);"
);

fs.writeFileSync('src/App.tsx', content);
