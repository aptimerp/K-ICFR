import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 서버 전용 (API Routes에서만 사용)
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY 미설정')
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ─── 타입 정의 ───────────────────────────────

export type EvalMode = 'INTERIM1' | 'INTERIM2' | 'FINAL'
export type Persona = 'P1' | 'P2' | 'P3' | 'P4' | 'P5'
export type CtrlKind = 'PLC' | 'ITGC' | 'ELC'
export type EvalResult = 'PASS' | 'EXCEPTION' | 'NOT_APPLICABLE'
export type DeficiencySeverity =
  | 'IMPROVEMENT_SUGGESTION'
  | 'SIMPLE_DEFICIENCY'
  | 'SIGNIFICANT_DEFICIENCY'
  | 'MATERIAL_WEAKNESS'

export interface EvalTerm {
  id: string
  term_id: string
  term_year: number
  term_cnt: number
  eval_mode: EvalMode
  entity_code: string
  start_date: string
  end_date: string
  is_active: boolean
}

export interface RcmControl {
  id: string
  ctrl_code: string
  ctrl_title: string
  ctrl_category: string | null
  ctrl_subcategory: string | null
  ctrl_type: string | null
  ctrl_method: string | null
  frequency: string | null
  it_dep: 'Y' | 'N' | null
  system_name: string | null
  evidence: string | null
  ctrl_kind: CtrlKind
  entity_code: string
  is_key: boolean
  is_active: boolean
}

export interface Population {
  id: string
  eval_term_id: string
  ctrl_code: string
  dept_code: string
  population_code: string
  transaction_id: string  // 연결키 ★
  transaction_date: string | null
  transaction_desc: string | null
  add_info_1: string | null
  add_info_2: string | null
  source: 'ERP_AUTO' | 'EXCEL_UPLOAD'
  entity_code: string
}

export interface Sample {
  id: string
  eval_term_id: string
  population_id: string
  ctrl_code: string
  sample_seq: number
  sampling_method: 'RANDOM' | 'JUDGMENTAL' | 'HAPHAZARD' | null
  status: 'PENDING' | 'EVIDENCE_REQUESTED' | 'EVIDENCE_SUBMITTED' | 'EVALUATED'
}

export interface EvidenceSubmission {
  id: string
  sample_id: string
  eval_term_id: string
  submitted_by: string | null
  submitted_at: string | null
  approved_by: string | null
  approved_at: string | null
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'
}

export interface OpEvaluation {
  id: string
  sample_id: string
  eval_term_id: string
  ctrl_code: string
  result: EvalResult | null
  eval_note: string | null
  ai_draft: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FINALIZED'
}

export interface Deficiency {
  id: string
  op_eval_id: string
  eval_term_id: string
  ctrl_code: string
  severity: DeficiencySeverity
  deficiency_desc: string
  root_cause: string | null
  remediation: string | null
  due_date: string | null
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'WAIVED'
}
