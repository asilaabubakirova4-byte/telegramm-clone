import { prisma } from '../database/connection'

export const chatService = {
  // Create or get existing direct chat between two users
  async createOrGetDirectChat(userId1: string, userId2: string) {
    // Find existing direct chat between these two users
    const existingChat = await prisma.chat.findFirst({
      where: {
        type: 'direct',
        AND: [
          { members: { some: { userId: userId1 } } },
          { members: { some: { userId: userId2 } } }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                avatarUrl: true,
                onlineStatus: true,
                lastSeen: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, firstName: true }
            }
          }
        }
      }
    })

    if (existingChat) {
      return existingChat
    }

    // Create new direct chat
    const newChat = await prisma.chat.create({
      data: {
        type: 'direct',
        creatorId: userId1,
        members: {
          create: [
            { userId: userId1, role: 'member' },
            { userId: userId2, role: 'member' }
          ]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                avatarUrl: true,
                onlineStatus: true,
                lastSeen: true
              }
            }
          }
        },
        messages: true
      }
    })

    return newChat
  },

  // Get all chats for a user
  async getUserChats(userId: string) {
    const chats = await prisma.chat.findMany({
      where: {
        members: { some: { userId } }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                avatarUrl: true,
                onlineStatus: true,
                lastSeen: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, firstName: true }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return chats
  },

  // Get chat by ID
  async getChatById(chatId: string, userId: string) {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        members: { some: { userId } }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                avatarUrl: true,
                onlineStatus: true,
                lastSeen: true
              }
            }
          }
        }
      }
    })

    return chat
  },

  // Get messages for a chat
  async getChatMessages(chatId: string, userId: string, limit = 50, before?: string) {
    // Verify user is member of chat
    const isMember = await prisma.chatMember.findFirst({
      where: { chatId, userId }
    })

    if (!isMember) {
      throw new Error('Not a member of this chat')
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId,
        isDeleted: false,
        ...(before && { createdAt: { lt: new Date(before) } })
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarUrl: true
          }
        },
        statuses: {
          where: { status: 'seen' },
          select: { userId: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Transform messages to include seenBy array
    return messages.reverse().map(msg => ({
      ...msg,
      seenBy: msg.statuses.map(s => s.userId),
      statuses: undefined
    }))
  },

  // Send a message
  async sendMessage(chatId: string, senderId: string, content: string, type = 'text') {
    // Verify user is member of chat
    const isMember = await prisma.chatMember.findFirst({
      where: { chatId, userId: senderId }
    })

    if (!isMember) {
      throw new Error('Not a member of this chat')
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content,
        type
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    })

    // Update chat's updatedAt
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    })

    return message
  },

  // Create group chat
  async createGroup(creatorId: string, name: string, memberIds: string[]) {
    // Add creator to members if not already included
    const allMemberIds = [...new Set([creatorId, ...memberIds])]

    const chat = await prisma.chat.create({
      data: {
        type: 'group',
        name,
        creatorId,
        members: {
          create: allMemberIds.map(userId => ({
            userId,
            role: userId === creatorId ? 'admin' : 'member'
          }))
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                avatarUrl: true,
                onlineStatus: true,
                lastSeen: true
              }
            }
          }
        },
        messages: true
      }
    })

    return chat
  },

  // Create channel
  async createChannel(creatorId: string, name: string, _description: string, memberIds: string[]) {
    // Add creator to members if not already included
    const allMemberIds = [...new Set([creatorId, ...memberIds])]

    const chat = await prisma.chat.create({
      data: {
        type: 'channel',
        name,
        creatorId,
        members: {
          create: allMemberIds.map(userId => ({
            userId,
            role: userId === creatorId ? 'admin' : 'member'
          }))
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                avatarUrl: true,
                onlineStatus: true,
                lastSeen: true
              }
            }
          }
        },
        messages: true
      }
    })

    return chat
  },

  // Mark messages as seen
  async markMessagesAsSeen(chatId: string, userId: string, messageIds: string[]) {
    // Verify user is member of chat
    const isMember = await prisma.chatMember.findFirst({
      where: { chatId, userId }
    })

    if (!isMember) {
      throw new Error('Not a member of this chat')
    }

    // Create or update message statuses
    const statusPromises = messageIds.map(messageId =>
      prisma.messageStatus.upsert({
        where: {
          messageId_userId: { messageId, userId }
        },
        create: {
          messageId,
          userId,
          status: 'seen'
        },
        update: {
          status: 'seen',
          timestamp: new Date()
        }
      })
    )

    await Promise.all(statusPromises)

    return { success: true }
  },

  // Get message statuses for a chat
  async getMessageStatuses(chatId: string, messageIds: string[]) {
    const statuses = await prisma.messageStatus.findMany({
      where: {
        messageId: { in: messageIds },
        status: 'seen'
      },
      select: {
        messageId: true,
        userId: true,
        status: true
      }
    })

    // Group by messageId
    const statusMap: Record<string, string[]> = {}
    statuses.forEach(s => {
      if (!statusMap[s.messageId]) {
        statusMap[s.messageId] = []
      }
      statusMap[s.messageId].push(s.userId)
    })

    return statusMap
  },

  // Delete message
  async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.message.findFirst({
      where: { id: messageId }
    })

    if (!message) {
      throw new Error('Message not found')
    }

    // Only sender can delete their own message
    if (message.senderId !== userId) {
      throw new Error('Cannot delete other user message')
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true }
    })

    return { success: true }
  },

  // Edit message
  async editMessage(messageId: string, userId: string, newContent: string) {
    const message = await prisma.message.findFirst({
      where: { id: messageId }
    })

    if (!message) {
      throw new Error('Message not found')
    }

    // Only sender can edit their own message
    if (message.senderId !== userId) {
      throw new Error('Cannot edit other user message')
    }

    // Only text messages can be edited
    if (message.type !== 'text') {
      throw new Error('Only text messages can be edited')
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { 
        content: newContent,
        isEdited: true
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    })

    return updatedMessage
  },

  // Delete chat
  async deleteChat(chatId: string, userId: string) {
    // Verify user is member of chat
    const isMember = await prisma.chatMember.findFirst({
      where: { chatId, userId }
    })

    if (!isMember) {
      throw new Error('Not a member of this chat')
    }

    // Delete all messages first
    await prisma.message.deleteMany({
      where: { chatId }
    })

    // Delete all chat members
    await prisma.chatMember.deleteMany({
      where: { chatId }
    })

    // Delete the chat
    await prisma.chat.delete({
      where: { id: chatId }
    })
  }
}
