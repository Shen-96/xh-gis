/*
 * Vite 插件：在开发模式下提供 ref-doc 静态资源
 */
import type { Plugin, ViteDevServer } from 'vite';
import { resolve, join, normalize } from 'path';
import { existsSync, statSync, createReadStream } from 'fs';

export default function refDocPlugin(): Plugin {
  let refDocPath = '';
  let root = '';

  return {
    name: 'ref-doc-plugin',

    configResolved(config) {
      root = config.root;
      // 尝试从 ref-doc 包获取文档路径
      refDocPath = resolve(root, '../ref-doc/dist');
      
      if (!existsSync(refDocPath)) {
        console.warn('[ref-doc-plugin] ref-doc 目录不存在:', refDocPath);
      }
    },

    configureServer(server: ViteDevServer) {
      if (!existsSync(refDocPath)) {
        return;
      }

      // 设置中间件，将 /ref-doc/* 请求映射到 ref-doc/dist/*
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        // 移除查询参数和 hash，只保留路径部分
        const pathname = url.split('?')[0].split('#')[0];
        
        // 匹配 /ref-doc/ 路径
        if (pathname.startsWith('/ref-doc/')) {
          // 移除 /ref-doc 前缀，获取相对路径
          const relativePath = pathname.replace('/ref-doc/', '');
          const filePath = resolve(refDocPath, relativePath || 'index.html');
          
          // 安全检查：确保文件路径在 ref-doc 目录内
          const normalizedPath = normalize(filePath);
          const normalizedRefDocPath = normalize(refDocPath);
          if (!normalizedPath.startsWith(normalizedRefDocPath)) {
            next();
            return;
          }
          
          if (existsSync(filePath)) {
            const stat = statSync(filePath);
            if (stat.isFile()) {
              // 设置正确的 Content-Type
              const ext = filePath.split('.').pop()?.toLowerCase();
              const contentTypeMap: Record<string, string> = {
                'html': 'text/html',
                'css': 'text/css',
                'js': 'application/javascript',
                'json': 'application/json',
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'gif': 'image/gif',
                'svg': 'image/svg+xml',
                'ico': 'image/x-icon',
              };
              res.setHeader('Content-Type', contentTypeMap[ext || ''] || 'application/octet-stream');
              
              // 流式传输文件，添加错误处理
              const stream = createReadStream(filePath);
              stream.on('error', (err) => {
                if (!res.headersSent) {
                  res.statusCode = 500;
                  res.end('Internal Server Error');
                }
              });
              stream.pipe(res);
              return;
            } else if (stat.isDirectory()) {
              // 如果是目录，重定向到 index.html
              const indexPath = join(filePath, 'index.html');
              if (existsSync(indexPath)) {
                res.writeHead(302, { Location: pathname + '/index.html' });
                res.end();
                return;
              }
            }
          }
        }
        next();
      });
    },
  };
}

