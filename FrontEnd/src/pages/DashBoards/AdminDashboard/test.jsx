import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { commonColors, tableTheme, cardTheme } from "@/lib/theme";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAssignReferralByIdMutation,
  useGetReferralsQuery,
  useGetUsersQuery,
} from "@/store/api";

const getFullName = (user) => {
  if (!user) return "Unknown";
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return fullName || user.userName || user.email || "Unknown";
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

export const TestFeature = () => {
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState("");

  const {
    data: referrals = [],
    isLoading: isReferralsLoading,
    isError: isReferralsError,
    error: referralsError,
    refetch: refetchReferrals,
  } = useGetReferralsQuery();

  const { data: users = [] } = useGetUsersQuery();
  const { data: practitioners = [], isLoading: isPractitionersLoading } = useGetUsersQuery({
    role: "practitioner",
  });

  const [assignReferralById, { isLoading: isAssigning }] = useAssignReferralByIdMutation();

  console.log("Referrals Query State:", {
    data: referrals,
    isLoading: isReferralsLoading,
    isError: isReferralsError,
    error: referralsError,
  });

  const usersByClerkId = useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      if (user.clerkUserId) {
        map.set(user.clerkUserId, user);
      }
    });
    return map;
  }, [users]);

  const practitionersByClerkId = useMemo(() => {
    const map = new Map();
    practitioners.forEach((practitioner) => {
      if (practitioner.clerkUserId) {
        map.set(practitioner.clerkUserId, practitioner);
      }
    });
    return map;
  }, [practitioners]);

  const openReferralDetails = (referral) => {
    setSelectedReferral(referral);
    setSelectedPractitionerId("");
  };

  const closeReferralDetails = () => {
    setSelectedReferral(null);
    setSelectedPractitionerId("");
  };

  const handleAssignPractitioner = async () => {
    if (!selectedReferral?._id || !selectedPractitionerId) return;

    await assignReferralById({
      referralId: selectedReferral._id,
      practitionerClerkUserId: selectedPractitionerId,
    }).unwrap();

    await refetchReferrals();

    const assignedPractitioner = practitionersByClerkId.get(selectedPractitionerId);
    setSelectedReferral((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        practitionerClerkUserId: selectedPractitionerId,
        assignedDate: new Date().toISOString(),
        assignedPractitionerName: getFullName(assignedPractitioner),
      };
    });

    setSelectedPractitionerId("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Referral Management</h1>
          <p className="mt-2 text-sm text-slate-600">
            View, track, and assign referrals to practitioners.
          </p>
        </div>
        <Button variant="outline" onClick={refetchReferrals}>Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Referrals</CardTitle>
          <CardDescription>
            Click any referral row to view full details and assign practitioner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border-slate-200 border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${tableTheme.header.bg} ${tableTheme.header.border} border-b`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${tableTheme.header.text} uppercase tracking-wider`}>
                      Name
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${tableTheme.header.text} uppercase tracking-wider`}>
                      Patient ID
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${tableTheme.header.text} uppercase tracking-wider`}>
                      Service Type
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${tableTheme.header.text} uppercase tracking-wider`}>
                      Assigned
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${tableTheme.header.text} uppercase tracking-wider`}>
                      Submitted Date
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${tableTheme.header.text} uppercase tracking-wider`}>
                      Accepted
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${tableTheme.header.text} uppercase tracking-wider`}>
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isReferralsLoading ? (
                    <tr>
                      <td className={`px-4 py-8 text-sm ${tableTheme.cell.text}`} colSpan={7}>
                        Loading referrals...
                      </td>
                    </tr>
                  ) : isReferralsError ? (
                    <tr>
                      <td className={`px-4 py-8 text-sm ${commonColors.status.error.text}`} colSpan={7}>
                        Error loading referrals: {referralsError?.data?.message || referralsError?.error || "Unknown error"}
                      </td>
                    </tr>
                  ) : referrals.length === 0 ? (
                    <tr>
                      <td className={`px-4 py-8 text-sm ${tableTheme.cell.text}`} colSpan={7}>
                        No referrals found.
                      </td>
                    </tr>
                  ) : (
                    referrals.map((referral) => {
                      const patient = usersByClerkId.get(referral.patientClerkUserId);
                      const practitioner = practitionersByClerkId.get(referral.practitionerClerkUserId);
                      const isAssigned = Boolean(referral.practitionerClerkUserId);

                      return (
                        <tr
                          key={referral._id}
                          className={`${tableTheme.row.hover} cursor-pointer transition-colors`}
                          onClick={() => openReferralDetails(referral)}
                        >
                          <td className={`px-4 py-4 text-sm font-medium ${tableTheme.row.text}`}>
                            {getFullName(patient)}
                          </td>
                          <td className={`px-4 py-4 text-sm ${tableTheme.cell.text}`}>{referral.patientClerkUserId}</td>
                          <td className={`px-4 py-4 text-sm ${tableTheme.cell.text}`}>{referral.serviceType || "-"}</td>
                          <td className={`px-4 py-4 text-sm ${tableTheme.cell.text}`}>
                            {isAssigned ? getFullName(practitioner) : "Unassigned"}
                          </td>
                          <td className={`px-4 py-4 text-sm ${tableTheme.cell.text}`}>{formatDate(referral.createdAt)}</td>
                          <td className="px-4 py-4">
                            <Badge
                              className={referral.acceptedDate
                                ? `${commonColors.status.success.bg} ${commonColors.status.success.text} ${commonColors.status.success.hover}`
                                : `${commonColors.slate[100]} ${commonColors.slate[700]} hover:bg-slate-100`}
                            >
                              {referral.acceptedDate ? "Yes" : "No"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              className={referral.completedDate
                                ? `${commonColors.status.success.bg} ${commonColors.status.success.text} ${commonColors.status.success.hover}`
                                : `${commonColors.slate[100]} ${commonColors.slate[700]} hover:bg-slate-100`}
                            >
                              {referral.completedDate ? "Yes" : "No"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={Boolean(selectedReferral)} onOpenChange={(open) => !open && closeReferralDetails()}>
        <SheetContent className="sm:max-w-xl overflow-y-auto bg-white text-slate-900 border-l border-slate-200 shadow-2xl">
          <SheetHeader>
            <SheetTitle>Referral Details</SheetTitle>
            <SheetDescription>
              Full referral information and assignment controls.
            </SheetDescription>
          </SheetHeader>

          {selectedReferral && (
            <div className="space-y-4 px-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Referral ID</p>
                  <p className="font-medium text-slate-900">{selectedReferral._id}</p>
                </div>
                <div>
                  <p className="text-slate-500">Patient ID</p>
                  <p className="font-medium text-slate-900">{selectedReferral.patientClerkUserId}</p>
                </div>
                <div>
                  <p className="text-slate-500">Submitted By</p>
                  <p className="font-medium text-slate-900">{selectedReferral.submittedByClerkUserId || "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Service Type</p>
                  <p className="font-medium text-slate-900">{selectedReferral.serviceType || "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <p className="font-medium text-slate-900">{selectedReferral.referralStatus || "pending"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Assigned Date</p>
                  <p className="font-medium text-slate-900">{formatDate(selectedReferral.assignedDate)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Accepted Date</p>
                  <p className="font-medium text-slate-900">{formatDate(selectedReferral.acceptedDate)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Completed Date</p>
                  <p className="font-medium text-slate-900">{formatDate(selectedReferral.completedDate)}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-sm">Reason</p>
                <p className="text-slate-900">{selectedReferral.referralReason || "-"}</p>
              </div>

              <div>
                <p className="text-slate-500 text-sm">Notes</p>
                <p className="text-slate-900 whitespace-pre-wrap">{selectedReferral.notes || "-"}</p>
              </div>

              {!selectedReferral.practitionerClerkUserId && (
                <div className="space-y-2 rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-900">Assign Practitioner</p>
                  <Select
                    value={selectedPractitionerId}
                    onValueChange={setSelectedPractitionerId}
                    disabled={isPractitionersLoading || isAssigning}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a practitioner" />
                    </SelectTrigger>
                    <SelectContent>
                      {practitioners.map((practitioner) => (
                        <SelectItem key={practitioner._id} value={practitioner.clerkUserId}>
                          {getFullName(practitioner)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <SheetFooter>
            {!selectedReferral?.practitionerClerkUserId && (
              <Button
                onClick={handleAssignPractitioner}
                disabled={!selectedPractitionerId || isAssigning}
              >
                {isAssigning ? "Saving..." : "Save Assignment"}
              </Button>
            )}
            <Button variant="outline" onClick={closeReferralDetails}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

