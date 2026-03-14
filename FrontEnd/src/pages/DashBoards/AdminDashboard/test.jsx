import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { commonColors, tableTheme } from "@/lib/theme";
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

/*
 Team F - Centralized admin referral intake dashboard with triage, search, and assignment actions (TMF-005) . Done by Danuja and Isuru
*/
 
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
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState({ manager: true, self: true, external: true });
  const [statusFilter, setStatusFilter] = useState("all");
 
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

  const availablePractitioners = useMemo(
    () =>
      practitioners.filter(
        (practitioner) =>
          practitioner?.role === "practitioner" &&
          Boolean(practitioner?.clerkUserId) &&
          practitioner?.isActive !== false
      ),
    [practitioners]
  );

  const getReferralSource = (referral) => {
    const submittedBy = usersByClerkId.get(referral.submittedByClerkUserId);
    if (!submittedBy) return "external";
    if (referral.submittedByClerkUserId === referral.patientClerkUserId) return "self";
    if (submittedBy.role === "manager") return "manager";
    return "external";
  };

  const getTriageStatus = (referral) => {
    if (referral.practitionerClerkUserId) return "appointed";
    if (referral.referralStatus === "pending") return "pending";
    return "triage";
  };

  const statusBadgeClass = {
    pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    triage: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    appointed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  };
 
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
    availablePractitioners.forEach((practitioner) => {
      if (practitioner.clerkUserId) {
        map.set(practitioner.clerkUserId, practitioner);
      }
    });
    return map;
  }, [availablePractitioners]);
 
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

    try {
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
      toast.success("Practitioner assigned successfully.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to assign practitioner.");
    }
  };

  const filteredReferrals = useMemo(() => {
    return referrals.filter((referral) => {
      const source = getReferralSource(referral);
      const triageStatus = getTriageStatus(referral);
      const patient = usersByClerkId.get(referral.patientClerkUserId);
      const submittedBy = usersByClerkId.get(referral.submittedByClerkUserId);

      const searchable = [
        getFullName(patient),
        getFullName(submittedBy),
        referral.patientClerkUserId,
        referral.serviceType,
        referral.referralReason,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchable.includes(search.toLowerCase());
      const matchesSource = sourceFilter[source];
      const matchesStatus = statusFilter === "all" ? true : triageStatus === statusFilter;

      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [referrals, search, sourceFilter, statusFilter, usersByClerkId]);

  const summary = useMemo(() => {
    const pending = referrals.filter((referral) => getTriageStatus(referral) === "pending").length;
    const unassigned = referrals.filter((referral) => !referral.practitionerClerkUserId).length;

    return {
      total: referrals.length,
      pending,
      unassigned,
      practitioners: availablePractitioners.length,
    };
  }, [referrals, availablePractitioners]);
 
  return (
    <div className="space-y-6 rounded-2xl border border-blue-100/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Referral Management</h1>
          <p className="mt-2 text-sm text-slate-600">
            View, track, and assign referrals to practitioners.
          </p>
        </div>
        <Button className="border-blue-700 bg-blue-600 text-white hover:bg-blue-700" onClick={refetchReferrals}>Refresh</Button>
      </div>

      <Card className="border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle>Referral Snapshot</CardTitle>
          <CardDescription>Quick visibility for current triage workload and staffing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Referrals</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{summary.total}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Pending</p>
              <p className="mt-2 text-2xl font-bold text-amber-900">{summary.pending}</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Unassigned</p>
              <p className="mt-2 text-2xl font-bold text-blue-900">{summary.unassigned}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Available Practitioners</p>
              <p className="mt-2 text-2xl font-bold text-emerald-900">{summary.practitioners}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle>Triage Filters</CardTitle>
          <CardDescription>Filter by source, status, and free-text search.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search referrals"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-blue-200 bg-white text-slate-900 shadow-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="border border-blue-200 bg-white text-slate-900 shadow-xl">
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="triage">Triage</SelectItem>
                <SelectItem value="appointed">Appointed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-3 text-xs text-slate-700">
              {["manager", "self", "external"].map((source) => (
                <label key={source} className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={sourceFilter[source]}
                    onChange={(e) =>
                      setSourceFilter((prev) => ({ ...prev, [source]: e.target.checked }))
                    }
                  />
                  <span className="capitalize">{source}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
 
      <Card className="border-blue-100 shadow-sm">
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
                  ) : filteredReferrals.length === 0 ? (
                    <tr>
                      <td className={`px-4 py-8 text-sm ${tableTheme.cell.text}`} colSpan={7}>
                        No referrals found.
                      </td>
                    </tr>
                  ) : (
                    filteredReferrals.map((referral) => {
                      const patient = usersByClerkId.get(referral.patientClerkUserId);
                      const practitioner = practitionersByClerkId.get(referral.practitionerClerkUserId);
                      const isAssigned = Boolean(referral.practitionerClerkUserId);
                      const source = getReferralSource(referral);
                      const triageStatus = getTriageStatus(referral);
 
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
                            <div className="space-y-1">
                              <Badge className={statusBadgeClass[triageStatus]}>
                                {triageStatus}
                              </Badge>
                              <p className="text-[11px] capitalize text-slate-500">source: {source}</p>
                            </div>
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
                  <p className="text-slate-500">Patient</p>
                  <p className="font-medium text-slate-900">
                    {getFullName(usersByClerkId.get(selectedReferral.patientClerkUserId))}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Submitted By</p>
                  <p className="font-medium text-slate-900">
                    {getFullName(usersByClerkId.get(selectedReferral.submittedByClerkUserId))}
                  </p>
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

              <div>
                <p className="text-slate-500 text-sm">Assigned Practitioner</p>
                <p className="text-slate-900 font-medium">
                  {selectedReferral.practitionerClerkUserId
                    ? getFullName(practitionersByClerkId.get(selectedReferral.practitionerClerkUserId))
                    : "Unassigned"}
                </p>
              </div>
 
              {!selectedReferral.practitionerClerkUserId && (
                <div className="space-y-2 rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-900">Assign Practitioner</p>
                  <Select
                    value={selectedPractitionerId}
                    onValueChange={setSelectedPractitionerId}
                    disabled={isPractitionersLoading || isAssigning}
                  >
                    <SelectTrigger className="w-full border-blue-200 bg-white text-slate-900 shadow-sm">
                      <SelectValue placeholder="Select a practitioner" />
                    </SelectTrigger>
                    <SelectContent className="border border-blue-200 bg-white text-slate-900 shadow-xl">
                      {availablePractitioners.map((practitioner) => (
                        <SelectItem key={practitioner._id} value={practitioner.clerkUserId}>
                          {getFullName(practitioner)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availablePractitioners.length === 0 && !isPractitionersLoading && (
                    <p className="text-xs text-amber-700">
                      No active practitioners are available for assignment.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
 
          <SheetFooter>
            {!selectedReferral?.practitionerClerkUserId && (
              <Button
                onClick={handleAssignPractitioner}
                disabled={!selectedPractitionerId || isAssigning || availablePractitioners.length === 0}
                className="border-blue-700 bg-blue-600 text-white hover:bg-blue-700"
              >
                {isAssigning ? "Saving..." : "Save Assignment"}
              </Button>
            )}
            <Button className="border-blue-700 bg-blue-600 text-white hover:bg-blue-700" onClick={closeReferralDetails}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};