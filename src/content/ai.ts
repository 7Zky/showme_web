// Grounded in the project sources and confirmed responsibilities.
// Market framing describes product rationale, not measured research or results.
export const ragFlow = [
  { title: '提出问题', text: '围绕付款、预算、应收、资产与凭证提出操作问题。' },
  { title: '检索依据', text: '本地检索返回相关片段，并标记来源、版本与适用范围。' },
  { title: '本地生成', text: '将问题和检索片段交给本地 Ollama，生成带依据的回答。' },
  { title: '人工核对', text: '核对引用与原文；缺少制度或结果不相关时记录反馈。' },
];
export const giftJourney = [
  { title: '选择向导', short: '找到表达的起点', label: '01 / GUIDE', heading: '先选一种表达方式。', text: '根据关系与情感场景选择 AI 向导，以对应的口吻开启共创。', input: '告白 / 思念 / 离别 / 日常陪伴', decision: '场景化入口', reason: '让用户先找到自己的情境，再开始创作。' },
  { title: '填写信息', short: '给心意一些线索', label: '02 / CONTEXT', heading: '每次，只问一个问题。', text: '逐步收集双方关系、对方信息与关键回忆；保留自定义输入，并提供建议。', input: '关系 → 对方信息 → 关键回忆', decision: '渐进式信息卡', reason: '一次聚焦一个核心问题，减轻填写负担。' },
  { title: '对话共创', short: '让方案慢慢成形', label: '03 / CO-CREATE', heading: '把想法，聊成方案。', text: '信息卡作为上下文进入 AI 对话，用户通过多轮交流修改礼物方案。', input: '信息卡 → 需求搜集智能体 → 多轮修改', decision: '共创而非一次生成', reason: '让用户参与表达，保留修改和选择的空间。' },
  { title: '确认方案', short: '由用户做最后决定', label: '04 / CONFIRM', heading: '满意之后，再确认。', text: '总结智能体整理最终方案；用户明确点击确认后，才进入内容设定。', input: '方案总结 → 用户确认', decision: '明确的确认节点', reason: '将开放的对话收束为可以继续交付的方案。' },
  { title: '编辑内容', short: '留下自己的语气', label: '05 / PERSONALIZE', heading: '最后一句，由你来写。', text: '在文本框中自由编辑最终内容，也可引用下方的 AI 建议卡片。', input: '选定文案 → 自由编辑 / 建议卡片', decision: '可编辑的最终内容', reason: 'AI 提供灵感，表达的决定权留给用户。' },
  { title: '设备交付', short: '让声音承载心意', label: '06 / DELIVER', heading: '从屏幕，走向礼物。', text: '内容下发到已绑定设备；未绑定时引导绑定，离线时提示检查设备状态。', input: '绑定与状态检查 → 下发内容', decision: '软硬分工', reason: '创作与交互集中在小程序，硬件承担声音的实体呈现。' },
];

export const giftAnalysis = [
  { label: '01 / 市场切入', title: '从礼品选择，延伸到情感表达', text: '在礼品同质化的选择中，这个产品把价值放在关系与共同回忆上：通过参与创作，让实体礼品承载更个人化的内容。', choice: '以亲密关系的具体场景切入，用小程序共创连接实体礼品。' },
  { label: '02 / 需求拆解', title: '把模糊心意，拆成明确条件', text: '“想送一份特别的礼物”背后，包含关系、场合、回忆与表达语气。先收集这些条件，再进入多轮共创，最后通过确认节点收束方案。', choice: '用信息卡建立上下文，将需求搜集与方案总结交给不同智能体。' },
  { label: '03 / 用户视角', title: '同时考虑送礼人和收礼人', text: '送礼人需要低负担地开始、可修改的内容与交付反馈；收礼人的体验则落在内容是否贴合关系，以及声音如何由实体礼品承载。', choice: '渐进提问、保留编辑权，并把绑定与离线状态纳入交付路径。' },
];

export const giftExperience = [
  { title: '流程梳理与需求定义', text: '将情感场景拆解为六步用户旅程，明确每一步需要的信息、用户决策与系统反馈；把生成、确认、编辑和设备下发串成完整流程。', output: '场景 → 需求 → 流程' },
  { title: '沟通协作与方案对齐', text: '以 PRD、信息卡和交互状态作为沟通依据，让产品意图、UI 表达与开发实现围绕同一条路径展开；用明确的确认节点收束开放需求，减少理解偏差。', output: 'PRD · 交互 · 实现' },
  { title: '范围管理与交付推进', text: '围绕向导、共创、内容编辑与设备下发界定核心闭环，将声音个性化等能力放入后续规划；提前梳理次数不足、网络中断、未绑定和设备离线的恢复路径。', output: '优先级 · 边界 · 异常' },
];

// Alternative-solution analysis and positioning hypotheses; no claimed survey results.
export const giftMarket = [
  { option: '成品 / 定制礼品', value: '提供实体赠送的仪式感，以选品或外观定制表达心意。', opportunity: '将定制延伸到关系、回忆与语气，让情感内容成为礼品体验的一部分。' },
  { option: '通用 AI 写作工具', value: '辅助生成祝福与文案，用户自行组织背景信息并筛选结果。', opportunity: '用关系场景、渐进提问和多轮共创降低表达门槛，再连接设备交付。' },
  { option: '声音 / 陪伴类设备', value: '为声音内容提供实体载体与播放入口。', opportunity: '补足从“想说什么”到“如何创作”的引导，让内容生成与实体承载形成闭环。' },
];
