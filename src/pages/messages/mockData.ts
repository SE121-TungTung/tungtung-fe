export interface Conversation {
    id: string
    participants: { id: string; name: string; avatarUrl: string }[]
    lastMessage: string
    lastMessageTimestamp: string
}

export interface Message {
    id: string
    senderId: string
    text: string
    timestamp: string
}

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv_1',
        participants: [
            {
                id: 'user_1',
                name: 'Nguyễn Văn A',
                avatarUrl: 'https://i.pravatar.cc/150?img=1',
            },
            {
                id: 'user_0',
                name: 'Bạn',
                avatarUrl: 'https://i.pravatar.cc/150?img=0',
            },
        ],
        lastMessage: 'Ok, hẹn gặp bạn vào ngày mai nhé!',
        lastMessageTimestamp: '10:30 AM',
    },
    {
        id: 'conv_2',
        participants: [
            {
                id: 'user_2',
                name: 'Trần Thị B',
                avatarUrl: 'https://i.pravatar.cc/150?img=2',
            },
            {
                id: 'user_0',
                name: 'Bạn',
                avatarUrl: 'https://i.pravatar.cc/150?img=0',
            },
        ],
        lastMessage: 'Bạn: Đã gửi một tệp đính kèm.',
        lastMessageTimestamp: 'Hôm qua',
    },
    {
        id: 'conv_3',
        participants: [
            {
                id: 'user_3',
                name: 'Giáo viên: Lê Văn C',
                avatarUrl: 'https://i.pravatar.cc/150?img=3',
            },
            {
                id: 'user_0',
                name: 'Bạn',
                avatarUrl: 'https://i.pravatar.cc/150?img=0',
            },
        ],
        lastMessage: 'Cảm ơn thầy ạ.',
        lastMessageTimestamp: 'T. Bảy',
    },
]

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
            id: 'm1_3',
            senderId: 'user_1',
            text: 'Cho mình xin phần Reading nhé. Cảm ơn bạn.',
            timestamp: '10:29 AM',
        },
        {
            id: 'm1_4',
            senderId: 'user_0',
            text: 'Ok, mình gửi liền đây.',
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
            text: 'Bạn ơi, bài tập về nhà làm ở đâu vậy?',
            timestamp: 'Hôm qua',
        },
        {
            id: 'm2_2',
            senderId: 'user_2',
            text: 'Trên trang web của lớp mình đó, phần "Bài tập".',
            timestamp: 'Hôm qua',
        },
        {
            id: 'm2_3',
            senderId: 'user_0',
            text: 'Ok cảm ơn bạn.',
            timestamp: 'Hôm qua',
        },
        {
            id: 'm2_4',
            senderId: 'user_0',
            text: 'Đã gửi một tệp đính kèm.',
            timestamp: 'Hôm qua',
        },
    ],
    conv_3: [
        {
            id: 'm3_1',
            senderId: 'user_0',
            text: 'Thưa thầy, em có thắc mắc về bài giảng hôm nay ạ.',
            timestamp: 'T. Bảy',
        },
        {
            id: 'm3_2',
            senderId: 'user_3',
            text: 'Chào em, em cứ hỏi nhé.',
            timestamp: 'T. Bảy',
        },
        {
            id: 'm3_3',
            senderId: 'user_0',
            text: 'Cảm ơn thầy ạ.',
            timestamp: 'T. Bảy',
        },
    ],
}
