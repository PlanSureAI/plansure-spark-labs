import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileWithPreview extends File {
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: "pending" | "uploading" | "success" | "error";
  uploadError?: string;
}

interface ComplianceDocumentUploadProps {
  userId: string;
  propertyId: string;
  complianceId: string;
  maxSizeMB?: number;
  onUploadComplete: (fileUrls: string[]) => void;
}

const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpeg", ".jpg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

export const ComplianceDocumentUpload = ({
  userId,
  propertyId,
  complianceId,
  maxSizeMB = 20,
  onUploadComplete,
}: ComplianceDocumentUploadProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        const reasons = fileRejections.map((rejection) => {
          const errors = rejection.errors.map((e: any) => e.message).join(", ");
          return `${rejection.file.name}: ${errors}`;
        });
        
        toast({
          title: "Some files were rejected",
          description: reasons.join("\n"),
          variant: "destructive",
        });
        return;
      }

      const filesWithPreview: FileWithPreview[] = acceptedFiles.map((file) => {
        const fileWithPreview = file as FileWithPreview;
        fileWithPreview.uploadStatus = "pending";
        fileWithPreview.uploadProgress = 0;
        
        // Create preview for images
        if (file.type.startsWith("image/")) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }
        
        return fileWithPreview;
      });

      setFiles((prev) => [...prev, ...filesWithPreview]);
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      // Revoke preview URL to prevent memory leaks
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const sanitizeFilename = (filename: string): string => {
    // Extract extension safely
    const lastDot = filename.lastIndexOf(".");
    const name = lastDot > 0 ? filename.substring(0, lastDot) : filename;
    const ext = lastDot > 0 ? filename.substring(lastDot + 1) : "";
    
    // Sanitize name - remove all special characters including periods
    const safeName = name
      .normalize("NFD") // Handle unicode
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-zA-Z0-9]/g, "_") // Replace all special chars
      .replace(/^_+|_+$/g, "") // Trim underscores
      .substring(0, 200); // Limit length
    
    // Sanitize extension - whitelist only
    const allowedExts = ["pdf", "jpg", "jpeg", "png", "webp", "docx"];
    const safeExt = allowedExts.includes(ext.toLowerCase()) ? ext.toLowerCase() : "bin";
    
    // Ensure non-empty result
    return safeName ? `${safeName}.${safeExt}` : `file_${Date.now()}.${safeExt}`;
  };

  const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    // Validate UUIDs for security
    if (!validateUUID(userId) || !validateUUID(propertyId) || !validateUUID(complianceId)) {
      toast({
        title: "Upload error",
        description: "Invalid upload parameters",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Skip already uploaded files
        if (file.uploadStatus === "success") {
          continue;
        }

        // Update status to uploading
        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[i].uploadStatus = "uploading";
          newFiles[i].uploadProgress = 0;
          return newFiles;
        });

        const timestamp = Date.now();
        const sanitizedName = sanitizeFilename(file.name);
        const fileName = `${userId}/${propertyId}/${complianceId}/${timestamp}_${sanitizedName}`;

        // Simulate progress (Supabase doesn't provide native upload progress)
        const progressInterval = setInterval(() => {
          setFiles((prev) => {
            const newFiles = [...prev];
            if (newFiles[i].uploadProgress! < 90) {
              newFiles[i].uploadProgress = newFiles[i].uploadProgress! + 10;
            }
            return newFiles;
          });
        }, 100);

        const { error: uploadError } = await supabase.storage
          .from("compliance-documents")
          .upload(fileName, file, { upsert: false });

        clearInterval(progressInterval);

        if (uploadError) {
          setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[i].uploadStatus = "error";
            newFiles[i].uploadError = uploadError.message;
            newFiles[i].uploadProgress = 0;
            return newFiles;
          });

          toast({
            title: "Upload failed",
            description: `${file.name}: ${uploadError.message}`,
            variant: "destructive",
          });
          continue;
        }

        // Update to success
        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[i].uploadStatus = "success";
          newFiles[i].uploadProgress = 100;
          return newFiles;
        });

        uploadedUrls.push(fileName);
      }

      if (uploadedUrls.length > 0) {
        toast({
          title: "Upload successful",
          description: `${uploadedUrls.length} file(s) uploaded successfully.`,
        });
        onUploadComplete(uploadedUrls);
        setFiles([]);
      }
    } catch (error: any) {
      toast({
        title: "Upload error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file: FileWithPreview) => {
    if (file.type === "application/pdf") return "📄";
    if (file.type.includes("word")) return "📝";
    if (file.type.startsWith("image/")) return "🖼️";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium mb-2">
              Drag and drop compliance documents here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <p className="text-xs text-muted-foreground">
              Accepted: PDF, JPG, PNG, WEBP, DOCX • Max {maxSizeMB}MB per file
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Selected Files ({files.length})</h4>
            <Button
              onClick={uploadFiles}
              disabled={uploading || files.every((f) => f.uploadStatus === "success")}
              size="sm"
            >
              {uploading ? "Uploading..." : "Upload All"}
            </Button>
          </div>

          {files.map((file, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-start gap-3">
                {/* Preview or Icon */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-muted rounded text-2xl">
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {file.uploadStatus === "success" && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {file.uploadStatus === "error" && (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      )}
                      {file.uploadStatus === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {file.uploadStatus === "uploading" && (
                    <Progress value={file.uploadProgress} className="mt-2" />
                  )}

                  {/* Error Message */}
                  {file.uploadStatus === "error" && (
                    <p className="text-xs text-destructive mt-1">
                      {file.uploadError}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
