// Cơ sở tri thức huấn luyện ngữ âm chi tiết (Articulatory Phonetics Coaching Engine)
// Cung cấp hướng dẫn sửa lỗi khẩu hình chuyên sâu, đa dạng, hữu ích cho từng cặp âm vị và lỗi phát âm

export interface PhonemeProfile {
    symbol: string
    name: string
    category:
        | 'vowel_long'
        | 'vowel_short'
        | 'diphthong'
        | 'plosive'
        | 'fricative'
        | 'affricate'
        | 'nasal'
        | 'approximant'
    voicing: 'voiceless' | 'voiced'
    lips: string
    tongue: string
    airflow: string
    actionCue: string
}

export const PHONEME_PROFILES: Record<string, PhonemeProfile> = {
    // === NGUYÊN ÂM ĐƠN DÀI / CĂNG ===
    iː: {
        symbol: 'iː',
        name: 'Nguyên âm trước căng dài /iː/',
        category: 'vowel_long',
        voicing: 'voiced',
        lips: 'Kéo khóe miệng căng sang hai bên như đang cười tươi hết cỡ, hai hàm răng mở hẹp.',
        tongue: 'Thân lưỡi nâng rất cao sát vòm ngạc cứng phía trước, đầu lưỡi chạm chân răng dưới.',
        airflow:
            'Dây thanh quản rung mạnh, luồng hơi duy trì căng chắc và ngân dài.',
        actionCue:
            'Giữ nụ cười tươi trong 2 giây khi phát âm (tương tự như khi hô "cheese!").',
    },
    uː: {
        symbol: 'uː',
        name: 'Nguyên âm sau tròn môi dài /uː/',
        category: 'vowel_long',
        voicing: 'voiced',
        lips: 'Môi chu tròn nhỏ và căng đẩy mạnh về phía trước như chuẩn bị huýt sáo.',
        tongue: 'Cuống lưỡi nâng cao về phía vòm mềm, đầu lưỡi hạ thấp lùi về sau.',
        airflow: 'Âm ngân dài, trầm sâu và tạo độ vang từ cuống họng.',
        actionCue:
            'Chu môi thành một lỗ tròn nhỏ như đầu ống hút và giữ âm kéo dài.',
    },
    ɑː: {
        symbol: 'ɑː',
        name: 'Nguyên âm sau mở rộng dài /ɑː/',
        category: 'vowel_long',
        voicing: 'voiced',
        lips: 'Mở rộng miệng theo chiều dọc, hạ hàm dưới xuống thật sâu, môi thả lỏng.',
        tongue: 'Toàn bộ thân lưỡi hạ phẳng xuống đáy miệng và hơi thụt nhẹ về phía sau.',
        airflow: 'Âm trầm sâu, ngân dài phát ra từ cuống họng.',
        actionCue: 'Há to miệng như khi bác sĩ kiểm tra họng và kêu "Aaaa".',
    },
    ɔː: {
        symbol: 'ɔː',
        name: 'Nguyên âm sau tròn môi dài /ɔː/',
        category: 'vowel_long',
        voicing: 'voiced',
        lips: 'Môi chu tròn rõ rệt về phía trước, hàm dưới hạ vừa phải.',
        tongue: 'Cuống lưỡi nâng nhẹ về phía sau vòm họng.',
        airflow: 'Âm ngân dài đầy đặn và có độ vang tròn trong vòm miệng.',
        actionCue: 'Giữ hình môi tròn như chữ O và kéo dài âm 1-2 giây.',
    },
    ɜː: {
        symbol: 'ɜː',
        name: 'Nguyên âm giữa căng /ɜː/ (hoặc /ɝ/)',
        category: 'vowel_long',
        voicing: 'voiced',
        lips: 'Môi mở hờ tự nhiên trung tính, hơi căng nhẹ.',
        tongue: 'Thân lưỡi đặt ở giữa vòm miệng (giọng Mỹ: cong nhẹ đầu lưỡi ngược về sau nhưng không chạm ngạc).',
        airflow: 'Âm ngân dài, tạo độ vang trầm ấm từ giữa khoang miệng.',
        actionCue:
            'Giữ cơ miệng cố định ở mức nửa vời và phát âm sâu từ cổ họng.',
    },

    // === NGUYÊN ÂM ĐƠN NGẮN / CHÙNG ===
    ɪ: {
        symbol: 'ɪ',
        name: 'Nguyên âm trước chùng ngắn /ɪ/',
        category: 'vowel_short',
        voicing: 'voiced',
        lips: 'Môi hơi hé mở tự nhiên, hoàn toàn thả lỏng khóe miệng (không kéo căng như /iː/).',
        tongue: 'Lưỡi nâng ở mức cao - trung bình, thấp hơn và lỏng hơn nhiều so với /iː/.',
        airflow:
            'Phát âm cực kỳ nhanh gọn dứt khoát, âm sắc nằm giữa âm "i" và "ê".',
        actionCue:
            'Hạ hàm dưới xuống khoảng 1cm, thả lỏng toàn bộ cơ mặt và giật âm dứt khoát.',
    },
    e: {
        symbol: 'e',
        name: 'Nguyên âm trước mở vừa ngắn /e/ (hoặc /ɛ/)',
        category: 'vowel_short',
        voicing: 'voiced',
        lips: 'Miệng mở vừa phải theo chiều ngang, thoải mái tự nhiên.',
        tongue: 'Đầu lưỡi chạm chân răng dưới, thân lưỡi nâng ở mức trung bình.',
        airflow:
            'Phát âm dứt khoát, âm ngắn gọn tương tự âm "e" nhẹ trong tiếng Việt.',
        actionCue: 'Miệng mở rộng hơn âm /ɪ/ một chút, cơ mặt thoải mái.',
    },
    æ: {
        symbol: 'æ',
        name: 'Nguyên âm trước mở rộng /æ/ (a bẹt)',
        category: 'vowel_short',
        voicing: 'voiced',
        lips: 'Kéo căng khóe miệng sang hai bên đồng thời hạ hàm dưới thật sâu hết cỡ.',
        tongue: 'Đáy lưỡi hạ thấp sát sàn miệng, đầu lưỡi chạm chân răng hàm dưới.',
        airflow:
            'Bật âm to, vang rộng từ đáy họng, âm thanh lai giữa "a" và "e".',
        actionCue:
            'Tưởng tượng miệng mở to hết cỡ để cắn trọn một trái táo to ("apple").',
    },
    ʌ: {
        symbol: 'ʌ',
        name: 'Nguyên âm giữa ngắn /ʌ/ (á ngắn)',
        category: 'vowel_short',
        voicing: 'voiced',
        lips: 'Miệng mở hé tự nhiên ở trạng thái nghỉ, không chu môi, không căng mép.',
        tongue: 'Lưỡi đặt phẳng tự nhiên ở giữa khoang miệng, không nâng cũng không hạ sâu.',
        airflow:
            'Bật âm nhanh, gọn, dứt khoát từ cổ họng như tiếng "á" nhẹ khi giật mình.',
        actionCue:
            'Đừng hạ hàm quá sâu như /ɑː/, chỉ cần mở hờ miệng và đẩy luồng hơi ngắn gọn.',
    },
    ʊ: {
        symbol: 'ʊ',
        name: 'Nguyên âm sau chùng ngắn /ʊ/',
        category: 'vowel_short',
        voicing: 'voiced',
        lips: 'Môi hơi tròn tự nhiên thả lỏng, không chu mỏ nhọn và căng như /uː/.',
        tongue: 'Cuống lưỡi hơi nâng nhẹ về sau, đầu lưỡi nằm tự nhiên.',
        airflow: 'Phát âm ngắn, gọn dứt khoát, âm sắc nằm giữa âm "u" và "ư".',
        actionCue: 'Thả lỏng cơ môi, phát âm ngắn gọn như tiếng bật hơi nhẹ.',
    },
    ɒ: {
        symbol: 'ɒ',
        name: 'Nguyên âm sau mở ngắn /ɒ/ (o ngắn giọng Anh)',
        category: 'vowel_short',
        voicing: 'voiced',
        lips: 'Môi hơi tròn nhẹ, thả lỏng, hạ hàm dưới sâu.',
        tongue: 'Cuống lưỡi hạ thấp ở phía sau vòm họng.',
        airflow: 'Phát âm dứt khoát, thời lượng ngắn gọn.',
        actionCue: 'Hạ sâu quai hàm và tròn miệng nhẹ, ngắt âm ngay lập tức.',
    },
    ə: {
        symbol: 'ə',
        name: 'Âm Schwa trung tính /ə/',
        category: 'vowel_short',
        voicing: 'voiced',
        lips: 'Thả lỏng hoàn toàn cơ môi và cơ mặt ở trạng thái nghỉ ngơi tĩnh.',
        tongue: 'Lưỡi nằm phẳng thư giãn ở trung tâm khoang miệng.',
        airflow:
            'Phát âm cực kỳ ngắn, nhẹ nhàng, không bao giờ mang trọng âm chính.',
        actionCue:
            'Phát ra một âm "ơ" thật khẽ, lười biếng và nhẹ nhàng nhất có thể.',
    },

    // === NGUYÊN ÂM ĐÔI (DIPHTHONGS) ===
    eɪ: {
        symbol: 'eɪ',
        name: 'Nguyên âm đôi /eɪ/',
        category: 'diphthong',
        voicing: 'voiced',
        lips: 'Bắt đầu mở vừa ở /e/ rồi lướt mượt mà kéo căng mép sang hai bên lên /ɪ/.',
        tongue: 'Thân lưỡi nâng dần từ vị trí trung bình lên cao phía trước.',
        airflow: 'Âm đầu /e/ chiếm 70% thời lượng, lướt êm về /ɪ/.',
        actionCue:
            'Tránh đọc giật cục thành chữ "ê" tiếng Việt; hãy lướt mượt mà như "eyyy".',
    },
    aɪ: {
        symbol: 'aɪ',
        name: 'Nguyên âm đôi /aɪ/',
        category: 'diphthong',
        voicing: 'voiced',
        lips: 'Bắt đầu há rộng miệng ở /a/ rồi khép dần hàm và kéo nhẹ khóe miệng về /ɪ/.',
        tongue: 'Lưỡi di chuyển từ vị trí hạ thấp lên cao.',
        airflow: 'Lướt liền mạch từ mở rộng sang thu hẹp.',
        actionCue: 'Mở to hàm trước rồi mới khép miệng dần, đừng đọc cụt lủn.',
    },
    ɔɪ: {
        symbol: 'ɔɪ',
        name: 'Nguyên âm đôi /ɔɪ/',
        category: 'diphthong',
        voicing: 'voiced',
        lips: 'Bắt đầu từ khẩu hình môi chu tròn /ɔː/ rồi lướt mở dẹt mép sang /ɪ/.',
        tongue: 'Cuống lưỡi hạ dần và chuyển trọng tâm lên thân lưỡi phía trước.',
        airflow: 'Luồng âm lướt mượt từ tròn sang dẹt.',
        actionCue: 'Lướt êm từ hình môi tròn chữ O sang một nụ cười mỉm.',
    },
    aʊ: {
        symbol: 'aʊ',
        name: 'Nguyên âm đôi /aʊ/',
        category: 'diphthong',
        voicing: 'voiced',
        lips: 'Mở to miệng ở /a/ rồi chu tròn dần môi về phía trước ở /ʊ/.',
        tongue: 'Lưỡi nâng dần từ thấp lên cao phía sau.',
        airflow: 'Lướt mượt mà từ mở to sang chu nhỏ môi.',
        actionCue:
            'Tránh đọc thành "ao" cộc lốc; môi phải kết thúc ở hình chu tròn nhỏ.',
    },
    oʊ: {
        symbol: 'oʊ',
        name: 'Nguyên âm đôi /oʊ/ (hoặc /əʊ/)',
        category: 'diphthong',
        voicing: 'voiced',
        lips: 'Mở nhẹ tự nhiên ở trung tâm rồi chu tròn thu nhỏ môi lại về /ʊ/.',
        tongue: 'Cuống lưỡi nâng nhẹ dần về vòm mềm.',
        airflow: 'Âm lướt tròn dần về cuối.',
        actionCue:
            'Tránh đọc thành chữ "ô" cụt; môi phải chuyển động thu tròn dần ở đuôi âm.',
    },

    // === PHỤ ÂM TẮC BẬT (PLOSIVES) ===
    p: {
        symbol: 'p',
        name: 'Phụ âm môi bật vô thanh /p/',
        category: 'plosive',
        voicing: 'voiceless',
        lips: 'Ngậm chặt hai môi lại nén luồng hơi trong miệng rồi bật bung mạnh ra.',
        tongue: 'Lưỡi đặt tự nhiên thả lỏng.',
        airflow:
            'Vô thanh (dây thanh KHÔNG rung), bật ra luồng gió cực mạnh làm bay tờ giấy.',
        actionCue:
            'Đặt một mẩu giấy trước môi: khi bật âm /p/, luồng gió phải làm giấy bay mạnh.',
    },
    b: {
        symbol: 'b',
        name: 'Phụ âm môi bật hữu thanh /b/',
        category: 'plosive',
        voicing: 'voiced',
        lips: 'Ngậm hai môi chặn luồng hơi rồi bật nhẹ mở ra.',
        tongue: 'Lưỡi đặt tự nhiên.',
        airflow:
            'Hữu thanh: Dây thanh quản rung mạnh ngay khi hai môi tách ra, luồng gió yếu hơn /p/.',
        actionCue:
            'Đặt ngón tay lên cổ họng, cảm nhận độ rung mạnh khi môi vừa tách ra.',
    },
    t: {
        symbol: 't',
        name: 'Phụ âm chân răng bật vô thanh /t/',
        category: 'plosive',
        voicing: 'voiceless',
        lips: 'Môi mở tự nhiên theo nguyên âm tiếp theo.',
        tongue: 'Đầu lưỡi áp chặt vào chân răng hàm trên chặn hơi rồi giật dứt khoát bật ra.',
        airflow:
            'Vô thanh (không rung họng), luồng gió bắn ra mạnh mẽ, khô giòn và sắc bén.',
        actionCue:
            'Đừng phát âm thành chữ "tê" tiếng Việt; đầu lưỡi bật sắc như tiếng gõ thước kẻ.',
    },
    d: {
        symbol: 'd',
        name: 'Phụ âm chân răng bật hữu thanh /d/',
        category: 'plosive',
        voicing: 'voiced',
        lips: 'Môi mở tự nhiên.',
        tongue: 'Đầu lưỡi áp vào chân răng hàm trên chặn hơi rồi bật nhẹ.',
        airflow:
            'Hữu thanh: Rung mạnh dây thanh quản, luồng gió bật nhẹ hơn âm /t/.',
        actionCue:
            'Cảm nhận độ rung rõ rệt ở thanh quản ngay khi đầu lưỡi rời chân răng.',
    },
    k: {
        symbol: 'k',
        name: 'Phụ âm vòm mềm bật vô thanh /k/',
        category: 'plosive',
        voicing: 'voiceless',
        lips: 'Môi mở tự nhiên.',
        tongue: 'Cuống lưỡi nâng cao áp chặt vào vòm mềm ngắt hơi rồi bật bung luồng gió mạnh.',
        airflow:
            'Vô thanh (không rung cổ họng), luồng gió "kh" khô sắc bắn ra từ cuống họng.',
        actionCue:
            'Không thêm âm "cơ", chỉ bật luồng khí gió khô giòn từ sâu trong cuống họng.',
    },
    g: {
        symbol: 'g',
        name: 'Phụ âm vòm mềm bật hữu thanh /g/',
        category: 'plosive',
        voicing: 'voiced',
        lips: 'Môi mở tự nhiên.',
        tongue: 'Cuống lưỡi chạm vòm mềm chặn hơi rồi bật êm ra ngoài.',
        airflow:
            'Hữu thanh: Dây thanh quản rung mạnh từ sâu trong cổ họng khi mở cuống lưỡi.',
        actionCue:
            'Đặt tay lên yết hầu để cảm nhận độ rung giật nhẹ khi bật âm.',
    },

    // === PHỤ ÂM XÁT (FRICATIVES) ===
    f: {
        symbol: 'f',
        name: 'Phụ âm môi răng xát vô thanh /f/',
        category: 'fricative',
        voicing: 'voiceless',
        lips: 'Răng cửa hàm trên chạm nhẹ vào phần ướt bên trong môi dưới.',
        tongue: 'Lưỡi đặt tự nhiên.',
        airflow:
            'Vô thanh: Đẩy luồng hơi gió xát êm liên tục qua kẽ răng và môi dưới.',
        actionCue:
            'Không cắn chặt môi dưới, chỉ chạm hờ và thổi luồng gió xát đều đặn.',
    },
    v: {
        symbol: 'v',
        name: 'Phụ âm môi răng xát hữu thanh /v/',
        category: 'fricative',
        voicing: 'voiced',
        lips: 'Răng cửa hàm trên chạm nhẹ vào lòng môi dưới giống /f/.',
        tongue: 'Lưỡi đặt tự nhiên.',
        airflow:
            'Hữu thanh: Rung mạnh dây thanh quản kết hợp luồng hơi làm rung bờ môi dưới.',
        actionCue: 'Cảm nhận bờ môi dưới tê rần rần vì độ rung của âm thanh.',
    },
    θ: {
        symbol: 'θ',
        name: 'Phụ âm răng xát vô thanh /θ/ (TH thổi)',
        category: 'fricative',
        voicing: 'voiceless',
        lips: 'Hai môi mở hở tự nhiên để lộ răng cửa.',
        tongue: 'Kẹp nhẹ đầu lưỡi phẳng giữa hai hàm răng cửa trên và dưới (lưỡi hơi thè ra ngoài).',
        airflow:
            'Vô thanh: Thổi luồng hơi gió êm qua khe giữa răng cửa trên và đầu lưỡi.',
        actionCue:
            'KHÔNG cắn chặt hay thụt lưỡi vào trong (sẽ thành /s/ hoặc /t/). Thổi gió mát qua đầu lưỡi.',
    },
    ð: {
        symbol: 'ð',
        name: 'Phụ âm răng xát hữu thanh /ð/ (TH rung)',
        category: 'fricative',
        voicing: 'voiced',
        lips: 'Môi mở tự nhiên để lộ răng.',
        tongue: 'Đặt đầu lưỡi kẹp nhẹ giữa hai hàm răng giống /θ/.',
        airflow:
            'Hữu thanh: Rung mạnh dây thanh quản, tạo cảm giác tê rung mạnh ở đầu lưỡi khi hơi thoát.',
        actionCue:
            'Đặt ngón tay lên cổ họng và cảm nhận độ rung tê rõ rệt ở ngay đầu lưỡi.',
    },
    s: {
        symbol: 's',
        name: 'Phụ âm chân răng xát vô thanh /s/',
        category: 'fricative',
        voicing: 'voiceless',
        lips: 'Khóe miệng kéo nhẹ sang hai bên như cười mỉm, hai hàm răng gần khép sát.',
        tongue: 'Đầu lưỡi đặt rất sát sau chân răng cửa trên (không chạm vào răng).',
        airflow:
            'Vô thanh: Ép luồng hơi xì qua khe hẹp tạo tiếng xì sắc bén như tiếng rắn rít.',
        actionCue:
            'Cổ họng hoàn toàn đứng yên, chỉ có luồng gió xì sắc qua kẽ răng cửa.',
    },
    z: {
        symbol: 'z',
        name: 'Phụ âm chân răng xát hữu thanh /z/',
        category: 'fricative',
        voicing: 'voiced',
        lips: 'Khẩu hình giống hệt /s/, khóe miệng hơi kéo nhẹ.',
        tongue: 'Đầu lưỡi đặt sát sau chân răng trên.',
        airflow:
            'Hữu thanh: Rung mạnh dây thanh quản tạo tiếng vo ve như tiếng ong bay "zzz".',
        actionCue:
            'Đặt ngón tay lên cổ họng, cảm nhận độ rung rè rè liên tục khi xì hơi.',
    },
    ʃ: {
        symbol: 'ʃ',
        name: 'Phụ âm sau chân răng xát vô thanh /ʃ/ (sh)',
        category: 'fricative',
        voicing: 'voiceless',
        lips: 'Chu tròn môi và đẩy vươn nhẹ về phía trước như ra hiệu "suỵt".',
        tongue: 'Thân lưỡi nâng cao uốn cong về phía vòm họng.',
        airflow: 'Vô thanh: Đẩy luồng hơi gió xát dày và êm qua vòm họng.',
        actionCue:
            'Môi bắt buộc phải chu tròn về phía trước như khi ra hiệu giữ trật tự ("Shhh!").',
    },
    ʒ: {
        symbol: 'ʒ',
        name: 'Phụ âm sau chân răng xát hữu thanh /ʒ/',
        category: 'fricative',
        voicing: 'voiced',
        lips: 'Chu tròn môi về phía trước tương tự /ʃ/.',
        tongue: 'Thân lưỡi nâng cao về phía vòm họng.',
        airflow:
            'Hữu thanh: Rung mạnh dây thanh quản kết hợp luồng xát dày (như trong vision, measure).',
        actionCue: 'Giữ khẩu hình chu môi của /ʃ/ nhưng rung to cổ họng.',
    },
    h: {
        symbol: 'h',
        name: 'Phụ âm thanh môn vô thanh /h/',
        category: 'fricative',
        voicing: 'voiceless',
        lips: 'Miệng mở tự nhiên theo nguyên âm đi liền sau.',
        tongue: 'Lưỡi đặt tự nhiên.',
        airflow:
            'Vô thanh: Thở nhẹ một luồng hơi từ cuống họng ra ngoài như tiếng thở phào nhẹ nhõm.',
        actionCue:
            'Đẩy một luồng hơi ấm từ sâu trong họng như khi hà hơi làm mờ mặt kính.',
    },

    // === PHỤ ÂM TẮC XÁT (AFFRICATES) ===
    tʃ: {
        symbol: 'tʃ',
        name: 'Phụ âm tắc xát vô thanh /tʃ/ (ch)',
        category: 'affricate',
        voicing: 'voiceless',
        lips: 'Chu tròn môi về phía trước.',
        tongue: 'Đầu lưỡi chạm chân răng trên chặn hơi 1 tích tắc rồi bật bung xát ra luồng gió mạnh.',
        airflow:
            'Vô thanh: Là sự kết hợp giữa chặn hơi của /t/ và bật xát của /ʃ/, luồng gió mạnh mẽ.',
        actionCue:
            'Dứt khoát không uốn lưỡi sâu như "tr" tiếng Việt; bật mạnh luồng hơi với môi chu tròn.',
    },
    dʒ: {
        symbol: 'dʒ',
        name: 'Phụ âm tắc xát hữu thanh /dʒ/ (j)',
        category: 'affricate',
        voicing: 'voiced',
        lips: 'Chu môi tròn tương tự /tʃ/.',
        tongue: 'Đầu lưỡi chạm chân răng trên nén hơi rồi bật rung ra ngoài.',
        airflow:
            'Hữu thanh: Rung mạnh dây thanh quản khi bật âm (như trong judge, joy, change).',
        actionCue: 'Chặn hơi bằng đầu lưỡi rồi bật rung giật mạnh thanh quản.',
    },

    // === PHỤ ÂM MŨI (NASALS) ===
    m: {
        symbol: 'm',
        name: 'Phụ âm mũi môi /m/',
        category: 'nasal',
        voicing: 'voiced',
        lips: 'Ngậm chặt kín hai môi hoàn toàn.',
        tongue: 'Lưỡi đặt tự nhiên.',
        airflow:
            'Toàn bộ luồng hơi thoát qua đường mũi, dây thanh quản rung đều.',
        actionCue:
            'Giữ hai môi khép kín cho đến khi âm thanh thoát hết qua mũi.',
    },
    n: {
        symbol: 'n',
        name: 'Phụ âm mũi chân răng /n/',
        category: 'nasal',
        voicing: 'voiced',
        lips: 'Môi mở tự nhiên.',
        tongue: 'Đầu lưỡi áp chặt vào chân răng trên ngăn hơi trong miệng.',
        airflow: 'Luồng hơi thoát hoàn toàn qua mũi, dây thanh rung.',
        actionCue:
            'Áp chặt đầu lưỡi vào chân răng trên để hơi không lọt qua khoang miệng.',
    },
    ŋ: {
        symbol: 'ŋ',
        name: 'Phụ âm mũi vòm mềm /ŋ/ (ng)',
        category: 'nasal',
        voicing: 'voiced',
        lips: 'Miệng mở tự nhiên.',
        tongue: 'Cuống lưỡi nâng áp chặt vào vòm mềm ngắt hơi ở họng, đầu lưỡi nằm dưới sàn miệng.',
        airflow:
            'Hơi thoát qua mũi. Không bật thêm âm /g/ ở đuôi từ (sing, king).',
        actionCue:
            'Giữ cuống lưỡi dính vào vòm mềm để âm ngắt êm qua mũi, không giật thêm tiếng "g".',
    },

    // === BÁN NGUYÊN ÂM & ÂM CẠNH (APPROXIMANTS) ===
    l: {
        symbol: 'l',
        name: 'Âm cạnh lưỡi /l/',
        category: 'approximant',
        voicing: 'voiced',
        lips: 'Môi mở tự nhiên.',
        tongue: 'Đầu từ: Đầu lưỡi chạm chân răng trên, hơi thoát hai bên lưỡi. Cuối từ (Dark L): Nâng cuống lưỡi lên vòm mềm tạo âm "ồ" trầm.',
        airflow: 'Hữu thanh, luồng hơi thoát ra hai bên cạnh của lưỡi.',
        actionCue:
            'Ở đuôi từ (table, beautiful): nâng cuống lưỡi tạo tiếng "ồ" trầm sâu, đừng bỏ quên âm này.',
    },
    r: {
        symbol: 'r',
        name: 'Âm tiếp cận /r/',
        category: 'approximant',
        voicing: 'voiced',
        lips: 'Môi hơi chu tròn nhẹ về phía trước.',
        tongue: 'Đầu lưỡi cong ngược về sau khoang miệng nhưng KHÔNG chạm vào bất kỳ đâu trên vòm họng.',
        airflow: 'Hữu thanh, âm phát ra trầm sâu từ khoang miệng.',
        actionCue:
            'Tránh rung lưỡi kiểu tiếng Việt; giữ đầu lưỡi lơ lửng không chạm vòm miệng.',
    },
    w: {
        symbol: 'w',
        name: 'Bán nguyên âm môi vòm mềm /w/',
        category: 'approximant',
        voicing: 'voiced',
        lips: 'Chu tròn môi nhỏ như chuẩn bị huýt sáo rồi mở nhanh sang nguyên âm kế tiếp.',
        tongue: 'Cuống lưỡi nâng cao về vòm mềm.',
        airflow: 'Hữu thanh, dây thanh quản rung kết hợp mở bung môi.',
        actionCue:
            'Không để răng chạm môi dưới (tránh nhầm với /v/). Chu tròn môi và mở nhanh.',
    },
    j: {
        symbol: 'j',
        name: 'Bán nguyên âm vòm /j/',
        category: 'approximant',
        voicing: 'voiced',
        lips: 'Mở nhẹ sang hai bên.',
        tongue: 'Thân lưỡi nâng cao gần ngạc cứng như chuẩn bị đọc âm "i", lướt nhanh sang âm kế tiếp.',
        airflow: 'Hữu thanh, lướt êm và nhanh.',
        actionCue:
            'Lướt nhanh như âm "d/gi" miền Nam nhưng êm và nhẹ hơn (như trong yes, you).',
    },
}

// Chuẩn hóa ký tự IPA: loại bỏ dấu trọng âm, độ dài, khoảng trắng
function cleanIpa(sym?: string | null): string {
    if (!sym) return ''
    return sym.replace(/[/ˈˌ.ː\s]/g, '').trim()
}

// Từ điển chuyên biệt cho các cặp lỗi kinh điển (High-touch Articulatory Advice)
const PAIR_SPECIFIC_ADVICE: Record<string, string> = {
    // 1. Nhóm TH thổi /θ/
    'θ->s': `⚠️ Nguyên nhân lệch: Lưỡi chưa đưa ra ngoài răng! Bạn đã thụt đầu lưỡi vào trong và khép răng lại tạo thành tiếng xì /s/.
👄 Khẩu hình chuẩn: Kẹp nhẹ đầu lưỡi phẳng giữa hai hàm răng cửa trên và dưới.
💨 Luồng hơi: Thổi luồng hơi gió êm lướt qua bề mặt đầu lưỡi, KHÔNG cắn chặt răng.
💡 Mẹo sửa nhanh: Nhìn gương và đảm bảo bạn nhìn thấy khoảng 1cm đầu lưỡi thò ra giữa hai hàm răng khi phát âm.`,

    'θ->t': `⚠️ Nguyên nhân lệch: Bạn đã chặn đứng luồng hơi thành âm tắc bật /t/. Âm /θ/ là âm xát, luồng hơi phải thoát ra liên tục!
👄 Khẩu hình chuẩn: Đưa đầu lưỡi ra kẹp giữa hai hàm răng thay vì ấn vào chân răng trên.
💨 Luồng hơi: Để luồng hơi thoát ra êm đềm liên tục, không ngắt hơi giật cục.
💡 Mẹo sửa nhanh: Hãy thổi nhẹ như đang làm nguội một thìa súp nóng trong khi đầu lưỡi đặt giữa răng.`,

    'θ->f': `⚠️ Nguyên nhân lệch: Bạn đang dùng răng cửa trên cắn môi dưới tạo thành âm /f/.
👄 Khẩu hình chuẩn: Nhấc môi dưới ra xa hoàn toàn; chỉ dùng đầu lưỡi kẹp giữa hai hàng răng.
💡 Mẹo sửa nhanh: Dùng một ngón tay giữ nhẹ môi dưới lại để ngăn môi dưới chạm vào răng trên.`,

    // 2. Nhóm TH rung /ð/
    'ð->d': `⚠️ Nguyên nhân lệch: Đầu lưỡi bị thụt vào trong chạm chân răng trên tạo âm /d/.
👄 Khẩu hình chuẩn: Đưa đầu lưỡi ra ngoài kẹp nhẹ giữa hai hàm răng.
💨 Luồng hơi & Dây thanh: Rung mạnh dây thanh quản kết hợp đẩy hơi qua đầu lưỡi.
💡 Mẹo sửa nhanh: Cảm nhận độ rung tê rần rần ngay trên đầu lưỡi khi phát âm this, that, there.`,

    'ð->z': `⚠️ Nguyên nhân lệch: Bạn đang khép hai hàm răng lại tạo tiếng ong kêu /z/.
👄 Khẩu hình chuẩn: Mở hé hai hàm răng và đưa đầu lưỡi ra giữa hai răng.
💡 Mẹo sửa nhanh: Không cắn chặt răng; đầu lưỡi phải lộ ra ngoài để cảm nhận luồng hơi rung.`,

    'ð->v': `⚠️ Nguyên nhân lệch: Bạn đã cắn răng trên vào môi dưới tạo âm /v/.
👄 Khẩu hình chuẩn: Thả lỏng môi dưới, đưa đầu lưỡi kẹp nhẹ giữa hai hàm răng.`,

    // 3. Nhóm Sh /ʃ/ vs S /s/
    'ʃ->s': `⚠️ Nguyên nhân lệch: Khẩu hình chưa đủ độ chu! Mép bạn đang kéo sang hai bên tạo tiếng xì sắc /s/.
👄 Khẩu hình chuẩn: Chu tròn môi và đẩy vươn nhẹ về phía trước như đang ra hiệu "suỵt". Thân lưỡi nâng cao về phía vòm họng.
💨 Luồng hơi: Luồng hơi xát dày, êm và ấm thoát qua vòm miệng.
💡 Mẹo sửa nhanh: Chu môi tròn như chuẩn bị hôn và phát ra âm "Shhh" giữ trật tự.`,

    's->ʃ': `⚠️ Nguyên nhân lệch: Bạn đang chu môi quá nhiều khiến âm /s/ bị dày thành /ʃ/.
👄 Khẩu hình chuẩn: Kéo nhẹ hai khóe miệng sang hai bên như đang cười mỉm.
💨 Luồng hơi: Ép luồng hơi xì qua khe hẹp giữa đầu lưỡi và chân răng cửa trên.
💡 Mẹo sửa nhanh: Giữ một nụ cười mỉm sắc bén khi phát âm /s/.`,

    'ʃ->tʃ': `⚠️ Nguyên nhân lệch: Bạn đã bật tắc âm như /tʃ/. Âm /ʃ/ là âm xát trôi chảy liên tục, không được ngắt hơi trước khi phát ra.
👄 Khẩu hình chuẩn: Duy trì luồng hơi gió êm liên tục, không nén hơi ở chân răng.`,

    // 4. Nhóm Ch /tʃ/ vs J /dʒ/
    'tʃ->ʃ': `⚠️ Nguyên nhân lệch: Thiếu động tác nén và bật tắc hơi.
👄 Khẩu hình chuẩn: Nâng đầu lưỡi chạm chặt chân răng trên để nén hơi trong một tích tắc, sau đó mới bật bung xát ra ngoài với hình môi chu tròn.
💡 Mẹo sửa nhanh: Kết hợp giữa âm /t/ (chặn hơi) và âm /ʃ/ (chu môi bật gió).`,

    'tʃ->tr': `⚠️ Nguyên nhân lệch: Tránh phát âm giống âm "tr" uốn lưỡi của tiếng Việt!
👄 Khẩu hình chuẩn: Đầu lưỡi đặt ở chân răng trên, không uốn cong sâu vào vòm họng. Môi chu tròn và bật mạnh luồng gió dứt khoát.`,

    'dʒ->z': `⚠️ Nguyên nhân lệch: Âm /dʒ/ là âm tắc xát, cần có động tác chặn hơi bằng lưỡi trước khi bật rung, không được xì hơi đơn thuần như âm /z/.
👄 Khẩu hình chuẩn: Chặn đầu lưỡi ở chân răng trên rồi bật mạnh rung thanh quản với hình môi chu.`,

    'dʒ->tʃ': `⚠️ Nguyên nhân lệch: Âm /dʒ/ là âm hữu thanh! Bạn đã tắt độ rung thanh quản biến thành âm vô thanh /tʃ/.
💨 Dây thanh quản: Phải rung thật mạnh cổ họng khi bật âm.
💡 Mẹo sửa nhanh: Đặt ngón tay lên họng và cảm nhận độ rung giật mạnh khi phát âm.`,

    'dʒ->j': `⚠️ Nguyên nhân lệch: Bạn đã lướt âm thành bán nguyên âm mềm /j/ (như "de" hay "ye").
👄 Khẩu hình chuẩn: Cần dùng đầu lưỡi chặn đứng luồng hơi lại trước khi bật tung rung giật ra.`,

    // 5. Nhóm V /v/ vs B /b/ vs W /w/
    'v->b': `⚠️ Nguyên nhân lệch: Bạn đã ngậm chặt cả hai môi lại!
👄 Khẩu hình chuẩn: Răng cửa hàm trên PHẢI chạm nhẹ vào phần ướt bên trong môi dưới.
💨 Luồng hơi: Thổi hơi đồng thời rung mạnh dây thanh quản.
💡 Mẹo sửa nhanh: Nhìn gương và thấy rõ răng cửa trên đang tựa nhẹ lên môi dưới.`,

    'v->w': `⚠️ Nguyên nhân lệch: Bạn đang chu tròn hai môi thành âm /w/.
👄 Khẩu hình chuẩn: Không chu môi tròn; hãy đặt răng cửa hàm trên chạm nhẹ vào môi dưới để tạo độ xát rung cho /v/.`,

    'w->v': `⚠️ Nguyên nhân lệch: Răng bạn đang chạm vào môi dưới!
👄 Khẩu hình chuẩn: Tách răng ra hoàn toàn khỏi môi. Chu tròn môi nhỏ như huýt sáo rồi mở nhanh sang nguyên âm sau.`,

    // 6. Nhóm P /p/ vs B /b/
    'p->b': `⚠️ Nguyên nhân lệch: Bạn đã làm rung dây thanh quản! Âm /p/ là âm vô thanh.
👄 Khẩu hình chuẩn: Ngậm chặt hai môi nén hơi lại.
💨 Luồng hơi: Bật tung luồng gió cực mạnh, cổ họng hoàn toàn đứng yên.
💡 Mẹo sửa nhanh: Đặt một mảnh giấy trước miệng; khi bật /p/ giấy phải bay phần phật mà họng không rung.`,

    'b->p': `⚠️ Nguyên nhân lệch: Âm /b/ là âm hữu thanh, cần rung mạnh dây thanh quản ngay khi hai môi tách ra.`,

    // 7. Nhóm T /t/ vs D /d/
    't->d': `⚠️ Nguyên nhân lệch: Bạn đã rung thanh quản biến thành /d/. Âm /t/ là âm vô thanh bật luồng gió sắc bén.
👄 Khẩu hình chuẩn: Đầu lưỡi áp chân răng trên, bật dứt khoát luồng gió khô giòn, họng không rung.`,

    'd->t': `⚠️ Nguyên nhân lệch: Bạn thiếu độ rung thanh quản của âm hữu thanh /d/. Cần rung cổ họng rõ rệt khi đầu lưỡi rời chân răng.`,

    // 8. Nhóm K /k/ vs G /g/
    'k->g': `⚠️ Nguyên nhân lệch: Âm /k/ là âm vô thanh. Bạn đã làm rung cuống họng thành /g/.
💨 Luồng hơi: Chỉ bật luồng khí gió "kh" khô giòn từ cuống lưỡi, không rung thanh quản.`,

    'g->k': `⚠️ Nguyên nhân lệch: Âm /g/ cần rung mạnh dây thanh quản từ sâu trong cổ họng khi cuống lưỡi tách khỏi vòm mềm.`,

    // 9. Nhóm Nguyên âm i dài /iː/ vs i ngắn /ɪ/
    'iː->ɪ': `⚠️ Nguyên nhân lệch: Bạn phát âm quá ngắn và cơ môi thả lỏng.
👄 Khẩu hình chuẩn: Kéo khóe miệng thật căng sang hai bên như đang cười tươi hết cỡ.
💨 Luồng hơi: Giữ âm ngân dài và chắc trong ít nhất 1.5 giây.
💡 Mẹo sửa nhanh: Giữ nguyên nụ cười tươi khi phát âm sheep, eat, feel.`,

    'ɪ->iː': `⚠️ Nguyên nhân lệch: Bạn kéo dài âm quá mức và cơ môi quá căng.
👄 Khẩu hình chuẩn: Thả lỏng toàn bộ cơ mặt, hạ hàm dưới xuống nhẹ 1cm.
💨 Luồng hơi: Phát âm cực nhanh và dứt khoát, âm sắc nửa "i" nửa "ê" (ship, sit, fit).`,

    // 10. Nhóm Nguyên âm e /e/ vs a bẹt /æ/
    'æ->e': `⚠️ Nguyên nhân lệch: Khẩu hình chưa đủ rộng!
👄 Khẩu hình chuẩn: Hạ hàm dưới xuống thật sâu hết cỡ đồng thời kéo rộng khóe miệng sang hai bên.
💨 Luồng hơi: Âm vang to, mở rộng đặc trưng từ đáy họng (cat, bad, map).
💡 Mẹo sửa nhanh: Mở to miệng như đang cắn một quả táo lớn.`,

    'e->æ': `⚠️ Nguyên nhân lệch: Miệng mở quá to. Âm /e/ (bed, pen, head) chỉ mở miệng vừa phải, lưỡi nâng ở mức trung bình, phát âm dứt khoát.`,

    // 11. Nhóm Nguyên âm u ngắn /ʊ/ vs u dài /uː/
    'uː->ʊ': `⚠️ Nguyên nhân lệch: Khẩu hình môi chưa đủ độ chu và căng.
👄 Khẩu hình chuẩn: Chu môi tròn nhỏ và căng vươn về phía trước, giữ âm ngân dài và sâu (cool, shoot, blue).`,

    'ʊ->uː': `⚠️ Nguyên nhân lệch: Môi chu quá căng và kéo quá dài.
👄 Khẩu hình chuẩn: Thả lỏng cơ môi, chỉ hơi tròn nhẹ và giật âm ngắn gọn (book, put, look).`,

    // 12. Nhóm Nguyên âm á ngắn /ʌ/ vs a dài /ɑː/
    'ʌ->ɑː': `⚠️ Nguyên nhân lệch: Bạn đã hạ hàm quá sâu hoặc kéo dài âm.
👄 Khẩu hình chuẩn: Miệng chỉ mở hờ tự nhiên ở trạng thái nghỉ, lưỡi đặt phẳng ở giữa khoang miệng.
💨 Luồng hơi: Bật âm thật nhanh, dứt khoát như tiếng "á" giật mình (cup, bus, cut).`,

    'ɑː->ʌ': `⚠️ Nguyên nhân lệch: Miệng chưa mở đủ sâu.
👄 Khẩu hình chuẩn: Mở rộng miệng theo chiều dọc, hạ hàm dưới xuống thật sâu, âm phát ra trầm sâu từ cuống họng (car, park, father).`,

    // 13. Nhóm Phụ âm cuối và âm đuôi đặc thù
    'l->w': `⚠️ Nguyên nhân lệch: Bạn đã chu tròn môi tạo thành /w/ thay vì âm Dark L!
👄 Khẩu hình chuẩn: Đầu lưỡi nâng chạm chân răng trên, cuống lưỡi nâng cao về phía vòm mềm tạo âm "ồ" trầm sâu trong vòm họng.`,

    'r->z': `⚠️ Nguyên nhân lệch: Bạn đang dùng răng tạo âm xát /z/ (lỗi phát âm vùng miền).
👄 Khẩu hình chuẩn: Cong đầu lưỡi ngược về sau khoang miệng nhưng KHÔNG chạm vào bất kỳ đâu trên vòm họng.`,

    'ŋ->g': `⚠️ Nguyên nhân lệch: Tránh bật tiếng "g" ở cuối từ!
👄 Khẩu hình chuẩn: Giữ cuống lưỡi áp chặt vào vòm mềm để toàn bộ luồng hơi ngắt êm qua đường mũi (sing, king, ring).`,

    'ŋ->n': `⚠️ Nguyên nhân lệch: Bạn đã đưa đầu lưỡi chạm chân răng trên tạo âm /n/.
👄 Khẩu hình chuẩn: Đầu lưỡi nằm dưới sàn miệng, chỉ nâng cuống lưỡi lên vòm mềm phía sau.`,

    's->z': `⚠️ Nguyên nhân lệch: Bạn đã làm rung dây thanh quản thành /z/. Âm /s/ là âm vô thanh: chỉ xì luồng gió qua kẽ răng cửa, cổ họng hoàn toàn không rung.`,

    'z->s': `⚠️ Nguyên nhân lệch: Bạn đã tắt mất độ rung thanh quản. Hãy đặt tay lên cổ họng và đảm bảo dây thanh rung rè rè liên tục như tiếng ong bay.`,
}

// Lời khuyên chuyên biệt cho Deletion (bị nuốt âm / bỏ sót âm đuôi)
const DELETION_ADVICE: Record<string, string> = {
    s: `⚠️ Bạn đã bỏ quên âm đuôi /s/!
Trong tiếng Anh và bài thi IELTS, âm /s/ ở cuối từ cực kỳ quan trọng vì quyết định số nhiều, thì hiện tại ngôi thứ 3, và sở hữu cách.
👄 Khẩu hình: Khép nhẹ răng cửa, kéo nhẹ khóe miệng và xì một luồng hơi gió dứt khoát trước khi kết thúc từ.`,

    z: `⚠️ Bị nuốt âm đuôi /z/!
Rất nhiều từ tận cùng bằng "s" thực chất phát âm là /z/ (dogs, plays, is).
👄 Khẩu hình: Khép nhẹ răng cửa, đẩy luồng xì đồng thời rung mạnh dây thanh quản.`,

    t: `⚠️ Bị nuốt mất âm đuôi bật /t/!
Đây là lỗi phổ biến nhất khiến từ mất nghĩa hoặc nhầm lẫn thì quá khứ (-ed).
👄 Khẩu hình: Đưa đầu lưỡi chạm chặt chân răng hàm trên chặn hơi và bật một tiếng gió sắc bén khô giòn để ngắt từ.`,

    d: `⚠️ Bị nuốt âm đuôi /d/!
Khác với âm /t/ vô thanh, đuôi /d/ cần chạm đầu lưỡi vào chân răng trên và rung nhẹ thanh quản khi bật âm.`,

    k: `⚠️ Nuốt mất âm bật /k/ ở cuối từ (như work, speak, think).
👄 Khẩu hình: Nâng cuống lưỡi chạm vòm mềm chặn hơi rồi bật bung một luồng gió "kh" dứt khoát không phát ra tiếng ơ.`,

    g: `⚠️ Nuốt mất âm đuôi /g/ (như big, bag, dog).
👄 Khẩu hình: Cuống lưỡi chạm vòm mềm chặn hơi và bật nhẹ có độ rung thanh quản sâu từ họng.`,

    l: `⚠️ Bị nuốt âm Dark L ở cuối từ (như comfortable, people, beautiful, call).
👄 Khẩu hình: Nâng đầu lưỡi chạm chân răng trên đồng thời nâng cuống lưỡi về vòm mềm tạo âm "ồ" trầm sâu trong cổ họng.`,

    θ: `⚠️ Bỏ quên âm thổi /θ/ ở đuôi từ (như mouth, bath, tooth, breath).
👄 Khẩu hình: Kẹp nhẹ đầu lưỡi phẳng giữa hai hàm răng và thở luồng gió êm qua khe răng trước khi ngắt tiếng.`,

    ð: `⚠️ Nuốt mất âm /ð/ (như clothe, breathe).
👄 Khẩu hình: Đưa đầu lưỡi ra giữa hai răng và rung dây thanh quản.`,
}

/**
 * Phân tích đối sánh động hai âm vị khi không có sẵn trong cơ sở dữ liệu cặp
 */
function generateDynamicArticulatoryAdvice(
    expectedKey: string,
    actualKey: string
): string {
    const expProfile = PHONEME_PROFILES[expectedKey]
    const actProfile = PHONEME_PROFILES[actualKey]

    // Nếu không có thông tin chi tiết của cả 2 âm
    if (!expProfile) {
        return `Bạn đã phát âm lệch sang âm /${actualKey}/ thay vì âm mong đợi /${expectedKey}/.\nHãy tra cứu khẩu hình chuẩn của âm /${expectedKey}/ và lắng nghe phát âm mẫu để đối chiếu lại vị trí tiếp xúc của lưỡi và khẩu hình môi.`
    }

    const lines: string[] = []

    // 1. Phân tích nguyên nhân lệch
    if (actProfile) {
        if (expProfile.voicing !== actProfile.voicing) {
            const expVoiceDesc =
                expProfile.voicing === 'voiceless'
                    ? 'âm vô thanh (chỉ thổi luồng gió, thanh quản không rung)'
                    : 'âm hữu thanh (cần rung mạnh dây thanh quản)'
            const actVoiceDesc =
                actProfile.voicing === 'voiceless' ? 'vô thanh' : 'hữu thanh'
            lines.push(
                `⚠️ Nguyên nhân lệch: Khác biệt cốt lõi ở thanh quản! Âm mong đợi /${expectedKey}/ là ${expVoiceDesc}, trong khi bạn đã phát âm thành /${actualKey}/ là âm ${actVoiceDesc}.`
            )
        } else if (expProfile.category !== actProfile.category) {
            lines.push(
                `⚠️ Nguyên nhân lệch: Phương thức cấu âm bị lệch! Bạn đã phát âm phương thức ${actProfile.name.toLowerCase()} thay vì ${expProfile.name.toLowerCase()}.`
            )
        } else {
            lines.push(
                `⚠️ Nguyên nhân lệch: Bạn đã đặt vị trí lưỡi hoặc điều chỉnh khẩu hình môi lệch từ /${expectedKey}/ sang /${actualKey}/.`
            )
        }
    } else {
        lines.push(
            `⚠️ Bạn đã phát âm lệch âm /${expectedKey}/ sang âm /${actualKey}/.`
        )
    }

    // 2. Hướng dẫn khẩu hình chi tiết của âm mong đợi
    lines.push(`👄 Khẩu hình chuẩn cho âm /${expectedKey}/:`)
    lines.push(`• Môi & Hàm: ${expProfile.lips}`)
    lines.push(`• Vị trí lưỡi: ${expProfile.tongue}`)
    lines.push(`• Luồng hơi & Dây thanh: ${expProfile.airflow}`)

    // 3. Mẹo cơ học tức thì
    if (expProfile.actionCue) {
        lines.push(`💡 Mẹo luyện tập: ${expProfile.actionCue}`)
    }

    return lines.join('\n')
}

/**
 * Trả về lời khuyên khẩu hình chuyên sâu dựa trên âm mong đợi và âm thực tế
 */
export function getDetailedArticulatoryAdvice(
    expected?: string | null,
    actual?: string | null,
    errorType?: string
): string {
    const rawExp = cleanIpa(expected)
    const rawAct = cleanIpa(actual)

    // Chuẩn hóa một số ký tự tương đương phổ biến trong IPA
    const normalize = (sym: string) => {
        if (sym === 'ɛ') return 'e'
        if (sym === 'i') return 'iː'
        if (sym === 'u') return 'uː'
        if (sym === 'dʒ' || sym === 'tʃ') return sym
        return sym
    }

    const exp = normalize(rawExp)
    const act = normalize(rawAct)

    // 1. Trường hợp âm đúng
    if (errorType === 'correct' || (!errorType && exp === act)) {
        const prof = PHONEME_PROFILES[exp]
        return `✅ Tuyệt vời! Bạn đã phát âm âm /${exp}/ rất chuẩn xác.\n${prof ? `Khẩu hình môi (${prof.lips}) và vị trí đặt lưỡi đã hoàn toàn đạt chuẩn bản xứ.` : 'Khẩu hình môi và vị trí đặt lưỡi đã hoàn toàn đạt chuẩn.'}`
    }

    // 2. Trường hợp nuốt âm (Deletion)
    if (errorType === 'deletion' || !act) {
        if (DELETION_ADVICE[exp]) {
            return DELETION_ADVICE[exp]
        }
        const prof = PHONEME_PROFILES[exp]
        if (prof) {
            return `⚠️ Bạn đã bỏ sót hoặc nuốt mất âm /${exp}/ (${prof.name}).\nTrong tiếng Anh, việc nuốt phụ âm đuôi hoặc phụ âm giữa từ sẽ làm thay đổi hoàn toàn nghĩa của từ.\n👄 Khẩu hình khắc phục:\n• Lưỡi: ${prof.tongue}\n• Luồng hơi: ${prof.airflow}\n💡 Mẹo: ${prof.actionCue}`
        }
        return `⚠️ Bạn đã nuốt mất âm /${exp}/. Hãy chú ý mở khẩu hình và phát âm đầy đủ âm này trước khi chuyển sang âm kế tiếp.`
    }

    // 3. Trường hợp lệch âm có trong cơ sở dữ liệu đối sánh trực tiếp
    const pairKey = `${exp}->${act}`
    if (PAIR_SPECIFIC_ADVICE[pairKey]) {
        return PAIR_SPECIFIC_ADVICE[pairKey]
    }

    // Kiểm tra thêm key thô
    const rawPairKey = `${rawExp}->${rawAct}`
    if (PAIR_SPECIFIC_ADVICE[rawPairKey]) {
        return PAIR_SPECIFIC_ADVICE[rawPairKey]
    }

    // 4. Trường hợp thừa âm (Insertion)
    if (errorType === 'insertion' || !exp) {
        if (act === 's') {
            return `⚠️ Bạn đã thêm âm /s/ thừa vào từ!\nĐây là thói quen rất phổ biến của người Việt (hay xì âm /s/ vô thức ở giữa hoặc cuối từ). Hãy giữ miệng thả lỏng và ngắt âm dứt khoát theo phiên âm chuẩn.`
        }
        if (act === 'ə') {
            return `⚠️ Bạn đã chèn thêm âm Schwa /ə/ thừa!\nTránh chèn nguyên âm đệm vào giữa các cụm phụ âm liên tiếp (như /st/, /pl/, /br/). Hãy lướt nhanh từ phụ âm này sang phụ âm kế tiếp mà không phát ra tiếng "ơ".`
        }
        return `⚠️ Bạn đã chèn thêm âm thừa /${act}/ không có trong từ. Hãy lắng nghe lại phát âm mẫu và ngắt âm dứt khoát.`
    }

    // 5. Trường hợp sai trọng âm (Stress Error)
    if (errorType === 'stress_error') {
        return `⚠️ Sai trọng âm tại âm /${exp}/!\nTrong thang điểm IELTS Pronunciation, trọng âm từ quyết định trực tiếp khả năng nhận diện từ của giám khảo.\n💡 Cách sửa: Nhấn giọng cao hơn (pitch), phát âm dài hơn (duration) và âm lượng to hơn (volume) vào âm tiết có dấu trọng âm (ˈ). Âm tiết không mang trọng âm hãy đọc thật nhanh và lướt nhẹ.`
    }

    // 6. Phân tích đối sánh giải phẫu học cơ thể động (Dynamic Articulatory Engine)
    return generateDynamicArticulatoryAdvice(exp, act)
}
