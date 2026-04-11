"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockTickets = [
  {
    id: "TCK-8921",
    user: { name: "Sarah Jenkins", email: "sarah.j@example.com", role: "Homeowner", avatar: "SJ" },
    category: "Technical Issue",
    priority: "High",
    status: "Open",
    createdAt: "2026-03-14T09:30:00Z",
    assignedTo: "Unassigned",
    subject: "Cannot upload video evidence",
  },
  {
    id: "TCK-8920",
    user: { name: "Apex Builders Ltd", email: "contact@apexbuild.co.uk", role: "Builder", avatar: "AB" },
    category: "Billing/Payment",
    priority: "Medium",
    status: "In Progress",
    createdAt: "2026-03-13T14:15:00Z",
    assignedTo: "Admin User",
    subject: "Missing payout for Claim #441",
  },
  {
    id: "TCK-8919",
    user: { name: "Mark Davies", email: "m.davies@example.com", role: "Claim Handler", avatar: "MD" },
    category: "Account Problem",
    priority: "Low",
    status: "Resolved",
    createdAt: "2026-03-12T11:05:00Z",
    assignedTo: "Sarah Smith",
    subject: "Need to update contact number",
  },
  {
    id: "TCK-8918",
    user: { name: "Emma Wright", email: "emma.w@example.com", role: "Homeowner", avatar: "EW" },
    category: "General Inquiry",
    priority: "Medium",
    status: "Closed",
    createdAt: "2026-03-11T16:45:00Z",
    assignedTo: "Admin User",
    subject: "How does the matching process work?",
  },
  {
    id: "TCK-8917",
    user: { name: "BuildTech Solutions", email: "info@buildtech.co.uk", role: "Builder", avatar: "BT" },
    category: "KYC Issue",
    priority: "High",
    status: "Open",
    createdAt: "2026-03-10T09:20:00Z",
    assignedTo: "Unassigned",
    subject: "Insurance document rejected incorrectly",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Open</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">In Progress</Badge>;
      case "Resolved":
        return <Badge variant="outline" className="bg-teal-50 text-teal-600 border-teal-200">Resolved</Badge>;
      case "Closed":
        return <Badge variant="outline" className="bg-neutral-100 text-neutral-600 border-neutral-100">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">High</Badge>;
      case "Medium":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Medium</Badge>;
      case "Low":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Homeowner":
        return <Badge variant="outline" className="bg-neutral-100 text-neutral-600 border-neutral-100 text-[10px] uppercase font-bold tracking-wider">Homeowner</Badge>;
      case "Builder":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-[10px] uppercase font-bold tracking-wider">Builder</Badge>;
      case "Claim Handler":
        return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 text-[10px] uppercase font-bold tracking-wider">Handler</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">{role}</Badge>;
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl tracking-tight text-neutral-900 font-serif">Support Tickets</h1>
          <p className="text-neutral-500 mt-1">Manage user inquiries, technical issues, and billing support.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="shadow-none rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button className="bg-primary text-primary-foreground hover:brightness-110 shadow-none rounded-xl">
            Assign to Me
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            type="search"
            placeholder="Search tickets by ID, user, or subject..."
            className="pl-8 bg-white border-neutral-100 rounded-xl shadow-none focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div variants={item} className="border border-neutral-100 bg-white rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50/50 hover:bg-neutral-50/50">
              <TableHead className="w-[100px] font-medium">Ticket ID</TableHead>
              <TableHead className="font-medium">User & Subject</TableHead>
              <TableHead className="font-medium hidden md:table-cell">Category</TableHead>
              <TableHead className="font-medium hidden md:table-cell">Priority</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium hidden lg:table-cell">Assigned To</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTickets.map((ticket) => (
              <TableRow key={ticket.id} className="group hover:bg-neutral-50/50">
                <TableCell className="font-medium text-neutral-900">{ticket.id}</TableCell>
                <TableCell>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 rounded-xl mt-1">
                      <AvatarFallback className="bg-neutral-100 text-neutral-600 rounded-xl text-xs">
                        {ticket.user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-neutral-900 mb-0.5">{ticket.subject}</div>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        {ticket.user.name}
                        <span className="text-neutral-300">•</span>
                        {getRoleBadge(ticket.user.role)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-neutral-600">{ticket.category}</TableCell>
                <TableCell className="hidden md:table-cell">{getPriorityBadge(ticket.priority)}</TableCell>
                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                <TableCell className="hidden lg:table-cell text-neutral-600">{ticket.assignedTo}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Reply</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Assign to me</DropdownMenuItem>
                      <DropdownMenuItem>Update Status</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}
