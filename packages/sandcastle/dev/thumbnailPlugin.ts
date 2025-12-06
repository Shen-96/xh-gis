import type { Plugin, ViteDevServer } from 'vite';
import { resolve, dirname } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function updateRegistryThumbnail(registryPath: string, categoryId: string, exampleId: string, relPath: string) {
  let src = readFileSync(registryPath, 'utf8');
  let idPos = src.indexOf(`id: '${exampleId}'`);
  if (idPos === -1) idPos = src.indexOf(`id: "${exampleId}"`);
  if (idPos === -1) return false;
  let start = idPos;
  while (start > 0 && src[start] !== '{') start--;
  if (src[start] !== '{') return false;
  let depth = 0;
  let end = start;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      end = i;
      if (depth === 0) break;
    }
  }
  if (depth !== 0) return false;
  const block = src.slice(start, end + 1);
  const hasThumb = /thumbnail:\s*['"].*?['"]/m.test(block);
  let newBlock: string;
  if (hasThumb) {
    newBlock = block.replace(/thumbnail:\s*(['"]).*?\1/m, `thumbnail: '${relPath}'`);
  } else {
    if (/level:\s*['"]/m.test(block)) {
      newBlock = block.replace(/(level:\s*['"][^'"]+['"]\s*,\s*)/m, `$1\n    thumbnail: '${relPath}',\n    `);
    } else if (/importer:\s*\(\)\s*=>/m.test(block)) {
      newBlock = block.replace(/(importer:\s*\(\)\s*=>)/m, `thumbnail: '${relPath}',\n    $1`);
    } else {
      newBlock = block.replace(/\n\s*\}/m, `,\n    thumbnail: '${relPath}'\n  }`);
    }
  }
  src = src.slice(0, start) + newBlock + src.slice(end + 1);
  writeFileSync(registryPath, src, 'utf8');
  return true;
}

export default function thumbnailPlugin(): Plugin {
  return {
    name: 'thumbnail-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/__thumbnail', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          const url = new URL(req.url ?? '', 'http://localhost');
          const categoryId = url.searchParams.get('categoryId') || 'basic';
          const exampleId = url.searchParams.get('exampleId') || '';
          const chunks: Buffer[] = [];
          await new Promise<void>((resolvePromise) => {
            req.on('data', (c) => chunks.push(Buffer.from(c)));
            req.on('end', () => resolvePromise());
          });
          const bodyStr = Buffer.concat(chunks).toString('utf8');
          const body = JSON.parse(bodyStr || '{}');
          const dataUrl: string = body?.dataUrl || '';
          const match = dataUrl.match(/^data:image\/png;base64,(.*)$/);
          if (!exampleId || !match) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: 'invalid payload' }));
            return;
          }

          const base64 = match[1];
          const rootDir = server.config.root || dirname(server.config.configFile || __filename);
          const dir = resolve(rootDir, 'public', 'thumbnails', categoryId);
          ensureDir(dir);
          const filePath = resolve(dir, `${exampleId}.png`);
          writeFileSync(filePath, Buffer.from(base64, 'base64'));

          const relPath = `thumbnails/${categoryId}/${exampleId}.png`;
          // 如果使用 JSON 管理示例元数据，直接写入 JSON；否则回退到 TS 注册表修改
          const jsonPath = resolve(rootDir, 'src', 'examples', 'examples.json');
          let ok = false;
          try {
            const list = JSON.parse(readFileSync(jsonPath, 'utf8')) as any[];
            const idx = list.findIndex((e) => e.id === exampleId && e.categoryId === categoryId);
            if (idx >= 0) {
              list[idx].thumbnail = relPath;
              writeFileSync(jsonPath, JSON.stringify(list, null, 2), 'utf8');
              ok = true;
            }
          } catch {
            const registryPath = resolve(rootDir, 'src', 'examples', 'registry.ts');
            ok = updateRegistryThumbnail(registryPath, categoryId, exampleId, relPath);
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, saved: relPath, registryUpdated: ok }));
        } catch (e: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: e?.message || String(e) }));
        }
      });
    },
  };
}
