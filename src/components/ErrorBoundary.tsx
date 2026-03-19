import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
                    <div className="glass-card rounded-xl p-8 text-center max-w-md space-y-4 border border-red-500/30">
                        <div className="flex justify-center">
                            <div className="rounded-full bg-red-500/20 p-3">
                                <AlertCircle size={32} className="text-red-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold">Something went wrong</h2>
                            <p className="text-sm text-muted-foreground break-words">
                                {this.state.error?.message || "An unexpected error occurred."}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center justify-center gap-2 w-full rounded-lg gradient-primary text-primary-foreground font-semibold py-3 transition-all hover:opacity-90 active:scale-[0.98]"
                        >
                            <RefreshCw size={18} />
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
