"use client"

import { useEffect, useState } from "react"

export default function DatasetPage() {
    const [configData, setConfigData] = useState<any>({})
    const [source, setSource] = useState("auto_fetch")
    const [type, setType] = useState<string[]>(["tabular"])
    const [minRows, setMinRows] = useState(10000)
    const [maxRows, setMaxRows] = useState(200000)
    const [features, setFeatures] = useState("mixed")
    const [labelsRequired, setLabelsRequired] = useState(true)
    const [datasets, setDatasets] = useState<any[]>([])
    const [trainingStarted, setTrainingStarted] = useState(false)
    const [results, setResults] = useState<any>(null)
    const [resultsLoading, setResultsLoading] = useState(false)
    const [analysisText, setAnalysisText] = useState<string | null>(null)
    const [analysisLoading, setAnalysisLoading] = useState(false)
    const [selectionLoading, setSelectionLoading] = useState<string | null>(null)
    const [currentJobName, setCurrentJobName] = useState<string | null>(null)
    const [generatedCode, setGeneratedCode] = useState<string | null>(null)

    useEffect(() => {
        const data = JSON.parse(
            localStorage.getItem("questionnaire") || "{}"
        )
        setConfigData(data)

        // The user wants to select a fresh dataset. Polling should only start after they click Select.
        localStorage.removeItem("trainingStarted")
        setTrainingStarted(false)
        setResults(null)
    }, [])

    const checkOnce = () => {
        fetch(`/api/results?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                if (data && (data.accuracy || data.r2_score)) {
                    setResults(data)
                    fetchAnalysis(data)
                }
            })
            .catch(() => {})
    }

    const fetchAnalysis = (metrics: any) => {
        setAnalysisLoading(true)
        fetch("/api/training/analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ metrics, task: configData.task })
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setAnalysisText(data.analysis)
                }
                setAnalysisLoading(false)
            })
            .catch(() => setAnalysisLoading(false))
    }

    const handleSubmit = () => {
        const finalOutput = {
            ...configData,
            dataset: {
                source,
                type,
                min_rows: Number(minRows),
                max_rows: Number(maxRows),
                features,
                labels_required: labelsRequired
            }
        }
        fetch("/api/datasets/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(finalOutput),
        })
            .then(res => res.json())
            .then(data => {
                setDatasets(data)
            })
            .catch(err => {
                console.error("Dataset fetch failed:", err)
            })
    }

    const handleSelect = (ds: any) => {
        setSelectionLoading(ds.ref)
        const finalOutput = {
            ...configData,
            dataset: {
                source,
                type,
                min_rows: Number(minRows),
                max_rows: Number(maxRows),
                features,
                labels_required: labelsRequired
            },
            ds: ds
        }
        fetch("/api/datasets/select", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(finalOutput),
        })
            .then(res => res.json())
            .then((data) => {
                if (data.status === "error") {
                    alert(`Error: ${data.message}`)
                    setSelectionLoading(null)
                    return
                }
                alert(`Selected: ${finalOutput.ds.name}`)
                setResults(null)
                setAnalysisText(null)
                setTrainingStarted(true)
                if (data.job_name) {
                    setCurrentJobName(data.job_name)
                    localStorage.setItem("currentJobName", data.job_name)
                }
                if (data.generated_code) {
                    setGeneratedCode(data.generated_code)
                }
                localStorage.setItem("trainingStarted", "true")
                setSelectionLoading(null)
                // Small delay to ensure S3 delete is propagated before we start looking for new results
                setTimeout(() => {
                    startPolling()
                }, 3000)
            })
            .catch(err => {
                console.error(err)
                setSelectionLoading(null)
            })
    }

    const startPolling = () => {
        setResultsLoading(true)
        const pollResult = () => {
            fetch(`/api/results?t=${Date.now()}`)
                .then(res => res.json())
                .then(data => {
                    // Check if it's the old result or an error
                    if (data.status === "error" || (!data.accuracy && !data.r2_score)) {
                        setTimeout(pollResult, 5000)
                    } else {
                        setResults(data)
                        setResultsLoading(false)
                        fetchAnalysis(data)
                    }
                })
                .catch(() => {
                    setTimeout(pollResult, 5000)
                })
        }
        pollResult()
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col items-center p-8 relative overflow-hidden font-sans">
            <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse" />
            <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px] animate-pulse delay-700" />
            
            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
                {/* Header */}
                <div className="mb-10 text-center relative">
                    <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-widest uppercase">
                        Step 2: Dataset Selection
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                            Dataset Intelligence
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
                        Configure model parameters and source high-fidelity data.
                    </p>
                </div>

                {!trainingStarted && !results && (
                    <div className="w-full bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 rounded-3xl p-8 md:p-12 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Data Source</label>
                                <select
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-5 py-4 text-slate-200 outline-none focus:border-blue-500/50 transition-all cursor-pointer"
                                >
                                    <option value="auto_fetch">🌐 Auto Fetch (Kaggle/OpenML)</option>
                                    <option value="manual">📤 Manual Local Upload</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Feature Schema</label>
                                <input
                                    type="text"
                                    value={features}
                                    onChange={(e) => setFeatures(e.target.value)}
                                    className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-5 py-4 text-slate-200 outline-none focus:border-blue-500/50 transition-all font-medium"
                                    placeholder="e.g. mixed, categorical"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Min Rows</label>
                                <input
                                    type="number"
                                    value={minRows}
                                    onChange={(e) => setMinRows(Number(e.target.value))}
                                    className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-5 py-4 text-slate-200 outline-none focus:border-purple-500/50 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Max Rows</label>
                                <input
                                    type="number"
                                    value={maxRows}
                                    onChange={(e) => setMaxRows(Number(e.target.value))}
                                    className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-5 py-4 text-slate-200 outline-none focus:border-purple-500/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="group relative w-full bg-gradient-to-br from-purple-600 to-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl transform transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                        >
                            <span className="tracking-widest uppercase text-sm">Query Repositories</span>
                        </button>
                    </div>
                )}

                {/* Kaggle Results */}
                {datasets.length > 0 && !trainingStarted && (
                    <div className="w-full mt-16 space-y-6">
                        <h2 className="text-2xl font-bold tracking-tight">Available Datasets</h2>
                        <div className="grid gap-5">
                            {datasets.map((ds, i) => (
                                <div key={i} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-6 md:p-8 rounded-3xl flex justify-between items-center group/item hover:border-blue-500/30 transition-all">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-extrabold text-blue-400">{ds.name}</h3>
                                        <p className="text-sm text-slate-400 line-clamp-1 max-w-xl">{ds.desc}</p>
                                        <div className="flex gap-4 text-xs font-bold text-slate-500">
                                            <span>📥 {ds.downloads?.toLocaleString()}</span>
                                            <span>⭐ {ds.votes}</span>
                                            <span className="text-emerald-400">Usability: {(ds.usability * 10).toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSelect(ds)}
                                        disabled={selectionLoading !== null}
                                        className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                                            selectionLoading === ds.ref 
                                                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                                                : "bg-white text-slate-950 hover:scale-105"
                                        }`}
                                    >
                                        {selectionLoading === ds.ref ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                                                Deploying...
                                            </div>
                                        ) : "Select"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dashboard Section */}
                {(trainingStarted || results) && (
                    <div className="w-full mt-16 space-y-8 pb-24">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-[0.3em] uppercase">
                                {results ? "Processing Complete" : "SageMaker Engine Running"}
                            </div>
                            <h2 className="text-3xl font-extrabold tracking-tight">
                                {results ? "Model Intelligence Hub" : "Architecting Your Intelligence"}
                            </h2>
                        </div>

                        {resultsLoading && !results && (
                            <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-in fade-in duration-500">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center text-xl">⏳</div>
                                </div>
                                <div className="text-center space-y-2">
                                    <div className="text-slate-300 text-sm font-black uppercase tracking-[0.3em] animate-pulse">Awaiting S3 Manifest...</div>
                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest max-w-[200px]">SageMaker instance is provisioning. This may take 3-5 minutes.</p>
                                    {currentJobName && (
                                        <div className="mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                                            <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">Active SageMaker Job</div>
                                            <div className="text-[10px] text-blue-400 font-mono">{currentJobName}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Reset Button for Stuck Users */}
                                <button 
                                    onClick={() => {
                                        localStorage.removeItem("trainingStarted")
                                        setResults(null)
                                        setTrainingStarted(false)
                                        setResultsLoading(false)
                                    }}
                                    className="mt-8 px-6 py-2 border border-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-slate-800 hover:text-slate-300 transition-all"
                                >
                                    ← Back to Selection (Reset)
                                </button>
                            </div>
                        )}

                        {results && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Metric Card 1 */}
                                    <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4">
                                        {results.accuracy ? (
                                            <>
                                                <div className="text-4xl font-black text-white">{(results.accuracy * 100).toFixed(1)}%</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model Accuracy</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-4xl font-black text-white">{(results.r2_score || 0).toFixed(3)}</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">R² Score</div>
                                            </>
                                        )}
                                    </div>

                                    {/* Metric Card 2 */}
                                    <div className="md:col-span-2 bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 rounded-3xl p-8">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Detailed Metrics</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {results.accuracy ? (
                                                <>
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold">{(results.precision_macro || 0).toFixed(2)}</div>
                                                        <div className="text-[8px] text-slate-500 uppercase">Precision</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold">{(results.recall_macro || 0).toFixed(2)}</div>
                                                        <div className="text-[8px] text-slate-500 uppercase">Recall</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold">{(results.f1_macro || 0).toFixed(2)}</div>
                                                        <div className="text-[8px] text-slate-500 uppercase">F1 Macro</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold">{results.test_samples || "N/A"}</div>
                                                        <div className="text-[8px] text-slate-500 uppercase">Samples</div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold">{(results.mean_squared_error || 0).toFixed(4)}</div>
                                                        <div className="text-[8px] text-slate-500 uppercase">MSE</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold">{(results.mean_absolute_error || 0).toFixed(4)}</div>
                                                        <div className="text-[8px] text-slate-500 uppercase">MAE</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold">{(results.rmse || 0).toFixed(4)}</div>
                                                        <div className="text-[8px] text-slate-500 uppercase">RMSE</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xl font-bold">{results.test_samples || "N/A"}</div>
                                                        <div className="text-[8px] text-slate-500 uppercase">Samples</div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* AI Insights Card */}
                                    <div className="md:col-span-3 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-3xl p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shadow-lg">🤖</div>
                                            <div>
                                                <h3 className="text-lg font-black text-white tracking-tight">AI Expert Synthesis</h3>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Powered by Gemini AI</p>
                                            </div>
                                        </div>
                                        {analysisLoading ? (
                                            <div className="animate-pulse text-sm text-slate-400 uppercase tracking-widest">Analyzing dataset variance...</div>
                                        ) : (
                                            <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap">
                                                {analysisText || "Waiting for synthesis..."}
                                            </div>
                                        )}
                                    </div>

                                    {/* Generated Code Output */}
                                    {generatedCode && (
                                        <div className="md:col-span-3 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 overflow-hidden">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shadow-lg">💻</div>
                                                <div>
                                                    <h3 className="text-lg font-black text-white tracking-tight">Generated SageMaker Code</h3>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dynamic Script</p>
                                                </div>
                                            </div>
                                            <div className="bg-[#0f172a] rounded-xl p-6 overflow-x-auto">
                                                <pre className="text-xs text-blue-300 font-mono">
                                                    <code>{generatedCode}</code>
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 justify-center">
                                    <button 
                                        onClick={() => {
                                            localStorage.removeItem("trainingStarted")
                                            setResults(null)
                                            setAnalysisText(null)
                                            setTrainingStarted(false)
                                            window.location.reload()
                                        }}
                                        className="px-8 py-3 bg-white text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
                                    >
                                        New Pipeline
                                    </button>
                                    <button 
                                        onClick={() => checkOnce()}
                                        className="px-8 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
                                    >
                                        Refresh Metrics
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <style jsx global>{`
                @keyframes shimmer { 100% { transform: translateX(100%); } }
            `}</style>
        </div>
    )
}
