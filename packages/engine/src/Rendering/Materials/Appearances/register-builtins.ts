import {
  Color,
  Material,
  MaterialAppearance,
  Cartesian2,
  Cartesian3,
  PolylineMaterialAppearance,
} from "cesium";
import { registerAppearance } from "./AppearanceRegistry";
import type {
  EllipsoidScanUniforms,
  EllipsoidElectricUniforms,
  EllipsoidSpiralUniforms,
  EllipsoidWaveUniforms,
  FlowLineUniforms,
  FlowLineAdaptiveUniforms,
  FlowLineMSDFUniforms,
  FlowPointUniforms,
  ConvectionPointUniforms,
  PolylineDashConvectionUniforms,
  PolylineDashSliderUniforms,
  CircleRippleUniforms,
  DynamicWallUniforms,
} from "../types";
import { MaterialType } from "../../../enum";
import EllipsoidScanFS from "../../Shaders/EllipsoidScanFS";
import EllipsoidElectricFS from "../../Shaders/EllipsoidElectricFS";
import EllipsoidSpiralFS from "../../Shaders/EllipsoidSpiralFS";
import EllipsoidWaveFS from "../../Shaders/EllipsoidWaveFS";
import FlowLineFS from "../../Shaders/FlowLineFS";
import FlowLineAdaptiveFS from "../../Shaders/FlowLineAdaptiveFS";
import FlowLineMSDFFS from "../../Shaders/FlowLineMSDFFS";
import MSDFStaticFS from "../../Shaders/MSDFStaticFS";
import FlowPointFS from "../../Shaders/FlowPointFS";
import ConvectionPointFS from "../../Shaders/ConvectionPointFS";
import PolylineDashConvectionFS from "../../Shaders/PolylineDashConvectionFS";
import PolylineDashSliderFS from "../../Shaders/PolylineDashSliderFS";
import PolylineDashFlowFS from "../../Shaders/PolylineDashFlowFS";
import CircleRippleFS from "../../Shaders/CircleRippleFS";
import DynamicWallFS from "../../Shaders/DynamicWallFS";
import { getResourceUrl } from "../../../Core/ResourceConfig";

try {
  (Material as any)._materialCache.addMaterial(MaterialType.FlowLine, {
    fabric: {
      type: MaterialType.FlowLine,
      uniforms: {
        image: "",
        speed: 1,
        repeat: new Cartesian2(1, 1),
        sample1D: true,
        vScale: 1.0,
      },
      source: FlowLineFS,
    },
  });
} catch {}

try {
  (Material as any)._materialCache.addMaterial(MaterialType.FlowLineAdaptive, {
    fabric: {
      type: MaterialType.FlowLineAdaptive,
      uniforms: {
        color: Color.WHITE,
        image: "",
        speed: 1,
        repeat: new Cartesian2(1, 1),
        lineWidthPx: 1,
        imageHeightPx: 64,
        mode: 0,
      },
      source: FlowLineAdaptiveFS,
    },
  });
} catch {}

try {
  (Material as any)._materialCache.addMaterial(MaterialType.FlowLineMSDF, {
    fabric: {
      type: MaterialType.FlowLineMSDF,
      uniforms: {
        image: "",
        color: Color.WHITE,
        speed: 1,
        repeat: new Cartesian2(1, 1),
        range: 0.5,
        smooth: 1.0,
      },
      source: FlowLineMSDFFS,
    },
  });
} catch {}

try {
  (Material as any)._materialCache.addMaterial(MaterialType.MSDFStatic, {
    fabric: {
      type: MaterialType.MSDFStatic,
      uniforms: {
        image: "",
        color: Color.WHITE,
        repeat: new Cartesian2(1, 1),
        range: 0.5,
        smooth: 1.0,
        center: 0.5,
      },
      source: MSDFStaticFS,
    },
  });
} catch {}

try {
  (Material as any)._materialCache.addMaterial(MaterialType.FlowPoint, {
    fabric: {
      type: MaterialType.FlowPoint,
      uniforms: {
        point: "",
        background: "",
        speed: 1,
        reverse: false,
      },
      source: FlowPointFS,
    },
  });
} catch {}

try {
  (Material as any)._materialCache.addMaterial(MaterialType.ConvectionPoint, {
    fabric: {
      type: MaterialType.ConvectionPoint,
      uniforms: {
        point: "",
        background: "",
        speed: 1,
      },
      source: ConvectionPointFS,
    },
  });
} catch {}

try {
  (Material as any)._materialCache.addMaterial(
    MaterialType.PolylineDashConvection,
    {
      fabric: {
        type: MaterialType.PolylineDashConvection,
        uniforms: {
          color: Color.WHITE,
          gapColor: Color.TRANSPARENT,
          sliderColor: Color.RED,
          sliderLength: 8.0,
          dashLength: 16.0,
          dashPattern: 255.0,
          startPosition: Cartesian3.ZERO,
          speed: 1,
        },
        source: PolylineDashConvectionFS,
      },
    }
  );
} catch {}

try {
  (Material as any)._materialCache.addMaterial(
    MaterialType.PolylineDashSlider,
    {
      fabric: {
        type: MaterialType.PolylineDashSlider,
        uniforms: {
          color: Color.WHITE,
          gapColor: Color.TRANSPARENT,
          sliderColor: Color.RED,
          sliderLength: 8.0,
          sliderHeightRatio: 1.0,
          dashLength: 16.0,
          dashPattern: 255.0,
          speed: 1,
          reverse: false,
          useCesiumTime: false,
          moveMode: 0,
          timeSeconds: 0.0,
        },
        source: PolylineDashSliderFS,
      },
    }
  );
} catch {}

try {
  (Material as any)._materialCache.addMaterial(MaterialType.CircleRipple, {
    fabric: {
      type: MaterialType.CircleRipple,
      uniforms: {
        color: Color.WHITE,
        speed: 1,
        count: 5,
        gradient: 0.2,
      },
      source: CircleRippleFS,
    },
  });
} catch {}

try {
  (Material as any)._materialCache.addMaterial(
    MaterialType.PolylineDashFlow,
    {
      fabric: {
        type: MaterialType.PolylineDashFlow,
        uniforms: {
          color: Color.WHITE,
          gapColor: Color.TRANSPARENT,
          sliderColor: Color.YELLOW,
          sliderLength: 8.0,
          dashLength: 16.0,
          dashPattern: 255.0,
          speed: 1.0,
          reverse: false,
          timeSeconds: 0.0,
        } as any,
        source: PolylineDashFlowFS,
      },
    }
  );
} catch {}

try {
  (Material as any)._materialCache.addMaterial(MaterialType.DynamicWall, {
    fabric: {
      type: MaterialType.DynamicWall,
      uniforms: {
        color: Color.WHITE,
        image: getResourceUrl("Textures/wall.png"),
        speed: 1,
      },
      source: DynamicWallFS,
    },
  });
} catch {}

try {
  (Material as any)._materialCache.addMaterial(MaterialType.EllipsoidScan, {
    fabric: {
      type: MaterialType.EllipsoidScan,
      uniforms: {
        color: Color.fromCssColorString("#ffff00"),
        speed: 1,
        smooth: false,
      },
      source: EllipsoidScanFS,
    },
  });
} catch {}

try {
  (Material as any)._materialCache.addMaterial(MaterialType.EllipsoidElectric, {
    fabric: {
      type: MaterialType.EllipsoidElectric,
      uniforms: {
        color: Color.fromCssColorString("#ffff00"),
        speed: 1,
      },
      source: EllipsoidElectricFS,
    },
  });
} catch {}

try {
  (Material as any)._materialCache.addMaterial(MaterialType.EllipsoidSpiral, {
    fabric: {
      type: MaterialType.EllipsoidSpiral,
      uniforms: {
        color: Color.fromCssColorString("#ffff00"),
        speed: 1,
      },
      source: EllipsoidSpiralFS,
    },
  });
} catch {}

try {
  (Material as any)._materialCache.addMaterial(MaterialType.EllipsoidWave, {
    fabric: {
      type: MaterialType.EllipsoidWave,
      uniforms: {
        color: Color.fromCssColorString("#ffff00"),
        speed: 1,
      },
      source: EllipsoidWaveFS,
    },
  });
} catch {}

registerAppearance(
  MaterialType.EllipsoidScan,
  (style: {
    material?: { customTexture?: { uniforms?: EllipsoidScanUniforms } };
  }) =>
    new MaterialAppearance({
      material: new Material({
        fabric: {
          type: MaterialType.EllipsoidScan,
          uniforms: style.material?.customTexture?.uniforms ?? {},
        },
      }),
    })
);

registerAppearance(
  MaterialType.EllipsoidElectric,
  (style: {
    material?: { customTexture?: { uniforms?: EllipsoidElectricUniforms } };
  }) =>
    new MaterialAppearance({
      material: new Material({
        fabric: {
          type: MaterialType.EllipsoidElectric,
          uniforms: style.material?.customTexture?.uniforms ?? {},
        },
      }),
    })
);

registerAppearance(
  MaterialType.EllipsoidSpiral,
  (style: {
    material?: { customTexture?: { uniforms?: EllipsoidSpiralUniforms } };
  }) =>
    new MaterialAppearance({
      material: new Material({
        fabric: {
          type: MaterialType.EllipsoidSpiral,
          uniforms: style.material?.customTexture?.uniforms ?? {},
        },
      }),
    })
);

registerAppearance(
  MaterialType.EllipsoidWave,
  (style: {
    material?: { customTexture?: { uniforms?: EllipsoidWaveUniforms } };
  }) =>
    new MaterialAppearance({
      material: new Material({
        fabric: {
          type: MaterialType.EllipsoidWave,
          uniforms: style.material?.customTexture?.uniforms ?? {},
        },
      }),
    })
);

registerAppearance(
  MaterialType.FlowLine,
  (style: {
    material?: { customTexture?: { uniforms?: FlowLineUniforms } };
  }) => {
    const u = style.material?.customTexture?.uniforms ?? {};
    return new MaterialAppearance({
      material: new Material({
        fabric: {
          type: MaterialType.FlowLine,
          uniforms: u,
        },
      }),
    });
  }
);

registerAppearance(
  MaterialType.FlowLineAdaptive,
  (style: {
    material?: { customTexture?: { uniforms?: FlowLineAdaptiveUniforms } };
  }) => {
    const u = style.material?.customTexture?.uniforms ?? {};
    const modeVal = (u as any).modeIndex ?? (u as any).mode;
    return new PolylineMaterialAppearance({
      material: new Material({
        fabric: {
          type: MaterialType.FlowLineAdaptive,
          uniforms: {
            ...u,
            ...(modeVal !== undefined ? { mode: modeVal } : {}),
          },
        },
      }),
    });
  }
);

registerAppearance(
  MaterialType.FlowLineMSDF,
  (style: {
    material?: { customTexture?: { uniforms?: FlowLineMSDFUniforms } };
  }) => {
    const u = style.material?.customTexture?.uniforms ?? {};
    return new PolylineMaterialAppearance({
      material: new Material({
        fabric: {
          type: MaterialType.FlowLineMSDF,
          uniforms: u,
        },
      }),
    });
  }
);

registerAppearance(
  MaterialType.MSDFStatic,
  (style: {
    material?: { customTexture?: { uniforms?: FlowLineMSDFUniforms } };
  }) => {
    const u = style.material?.customTexture?.uniforms ?? {};
    return new PolylineMaterialAppearance({
      material: new Material({
        fabric: {
          type: MaterialType.MSDFStatic,
          uniforms: u,
        },
      }),
    });
  }
);

registerAppearance(
  MaterialType.FlowPoint,
  (style: {
    material?: { customTexture?: { uniforms?: FlowPointUniforms } };
  }) => {
    const u = style.material?.customTexture?.uniforms ?? {};
    return new MaterialAppearance({
      material: new Material({
        fabric: {
          type: MaterialType.FlowPoint,
          uniforms: u,
        },
      }),
    });
  }
);

registerAppearance(
  MaterialType.ConvectionPoint,
  (style: {
    material?: { customTexture?: { uniforms?: ConvectionPointUniforms } };
  }) => {
    const u = style.material?.customTexture?.uniforms ?? {};
    return new MaterialAppearance({
      material: new Material({
        fabric: {
          type: MaterialType.ConvectionPoint,
          uniforms: u,
        },
      }),
    });
  }
);

registerAppearance(
  MaterialType.PolylineDashConvection,
  (
    style: {
      material?: {
        customTexture?: { uniforms?: PolylineDashConvectionUniforms };
      };
    },
    params
  ) => {
    const u = style.material?.customTexture?.uniforms ?? {};
    const dashPatternNormalized =
      typeof u.dashPattern === "string"
        ? parseInt(u.dashPattern as any, 2)
        : undefined;
    const start = params?.startPosition;
    return new PolylineMaterialAppearance({
      material: new Material({
        fabric: {
          type: MaterialType.PolylineDashConvection,
          uniforms: {
            ...u,
            ...(dashPatternNormalized !== undefined
              ? { dashPattern: dashPatternNormalized }
              : {}),
            ...(start !== undefined ? { startPosition: start } : {}),
          },
        },
      }),
    });
  }
);

registerAppearance(
  MaterialType.PolylineDashSlider,
  (
    style: {
      material?: { customTexture?: { uniforms?: PolylineDashSliderUniforms } };
    },
    params
  ) => {
    const u = style.material?.customTexture?.uniforms ?? {};
    const dashPatternNormalized =
      typeof u.dashPattern === "string"
        ? parseInt(u.dashPattern as any, 2)
        : undefined;
    const start = params?.startPosition;
    return new PolylineMaterialAppearance({
      material: new Material({
        fabric: {
          type: MaterialType.PolylineDashSlider,
          uniforms: {
            ...u,
            ...(dashPatternNormalized !== undefined
              ? { dashPattern: dashPatternNormalized }
              : {}),
            ...(start !== undefined ? { startPosition: start } : {}),
          },
        },
      }),
    });
  }
);

registerAppearance(
  MaterialType.CircleRipple,
  (style: {
    material?: { customTexture?: { uniforms?: CircleRippleUniforms } };
  }) => {
    const u = style.material?.customTexture?.uniforms ?? {};
    return new MaterialAppearance({
      material: new Material({
        fabric: {
          type: MaterialType.CircleRipple,
          uniforms: u,
        },
      }),
    });
  }
);

registerAppearance(
  MaterialType.DynamicWall,
  (style: {
    material?: { customTexture?: { uniforms?: DynamicWallUniforms } };
  }) => {
    const u = style.material?.customTexture?.uniforms ?? {};
    return new MaterialAppearance({
      material: new Material({
        fabric: {
          type: MaterialType.DynamicWall,
          uniforms: u,
        },
      }),
    });
  }
);
