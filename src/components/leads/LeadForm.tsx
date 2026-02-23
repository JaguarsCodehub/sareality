"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  leadFormSchema, 
  LeadFormValues, 
  LeadSources, 
  PropertyTypes, 
  BHKRequirements, 
  PurchasePurposes, 
  PossessionPreferences, 
  UrgencyLevels 
} from "@/types/lead";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useState } from "react";
import { createDocument } from "@/config/db";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function LeadForm() {
  const { profile } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema) as any,
    defaultValues: {
      fullName: "",
      primaryPhone: "",
      whatsappNumber: "",
      email: "",
      leadSource: "Google Ad", // default standard
      propertyTypeInterest: [],
      bhkRequirement: [],
      budgetMin: 0,
      budgetMax: 0,
      preferredLocation: "",
      notes: "",
    },
  });

  async function onSubmit(data: LeadFormValues) {
    if (!profile) return;
    setIsSubmitting(true);
    
    try {
      // 1. Build the full Lead Object
      const leadPayload = {
        ...data,
        assignedAgentId: profile.id, // Auto-assign to self for MVP Phase 1 default
        assignedAgentName: profile.name,
        stage: "New Lead",
        leadScore: 50, // Base default score before AI
      };

      // 2. Perform duplicate check (simple version for Phase 1 by Phone)
      // Note: A robust version would query Firestore first. We'll add this next.
      
      const newLeadId = await createDocument("leads", leadPayload);
      
      toast.success("Lead created successfully!");
      // Redirect to the new lead profile
      router.push(`/leads/${newLeadId}`);
      
    } catch (error: any) {
      console.error("Failed to create lead:", error);
      toast.error("Failed to save lead: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
        
        {/* Section 1: Contact Details */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name <span className="text-rose-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Raj Kumar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="primaryPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Phone <span className="text-rose-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Same if blank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="raj@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="leadSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Source <span className="text-rose-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LeadSources.map((source) => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section 2: Real Estate Requirements */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Property Requirements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* BHK Selection (Checkbox group) */}
            <FormField
              control={form.control}
              name="bhkRequirement"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>BHK Requirement <span className="text-rose-500">*</span></FormLabel>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {BHKRequirements.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="bhkRequirement"
                        render={({ field }) => {
                          return (
                            <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== item)
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">{item}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Property Type Selection */}
            <FormField
              control={form.control}
              name="propertyTypeInterest"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Property Type <span className="text-rose-500">*</span></FormLabel>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PropertyTypes.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="propertyTypeInterest"
                        render={({ field }) => {
                          return (
                            <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== item)
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">{item}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="budgetMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Budget (Lakhs)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="40" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="budgetMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Budget (Lakhs)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="80" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="preferredLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Whitefield" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section 3: Extra Intel */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Additional Intelligence</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
             <FormField
              control={form.control}
              name="purposeOfPurchase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PurchasePurposes.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="urgencyOfPurchase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urgency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UrgencyLevels.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="homeLoanRequired"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Loan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Already Pre-Approved">Already Pre-Approved</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any context from the first conversation or ad interaction..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
             {isSubmitting ? "Saving..." : "Create Lead Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
