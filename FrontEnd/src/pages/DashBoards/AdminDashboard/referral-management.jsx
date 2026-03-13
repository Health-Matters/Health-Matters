import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  useAssignReferralByIdMutation,
  useGetAppointmentsQuery,
  useGetReferralsQuery,
  useGetUsersQuery,
} from '@/store/api';

const getDisplayName = (user) => {
  if (!user) {
    return 'Unknown';
  }

  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return name || user.userName || user.email || user.clerkUserId;
};

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString();
};

const getAppointmentBadgeClass = (status) => {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
    case 'assigned':
      return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
    case 'rejected':
      return 'bg-red-100 text-red-700 hover:bg-red-100';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700 hover:bg-rose-100';
    default:
      return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
  }
};

export const AdminReferralManagement = () => {
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [selectedPractitionerId, setSelectedPractitionerId] = useState('');

  const {
    data: referrals = [],
    isLoading: isReferralsLoading,
    isError: isReferralsError,
    error: referralsError,
    refetch: refetchReferrals,
  } = useGetReferralsQuery();

  const { data: appointments = [] } = useGetAppointmentsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: practitioners = [], isLoading: isPractitionersLoading } = useGetUsersQuery({
    role: 'practitioner',
  });
  const [assignReferralById, { isLoading: isAssigning }] = useAssignReferralByIdMutation();

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
    practitioners.forEach((user) => {
      if (user.clerkUserId) {
        map.set(user.clerkUserId, user);
      }
    });
    return map;
  }, [practitioners]);

  const appointmentsByReferralId = useMemo(() => {
    const map = new Map();
    appointments.forEach((appointment) => {
      if (appointment.referralId) {
        map.set(String(appointment.referralId), appointment);
      }
    });
    return map;
  }, [appointments]);

  const summary = useMemo(
    () => ({
      pending: appointments.filter((appointment) => appointment.status === 'pending').length,
      assigned: appointments.filter((appointment) => appointment.status === 'assigned').length,
      confirmed: appointments.filter((appointment) => appointment.status === 'confirmed').length,
      cancelled: appointments.filter((appointment) => appointment.status === 'cancelled').length,
    }),
    [appointments]
  );

  const openReferralDetails = (referral) => {
    setSelectedReferral(referral);
    setSelectedPractitionerId('');
  };

  const closeReferralDetails = () => {
    setSelectedReferral(null);
    setSelectedPractitionerId('');
  };

  const handleAssignPractitioner = async () => {
    if (!selectedReferral?._id || !selectedPractitionerId) {
      return;
    }

    await assignReferralById({
      referralId: selectedReferral._id,
      practitionerClerkUserId: selectedPractitionerId,
    }).unwrap();

    await refetchReferrals();

    setSelectedReferral((current) =>
      current
        ? {
            ...current,
            practitionerClerkUserId: selectedPractitionerId,
            assignedDate: new Date().toISOString(),
          }
        : current
    );
    setSelectedPractitionerId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Referral Management</h1>
          <p className="mt-2 text-sm text-slate-600">
            Every referral now creates a pending appointment. Admin assignment moves it to the practitioner queue, and practitioner acceptance confirms it.
          </p>
        </div>
        <Button variant="outline" onClick={refetchReferrals}>Refresh</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Pending appointments</CardDescription>
            <CardTitle>{summary.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Assigned to practitioners</CardDescription>
            <CardTitle>{summary.assigned}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Confirmed appointments</CardDescription>
            <CardTitle>{summary.confirmed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cancelled appointments</CardDescription>
            <CardTitle>{summary.cancelled}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All referrals</CardTitle>
          <CardDescription>
            Select a referral to inspect the linked appointment and assign a practitioner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Patient</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Referral ID</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Service</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Referral</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Appointment</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Practitioner</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isReferralsLoading ? (
                  <tr>
                    <td className="px-4 py-8 text-slate-500" colSpan={7}>Loading referrals...</td>
                  </tr>
                ) : isReferralsError ? (
                  <tr>
                    <td className="px-4 py-8 text-red-600" colSpan={7}>
                      {referralsError?.data?.message || referralsError?.error || 'Unable to load referrals.'}
                    </td>
                  </tr>
                ) : referrals.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-slate-500" colSpan={7}>No referrals found.</td>
                  </tr>
                ) : (
                  referrals.map((referral) => {
                    const patient = usersByClerkId.get(referral.patientClerkUserId);
                    const practitioner = practitionersByClerkId.get(referral.practitionerClerkUserId);
                    const appointment = appointmentsByReferralId.get(referral._id);

                    return (
                      <tr
                        key={referral._id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => openReferralDetails(referral)}
                      >
                        <td className="px-4 py-4 font-medium text-slate-900">{getDisplayName(patient)}</td>
                        <td className="px-4 py-4 text-slate-600">{referral._id}</td>
                        <td className="px-4 py-4 text-slate-600">{referral.serviceType || '-'}</td>
                        <td className="px-4 py-4">
                          <Badge className={getAppointmentBadgeClass(referral.referralStatus === 'accepted' ? 'confirmed' : referral.referralStatus)}>
                            {referral.referralStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={getAppointmentBadgeClass(appointment?.status)}>
                            {appointment?.status || 'pending'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{practitioner ? getDisplayName(practitioner) : 'Unassigned'}</td>
                        <td className="px-4 py-4 text-slate-600">{formatDate(referral.createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={Boolean(selectedReferral)} onOpenChange={(open) => !open && closeReferralDetails()}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Referral details</SheetTitle>
            <SheetDescription>
              Review the referral, inspect the linked appointment, and assign it to a practitioner.
            </SheetDescription>
          </SheetHeader>

          {selectedReferral ? (
            <div className="space-y-4 px-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Referral ID" value={selectedReferral._id} />
                <Info label="Patient" value={selectedReferral.patientClerkUserId} />
                <Info label="Submitted by" value={selectedReferral.submittedByClerkUserId || '-'} />
                <Info label="Service" value={selectedReferral.serviceType || '-'} />
                <Info label="Referral status" value={selectedReferral.referralStatus || 'pending'} />
                <Info
                  label="Appointment status"
                  value={appointmentsByReferralId.get(selectedReferral._id)?.status || 'pending'}
                />
                <Info label="Assigned date" value={formatDate(selectedReferral.assignedDate)} />
                <Info label="Accepted date" value={formatDate(selectedReferral.acceptedDate)} />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                {appointmentsByReferralId.get(selectedReferral._id)?.status === 'assigned'
                  ? 'This appointment is waiting for the assigned practitioner to confirm it from their dashboard.'
                  : appointmentsByReferralId.get(selectedReferral._id)?.status === 'confirmed'
                  ? 'This appointment has already been confirmed by a practitioner.'
                  : 'This appointment is still pending and can be assigned to a practitioner from here.'}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900">Reason</p>
                <p className="mt-1 text-sm text-slate-600">{selectedReferral.referralReason || '-'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900">Notes</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{selectedReferral.notes || '-'}</p>
              </div>

              {!selectedReferral.practitionerClerkUserId ? (
                <div className="space-y-2 rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-900">Assign practitioner</p>
                  <Select
                    value={selectedPractitionerId}
                    onValueChange={setSelectedPractitionerId}
                    disabled={isPractitionersLoading || isAssigning}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a practitioner" />
                    </SelectTrigger>
                    <SelectContent>
                      {practitioners.map((practitioner) => (
                        <SelectItem key={practitioner._id} value={practitioner.clerkUserId}>
                          {getDisplayName(practitioner)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>
          ) : null}

          <SheetFooter>
            {!selectedReferral?.practitionerClerkUserId ? (
              <Button disabled={!selectedPractitionerId || isAssigning} onClick={handleAssignPractitioner}>
                {isAssigning ? 'Saving...' : 'Save assignment'}
              </Button>
            ) : null}
            <Button variant="outline" onClick={closeReferralDetails}>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-slate-500">{label}</p>
    <p className="font-medium text-slate-900">{value}</p>
  </div>
);