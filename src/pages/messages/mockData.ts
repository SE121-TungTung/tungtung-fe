// src/pages/messages/mockData.ts

// Import types từ file central
import type { Conversation, Message, Participant } from '@/types/message.types'

// Giả lập danh sách người dùng (Participants)
const user0: Participant = {
    id: 'user_0',
    name: 'Bạn (Current User)',
    avatarUrl: 'https://i.pravatar.cc/150?img=0',
    onlineStatus: true,
}
const user1: Participant = {
    id: 'user_1',
    name: 'Nguyễn Văn A',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    onlineStatus: true,
}
const user2: Participant = {
    id: 'user_2',
    name: 'Trần Thị B (Giáo viên)',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    onlineStatus: false,
}
const user3: Participant = {
    id: 'user_3',
    name: 'Lê Văn C',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    onlineStatus: true,
}
const user4: Participant = {
    id: 'user_4',
    name: 'Phạm Thị D',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    onlineStatus: true,
}
const user5: Participant = {
    id: 'user_5',
    name: 'Đặng Văn E',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    onlineStatus: false,
}
const user6: Participant = {
    id: 'user_5',
    name: 'Đặng Văn E',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    onlineStatus: false,
}

// Danh sách cuộc trò chuyện
export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv_1',
        isGroup: false,
        participants: [user0, user1], // Chat 1-1
        lastMessage: 'Ok, hẹn gặp bạn vào ngày mai nhé!',
        lastMessageTimestamp: '10:30 AM',
    },
    {
        id: 'conv_2',
        isGroup: true,
        groupName: 'Nhóm học tập SE121',
        participants: [user0, user2, user3], // Nhóm 3 người
        lastMessage: 'Bạn: Đã gửi một tệp đính kèm.',
        lastMessageTimestamp: 'Hôm qua',
    },
    {
        id: 'conv_3',
        isGroup: false,
        participants: [user0, user2, user6], // Chat 1-1 với giáo viên
        lastMessage: 'Dạ, em cảm ơn cô ạ.',
        lastMessageTimestamp: 'T. Bảy',
    },
    {
        id: 'conv_4',
        isGroup: true,
        groupName: 'Câu lạc bộ Tiếng Anh',
        participants: [user0, user1, user3, user4, user5], // Nhóm 5 người (để test +2)
        lastMessage: 'Phạm Thị D: Mọi người ơi, cuối tuần này nhé!',
        lastMessageTimestamp: 'T. Sáu',
    },
]

// Dữ liệu tin nhắn
export const MOCK_MESSAGES: Record<string, Message[]> = {
    conv_1: [
        {
            id: 'm1_1',
            senderId: 'user_1',
            text: 'Chào bạn, bạn có tài liệu ôn tập hôm trước không?',
            timestamp: '10:28 AM',
        },
        {
            id: 'm1_2',
            senderId: 'user_0',
            text: 'Chào A, mình có đây. Bạn cần phần nào?',
            timestamp: '10:29 AM',
        },
        {
            id: 'm1_5',
            senderId: 'user_1',
            text: 'Ok, hẹn gặp bạn vào ngày mai nhé!',
            timestamp: '10:30 AM',
        },
    ],
    conv_2: [
        {
            id: 'm2_1',
            senderId: 'user_0',
            text: 'Đã gửi một tệp đính kèm.',
            timestamp: 'Hôm qua',
        },
    ],
    conv_3: [
        {
            id: 'm3_1',
            senderId: 'user_2',
            text: 'Em xem lại bài và nộp trước thứ 5 nhé.',
            timestamp: 'T. Bảy',
        },
        {
            id: 'm3_2',
            senderId: 'user_0',
            text: 'Dạ, em cảm ơn cô ạ.',
            timestamp: 'T. Bảy',
        },
    ],
    conv_4: [
        {
            id: 'm4_1',
            senderId: 'user_3',
            text: 'Chúng ta bắt đầu họp nhé!',
            timestamp: 'T. Sáu',
        },
        {
            id: 'm4_2',
            senderId: 'user_4',
            text: 'Mọi người ơi, cuối tuần này nhé!',
            timestamp: 'T. Sáu',
        },
    ],
}
