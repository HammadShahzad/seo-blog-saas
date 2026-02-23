"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText } from "lucide-react";
import { UsersTab } from "@/components/admin/user-management";
import { BlogTab } from "@/components/admin/blog-management";

export default function AdminClient() {
  return (
    <Tabs defaultValue="users" className="space-y-4">
      <TabsList>
        <TabsTrigger value="users" className="gap-2">
          <Users className="h-4 w-4" />
          Users
        </TabsTrigger>
        <TabsTrigger value="blog" className="gap-2">
          <FileText className="h-4 w-4" />
          StackSerp Blog
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <UsersTab />
      </TabsContent>

      <TabsContent value="blog">
        <BlogTab />
      </TabsContent>
    </Tabs>
  );
}
