"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { JsonViewer } from "@textea/json-viewer";
import { GeistMono } from "geist/font/mono";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const geistMono = GeistMono;

interface SavedJson {
  filename: string;
  timestamp: string;
}

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [isValidJson, setIsValidJson] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [savedFiles, setSavedFiles] = useState<SavedJson[]>([]);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!jsonInput) {
      setParsedJson(null);
      setIsValidJson(true);
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      setParsedJson(parsed);
      setIsValidJson(true);
    } catch (error) {
      setIsValidJson(false);
      setParsedJson(null);
    }
  }, [jsonInput]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(parsedJson, null, 2));
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
const [customFilename, setCustomFilename] = useState("");

const saveToFile = async (customName?: string) => {
    if (!parsedJson) return;
    
    try {
      const response = await fetch('/api/save-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: parsedJson,
          filename: customName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save JSON');
      }

      setSaveFeedback(true);
      setTimeout(() => setSaveFeedback(false), 2000);
      // Refresh the list of saved files when a new file is saved
      fetchSavedFiles();
    } catch (error) {
      console.error('Error saving JSON:', error);
    }
  };

  const fetchSavedFiles = async () => {
    try {
      const response = await fetch('/api/list-json');
      if (!response.ok) {
        throw new Error('Failed to fetch saved files');
      }
      const data = await response.json();
      setSavedFiles(data.files);
    } catch (error) {
      console.error('Error fetching saved files:', error);
    }
  };

  const restoreJson = async (filename: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/restore-json?filename=${filename}`);
      if (!response.ok) {
        throw new Error('Failed to restore JSON');
      }
      const data = await response.json();
      setJsonInput(JSON.stringify(data.content, null, 2));
      setIsRestoreDialogOpen(false);
    } catch (error) {
      console.error('Error restoring JSON:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isRestoreDialogOpen) {
      fetchSavedFiles();
    }
  }, [isRestoreDialogOpen]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900">
      <header className="relative border-b border-gray-200/50 p-4 pb-6 backdrop-blur-sm bg-white/30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-x"></div>
        <div className="relative z-10">
          <br />
          <h1 className="text-3xl font-bold text-gray-900">JSON Manager</h1>
          <p className="text-gray-600 mt-2">Store, format and visualize your JSON</p>
          <div className="flex items-center gap-3 mt-4">
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white/50 hover:bg-white/80 transition-colors duration-200"
                  disabled={!parsedJson}
                >
                  {saveFeedback ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Saved!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                      Save
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Save JSON</DialogTitle>
                  <DialogDescription>
                    Enter a custom filename or leave blank to use default naming.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Textarea
                      id="filename"
                      className="col-span-4"
                      value={customFilename}
                      onChange={(e) => setCustomFilename(e.target.value)}
                      placeholder="Enter custom filename (optional)"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    saveToFile(customFilename);
                    setIsSaveDialogOpen(false);
                    setCustomFilename("");
                  }}>
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              className="bg-white/50 hover:bg-white/80 transition-colors duration-200"
              onClick={copyToClipboard}
            >
              {copyFeedback ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white/50 hover:bg-white/80 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Restore
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[80vh] bg-white/95 backdrop-blur-sm border-gray-200/50">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold flex items-center gap-3 pb-4 border-b">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                    Restore JSON
                  </DialogTitle>
                </DialogHeader>
                <div className="py-6">
                  {savedFiles.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-6 text-gray-400"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                      <p className="text-lg">No saved files found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-4">
                      {savedFiles.map((file) => (
                        <Button
                          key={file.filename}
                          variant="outline"
                          className={`w-full justify-start font-mono text-sm p-6 hover:bg-gray-50 hover:border-blue-200 hover:shadow-md transition-all duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => restoreJson(file.filename)}
                          disabled={isLoading}
                        >
                          <div className="flex items-center gap-4 w-full">
                            <div className="flex-shrink-0">
                              <div className="p-2.5 bg-blue-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                              <div className="text-sm text-gray-600 truncate w-full font-medium">{file.filename}</div>
                              <div className="text-xs text-gray-400">{new Date(file.timestamp).toLocaleString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                              })}</div>
                            </div>
                            {isLoading ? (
                              <div className="flex-shrink-0">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : (
                              <div className="flex-shrink-0 text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                              </div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1800px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Card className="bg-white border-gray-200 shadow-lg rounded-lg h-[calc(100vh-16rem)] flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 bg-white">
              <CardTitle className="text-xl font-semibold text-gray-900">JSON Editor</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-auto">
              <Textarea
                className={`${geistMono.className} h-full w-full bg-white border-gray-200 text-gray-900 placeholder-gray-400 text-sm leading-relaxed focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-300 rounded-lg`}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your JSON here..."
                spellCheck="false"
              />
              {!isValidJson && jsonInput && (
                <p className="text-red-400 mt-3 flex items-center gap-2 bg-red-950/20 p-3 rounded-lg border border-red-500/20">
                  <span className="inline-block w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                  Invalid JSON format
                </p>
              )}
            </CardContent>
          </Card>

          <div className="h-[calc(100vh-16rem)]">
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-lg h-full flex flex-col">
              <div className="flex flex-col flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 ml-2 bg-white rounded text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                      json
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className={`${geistMono.className} h-[calc(100vh-20rem)] bg-white rounded-lg overflow-auto text-base leading-relaxed shadow-inner border border-gray-200 relative`}>
                  <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-gray-200 flex flex-col items-center py-6 bg-gray-50">
                    {parsedJson && Array.from({ length: JSON.stringify(parsedJson, null, 2).split('\n').length }).map((_, i) => (
                      <div key={i} className="text-gray-600 text-xs w-full text-center py-[2.5px]">{i + 1}</div>
                    ))}
                  </div>
                  <div className="pl-12 p-6 text-base">
                    {parsedJson ? (
                      <JsonViewer 
                        value={parsedJson}
                        theme={{
                          base00: "#FFFFFF",
                          base01: "#F3F4F6",
                          base02: "#E5E7EB",
                          base03: "#D1D5DB",
                          base04: "#6B7280",
                          base05: "#4B5563",
                          base06: "#374151",
                          base07: "#1F2937",
                          base08: "#DC2626",
                          base09: "#2563EB",
                          base0A: "#D97706",
                          base0B: "#059669",
                          base0C: "#7C3AED",
                          base0D: "#2563EB",
                          base0E: "#DC2626",
                          base0F: "#EA580C"
                        }}
                        displayDataTypes={false}
                        enableClipboard={false}
                        rootName={false}
                      />
                    ) : (
                      <p className="text-purple-400/50 text-center py-8">Formatted JSON will appear here...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
