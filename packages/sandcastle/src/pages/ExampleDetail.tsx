/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-12-06 11:10:47
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-06 12:35:06
 */
import React, { Suspense, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getExample } from '../examples/registry';

const ExampleDetail: React.FC = () => {
  const params = useParams();
  const categoryId = params.categoryId ?? 'basic';
  const exampleId = params.exampleId ?? '';
  const meta = useMemo(() => getExample(categoryId, exampleId), [categoryId, exampleId]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [saving, setSaving] = useState(false);

  if (!meta) {
    return <div style={{ padding: 24 }}>未找到示例</div>;
  }

  const LazyComp = React.lazy(meta.importer);

  const handleSaveThumbnail = async () => {
    if (saving) return;
    try {
      setSaving(true);
      const root = containerRef.current || document.body;
      const nodes = Array.from(root.querySelectorAll('canvas')) as HTMLCanvasElement[];
      if (!nodes.length) {
        alert('未找到画布');
        setSaving(false);
        return;
      }
      let target: HTMLCanvasElement | null = null;
      let maxArea = 0;
      for (const c of nodes) {
        const w = c.width || c.clientWidth || 0;
        const h = c.height || c.clientHeight || 0;
        const area = w * h;
        if (area > maxArea) {
          maxArea = area;
          target = c;
        }
      }
      if (!target) {
        alert('未找到有效画布');
        setSaving(false);
        return;
      }
      const dataUrl = target.toDataURL('image/png');
      const res = await fetch(`/__thumbnail?categoryId=${categoryId}&exampleId=${exampleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl })
      });
      const json = await res.json();
      if (json?.ok) {
        alert('缩略图已保存');
        try {
          const img = document.querySelector(`#example-${categoryId}-${exampleId} img`) as HTMLImageElement | null;
          if (img) {
            img.src = img.src.replace(/([?&])v=\d+/, '') + (img.src.includes('?') ? `&v=${Date.now()}` : `?v=${Date.now()}`);
          }
        } catch (e) { void 0; }
      } else {
        alert('保存失败');
      }
    } catch (e) {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={containerRef} style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>{meta.title}</h2>
        {meta.description && <p style={{ color: '#64748b' }}>{meta.description}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          {import.meta.env.DEV && (
            <button
              onClick={handleSaveThumbnail}
              disabled={saving}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: saving ? '#e5e7eb' : '#f1f5f9',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? '保存中…' : '保存缩略图'}
            </button>
          )}
        </div>
      </div>
      <Suspense fallback={<div style={{ padding: 24 }}>加载示例中...</div>}>
        <LazyComp />
      </Suspense>
    </div>
  );
};

export default ExampleDetail;
