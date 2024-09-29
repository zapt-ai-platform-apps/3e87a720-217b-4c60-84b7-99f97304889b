import { createSignal, onMount, createEffect, For, Show } from 'solid-js';
import { createEvent, supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function App() {
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [loading, setLoading] = createSignal(false);
  const [reports, setReports] = createSignal([]);
  const [inputText, setInputText] = createSignal('');
  const [extractedData, setExtractedData] = createSignal(null);

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
    }
  };

  onMount(checkUserSignedIn);

  createEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });

    return () => {
      authListener.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  const fetchReports = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('User session not found. Please sign in again.');
      return;
    }
    const response = await fetch('/api/getReports', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setReports(data);
    } else {
      console.error('Error fetching reports:', response.statusText);
    }
  };

  createEffect(() => {
    if (!user()) return;
    fetchReports();
  });

  const handleAnalyzeText = async () => {
    setLoading(true);
    setExtractedData(null);
    try {
      const prompt = `
Extract the answers to the following questions from the text below:

1. What happened?
2. When did it happen?
3. Who was involved?
4. What was the outcome?
5. What are the next steps?

Provide the answers in the following JSON format:

{
  "what_happened": "...",
  "when_happened": "...",
  "who_involved": "...",
  "outcome": "...",
  "next_steps": "..."
}

Text:
"""${inputText()}"""
`;
      const result = await createEvent('chatgpt_request', {
        prompt: prompt,
        response_type: 'json'
      });
      if (result) {
        setExtractedData(result);
      } else {
        console.error('Error extracting data');
      }
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('User session not found. Please sign in again.');
        setLoading(false);
        return;
      }
      const response = await fetch('/api/saveReport', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText: inputText(),
          ...extractedData()
        }),
      });
      if (response.ok) {
        const newReport = await response.json();
        setReports([...reports(), newReport]);
        setInputText('');
        setExtractedData(null);
      } else {
        const errorResponse = await response.json();
        console.error('Error saving report:', errorResponse.error);
        alert(`Error saving report: ${errorResponse.error}`);
      }
    } catch (error) {
      console.error('Error saving report:', error);
      alert('An unexpected error occurred while saving the report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-4 text-gray-200">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-center text-green-400">Sign in with ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-300 hover:underline mb-6 block text-center"
              >
                Learn more about ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
              />
            </div>
          </div>
        }
      >
        <div class="max-w-6xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold text-green-400">Non-Conformance Reports</h1>
            <button
              class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="col-span-1">
              <h2 class="text-2xl font-bold mb-4 text-green-400">New Report</h2>
              <textarea
                class="w-full p-3 border border-gray-600 bg-gray-800 text-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent box-border"
                rows="8"
                placeholder="Describe the non-conformance event..."
                value={inputText()}
                onInput={(e) => setInputText(e.target.value)}
                disabled={loading()}
              ></textarea>
              <div class="flex space-x-4 mt-4">
                <button
                  class={`flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${loading() || !inputText() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleAnalyzeText}
                  disabled={loading() || !inputText()}
                >
                  <Show when={loading()}>Analyzing...</Show>
                  <Show when={!loading()}>Analyze Text</Show>
                </button>
                <Show when={extractedData()}>
                  <button
                    class={`flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={saveReport}
                    disabled={loading()}
                  >
                    Save Report
                  </button>
                </Show>
              </div>
              <Show when={extractedData()}>
                <div class="mt-6 bg-gray-800 p-6 rounded-lg shadow-md">
                  <h3 class="text-xl font-bold mb-4 text-green-400">Extracted Data</h3>
                  <ul class="space-y-2">
                    <li><strong>What happened:</strong> {extractedData().what_happened}</li>
                    <li><strong>When did it happen:</strong> {extractedData().when_happened}</li>
                    <li><strong>Who was involved:</strong> {extractedData().who_involved}</li>
                    <li><strong>What was the outcome:</strong> {extractedData().outcome}</li>
                    <li><strong>Next steps:</strong> {extractedData().next_steps}</li>
                  </ul>
                </div>
              </Show>
            </div>
            <div class="col-span-1">
              <h2 class="text-2xl font-bold mb-4 text-green-400">Your Reports</h2>
              <div class="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-4">
                <For each={reports()}>
                  {(report) => (
                    <div class="bg-gray-800 p-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                      <p class="mb-2"><strong>What happened:</strong> {report.whatHappened}</p>
                      <p class="mb-2"><strong>When did it happen:</strong> {report.whenHappened}</p>
                      <p class="mb-2"><strong>Who was involved:</strong> {report.whoInvolved}</p>
                      <p class="mb-2"><strong>Outcome:</strong> {report.outcome}</p>
                      <p><strong>Next steps:</strong> {report.nextSteps}</p>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default App;