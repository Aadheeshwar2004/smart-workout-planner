import { useState } from "react";
import { Sparkles, TrendingUp, MessageCircle } from "lucide-react";
import { aiAPI } from "@/services/api";
import toast from "react-hot-toast";

export default function AIAssistant() {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // For Ask AI feature
  const [showAskModal, setShowAskModal] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  // ✅ Auto recommendation (no prompt)
  const getRecommendations = async () => {
    setLoading(true);
    try {
      const { data } = await aiAPI.getRecommendations(
        "Generate personalized workout and diet recommendations"
      );
      setRecommendations(data);
      toast.success("AI recommendations generated!");
    } catch {
      toast.error("Failed to get AI recommendations");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Ask anything (custom prompt)
  const askAI = async () => {
    if (!userPrompt.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setLoading(true);
    setAiAnswer(null);

    try {
      const { data } = await aiAPI.getRecommendations(userPrompt);
      setAiAnswer(data.ai_response);
      toast.success("AI responded!");
    } catch {
      toast.error("Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Progress analysis
  const analyzeProgress = async () => {
    setLoading(true);
    try {
      const { data } = await aiAPI.analyzeProgress(30);
      setProgress(data);
      toast.success("Progress analyzed!");
    } catch {
      toast.error("Failed to analyze progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Sparkles className="text-blue-600" size={32} />
        <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
      </div>

      <p className="text-gray-600">
        Get AI-powered fitness recommendations or ask any fitness-related
        question.
      </p>

      {/* BUTTONS */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={getRecommendations}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Sparkles size={20} />
          Get AI Recommendations
        </button>

        <button
          onClick={() => setShowAskModal(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 flex items-center gap-2"
        >
          <MessageCircle size={20} />
          Ask AI Anything
        </button>

        <button
          onClick={analyzeProgress}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          <TrendingUp size={20} />
          Analyze Progress
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* AUTO AI RECOMMENDATIONS */}
      {recommendations && !loading && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold mb-4">AI Recommendations</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {recommendations.ai_response}
          </pre>
        </div>
      )}

      {/* ASK AI ANSWER */}
      {aiAnswer && !loading && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold mb-4">AI Answer</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {aiAnswer}
          </pre>
        </div>
      )}

      {/* PROGRESS */}
      {progress && !loading && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold mb-4">
            Progress Analysis ({progress.period})
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p>Total Workouts</p>
              <p className="text-2xl font-bold">{progress.total_workouts}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p>Total Minutes</p>
              <p className="text-2xl font-bold">{progress.total_minutes}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p>Calories Burned</p>
              <p className="text-2xl font-bold">
                {progress.total_calories_burned}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p>Consistency</p>
              <p className="text-2xl font-bold">
                {progress.consistency_score.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ASK AI MODAL */}
      {showAskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ask AI Anything</h2>

            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4"
              rows={4}
              placeholder="Ask your question..."
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAskModal(false);
                  setUserPrompt("");
                }}
                className="flex-1 border rounded-lg py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAskModal(false);
                  askAI();
                }}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2"
              >
                Ask AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
