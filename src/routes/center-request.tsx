import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { submitCenterRequest } from "@/lib/center-request.functions";

export const Route = createFileRoute("/center-request")({
  component: CenterRequestPage,
});

function CenterRequestPage() {
  const { isAuthenticated, loading } = useAuth();
  const [centerName, setCenterName] = useState("");
  const [centerAddress, setCenterAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const submit = useMutation({
    mutationFn: () =>
      submitCenterRequest({
        data: { centerName, centerAddress, contactNumber },
      }),
    onSuccess: () => {
      toast.success("تم إرسال طلب السنتر للإدارة.");
      setCenterName("");
      setCenterAddress("");
      setContactNumber("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (loading) return <main dir="rtl" className="page-shell" />;
  if (!isAuthenticated) return <Navigate to="/auth" />;

  return (
    <main dir="rtl" className="page-shell max-w-3xl">
      <PageHeader
        title="تقديم طلب كـسنتر"
        subtitle="ابعت بيانات السنتر وفريق WISO هيراجع الطلب ويتواصل معاك."
      />
      <Card className="mt-7">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="size-5" /> بيانات السنتر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="center-name">اسم السنتر</Label>
            <Input id="center-name" value={centerName} onChange={(e) => setCenterName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="center-address">عنوان السنتر</Label>
            <Textarea id="center-address" value={centerAddress} onChange={(e) => setCenterAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="center-phone">رقم التواصل</Label>
            <Input id="center-phone" inputMode="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
          </div>
          <Button
            className="w-full"
            disabled={submit.isPending || !centerName.trim() || !centerAddress.trim() || !contactNumber.trim()}
            onClick={() => submit.mutate()}
          >
            {submit.isPending ? "جارٍ إرسال الطلب..." : "إرسال الطلب"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
