import {
  ArcGisMapServerImageryProvider,
  ArcGISTiledElevationTerrainProvider,
  Cartesian3,
  Cartographic,
  Cesium3DTileset,
  Math as CesiumMath,
  Matrix4,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
} from "cesium";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Row,
  Slider,
  Switch,
} from "antd";
import { Colorpicker } from "antd-colorpicker";
import { CesiumHeatmap, ContourLineOption, HeatmapPoint } from "../source/cesiumHeatmap";

const defaultDataValue: [number, number] = [10, 200];
const defaultOpacityValue: [number, number] = [0, 1];
const defaultRadius = 20;

const PHeatMap = () => {
  const heatmap = useRef<CesiumHeatmap>();
  const [radius, setRadius] = useState(defaultRadius);
  const [showContour, setShowContour] = useState(true);
  const [contourCount, setContourCount] = useState(5);
  const [contourWidth, setContourWidth] = useState(1);
  const [contourColor, setContourColor] = useState('#ffffff');

  useEffect(() => {
    const viewer: Viewer = new Viewer("map", {
      imageryProvider: new ArcGisMapServerImageryProvider({
        url: "https://elevation3d.arcgis.com/arcgis/rest/services/World_Imagery/MapServer",
      }),
      terrainProvider: new ArcGISTiledElevationTerrainProvider({
        url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
      }),
      infoBox: false,
      selectionIndicator: false,
      animation: false,
      timeline: false,
      baseLayerPicker: false,
    });

    const _3DTileset = new Cesium3DTileset({
      url: "http://resource.dvgis.cn/data/3dtiles/ljz/tileset.json",
    });
    _3DTileset.readyPromise.then(function (argument) {
      viewer.scene.primitives.add(_3DTileset);
      const height = 40;
      const cartographic = Cartographic.fromCartesian(
        _3DTileset.boundingSphere.center
      );
      const surface = Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        cartographic.height
      );
      const offset = Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        cartographic.height + height
      );
      const translation = Cartesian3.subtract(
        offset,
        surface,
        new Cartesian3()
      );
      _3DTileset.modelMatrix = Matrix4.fromTranslation(translation);
    });

    const points: HeatmapPoint[] = [];
    fetch("/datas/geojson/busstop2016.geojson", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      response.json().then((data) => {
        if (data) {
          data.features.forEach(function (feature: any) {
            const lon = feature.geometry.coordinates[0];
            const lat = feature.geometry.coordinates[1];
            const _value: number = 100 * Math.random();
            points.push({
              x: lon,
              y: lat,
              value: _value,
            });
          });
        }

        heatmap.current = new CesiumHeatmap(viewer, {
          zoomToLayer: true,
          points,
          heatmapDataOptions: {
            max: defaultDataValue[1],
            min: defaultDataValue[0],
          },
          heatmapOptions: {
            maxOpacity: defaultOpacityValue[1],
            minOpacity: defaultOpacityValue[0],
          },
          onRadiusChange: (radius) => {
            setRadius(radius);
          },
          contourLineOption: {
            show: showContour,
            contourCount: contourCount,
            width: contourWidth,
            color: contourColor,
          }
        });
      });
    });

    return () => {
        heatmap.current?.remove();
    }
  }, []);

  function onUpdate(value: [number, number]) {
    heatmap.current?.updateHeatMapMaxMin({
      min: value[0],
      max: value[1],
    });
  }

  function onUpdateOpacity(value: [number, number]) {
    heatmap.current?.updateHeatmap({
      minOpacity: value[0],
      maxOpacity: value[1],
    } as any);
  }

  function onUpdateRadius(value: number) {
    heatmap.current?.updateRadius(value);
  }

  function remove() {
    heatmap.current?.remove();
  }

  const onContourLineChange = (option: ContourLineOption) => {
    heatmap.current?.updateContourLineOption(option);
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div style={{ width: "100%", height: "100%" }} id="map"></div>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 5000,
          width: 300,
        }}
      >
        <Card title="Heatmap Controls" size="small">
          <Row style={{ alignItems: "center", marginTop: 10 }}>
            <Col span={8}>Data Range</Col>
            <Col span={16}>
              <Slider
                min={0}
                max={1000}
                range
                defaultValue={defaultDataValue}
                onChange={onUpdate}
              />
            </Col>
          </Row>
          <Row style={{ alignItems: "center", marginTop: 10 }}>
            <Col span={8}>Opacity</Col>
            <Col span={16}>
              <Slider
                step={0.1}
                min={0}
                max={1}
                range
                defaultValue={defaultOpacityValue}
                onChange={onUpdateOpacity}
              />
            </Col>
          </Row>
          <Row style={{ alignItems: "center", marginTop: 10 }}>
            <Col span={8}>Radius</Col>
            <Col span={16}>
              <Slider
                step={0.1}
                min={0}
                max={100}
                value={radius}
                onChange={onUpdateRadius}
              />
            </Col>
          </Row>
          <Row style={{ alignItems: "center", marginTop: 10 }}>
            <Col span={8}>Contour</Col>
            <Col span={16}>
              <Switch checked={showContour} onChange={e => {
                setShowContour(e);
                onContourLineChange({ show: e });
              }} />
            </Col>
          </Row>
          {showContour && <>
            <Row style={{ alignItems: "center", marginTop: 10 }}>
              <Col span={8}>Count</Col>
              <Col span={16}>
                <Slider
                  defaultValue={contourCount}
                  max={20}
                  min={1}
                  onChange={(e) => {
                    setContourCount(e);
                    onContourLineChange({ contourCount: e });
                  }}
                />
              </Col>
            </Row>
            <Row style={{ alignItems: "center", marginTop: 10 }}>
              <Col span={8}>Width</Col>
              <Col span={16}>
                <Slider
                  defaultValue={contourWidth}
                  max={10}
                  min={1}
                  onChange={(e) => {
                    setContourWidth(e);
                    onContourLineChange({ width: e });
                  }}
                />
              </Col>
            </Row>
            <Row style={{ alignItems: "center", marginTop: 10 }}>
              <Col span={8}>Color</Col>
              <Col span={16}>
                <Colorpicker value={contourColor} onChange={(e) => {
                  const color = e.hex;
                  setContourColor(color);
                  onContourLineChange({ color: color });
                }} />
              </Col>
            </Row>
          </>}
          <Row style={{ marginTop: 10, justifyContent: 'flex-end' }}>
            <Col>
                <Button type="primary" onClick={remove}>
                    Remove
                </Button>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default PHeatMap;
