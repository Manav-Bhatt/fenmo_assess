"use client";

import { useState, useEffect, FormEvent } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

// shadcn UI Imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["Food", "Transport", "Utilities", "Entertainment", "Other"];

export default function ExpenseTracker() {
  // --- Global State & Database Hooks ---
  const [filterCategory, setFilterCategory] = useState<string>("All");
  
  // The backend already handles the sorting and filtering based on the argument passed
  const expenses = useQuery(api.expenses.get, { category: filterCategory });
  const createExpense = useMutation(api.expenses.create);

  // --- Form State ---
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  
  // --- Network & Safety State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempKey, setIdempKey] = useState<string>("");

  // Generate the first idempotency key when the component mounts
  useEffect(() => {
    setIdempKey(uuidv4());
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent spam clicking

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Saving expense...");

    try {
      // Multiply by 100 to store as an integer (Paise/Cents)
      const amountInPaise = Math.round(amountFloat * 100);

      await createExpense({
        amountInPaise,
        category,
        description,
        date,
        idempotencyKey: idempKey, // Pass the unique key to prevent duplication
      });

      toast.success("Expense saved successfully!", { id: loadingToast });
      
      // Reset the form fields
      setAmount("");
      setDescription("");
      // CRITICAL: Generate a NEW key so the next legitimate submission goes through
      setIdempKey(uuidv4()); 
    } catch (error) {
      console.error(error);
      toast.error("Network error. Please try again.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

// --- Calculations ---
  // 1. Total of currently visible expenses
  const totalInPaise = expenses?.reduce((sum, exp) => sum + exp.amountInPaise, 0) || 0;
  
  // 2. Format it for the UI (this is the variable TS is looking for!)
  const formattedTotal = (totalInPaise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });

  // 3. Category Summary calculations
  const categoryTotals = expenses?.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amountInPaise;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
      
      {/* LEFT COLUMN: Add Expense Form */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (₹)</label>
                <Input 
                  type="number" step="0.01" required 
                  value={amount} onChange={(e) => setAmount(e.target.value)} 
                  placeholder="0.00" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input 
                  type="text" required 
                  value={description} onChange={(e) => setDescription(e.target.value)} 
                  placeholder="e.g., Office cab" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input 
                  type="date" required 
                  value={date} onChange={(e) => setDate(e.target.value)} 
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Expense"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Expenses List & Filters */}
      <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <CardTitle>Expense History</CardTitle>
              <div className="text-2xl font-bold text-green-700 mt-2">{formattedTotal}</div>
            </div>
            <div className="w-40">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Filter Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
          {expenses && expenses.length > 0 && filterCategory === "All" && (
              <div className="flex flex-wrap gap-3 mb-6 p-4 bg-muted/30 rounded-lg border">
                {Object.entries(categoryTotals || {}).map(([cat, amount]) => (
                  <div key={cat} className="flex flex-col bg-white px-3 py-2 rounded-md border shadow-sm flex-1 min-w-30">
                    <span className="text-xs text-muted-foreground font-medium">{cat}</span>
                    <span className="text-sm font-bold text-gray-800">
                      {(amount / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {expenses === undefined ? (
              <div className="text-center text-muted-foreground py-8 animate-pulse">Loading expenses...</div>
            ) : expenses.length === 0 ? (
              <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                No expenses found for this category.
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((exp) => (
                      <TableRow key={exp._id}>
                        <TableCell className="text-muted-foreground">{exp.date}</TableCell>
                        <TableCell className="font-medium">{exp.description}</TableCell>
                        <TableCell>
                          <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                            {exp.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {(exp.amountInPaise / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}