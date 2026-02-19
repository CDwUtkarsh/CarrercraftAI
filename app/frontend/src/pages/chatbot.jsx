import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { axiosInstance } from '@/App';
import { toast } from 'sonner';
import { Bot, Send, User, Sparkles } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI career advisor. I can help you with resume tips, job search strategies, interview preparation, and career guidance. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    setLoading(true);
    try {
      const response = await axiosInstance.post('/chat', { message: userMessage });
      
      // Add AI response to chat
      setMessages([...newMessages, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to get response');
      // Add error message
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble processing your request. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto" data-testid="chatbot-page">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text flex items-center gap-3">
            <Sparkles className="h-10 w-10" />
            AI Career Advisor
          </h1>
          <p className="text-lg text-gray-600">Get personalized career guidance powered by Google Gemini AI</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              Chat with AI
            </CardTitle>
            <CardDescription>Ask about resumes, interviews, job search, or career planning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages Area */}
            <ScrollArea ref={scrollRef} className="h-[500px] pr-4" data-testid="chat-messages">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${message.role}-${index}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your career, resume, or interview prep..."
                disabled={loading}
                className="flex-1"
                data-testid="chat-input"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="send-btn"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Try asking:</span>
              {[
                "How do I improve my resume?",
                "Tips for software engineer interviews",
                "How to negotiate salary?"
              ].map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(prompt)}
                  className="text-xs"
                  data-testid={`quick-prompt-${idx}`}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="glass-card mt-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Powered by Google Gemini AI</h3>
                <p className="text-sm text-gray-600">
                  Get intelligent career advice based on industry best practices. The AI can help with resume optimization, 
                  interview strategies, skill development, and career planning.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chatbot;
