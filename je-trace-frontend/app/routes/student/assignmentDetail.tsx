import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";

/* ✅ 타입 */
type QA = {
  id: string;
  question: string;
  answer: string;
  score: number;
  createdAt: string;
  feedback?: number;
  usedInAnswer: boolean;
};

type AIResponse = {
  relevant: boolean;
  score: number;
  answer: string;
};

export default function AssignmentPage() {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<QA[]>([]);
  const [mounted, setMounted] = useState(false);
  const [hoverRating, setHoverRating] = useState<{ [key: string]: number }>({});

  /* ✅ 추가 */
  const [finalComment, setFinalComment] = useState("");
  const [textColor, setTextColor] = useState("#000000");

  const chatRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);


  /* ✅ 질문 필터 */
  const validateQuestion = (input: string): string | null => {
    const trimmed = input.trim();

    if (!trimmed) return "질문을 입력해주세요.";
    if (trimmed.length < 5) return "질문이 너무 짧아요.";
    if (trimmed.length > 500) return "질문이 너무 길어요.";

    const repeated = /(.)\1{4,}/;
    if (repeated.test(trimmed)) return "의미 있는 질문을 입력해주세요.";

    const onlySpecial = /^[^a-zA-Z0-9가-힣]+$/;
    if (onlySpecial.test(trimmed)) return "질문 형식이 올바르지 않습니다.";

    const bannedWords = ["몰?루", "아무거나"];
    if (bannedWords.some(word => trimmed.includes(word))) {
      return "의미 있는 질문을 입력해주세요.";
    }

    return null;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const [, forceUpdate] = useState(0);
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Image,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "답안을 작성하세요...",
      }),
    ],
    content: "<p></p>",
    immediatelyRender: false,

    /* ✅ 추가 */
    onUpdate: () => {
      forceUpdate(v => v + 1);
    },
    onSelectionUpdate: () => {
      forceUpdate(v => v + 1);
    },
  });

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [logs]);

  /* ✅ 질문 전송 */
  const handleSend = async () => {
    const error = validateQuestion(input);
    if (error) {
      alert(error);
      return;
    }

    setIsLoading(true); // 로딩상태

    try {
      const res = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: input,
          assignment:
            "List, Set, Map의 차이를 설명하고 각각의 사용 예시를 작성하시오.",
        }),
      });

      const data: AIResponse = await res.json();

      setLogs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          question: input,
          answer: data.answer,
          score: data.score,
          createdAt: new Date().toISOString(),
          usedInAnswer: false,
        },
      ]);

      setInput("");
    } catch (e) {
      setLogs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          question: input,
          answer: "AI 요청 실패",
          score: 0,
          createdAt: new Date().toISOString(),
          usedInAnswer: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ✅ AI 활용 분석 */
  const getPlainText = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.innerText;
  };

  const similarity = (a: string, b: string) => {
    const aWords = a.split(/\s+/);
    const bWords = b.split(/\s+/);

    const common = aWords.filter(word => bWords.includes(word)).length;
    return common / Math.max(aWords.length, 1);
  };

  const analyzeAIUsage = () => {
    if (!editor) return 0;

    const answerText = getPlainText(editor.getHTML());
    if (!answerText.trim()) return 0;

    let copiedScore = 0;
    let referencedScore = 0;
    let totalSimilarity = 0;

    logs.forEach(log => {
      const sim = similarity(answerText, log.answer);
      totalSimilarity += sim;

      // 🔥 핵심: 유사도 기반으로만 판단
      if (sim > 0.8) {
        copiedScore += 1;
      } else if (sim > 0.3) {
        referencedScore += 1;
      }

      // 🔥 버튼으로 넣었어도 "완전 복붙일 때만" 추가 패널티
      if (log.usedInAnswer && sim > 0.7) {
        copiedScore += 0.5; // 기존 1.5 → 완화
      }
    });

    const total = logs.length || 1;

    const copiedRate = copiedScore / total;
    const refRate = referencedScore / total;
    const avgSim = totalSimilarity / total;

    const isOwnWriting = avgSim < 0.3;

    let score =
      (1 - copiedRate) * 50 +
      refRate * 30 +
      (answerText.length > 50 ? 10 : 0);

    if (isOwnWriting) {
      score += 20;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const aiScore = analyzeAIUsage();

  const getAIScoreLabel = () => {
    if (aiScore >= 80) return "좋음";
    if (aiScore >= 40) return "보통";
    return "부족";
  };

  const getAIScoreColor = () => {
    if (aiScore >= 80) return "text-green-600";
    if (aiScore >= 40) return "text-yellow-600";
    return "text-red-600";
  };


  /* ✅ 제출 */
  const handleSubmit = () => {
    const finalAnswer = editor?.getHTML();
    console.log({ logs, finalAnswer, aiScore, finalComment });
    alert(`제출 완료\nAI 활용 점수: ${aiScore}`);
  };

  /* ✅ 답안 삽입 */
  const insertToEditor = (id: string, text: string) => {
    editor?.chain().focus().insertContent(`<p>${text}</p>`).run();

    setLogs((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, usedInAnswer: true } : l
      )
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    editor?.chain().focus().setImage({ src: url }).run();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    editor
      ?.chain()
      .focus()
      .insertContent(
        `<a href="${url}" target="_blank" class="text-blue-500 underline">${file.name}</a>`
      )
      .run();
  };

  /* ✅ 버튼 스타일 (활성화 포함) */
  const btn = (active?: boolean) =>
    `px-2 py-1 rounded text-sm transition-all ${active ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
    }`;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-200 p-6 text-gray-800">
      <div className="w-full h-full grid grid-cols-[1.2fr_0.8fr] gap-6">

        {/* LEFT */}
        <div className="flex flex-col gap-4 h-full min-h-0">

          <section className="bg-white shadow-sm rounded-2xl px-5 py-4 flex justify-between">
            <h1 className="text-lg font-semibold">자바 컬렉션 정리</h1>
            <Link to="/student/assignments" className="text-sm text-gray-500 hover:text-black">
              ← 목록으로
            </Link>
          </section>

          <section className="bg-white shadow-sm rounded-2xl p-5 flex flex-col flex-1 min-h-0">

            <div className="grid grid-rows-[auto_1fr] gap-4 flex-1 min-h-0">

              <div className="max-h-[160px] overflow-y-auto">
                <h2 className="text-sm font-semibold mb-2">문제 요구 사항</h2>
                <p className="text-sm text-gray-500">
                  List, Set, Map의 차이를 설명하고 각각의 사용 예시를 작성하시오.
                </p>
              </div>

              <div className="flex flex-col min-h-0">
                <h2 className="text-sm font-semibold mb-2">답안 작성</h2>

                {/* ✅ 수정된 에디터 툴바 */}
                <div className="flex flex-wrap gap-2 mb-2 border-b pb-2 text-sm">

                  <button
                    className={btn(editor?.isActive("bold"))}
                    onClick={() => {
                      editor?.chain().focus().toggleBold().run();
                      forceUpdate(v => v + 1);
                    }}
                  >
                    B
                  </button>

                  <button
                    className={btn(editor?.isActive("italic"))}
                    onClick={() => {
                      editor?.chain().focus().toggleItalic().run();
                      forceUpdate(v => v + 1);
                    }}
                  >
                    I
                  </button>

                  <button
                    className={btn(editor?.isActive("strike"))}
                    onClick={() => {
                      editor?.chain().focus().toggleStrike().run();
                      forceUpdate(v => v + 1);
                    }}
                  >
                    S
                  </button>

                  <button className={btn(editor?.isActive("heading", { level: 1 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
                  <button className={btn(editor?.isActive("heading", { level: 2 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>

                  <button className={btn(editor?.isActive("bulletList"))} onClick={() => editor?.chain().focus().toggleBulletList().run()}>•</button>
                  <button className={btn(editor?.isActive("orderedList"))} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1.</button>

                  <button className={btn(editor?.isActive({ textAlign: "left" }))} onClick={() => editor?.chain().focus().setTextAlign("left").run()}>⯇</button>
                  <button className={btn(editor?.isActive({ textAlign: "center" }))} onClick={() => editor?.chain().focus().setTextAlign("center").run()}>≡</button>
                  <button className={btn(editor?.isActive({ textAlign: "right" }))} onClick={() => editor?.chain().focus().setTextAlign("right").run()}>⯈</button>

                  {/* ✅ 컬러 피커 */}
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      editor?.chain().focus().setColor(e.target.value).run();
                    }}
                    className="w-8 h-8 border rounded cursor-pointer"
                  />

                </div>

                {mounted && editor && (
                  <div className="flex-1 overflow-y-auto border rounded-xl p-3 bg-gray-50">
                    <EditorContent editor={editor} />
                  </div>
                )}
              </div>
            </div>

            {/* AI 분석 UI */}
            <div className="mt-4 border-t pt-4 space-y-2">
              <div className="text-sm font-semibold">AI 활용 분석</div>
              <div className={`text-sm font-bold ${getAIScoreColor()}`}>
                점수: {aiScore}점 ({getAIScoreLabel()})
              </div>
              <input
                value={finalComment}
                onChange={(e) => setFinalComment(e.target.value)}
                placeholder="AI 활용 방법 한줄 작성..."
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>

            <div className="pt-4 mt-3 border-t flex justify-between items-center">

              <div className="flex gap-2">
                <button onClick={() => imageInputRef.current?.click()} className="bg-purple-100 text-purple-600 px-3 py-2 rounded-lg text-sm">
                  이미지 업로드
                </button>
                <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />

                <button onClick={() => fileInputRef.current?.click()} className="bg-green-100 text-green-600 px-3 py-2 rounded-lg text-sm">
                  파일 업로드
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              </div>

              <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                제출
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col h-full min-h-0">
          <section className="bg-white shadow-sm rounded-2xl p-5 flex flex-col flex-1 min-h-0">

            <h2 className="text-sm font-semibold mb-3">AI 채팅</h2>

            <div ref={chatRef} className="flex-1 overflow-y-auto space-y-4">

              {logs.map((log) => (
                <div key={log.id} className="bg-gray-50 p-4 rounded-xl space-y-2">

                  <div className="text-sm font-semibold text-blue-600">
                    Q. {log.question}
                  </div>

                  <div className="text-sm whitespace-pre-wrap">
                    A. {log.answer}
                  </div>

                  <div className="flex justify-between items-center pt-2">

                    <div className={`text-xs font-semibold ${getScoreColor(log.score)}`}>
                      질문점수: {log.score}
                    </div>

                    <button
                      onClick={() => insertToEditor(log.id, log.answer)}
                      className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      답안에 추가
                    </button>

                  </div>

                  <div className="text-xs text-gray-400">
                    {log.usedInAnswer ? "✔ 답안에 사용됨" : "미사용"}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">
                      답변평가:
                    </span>

                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => {
                        const hover = hoverRating[log.id] || 0;
                        const current = hover || log.feedback || 0;

                        return (
                          <button
                            key={n}
                            onMouseEnter={() =>
                              setHoverRating(prev => ({ ...prev, [log.id]: n }))
                            }
                            onMouseLeave={() =>
                              setHoverRating(prev => ({ ...prev, [log.id]: 0 }))
                            }
                            onClick={() => {
                              setLogs(prev =>
                                prev.map(l =>
                                  l.id === log.id ? { ...l, feedback: n } : l
                                )
                              );
                            }}
                            className={`text-lg transition-all duration-150 ${n <= current
                              ? "text-yellow-400 scale-110"
                              : "text-gray-300"
                              } hover:scale-125`}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>

                  </div>

                </div>
              ))}
              {isLoading && (
                <div className="bg-blue-50 p-3 rounded-xl text-sm text-blue-600 animate-pulse">
                  AI가 답변 생성 중...
                </div>
              )}

            </div>

            <div className="flex gap-2 mt-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 bg-gray-100 border rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className={`px-4 rounded-lg text-sm text-white ${isLoading ? "bg-gray-400" : "bg-blue-600"
                  }`}
              >
                {isLoading ? "답변중..." : "질문"}
              </button>
            </div>

          </section>
        </div>

      </div>
    </div>
  );
}