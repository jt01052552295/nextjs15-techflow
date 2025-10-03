import type { ListParams } from '@/types/agent';

/** 커서를 제외한 기준 파라미터 타입 */
export type AgentBaseParams = Omit<ListParams, 'cursor'>;

/** React Query QueryKey 모음 */
export const agentQK = {
  list: (base: AgentBaseParams) => ['agent', 'list', base] as const,
};
