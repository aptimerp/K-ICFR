/**
 * 금강 API 호출 예제
 *
 * 신규 서비스에서 기존 ERP 데이터를 조회할 때 사용하는 패턴입니다.
 * 클라이언트 → Vercel API Routes → 금강 SAC API → MSSQL
 */

// app/api/erp/vouchers/route.ts (Vercel API Routes)
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('start_date'); // YYYY-MM-DD
  const endDate = searchParams.get('end_date');
  const status = searchParams.get('status'); // DRAFT / POSTED / CLOSED

  // 환경변수에서 금강 API 정보 읽기
  const apiUrl = process.env.KUMKANG_API_URL;
  const apiKey = process.env.KUMKANG_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json(
      { error: '금강 API 설정 누락' },
      { status: 500 }
    );
  }

  try {
    // 금강 API 호출 (서버 사이드에서만 가능 — API Key 노출 방지)
    const erpRes = await fetch(`${apiUrl}/erp/vouchers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
        status: status || 'POSTED',
      }),
    });

    if (!erpRes.ok) {
      console.error('금강 API 호출 실패:', erpRes.status);
      return NextResponse.json(
        { error: 'ERP 조회 실패' },
        { status: erpRes.status }
      );
    }

    const vouchersData = await erpRes.json();

    // (선택) Supabase에서 신규 서비스 자체 데이터 병합
    // const supabase = createClient();
    // const { data: crmData } = await supabase
    //   .from('icfr_evaluations')
    //   .select('*')
    //   .gte('created_at', startDate)
    //   .lte('created_at', endDate);

    return NextResponse.json({
      success: true,
      data: {
        erp_vouchers: vouchersData,
        // crm_evaluations: crmData,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API 호출 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류' },
      { status: 500 }
    );
  }
}

// ============================================================
// 클라이언트 측 호출 (components/VouchersTable.tsx)
// ============================================================

import { useEffect, useState } from 'react';

interface Voucher {
  voucherId: number;
  voucherDate: string; // 전표 날짜
  voucherNo: string; // 전표 번호 (예: 2026-05-15-1430-0042)
  amount: number; // 금액
  status: 'DRAFT' | 'POSTED' | 'CLOSED'; // 상태
  department: string; // 부서 (SAL, MFG, ...)
  description: string; // 적요
}

export default function VouchersTable() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const startDate = '2026-05-01';
        const endDate = '2026-05-31';

        // 자신의 API Routes 호출 (클라이언트)
        const res = await fetch(
          `/api/erp/vouchers?start_date=${startDate}&end_date=${endDate}&status=POSTED`
        );

        if (!res.ok) {
          throw new Error('전표 조회 실패');
        }

        const json = await res.json();
        setVouchers(json.data.erp_vouchers);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">오류: {error}</div>;

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">전표번호</th>
          <th className="border p-2">전표날짜</th>
          <th className="border p-2">부서</th>
          <th className="border p-2">금액</th>
          <th className="border p-2">상태</th>
          <th className="border p-2">적요</th>
        </tr>
      </thead>
      <tbody>
        {vouchers.map((v) => (
          <tr key={v.voucherId} className="hover:bg-gray-50">
            <td className="border p-2">{v.voucherNo}</td>
            <td className="border p-2">{v.voucherDate}</td>
            <td className="border p-2">{v.department}</td>
            <td className="border p-2 text-right">₩{v.amount.toLocaleString()}</td>
            <td className="border p-2">
              <span className={`px-2 py-1 rounded text-sm font-semibold
                ${v.status === 'POSTED' ? 'bg-green-100 text-green-800' : ''}
                ${v.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${v.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' : ''}
              `}>
                {v.status}
              </span>
            </td>
            <td className="border p-2">{v.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============================================================
// 주의사항
// ============================================================
/**
 * 1. API 키 보안:
 *    - KUMKANG_API_KEY는 .env.local에만 저장
 *    - 서버 사이드 (API Routes)에서만 사용
 *    - 클라이언트에서 직접 호출 금지
 *
 * 2. Playground 테스트 (개발 단계):
 *    - KUMKANG_PLAYGROUND_URL로 먼저 테스트
 *    - SAC 담당자(이영호 차장)에게 문의
 *
 * 3. 데이터 변환:
 *    - ERP 응답 형식 → 신규 서비스 인터페이스 변환
 *    - 날짜 형식 통일 (ISO 8601)
 *
 * 4. 오류 처리:
 *    - 타임아웃 (30초): 재시도 로직 필수
 *    - 인증 오류: CFO / 감시팀에 보고
 *
 * 5. 성능:
 *    - 대량 조회 시 페이지네이션 필수
 *    - 캐싱: Vercel KV 또는 Supabase 활용
 */
