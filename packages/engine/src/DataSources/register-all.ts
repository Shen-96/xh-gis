/*
 * @Description: 自动导入所有图元和符号模块以触发自注册
 * @Author: Assistant
 * @Date: 2025-01-XX XX:XX:XX
 */

// 导入所有箭头图元
import "./Graphics/Arrow/StraightArrow";
import "./Graphics/Arrow/CurvedArrow";
import "./Graphics/Arrow/StraightTailArrow";
import "./Graphics/Arrow/StraightTailRightArrow";
import "./Graphics/Arrow/FreeFlatTailArrow";
import "./Graphics/Arrow/FixedFlatTailArrow";
import "./Graphics/Arrow/FreeSwallowTailArrow";
import "./Graphics/Arrow/FixedSwallowTailArrow";
import "./Graphics/Arrow/DoubleArrow";

// 导入所有多边形图元
import "./Graphics/Polygon/Circle";
import "./Graphics/Polygon/Ellipse";
import "./Graphics/Polygon/Rectangle";
import "./Graphics/Polygon/Triangle";
import "./Graphics/Polygon/Polygon";
import "./Graphics/Polygon/FreehandPolygon";
import "./Graphics/Polygon/Lune";
import "./Graphics/Polygon/KidneyShaped";
import "./Graphics/Polygon/FixedRatioRectangle";
import "./Graphics/Polygon/Sector";
import "./Graphics/Polygon/StagingArea";

// 导入所有线图元
import "./Graphics/Line/Curve";
import "./Graphics/Line/FreehandLine";

// 导入所有点图元
import "./Graphics/Point/Mark";

// 导入所有符号
import "./Graphics/Symbol/ZyTjArrow";
import "./Graphics/Symbol/ZyFtjArrow";
import "./Graphics/Symbol/JgZxArrow";
import "./Graphics/Symbol/LhHlDjArrow";
import "./Graphics/Symbol/JgArrow";
import "./Graphics/Symbol/FcjArrow";
import "./Graphics/Symbol/JqLhHlDjArrow";
import "./Graphics/Symbol/BbsTpDdArrow";

// 注意：此文件通过副作用导入触发各模块的自注册逻辑
// 无需导出任何内容，仅确保模块被加载