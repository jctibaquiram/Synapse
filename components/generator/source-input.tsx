"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { FileText, Link2, Type, Upload, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/providers/language-provider"
import type { SourceData } from "@/lib/ai"

type Props = {
  value: SourceData | null
  onChange: (value: SourceData | null) => void
}

export function SourceInput({ value, onChange }: Props) {
  const { t } = useLanguage()
  const [tab, setTab] = useState<"text" | "pdf" | "url">(value?.type ?? "text")
  const [text, setText] = useState(value?.type === "text" ? value.text : "")
  const [url, setUrl] = useState(value?.type === "url" ? value.url : "")
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleTextChange(v: string) {
    setText(v)
    onChange(v.trim().length > 0 ? { type: "text", text: v } : null)
  }

  function handleUrlChange(v: string) {
    setUrl(v)
    onChange(v.trim().length > 0 ? { type: "url", url: v } : null)
  }

  function handleFile(f: File | null) {
    setFile(f)
    if (f) onChange({ type: "pdf", fileName: f.name, size: f.size })
    else onChange(null)
  }

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => {
        setTab(v as typeof tab)
        if (v === "text") onChange(text ? { type: "text", text } : null)
        else if (v === "url") onChange(url ? { type: "url", url } : null)
        else if (v === "pdf" && file) onChange({ type: "pdf", fileName: file.name, size: file.size })
        else onChange(null)
      }}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 rounded-xl bg-white/5 ring-1 ring-white/10">
        <TabsTrigger value="text" className="gap-2 rounded-lg data-[state=active]:bg-white/10">
          <Type className="h-4 w-4" />
          <span className="hidden sm:inline">{t.generator.tabText}</span>
        </TabsTrigger>
        <TabsTrigger value="pdf" className="gap-2 rounded-lg data-[state=active]:bg-white/10">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">{t.generator.tabPdf}</span>
        </TabsTrigger>
        <TabsTrigger value="url" className="gap-2 rounded-lg data-[state=active]:bg-white/10">
          <Link2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t.generator.tabUrl}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="text" className="mt-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={t.generator.placeholderText}
            className="min-h-[220px] resize-y rounded-xl bg-white/5 font-mono text-sm leading-relaxed ring-1 ring-white/10"
          />
          <div className="mt-1.5 flex justify-end text-[11px] tabular-nums text-muted-foreground">
            {text.length.toLocaleString()} {t.generator.chars}
          </div>
        </motion.div>
      </TabsContent>

      <TabsContent value="pdf" className="mt-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const f = e.dataTransfer.files[0]
            if (f) handleFile(f)
          }}
          onClick={() => fileRef.current?.click()}
          className={cn(
            "flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center transition-colors",
            dragging && "border-primary bg-primary/10",
          )}
        >
          <motion.div
            animate={dragging ? { scale: 1.15 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-pink/20 ring-1 ring-primary/30"
          >
            <Upload className="h-5 w-5 text-primary" />
          </motion.div>
          {file ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 text-sm ring-1 ring-white/10"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs">{file.name}</span>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleFile(null)
                }}
                className="ml-1 rounded p-0.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                aria-label={t.generator.removeFile}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ) : (
            <>
              <p className="text-sm font-medium">{t.generator.dropzoneTitle}</p>
              <p className="text-xs text-muted-foreground">{t.generator.dropzoneHint}</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </motion.div>
      </TabsContent>

      <TabsContent value="url" className="mt-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <InputGroup className="rounded-xl bg-white/5 ring-1 ring-white/10">
            <InputGroupAddon>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={t.generator.placeholderUrl}
            />
          </InputGroup>
          <p className="mt-2 text-xs text-muted-foreground">{t.generator.urlHelper}</p>
        </motion.div>
      </TabsContent>
    </Tabs>
  )
}
