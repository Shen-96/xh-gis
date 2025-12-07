import React, { ReactNode, RefObject, useCallback, useMemo, useRef, useState } from "react";
import "../index.css";
import "./index.css";
import { AbstractCore, CoreType } from "@xh-gis/engine";
import { Cartesian3, Cartographic, Math as CesiumMath } from "cesium";

type Bookmark = {
  id: string;
  name: string;
  lon: number;
  lat: number;
  height: number;
  headingDeg: number;
  pitchDeg: number;
  rollDeg: number;
};

export type CameraBookmarksProps = {
  coreRef?: RefObject<AbstractCore<CoreType>>;
  initialBookmarks?: Bookmark[];
  header?: ReactNode;
  storageKey?: string;
  onChange?: (bookmarks: Bookmark[]) => void;
};

export default function CameraBookmarks({ coreRef, initialBookmarks, header, storageKey = "xhgis_camera_bookmarks", onChange }: CameraBookmarksProps) {
  const counterRef = useRef<number>(1);
  const defaults: Bookmark[] = useMemo(
    () =>
      initialBookmarks || [
        { id: "bj", name: "北京上空", lon: 116.4074, lat: 39.9042, height: 1500000, headingDeg: 0, pitchDeg: -35, rollDeg: 0 },
        { id: "sh", name: "上海上空", lon: 121.4737, lat: 31.2304, height: 1200000, headingDeg: 20, pitchDeg: -35, rollDeg: 0 },
        { id: "cd", name: "成都上空", lon: 104.0665, lat: 30.5728, height: 1200000, headingDeg: -20, pitchDeg: -35, rollDeg: 0 },
      ],
    [initialBookmarks]
  );
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const raw = storageKey ? localStorage.getItem(storageKey) : null;
      if (raw) return JSON.parse(raw) as Bookmark[];
    } catch {}
    return defaults;
  });

  const syncPersist = useCallback((next: Bookmark[]) => {
    try {
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
    onChange?.(next);
  }, [storageKey, onChange]);

  const addCurrentBookmark = useCallback(() => {
    const core = coreRef?.current as any;
    const viewer = core?.viewer;
    try {
      const cam = viewer?.scene?.camera;
      if (!cam) return;
      const carto = Cartographic.fromCartesian(cam.position);
      const lon = CesiumMath.toDegrees(carto.longitude);
      const lat = CesiumMath.toDegrees(carto.latitude);
      const height = carto.height;
      const name = `书签${counterRef.current++}`;
      const bm: Bookmark = {
        id: `cur-${Date.now()}`,
        name,
        lon,
        lat,
        height,
        headingDeg: CesiumMath.toDegrees(cam.heading),
        pitchDeg: CesiumMath.toDegrees(cam.pitch),
        rollDeg: CesiumMath.toDegrees(cam.roll),
      };
      setBookmarks((prev) => {
        const next = [bm, ...prev];
        syncPersist(next);
        return next;
      });
    } catch {}
  }, [coreRef, syncPersist]);

  const applyBookmark = useCallback(
    (bm: Bookmark) => {
      const core = coreRef?.current as any;
      const viewer = core?.viewer;
      try {
        if (!viewer?.scene?.camera) return;
        viewer.scene.camera.flyTo({
          destination: Cartesian3.fromDegrees(bm.lon, bm.lat, bm.height),
          orientation: {
            heading: CesiumMath.toRadians(bm.headingDeg),
            pitch: CesiumMath.toRadians(bm.pitchDeg),
            roll: CesiumMath.toRadians(bm.rollDeg),
          },
          duration: 1.5,
        });
      } catch {}
    },
    [coreRef]
  );

  const removeBookmark = useCallback(
    (id: string) => {
      setBookmarks((prev) => {
        const next = prev.filter((b) => b.id !== id);
        syncPersist(next);
        return next;
      });
    },
    [syncPersist]
  );

  const renameBookmark = useCallback((id: string, name: string) => {
    setBookmarks((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, name } : b));
      syncPersist(next);
      return next;
    });
  }, [syncPersist]);

  return (
    <div className="xh-gis-camera-bookmarks">
      <div className="cb-header">
        <h3 className="cb-title">{header || "相机书签"}</h3>
        <button
          className="cb-primary"
          onClick={addCurrentBookmark}
        >
          保存当前视角
        </button>
      </div>
      <div>
        {bookmarks.map((bm) => (
          <div key={bm.id} className="cb-item">
            <div>
              <div className="cb-name">{bm.name}</div>
              <div className="cb-desc">
                {bm.lon.toFixed(3)}, {bm.lat.toFixed(3)} · 高度 {Math.round(bm.height).toLocaleString()}m
              </div>
            </div>
            <div className="cb-actions">
              <button
                className="cb-button"
                onClick={() => applyBookmark(bm)}
              >
                飞到
              </button>
              <button
                className="cb-button"
                onClick={() => {
                  const name = prompt("重命名书签", bm.name);
                  if (typeof name === "string" && name.trim()) renameBookmark(bm.id, name.trim());
                }}
              >
                重命名
              </button>
              <button
                className="cb-button"
                onClick={() => removeBookmark(bm.id)}
              >
                删除
              </button>
            </div>
          </div>
        ))}
        {bookmarks.length === 0 && <div className="cb-empty">暂无书签</div>}
        <div className="cb-footer">
          <button
            className="cb-button"
            onClick={() => {
              try {
                const blob = new Blob([JSON.stringify(bookmarks, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "camera-bookmarks.json";
                a.click();
                URL.revokeObjectURL(url);
              } catch {}
            }}
          >
            导出 JSON
          </button>
          <button
            className="cb-button"
            onClick={async () => {
              try {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "application/json";
                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  const next = JSON.parse(text) as Bookmark[];
                  setBookmarks(next);
                  syncPersist(next);
                };
                input.click();
              } catch {}
            }}
          >
            导入 JSON
          </button>
        </div>
      </div>
    </div>
  );
}
