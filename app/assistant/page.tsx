'use client';

/**
 * "Living Kitchen Brain" — full-page AI assistant.
 * Reuses the working /api/chat plain-text streaming contract (same as
 * AIChatWidget) and feeds it real inventory + household context.
 */
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useInventory } from '@/lib/hooks/useInventory';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { useAppMode } from '@/lib/hooks/useAppMode';
import { useCountry } from '@/lib/hooks/useCountry';
import { track } from '@/lib/analytics';
import { aiPreviewPrompts } from '@/lib/marketing';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items: inventory } = useInventory();
  const { currentHousehold } = useHousehold();
  const { isBusiness } = useAppMode();
  const { country } = useCountry();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const buildInventoryContext = () =>
    inventory.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      location: item.location || 'pantry',
      daysUntilExpiry: item.expiryDate
        ? Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null,
    }));

  const householdContext = {
    isBusiness,
    size: currentHousehold?.members?.length || 1,
    dietaryRestrictions: currentHousehold?.settings?.dietaryProfile || 'None',
    country: {
      name: country.name,
      currency: country.currency,
      currencySymbol: country.currencySymbol,
      units: country.units,
      cuisines: country.cuisines,
    },
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setError(null);
    const userMessage: ChatMessage = { id: `${Date.now()}-u`, role: 'user', content: trimmed };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setIsLoading(true);
    track('ai_chat_used');

    const assistantId = `${Date.now()}-a`;
    let started = false;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          inventoryContext: buildInventoryContext(),
          householdContext,
        }),
      });
      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        if (!started) {
          started = true;
          setMessages((p) => [...p, { id: assistantId, role: 'assistant', content: acc }]);
        } else {
          setMessages((p) => p.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)));
        }
      }
      if (!started) throw new Error('Empty response');
    } catch (err) {
      console.error('[assistant]', err);
      setError('Connection error. Check your AI key (GOOGLE_GENERATIVE_AI_API_KEY) or network.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[100dvh] max-w-3xl flex-col px-4 pb-24 pt-6 sm:pb-6">
      <header className="mb-4 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-md">
          <SparklesIcon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Living Kitchen Brain</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ask what to cook, what’s expiring, what to buy, and how to save.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="max-w-sm text-gray-500 dark:text-gray-400">
              I analyze your pantry, budget and family tastes to help you save money and waste less. Try one:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {aiPreviewPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:border-primary-400 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-none bg-primary-600 text-white'
                      : 'rounded-bl-none border border-gray-100 bg-white text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-1.5 rounded-2xl rounded-bl-none border border-gray-100 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.15s' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
            {error && <div className="rounded-lg bg-red-100 p-3 text-center text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</div>}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your kitchen anything…"
          disabled={isLoading}
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <motion.button
          type="submit"
          disabled={isLoading || !input.trim()}
          whileTap={{ scale: 0.95 }}
          className="rounded-xl bg-primary-600 p-3 text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          aria-label="Send"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </motion.button>
      </form>
    </div>
  );
}
