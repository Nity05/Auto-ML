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
    const [finalJson, setFinalJson] = useState<any>(null)
    const [datasets, setDatasets] = useState<any[]>([])
    useEffect(() => {
        const data = JSON.parse(
            localStorage.getItem("questionnaire") || "{}"
        )
        setConfigData(data)
    }, [])

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
        setFinalJson(finalOutput)
        console.log("Final JSON Output:", JSON.stringify(finalOutput, null, 2))
        fetch("/api/datasets/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(finalOutput),
        })
            .then(res => res.json())
            .then(data => {
                console.log("Datasets received from backend:", data)
                setDatasets(data)
            })
            .catch(err => {
                console.error("Dataset fetch failed:", err)
            })


    }
    const handleSelect = (ds: any) => {
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
        // console.log("Selecting:", ds)
        console.log("Selecting:", finalOutput.ds.name)
        fetch("/api/datasets/select", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(finalOutput),
        })
            .then(res => res.json())
            .then(data => {
                alert(`Selected: ${finalOutput.ds.name}`)
                console.log("Selected Dataset:", data)
            })
            .catch(err => console.error(err))
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col items-center p-8 relative overflow-hidden font-sans">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse" />
            <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px] animate-pulse delay-700" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
                <div className="mb-10 text-center relative">
                    <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-widest uppercase">
                        Step 2: Dataset Selection
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                            Dataset Details
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
                        Configure your data source and processing requirements.
                    </p>
                </div>

                <div className="w-full bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] p-8 md:p-12 space-y-8 relative overflow-hidden group">
                    {/* Decorative top border */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                    {/* Source Selector */}
                    <div className="space-y-3 group/select">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within/select:text-blue-400">
                            Data Source
                        </label>
                        <div className="relative">
                            <select
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                className="w-full appearance-none bg-slate-800/30 border border-slate-700/50 rounded-2xl px-5 py-4 text-slate-200 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium cursor-pointer"
                            >
                                <option value="auto_fetch">🌐 Auto Fetch (Kaggle/OpenML)</option>
                                <option value="manual">📤 Manual Local Upload</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Type Selection */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                            Dataset Modality
                        </label>
                        <div className="flex flex-wrap gap-4">
                            {["tabular", "image", "text"].map(t => (
                                <label key={t} className={`
                                    flex items-center gap-3 px-5 py-3 rounded-2xl border cursor-pointer transition-all duration-300
                                    ${type.includes(t)
                                        ? "bg-blue-600/10 border-blue-500/50 text-blue-200 shadow-sm"
                                        : "bg-slate-800/20 border-slate-800 text-slate-500 hover:border-slate-700"}
                                `}>
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={type.includes(t)}
                                            onChange={(e) => {
                                                if (e.target.checked) setType([...type, t])
                                                else setType(type.filter(x => x !== t))
                                            }}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded-md border-2 transition-all ${type.includes(t) ? "bg-blue-500 border-blue-500" : "border-slate-700"}`}>
                                            {type.includes(t) && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white mx-auto" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="capitalize text-sm font-bold tracking-wide">{t}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Rows Range */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3 group/input">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 group-focus-within/input:text-purple-400 transition-colors">Minimum Rows</label>
                            <input
                                type="number"
                                value={minRows}
                                onChange={(e) => setMinRows(Number(e.target.value))}
                                className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-5 py-4 text-slate-200 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-3 group/input">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 group-focus-within/input:text-purple-400 transition-colors">Maximum Rows</label>
                            <input
                                type="number"
                                value={maxRows}
                                onChange={(e) => setMaxRows(Number(e.target.value))}
                                className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-5 py-4 text-slate-200 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Features Tagging */}
                    <div className="space-y-3 group/input">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 group-focus-within/input:text-blue-400 transition-colors">Feature Schema</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={features}
                                onChange={(e) => setFeatures(e.target.value)}
                                className="w-full bg-slate-800/30 border border-slate-700/50 rounded-2xl px-5 py-4 text-slate-200 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                placeholder="e.g. mixed, categorical, numerical"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                                📊
                            </div>
                        </div>
                    </div>

                    {/* Labels Requirement Toggle */}
                    <label className="flex items-center gap-4 cursor-pointer group/label p-4 rounded-2xl bg-slate-800/20 border border-slate-800 hover:border-slate-700 transition-all">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                id="labels"
                                checked={labelsRequired}
                                onChange={(e) => setLabelsRequired(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 ${labelsRequired ? "bg-blue-600" : "bg-slate-700"}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 transform ${labelsRequired ? "translate-x-6" : "translate-x-0"}`} />
                            </div>
                        </div>
                        <span className={`text-sm font-bold uppercase tracking-widest ${labelsRequired ? "text-blue-400" : "text-slate-500"}`}>
                            Require Labeled Ground Truth
                        </span>
                    </label>

                    {/* Action Button */}
                    <div className="pt-4">
                        <button
                            onClick={handleSubmit}
                            className="group relative w-full bg-gradient-to-br from-purple-600 to-blue-700 hover:from-purple-500 hover:to-blue-600 text-white font-bold py-5 rounded-2xl shadow-[0_10px_30px_-10px_rgba(124,58,237,0.5)] transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                            <div className="flex items-center justify-center gap-3 relative z-10">
                                <span className="tracking-widest uppercase text-sm">Query Model Repositories</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                {datasets.length > 0 && (
                    <div className="w-full mt-16 space-y-6 pb-20">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight">Available Datasets</h2>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                                {datasets.length} Results Found
                            </span>
                        </div>

                        <div className="grid gap-5">
                            {datasets.map((ds, i) => (
                                <div key={i} className="group/result bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-slate-800/40 hover:border-blue-500/30 transition-all duration-300 gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <a
                                                href={ds.url || "#"}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xl font-extrabold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                                            >
                                                {ds.name}
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover/result:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                            <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
                                                {ds.source}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">

                                            {ds.desc}
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover/result:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>

                                        </div>

                                        <div className="flex flex-wrap gap-8 text-sm">
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Usability Score</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                                            style={{ width: `${(ds.usability || 0) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-mono text-xs font-bold text-slate-400">{(ds.usability || 0).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Reach</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-300">📥 {(ds.downloads || 0).toLocaleString()}</span>
                                                    <span className="text-slate-700">|</span>
                                                    <span className="text-xs font-bold text-slate-300">⭐ {ds.votes}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSelect(ds)}
                                        className="w-full md:w-auto px-8 py-4 bg-slate-100 hover:bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl hover:shadow-white/10 active:scale-95"
                                    >
                                        Deploy Data
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    )
}
