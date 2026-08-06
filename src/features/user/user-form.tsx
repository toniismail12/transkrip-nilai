"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  userCreateSchema,
  userUpdateSchema,
  type UserCreateInput,
  type UserCreateOutput,
} from "@/validators/user.validator";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingButton } from "@/components/feedback/loading-button";
import { Button } from "@/components/ui/button";
import type { ApiEnvelope } from "@/lib/api/response";
import type { SafeUser } from "@/services/user.service";

const ROLE_OPTIONS: { value: UserCreateOutput["role"]; label: string }[] = [
  { value: "ADMIN", label: "Administrator" },
  { value: "OPERATOR", label: "Operator" },
];

const ROLE_ITEMS: Record<string, string> = Object.fromEntries(
  ROLE_OPTIONS.map((option) => [option.value, option.label]),
);

interface UserFormProps {
  user?: SafeUser;
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(user);

  // The edit schema relaxes `password` to optional so an admin can save a user
  // without resetting their credentials. Both schemas share the same field shape
  // otherwise, so the form is typed once against the (stricter) create schema and
  // the resolver is swapped at runtime — the cast below is safe because a value
  // produced by userUpdateSchema always satisfies the wider `password` shape.
  const form = useForm<UserCreateInput, unknown, UserCreateOutput>({
    resolver: (isEdit ? zodResolver(userUpdateSchema) : zodResolver(userCreateSchema)) as Resolver<
      UserCreateInput,
      unknown,
      UserCreateOutput
    >,
    defaultValues: {
      username: user?.username ?? "",
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? ("" as unknown as UserCreateInput["role"]),
    },
  });

  async function onSubmit(values: UserCreateOutput) {
    setIsSubmitting(true);
    try {
      const res = await fetch(isEdit ? `/api/user/${user!.id}` : "/api/user", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json: ApiEnvelope<unknown> = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message || "Gagal menyimpan data");
        return;
      }

      toast.success(isEdit ? "User berhasil diperbarui" : "User berhasil ditambahkan");
      router.push("/user");
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
            <CardTitle>{isEdit ? "Edit User" : "Tambah User"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="johndoe"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
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
                      placeholder="john@example.com"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    items={ROLE_ITEMS}
                    value={field.value || ""}
                    onValueChange={(value) => field.onChange(value as UserCreateInput["role"])}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  {isEdit ? (
                    <FormDescription>
                      Biarkan kosong jika tidak ingin mengubah password.
                    </FormDescription>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.back()}
            >
              Batal
            </Button>
            <LoadingButton type="submit" isLoading={isSubmitting}>
              Simpan
            </LoadingButton>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
