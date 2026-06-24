'use client'

import { AnimateIn } from '@/components/animate-in'
import { AppBackground } from '@/components/app-background'
import { AdminSettingsModal } from '@/components/admin-settings-modal'
import { AdminHeader } from '@/components/admin/admin-header'
import { DownloadExcelTemplateButton } from '@/components/export-questions-button'
import { QuestionBuilder } from '@/components/question-builder'
import { StorageRecoveryNotice } from '@/components/storage-recovery-notice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useAdminImport } from '@/hooks/use-admin-import'
import { Round } from '@/types/game'
import { MonitorIcon, SettingsIcon, UploadCloudIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type AdminImportViewProps = {
  onImport: (rounds: Round[]) => void
}

export function AdminImportView({ onImport }: AdminImportViewProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const {
    jsonInput,
    setJsonInput,
    error,
    dragActive,
    importHover,
    setImportHover,
    fileInputRef,
    handleImport,
    handleFileImport,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleLoadSample,
    handleBuilderSubmit,
  } = useAdminImport({ gameState: null, onImport })

  return (
    <AppBackground className='flex flex-col text-slate-800'>
      <div className='flex-1 p-4 pb-44 md:p-6 md:pb-40'>
        <div className='mx-auto w-5/6 lg:w-2/3 space-y-4'>
          <StorageRecoveryNotice />
          <AnimateIn className='w-full'>
            <AdminHeader
              actions={
                <>
                  <Button
                    onClick={() => setSettingsOpen(true)}
                    variant='outline'
                    className='border-slate-200 transition-all duration-200 hover:scale-105 hover:border-amber-300 hover:shadow-sm active:scale-100'
                  >
                    <SettingsIcon />
                    Settings
                  </Button>
                  <Button
                    nativeButton={false}
                    render={
                      <Link
                        href='/game-view'
                        target='_blank'
                        rel='noopener noreferrer'
                      />
                    }
                    variant='outline'
                    className='border-slate-200 transition-all duration-200 hover:scale-105 hover:border-amber-300 hover:shadow-sm active:scale-100'
                  >
                    <MonitorIcon />
                    Game View
                  </Button>
                </>
              }
            />
          </AnimateIn>

          <AnimateIn delay={80}>
            <Card className='overflow-hidden border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-amber-200/60 hover:shadow-md'>
              <CardHeader className='border-b border-slate-100 bg-slate-50/50'>
                <CardTitle className='text-slate-800'>Import questions</CardTitle>
                <p className='text-sm font-normal text-slate-500'>
                  Start with the Excel template, or import JSON if you prefer.
                </p>
              </CardHeader>
              <CardContent className='space-y-4 p-4 md:p-6'>
                <div className='flex flex-col gap-3 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-slate-800'>
                      Use Excel or Google Sheets
                    </p>
                    <p className='text-sm text-slate-600'>
                      Download the template, add your questions and answers, then
                      upload the file below.
                    </p>
                  </div>
                  <DownloadExcelTemplateButton className='shrink-0 border-amber-300 bg-white hover:bg-amber-50' />
                </div>

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
                    dragActive
                      ? 'scale-[1.02] border-amber-400 bg-amber-50 shadow-lg shadow-amber-500/10'
                      : 'border-slate-200 bg-slate-50/50 hover:scale-[1.01] hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                  }`}
                >
                  <UploadCloudIcon
                    className={`mx-auto mb-3 size-12 transition-transform duration-300 ${
                      dragActive
                        ? 'scale-110 text-amber-500'
                        : 'text-slate-400 hover:scale-105'
                    }`}
                  />
                  <p className='text-sm font-medium text-slate-700'>
                    Drop an Excel or JSON file here, or{' '}
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='font-semibold text-amber-600 hover:text-amber-700 underline-offset-2 hover:underline'
                    >
                      browse
                    </button>
                  </p>
                  <p className='mt-1 text-xs text-slate-400'>
                    Supports .xlsx and .json files
                  </p>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.xlsx,.xls,.json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/json'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileImport(file)
                    }}
                    className='hidden'
                  />
                </div>

                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-slate-200' />
                  </div>
                  <div className='relative flex justify-center text-xs'>
                    <span className='bg-white px-3 text-slate-400 uppercase tracking-wider'>
                      or paste JSON (advanced)
                    </span>
                  </div>
                </div>

                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`{\n  "rounds": [\n    {\n      "question": "Your question here",\n      "answers": [\n        { "text": "Answer 1", "points": 30 },\n        { "text": "Answer 2", "points": 20 }\n      ]\n    }\n  ]\n}`}
                  className='min-h-[220px] font-mono text-sm bg-slate-50 border-slate-200 transition-all duration-200 focus-visible:border-amber-400 focus-visible:ring-amber-400/20 focus-visible:shadow-md'
                />
                {error && (
                  <p className='animate-card-enter rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>
                    {error}
                  </p>
                )}

                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-slate-200' />
                  </div>
                  <div className='relative flex justify-center text-xs'>
                    <span className='bg-white px-3 text-slate-400 uppercase tracking-wider'>
                      or build your own
                    </span>
                  </div>
                </div>

                <QuestionBuilder onSubmit={handleBuilderSubmit} />
              </CardContent>
            </Card>
          </AnimateIn>
        </div>
      </div>

      <AdminSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      <div className='fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200/80 bg-white/95 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-sm'>
        <div className='mx-auto w-5/6 lg:w-2/3 space-y-2'>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <button
              type='button'
              onClick={handleImport}
              onMouseEnter={() => setImportHover(true)}
              onMouseLeave={() => setImportHover(false)}
              className='group relative h-11 flex-1 overflow-hidden rounded-lg bg-slate-800 text-base font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:bg-slate-900 hover:shadow-lg hover:shadow-amber-500/20 active:scale-100'
            >
              <span
                className={`absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/25 to-amber-500/0 transition-transform duration-500 ${
                  importHover ? 'translate-x-full' : '-translate-x-full'
                }`}
              />
              <span className='relative'>Import &amp; review</span>
            </button>
            <Button
              onClick={handleLoadSample}
              variant='outline'
              className='h-11 border-slate-200 transition-all duration-200 hover:scale-[1.02] hover:border-amber-300 active:scale-100 sm:min-w-[9rem]'
            >
              Load sample
            </Button>
          </div>
          <p className='text-center text-xs text-slate-400'>
            Press{' '}
            <kbd className='rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-slate-600 shadow-sm'>
              Ctrl
            </kbd>
            {' + '}
            <kbd className='rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-slate-600 shadow-sm'>
              Enter
            </kbd>{' '}
            to import
          </p>
        </div>
      </div>
    </AppBackground>
  )
}
