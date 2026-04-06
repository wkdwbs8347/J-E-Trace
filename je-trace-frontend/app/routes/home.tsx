import { GraduationCap, School } from "lucide-react";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();

  const modes = [
    {
      title: "학생 모드",
      desc: "AI와 대화하며 학습하고, 개인별 학습 기록을 확인합니다.",
      icon: <GraduationCap className="h-10 w-10" />,
      onClick: () => navigate("/student"),
    },
    {
      title: "교사 모드",
      desc: "학생 대화 로그와 학습 현황을 확인하고 관리합니다.",
      icon: <School className="h-10 w-10" />,
      onClick: () => navigate("/teacher"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center gap-8">
        <div className="w-full max-w-4xl rounded-3xl border-4 border-slate-900 bg-white px-8 py-10 text-center shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <p className="mb-3 inline-block rounded-full border border-slate-300 bg-slate-50 px-4 py-1 text-sm font-semibold tracking-[0.2em] text-slate-600">
            JE TRACE
          </p>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 md:text-7xl">
            AI 교육 솔루션
          </h1>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            학습자와 교사를 위한 AI 채팅 기반 학습 기록 및 분석 플랫폼
          </p>
        </div>

        <div className="w-full max-w-3xl rounded-2xl border-4 border-slate-900 bg-slate-900 px-6 py-5 text-center text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)]">
          <h2 className="text-2xl font-bold md:text-3xl">모드 선택</h2>
          <p className="mt-2 text-sm text-slate-300 md:text-base">
            사용할 화면을 선택해 서비스를 시작하세요.
          </p>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {modes.map((mode) => (
            <button
              key={mode.title}
              onClick={mode.onClick}
              className="group rounded-3xl border-4 border-slate-900 bg-white p-8 text-left shadow-[0_14px_30px_rgba(15,23,42,0.10)] transition hover:-translate-y-1 hover:bg-slate-50 hover:shadow-[0_20px_36px_rgba(15,23,42,0.16)]"
            >
              <div className="mb-5 inline-flex rounded-2xl border-2 border-slate-800 bg-slate-100 p-4 text-slate-800 transition group-hover:bg-slate-900 group-hover:text-white">
                {mode.icon}
              </div>

              <h3 className="text-3xl font-extrabold text-slate-900">
                {mode.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                {mode.desc}
              </p>

              <div className="mt-8 inline-flex items-center text-sm font-bold text-slate-800">
                입장하기 →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}