"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfigPage() {
    const router = useRouter();
    const [taskType, setTaskType] = useState<string>("");
    const [domain, setDomain] = useState<string>("");
    const [targetColumn, setTargetColumn] = useState<string>("");
    const [outputType, setOutputType] = useState<string>("");
    const [algoType, setAlgoType] = useState<string>("");

    const taskOptions = [
        { label: "Classification", icon: "🎯" },
        { label: "Regression", icon: "📈" },
        { label: "Clustering", icon: "🫧" },
        { label: "Time Series", icon: "⌛" },
    ];

    const algoOptions = [
        "Auto (Best)",
        "Tree-based",
        "Neural Network",
        "Linear Model",
        "Ensemble"
    ];

    const outputOptions = ["Binary", "Multi-class", "Continuous"];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = {
            task: taskType.toLowerCase(),
            domain,
            target: targetColumn.toLowerCase(),
            output_type: outputType.toLowerCase(),
            algo_type: algoType
        };
        console.log(JSON.stringify(formData, null, 2));
        localStorage.setItem("questionnaire", JSON.stringify(formData));
        router.push("/Selection");
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[140px] animate-pulse" />
            <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[140px] animate-pulse delay-700" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            <div className="relative z-10 w-full max-w-3xl bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] p-10 md:p-14 overflow-hidden group">
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                <div className="mb-12 text-center relative">
                    <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase">
                        Step 1: Configuration
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                            Configure Model
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                        Define your machine learning task parameters to get started.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Task Type - Rich Radio Cards */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                            Task Objective
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {taskOptions.map((opt) => (
                                <label
                                    key={opt.label}
                                    className={`
                                        cursor-pointer group/card relative flex flex-col items-center justify-center rounded-2xl border p-5 transition-all duration-300
                                        ${taskType === opt.label
                                            ? "bg-blue-600/10 border-blue-500/50 text-blue-100 shadow-[0_0_30px_-5px_rgba(37,99,235,0.4)] scale-[1.02]"
                                            : "bg-slate-800/20 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:border-slate-700"
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="taskType"
                                        value={opt.label}
                                        checked={taskType === opt.label}
                                        onChange={(e) => setTaskType(e.target.value)}
                                        className="sr-only"
                                    />
                                    <span className={`text-3xl mb-3 transition-transform duration-300 ${taskType === opt.label ? "scale-110" : "group-hover/card:scale-110"}`}>
                                        {opt.icon}
                                    </span>
                                    <span className="text-sm font-semibold tracking-wide">{opt.label}</span>

                                    {taskType === opt.label && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Domain field */}
                        <div className="space-y-3 group/input">
                            <label htmlFor="domain" className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within/input:text-blue-400">
                                Target Domain
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="domain"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    placeholder="e.g. Healthcare, Finance"
                                    className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-5 py-4 text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                                    🏛️
                                </div>
                            </div>
                        </div>

                        {/* Target Column field */}
                        <div className="space-y-3 group/input">
                            <label htmlFor="targetColumn" className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within/input:text-purple-400">
                                Target Variable
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="targetColumn"
                                    value={targetColumn}
                                    onChange={(e) => setTargetColumn(e.target.value)}
                                    placeholder="e.g. price, label"
                                    className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-5 py-4 text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                                    🎯
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Algorithm Pills */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                            Algorithm Architecture
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {algoOptions.map((algo) => (
                                <label
                                    key={algo}
                                    className={`
                                        cursor-pointer px-5 py-2.5 rounded-xl border-2 transition-all duration-300 text-[13px] font-bold tracking-wide
                                        ${algoType === algo
                                            ? "bg-purple-600/10 border-purple-500/50 text-purple-300 shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]"
                                            : "bg-slate-800/20 border-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="algoType"
                                        value={algo}
                                        checked={algoType === algo}
                                        onChange={(e) => setAlgoType(e.target.value)}
                                        className="sr-only"
                                    />
                                    {algo}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Output Type Segmented Control */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                            Output Transformation
                        </label>
                        <div className="flex bg-slate-800/40 p-1.5 rounded-2xl border border-slate-700/50">
                            {outputOptions.map((option) => (
                                <label
                                    key={option}
                                    className={`
                                        flex-1 cursor-pointer rounded-[14px] py-3 text-[13px] font-bold text-center transition-all duration-300
                                        ${outputType === option
                                            ? "bg-slate-700 text-white shadow-lg ring-1 ring-white/10"
                                            : "text-slate-500 hover:text-slate-300"
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="outputType"
                                        value={option}
                                        checked={outputType === option}
                                        onChange={(e) => setOutputType(e.target.value)}
                                        className="sr-only"
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Enhanced Submit Button */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            className="group relative w-full bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-5 rounded-2xl shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                            <div className="flex items-center justify-center gap-3 relative z-10">
                                <span className="tracking-widest uppercase text-sm">Initialize Data Pipeline</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </div>
                        </button>
                        <p className="text-center text-slate-500 text-[11px] font-bold uppercase tracking-[0.3em] mt-6 opacity-50">
                            Automated Model Configuration v1.0
                        </p>
                    </div>
                </form>
            </div>

            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>

    );
}
