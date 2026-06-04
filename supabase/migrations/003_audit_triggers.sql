-- Smart-ICM 변경이력 트리거
-- 2026-05-29 | 핵심 테이블 자동 audit_logs 기록

CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs(table_name, record_id, action, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs(table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs(table_name, record_id, action, old_data, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 적용 (핵심 테이블)
CREATE TRIGGER audit_rcm_controls
  AFTER INSERT OR UPDATE OR DELETE ON rcm_controls
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_populations
  AFTER INSERT OR UPDATE OR DELETE ON populations
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_samples
  AFTER INSERT OR UPDATE OR DELETE ON samples
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_evidence_submissions
  AFTER INSERT OR UPDATE OR DELETE ON evidence_submissions
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_op_evaluations
  AFTER INSERT OR UPDATE OR DELETE ON op_evaluations
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_deficiencies
  AFTER INSERT OR UPDATE OR DELETE ON deficiencies
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_approvals
  AFTER INSERT OR UPDATE OR DELETE ON approvals
  FOR EACH ROW EXECUTE FUNCTION log_audit();

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_eval_terms
  BEFORE UPDATE ON eval_terms FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_rcm_controls
  BEFORE UPDATE ON rcm_controls FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_evidence_submissions
  BEFORE UPDATE ON evidence_submissions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_op_evaluations
  BEFORE UPDATE ON op_evaluations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_deficiencies
  BEFORE UPDATE ON deficiencies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
