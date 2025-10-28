import { CustomDataSource, Entity, createGuid } from "cesium";
import type LayerManager from "../LayerManager";
import type {
  LayerConfig,
  PointGraphicOptions,
  LabelGraphicOptions,
  PolylineGraphicOptions,
  PolygonGraphicOptions,
  CircleGraphicOptions,
  SymbolGraphicOptions,
  EllipseGraphicOptions,
} from "../../types";
import { GraphicType } from "../../enum";
import CoordinateUtils from "../CoordinateUtils";
import GraphicManager from "../GraphicManager";
import GraphicUtils from "../GraphicUtils";
import GeometryUtils from "../GeometryUtils";
import MathUtils from "../MathUtils";

export function loadLayers(
  manager: LayerManager,
  layers: Array<LayerConfig>
) {
  return Promise.all(
    layers?.map(
      async ({
        id: layerId,
        name: layerName,
        type: layerType,
        show: layerShow,
        data: layerData,
      }): Promise<void> => {
        if (layerType == "graphic") {
          const dataSource = new CustomDataSource(layerName);
          await manager.add(layerId ?? createGuid(), dataSource, layerShow);

          layerData?.forEach((graphic) => {
            const { id: graphicId, name, show } = graphic;

            const entity = dataSource.entities.add({
              id: graphicId ?? createGuid(),
              name,
              show,
            });

            switch (graphic.type) {
              case GraphicType.POINT: {
                const g = graphic as PointGraphicOptions;
                const { position } = g;

                if (position) {
                  const cartesian = CoordinateUtils.pointToCar3(position);

                  entity.merge(
                    new Entity({
                      position: cartesian,
                      point:
                        GraphicUtils.generatePointGraphicsOptionsFromStyle(
                          g.style as any
                        ),
                    })
                  );
                } else {
                  console.warn(
                    "Layer ->",
                    layerId,
                    "GraphicType.POINT ->",
                    graphicId,
                    "未设置位置"
                  );
                }
                break;
              }
              case GraphicType.LABEL: {
                const g = graphic as LabelGraphicOptions;
                const { position } = g;

                if (position) {
                  const cartesian = CoordinateUtils.pointToCar3(position);

                  entity.merge(
                    new Entity({
                      position: cartesian,
                      label: GraphicUtils.generateLabelGraphicsOptionsFromStyle(
                        g.style
                      ),
                    })
                  );
                } else {
                  console.warn(
                    "Layer ->",
                    layerId,
                    "GraphicType.LABEL ->",
                    graphicId,
                    "未设置位置"
                  );
                }
                break;
              }
              case GraphicType.CIRCLE: {
                const g = graphic as CircleGraphicOptions;
                const { position } = g;

                if (position) {
                  const cartesian = CoordinateUtils.pointToCar3(position);
                  const points = GeometryUtils.generateCirclePoints(
                    CoordinateUtils.car3ToProjectionPnt(cartesian),
                    g.style?.radius ?? 0
                  );

                  entity.merge(
                    new Entity({
                      polygon:
                        GraphicUtils.generatePolygonGraphicsOptionsFromGraphic({
                          style: g.style,
                          positions: CoordinateUtils.projPntArr2PointArr(points),
                        }),
                    })
                  );
                } else {
                  console.warn(
                    "Layer ->",
                    layerId,
                    "GraphicType.CIRCLE ->",
                    graphicId,
                    "未设置位置"
                  );
                }
                break;
              }
              case GraphicType.ELLIPSE: {
                const g = graphic as EllipseGraphicOptions;
                const { position, positions } = g;

                let polygonPositions: Array<[number, number, number?]> | undefined;

                if (position && (g.style?.semiMajorAxis || g.style?.semiMinorAxis)) {
                  const centerCar3 = CoordinateUtils.pointToCar3(position);
                  const centerProj = CoordinateUtils.car3ToProjectionPnt(centerCar3);
                  const a = (g.style as any)?.semiMajorAxis ?? 0;
                  const b = (g.style as any)?.semiMinorAxis ?? 0;

                  const pointsProj = GeometryUtils.generateEllipsePoints(centerProj, a, b);
                  polygonPositions = CoordinateUtils.projPntArr2PointArr(pointsProj);
                } else if (positions && positions.length >= 2) {
                  // 椭圆由最小外接矩形的两个顶点控制（例如左上与右下）
                  const car3Arr = CoordinateUtils.point3DegArrToCar3Arr(positions);
                  const projArr = CoordinateUtils.car3ArrToProjectionPntArr(car3Arr);
                  const p1 = projArr[0];
                  const p2 = projArr[1];
                  const minX = Math.min(p1[0], p2[0]);
                  const maxX = Math.max(p1[0], p2[0]);
                  const minY = Math.min(p1[1], p2[1]);
                  const maxY = Math.max(p1[1], p2[1]);
                  const center: [number, number] = [
                    (minX + maxX) / 2,
                    (minY + maxY) / 2,
                  ];
                  const a = (maxX - minX) / 2; // 半长轴（x方向）
                  const b = (maxY - minY) / 2; // 半短轴（y方向）

                  if (a > 0 && b > 0) {
                    const pointsProj = GeometryUtils.generateEllipsePoints(
                      center,
                      a,
                      b
                    );
                    polygonPositions = CoordinateUtils.projPntArr2PointArr(pointsProj);
                  } else {
                    console.warn(
                      "Layer ->",
                      layerId,
                      "GraphicType.ELLIPSE ->",
                      graphicId,
                      "外接矩形半轴长度非法"
                    );
                  }
                } else {
                  console.warn(
                    "Layer ->",
                    layerId,
                    "GraphicType.ELLIPSE ->",
                    graphicId,
                    "未设置位置或positions不足2个"
                  );
                }

                if (polygonPositions) {
                  entity.merge(
                    new Entity({
                      polygon: GraphicUtils.generatePolygonGraphicsOptionsFromGraphic({
                        style: g.style,
                        positions: polygonPositions,
                      }),
                    })
                  );
                }

                break;
              }
              case GraphicType.POLYLINE: {
                const g = graphic as PolylineGraphicOptions;
                const { positions } = g;

                if (positions) {
                  entity.merge(
                    new Entity({
                      polyline:
                        GraphicUtils.generatePolylineGraphicsOptionsFromGraphic({
                          style: g.style,
                          positions,
                        }),
                    })
                  );
                } else {
                  console.warn(
                    "Layer ->",
                    layerId,
                    "GraphicType.POLYLINE ->",
                    graphicId,
                    "未设置位置"
                  );
                }
                break;
              }
              case GraphicType.POLYGON: {
                const g = graphic as PolygonGraphicOptions;
                const { positions } = g;

                if (positions) {
                  entity.merge(
                    new Entity({
                      polygon:
                        GraphicUtils.generatePolygonGraphicsOptionsFromGraphic({
                          style: g.style,
                          positions,
                        }),
                    })
                  );
                } else {
                  console.warn(
                    "Layer ->",
                    layerId,
                    "GraphicType.POLYGON ->",
                    graphicId,
                    "未设置位置"
                  );
                }
                break;
              }
              case GraphicType.SYMBOL: {
                const g = graphic as SymbolGraphicOptions;
                const { code, position, positions } = g;

                if (position) {
                  const cartesian = CoordinateUtils.pointToCar3(position);

                  entity.merge(
                    new Entity({
                      position: cartesian,
                      billboard:
                        GraphicUtils.generateBillboardGraphicsOptionsFromStyle({
                          ...(g.style as any),
                          image: `/data/symbol/icon/${code}.png`,
                        }),
                      label: GraphicUtils.generateLabelGraphicsOptionsFromStyle({
                        ...(g.style as any),
                        text: name,
                      }),
                    })
                  );
                } else if (positions) {
                  //@ts-ignore
                  const SymbolClass = GraphicManager.getSymbolClass(code),
                    //@ts-ignore
                    arrowPos = SymbolClass?.generateGeometry(positions, code);

                  entity.merge(
                    new Entity({
                      polyline:
                        GraphicUtils.generatePolylineGraphicsOptionsFromGraphic({
                          positions: arrowPos,
                          style: {
                            width: 3,
                            ...(g.style as any),
                          },
                        }),
                    })
                  );
                }
                break;
              }
              default:
                break;
            }
          });
        }
      }
    )
  );
}