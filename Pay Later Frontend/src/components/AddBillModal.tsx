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
import { Upload, X, FileText, Plus, Calculator, Loader2 } from "lucide-react";
import api from "@/lib/axios";

interface AddBillModalProps {
  children: React.ReactNode;
  onBillAdded?: (bill: any) => void;
}

interface ApiResponse {
  message: string;
  billType: string;
  rewardEarned: number;
  totalPoints: number;
  cashbackBalance: number;
  cashbackAmount: number;
}

const AddBillModal = ({ children, onBillAdded }: AddBillModalProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    amount: "",
    dueDate: "",
    category: "",
    frequency: "",
    description: "",
    pdf: null as File | null // Changed to single PDF file
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null); // Single file state
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
    if (!files || files.length === 0) return;
    
    const file = files[0]; // Take only the first file
    
    // Only accept PDF files
    const isValidType = file.type === 'application/pdf' || file.type.includes('pdf');
    const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
    
    if (!isValidType) {
      toast({
        title: "Invalid File Type",
        description: "Please upload only PDF files.",
        variant: "destructive"
      });
      return;
    }
    
    if (!isValidSize) {
      toast({
        title: "File Too Large",
        description: `File "${file.name}" exceeds 10MB limit.`,
        variant: "destructive"
      });
      return;
    }

    // Set single file
    setUploadedFile(file);
    
    // Update formData with PDF
    setFormData(prev => ({
      ...prev,
      pdf: file
    }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = () => {
    setUploadedFile(null);
    
    // Update formData
    setFormData(prev => ({
      ...prev,
      pdf: null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Check if PDF is uploaded (mandatory)
    if (!uploadedFile) {
      toast({
        title: "PDF Required",
        description: "Please upload a PDF file of your bill.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitFormData = new FormData();
      
      // Add all form fields
      submitFormData.append('name', formData.name);
      submitFormData.append('company', formData.company);
      submitFormData.append('amount', formData.amount);
      submitFormData.append('dueDate', formData.dueDate);
      submitFormData.append('category', formData.category);
      submitFormData.append('frequency', formData.frequency);
      submitFormData.append('description', formData.description);
      
      // Add single PDF file
      submitFormData.append('pdf', uploadedFile); // Single file with 'pdf' field name

      console.log("Submitting formData:", formData);

      const response = await api.post("/bill/verifyBillPayment", submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      const { message, billType, rewardEarned, totalPoints, cashbackBalance, cashbackAmount } = response.data;

      toast({
        title: "Bill Verified Successfully!",
        description: `${message}. You earned ${rewardEarned} points! Total: ${totalPoints} points, Cashback: $${cashbackAmount.toFixed(2)}`,
        variant: "default"
      });

      // Create bill object with API response data
      const newBill = {
        id: Date.now(),
        ...formData,
        amount: parseFloat(formData.amount),
        points: rewardEarned,
        totalPoints,
        cashbackBalance,
        cashbackAmount,
        billType,
        status: "verified",
        file: uploadedFile ? { name: uploadedFile.name, size: uploadedFile.size, type: uploadedFile.type } : null,
        createdAt: new Date().toISOString(),
        userId: user.id
      };

      // Save to user-specific localStorage (optional, since API handles it)
      const userBillsKey = `bilt_bills_${user.id}`;
      const existingBills = JSON.parse(localStorage.getItem(userBillsKey) || '[]');
      localStorage.setItem(userBillsKey, JSON.stringify([...existingBills, newBill]));

      // Update user's total points in localStorage
      const userPointsKey = `bilt_points_${user.id}`;
      localStorage.setItem(userPointsKey, totalPoints.toString());

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
        description: "",
        pdf: null
      });
      setUploadedFile(null);

    } catch (error: any) {
      console.error("Error submitting bill:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to verify bill";
      
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} disabled={isSubmitting}>
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
              <Select value={formData.frequency} onValueChange={(value) => handleInputChange("frequency", value)} disabled={isSubmitting}>
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
              disabled={isSubmitting}
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
                  Estimated points - actual rewards may vary after verification
                </p>
              </CardContent>
            </Card>
          )}

          {/* Single PDF Upload - Mandatory */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Upload Bill PDF *</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              } ${!uploadedFile ? 'border-red-200 bg-red-50/50' : ''}`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop a PDF file here, or{" "}
                <label className="text-primary cursor-pointer hover:underline">
                  browse
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    disabled={isSubmitting}
                  />
                </label>
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600 font-medium">*Required:</span> Upload a PDF bill (Max 10MB)
              </p>
              {!uploadedFile && (
                <p className="text-xs text-red-600 mt-1">
                  A PDF file is required for bill verification
                </p>
              )}
            </div>

            {/* Uploaded File */}
            {uploadedFile && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600">
                  ✓ PDF file uploaded
                </p>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-red-600" />
                    <div>
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(1)}MB • PDF Document
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
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
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              variant="customBlue"
              className="flex-1"
              disabled={isSubmitting || !uploadedFile}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying Bill...
                </>
              ) : (
                "Verify Bill & Earn Points"
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBillModal;