import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Desconectado com sucesso." });
  response.cookies.delete("farol_token");
  return response;
}
