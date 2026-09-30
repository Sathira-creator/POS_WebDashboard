import React, { useState } from 'react';
import axios from 'axios';

export default function ChatbotView() {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hello! I am your MerchGrid AI assistant. How can I help you with your inventory or sales today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input;
        setInput('');
        setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
        setLoading(true);

        try {
            // Replace with your actual backend endpoint URL if hosted elsewhere
            const response = await axios.post('http://localhost:4000/api/chat', { prompt: userMessage });
            setMessages((prev) => [...prev, { sender: 'bot', text: response.data.reply }]);
        } catch (error) {
            console.error('Error connecting to chatbot backend:', error);
            setMessages((prev) => [
                ...prev,
                { sender: 'bot', text: 'Sorry, something went wrong connecting to the AI server.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[75vh] max-w-4xl mx-auto bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden border border-slate-800 mt-6">
            {/* Header */}
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 font-semibold text-lg flex items-center justify-between">
                <span>MerchGrid AI Assistant</span>
                <span className="text-xs bg-blue-600 px-2.5 py-1 rounded-full">Gemini Powered</span>
            </div>

            {/* Message List Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[70%] px-4 py-3 rounded-xl text-sm leading-relaxed ${msg.sender === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                                }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 text-slate-400 px-4 py-3 rounded-xl text-sm italic border border-slate-700">
                            AI is thinking...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about inventory, products, or sales..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-3 rounded-xl font-medium text-sm transition"
                >
                    Send
                </button>
            </form>
        </div>
    );
}