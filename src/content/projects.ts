export interface Project {
  id: string;
  mediaVersion?: string;
  name: string;
  english: string;
  category: string;
  scene: string;
  description: string;
  aspect: string;
  duration: string;
  layout: string;
  color: string;
}

// Names and ownership confirmed by the user. Scene descriptions are based on supplied footage.
// Detailed technical choices and measured outcomes must be supplied before adding them.
export const projects: Project[] = [
  { id: 'hy', name: '火眼', english: 'An interface beyond the screen.', category: '空间交互', scene: '空间里的交互', description: '以星空与三维视觉构建空间界面，让观众的操作与大屏内容联动。', aspect: '16 / 9', duration: '00:19', layout: 'feature', color: '#111e32' },
  { id: 'bedi', mediaVersion: '20261106-164710', name: '北电', english: 'Ideas, brought into experience.', category: '数字体验', scene: '从界面到体验', description: '连接图像、声音与视频内容，在多模态界面中探索生成式体验。', aspect: '16 / 9', duration: '01:13', layout: 'large', color: '#efd5c3' },
  { id: 'qhc', name: '商汤青花瓷', english: 'A dialogue with tradition.', category: '绘画交互', scene: '传统意象，交互表达', description: '将山水绘画与图案交互融为一体，让传统意象在数字界面中延展。', aspect: '1528 / 990', duration: '00:49', layout: 'small', color: '#e6e9e8' },
  { id: 'hs', name: '火山', english: 'Digital experiences, in place.', category: '数字展陈', scene: '让体验发生在现场', description: '以多屏互动串联展厅体验，让观众在探索与操作中理解内容。', aspect: '16 / 9', duration: '00:27', layout: 'wide', color: '#253442' },
  { id: 'dxm', name: '度小满', english: 'Making information tangible.', category: '数据可视化', scene: '信息的可视化表达', description: '以三维视觉为核心，串联关键指标与动态信息，建立清晰的数据层次。', aspect: '2494 / 1050', duration: '00:16', layout: 'data', color: '#c2ccf1' },
  { id: 'icbc', name: '工行', english: 'A global view, in motion.', category: '数据可视化', scene: '全球账户可视化', description: '围绕三维地球组织全球账户信息，以图表与动态数据呈现分布关系。', aspect: '2006 / 1202', duration: '00:16', layout: 'bank', color: '#241450' },
  { id: 'swtx', name: '四维图新', english: 'Exploring a connected journey.', category: '智慧出行', scene: '出行场景的互动展示', description: '连接操作台与大屏，在车辆与道路场景之间展开智慧出行体验。', aspect: '16 / 9', duration: '00:38', layout: 'closing', color: '#a7b5bc' },
];

export const mediaPath = (project: Project, file: string) =>
  `${import.meta.env.BASE_URL}media/projects/${project.id}/${file}${project.mediaVersion ? `?v=${project.mediaVersion}` : ''}`;
