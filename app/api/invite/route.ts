// app/api/invite/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    // Lógica do Resend aqui...
    const { data, error } = await resend.emails.send({
      from: "Amor Tarefas <onboarding@resend.dev>",
      to: email,
      subject: "Convite Amor Tarefas",
      html: `<p>Aceite seu convite: ${process.env.NEXT_PUBLIC_URL}/invite/${token}</p>`,
    });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
