import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Download, FileText } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'
import { leadsApi } from '../api/leadsApi'

export function LeadImportPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleImport = async () => {
    if (!file) return

    setIsImporting(true)
    try {
      const result = await leadsApi.importFromExcel(file)

      alert(
        `Import Completed!\n\nSuccessfully imported ${result.successCount} leads.\n${result.errorCount} errors.`
      )

      if (result.successCount > 0) {
        navigate(ROUTES.LEADS)
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('Import Failed\n\nFailed to import leads. Please check the file format and try again.')
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = () => {
    // Create CSV template
    const csvContent = 'firstName,lastName,email,phone,company,status,priority,source,notes\nJohn,Doe,john@example.com,+1234567890,Acme Corp,NEW,HIGH,Website,Sample lead\n'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'leads_import_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(ROUTES.LEADS)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Import Leads</h1>
            <p className="text-muted-foreground mt-2">
              Bulk import leads from CSV file
            </p>
          </div>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>Follow these steps to import your leads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Download the CSV template</p>
                  <p className="text-sm text-muted-foreground">
                    Use our template to ensure your data is formatted correctly
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={downloadTemplate}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Fill in your lead data</p>
                  <p className="text-sm text-muted-foreground">
                    Add your leads to the CSV file. Required fields: firstName, lastName, email
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Upload and import</p>
                  <p className="text-sm text-muted-foreground">
                    Upload your completed CSV file below
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>Drag and drop or click to select a file</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => {
                if (!file) document.getElementById('file-upload')?.click()
              }}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <FileText className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Drop your CSV file here</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Select File
                  </Button>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTES.LEADS)}
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={isImporting}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isImporting ? 'Importing...' : 'Import Leads'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CSV Format Guide */}
        <Card>
          <CardHeader>
            <CardTitle>CSV Format Guide</CardTitle>
            <CardDescription>Supported fields and formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Required fields:</span> firstName, lastName, email
              </div>
              <div>
                <span className="font-medium">Optional fields:</span> phone, company, status, priority, source, notes
              </div>
              <div>
                <span className="font-medium">Status values:</span> NEW, CONTACTED, QUALIFIED, NEGOTIATION, WON, LOST
              </div>
              <div>
                <span className="font-medium">Priority values:</span> LOW, MEDIUM, HIGH
              </div>
              <div>
                <span className="font-medium">Source examples:</span> Website, Referral, Cold Call, Email Campaign, Social Media
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
