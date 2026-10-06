// Downloads the real Fight Syndicate assets from the original site into assets/img/.
// Usage: npm run fetch-assets   (needs network access to fightsyndicatemma.com)
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const U = 'https://fightsyndicatemma.com/wp-content/uploads/2024/04/';
const out = fileURLToPath(new URL('../assets/img/', import.meta.url));

// local name -> source URL (all supplied in the project brief)
const manifest = {
  'logo-white.png': 'Fight-Syndicate-Printe-Logo-White.png',
  'og.jpg': 'FS-1080X1080-2-2-1024x1024.jpg',
  'mma.png': 'Fight-Syndicate-MMA.png',
  'boxing.png': 'Boxing.png',
  'muay-thai.png': 'Fight-Syndicate-Kick-Boxing.png',
  'jiu-jitsu.png': 'Fight-Syndicate-Jiu-Jitsu.png',
  'kids.png': 'Fight-Syndicate-Kids-Classes.png',
  'adult.png': 'Fight-Syndicate-Adult-Classes.png',
  'youth-fight-team.png': 'Fight-Syndicate-Fight-Team.png',
  'fight-team.png': 'Fight-Team.png',
  'community-1.jpeg': 'Fight-Syndicate-8-441x548-1.jpeg',
  'community-2.jpeg': 'Fight-Syndicate-7-768x955-1.jpeg',
  'community-isaac.png': 'Fight-Syndicate-Isaac-Fight.png',
  'community-devin.png': 'Fight-Sydnicate-Devin-Fight.png',
  'beau-1.jpg': 'IMG_8939.jpg',
  'beau-2.jpeg': 'Beau-King-1.jpeg',
  'beau-3.jpeg': 'Beau-King-2.jpeg',
  'big-bear-logo.png': 'Fight-Syndicate-Big-Bear-Claw.png',
  'big-bear.png': 'Fight-Syndicate-Big-Bear-Location.png',
  'murrieta-logo.png': 'Fight-Syndicate-Murrieta-Crown.png',
  'murrieta.png': 'Fight-Syndicate-Murrieta-Location.png',
  'mexico-logo.png': 'Fight-Syndicate-Mexico-Logo.png',
  'mexico.png': 'Fight-Syndicate-Mexico.png',
};

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (fs-site asset fetch)' } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r;
}

await mkdir(out, { recursive: true });
let failed = 0;
for (const [name, file] of Object.entries(manifest)) {
  try {
    await writeFile(join(out, name), Buffer.from(await (await get(U + file)).arrayBuffer()));
    console.log('ok   ', name);
  } catch (e) { failed++; console.log('FAIL ', name, '-', e.message); }
}

// The brick-wall hero art has no URL in the brief: find it on the live homepage.
try {
  const html = await (await get('https://fightsyndicatemma.com/')).text();
  const all = [...new Set(html.match(/https?:\/\/[^"'\s)]+\.(?:png|jpe?g|webp)/gi) || [])];
  await writeFile(join(out, '_homepage-images.txt'), all.join('\n'));
  const brick = all.find((u) => /brick/i.test(u)) || all.find((u) => /(hero|banner|wall|slide)/i.test(u));
  if (brick) {
    // browsers sniff image bytes, so the extension here doesn't have to match the format
    await writeFile(join(out, 'hero-brick.jpg'), Buffer.from(await (await get(brick)).arrayBuffer()));
    console.log('ok    hero-brick.jpg <-', brick);
  } else {
    console.log('NOTE  no brick-wall image found automatically; see assets/img/_homepage-images.txt and save the right one as assets/img/hero-brick.jpg');
  }
} catch (e) { failed++; console.log('FAIL  homepage scan -', e.message); }

console.log(failed ? `\n${failed} item(s) failed.` : '\nAll assets downloaded.');
