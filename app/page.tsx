"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Send, Sparkles, RotateCcw, X, Upload, Image as ImageIcon } from "lucide-react"
import { useDropzone } from "react-dropzone"

export default function Component() {
  const [input, setInput] = useState("")
  const [latex, setLatex] = useState("\\int_{0}^{\\infty} x^2 dx")
  const [image, setImage] = useState<File | null>(null)
  const [isMounted, setIsMounted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImage(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {'image/*': []},
    maxFiles: 1
  })

  const processInput = async () => {
    if (!input) return;
    
    setIsLoading(true);
    try {
      // Create new thread if we don't have one
      if (!threadId) {
        const threadResponse = await fetch("https://retune.so/api/chat/11ef9c89-c2af-abc0-a3c6-c11db46091fd/new-thread", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Workspace-API-Key': '11ee4071-239b-0c70-8690-bba825ed91b5'
          }
        });
        
        const { threadId: newThreadId } = await threadResponse.json();
        setThreadId(newThreadId);
      }
      
      // Send the prompt
      const prompt = `translate the below to LaTeX without any additional context at all (your response will be parsed in its entirety as LaTeX, so only include the final equation):\n\n${input}`;
      
      const response = await fetch("https://retune.so/api/chat/11ef9c89-c2af-abc0-a3c6-c11db46091fd/response", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Workspace-API-Key': '11ee4071-239b-0c70-8690-bba825ed91b5'
        },
        body: JSON.stringify({
          threadId: threadId,
          input: prompt
        })
      });
      
      const { response: latexResponse } = await response.json();
      setLatex(latexResponse);
      
    } catch (error) {
      console.error('Error processing input:', error);
      // You might want to add error state handling here
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    processInput();
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6">
      <div className="mb-4 flex items-center gap-2 text-white/80">
        <Sparkles className="h-5 w-5 text-purple-400" />
        <span className="text-lg font-medium">MathFlow</span>
      </div>
      
      {isMounted && (
        <ResizablePanelGroup 
          direction="vertical" 
          className="min-h-[calc(100vh-5rem)] overflow-hidden rounded-xl border border-white/10 bg-[#222]"
        >
          <ResizablePanel defaultSize={60}>
            <Card className="h-full rounded-none border-0 bg-transparent">
              <div className="flex h-full flex-col gap-4 p-6">
                <div className="rounded-lg bg-purple-50/5 p-4">
                  <div className="mb-2 text-sm text-purple-200/80">LaTeX Output</div>
                  <code className="block font-mono text-sm text-purple-100/90">
                    {latex}
                  </code>
                </div>
                
                <div className="flex-1 rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 text-sm text-purple-200/80">Preview</div>
                  <div className="h-full text-white/70">
                    Preview will appear here
                  </div>
                </div>
              </div>
            </Card>
          </ResizablePanel>
          
          <ResizablePanel defaultSize={40}>
            <Card className="h-full rounded-none border-0 bg-transparent">
              <div className="flex h-full flex-col gap-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your equation in natural language (e.g. 'integral of x squared from 0 to infinity')"
                    className="resize-none border-white/10 bg-white/5 text-white/90 placeholder:text-white/40"
                  />
                  <div 
                    {...getRootProps()} 
                    className={`flex items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
                      isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <Upload className="h-6 w-6 text-purple-500" />
                    <span className="ml-2 text-purple-500">Upload Image</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                    onClick={() => {
                      setInput("")
                      setImage(null)
                    }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4 opacity-80" />
                    Reset
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-purple-500 text-white hover:bg-purple-600"
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        Convert to LaTeX
                        <Sparkles className="ml-2 h-4 w-4 opacity-80" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  )
}