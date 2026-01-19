import { useState, useRef } from 'react'
import { Upload, File, X, Check, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import api from '@/lib/api/axios'
import { toast } from 'sonner'
import type { EmployeeDocument } from '../../api/onboardingApi'

interface DocumentUploadProps {
  onUploadSuccess?: (document: EmployeeDocument) => void
}

const DOCUMENT_TYPES = [
  { value: 'ID_PROOF', label: 'ID Proof (Aadhar/PAN/Passport)' },
  { value: 'ADDRESS_PROOF', label: 'Address Proof' },
  { value: 'EDUCATION', label: 'Education Certificate' },
  { value: 'EXPERIENCE', label: 'Experience Letter' },
  { value: 'BANK_DETAILS', label: 'Bank Account Details' },
  { value: 'PHOTO', label: 'Passport Photo' },
  { value: 'OFFER_LETTER', label: 'Offer Letter (Signed)' },
  { value: 'RELIEVING', label: 'Relieving Letter' },
  { value: 'SALARY_SLIP', label: 'Salary Slips' },
  { value: 'OTHER', label: 'Other' },
]

export function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>('')
  const [isMandatory, setIsMandatory] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast.error('Please select a file and document type')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('documentType', documentType)
      formData.append('isMandatory', String(isMandatory))

      const response = await api.post<{ status: string; data: EmployeeDocument }>(
        '/onboarding/documents/upload-file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      toast.success('Document uploaded successfully!')

      // Reset form
      setSelectedFile(null)
      setDocumentType('')
      setIsMandatory(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(response.data.data)
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="documentType">Document Type *</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger id="documentType">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Upload Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center
            transition-colors cursor-pointer
            ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
            ${selectedFile ? 'bg-gray-50' : 'hover:bg-gray-50'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />

          {selectedFile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <File className="h-12 w-12 text-primary" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-900">
                  Drop your file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mandatory Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isMandatory"
            checked={isMandatory}
            onChange={(e) => setIsMandatory(e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isMandatory" className="cursor-pointer">
            Mark as mandatory document
          </Label>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !documentType || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Upload Guidelines:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Upload clear, legible copies of documents</li>
              <li>Ensure all pages are included for multi-page documents</li>
              <li>Documents will be verified by HR team</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
