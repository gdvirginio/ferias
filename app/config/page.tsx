import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import webpush from "web-push";

// Captura as variáveis de ambiente sem forçar com "!"
const subject = "mailto:seu-email@dominio.com";
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

// Blinda o build da Vercel: Só executa se as chaves de fato existirem no ambiente
if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function POST(request: Request) {
  try {
    // Validação em Runtime: se alguém tentar usar a rota sem as chaves configuradas no servidor
    if (!publicKey || !privateKey) {
      console.error("Web Push: Chaves VAPID não configuradas no ambiente.");
      return NextResponse.json(
        { error: "Configuração de notificações incompleta no servidor." },
        { status: 500 },
      );
    }

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
