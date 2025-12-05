/*
 * Register built-in custom materials backed by shaders.
 */
import { Color, Material, MaterialAppearance, Cartesian2, Cartesian3, PolylineMaterialAppearance } from "cesium";
import { registerMaterial } from "./MaterialRegistry";
import type {
  EllipsoidScanUniforms,
  EllipsoidElectricUniforms,
  EllipsoidSpiralUniforms,
  EllipsoidWaveUniforms,
  FlowLineUniforms,
  FlowPointUniforms,
  ConvectionPointUniforms,
  PolylineDashConvectionUniforms,
  PolylineDashSliderUniforms,
  CircleRippleUniforms,
  DynamicWallUniforms,
} from "./types";
import { MaterialType } from "../../enum";
import EllipsoidScanFS from "../Shaders/EllipsoidScanFS";
import EllipsoidElectricFS from "../Shaders/EllipsoidElectricFS";
import EllipsoidSpiralFS from "../Shaders/EllipsoidSpiralFS";
import EllipsoidWaveFS from "../Shaders/EllipsoidWaveFS";
import FlowLineFS from "../Shaders/FlowLineFS";
import FlowPointFS from "../Shaders/FlowPointFS";
import ConvectionPointFS from "../Shaders/ConvectionPointFS";
import PolylineDashConvectionFS from "../Shaders/PolylineDashConvectionFS";
import PolylineDashSliderFS from "../Shaders/PolylineDashSliderFS";
import CircleRippleFS from "../Shaders/CircleRippleFS";
import DynamicWallFS from "../Shaders/DynamicWallFS";
import { getResourceUrl } from "../../Core/ResourceConfig";

function toColor(colorLike: any, fallback = "#ffff00"): Color {
  if (colorLike instanceof Color) return colorLike;
  if (typeof colorLike === "string") return Color.fromCssColorString(colorLike);
  return Color.fromCssColorString(fallback);
}

registerMaterial(MaterialType.EllipsoidScan, (style: { material?: { customTexture?: { uniforms?: EllipsoidScanUniforms } } }) =>
  new MaterialAppearance({
    material: new Material({
      fabric: {
        uniforms: {
          color: toColor(style.material?.customTexture?.uniforms?.color, "#ffff00"),
          speed: style.material?.customTexture?.uniforms?.speed ?? 1,
          smooth: style.material?.customTexture?.uniforms?.smooth ?? false,
        },
        source: EllipsoidScanFS,
      },
    }),
  })
);

registerMaterial(MaterialType.EllipsoidElectric, (style: { material?: { customTexture?: { uniforms?: EllipsoidElectricUniforms } } }) =>
  new MaterialAppearance({
    material: new Material({
      fabric: {
        uniforms: {
          color: toColor(style.material?.customTexture?.uniforms?.color, "#ffff00"),
          speed: style.material?.customTexture?.uniforms?.speed ?? 1,
        },
        source: EllipsoidElectricFS,
      },
    }),
  })
);

registerMaterial(MaterialType.EllipsoidSpiral, (style: { material?: { customTexture?: { uniforms?: EllipsoidSpiralUniforms } } }) =>
  new MaterialAppearance({
    material: new Material({
      fabric: {
        uniforms: {
          color: toColor(style.material?.customTexture?.uniforms?.color, "#ffff00"),
          speed: style.material?.customTexture?.uniforms?.speed ?? 1,
        },
        source: EllipsoidSpiralFS,
      },
    }),
  })
);

registerMaterial(MaterialType.EllipsoidWave, (style: { material?: { customTexture?: { uniforms?: EllipsoidWaveUniforms } } }) =>
  new MaterialAppearance({
    material: new Material({
      fabric: {
        uniforms: {
          color: toColor(style.material?.customTexture?.uniforms?.color, "#ffff00"),
          speed: style.material?.customTexture?.uniforms?.speed ?? 1,
        },
        source: EllipsoidWaveFS,
      },
    }),
  })
);

// FlowLine
registerMaterial(MaterialType.FlowLine, (style: { material?: { customTexture?: { uniforms?: FlowLineUniforms } } }) => {
  const u = style.material?.customTexture?.uniforms ?? {};
  const repeat = u.repeat instanceof Cartesian2 ? u.repeat : new Cartesian2(1, 1);
  return new MaterialAppearance({
    material: new Material({
      fabric: {
        uniforms: {
          image: u.image ?? "",
          speed: u.speed ?? 1,
          repeat,
        },
        source: FlowLineFS,
      },
    }),
  });
});

// FlowPoint
registerMaterial(MaterialType.FlowPoint, (style: { material?: { customTexture?: { uniforms?: FlowPointUniforms } } }) => {
  const u = style.material?.customTexture?.uniforms ?? {};
  return new MaterialAppearance({
    material: new Material({
      fabric: {
        uniforms: {
          point: u.point ?? "",
          background: u.background ?? "",
          speed: u.speed ?? 1,
          reverse: u.reverse ?? false,
        },
        source: FlowPointFS,
      },
    }),
  });
});

// ConvectionPoint
registerMaterial(MaterialType.ConvectionPoint, (style: { material?: { customTexture?: { uniforms?: ConvectionPointUniforms } } }) => {
  const u = style.material?.customTexture?.uniforms ?? {};
  return new MaterialAppearance({
    material: new Material({
      fabric: {
        uniforms: {
          point: u.point ?? "",
          background: u.background ?? "",
          speed: u.speed ?? 1,
        },
        source: ConvectionPointFS,
      },
    }),
  });
});

// PolylineDashConvection
registerMaterial(MaterialType.PolylineDashConvection, (style: { material?: { customTexture?: { uniforms?: PolylineDashConvectionUniforms } } }, params) => {
  const u = style.material?.customTexture?.uniforms ?? {};
  const start = u.startPosition instanceof Cartesian3 ? u.startPosition : (params?.startPosition ?? Cartesian3.ZERO);
  return new PolylineMaterialAppearance({
    material: new Material({
      fabric: {
        uniforms: {
          color: toColor(u.color, "white"),
          gapColor: toColor(u.gapColor, "transparent"),
          sliderColor: toColor(u.sliderColor, "red"),
          sliderLength: u.sliderLength ?? 8.0,
          dashLength: u.dashLength ?? 16.0,
          dashPattern: typeof u.dashPattern === 'string' ? parseInt(u.dashPattern, 2) : (u.dashPattern ?? 255.0),
          startPosition: start,
          speed: u.speed ?? 1,
        },
        source: PolylineDashConvectionFS,
      },
    }),
  });
});

// PolylineDashSlider
registerMaterial(MaterialType.PolylineDashSlider, (style: { material?: { customTexture?: { uniforms?: PolylineDashSliderUniforms } } }, params) => {
  const u = style.material?.customTexture?.uniforms ?? {};
  const start = u.startPosition instanceof Cartesian3 ? u.startPosition : (params?.startPosition ?? Cartesian3.ZERO);
  return new PolylineMaterialAppearance({
    material: new Material({
      fabric: {
        uniforms: {
          color: toColor(u.color, "white"),
          gapColor: toColor(u.gapColor, "transparent"),
          sliderColor: toColor(u.sliderColor, "red"),
          sliderLength: u.sliderLength ?? 8.0,
          dashLength: u.dashLength ?? 16.0,
          dashPattern: typeof u.dashPattern === 'string' ? parseInt(u.dashPattern, 2) : (u.dashPattern ?? 255.0),
          startPosition: start,
          speed: u.speed ?? 1,
          reverse: u.reverse ?? false,
        },
        source: PolylineDashSliderFS,
      },
    }),
  });
});

// CircleRipple
registerMaterial(MaterialType.CircleRipple, (style: { material?: { customTexture?: { uniforms?: CircleRippleUniforms } } }) => {
  const u = style.material?.customTexture?.uniforms ?? {};
  return new MaterialAppearance({
    material: new Material({
      fabric: {
        uniforms: {
          color: toColor(u.color, "white"),
          speed: u.speed ?? 1,
          count: u.count ?? 5,
          gradient: u.gradient ?? 0.2,
        },
        source: CircleRippleFS,
      },
    }),
  });
});

// DynamicWall
registerMaterial(MaterialType.DynamicWall, (style: { material?: { customTexture?: { uniforms?: DynamicWallUniforms } } }) => {
  const u = style.material?.customTexture?.uniforms ?? {};
  const image = u.image ?? getResourceUrl("Textures/wall.png");
  return new MaterialAppearance({
    material: new Material({
      fabric: {
        uniforms: {
          color: toColor(u.color, "white"),
          image,
          speed: u.speed ?? 1,
        },
        source: DynamicWallFS,
      },
    }),
  });
});