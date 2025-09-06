const fs = require('fs');
const path = require('path');

function listTsFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...listTsFiles(p));
    else if (p.endsWith('.ts')) out.push(p);
  }
  return out;
}

const root = path.join('pages', 'api');
const files = listTsFiles(root);
for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');

  // Remove type-only imports from 'next'
  s = s.replace(/import\s+type\s*{\s*NextApiRequest\s*(,\s*NextApiResponse\s*)?}\s*from\s*['"]next['"]\s*;?\s*/g, '');
  s = s.replace(/import\s+type\s*{\s*NextApiResponse\s*}\s*from\s*['"]next['"]\s*;?\s*/g, '');

  // Relax function signatures to avoid duplicate type errors
  s = s.replace(/\(req:\s*NextApiRequest\s*,\s*res:\s*NextApiResponse\s*\)/g, '(req: any, res: any)');
  s = s.replace(/req:\s*NextApiRequest/g, 'req: any');
  s = s.replace(/res:\s*NextApiResponse/g, 'res: any');

  fs.writeFileSync(file, s);
  console.log('Patched', file);
}
