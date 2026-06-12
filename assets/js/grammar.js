const grammarTopics = [
  {
    id: "word-forms",
    level: "basic",
    category: "Từ loại",
    title: "Nhận diện từ loại",
    summary: "Danh từ, động từ, tính từ và trạng từ theo vị trí trong câu.",
    formula: "a/an/the + (adjective) + noun · be/seem/become + adjective · verb + adverb",
    usage: "Quan sát từ đứng trước và sau chỗ trống. Hậu tố thường gặp: -tion/-ment (danh từ), -ive/-al (tính từ), -ly (trạng từ), -ize/-fy (động từ).",
    signals: "Mạo từ cần danh từ; động từ nối cần tính từ; trạng từ thường bổ nghĩa động từ, tính từ hoặc cả mệnh đề.",
    trap: "Không chọn theo nghĩa trước khi xác định vị trí ngữ pháp. Friendly, costly và timely là tính từ dù có đuôi -ly.",
    example: "The marketing team presented an impressive proposal.",
    translation: "Đội tiếp thị đã trình bày một đề xuất ấn tượng."
  },
  {
    id: "nouns",
    level: "basic",
    category: "Danh từ",
    title: "Danh từ đếm được và không đếm được",
    summary: "Chọn lượng từ, mạo từ và dạng số nhiều chính xác.",
    formula: "a/an + singular count noun · many/few + plural noun · much/little + uncountable noun",
    usage: "Danh từ đếm được có dạng số ít/số nhiều. Information, equipment, furniture, advice và luggage thường không đếm được.",
    signals: "Each/every đi với danh từ số ít; several/various đi với số nhiều; a piece of dùng để định lượng danh từ không đếm được.",
    trap: "Không thêm -s vào informations, equipments hoặc advices.",
    example: "All equipment must be inspected before use.",
    translation: "Tất cả thiết bị phải được kiểm tra trước khi sử dụng."
  },
  {
    id: "articles",
    level: "basic",
    category: "Danh từ",
    title: "Mạo từ a, an và the",
    summary: "Xác định đối tượng chung, lần đầu nhắc đến hoặc đã xác định.",
    formula: "a/an + singular count noun · the + specific/unique noun · zero article + general plural/uncountable",
    usage: "Dùng a/an khi nhắc lần đầu hoặc nói một đối tượng bất kỳ; the khi người đọc biết rõ đối tượng hoặc đối tượng đã được nhắc.",
    signals: "The thường xuất hiện với so sánh nhất, số thứ tự và cụm được xác định bởi of/relative clause.",
    trap: "Chọn a/an theo âm đầu, không theo chữ cái: an hour nhưng a university.",
    example: "Please send the invoice to the address listed below.",
    translation: "Vui lòng gửi hóa đơn đến địa chỉ được liệt kê bên dưới."
  },
  {
    id: "pronouns",
    level: "basic",
    category: "Đại từ",
    title: "Đại từ và tính từ sở hữu",
    summary: "Phân biệt subject, object, possessive adjective và possessive pronoun.",
    formula: "I/me/my/mine · they/them/their/theirs · reflexive: myself, themselves",
    usage: "Đại từ chủ ngữ đứng trước động từ; tân ngữ đứng sau động từ/giới từ; tính từ sở hữu phải đi cùng danh từ.",
    signals: "By + reflexive có nghĩa tự mình; đại từ phải thống nhất với danh từ mà nó thay thế.",
    trap: "Sau between dùng tân ngữ: between you and me, không phải between you and I.",
    example: "Employees should submit their requests to the supervisor.",
    translation: "Nhân viên nên gửi yêu cầu của họ cho người giám sát."
  },
  {
    id: "subject-verb-agreement",
    level: "basic",
    category: "Động từ",
    title: "Sự hòa hợp chủ ngữ – động từ",
    summary: "Chia động từ theo chủ ngữ thật, không theo danh từ đứng gần.",
    formula: "singular subject + singular verb · plural subject + plural verb",
    usage: "Tìm danh từ trung tâm của chủ ngữ. Cụm giới từ, mệnh đề quan hệ và phần chen giữa không quyết định động từ chính.",
    signals: "Each, every, either, neither và everyone thường dùng động từ số ít; both, many và several dùng số nhiều.",
    trap: "The list of candidates is..., vì chủ ngữ là list chứ không phải candidates.",
    example: "Each of the applicants has completed the online form.",
    translation: "Mỗi ứng viên đều đã hoàn thành biểu mẫu trực tuyến."
  },
  {
    id: "present-simple",
    level: "basic",
    category: "Thì",
    title: "Hiện tại đơn",
    summary: "Sự thật, thói quen, lịch cố định và quy trình.",
    formula: "S + V(s/es) · S + do/does not + V · Do/Does + S + V?",
    usage: "Dùng cho hoạt động lặp lại, chính sách, quy trình và thời gian biểu chính thức.",
    signals: "Usually, often, every, regularly, on Mondays và các trạng từ tần suất.",
    trap: "Lịch trình tương lai cố định vẫn dùng hiện tại đơn: The train leaves at 8.",
    example: "The accounting department reviews expenses every Friday.",
    translation: "Phòng kế toán rà soát chi phí vào mỗi thứ Sáu."
  },
  {
    id: "past-simple",
    level: "basic",
    category: "Thì",
    title: "Quá khứ đơn",
    summary: "Hành động đã kết thúc tại một thời điểm xác định.",
    formula: "S + V2/ed · S + did not + V · Did + S + V?",
    usage: "Dùng cho sự kiện đã hoàn tất và không còn liên hệ trực tiếp với hiện tại.",
    signals: "Yesterday, last, ago, in 2025, when + past event.",
    trap: "Sau did/didn't phải dùng động từ nguyên mẫu.",
    example: "The company opened its new branch last September.",
    translation: "Công ty đã mở chi nhánh mới vào tháng Chín năm ngoái."
  },
  {
    id: "future-forms",
    level: "basic",
    category: "Thì",
    title: "Các cách diễn đạt tương lai",
    summary: "Will, be going to và hiện tại tiếp diễn cho kế hoạch.",
    formula: "will + V · be going to + V · be + V-ing + future time",
    usage: "Will cho quyết định tức thời/dự đoán; going to cho ý định hoặc bằng chứng; hiện tại tiếp diễn cho sắp xếp đã chốt.",
    signals: "Tomorrow, next, soon, by Friday; ngữ cảnh quyết định mức độ chắc chắn.",
    trap: "Trong mệnh đề thời gian sau when, as soon as, until dùng hiện tại đơn, không dùng will.",
    example: "We are meeting the supplier tomorrow afternoon.",
    translation: "Chúng tôi sẽ gặp nhà cung cấp vào chiều mai."
  },
  {
    id: "adjectives-adverbs",
    level: "basic",
    category: "Từ loại",
    title: "Tính từ và trạng từ",
    summary: "Bổ nghĩa đúng đối tượng và đúng vị trí.",
    formula: "adjective + noun · linking verb + adjective · action verb + adverb",
    usage: "Tính từ mô tả danh từ/chủ ngữ; trạng từ mô tả cách thức, mức độ hoặc tần suất.",
    signals: "Be, seem, remain, become, feel thường theo sau bởi tính từ.",
    trap: "Hard là chăm chỉ/mạnh; hardly là hầu như không. Late và lately cũng khác nghĩa.",
    example: "The technician quickly identified the faulty component.",
    translation: "Kỹ thuật viên đã nhanh chóng xác định linh kiện bị lỗi."
  },
  {
    id: "prepositions",
    level: "basic",
    category: "Giới từ",
    title: "Giới từ thời gian và địa điểm",
    summary: "At, on, in, by, until, during và within trong ngữ cảnh công việc.",
    formula: "at + time/point · on + day/date/surface · in + month/year/area · by + deadline",
    usage: "By là không muộn hơn; until là kéo dài đến; during + noun; while + clause; within là trong vòng một khoảng.",
    signals: "Mốc thời gian, thời hạn, địa chỉ, tầng, phòng và phương tiện.",
    trap: "By Friday không có nghĩa suốt đến thứ Sáu; nó đặt hạn chót.",
    example: "Applications must be received by noon on June 30.",
    translation: "Đơn đăng ký phải được nhận trước trưa ngày 30 tháng Sáu."
  },
  {
    id: "conjunctions",
    level: "basic",
    category: "Liên từ",
    title: "Liên từ cơ bản",
    summary: "Nối từ, cụm từ và mệnh đề có quan hệ rõ ràng.",
    formula: "and/but/or/so + clause · because/although/if/when + clause",
    usage: "Liên từ kết hợp nối thành phần ngang hàng; liên từ phụ thuộc mở đầu mệnh đề nguyên nhân, tương phản, điều kiện hoặc thời gian.",
    signals: "Kiểm tra sau chỗ trống là danh từ/cụm từ hay một mệnh đề đủ chủ ngữ và động từ.",
    trap: "Because + clause nhưng because of + noun phrase; although + clause nhưng despite + noun phrase.",
    example: "Although demand increased, production remained stable.",
    translation: "Mặc dù nhu cầu tăng, sản lượng vẫn ổn định."
  },
  {
    id: "comparisons",
    level: "basic",
    category: "So sánh",
    title: "So sánh hơn và so sánh nhất",
    summary: "So sánh hai hoặc nhiều đối tượng trong báo cáo và quảng cáo.",
    formula: "adj-er/more + adj + than · the adj-est/most + adj · as + adj + as",
    usage: "So sánh hơn cho hai nhóm; so sánh nhất cho từ ba đối tượng trở lên; as...as diễn đạt ngang bằng.",
    signals: "Than, of all, in the company, among và các con số so sánh.",
    trap: "Không dùng more easier hoặc the most fastest. Much/far có thể nhấn mạnh so sánh hơn.",
    example: "This model is more energy-efficient than the previous one.",
    translation: "Mẫu này tiết kiệm năng lượng hơn mẫu trước."
  },
  {
    id: "present-continuous",
    level: "intermediate",
    category: "Thì",
    title: "Hiện tại tiếp diễn",
    summary: "Hoạt động đang diễn ra, tình huống tạm thời và thay đổi.",
    formula: "S + am/is/are + V-ing",
    usage: "Dùng cho hành động quanh thời điểm nói, xu hướng đang thay đổi và kế hoạch cá nhân đã sắp xếp.",
    signals: "Now, currently, at present, this week, increasingly.",
    trap: "Động từ trạng thái như know, own, belong, need thường không dùng ở tiếp diễn.",
    example: "The hotel is currently renovating its conference rooms.",
    translation: "Khách sạn hiện đang cải tạo các phòng hội nghị."
  },
  {
    id: "present-perfect",
    level: "intermediate",
    category: "Thì",
    title: "Hiện tại hoàn thành",
    summary: "Kinh nghiệm, kết quả hiện tại và hành động kéo dài đến nay.",
    formula: "S + have/has + V3",
    usage: "Dùng khi thời điểm không xác định, kết quả còn liên quan hiện tại hoặc hành động bắt đầu trong quá khứ và chưa kết thúc.",
    signals: "Since, for, already, yet, recently, so far, over the past year.",
    trap: "Không dùng với thời điểm quá khứ đã kết thúc như yesterday hoặc last week.",
    example: "Sales have increased significantly since January.",
    translation: "Doanh số đã tăng đáng kể kể từ tháng Một."
  },
  {
    id: "past-continuous-perfect",
    level: "intermediate",
    category: "Thì",
    title: "Quá khứ tiếp diễn và quá khứ hoàn thành",
    summary: "Thiết lập bối cảnh và trật tự giữa các hành động quá khứ.",
    formula: "was/were + V-ing · had + V3",
    usage: "Quá khứ tiếp diễn mô tả hành động đang xảy ra; quá khứ hoàn thành chỉ hành động xảy ra trước một mốc quá khứ khác.",
    signals: "While/when cho bối cảnh; by the time/before/after cho thứ tự.",
    trap: "Chỉ dùng had + V3 khi cần làm rõ hành động nào xảy ra trước.",
    example: "The meeting had ended by the time Mr. Lee arrived.",
    translation: "Cuộc họp đã kết thúc trước khi ông Lee đến."
  },
  {
    id: "passive-voice",
    level: "intermediate",
    category: "Câu bị động",
    title: "Câu bị động",
    summary: "Nhấn mạnh hành động, kết quả hoặc đối tượng chịu tác động.",
    formula: "S + be (đúng thì) + V3 (+ by + agent)",
    usage: "Phổ biến trong thông báo, quy trình, quy định và báo cáo khi người thực hiện không quan trọng hoặc đã rõ.",
    signals: "Chủ ngữ là vật nhận hành động; by + người thực hiện; động từ be trước phân từ.",
    trap: "Chỉ ngoại động từ có tân ngữ mới chuyển sang bị động. Chọn đúng dạng be theo thì.",
    example: "All reservations will be confirmed by email.",
    translation: "Tất cả đặt chỗ sẽ được xác nhận qua email."
  },
  {
    id: "modal-verbs",
    level: "intermediate",
    category: "Động từ",
    title: "Động từ khuyết thiếu",
    summary: "Khả năng, nghĩa vụ, lời khuyên, cho phép và suy đoán.",
    formula: "modal + base verb · modal + be + V3",
    usage: "Can/could chỉ khả năng; may/might khả năng xảy ra; must/have to nghĩa vụ; should lời khuyên; will/would yêu cầu hoặc dự đoán.",
    signals: "Sau modal luôn là động từ nguyên mẫu không to, trừ ought to.",
    trap: "Mustn't là cấm; don't have to là không cần thiết. Hai nghĩa này không giống nhau.",
    example: "Visitors must wear identification badges at all times.",
    translation: "Khách tham quan phải luôn đeo thẻ nhận dạng."
  },
  {
    id: "gerunds-infinitives",
    level: "intermediate",
    category: "Động từ",
    title: "Danh động từ và động từ nguyên mẫu",
    summary: "V-ing hoặc to V sau các động từ, tính từ và giới từ.",
    formula: "enjoy/avoid/consider + V-ing · plan/decide/agree + to V · preposition + V-ing",
    usage: "Mỗi động từ có mẫu theo sau riêng. To V thường diễn đạt mục đích; V-ing sau giới từ hoặc đóng vai trò danh từ.",
    signals: "Look forward to, be responsible for, be interested in đều theo sau bởi V-ing.",
    trap: "To trong look forward to là giới từ, vì vậy dùng receiving chứ không dùng receive.",
    example: "We look forward to receiving your application.",
    translation: "Chúng tôi mong nhận được đơn ứng tuyển của bạn."
  },
  {
    id: "relative-clauses",
    level: "intermediate",
    category: "Mệnh đề",
    title: "Mệnh đề quan hệ",
    summary: "Bổ nghĩa danh từ bằng who, which, that, whose, where và when.",
    formula: "person + who/that · thing + which/that · noun + whose + noun · place + where",
    usage: "Mệnh đề xác định không có dấu phẩy; mệnh đề không xác định thêm thông tin và được ngăn bằng dấu phẩy.",
    signals: "Đứng ngay sau danh từ cần mô tả; kiểm tra vai trò còn thiếu trong mệnh đề.",
    trap: "Không dùng that trong mệnh đề không xác định sau dấu phẩy.",
    example: "The consultant who led the workshop will return next month.",
    translation: "Chuyên gia đã dẫn dắt hội thảo sẽ quay lại vào tháng tới."
  },
  {
    id: "quantifiers",
    level: "intermediate",
    category: "Danh từ",
    title: "Từ hạn định và lượng từ",
    summary: "Some, any, much, many, few, little, each, every và all.",
    formula: "many/few + plural count noun · much/little + uncountable noun · each/every + singular noun",
    usage: "A few/a little mang nghĩa tích cực là có một ít; few/little nhấn mạnh gần như không có.",
    signals: "Loại danh từ và sắc thái đủ/thiếu quyết định lựa chọn.",
    trap: "Every employee nhưng all employees; each of the employees + động từ số ít.",
    example: "Only a few seats are available for the afternoon session.",
    translation: "Chỉ còn một vài chỗ cho phiên buổi chiều."
  },
  {
    id: "conditionals-zero-first",
    level: "intermediate",
    category: "Câu điều kiện",
    title: "Điều kiện loại 0 và loại 1",
    summary: "Quy luật, quy trình và khả năng thực tế trong tương lai.",
    formula: "If + present, present · If + present, will/can/may + V",
    usage: "Loại 0 cho sự thật/quy trình; loại 1 cho điều kiện có khả năng xảy ra.",
    signals: "Unless = if...not; provided that, as long as và in case diễn đạt sắc thái điều kiện khác nhau.",
    trap: "Thông thường không dùng will trong mệnh đề if.",
    example: "If the shipment arrives today, we will dispatch the orders tomorrow.",
    translation: "Nếu lô hàng đến hôm nay, chúng tôi sẽ gửi đơn vào ngày mai."
  },
  {
    id: "reported-speech",
    level: "intermediate",
    category: "Mệnh đề",
    title: "Câu tường thuật",
    summary: "Thuật lại phát biểu, yêu cầu và câu hỏi.",
    formula: "said (that) + clause · told + object + clause · asked + object + to V",
    usage: "Khi động từ tường thuật ở quá khứ, thì và từ chỉ thời gian có thể lùi nếu thông tin không còn đúng ở hiện tại.",
    signals: "Say không cần tân ngữ trực tiếp; tell phải có người nhận.",
    trap: "Không dùng told that nếu thiếu tân ngữ: told us that...",
    example: "The manager told us that the deadline had been extended.",
    translation: "Quản lý nói với chúng tôi rằng hạn chót đã được gia hạn."
  },
  {
    id: "causatives",
    level: "intermediate",
    category: "Động từ",
    title: "Cấu trúc nhờ khiến",
    summary: "Have/get something done và make/let/help someone do.",
    formula: "have/get + object + V3 · make/let + object + V · help + object + (to) V",
    usage: "Have/get something done nói về thuê hoặc sắp xếp người khác thực hiện dịch vụ.",
    signals: "Chủ ngữ không trực tiếp thực hiện công việc: sửa máy, in tài liệu, giao hàng.",
    trap: "Make ở chủ động dùng V nguyên mẫu; ở bị động dùng be made to V.",
    example: "We had the air-conditioning system inspected yesterday.",
    translation: "Hôm qua chúng tôi đã cho kiểm tra hệ thống điều hòa."
  },
  {
    id: "participles",
    level: "intermediate",
    category: "Từ loại",
    title: "Hiện tại phân từ và quá khứ phân từ",
    summary: "Phân biệt tính chất gây cảm xúc và trạng thái cảm nhận.",
    formula: "V-ing adjective: causing · V-ed adjective: affected/feeling",
    usage: "Interesting mô tả thứ tạo ra sự hứng thú; interested mô tả người cảm thấy hứng thú. Phân từ cũng rút gọn mệnh đề.",
    signals: "Xác định danh từ chủ động gây tác động hay bị tác động.",
    trap: "Không mặc định người luôn dùng -ed; a demanding client dùng -ing vì khách hàng tạo ra yêu cầu.",
    example: "Customers were disappointed by the delayed delivery.",
    translation: "Khách hàng thất vọng vì việc giao hàng bị chậm."
  },
  {
    id: "adverb-clauses",
    level: "intermediate",
    category: "Mệnh đề",
    title: "Mệnh đề trạng ngữ",
    summary: "Thời gian, nguyên nhân, tương phản, mục đích và điều kiện.",
    formula: "conjunction + subject + verb · preposition + noun phrase",
    usage: "Because/since chỉ nguyên nhân; although/even though tương phản; so that mục đích; once/as soon as thời gian.",
    signals: "Chọn liên từ khi sau chỗ trống là mệnh đề; chọn giới từ khi sau là cụm danh từ.",
    trap: "Despite/in spite of không đi trực tiếp với mệnh đề trừ cấu trúc the fact that.",
    example: "The event continued despite the heavy rain.",
    translation: "Sự kiện vẫn tiếp tục bất chấp mưa lớn."
  },
  {
    id: "conditionals-advanced",
    level: "advanced",
    category: "Câu điều kiện",
    title: "Điều kiện loại 2, 3 và hỗn hợp",
    summary: "Tình huống giả định hiện tại, quá khứ và kết quả giao thoa.",
    formula: "If + past, would + V · If + had V3, would have V3 · If + had V3, would + V",
    usage: "Loại 2 nói điều không thật/khó xảy ra hiện tại; loại 3 tiếc nuối quá khứ; hỗn hợp nối nguyên nhân quá khứ với kết quả hiện tại.",
    signals: "Were có thể dùng cho mọi chủ ngữ trong giả định trang trọng.",
    trap: "Không đặt would trong mệnh đề if tiêu chuẩn.",
    example: "If we had received the permit earlier, the store would be open now.",
    translation: "Nếu đã nhận giấy phép sớm hơn, cửa hàng giờ đã mở cửa."
  },
  {
    id: "reduced-relative-clauses",
    level: "advanced",
    category: "Mệnh đề",
    title: "Rút gọn mệnh đề quan hệ",
    summary: "Dùng V-ing, V3 hoặc to V để cô đọng mô tả danh từ.",
    formula: "who/which + active verb → V-ing · who/which + be + V3 → V3 · the first/only + to V",
    usage: "V-ing khi danh từ chủ động thực hiện; V3 khi danh từ chịu tác động; to V sau số thứ tự, so sánh nhất hoặc mục đích.",
    signals: "Câu đã có động từ chính và chỗ trống bổ nghĩa danh từ.",
    trap: "Phân từ rút gọn phải có cùng chủ thể logic với danh từ nó bổ nghĩa.",
    example: "Products purchased online may be returned within 30 days.",
    translation: "Sản phẩm mua trực tuyến có thể được trả lại trong vòng 30 ngày."
  },
  {
    id: "inversion",
    level: "advanced",
    category: "Cấu trúc câu",
    title: "Đảo ngữ",
    summary: "Đảo trợ động từ sau trạng từ phủ định và trong điều kiện trang trọng.",
    formula: "Never/Rarely + auxiliary + S + V · Had/Should/Were + S..., main clause",
    usage: "Đảo ngữ tạo nhấn mạnh hoặc văn phong trang trọng trong thông báo, báo cáo và điều kiện.",
    signals: "Never, rarely, seldom, only after, not until, no sooner; lược bỏ if với had/should/were.",
    trap: "Only after the audit did the company identify the error: đảo ở mệnh đề chính, không phải mệnh đề after.",
    example: "Only after the inspection was completed did production resume.",
    translation: "Chỉ sau khi việc kiểm tra hoàn tất, sản xuất mới tiếp tục."
  },
  {
    id: "subjunctive",
    level: "advanced",
    category: "Mệnh đề",
    title: "Thức giả định",
    summary: "Đề nghị, yêu cầu và sự cần thiết trong văn phong trang trọng.",
    formula: "suggest/recommend/require that + S + base verb · It is essential that + S + base verb",
    usage: "Sau các động từ và tính từ thể hiện yêu cầu, động từ trong mệnh đề that giữ nguyên mẫu, kể cả chủ ngữ số ít.",
    signals: "Recommend, request, insist, demand, propose; essential, important, necessary.",
    trap: "Không thêm -s và không dùng to: recommend that he attend.",
    example: "The director requested that every department submit a revised budget.",
    translation: "Giám đốc yêu cầu mỗi phòng ban nộp ngân sách đã chỉnh sửa."
  },
  {
    id: "modal-perfect",
    level: "advanced",
    category: "Động từ",
    title: "Modal perfect",
    summary: "Suy đoán, phê bình và khả năng không xảy ra trong quá khứ.",
    formula: "modal + have + V3",
    usage: "Must have V3 suy đoán chắc; may/might have V3 khả năng; should have V3 việc đáng lẽ nên làm; could have V3 khả năng đã bỏ lỡ.",
    signals: "Ngữ cảnh nói về một kết quả quá khứ nhưng đánh giá được đưa ra ở hiện tại.",
    trap: "Should have done thường hàm ý việc đó đã không được làm.",
    example: "The package may have been delivered to the wrong office.",
    translation: "Gói hàng có thể đã được giao nhầm văn phòng."
  },
  {
    id: "future-perfect",
    level: "advanced",
    category: "Thì",
    title: "Tương lai hoàn thành",
    summary: "Hành động hoàn tất trước một thời điểm tương lai.",
    formula: "S + will have + V3",
    usage: "Dùng để dự báo tiến độ, mục tiêu và kết quả sẽ hoàn tất trước một hạn tương lai.",
    signals: "By, by the time, before + future point; for + duration tính đến tương lai.",
    trap: "Sau by the time dùng hiện tại đơn: By the time you arrive, we will have finished.",
    example: "By July, the team will have completed all safety checks.",
    translation: "Đến tháng Bảy, nhóm sẽ hoàn tất mọi kiểm tra an toàn."
  },
  {
    id: "advanced-passives",
    level: "advanced",
    category: "Câu bị động",
    title: "Bị động nâng cao",
    summary: "Bị động với reporting verbs, modal và hai tân ngữ.",
    formula: "It is believed that... · S is expected to V · modal + be + V3 · S was given + noun",
    usage: "Reporting passive tạo văn phong khách quan; bị động với hai tân ngữ có thể đưa người hoặc vật lên làm chủ ngữ.",
    signals: "Believe, expect, report, announce, consider và know trong báo cáo.",
    trap: "Sau is expected dùng to V; nếu hành động xảy ra trước dùng to have V3.",
    example: "The new policy is expected to reduce operating costs.",
    translation: "Chính sách mới được kỳ vọng sẽ giảm chi phí vận hành."
  },
  {
    id: "noun-clauses",
    level: "advanced",
    category: "Mệnh đề",
    title: "Mệnh đề danh từ",
    summary: "That, whether/if và từ để hỏi làm chủ ngữ hoặc tân ngữ.",
    formula: "verb + that-clause · whether/if + clause · wh-word + subject + verb",
    usage: "Mệnh đề danh từ hoạt động như một danh từ sau động từ, tính từ hoặc ở vị trí chủ ngữ.",
    signals: "Know, explain, confirm, determine, be aware; câu hỏi gián tiếp dùng trật tự khẳng định.",
    trap: "Không đảo trợ động từ trong câu hỏi gián tiếp: Please confirm when the meeting starts.",
    example: "Please let us know whether the revised schedule is acceptable.",
    translation: "Vui lòng cho chúng tôi biết liệu lịch đã sửa có thể chấp nhận được không."
  },
  {
    id: "parallelism",
    level: "advanced",
    category: "Cấu trúc câu",
    title: "Cấu trúc song song",
    summary: "Giữ cùng dạng ngữ pháp trong danh sách và cặp liên từ.",
    formula: "V-ing, V-ing, and V-ing · both A and B · either A or B · not only A but also B",
    usage: "Các thành phần cùng chức năng phải đồng dạng để câu rõ và cân đối.",
    signals: "And/or hoặc cặp liên từ tương quan là dấu hiệu kiểm tra dạng của hai phía.",
    trap: "Không trộn to review, approving, and to submit trong cùng danh sách.",
    example: "The role involves planning events, coordinating vendors, and managing budgets.",
    translation: "Vị trí này bao gồm lập kế hoạch sự kiện, điều phối nhà cung cấp và quản lý ngân sách."
  },
  {
    id: "ellipsis-substitution",
    level: "advanced",
    category: "Cấu trúc câu",
    title: "Lược bỏ và từ thay thế",
    summary: "Tránh lặp bằng one/ones, do so, so/neither và trợ động từ.",
    formula: "the blue one · do so · so + auxiliary + S · neither + auxiliary + S",
    usage: "Dùng từ thay thế khi danh từ hoặc hành động đã rõ, đặc biệt trong hội thoại và email.",
    signals: "So/neither thể hiện đồng tình; one/ones thay danh từ đếm được.",
    trap: "Không dùng one thay danh từ không đếm được; dùng that để so sánh danh từ số ít/không đếm được trang trọng.",
    example: "Our current printer is faster than the one in the reception area.",
    translation: "Máy in hiện tại của chúng tôi nhanh hơn máy ở khu vực lễ tân."
  },
  {
    id: "emphasis-clefts",
    level: "advanced",
    category: "Cấu trúc câu",
    title: "Câu chẻ và cấu trúc nhấn mạnh",
    summary: "Làm nổi bật người, vật, thời gian hoặc nguyên nhân.",
    formula: "It is/was + focus + that/who... · What + clause + be + focus · do/does/did + V",
    usage: "Câu chẻ nhấn mạnh một thành phần; do/does/did nhấn mạnh động từ trong câu khẳng định.",
    signals: "It was not until..., What we need is..., The reason why...is...",
    trap: "Sau did nhấn mạnh phải dùng động từ nguyên mẫu.",
    example: "It was the updated forecast that changed the committee's decision.",
    translation: "Chính bản dự báo cập nhật đã làm thay đổi quyết định của ủy ban."
  },
  {
    id: "complex-agreement",
    level: "advanced",
    category: "Động từ",
    title: "Hòa hợp chủ vị nâng cao",
    summary: "Either/or, neither/nor, collective nouns, phần trăm và lượng.",
    formula: "either A or B + verb agreeing with B · a number of + plural verb · the number of + singular verb",
    usage: "Với or/nor, động từ thường hòa hợp với chủ ngữ gần nhất; lượng tiền, thời gian, khoảng cách như một đơn vị dùng số ít.",
    signals: "A number of, the number of, along with, as well as và together with.",
    trap: "As well as không tạo chủ ngữ kép: The manager, as well as the assistants, is attending.",
    example: "Neither the technicians nor the supervisor was available.",
    translation: "Cả các kỹ thuật viên lẫn người giám sát đều không có mặt."
  },
  {
    id: "dangling-modifiers",
    level: "advanced",
    category: "Cấu trúc câu",
    title: "Cụm bổ nghĩa và chủ thể logic",
    summary: "Đảm bảo cụm mở đầu bổ nghĩa đúng chủ ngữ theo sau.",
    formula: "Having reviewed the file, the manager approved it.",
    usage: "Chủ thể ngầm của cụm V-ing/V3/to V mở đầu phải là chủ ngữ của mệnh đề chính.",
    signals: "Câu bắt đầu bằng phân từ, cụm giới từ hoặc to V và có dấu phẩy.",
    trap: "Sai: After reviewing the file, the error was obvious. Error không thể review file.",
    example: "After reviewing the contract, Ms. Patel requested two changes.",
    translation: "Sau khi xem xét hợp đồng, bà Patel yêu cầu hai thay đổi."
  },
  {
    id: "connectors-conjunctive-adverbs",
    level: "advanced",
    category: "Liên từ",
    title: "Trạng từ liên kết và dấu câu",
    summary: "However, therefore, moreover, otherwise và consequently.",
    formula: "Sentence; however, sentence. · Sentence. Therefore, sentence.",
    usage: "Trạng từ liên kết nối ý nghĩa giữa hai mệnh đề độc lập nhưng không tự đóng vai trò liên từ kết hợp.",
    signals: "Có dấu chấm hoặc chấm phẩy trước và dấu phẩy sau trạng từ liên kết.",
    trap: "Không nối hai câu độc lập chỉ bằng dấu phẩy trước however.",
    example: "Demand has risen sharply; therefore, additional staff will be hired.",
    translation: "Nhu cầu đã tăng mạnh; do đó, nhân sự bổ sung sẽ được tuyển."
  },
  {
    id: "preposition-collocations",
    level: "advanced",
    category: "Giới từ",
    title: "Cụm từ cố định với giới từ",
    summary: "Động từ, tính từ và danh từ đi kèm giới từ đặc trưng.",
    formula: "comply with · responsible for · access to · increase in · solution to",
    usage: "Nhiều câu Part 5 kiểm tra kết hợp từ hơn là quy tắc đơn lẻ. Học theo cả cụm trong ngữ cảnh công việc.",
    signals: "Chỗ trống đứng sau một động từ/tính từ/danh từ và trước cụm danh từ.",
    trap: "To trong be committed to, object to và contribute to là giới từ; sau đó dùng danh từ hoặc V-ing.",
    example: "All contractors must comply with the updated safety regulations.",
    translation: "Tất cả nhà thầu phải tuân thủ các quy định an toàn đã cập nhật."
  },
  {
    id: "determiners-reference",
    level: "advanced",
    category: "Danh từ",
    title: "Từ hạn định chỉ phạm vi và tham chiếu",
    summary: "Another, other, the other, others, either, neither và both.",
    formula: "another + singular noun · other + plural/uncountable noun · the other + specific remainder · others = other people/things",
    usage: "Another chỉ thêm một đối tượng; the other chỉ phần còn lại xác định; others đứng độc lập không có danh từ sau.",
    signals: "Số lượng đối tượng đã biết trong ngữ cảnh quyết định dạng đúng.",
    trap: "Không dùng others + noun hoặc the another.",
    example: "One elevator is under maintenance, but the other is operating normally.",
    translation: "Một thang máy đang được bảo trì, nhưng thang còn lại hoạt động bình thường."
  },
  {
    id: "tense-consistency",
    level: "advanced",
    category: "Thì",
    title: "Phối hợp thì trong đoạn văn",
    summary: "Duy trì trục thời gian nhất quán qua nhiều câu.",
    formula: "past narrative + past/past perfect · present report + present/present perfect · future plan + present time clause",
    usage: "Part 6 yêu cầu đọc câu trước và sau để xác định mốc thời gian chung, thay vì chỉ nhìn một trạng từ.",
    signals: "Ngày tháng, chuỗi sự kiện, trạng thái hiện tại và kết quả được nhắc ở các câu lân cận.",
    trap: "Một đoạn có thể đổi thì hợp lý khi mốc thời gian thay đổi; không ép toàn bộ đoạn dùng cùng một thì.",
    example: "The firm launched the service in March and has since gained 5,000 users.",
    translation: "Công ty ra mắt dịch vụ vào tháng Ba và kể từ đó đã có 5.000 người dùng."
  }
];

const levelMeta = {
  basic: {
    order: 1,
    label: "Cơ bản",
    description: "Nền tảng để xác định đúng cấu trúc câu và từ loại."
  },
  intermediate: {
    order: 2,
    label: "Trung cấp",
    description: "Các cấu trúc xuất hiện thường xuyên trong câu và đoạn văn TOEIC."
  },
  advanced: {
    order: 3,
    label: "Nâng cao",
    description: "Cấu trúc cô đọng, trang trọng và các bẫy phân hóa điểm cao."
  }
};

(async () => {
  const user = await requireAuth();
  if (!user) return;

  const userEmail = document.getElementById("userEmail");
  const catalog = document.getElementById("grammarCatalog");
  const searchInput = document.getElementById("grammarSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const levelFilters = document.getElementById("levelFilters");
  const resultCount = document.getElementById("resultCount");
  const emptyState = document.getElementById("emptyState");
  const clearFilters = document.getElementById("clearFilters");
  const expandVisible = document.getElementById("expandVisible");
  const progressLabel = document.getElementById("progressLabel");
  const progressBar = document.getElementById("progressBar");
  const progressMessage = document.getElementById("progressMessage");
  const storageKey = `vocanest-grammar-progress:${user.id || user.email}`;

  if (userEmail) userEmail.textContent = user.email;

  let selectedLevel = "all";
  let completed = new Set(readProgress());
  let allVisibleExpanded = false;

  function readProgress() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  function saveProgress() {
    localStorage.setItem(storageKey, JSON.stringify([...completed]));
    updateProgress();
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function updateProgress() {
    const count = completed.size;
    const percent = Math.round((count / grammarTopics.length) * 100);
    progressLabel.textContent = `${count} / ${grammarTopics.length}`;
    progressBar.style.width = `${percent}%`;

    if (percent === 100) {
      progressMessage.textContent = "Bạn đã hoàn thành toàn bộ thư viện.";
    } else if (percent >= 70) {
      progressMessage.textContent = "Bạn đang ở chặng nâng cao.";
    } else if (percent >= 35) {
      progressMessage.textContent = "Nền tảng đã khá chắc, tiếp tục nhé.";
    } else {
      progressMessage.textContent = "Bắt đầu từ nền tảng và học theo nhịp của bạn.";
    }
  }

  function createIcon(name, className) {
    const icon = document.createElement("i");
    icon.setAttribute("data-lucide", name);
    if (className) icon.className = className;
    return icon;
  }

  function createBlock(title, content, className = "grammar-block") {
    const block = document.createElement("div");
    block.className = className;
    const heading = document.createElement("h4");
    heading.textContent = title;
    const paragraph = document.createElement("p");
    paragraph.textContent = content;
    block.append(heading, paragraph);
    return block;
  }

  function createTopic(topic, index) {
    const details = document.createElement("details");
    details.className = "grammar-item";
    details.id = topic.id;
    details.dataset.topicId = topic.id;

    const summary = document.createElement("summary");
    summary.className = "grammar-item__summary";

    const topicIndex = document.createElement("span");
    topicIndex.className = "grammar-item__index";
    topicIndex.textContent = String(index + 1).padStart(2, "0");

    const titleWrap = document.createElement("div");
    titleWrap.className = "grammar-item__title";
    const title = document.createElement("h3");
    title.textContent = topic.title;
    const subtitle = document.createElement("p");
    subtitle.textContent = topic.summary;
    titleWrap.append(title, subtitle);

    const category = document.createElement("span");
    category.className = "grammar-item__category";
    category.textContent = topic.category;

    summary.append(topicIndex, titleWrap, category, createIcon("chevron-down", "grammar-item__chevron"));

    const body = document.createElement("div");
    body.className = "grammar-item__body";

    const explanation = document.createElement("div");
    explanation.className = "grammar-explanation";
    const formulaBlock = document.createElement("div");
    formulaBlock.className = "grammar-block";
    const formulaTitle = document.createElement("h4");
    formulaTitle.textContent = "Công thức";
    const formula = document.createElement("div");
    formula.className = "grammar-formula";
    formula.textContent = topic.formula;
    formulaBlock.append(formulaTitle, formula);
    explanation.append(
      formulaBlock,
      createBlock("Cách dùng", topic.usage),
      createBlock("Dấu hiệu nhận biết", topic.signals)
    );

    const aside = document.createElement("div");
    aside.className = "grammar-aside";

    const example = document.createElement("div");
    example.className = "example-box";
    const exampleLabel = document.createElement("span");
    exampleLabel.textContent = "Ví dụ TOEIC";
    const exampleText = document.createElement("strong");
    exampleText.textContent = topic.example;
    const translation = document.createElement("p");
    translation.textContent = topic.translation;
    example.append(exampleLabel, exampleText, translation);

    const trap = document.createElement("div");
    trap.className = "trap-box";
    const trapLabel = document.createElement("span");
    trapLabel.textContent = "Bẫy thường gặp";
    const trapText = document.createElement("p");
    trapText.textContent = topic.trap;
    trap.append(trapLabel, trapText);

    const learnedLabel = document.createElement("label");
    learnedLabel.className = "learned-toggle";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed.has(topic.id);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) completed.add(topic.id);
      else completed.delete(topic.id);
      saveProgress();
    });
    const learnedText = document.createElement("span");
    learnedText.textContent = "Đã học chuyên đề này";
    learnedLabel.append(checkbox, learnedText);

    aside.append(example, trap, learnedLabel);
    body.append(explanation, aside);
    details.append(summary, body);
    return details;
  }

  function getFilteredTopics() {
    const query = normalizeText(searchInput.value);
    const category = categoryFilter.value;

    return grammarTopics.filter(topic => {
      const matchesLevel = selectedLevel === "all" || topic.level === selectedLevel;
      const matchesCategory = category === "all" || topic.category === category;
      const searchable = normalizeText([
        topic.title,
        topic.summary,
        topic.category,
        topic.formula,
        topic.usage,
        topic.signals,
        topic.trap
      ].join(" "));
      return matchesLevel && matchesCategory && (!query || searchable.includes(query));
    });
  }

  function render() {
    const filtered = getFilteredTopics();
    catalog.replaceChildren();
    resultCount.textContent = filtered.length;
    emptyState.hidden = filtered.length !== 0;
    catalog.hidden = filtered.length === 0;
    expandVisible.disabled = filtered.length === 0;
    allVisibleExpanded = false;
    expandVisible.lastChild.textContent = " Mở tất cả";

    Object.keys(levelMeta).forEach(level => {
      const topics = filtered.filter(topic => topic.level === level);
      if (!topics.length) return;

      const section = document.createElement("section");
      section.className = "grammar-level";
      section.dataset.level = level;

      const head = document.createElement("div");
      head.className = "grammar-level__head";
      const number = document.createElement("span");
      number.className = "grammar-level__number";
      number.textContent = `0${levelMeta[level].order}`;
      const title = document.createElement("h2");
      title.textContent = levelMeta[level].label;
      const description = document.createElement("p");
      description.textContent = levelMeta[level].description;
      const count = document.createElement("span");
      count.className = "grammar-level__count";
      count.textContent = `${topics.length} chuyên đề`;
      head.append(number, title, description, count);

      const list = document.createElement("div");
      list.className = "grammar-list";
      topics.forEach(topic => {
        const globalIndex = grammarTopics.findIndex(item => item.id === topic.id);
        list.appendChild(createTopic(topic, globalIndex));
      });

      section.append(head, list);
      catalog.appendChild(section);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  [...new Set(grammarTopics.map(topic => topic.category))]
    .sort((a, b) => a.localeCompare(b, "vi"))
    .forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });

  searchInput.addEventListener("input", render);
  categoryFilter.addEventListener("change", render);

  levelFilters.addEventListener("click", event => {
    const button = event.target.closest("[data-level]");
    if (!button) return;
    selectedLevel = button.dataset.level;
    levelFilters.querySelectorAll("[data-level]").forEach(item => {
      item.classList.toggle("is-active", item === button);
    });
    render();
  });

  clearFilters.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "all";
    selectedLevel = "all";
    levelFilters.querySelectorAll("[data-level]").forEach(item => {
      item.classList.toggle("is-active", item.dataset.level === "all");
    });
    render();
    searchInput.focus();
  });

  expandVisible.addEventListener("click", () => {
    allVisibleExpanded = !allVisibleExpanded;
    catalog.querySelectorAll(".grammar-item").forEach(item => {
      item.open = allVisibleExpanded;
    });
    expandVisible.lastChild.textContent = allVisibleExpanded ? " Thu gọn tất cả" : " Mở tất cả";
    const icon = expandVisible.querySelector("svg");
    if (icon) icon.outerHTML = `<i data-lucide="${allVisibleExpanded ? "fold-vertical" : "unfold-vertical"}"></i>`;
    if (window.lucide) window.lucide.createIcons();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "/" && document.activeElement !== searchInput) {
      event.preventDefault();
      searchInput.focus();
    }
  });

  updateProgress();
  render();

  const requestedTopic = window.location.hash.slice(1);
  if (requestedTopic) {
    const topicElement = document.getElementById(requestedTopic);
    if (topicElement) {
      topicElement.open = true;
      requestAnimationFrame(() => topicElement.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }
})();
