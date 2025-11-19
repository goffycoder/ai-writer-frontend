"use client";

import React, { useState } from "react";
import { Loader2, Copy, Check, RefreshCw, FileText, Link as LinkIcon } from "lucide-react";

export default function Home() {
  // State
  const [inputType, setInputType] = useState<"text" | "url">("text");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // API Configuration
  const API_BASE = "http://127.0.0.1:5000";

  // Helper to handle API calls
  const handleAction = async (action: "paraphrase" | "summarize") => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      let endpoint = "";
      let body = {};

      // Determine Endpoint based on Input Type & Action
      if (inputType === "text") {
        endpoint = action === "paraphrase" ? "/paraphrase" : "/summarize";
        body = { data: { text: inputText } };
      } else {
        endpoint = action === "paraphrase" ? "/scrape_and_paraphrase" : "/scrape_and_summary";
        body = { url: inputText };
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        // Map backend response fields to our result state
        // Backend returns different keys: 'processedData', 'summary', 'processedSummary'
        const output = data.processedData || data.summary || data.processedSummary || data.original;
        setResult(output);
      }
    } catch (err) {
      setError("Failed to connect to the server. Is Flask running?");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center py-12 px-4">
      
      {/* Header */}
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          AI Writing Assistant
        </h1>
        <p className="text-lg text-slate-600">
          Paraphrase text or summarize articles in seconds.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/50">
          <button
            onClick={() => setInputType("text")}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors
              ${inputType === "text" ? "bg-white border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            <FileText className="w-4 h-4" /> Paste Text
          </button>
          <button
            onClick={() => setInputType("url")}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors
              ${inputType === "url" ? "bg-white border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            <LinkIcon className="w-4 h-4" /> Web Article URL
          </button>
        </div>

        <div className="p-6 grid gap-8 md:grid-cols-2">
          
          {/* LEFT COLUMN: INPUT */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              {inputType === "text" ? "Input Text" : "Article URL"}
            </label>
            
            {inputType === "text" ? (
              <textarea
                className="w-full h-64 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-50"
                placeholder="Paste your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            ) : (
              <input
                type="url"
                className="w-full p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                placeholder="https://example.com/article"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleAction("paraphrase")}
                disabled={loading || !inputText}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                Paraphrase
              </button>
              <button
                onClick={() => handleAction("summarize")}
                disabled={loading || !inputText}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <FileText className="w-4 h-4" />}
                Summarize
              </button>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
          </div>

          {/* RIGHT COLUMN: OUTPUT */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700">AI Output</label>
              {result && (
                <button 
                  onClick={copyToClipboard}
                  className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            
            <div className="w-full h-64 md:h-[calc(100%-2rem)] p-4 rounded-lg border border-slate-200 bg-slate-50 overflow-y-auto">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-sm">Processing content...</p>
                </div>
              ) : result ? (
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{result}</p>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                  Output will appear here...
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}