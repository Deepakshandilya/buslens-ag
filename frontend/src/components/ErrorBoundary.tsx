"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    className="min-h-screen flex items-center justify-center p-6"
                    style={{
                        background:
                            "linear-gradient(180deg, oklch(0.14 0.03 285) 0%, oklch(0.11 0.02 280) 40%, oklch(0.13 0.025 290) 100%)",
                    }}
                >
                    <div
                        className="max-w-md w-full text-center p-10 rounded-3xl"
                        style={{
                            background: "oklch(0.18 0.025 285 / 90%)",
                            border: "1px solid oklch(1 0.02 285 / 8%)",
                            boxShadow: "0 8px 40px oklch(0 0 0 / 40%)",
                        }}
                    >
                        {/* Error icon */}
                        <div
                            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                            style={{
                                background: "oklch(0.65 0.2 25 / 12%)",
                            }}
                        >
                            <svg
                                className="h-8 w-8"
                                style={{ color: "oklch(0.75 0.18 25)" }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                />
                            </svg>
                        </div>

                        <h2
                            className="text-2xl font-bold text-white mb-2"
                            style={{ fontFamily: "var(--font-heading), sans-serif" }}
                        >
                            Something went wrong
                        </h2>
                        <p
                            className="text-sm mb-6"
                            style={{ color: "oklch(0.55 0.02 285)" }}
                        >
                            An unexpected error occurred. Please try again.
                        </p>

                        {this.state.error && (
                            <div
                                className="text-left text-xs p-3 rounded-xl mb-6 overflow-auto max-h-32 font-mono"
                                style={{
                                    background: "oklch(0.12 0.02 285 / 80%)",
                                    border: "1px solid oklch(1 0.02 285 / 5%)",
                                    color: "oklch(0.65 0.18 25)",
                                }}
                            >
                                {this.state.error.message}
                            </div>
                        )}

                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer hover:brightness-110 active:scale-[0.98]"
                            style={{
                                background:
                                    "linear-gradient(135deg, oklch(0.68 0.15 280), oklch(0.72 0.12 295))",
                                boxShadow: "0 4px 16px oklch(0.72 0.12 290 / 25%)",
                            }}
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                                />
                            </svg>
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
