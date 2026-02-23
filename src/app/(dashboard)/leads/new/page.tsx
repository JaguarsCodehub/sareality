import { LeadForm } from "@/components/leads/LeadForm";

export default function NewLeadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">Add New Lead</h1>
        <p className="text-slate-500 mt-1">
          Enter customer details, requirements, and initial conversation notes.
        </p>
      </div>
      
      <LeadForm />
    </div>
  );
}
