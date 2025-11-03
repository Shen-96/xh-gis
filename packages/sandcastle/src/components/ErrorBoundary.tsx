import React from "react";

type ErrorBoundaryState = {
  error: Error | null;
  info: React.ErrorInfo | null;
};

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error, info });
    // 将错误输出到控制台，便于开发调试
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    const { error, info } = this.state;
    if (error) {
      return (
        <div style={{
          padding: 16,
          margin: 16,
          border: "1px solid #ff4d4f",
          borderRadius: 6,
          background: "#fff1f0",
          color: "#a8071a",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            React 渲染错误捕获（ErrorBoundary）
          </div>
          <div style={{ marginBottom: 12 }}>
            <div>错误信息：{error.message}</div>
          </div>
          {info?.componentStack ? (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>组件堆栈：</div>
              <pre style={{ whiteSpace: "pre-wrap" }}>{info.componentStack}</pre>
            </div>
          ) : null}
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}