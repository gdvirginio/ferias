import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import webpush from "web-push";

// Configuração do Web Push com as chaves do ambiente
webpush.setVapidDetails(
  "mailto:seu-email@dominio.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST(request: Request) {
  try {
    const { groupId, senderId, senderName, conteudoTarefa } =
      await request.json();

    if (!groupId || !senderId) {
      return NextResponse.json(
        { error: "Parâmetros inválidos." },
        { status: 400 },
      );
    }

    // 1. Busca os membros do grupo que NÃO são quem criou a tarefa (a parceira / o parceiro)
    const { data: members, error: memError } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)
      .neq("user_id", senderId);

    if (memError || !members || members.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nenhum parceiro pendente de notificação.",
      });
    }

    const partnerId = members[0].user_id;

    // 2. Busca a inscrição de push do parceiro
    const { data: pushData, error: pushError } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", partnerId)
      .single();

    if (pushError || !pushData) {
      return NextResponse.json({
        success: true,
        message: "Parceiro não possui push ativado.",
      });
    }

    // 3. Envia a notificação via Web Push Protocol
    const payload = JSON.stringify({
      title: "Nova ideia de Casal! ❤️",
      body: `${senderName || "Seu amor"} adicionou: "${conteudoTarefa}"`,
    });

    await webpush.sendNotification(pushData.subscription as any, payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na rota de API de push:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
