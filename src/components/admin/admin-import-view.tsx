'use client'

import { AnimateIn } from '@/components/animate-in'
import { AppBackground } from '@/components/app-background'
import { AdminSettingsModal } from '@/components/admin-settings-modal'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  ImportMethod,
  ImportMethodPicker,
} from '@/components/admin/import-method-picker'
import { JsonFormatGuide } from '@/components/admin/json-format-guide'
import { TrySampleBanner } from '@/components/admin/try-sample-banner'
import { DownloadExcelTemplateButton } from '@/components/export-questions-button'
import { QuestionBuilder } from '@/components/question-builder'
import { SetupStepIndicator } from '@/components/setup-step-indicator'
import { StorageRecoveryNotice } from '@/components/storage-recovery-notice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminImport } from '@/hooks/use-admin-import'
import { Round } from '@/types/game'
import { SettingsIcon, UploadCloudIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type AdminImportViewProps = {
  onImport: (rounds: Round[]) => void
}

type FileUploadZoneProps = {
  dragActive: boolean
  dropLabel: string
  browseLabel: string
  hint: string
  accept: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onFileSelect: (file: File) => void
}

function FileUploadZone({
  dragActive,
  dropLabel,
  browseLabel,
  hint,
  accept,
  inputRef,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
}: FileUploadZoneProps) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
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
        {dropLabel}{' '}
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          className='font-semibold text-amber-600 hover:text-amber-700 underline-offset-2 hover:underline'
        >
          {browseLabel}
        </button>
      </p>
      <p className='mt-1 text-xs text-slate-400'>{hint}</p>
      <input
        ref={inputRef}
        type='file'
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFileSelect(file)
        }}
        className='hidden'
      />
    </div>
  )
}

export function AdminImportView({ onImport }: AdminImportViewProps) {
  const searchParams = useSearchParams()
  const trySampleTriggered = useRef(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [method, setMethod] = useState<ImportMethod>('excel')
  const {
    error,
    clearError,
    dragActive,
    excelFileInputRef,
    jsonFileInputRef,
    handleExcelFileImport,
    handleJsonFileImport,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleTrySample,
    handleBuilderSubmit,
  } = useAdminImport({ onImport })

  useEffect(() => {
    if (searchParams.get('try') !== 'sample' || trySampleTriggered.current) return
    trySampleTriggered.current = true
    handleTrySample()
  }, [searchParams, handleTrySample])

  return (
    <AppBackground className='flex flex-col text-slate-800'>
      <div className='flex-1 p-4 md:p-6'>
        <div className='mx-auto w-11/12 space-y-4 lg:w-2/3'>
          <StorageRecoveryNotice />
          <AnimateIn className='w-full'>
            <AdminHeader
              label='Host setup'
              actions={
                <Button
                  onClick={() => setSettingsOpen(true)}
                  variant='outline'
                  className='border-slate-200 transition-all duration-200 hover:scale-105 hover:border-amber-300 hover:shadow-sm active:scale-100'
                >
                  <SettingsIcon />
                  Settings
                </Button>
              }
            />
          </AnimateIn>

          <AnimateIn delay={40}>
            <SetupStepIndicator current='add' />
          </AnimateIn>

          <AnimateIn delay={80}>
            <Card className='overflow-hidden border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-amber-200/60 hover:shadow-md'>
              <CardHeader className='border-b border-slate-100 bg-slate-50/50'>
                <CardTitle className='text-slate-800'>Add your questions</CardTitle>
                <p className='text-sm font-normal text-slate-500'>
                  Choose how you&apos;d like to add your questions.
                </p>
              </CardHeader>
              <CardContent className='space-y-5 p-4 md:p-6'>
                <TrySampleBanner onTrySample={handleTrySample} />

                <ImportMethodPicker
                  value={method}
                  onChange={(next) => {
                    setMethod(next)
                    clearError()
                  }}
                />

                {method === 'excel' && (
                  <div className='space-y-4'>
                    <ol className='space-y-3 text-sm text-slate-600'>
                      <li className='flex gap-3'>
                        <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700'>
                          1
                        </span>
                        <div className='flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                          <span>Download the Excel template</span>
                          <DownloadExcelTemplateButton className='shrink-0 border-amber-300 bg-white hover:bg-amber-50' />
                        </div>
                      </li>
                      <li className='flex gap-3'>
                        <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700'>
                          2
                        </span>
                        <div className='space-y-2'>
                          <span>
                            Fill in the template with your questions and answers
                          </span>
                          <p className='text-xs text-slate-500'>
                            Each row is one answer. Don&apos;t rename the column
                            headers.
                          </p>
                          <p className='rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600'>
                            <span className='font-medium text-slate-700'>
                              Using Google Sheets?
                            </span>{' '}
                            When you&apos;re finished, download your sheet as an
                            Excel file:{' '}
                            <span className='font-medium'>
                              File → Download → Microsoft Excel (.xlsx)
                            </span>
                          </p>
                        </div>
                      </li>
                      <li className='flex gap-3'>
                        <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700'>
                          3
                        </span>
                        <span>Upload your Excel file below</span>
                      </li>
                    </ol>

                    <FileUploadZone
                      dragActive={dragActive === 'excel'}
                      dropLabel='Drop your Excel file here, or'
                      browseLabel='browse'
                      hint='Supports .xlsx files'
                      accept='.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                      inputRef={excelFileInputRef}
                      onDrop={handleDrop('excel')}
                      onDragOver={handleDragOver('excel')}
                      onDragLeave={handleDragLeave}
                      onFileSelect={handleExcelFileImport}
                    />
                  </div>
                )}

                {method === 'json' && (
                  <div className='space-y-4'>
                    <JsonFormatGuide />

                    <FileUploadZone
                      dragActive={dragActive === 'json'}
                      dropLabel='Drop your JSON file here, or'
                      browseLabel='browse'
                      hint='Supports .json files'
                      accept='.json,application/json'
                      inputRef={jsonFileInputRef}
                      onDrop={handleDrop('json')}
                      onDragOver={handleDragOver('json')}
                      onDragLeave={handleDragLeave}
                      onFileSelect={handleJsonFileImport}
                    />
                  </div>
                )}

                {method === 'build' && (
                  <QuestionBuilder onSubmit={handleBuilderSubmit} />
                )}

                {error && (
                  <p className='animate-card-enter rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>
                    {error}
                  </p>
                )}
              </CardContent>
            </Card>
          </AnimateIn>
        </div>
      </div>

      <AdminSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </AppBackground>
  )
}
