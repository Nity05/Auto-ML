import { NextResponse } from "next/server"

export async function GET() {
    try {
        console.log("Proxy: Fetching results from backend...")
        const res = await fetch("http://localhost:8000/results", {
            cache: "no-store"
        })

        if (!res.ok) {
            console.error("Proxy: Backend returned error status", res.status)
            return NextResponse.json({ status: "error", message: "Backend error" }, { status: 500 })
        }

        const data = await res.json()
        console.log("Proxy: Successfully fetched data from backend:", data.accuracy ? "Accuracy found" : "No accuracy")
        return NextResponse.json(data)
    } catch (err: any) {
        console.error("Proxy: Fetch error:", err.message)
        return NextResponse.json({ status: "error", message: err.message }, { status: 500 })
    }
}
