// app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import 
export async function POST(request: NextRequest) {
	const body = await request.json();
	const token = body.token;

	// Aquí verificas el token con tu backend
	const isValid = await verifyTokenWithBackend(token);

	if (!isValid) {
		return NextResponse.json({ error: "Invalid token" }, { status: 401 });
	}

	return NextResponse.json({ success: true });
}
