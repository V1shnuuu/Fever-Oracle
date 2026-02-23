import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Activity, BrainCircuit } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot' | 'system';
    timestamp: Date;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I am the Oracle AI. I analyze real-time epidemiological feeds and predictive models. How can I assist your surveillance today?',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking, isOpen]);

    const generateAILogic = (input: string) => {
        const lower = input.toLowerCase();
        if (lower.includes('india') || lower.includes('delhi') || lower.includes('mumbai')) {
            return "Analyzing subcontinent data matrices... I detect a 14% elevation in risk probabilities around the Delhi NCR region, correlating heavily with recent fluctuations in localized wastewater samples and increased pharmacy OTC sales for antipyretics.";
        }
        if (lower.includes('fever') || lower.includes('ill') || lower.includes('risk')) {
            return "Cross-referencing symptomatic reports with our GRU-based risk trajectories... Our ensemble model suggests that individuals in high-density urban zones are currently at a 0.82 probability threshold for fever onset within the next 72 hours.";
        }
        if (lower.includes('predict') || lower.includes('future') || lower.includes('forecast')) {
            return "Running localized predictive simulations utilizing LightGBM... The 14-day forecast indicates a downward trend in active cases for the southern regions, while northern regions remain highly volatile. I recommend elevating alert status for northern surveillance nodes.";
        }
        if (lower.includes('hello') || lower.includes('hi')) {
            return "Greetings. The neural net is fully operational and ingesting data at 1.2M events/sec. What parameters would you like to investigate?";
        }

        return "Consolidating multi-modal signals... The requested parameters yield a complex correlation pattern. My sub-routines indicate maintaining current monitoring protocols until the federated learning nodes complete the next gradient sync in 4 hours.";
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isThinking) return;

        const userText = inputValue;
        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, newUserMsg]);
        setInputValue('');
        setIsThinking(true);

        // Simulate "High Level Thinking" delay based on complexity
        const thinkingTime = Math.floor(Math.random() * 1500) + 1500; // 1.5s to 3s

        setTimeout(() => {
            const response = generateAILogic(userText);
            const newBotMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: response,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, newBotMsg]);
            setIsThinking(false);
        }, thinkingTime);
    };

    return (
        <>
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center p-0"
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}

            {isOpen && (
                <Card className="fixed bottom-6 right-6 w-80 sm:w-[400px] h-[550px] shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-5">
                    <CardHeader className="bg-primary text-primary-foreground flex flex-row items-center justify-between py-3 rounded-t-xl">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5" />
                            <div>
                                <CardTitle className="text-base font-medium">Oracle AI Core</CardTitle>
                                <div className="text-[10px] opacity-80 flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                                    Models Synchronized
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary-foreground hover:bg-primary/90 hover:text-white h-8 w-8 -mr-2"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden bg-muted/10">
                        <ScrollArea className="h-full px-4 py-4" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${message.sender === 'user'
                                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                                    : 'bg-card border rounded-bl-sm text-foreground'
                                                }`}
                                        >
                                            <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                            <div className={`text-[10px] mt-1.5 ${message.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {isThinking && (
                                    <div className="flex justify-start animate-in fade-in">
                                        <div className="bg-card border rounded-2xl rounded-bl-sm px-4 py-3 text-sm shadow-sm flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-primary animate-pulse" />
                                            <span className="text-muted-foreground animate-pulse text-xs font-medium">Processing multi-modal signals...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 border-t bg-card rounded-b-xl">
                        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                            <Input
                                placeholder="Query the Oracle..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="flex-1 bg-muted/50 border-muted focus-visible:ring-primary/50"
                                disabled={isThinking}
                            />
                            <Button type="submit" size="icon" disabled={!inputValue.trim() || isThinking} className="transition-all hover:scale-105 active:scale-95">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </>
    );
}
