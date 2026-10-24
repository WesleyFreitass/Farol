import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import crypto from "crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const forwardedProto = req.headers.get("x-forwarded-proto") || "http";
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    url.host;
  const baseUrl = `${forwardedProto}://${host}`;

  if (error || !code) {
    return NextResponse.redirect(
      `${baseUrl}?auth_error=${encodeURIComponent(error || "cancelado")}`
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${baseUrl}?auth_error=credenciais_google_nao_configuradas`
    );
  }

  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    // 1. Troca o código pelo access_token na API do Google
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("Erro ao trocar token Google:", errBody);
      return NextResponse.redirect(`${baseUrl}?auth_error=falha_token_google`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Busca informações do perfil do Google
    const userinfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!userinfoRes.ok) {
      return NextResponse.redirect(`${baseUrl}?auth_error=falha_perfil_google`);
    }

    const googleUser = await userinfoRes.json();
    const email = googleUser.email?.trim().toLowerCase();
    const name = googleUser.name || email.split("@")[0] || "Tripulante";
    const avatarUrl = googleUser.picture || null;

    if (!email) {
      return NextResponse.redirect(`${baseUrl}?auth_error=email_nao_fornecido`);
    }

    // 3. Localiza ou cria o usuário no banco
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Usuário novo autenticado via Google
      const randomPassword = crypto.randomUUID() + "-" + crypto.randomUUID();
      const passwordHash = await hashPassword(randomPassword);

      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          avatarUrl,
        },
      });
    } else if (!user.avatarUrl && avatarUrl) {
      // Atualiza o avatar se o usuário já existia mas não tinha foto
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl },
      });
    }

    // 4. Assina o token de sessão do Farol
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.redirect(`${baseUrl}/`);

    response.cookies.set("farol_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: "/",
    });

    // Limpa cookie de state
    response.cookies.delete("google_oauth_state");

    return response;
  } catch (err) {
    console.error("Erro no callback do Google:", err);
    return NextResponse.redirect(`${baseUrl}?auth_error=erro_interno`);
  }
}
