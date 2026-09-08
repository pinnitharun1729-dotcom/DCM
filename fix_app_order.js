import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Find the block
const blockRegex = /  \/\/ Handle Google Redirect Result \[\s\S\]*?  \}, \[\]\);/m;
const match = content.match(/  \/\/ Handle Google Redirect Result[\s\S]*?\}, \[\]\);/);

if (match) {
  content = content.replace(match[0], "");
  
  // Insert after const [session, setCurrentSession]
  content = content.replace(
    /const \[session, setCurrentSession\] = useState<AuthSession \| null>\(\(\) => getSession\(\)\);/,
    "const [session, setCurrentSession] = useState<AuthSession | null>(() => getSession());\n\n" + match[0]
  );
  
  fs.writeFileSync('src/App.tsx', content);
}
