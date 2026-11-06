// Case copy is limited to the supplied RAG demo and AI Gift PRD.
// RAG internals and individual ownership still require source/user confirmation.
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
