import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { CalendarIcon, Upload, CheckCircle, AlertCircle, FileText, CreditCard, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: string;
  onComplete: () => void;
}

type KycStep = 'personal' | 'documents' | 'verification' | 'complete';

const KycModal = ({ isOpen, onClose, selectedPlan, onComplete }: KycModalProps) => {
  const [currentStep, setCurrentStep] = useState<KycStep>('personal');
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    ssn: '',
    phone: '',
    occupation: '',
    income: ''
  });
  const [documents, setDocuments] = useState({
    idDocument: null as File | null,
    addressProof: null as File | null
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (type: 'idDocument' | 'addressProof', file: File | null) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
  };

  const handlePersonalInfoSubmit = () => {
    if (!formData.firstName || !formData.lastName || !dateOfBirth || !formData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('documents');
  };

  const handleDocumentsSubmit = () => {
    if (!documents.idDocument || !documents.addressProof) {
      toast({
        title: "Documents Required",
        description: "Please upload both required documents",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('verification');
    simulateVerification();
  };

  const simulateVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setCurrentStep('complete');
      
      // Save KYC status and plan to localStorage
      const kycData = {
        status: 'verified',
        completedAt: new Date().toISOString(),
        selectedPlan,
        personalInfo: { ...formData, dateOfBirth: dateOfBirth?.toISOString() },
        documentsUploaded: true
      };
      
      if (user) {
        localStorage.setItem(`bilt_kyc_${user.id}`, JSON.stringify(kycData));
        localStorage.setItem(`bilt_subscription_${user.id}`, JSON.stringify({
          plan: selectedPlan,
          status: 'active',
          startDate: new Date().toISOString()
        }));
      }
      
      toast({
        title: "KYC Verification Complete!",
        description: "Your account has been verified successfully",
      });
    }, 3000);
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const steps = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'verification', label: 'Verification', icon: CheckCircle },
    { id: 'complete', label: 'Complete', icon: CreditCard }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Complete Your KYC Verification
          </DialogTitle>
          <div className="text-center">
            <Badge variant="outline" className="mt-2">
              Selected Plan: {selectedPlan}
            </Badge>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    isActive ? "border-primary bg-primary text-primary-foreground" : 
                    isCompleted ? "border-green-500 bg-green-500 text-white" : 
                    "border-muted-foreground bg-background"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "ml-2 text-sm font-medium",
                    isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-8 h-0.5 mx-4",
                      isCompleted ? "bg-green-500" : "bg-muted"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 'personal' && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Please provide your personal details for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <Label>Date of Birth *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateOfBirth && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfBirth ? format(dateOfBirth, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={setDateOfBirth}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="ZIP"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ssn">Last 4 digits of SSN</Label>
                    <Input
                      id="ssn"
                      value={formData.ssn}
                      onChange={(e) => handleInputChange('ssn', e.target.value)}
                      placeholder="1234"
                      maxLength={4}
                    />
                  </div>
                </div>

                <Button onClick={handlePersonalInfoSubmit} className="w-full">
                  Continue to Documents
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 'documents' && (
            <Card>
              <CardHeader>
                <CardTitle>Document Upload</CardTitle>
                <CardDescription>
                  Upload the required documents for identity verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Government-issued ID *</Label>
                    <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload driver's license, passport, or state ID
                      </p>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('idDocument', e.target.files?.[0] || null)}
                        className="w-full"
                      />
                      {documents.idDocument && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {documents.idDocument.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Proof of Address *</Label>
                    <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload utility bill, bank statement, or lease agreement
                      </p>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('addressProof', e.target.files?.[0] || null)}
                        className="w-full"
                      />
                      {documents.addressProof && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {documents.addressProof.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button onClick={handleDocumentsSubmit} className="w-full">
                  Submit Documents
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 'verification' && (
            <Card>
              <CardHeader>
                <CardTitle>Verification in Progress</CardTitle>
                <CardDescription>
                  We're reviewing your information and documents
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                {isVerifying ? (
                  <div className="space-y-4">
                    <div className="animate-spin mx-auto h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
                    <p className="text-lg">Verifying your information...</p>
                    <p className="text-sm text-muted-foreground">This usually takes 2-3 minutes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                    <p className="text-lg font-semibold">Verification Complete!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 'complete' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Welcome to Bilt Rewards!</CardTitle>
                <CardDescription className="text-center">
                  Your KYC verification is complete. You can now access all features.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Account Verified</h3>
                  <p className="text-sm text-muted-foreground">
                    You're now ready to start earning rewards on your bills!
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">3x</div>
                    <div className="text-sm text-muted-foreground">Points on Bills</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">$0</div>
                    <div className="text-sm text-muted-foreground">Hidden Fees</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                </div>

                <Button onClick={handleComplete} className="w-full" size="lg">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KycModal;