import React from 'react';
import ChatbotView from '../components/ChatbotView';

export default function ChatbotPage() {
    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-[#0D1B2A]">AI Assistant</h1>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Interact with your intelligent store assistant powered by Gemini.
                </p>
            </div>
            <ChatbotView />
        </div>
    );
}