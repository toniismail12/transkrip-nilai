"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  profileFormSchema,
  type ProfileFormInput,
  type ProfileFormOutput,
} from "@/validators/profile.validator";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton } from "@/components/feedback/loading-button";
import type { ApiEnvelope } from "@/lib/api/response";

interface ProfileFormProps {
  profile: {
    username: string;
    name: string;
    email: string | null;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormInput, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email ?? "",
    },
  });

  async function onSubmit(values: ProfileFormOutput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json: ApiEnvelope<unknown> = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal memperbarui profil");
        return;
      }

      toast.success("Profil berhasil diperbarui");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormItem>
              <FormLabel>Username</FormLabel>
              <Input value={profile.username} disabled readOnly />
              <FormDescription>
                Username tidak dapat diubah. Hubungi administrator bila perlu penggantian.
              </FormDescription>
            </FormItem>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} value={field.value ?? ""} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="nama@institusi.ac.id"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end">
            <LoadingButton type="submit" isLoading={isSubmitting}>
              Simpan Perubahan
            </LoadingButton>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
