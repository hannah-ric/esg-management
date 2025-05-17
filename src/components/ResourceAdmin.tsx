import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAppContext } from "./AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Save,
  ExternalLink,
} from "lucide-react";

// Define ResourceItemFromDB to match Supabase table structure
interface ResourceItemFromDB {
  id: string;
  title: string;
  description: string | null; // Allow null
  type: string;
  category: string;
  file_type: string | null; // Allow null
  url: string;
  source: string | null; // Allow null
  date_added: string | null; // Allow null
  tags?: string[] | null; // Allow null
}

// Define ResourceItem for internal component use
interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: "guide" | "template" | "framework" | "case-study";
  category: "environmental" | "social" | "governance" | "general";
  fileType: "pdf" | "xlsx" | "docx" | "url";
  url: string;
  source: string;
  date_added: string;
  tags?: string[];
}

const ResourceAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(
    null,
  );
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: string;
    category: string;
    url: string;
    fileType: string;
    source: string;
    tags: string;
  }>({
    title: "",
    description: "",
    type: "guide",
    category: "general",
    url: "",
    fileType: "url",
    source: "",
    tags: "",
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate("/");
        return;
      }

      try {
        // Check if user is an admin
        const { data, error } = await supabase
          .from("users") // Assuming 'users' table has an 'is_admin' column
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        // Ensure data exists and is_admin is a boolean before checking
        if (!data || typeof data.is_admin !== 'boolean' || !data.is_admin) {
          setError("You do not have permission to access this page.");
          setIsAdmin(false);
          setTimeout(() => navigate("/"), 3000);
        } else {
          setIsAdmin(true);
          fetchResources();
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setError("Error checking admin permissions. Please try again later.");
        setTimeout(() => navigate("/"), 3000);
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("resources").select("*");

      if (error) throw error;

      if (data) {
        // Transform data from DB to match ResourceItem for internal use
        const formattedResources: ResourceItem[] = data.map((item: ResourceItemFromDB) => ({
          id: item.id,
          title: item.title || "Untitled Resource",
          description: item.description || "", // Handle null
          type: item.type as ResourceItem['type'] || "guide", // Cast and provide default
          category: item.category as ResourceItem['category'] || "general", // Cast and provide default
          fileType: (item.file_type || "url") as ResourceItem['fileType'], // Cast and provide default
          url: item.url || "#",
          source: item.source || "Unknown", // Handle null
          date_added: item.date_added ? new Date(item.date_added).toLocaleDateString() : "N/A", // Handle null
          tags: item.tags || [], // Handle null
        }));
        setResources(formattedResources);
      }
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError("Failed to load resources. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResource = async () => {
    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.url) {
        setError("Please fill in all required fields.");
        return;
      }

      // Process tags
      const tags = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim())
        : [];

      const { error } = await supabase.from("resources").insert([
        {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          category: formData.category,
          url: formData.url,
          file_type: formData.fileType,
          source: formData.source || "Admin Upload",
          date_added: new Date().toISOString(),
          tags: tags,
        },
      ]);

      if (error) throw error;

      setSuccess("Resource added successfully!");
      setIsAddDialogOpen(false);
      resetForm();
      fetchResources();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error adding resource:", err);
      setError("Failed to add resource. Please try again.");
    }
  };

  const handleEditResource = async () => {
    if (!selectedResource) return;

    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.url) {
        setError("Please fill in all required fields.");
        return;
      }

      // Process tags
      const tags = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim())
        : [];

      const { error } = await supabase
        .from("resources")
        .update({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          category: formData.category,
          url: formData.url,
          file_type: formData.fileType,
          source: formData.source,
          tags: tags,
        })
        .eq("id", selectedResource.id);

      if (error) throw error;

      setSuccess("Resource updated successfully!");
      setIsEditDialogOpen(false);
      resetForm();
      fetchResources();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating resource:", err);
      setError("Failed to update resource. Please try again.");
    }
  };

  const handleDeleteResource = async () => {
    if (!selectedResource) return;

    try {
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", selectedResource.id);

      if (error) throw error;

      setSuccess("Resource deleted successfully!");
      setIsDeleteDialogOpen(false);
      fetchResources();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting resource:", err);
      setError("Failed to delete resource. Please try again.");
    }
  };

  const openEditDialog = (resource: ResourceItem) => {
    setSelectedResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      url: resource.url,
      fileType: resource.fileType,
      source: resource.source,
      tags: resource.tags ? resource.tags.join(", ") : "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (resource: ResourceItem) => {
    setSelectedResource(resource);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "guide",
      category: "general",
      url: "",
      fileType: "url",
      source: "",
      tags: "",
    });
    setSelectedResource(null);
    setError(null);
  };

  // Filter resources based on search query and filters
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      searchQuery === "" ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || resource.category === categoryFilter;

    const matchesType = typeFilter === "all" || resource.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "environmental":
        return "bg-green-100 text-green-800";
      case "social":
        return "bg-blue-100 text-blue-800";
      case "governance":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "guide":
        return "Guide";
      case "template":
        return "Template";
      case "framework":
        return "Framework";
      case "case-study":
        return "Case Study";
      default:
        return type;
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <p className="text-center">Redirecting to home page...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Resource Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Add, edit, or remove resources from the library
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add New Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new resource to the library.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Title *
                    </label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Resource title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="source" className="text-sm font-medium">
                      Source
                    </label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={(e) =>
                        setFormData({ ...formData, source: e.target.value })
                      }
                      placeholder="Source organization"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description *
                  </label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Resource description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Category
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="environmental">
                          Environmental
                        </SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="governance">Governance</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium">
                      Type
                    </label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="url" className="text-sm font-medium">
                      URL *
                    </label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      placeholder="https://example.com/resource"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="fileType" className="text-sm font-medium">
                      File Type
                    </label>
                    <Select
                      value={formData.fileType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, fileType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select file type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="xlsx">Excel</SelectItem>
                        <SelectItem value="docx">Word</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="tags" className="text-sm font-medium">
                    Tags (comma separated)
                  </label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="ESG, reporting, climate"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddResource}>
                  <Plus className="mr-2 h-4 w-4" /> Add Resource
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500" />
              <AlertTitle>Success</AlertTitle>
            </div>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="guide">Guides</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                  <SelectItem value="framework">Frameworks</SelectItem>
                  <SelectItem value="case-study">Case Studies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resources ({filteredResources.length})</CardTitle>
            <CardDescription>
              Manage resources in the ESG library
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-muted-foreground">
                  Loading resources...
                </p>
              </div>
            ) : filteredResources.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{resource.title}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {resource.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getCategoryColor(resource.category)}
                        >
                          {resource.category.charAt(0).toUpperCase() +
                            resource.category.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getTypeLabel(resource.type)}</TableCell>
                      <TableCell>
                        {new Date(resource.date_added).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(resource.url, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(resource)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(resource)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No resources found matching your criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Resource Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Resource</DialogTitle>
              <DialogDescription>
                Update the details of this resource.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-title" className="text-sm font-medium">
                    Title *
                  </label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Resource title"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-source" className="text-sm font-medium">
                    Source
                  </label>
                  <Input
                    id="edit-source"
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    placeholder="Source organization"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="edit-description"
                  className="text-sm font-medium"
                >
                  Description *
                </label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Resource description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="edit-category"
                    className="text-sm font-medium"
                  >
                    Category
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="environmental">
                        Environmental
                      </SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-type" className="text-sm font-medium">
                    Type
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-url" className="text-sm font-medium">
                    URL *
                  </label>
                  <Input
                    id="edit-url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://example.com/resource"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="edit-fileType"
                    className="text-sm font-medium"
                  >
                    File Type
                  </label>
                  <Select
                    value={formData.fileType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, fileType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                      <SelectItem value="docx">Word</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-tags" className="text-sm font-medium">
                  Tags (comma separated)
                </label>
                <Input
                  id="edit-tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="ESG, reporting, climate"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditResource}>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                resource &quot;{selectedResource?.title}&quot; from the library.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setSelectedResource(null);
                  setIsDeleteDialogOpen(false);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteResource}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );
};

export default ResourceAdmin;
