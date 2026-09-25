// Dữ liệu lộ trình luyện phát âm, luyện chuyên sâu theo âm vị và thử thách hàng ngày

export interface RoadmapLevel {
    id: number
    title: string
    subtitle: string
    description: string
    groups: {
        title: string
        items: string[]
        targetType: 'word' | 'sentence' | 'paragraph'
    }[]
}

export interface PhonemeGroup {
    symbol: string
    name: string
    type: 'vowel' | 'consonant'
    description: string
    exampleWord: string
    words: string[]
}

export interface DailyChallengeItem {
    id: string
    type: 'word' | 'sentence' | 'paragraph'
    label: string
    text: string
    hint: string
}

// 1. LỘ TRÌNH 4 CẤP ĐỘ PHÁT ÂM (ROADMAP)
export const ROADMAP_LEVELS: RoadmapLevel[] = [
    {
        id: 1,
        title: 'Cấp 1: Chuẩn Hóa 44 Âm IPA',
        subtitle: 'Cặp âm đối lập dễ nhầm lẫn (Minimal Pairs)',
        description:
            'Luyện chuẩn các âm nguyên âm ngắn/dài và phụ âm đặc thù trong tiếng Anh.',
        groups: [
            {
                title: 'Nguyên âm /iː/ (dài) vs /ɪ/ (ngắn)',
                items: [
                    'sheep',
                    'ship',
                    'green',
                    'clean',
                    'fit',
                    'sit',
                    'live',
                    'leave',
                    'feel',
                    'fill',
                ],
                targetType: 'word',
            },
            {
                title: 'Nguyên âm /e/ vs /æ/ (bẹt)',
                items: [
                    'bed',
                    'bad',
                    'men',
                    'man',
                    'pen',
                    'pan',
                    'head',
                    'had',
                    'said',
                    'sad',
                ],
                targetType: 'word',
            },
            {
                title: 'Phụ âm /θ/ vs /s/ & /t/',
                items: [
                    'think',
                    'sink',
                    'thank',
                    'tank',
                    'thick',
                    'sick',
                    'three',
                    'tree',
                    'bath',
                    'path',
                ],
                targetType: 'word',
            },
            {
                title: 'Phụ âm /b/ vs /v/ vs /w/',
                items: [
                    'vet',
                    'wet',
                    'bet',
                    'vine',
                    'wine',
                    'vest',
                    'west',
                    'best',
                    'van',
                    'ban',
                ],
                targetType: 'word',
            },
            {
                title: 'Phụ âm /ʃ/ vs /tʃ/ vs /dʒ/',
                items: [
                    'shoe',
                    'choose',
                    'share',
                    'chair',
                    'sheep',
                    'cheap',
                    'judge',
                    'general',
                    'journey',
                    'major',
                ],
                targetType: 'word',
            },
        ],
    },
    {
        id: 2,
        title: 'Cấp 2: Trọng Âm Từ & Nhịp Điệu (Word Stress)',
        subtitle: 'Làm chủ trọng âm 2, 3, 4 âm tiết trong IELTS',
        description:
            'Nâng cao độ chính xác khi phát âm từ học thuật nhiều âm tiết.',
        groups: [
            {
                title: 'Từ 2 âm tiết (Danh từ vs Động từ)',
                items: [
                    'present',
                    'record',
                    'contrast',
                    'export',
                    'import',
                    'increase',
                    'decrease',
                    'progress',
                ],
                targetType: 'word',
            },
            {
                title: 'Từ 3 âm tiết có trọng âm thách thức',
                items: [
                    'comfortable',
                    'photograph',
                    'calendar',
                    'industry',
                    'recognize',
                    'accurate',
                    'character',
                ],
                targetType: 'word',
            },
            {
                title: 'Từ 4+ âm tiết học thuật IELTS',
                items: [
                    'architecture',
                    'environment',
                    'phenomenon',
                    'development',
                    'technological',
                    'enthusiasm',
                    'responsibility',
                    'pronunciation',
                ],
                targetType: 'word',
            },
        ],
    },
    {
        id: 3,
        title: 'Cấp 3: Nối Âm & Biến Âm (Connected Speech)',
        subtitle: 'Phát âm tự nhiên như người bản xứ',
        description:
            'Quy tắc nối phụ âm - nguyên âm (C+V), âm chèn (Intrusive Sounds) và nuốt âm (Elision).',
        groups: [
            {
                title: 'Nối phụ âm sang nguyên âm (Consonant to Vowel)',
                items: [
                    'pick it up',
                    'turn off the light',
                    'first of all',
                    'an apple a day',
                    'hold on a second',
                    'not at all',
                ],
                targetType: 'sentence',
            },
            {
                title: 'Nuốt âm (Elision t/d)',
                items: [
                    'next door',
                    'last night',
                    'fast food',
                    'hold tight',
                    'stand there',
                ],
                targetType: 'sentence',
            },
            {
                title: 'Dạng rút gọn (Contractions)',
                items: [
                    "I should've known that.",
                    "She wouldn't do it.",
                    "We've been waiting for hours.",
                    "It's not what I thought.",
                ],
                targetType: 'sentence',
            },
        ],
    },
    {
        id: 4,
        title: 'Cấp 4: Ngữ Điệu & Chia Nhịp IELTS Speaking',
        subtitle: 'Chinh phục Band 7.0+ Pronunciation & Fluency',
        description:
            'Luyện ngắt nhịp (Chunking), trọng âm câu (Sentence Stress) và ngữ điệu lên/xuống (Intonation).',
        groups: [
            {
                title: 'Ngữ điệu câu hỏi Yes/No vs Wh- (Rising & Falling)',
                items: [
                    'Do you often go to the cinema on weekends?',
                    'Are you interested in learning new languages?',
                    'What kind of music do you usually listen to?',
                    'Where would you like to travel in the future?',
                ],
                targetType: 'sentence',
            },
            {
                title: 'Câu phức IELTS Speaking Part 1 & 2',
                items: [
                    'To be completely honest, I have always had a deep passion for modern architectural designs.',
                    'From my personal perspective, digital transformation has fundamentally changed the way we communicate.',
                    'Although studying abroad can be rather challenging initially, it definitely broadens your global mindset.',
                    'I am firmly convinced that daily physical exercise brings tremendous benefits to both mental and physical well-being.',
                ],
                targetType: 'sentence',
            },
        ],
    },
]

// 2. DANH SÁCH ÂM VỊ CHUYÊN SÂU & TỪ LUYỆN THEO ÂM (PHONEME PRACTICE)
export const PHONEME_GROUPS: PhonemeGroup[] = [
    {
        symbol: '/θ/',
        name: 'Âm Th thổi (Voiceless TH)',
        type: 'consonant',
        description:
            'Đặt đầu lưỡi giữa hai hàm răng và đẩy luồng hơi ra, không rung dây thanh quản.',
        exampleWord: 'think',
        words: [
            'think',
            'thank',
            'three',
            'through',
            'bath',
            'mouth',
            'healthy',
            'author',
            'cloth',
            'athlete',
            'method',
            'birthday',
            'wealthy',
        ],
    },
    {
        symbol: '/ð/',
        name: 'Âm Th rung (Voiced TH)',
        type: 'consonant',
        description:
            'Đặt đầu lưỡi giữa hai hàm răng, đẩy hơi ra và rung dây thanh quản.',
        exampleWord: 'this',
        words: [
            'this',
            'that',
            'these',
            'those',
            'brother',
            'mother',
            'weather',
            'together',
            'breathe',
            'smooth',
            'feather',
            'father',
            'leather',
        ],
    },
    {
        symbol: '/iː/',
        name: 'Nguyên âm e dài (Long E)',
        type: 'vowel',
        description:
            'Môi kéo sang hai bên như đang cười nhẹ, giữ âm căng và kéo dài.',
        exampleWord: 'sheep',
        words: [
            'sheep',
            'sheet',
            'green',
            'clean',
            'beach',
            'peace',
            'athlete',
            'belief',
            'receive',
            'machine',
            'people',
            'unique',
        ],
    },
    {
        symbol: '/ɪ/',
        name: 'Nguyên âm i ngắn (Short I)',
        type: 'vowel',
        description: 'Môi thư giãn, mở hờ, phát âm dứt khoát nửa i nửa ê.',
        exampleWord: 'ship',
        words: [
            'ship',
            'sit',
            'fit',
            'live',
            'minute',
            'build',
            'business',
            'system',
            'village',
            'women',
            'symbol',
            'listen',
        ],
    },
    {
        symbol: '/æ/',
        name: 'Nguyên âm a bẹt (Ash / Flat A)',
        type: 'vowel',
        description:
            'Hạ hàm dưới xuống sâu, miệng mở rộng hết cỡ sang hai bên.',
        exampleWord: 'cat',
        words: [
            'cat',
            'bad',
            'apple',
            'family',
            'action',
            'attitude',
            'practice',
            'channel',
            'camera',
            'matter',
            'traffic',
            'national',
        ],
    },
    {
        symbol: '/ʌ/',
        name: 'Nguyên âm á ngắn (Strut)',
        type: 'vowel',
        description:
            'Miệng mở hờ tự nhiên, phát âm dứt khoát như âm "á" ngắn trong tiếng Việt.',
        exampleWord: 'cup',
        words: [
            'cup',
            'cut',
            'comfortable',
            'country',
            'money',
            'blood',
            'flood',
            'trouble',
            'structure',
            'culture',
            'sunny',
            'wonder',
        ],
    },
    {
        symbol: '/ʃ/',
        name: 'Âm Sh nặng (Voiceless Palato-alveolar)',
        type: 'consonant',
        description:
            'Chu tròn môi về phía trước, luồng hơi thoát ra qua khe răng tạo âm xì xào mạnh.',
        exampleWord: 'shoe',
        words: [
            'shoe',
            'shirt',
            'sugar',
            'special',
            'ocean',
            'machine',
            'delicious',
            'precious',
            'condition',
            'nation',
            'crush',
            'fashion',
        ],
    },
    {
        symbol: '/tʃ/',
        name: 'Âm Ch bật (Voiceless Affricate)',
        type: 'consonant',
        description:
            'Khép răng và chu môi, bật âm t dính liền với sh một cách dứt khoát.',
        exampleWord: 'chair',
        words: [
            'chair',
            'chin',
            'catch',
            'match',
            'nature',
            'picture',
            'future',
            'culture',
            'question',
            'feature',
            'achieve',
            'choice',
        ],
    },
    {
        symbol: '/dʒ/',
        name: 'Âm J rung (Voiced Affricate)',
        type: 'consonant',
        description:
            'Hình miệng giống âm /tʃ/ nhưng cần rung dây thanh quản mạnh mẽ.',
        exampleWord: 'judge',
        words: [
            'judge',
            'edge',
            'bridge',
            'general',
            'region',
            'major',
            'adjust',
            'journey',
            'educate',
            'schedule',
            'magic',
            'energy',
        ],
    },
    {
        symbol: '/z/',
        name: 'Âm Z rung (Voiced Sibilant)',
        type: 'consonant',
        description:
            'Hai hàm răng khép hờ, luồng hơi xì qua khe răng kèm rung mạnh dây thanh quản.',
        exampleWord: 'prize',
        words: [
            'prize',
            'buzz',
            'rose',
            'music',
            'reason',
            'president',
            'cause',
            'busy',
            'design',
            'result',
            'always',
            'realize',
        ],
    },
    {
        symbol: '/ŋ/',
        name: 'Âm Ng (Velar Nasal)',
        type: 'consonant',
        description:
            'Cuống lưỡi nâng lên chạm vòm họng mềm, đẩy hơi thoát ra hoàn toàn bằng đường mũi.',
        exampleWord: 'sing',
        words: [
            'sing',
            'ring',
            'song',
            'strong',
            'language',
            'English',
            'finger',
            'bring',
            'morning',
            'learning',
            'longer',
            'young',
        ],
    },
    {
        symbol: '/l/ & /r/',
        name: 'Cặp âm uốn lưỡi L và R',
        type: 'consonant',
        description:
            'Luyện phân biệt đầu lưỡi chạm vòm miệng (/l/) và cong sâu về sau (/r/).',
        exampleWord: 'light vs right',
        words: [
            'light',
            'right',
            'lead',
            'read',
            'glass',
            'grass',
            'fly',
            'fry',
            'play',
            'pray',
            'climb',
            'crime',
        ],
    },
]

// 3. THỬ THÁCH HÀNG NGÀY (DAILY PRACTICE GENERATOR)
const DAILY_WORDS_POOL = [
    {
        text: 'comfortable',
        hint: 'Chú ý trọng âm rơi vào âm tiết đầu /kˈʌmftəbəl/',
    },
    {
        text: 'architecture',
        hint: 'Âm /k/ ở chữ ch và đuôi /tʃər/: /ˈɑːrkɪtektʃər/',
    },
    { text: 'environment', hint: 'Trọng âm âm tiết thứ 2 /ɪnˈvaɪrənmənt/' },
    {
        text: 'phenomenon',
        hint: 'Trọng âm âm tiết 2 /fəˈnɒmɪnən/, số nhiều phenomena',
    },
    { text: 'enthusiasm', hint: 'Luyện âm /θ/ và trọng âm 2 /ɪnˈθjuːziæzəm/' },
    {
        text: 'particularly',
        hint: 'Âm tiết đa tầng, uốn lưỡi /pərˈtɪkjələrli/',
    },
    { text: 'strengths', hint: 'Âm cuối khó /ŋθs/, chú ý không bỏ đuôi' },
]

const DAILY_PHRASES_POOL = [
    { text: 'pick it up right now', hint: 'Nối âm: /pɪk ɪt ʌp/' },
    { text: 'an apple a day', hint: 'Nối âm C+V liên tục: /ən ˈæpl ə deɪ/' },
    { text: 'turn off the television', hint: 'Nối âm: /tɜːrn ɒf/' },
    { text: 'hold on for a moment', hint: 'Nối âm: /həʊld ɒn fər ə/' },
    { text: 'first of all, thank you', hint: 'Nối âm: /fɜːst əv ɔːl/' },
]

const DAILY_SENTENCES_POOL = [
    {
        text: 'Could you please tell me how to get to the station?',
        hint: 'Lên giọng nhẹ ở cuối câu hỏi',
    },
    {
        text: 'To be completely honest, I have always loved acoustic music.',
        hint: 'Ngắt nhịp sau cụm mở đầu',
    },
    {
        text: 'Technological advancement plays a crucial role in modern life.',
        hint: 'Nhấn mạnh từ khóa technological, crucial, modern',
    },
    {
        text: 'I am firmly convinced that daily practice brings great success.',
        hint: 'Trọng âm câu dồn vào firmly convinced, daily practice',
    },
]

export function getDailyChallenge(seedOffset = 0): DailyChallengeItem[] {
    const today = new Date()
    // Sử dụng ngày trong năm + seedOffset để chọn bài tập deterministic
    const dayOfYear =
        Math.floor(
            (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
                1000 /
                60 /
                60 /
                24
        ) + seedOffset

    const wordItem =
        DAILY_WORDS_POOL[Math.abs(dayOfYear) % DAILY_WORDS_POOL.length]
    const phraseItem =
        DAILY_PHRASES_POOL[Math.abs(dayOfYear + 1) % DAILY_PHRASES_POOL.length]
    const sentenceItem =
        DAILY_SENTENCES_POOL[
            Math.abs(dayOfYear + 2) % DAILY_SENTENCES_POOL.length
        ]

    return [
        {
            id: 'daily_word',
            type: 'word',
            label: 'Từ vựng âm vị hôm nay',
            text: wordItem.text,
            hint: wordItem.hint,
        },
        {
            id: 'daily_phrase',
            type: 'sentence',
            label: 'Cụm từ nối âm hôm nay',
            text: phraseItem.text,
            hint: phraseItem.hint,
        },
        {
            id: 'daily_sentence',
            type: 'sentence',
            label: 'Câu phản xạ IELTS hôm nay',
            text: sentenceItem.text,
            hint: sentenceItem.hint,
        },
    ]
}
