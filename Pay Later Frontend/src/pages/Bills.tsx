import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import BillTracker from "@/components/BillTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, X } from "lucide-react";
import api from "@/lib/axios";

const Bills = () => {
  const [bills, setBills] = useState([]);
  // Temporary filter states (for form inputs)
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");
  const [tempCategoryFilter, setTempCategoryFilter] = useState("all");
  
  // Applied filter states (actual filtering)
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("all");
  const [appliedCategoryFilter, setAppliedCategoryFilter] = useState("all");

  const fetchBills = async () => {
    try {
      const res = await api.get(`/bill/getUploadedBills`);
      const fetchedBills = res.data;
      setBills(
        fetchedBills.map((bill: any) => ({
          id: bill._id,
          name: bill.merchant,
          company: bill.description,
          amount: Math.abs(bill.amount),
          dueDate: new Date(bill.paidDate).toLocaleDateString(),
          status: "paid",
          category: bill.billType || "Other",
          points: bill.reward || 0,
          fileUrl: bill.fileUrl
        }))
      );
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
  };

  // Filter logic using useMemo for better performance
  const filteredBills = useMemo(() => {
    return bills.filter((bill: any) => {
      // Search filter
      const matchesSearch = appliedSearchQuery === "" || 
        bill.name.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
        bill.company.toLowerCase().includes(appliedSearchQuery.toLowerCase());

      // Status filter
      const matchesStatus = appliedStatusFilter === "all" || bill.status === appliedStatusFilter;

      // Category filter
      const matchesCategory = appliedCategoryFilter === "all" || bill.category === appliedCategoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [bills, appliedSearchQuery, appliedStatusFilter, appliedCategoryFilter]);

  const applyFilters = () => {
    setAppliedSearchQuery(tempSearchQuery);
    setAppliedStatusFilter(tempStatusFilter);
    setAppliedCategoryFilter(tempCategoryFilter);
  };

  // Clear all filters
  const clearFilters = () => {
    // Clear both temp and applied filters
    setTempSearchQuery("");
    setTempStatusFilter("all");
    setTempCategoryFilter("all");
    setAppliedSearchQuery("");
    setAppliedStatusFilter("all");
    setAppliedCategoryFilter("all");
  };

  // Check if any filters are active (applied ones)
  const hasActiveFilters = appliedSearchQuery !== "" || appliedStatusFilter !== "all" || appliedCategoryFilter !== "all";
  
  // Check if temp filters are different from applied (to show if apply is needed)
  const hasUnappliedChanges = tempSearchQuery !== appliedSearchQuery || 
                              tempStatusFilter !== appliedStatusFilter || 
                              tempCategoryFilter !== appliedCategoryFilter;

  useEffect(() => {
    fetchBills();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Bills</h1>
              <p className="text-muted-foreground">Manage all your bills and payments</p>
            </div>
            <Button variant="customBlue" className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Bill
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filters & Search</CardTitle>
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Bills</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="search" 
                      placeholder="Search by name or company" 
                      className="pl-10"
                      value={tempSearchQuery}
                      onChange={(e) => setTempSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={tempStatusFilter} onValueChange={setTempStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={tempCategoryFilter} onValueChange={setTempCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Housing">Housing</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Subscriptions">Subscriptions</SelectItem>
                      <SelectItem value="Phone & Internet">Phone & Internet</SelectItem>
                      <SelectItem value="Shopping & Retail">Shopping & Retail</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                      <SelectItem value="Car Payment">Car Payment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredBills.length} of {bills.length} bills
                    </div>
                    <Button 
                      variant="outline" 
                      className="gap-2" 
                      onClick={applyFilters}
                      disabled={!hasUnappliedChanges}
                    >
                      <Filter className="w-4 h-4" />
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Active filters display */}
              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {appliedSearchQuery && (
                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      Search: "{appliedSearchQuery}"
                      <button 
                        onClick={() => {
                          setTempSearchQuery("");
                          setAppliedSearchQuery("");
                        }}
                        className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {appliedStatusFilter !== "all" && (
                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      Status: {appliedStatusFilter}
                      <button 
                        onClick={() => {
                          setTempStatusFilter("all");
                          setAppliedStatusFilter("all");
                        }}
                        className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {appliedCategoryFilter !== "all" && (
                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      Category: {appliedCategoryFilter}
                      <button 
                        onClick={() => {
                          setTempCategoryFilter("all");
                          setAppliedCategoryFilter("all");
                        }}
                        className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <BillTracker bills={filteredBills} refreshBills={fetchBills} />
        </div>
      </main>
    </div>
  );
};

export default Bills;