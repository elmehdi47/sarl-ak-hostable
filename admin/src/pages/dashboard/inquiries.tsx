import { useState, useMemo } from "react";
import { useListInquiries } from "@/lib/api";
import { Search, MessageSquare } from "lucide-react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Inquiry } from "@/lib/api";

export default function DashboardInquiries() {
  const [search, setSearch] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const { data: inquiries = [], isLoading } = useListInquiries();

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(i => 
      i.name.toLowerCase().includes(search.toLowerCase()) || 
      i.email.toLowerCase().includes(search.toLowerCase()) ||
      i.message.toLowerCase().includes(search.toLowerCase())
    );
  }, [inquiries, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Inquiries</h1>
          <p className="text-muted-foreground text-sm">View contact form submissions</p>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name, email, or message..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="bg-white"
        />
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Message Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : filteredInquiries.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No inquiries found.</TableCell></TableRow>
            ) : (
              filteredInquiries.map(i => (
                <TableRow 
                  key={i.id} 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedInquiry(i)}
                >
                  <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                    {format(new Date(i.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">{i.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <a href={`mailto:${i.email}`} className="text-primary hover:underline" onClick={e => e.stopPropagation()}>{i.email}</a>
                      {i.phone && <span className="text-muted-foreground">{i.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md truncate text-muted-foreground text-sm">
                      {i.message}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Inquiry from {selectedInquiry?.name}
            </DialogTitle>
            <DialogDescription>
              Received on {selectedInquiry && format(new Date(selectedInquiry.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Email Address</p>
                  <a href={`mailto:${selectedInquiry.email}`} className="text-sm font-medium text-primary hover:underline">
                    {selectedInquiry.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="text-sm font-medium">{selectedInquiry.phone || "Not provided"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Message</p>
                <div className="text-sm bg-white border rounded-lg p-4 whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
