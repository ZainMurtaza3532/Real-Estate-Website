"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Retrieves an existing conversation or creates a new one between Buyer and Seller for a Property.
 */
export async function getOrCreateConversation(propertyId: string, sellerId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "UNAUTHENTICATED" };
    }

    const buyerId = session.user.id;
    if (buyerId === sellerId) {
      return { success: false, error: "You cannot start a chat with your own listing." };
    }

    let conversation = await prisma.conversation.findUnique({
      where: {
        propertyId_buyerId_sellerId: {
          propertyId,
          buyerId,
          sellerId,
        },
      },
      include: {
        property: {
          select: { id: true, title: true, slug: true, price: true, currency: true, images: true, city: true },
        },
        seller: {
          select: { id: true, name: true, image: true, agencyName: true },
        },
        buyer: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          propertyId,
          buyerId,
          sellerId,
        },
        include: {
          property: {
            select: { id: true, title: true, slug: true, price: true, currency: true, images: true, city: true },
          },
          seller: {
            select: { id: true, name: true, image: true, agencyName: true },
          },
          buyer: {
            select: { id: true, name: true, image: true },
          },
        },
      });
    }

    return { success: true, conversation };
  } catch (err: unknown) {
    console.error("Error in getOrCreateConversation:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to initiate chat." };
  }
}

/**
 * Returns inbox conversations for current user with unread badges, property thumbnails, and last message.
 */
export async function getConversations() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "UNAUTHENTICATED", conversations: [] };

    const userId = session.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        property: {
          select: { id: true, title: true, slug: true, price: true, currency: true, images: true, city: true },
        },
        buyer: {
          select: { id: true, name: true, image: true, email: true },
        },
        seller: {
          select: { id: true, name: true, image: true, agencyName: true, email: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { id: true, text: true, createdAt: true, senderId: true, isRead: true },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId },
              },
            },
          },
        },
      },
    });

    return { success: true, conversations };
  } catch (err: unknown) {
    console.error("Error fetching conversations:", err);
    return { success: false, error: "Failed to fetch conversations", conversations: [] };
  }
}

/**
 * Returns messages for a conversation and marks received messages as read.
 */
export async function getConversationMessages(conversationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "UNAUTHENTICATED", messages: [] };

    const userId = session.user.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    });

    if (!conversation || (conversation.buyerId !== userId && conversation.sellerId !== userId)) {
      return { success: false, error: "UNAUTHORIZED", messages: [] };
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Mark unread messages from counterparty as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true, messages };
  } catch (err: unknown) {
    console.error("Error retrieving messages:", err);
    return { success: false, error: "Failed to retrieve messages", messages: [] };
  }
}

/**
 * Sends a chat message.
 */
export async function sendMessage(conversationId: string, text: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "UNAUTHENTICATED" };

    const trimmed = text.trim();
    if (!trimmed) return { success: false, error: "Message cannot be empty." };

    const userId = session.user.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { buyerId: true, sellerId: true },
    });

    if (!conversation || (conversation.buyerId !== userId && conversation.sellerId !== userId)) {
      return { success: false, error: "UNAUTHORIZED" };
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          text: trimmed,
        },
        include: {
          sender: { select: { id: true, name: true, image: true } },
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    revalidatePath("/dashboard/messages");
    return { success: true, message };
  } catch (err: unknown) {
    console.error("Error sending message:", err);
    return { success: false, error: "Failed to dispatch message." };
  }
}
