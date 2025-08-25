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
import { Button, Descriptions, Popconfirm, Table, TableProps } from "antd";
import { IconFontClass } from "@/components/Iconfont";
import AbstractCore from "@/lib-client/xh-gis/Core/AbstractCore";
import { CoreType } from "@/lib-client/xh-gis";

type Props = PropsWithoutRef<{
  coreRef?: RefObject<AbstractCore<CoreType>>;
}>;

const PlotList: FC<Props> = ({ coreRef }) => {
  const columns: TableProps["columns"] = [
    {
      key: "key",
      title: "序号",
      render(_rowData, _rowIndex, index) {
        return <span>{index + 1}</span>;
      },
    },
    {
      key: "id",
      title: "ID",
      width: 80,
      render(rowData) {
        return <span>{rowData.id}</span>;
      },
    },
    {
      key: "name",
      title: "名称",
      render(rowData) {
        return <span>{rowData.name}</span>;
      },
    },
    {
      key: "operation",
      title: "操作",
      render(rowData) {
        return (
          <>
            <Popconfirm
              title={<IconFontClass className={"button"} icon="shanchu" />}
              onConfirm={() => {
                const xgCore = window.xgEarth ?? window.xgMap;

                xgCore?.graphicManager.removeById(rowData.id ?? "");
              }}
            >
              是否删除？
            </Popconfirm>
            <span
              onClick={() => {
                const xgCore = window.xgEarth ?? window.xgMap;
                xgCore?.graphicManager
                  .getById(rowData.id ?? "")
                  ?.startGrowthAnimation({
                    duration: 1000,
                    delay: 500,
                    loop: false,
                    callback: () => {},
                  });
              }}
            >
              开始
            </span>
            {/* <IconFontClass className={"button"} icon="icon-sanjiaoxing" /> */}
          </>
        );
      },
    },
  ];

  const [dataSource, setDataSource] = useState<TableProps["dataSource"]>([]);

  const exportGraphicsJson = useCallback(() => {
    // console.log(state.tableData);
    // window.simv?.templateManager.save2json(
    //   state.tableData,
    //   `${Date.now().toString()}.json`
    // );

    coreRef?.current?.graphicManager.save2Json();
  }, []);

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
            name: symbol.graphicName + index,
          }))
        );
      }
    }, 5 * 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={"xh-gis-plot-tools-list"}>
      <div className={"operation"}>
        <Descriptions column={1} bordered>
          <Descriptions.Item key={Math.random()} label="数据导出">
            <Button onClick={exportGraphicsJson}>GraphicsJSON</Button>
            <Button>GeoJSON</Button>
          </Descriptions.Item>
        </Descriptions>
      </div>
      <div className={"data"}>
        <Table columns={columns} dataSource={dataSource} />
      </div>
    </div>
  );
};

export default PlotList;
