import { NextResponse, type NextRequest } from "next/server";

// Portão barato: quem não tem cookie de sessão vai para /entrar; quem tem e
// abre uma tela de login vai para a Agora. A validação de verdade é no servidor
// (o layout de (app) confere a sessão no banco); aqui é só presença do cookie.
const PUBLICAS = ["/entrar", "/criar-conta"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const temCookie = req.cookies.has("sessao");
  const ehPublica = PUBLICAS.some((p) => pathname === p);

  if (!temCookie && !ehPublica) {
    const url = req.nextUrl.clone();
    url.pathname = "/entrar";
    return NextResponse.redirect(url);
  }
  if (temCookie && ehPublica) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // roda em tudo, menos assets, api e arquivos estáticos
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
