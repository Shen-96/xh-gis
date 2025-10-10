/*
 * @Descripttion: xxx
 * @Author: EV-申小虎
 * @version: 1.0.0
 * @Date: 2023-09-11 11:20:37
 * @LastEditors: EV-申小虎
 * @LastEditTime: 2025-04-15 03:14:32
 */
import React, {
  FC,
  PropsWithoutRef,
  RefObject,
  useCallback,
  useEffect,
  useState,
} from "react";
import "./index.css";
import { AbstractCore, CoreType } from "@xh-gis/engine";

// 简化版图标组件
const IconFontClass: React.FC<{ className?: string; icon: string }> = ({ className, icon }) => {
  return <i className={`${className} ${icon}`}></i>;
};

type GraphicItem = {
  key: string;
  id: string;
  name: string;
};

type Props = PropsWithoutRef<{
  coreRef?: RefObject<AbstractCore<CoreType>>;
}>;

const PlottingList: FC<Props> = ({ coreRef }) => {
  const [dataSource, setDataSource] = useState<GraphicItem[]>([]);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const exportGraphicsJson = useCallback(() => {
    coreRef?.current?.graphicManager.save2Json();
  }, [coreRef]);

  const handleDelete = useCallback((id: string) => {
    const xgCore = coreRef?.current;
    xgCore?.graphicManager.removeById(id);
    setShowConfirm(null);
  }, [coreRef]);

  const handleStartAnimation = useCallback((id: string) => {
    const xgCore = coreRef?.current;
    xgCore?.graphicManager
      .getById(id)
      ?.startGrowthAnimation({
        duration: 1000,
        delay: 500,
        loop: false,
        callback: () => {},
      });
  }, [coreRef]);

  useEffect(() => {
    /// 更新当前选中标绘
    const timer = setInterval(() => {
      const xgCore = coreRef?.current;

      if (xgCore) {
        const symbols = xgCore.graphicManager.getAll();

        setDataSource(
          symbols.map((symbol, index) => ({
            key: symbol.id,
            id: symbol.id,
            name: (symbol.graphicName || "未命名") + index,
          }))
        );
      }
    }, 5 * 100);

    return () => {
      clearInterval(timer);
    };
  }, [coreRef]);

  return (
    <div className={"xh-gis-plot-tools-list"}>
      <div className={"operation"}>
        <div className="export-section">
          <h3>数据导出</h3>
          <button onClick={exportGraphicsJson}>GraphicsJSON</button>
          <button>GeoJSON</button>
        </div>
      </div>
      <div className={"data"}>
        <h3>标绘列表</h3>
        <table className="plotting-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>ID</th>
              <th>名称</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {dataSource.map((item, index) => (
              <tr key={item.key}>
                <td>{index + 1}</td>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>
                  {showConfirm === item.id ? (
                    <div>
                      <span>是否删除？</span>
                      <button onClick={() => handleDelete(item.id)}>确定</button>
                      <button onClick={() => setShowConfirm(null)}>取消</button>
                    </div>
                  ) : (
                    <div>
                      <button 
                        className="delete-btn"
                        onClick={() => setShowConfirm(item.id)}
                      >
                        删除
                      </button>
                      <button 
                        className="start-btn"
                        onClick={() => handleStartAnimation(item.id)}
                      >
                        开始
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlottingList;