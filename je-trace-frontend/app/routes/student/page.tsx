import { BookOpen, Clock3, MessageCircle } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { getTestMessage } from "../../lib/testApi";

export default function StudentPage() {
  const [result, setResult] = useState("아직 응답 없음");
  const [loading, setLoading] = useState(false);

  const cards = [
    {
      title: "AI 채팅 시작",
      desc: "AI와 질문·답변을 주고받으며 학습을 진행합니다.",
      icon: <MessageCircle className="h-8 w-8" />,
    },
    {
      title: "학습 기록",
      desc: "이전 대화와 학습 진행 내역을 확인합니다.",
      icon: <Clock3 className="h-8 w-8" />,
    },
    {
      title: "학습 자료",
      desc: "과목별 자료와 추천 콘텐츠를 확인합니다.",
      icon: <BookOpen className="h-8 w-8" />,
    },
  ];

  const handleTest = async () => {
    try {
      setLoading(true);
      const data = await getTestMessage();
      setResult(data.message);
    } catch (error) {
      console.error(error);
      setResult("백엔드 연결 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col gap-8">
        <div className="rounded-3xl border-4 border-slate-900 bg-white px-8 py-10 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <p className="mb-3 inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-semibold tracking-[0.2em] text-blue-700">
            STUDENT MODE
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
            학생 페이지
          </h1>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            AI와 대화하며 학습하고, 개인별 학습 기록을 확인할 수 있는 학생 전용 화면입니다.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={handleTest}
              className="rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-700"
            >
              {loading ? "연결 중..." : "백엔드 연결 테스트"}
            </button>

            <Link
              to="/"
              className="inline-flex rounded-xl border-2 border-slate-900 bg-white px-5 py-3 font-bold text-slate-900 transition hover:bg-slate-100"
            >
              홈으로 돌아가기
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border-2 border-slate-300 bg-slate-50 p-5">
            <p className="text-lg font-bold text-slate-900">응답 결과</p>
            <p className="mt-2 text-slate-600">{result}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border-4 border-slate-900 bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.10)] transition hover:-translate-y-1 hover:shadow-[0_20px_36px_rgba(15,23,42,0.16)]"
            >
              <div className="mb-4 inline-flex rounded-2xl border-2 border-slate-800 bg-slate-100 p-3 text-slate-800">
                {card.icon}
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900">
                {card.title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}