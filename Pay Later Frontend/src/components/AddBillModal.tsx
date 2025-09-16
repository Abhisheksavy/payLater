import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, X, FileText, Image, Plus, Calculator } from "lucide-react";

interface AddBillModalProps {
  children: React.ReactNode;
  onBillAdded?: (bill: any) => void;
}

const AddBillModal = ({ children, onBillAdded }: AddBillModalProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    amount: "",
    dueDate: "",
    category: "",
    frequency: "",
    description: ""
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const calculatePoints = (amount: number, category: string) => {
    const baseRate = 2; // 2 points per dollar
    const categoryMultipliers = {
      "housing": 3,
      "utilities": 2.5,
      "auto": 2.5,
      "insurance": 2,
      "phone": 2,
      "subscriptions": 1.5,
      "health": 1.5,
      "education": 1.5,
      "shopping": 1.2,
      "other": 1
    };
    
    const multiplier = categoryMultipliers[category as keyof typeof categoryMultipliers] || 1;
    return Math.floor(amount * baseRate * multiplier);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.includes('image/') || file.type.includes('pdf') || file.type.includes('text/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add bills.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.name || !formData.company || !formData.amount || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    const points = calculatePoints(amount, formData.category);
    
    const newBill = {
      id: Date.now(),
      ...formData,
      amount,
      points,
      status: "pending",
      files: uploadedFiles.map(file => ({ name: file.name, size: file.size, type: file.type })),
      createdAt: new Date().toISOString(),
      userId: user.id
    };

    // Save to user-specific localStorage
    const userBillsKey = `bilt_bills_${user.id}`;
    const existingBills = JSON.parse(localStorage.getItem(userBillsKey) || '[]');
    localStorage.setItem(userBillsKey, JSON.stringify([...existingBills, newBill]));

    // Update user's total points
    const userPointsKey = `bilt_points_${user.id}`;
    const currentPoints = parseInt(localStorage.getItem(userPointsKey) || '0');
    localStorage.setItem(userPointsKey, (currentPoints + points).toString());

    toast({
      title: "Bill Added Successfully!",
      description: `You'll earn ${points} points when this bill is paid.`,
      variant: "default"
    });

    onBillAdded?.(newBill);
    setOpen(false);
    
    // Reset form
    setFormData({
      name: "",
      company: "",
      amount: "",
      dueDate: "",
      category: "",
      frequency: "",
      description: ""
    });
    setUploadedFiles([]);
  };

  const estimatedPoints = formData.amount && formData.category ? 
    calculatePoints(parseFloat(formData.amount) || 0, formData.category) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Bill
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bill Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Electric Bill"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                placeholder="e.g., ConEd"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="housing">Housing (3x points)</SelectItem>
                  <SelectItem value="utilities">Utilities (2.5x points)</SelectItem>
                  <SelectItem value="auto">Car Payment (2.5x points)</SelectItem>
                  <SelectItem value="insurance">Insurance (2x points)</SelectItem>
                  <SelectItem value="phone">Phone & Internet (2x points)</SelectItem>
                  <SelectItem value="subscriptions">Subscriptions (1.5x points)</SelectItem>
                  <SelectItem value="health">Health & Wellness (1.5x points)</SelectItem>
                  <SelectItem value="education">Education (1.5x points)</SelectItem>
                  <SelectItem value="shopping">Shopping & Retail (1.2x points)</SelectItem>
                  <SelectItem value="other">Other (1x points)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(value) => handleInputChange("frequency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
            />
          </div>

          {/* Points Preview */}
          {estimatedPoints > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-primary" />
                    <span className="font-medium">Estimated Rewards</span>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">
                    +{estimatedPoints} points
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  You'll earn these points when this bill is paid
                </p>
              </CardContent>
            </Card>
          )}

          {/* File Upload */}
          <div className="space-y-4">
            <Label>Upload Bill Documents (Optional)</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here, or{" "}
                <label className="text-primary cursor-pointer hover:underline">
                  browse
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.txt,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </label>
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: Images, PDFs, Documents (Max 10MB each)
              </p>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      {file.type.includes('image/') ? (
                        <Image className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(1)}MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Notes (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional notes about this bill..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="submit" variant="customBlue" className="flex-1">
              Add Bill & Earn {estimatedPoints} Points
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBillModal;