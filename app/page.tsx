"use client";

import { useState, useEffect, FormEvent } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

const CATEGORIES = ["Food", "Transport", "Utilities", "Entertainment", "Other"];

// Helper to assign icons based on category
const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Food": return { icon: "restaurant", color: "text-orange-400", bg: "bg-orange-500/10" };
    case "Transport": return { icon: "directions_car", color: "text-blue-400", bg: "bg-blue-500/10" };
    case "Entertainment": return { icon: "movie", color: "text-purple-400", bg: "bg-purple-500/10" };
    case "Utilities": return { icon: "bolt", color: "text-yellow-400", bg: "bg-yellow-500/10" };
    default: return { icon: "shopping_cart", color: "text-green-400", bg: "bg-green-500/10" };
  }
};

export default function ExpensoDashboard() {
  const [filterCategory, setFilterCategory] = useState<string>("All Categories");
  const queryCategory = filterCategory === "All Categories" ? undefined : filterCategory;
  
  const expenses = useQuery(api.expenses.get, { category: queryCategory });
  const createExpense = useMutation(api.expenses.create);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempKey, setIdempKey] = useState<string>("");

  useEffect(() => {
    setIdempKey(uuidv4());
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Logging transaction...");

    try {
      const amountInPaise = Math.round(amountFloat * 100);
      await createExpense({
        amountInPaise,
        category,
        description,
        date,
        idempotencyKey: idempKey,
      });

      toast.success("Expense added successfully!", { id: loadingToast });
      setAmount("");
      setDescription("");
      setIdempKey(uuidv4()); 
    } catch (error) {
      toast.error("Network error. Please try again.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalInPaise = expenses?.reduce((sum, exp) => sum + exp.amountInPaise, 0) || 0;
  const formattedTotal = (totalInPaise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });

  return (
    <div className="flex-1 flex flex-col h-screen relative overflow-y-auto w-full max-w-md mx-auto sm:max-w-full sm:flex-row sm:overflow-hidden bg-background-dark text-text-primary">
      
      {/* Mobile Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-surface-dark border-b border-surface-highlight sm:hidden sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Expenso</h1>
        </div>
      </header>

      {/* LEFT COLUMN: Add Expense Form */}
      <section className="flex-none sm:w-100 sm:border-r sm:border-surface-highlight sm:bg-surface-dark bg-background-dark p-6 overflow-y-auto z-10">
        <div className="hidden sm:flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(16,183,127,0.2)]">
            <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Expenso</h1>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-1">New Transaction</h2>
          <p className="text-sm text-text-secondary">Log your daily spending efficiently.</p>
        </div>

        <div className="bg-surface-dark sm:bg-surface-highlight/30 border border-surface-highlight rounded-xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500"></div>
          
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-2xl font-light">₹</span>
                <input 
                  type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-surface-highlight/50 border border-surface-highlight rounded-lg py-4 pl-10 pr-4 text-3xl font-bold text-white placeholder-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" 
                  placeholder="0.00" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</label>
                <div className="relative">
                  <select 
                    value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none bg-surface-highlight/50 border border-surface-highlight rounded-lg py-3 pl-10 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[18px]">category</span>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px] pointer-events-none">expand_more</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</label>
                <div className="relative">
                  <input 
                    type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-surface-highlight/50 border border-surface-highlight rounded-lg py-3 pl-10 pr-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all [&::-webkit-calendar-picker-indicator]:opacity-0" 
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[18px] pointer-events-none">calendar_today</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Description</label>
              <div className="relative">
                <input 
                  type="text" required value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface-highlight/50 border border-surface-highlight rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" 
                  placeholder="What was this for?" 
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[18px]">edit_note</span>
              </div>
            </div>

            <button 
              type="submit" disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">{isSubmitting ? "hourglass_empty" : "add_circle"}</span>
              {isSubmitting ? "Processing..." : "Add Expense"}
            </button>
          </form>
        </div>
      </section>

      {/* RIGHT COLUMN: History & Stats */}
      <section className="flex-1 flex flex-col bg-background-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-surface-highlight/20 to-transparent pointer-events-none"></div>
        
        <div className="p-6 pb-2 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-text-secondary mb-1">Total Expenses</h2>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{formattedTotal}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none bg-surface-dark border border-surface-highlight hover:border-text-secondary/50 rounded-lg py-2 pl-3 pr-8 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              >
                <option value="All Categories">All Categories</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary text-[16px] pointer-events-none">filter_list</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative z-10">
          <div className="space-y-3">
            {expenses === undefined ? (
              <div className="text-center text-text-secondary py-10 animate-pulse">Loading secure data...</div>
            ) : expenses.length === 0 ? (
              <div className="text-center text-text-secondary py-10 border-2 border-dashed border-surface-highlight rounded-xl">No expenses found.</div>
            ) : (
              expenses.map((exp) => {
                const style = getCategoryIcon(exp.category);
                return (
                  <div key={exp._id} className="group flex items-center justify-between p-4 bg-surface-dark border border-surface-highlight hover:border-primary/30 rounded-xl transition-all hover:shadow-lg hover:shadow-black/20">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${style.bg} ${style.color}`}>
                        <span className="material-symbols-outlined">{style.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-white group-hover:text-primary transition-colors">{exp.description}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-medium text-text-secondary">{exp.date}</span>
                          <span className="w-1 h-1 rounded-full bg-text-secondary/30"></span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-surface-highlight text-text-secondary border border-surface-highlight">
                            {exp.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {(exp.amountInPaise / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}