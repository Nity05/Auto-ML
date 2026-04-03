import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const body = await req.json()

    console.log("JSON RECEIVED FROM FRONTEND:", body)

    const res = await fetch("http://127.0.0.1:8000/datasets/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })

    const data = await res.json()
    console.log("API RESPONSE:", data)
    return NextResponse.json(data)
}
