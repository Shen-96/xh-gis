import { CustomDataSource, Entity, createGuid } from "cesium";
import type LayerManager from "../LayerManager";
import type { LayerConfig } from "../../types";
import { GraphicType } from "../../enum";
import CoordinateUtils from "../CoordinateUtils";
import GraphicManager from "../GraphicManager";
import GraphicUtils from "../GraphicUtils";
import GeometryUtils from "../GeometryUtils";

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
              case GraphicType.LABEL: {
                const { position } = graphic;

                if (position) {
                  const cartesian = CoordinateUtils.pointToCar3(position);

                  entity.merge(
                    new Entity({
                      position: cartesian,
                      label: GraphicUtils.generateLabelGraphicsOptionsFromStyle(
                        graphic.style
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
                const { position } = graphic;

                if (position) {
                  const cartesian = CoordinateUtils.pointToCar3(position);
                  const points = GeometryUtils.generateCirclePoints(
                    CoordinateUtils.car3ToProjectionPnt(cartesian),
                    graphic.style?.radius ?? 0
                  );

                  entity.merge(
                    new Entity({
                      polygon:
                        GraphicUtils.generatePolygonGraphicsOptionsFromGraphic({
                          style: graphic.style,
                          positions: CoordinateUtils.projPntArr2PointArr(points),
                        }),
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
              case GraphicType.POLYLINE: {
                const { positions } = graphic;

                if (positions) {
                  entity.merge(
                    new Entity({
                      polyline:
                        GraphicUtils.generatePolylineGraphicsOptionsFromGraphic({
                          style: graphic.style,
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
                const { positions } = graphic;

                if (positions) {
                  entity.merge(
                    new Entity({
                      polygon:
                        GraphicUtils.generatePolygonGraphicsOptionsFromGraphic({
                          style: graphic.style,
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
                const { code, position, positions } = graphic;

                if (position) {
                  const cartesian = CoordinateUtils.pointToCar3(position);

                  entity.merge(
                    new Entity({
                      position: cartesian,
                      billboard:
                        GraphicUtils.generateBillboardGraphicsOptionsFromStyle({
                          ...(graphic.style as any),
                          image: `/data/symbol/icon/${code}.png`,
                        }),
                      label: GraphicUtils.generateLabelGraphicsOptionsFromStyle({
                        ...(graphic.style as any),
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
                            ...(graphic.style as any),
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