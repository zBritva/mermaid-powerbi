import * as React from "react";

export interface ErrorBoundaryState {
    hasError: boolean;
    error: unknown;
}

export interface ErrorBoundaryProps extends React.PropsWithChildren {
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
  
    static getDerivedStateFromError(error: unknown) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true, error };
    }
  
    componentDidCatch(error, errorInfo) {
      // You can also log the error to an error reporting service
      console.error(error, errorInfo);
    }
  
    render() {
      if (this.state.hasError) {
        return (
            <>
                <h1>Something went wrong.</h1>
                <div>
                    {this.state.error as string}
                </div>
            </>
        );
      }
  
      return this.props.children; 
    }
  }