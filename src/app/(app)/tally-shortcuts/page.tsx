
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Keyboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import shortcuts from "@/lib/tally-shortcuts.json";
import * as Icons from "lucide-react";

type Shortcut = {
  name: string;
  category: "Voucher" | "Master" | "Report";
  shortcut: string;
  description: string;
  icon: keyof typeof Icons;
};

export default function TallyShortcutsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredShortcuts = useMemo(() => {
    if (!searchTerm) {
      return shortcuts;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return shortcuts.filter(
      (shortcut) =>
        shortcut.name.toLowerCase().includes(lowercasedFilter) ||
        shortcut.description.toLowerCase().includes(lowercasedFilter) ||
        shortcut.shortcut.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm]);

  const groupedShortcuts = useMemo(() => {
    return filteredShortcuts.reduce((acc, shortcut) => {
      const { category } = shortcut;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(shortcut);
      return acc;
    }, {} as Record<string, Shortcut[]>);
  }, [filteredShortcuts]);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Voucher":
        return <Badge variant="default">Voucher</Badge>;
      case "Master":
        return <Badge variant="secondary">Master</Badge>;
      case "Report":
        return <Badge className="bg-sky-500 hover:bg-sky-600">Report</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const renderIcon = (iconName: keyof typeof Icons) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent className="size-4 text-muted-foreground" /> : null;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4 mx-auto">
          <Keyboard className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Tally Shortcuts</h1>
        <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
          A quick reference guide for popular Tally ERP keyboard shortcuts to speed up your workflow.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search shortcuts..."
              className="pl-10 w-full md:w-1/2 lg:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(groupedShortcuts).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4">{category}</h2>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Action</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Shortcut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((shortcut) => (
                        <TableRow key={shortcut.name}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                               {renderIcon(shortcut.icon as keyof typeof Icons)}
                               <span>{shortcut.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{shortcut.description}</TableCell>
                          <TableCell className="text-right">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                              {shortcut.shortcut}
                            </kbd>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
             {filteredShortcuts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No shortcuts found for "{searchTerm}"</p>
                </div>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
