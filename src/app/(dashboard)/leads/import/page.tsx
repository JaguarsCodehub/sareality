"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { createDocument } from "@/config/db";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LeadImportPage() {
  const { profile } = useAuth();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      complete: (results: any) => {
        if (results.meta.fields) {
          setHeaders(results.meta.fields);
          // Just show preview of first 5 rows
          setCsvData(results.data.slice(0, 5));
          toast.success(`Parsed ${results.data.length} rows successfully.`);
          
          // Store full data for actual import
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).__fullCsvData = results.data;
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: (error: any) => {
        toast.error("Failed to parse CSV: " + error.message);
      }
    });
  };

  const processImport = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fullData = (window as any).__fullCsvData;
    if (!fullData || fullData.length === 0) {
      toast.error("No data to import");
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;

    // A primitive mapping strategy for the MVP: expects headers to match or be close
    for (const row of fullData) {
      try {
        const leadPayload = {
          fullName: row["Name"] || row["Full Name"] || "Unknown",
          primaryPhone: row["Phone"] || row["Mobile"] || row["Primary Phone"] || "",
          email: row["Email"] || "",
          leadSource: row["Source"] || "Other",
          stage: "New Lead",
          leadScore: 50,
          budgetMax: parseInt(row["Budget"]) || 0,
          preferredLocation: row["Location"] || "",
          notes: "Imported from Legacy Google Sheet",
          assignedAgentId: profile?.id, // Auto-assign to self during MVP import
          assignedAgentName: profile?.name,
        };

        if (leadPayload.primaryPhone) {
          await createDocument("leads", leadPayload);
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setIsImporting(false);
    toast.success(`Import complete! ${successCount} added, ${failCount} failed.`);
    router.push("/leads");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Import Leads</h1>
        <p className="text-slate-500 mt-1">Upload your existing Google Sheet or Excel export (.CSV format) to migrate.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Upload CSV File</CardTitle>
          <CardDescription>File must include at least a Name and Phone Note column.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-12 text-center hover:bg-slate-50 transition-colors flex flex-col justify-center items-center">
             <UploadCloud size={40} className="text-slate-400 mb-4" />
             <Button variant="secondary" className="relative cursor-pointer">
               Choose File
               <input 
                 type="file" 
                 accept=".csv" 
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 onChange={handleFileUpload}
               />
             </Button>
          </div>
        </CardContent>
      </Card>

      {headers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Preview & Import</CardTitle>
            <CardDescription>Previewing the first 5 rows of your sheet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-md overflow-x-auto text-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    {headers.slice(0, 6).map((h, i) => (
                      <TableHead key={i} className="whitespace-nowrap">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((row, i) => (
                    <TableRow key={i}>
                      {headers.slice(0, 6).map((h, j) => (
                        <TableCell key={j} className="truncate max-w-[150px]">{row[h]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={processImport} disabled={isImporting}>
                {isImporting ? "Importing Data..." : <><CheckCircle2 size={16} className="mr-2" /> Start Bulk Import</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
