import React, {
  useState,
  useCallback,
  useEffect,
  useRef /*, ChangeEvent*/,
} from "react";
import { useDropzone } from "react-dropzone";
// import { motion } from "framer-motion"; // Unused
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  FileUp,
  X,
  FileText,
  FileSpreadsheet,
  File,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge"; // Unused

// Type for the resource data returned after DB insert
export interface UploadedResourceData {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  url: string;
  file_type: string;
  file_path: string;
  source: string;
  date_added: string; 
  tags: string[];
  user_id: string;
  // Add any other fields returned by .select().single()
}

interface ResourceUploaderProps {
  onResourceAdded?: (resource: UploadedResourceData) => void; // Typed resource
}

const ResourceUploader: React.FC<ResourceUploaderProps> = ({
  onResourceAdded,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("general");
  const [type, setType] = useState<string>("guide");
  const [tags, setTags] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      // Auto-populate title from filename
      const fileName = acceptedFiles[0].name.split(".")[0];
      setTitle(fileName.replace(/_/g, " ").replace(/-/g, " "));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/msword": [".doc"],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
  });

  const getFileIcon = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      case "docx":
      case "doc":
        return <FileText className="h-8 w-8 text-blue-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFileType = (file: File): string => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "pdf";
      case "xlsx":
      case "xls":
        return "xlsx";
      case "docx":
      case "doc":
        return "docx";
      default:
        return "url";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Process tags
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Upload file to Supabase Storage
      const fileType = getFileType(file);
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const filePath = `resources/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("resources")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("resources")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Save resource metadata to database
      const resourceData = {
        title,
        description,
        category,
        type,
        tags: tagArray,
        fileType,
        url: publicUrl,
        filePath,
      };

      try {
        // Upload resource to database (inline implementation)
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error("User not authenticated");

        const { data: resource, error } = await supabase
          .from("resources")
          .insert({
            title: resourceData.title,
            description: resourceData.description,
            type: resourceData.type,
            category: resourceData.category,
            url: resourceData.url,
            file_type: resourceData.fileType,
            file_path: resourceData.filePath,
            source: "User Upload",
            date_added: new Date().toISOString(),
            tags: resourceData.tags,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        setSuccess(true);
        if (onResourceAdded) {
          onResourceAdded(resource);
        }

        // Reset form after successful upload
        resetTimeoutRef.current = setTimeout(() => {
          setFile(null);
          setTitle("");
          setDescription("");
          setCategory("general");
          setType("guide");
          setTags("");
          setSuccess(false);
        }, 2000);
      } catch (dbError) {
        // If database insert fails, delete the uploaded file to avoid orphaned files
        logger.error("Error saving resource metadata", dbError);
        
        const { error: deleteError } = await supabase.storage
          .from("resources")
          .remove([filePath]);
          
        if (deleteError) {
          logger.error("Failed to clean up uploaded file after metadata error", deleteError);
        }
        
        throw new Error("Failed to save resource. Please try again.");
      }
    } catch (err) {
      logger.error("Error uploading resource", err);
      let message = "Failed to upload resource. Please try again.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload ESG Resource</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}`}
            >
              <input {...getInputProps()} />
              <FileUp className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="mt-2 font-medium">
                Drag & drop a file here, or click to select
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports PDF, Excel, and Word documents (max 10MB)
              </p>
            </div>
          ) : (
            <div className="border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="font-medium truncate max-w-[250px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resource title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the resource"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Resource Type</Label>
              <Select value={type} onValueChange={(value) => setType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="framework">Framework</SelectItem>
                  <SelectItem value="case-study">Case Study</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">
              Tags{" "}
              <span className="text-muted-foreground">(comma-separated)</span>
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ESG, reporting, carbon, etc."
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">
                Resource uploaded successfully!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={!file || !title || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Resource"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ResourceUploader;
