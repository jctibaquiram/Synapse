"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field"
import { useLanguage } from "@/components/providers/language-provider"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function NewDeckDialog() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    // TODO: await supabase.from("decks").insert({ title, description, user_id: user.id })
    toast.success(t.generator.cardsGenerated)
    setTitle("")
    setDescription("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={cn(
            "h-10 gap-1.5 rounded-xl px-4 text-sm font-semibold",
            "syn-btn-primary",
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          {t.dashboard.newDeck}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl border-white/10 bg-popover/95 p-0 backdrop-blur-xl">
        <DialogHeader className="px-6 pb-2 pt-6">
          <DialogTitle className="font-display text-xl font-semibold tracking-tight">
            {t.dashboard.newDeck}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t.generator.subtitle}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="px-6 pb-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="deck-title" className="text-xs font-medium">
                Title
              </FieldLabel>
              <Input
                id="deck-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Neuroscience 101"
                autoFocus
                required
                className="h-10 rounded-xl border-white/10 bg-white/[0.03]"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="deck-desc" className="text-xs font-medium">
                Description
              </FieldLabel>
              <Textarea
                id="deck-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What you will master with this deck."
                rows={3}
                className="rounded-xl border-white/10 bg-white/[0.03]"
              />
              <FieldDescription>
                You can add cards manually or generate them with AI.
              </FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6 gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-xl bg-white/[0.03] ring-1 ring-white/10 hover:bg-white/[0.06]"
              >
                {t.generator.cancel}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className={cn(
                "h-10 rounded-xl px-5 text-sm font-semibold",
                "syn-btn-primary",
              )}
            >
              {t.generator.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
