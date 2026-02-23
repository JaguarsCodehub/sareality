import { z } from "zod";

// Field Enums defined in PRD
export const LeadSources = ["99acres", "MagicBricks", "Housing.com", "Facebook Ad", "Google Ad", "Walk-in", "Referral", "Cold Call", "Other"] as const;
export const PropertyTypes = ["Apartment", "Villa", "Plot", "Row House", "Commercial", "Shop", "Warehouse"] as const;
export const BHKRequirements = ["1 BHK", "1.5 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK", "4+ BHK"] as const;
export const PurchasePurposes = ["Self-Use", "Investment", "Both", "Undecided"] as const;
export const PossessionPreferences = ["Ready-to-Move", "Under Construction", "No Preference"] as const;
export const UrgencyLevels = ["Within 3 Months", "3-6 Months", "6-12 Months", "12+ Months"] as const;

// Zod Schema for strict validation before hitting Firestore
export const leadFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  primaryPhone: z.string().min(10, "Valid 10-digit phone number is required").max(15),
  whatsappNumber: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  leadSource: z.enum(LeadSources),
  referralName: z.string().optional(),
  
  // Real Estate Specific Fields
  propertyTypeInterest: z.array(z.enum(PropertyTypes)).min(1, "Select at least one property type"),
  bhkRequirement: z.array(z.enum(BHKRequirements)).min(1, "Select at least one BHK requirement"),
  budgetMin: z.coerce.number().min(0, "Invalid budget").optional(),
  budgetMax: z.coerce.number().min(0, "Invalid budget").optional(),
  preferredLocation: z.string().optional(),
  purposeOfPurchase: z.enum(PurchasePurposes).optional(),
  possessionPreference: z.enum(PossessionPreferences).optional(),
  homeLoanRequired: z.enum(["Yes", "No", "Already Pre-Approved"]).optional(),
  urgencyOfPurchase: z.enum(UrgencyLevels).optional(),
  notes: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;
