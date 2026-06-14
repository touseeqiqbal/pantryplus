'use client';

import { useState, useRef, useEffect } from 'react';
import { useInventory } from '@/lib/hooks/useInventory';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { useAppMode } from '@/lib/hooks/useAppMode';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items: inventory } = useInventory();
  const { currentHousehold } = useHousehold();
  const { isBusiness } = useAppMode();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const buildInventoryContext = () =>
    inventory.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      location: item.location || 'pantry',
      daysUntilExpiry: item.expiryDate
        ? Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null
    }));

  const householdContext = {
    isBusiness,
    size: currentHousehold?.members?.length || 1,
    dietaryRestrictions: currentHousehold?.settings?.dietaryProfile || 'None'
  };

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: trimmed,
    };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setIsLoading(true);

    const assistantId = `${Date.now()}-assistant`;
    let assistantStarted = false;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          inventoryContext: buildInventoryContext(),
          householdContext,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      // Read the text stream chunk-by-chunk and progressively render the reply.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });

        if (!assistantStarted) {
          assistantStarted = true;
          setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: assistantText }]);
        } else {
          setMessages(prev =>
            prev.map(m => (m.id === assistantId ? { ...m, content: assistantText } : m))
          );
        }
      }

      if (!assistantStarted) {
        throw new Error('Empty response');
      }
    } catch (err) {
      console.error('AI Chat Widget Error:', err);
      setError('Connection error. Please check your API keys or network.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-xl z-50 flex items-center justify-center transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
      >
        <SparklesIcon className="h-6 w-6" />
      </motion.button>

      {/* Chat Window Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 sm:bottom-24 sm:right-6 sm:left-auto sm:w-[400px] h-[85vh] sm:h-[600px] max-h-screen bg-white dark:bg-gray-900 shadow-2xl sm:rounded-2xl flex flex-col z-50 overflow-hidden border border-gray-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-6 w-6 text-primary-200" />
                <h3 className="font-bold text-lg tracking-tight">PantryBrain</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/20">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                  <ChatBubbleLeftEllipsisIcon className="h-12 w-12 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 max-w-[250px]">
                    Hi! I&apos;m your **Living Kitchen Brain**. I analyze your pantry to help you save money and reduce waste.
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    Try: &quot;What should I use first?&quot; or &quot;Plan a zero-waste dinner.&quot;
                  </p>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      m.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-md border border-gray-100 dark:border-gray-700 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3 flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-lg text-center">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0">
              <form
                onSubmit={handleSubmit}
                className="flex items-end space-x-2 relative"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 transition-shadow"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl p-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <PaperAirplaneIcon className="h-5 w-5 -mt-0.5 ml-0.5 animate-pulse" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
