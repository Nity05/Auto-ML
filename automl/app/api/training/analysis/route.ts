import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const res = await fetch("http://localhost:8000/training/analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })

        if (!res.ok) {
            return NextResponse.json({ status: "error", message: "Backend error" }, { status: 500 })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (err: any) {
        return NextResponse.json({ status: "error", message: err.message }, { status: 500 })
    }
}
