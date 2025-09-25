
'use client';

import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { askFinancialAnalyst } from '@/ai/flows/financial-analyst-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const questions = [
    { 
        category: "Sales & Receivables",
        items: [
            "What are my total sales?",
            "List all overdue invoices.",
            "Who are my top 5 customers by sales volume?", // This will require the AI to infer from sample data.
        ]
    },
    {
        category: "Purchases & Payables",
        items: [
            "What are my total purchases?",
            "Show me my current expenses by category.",
        ]
    },
    {
        category: "Profitability",
        items: [
            "What is my gross profit margin?", // This will require the AI to calculate.
            "Summarize the company's overall financial health.",
        ]
    }
];

export function FinancialChatbot() {
    const [answer, setAnswer] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);

    const handleAskQuestion = useCallback(async (question: string) => {
        setCurrentQuestion(question);
        setIsLoading(true);
        setAnswer(null);

        try {
            const response = await askFinancialAnalyst(question);
            if (response) {
                 setAnswer(response.text);
            } else {
                setAnswer("Sorry, I couldn't get an answer for that. Please try again.");
            }
        } catch (error) {
            console.error("Error asking financial analyst:", error);
            setAnswer("An error occurred while fetching the answer. The AI model might be temporarily unavailable.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="size-6 text-primary" />
                    Ask Your AI Financial Analyst
                </CardTitle>
                <CardDescription>
                    Get quick insights into your financial data by selecting one of the questions below.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {questions.map((category) => (
                    <div key={category.category}>
                        <h4 className="font-semibold mb-2">{category.category}</h4>
                        <div className="flex flex-wrap gap-2">
                            {category.items.map((question) => (
                                <Button
                                    key={question}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAskQuestion(question)}
                                    disabled={isLoading}
                                >
                                    {question}
                                </Button>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
            {(isLoading || answer) && (
                <CardFooter>
                    <div className="w-full space-y-4">
                        {isLoading && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="animate-spin" />
                                <span>Asking for: "{currentQuestion}"...</span>
                            </div>
                        )}
                        {answer && (
                            <Alert>
                                <Sparkles className="h-4 w-4" />
                                <AlertTitle>AI Response</AlertTitle>
                                <AlertDescription className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                                    {answer}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
