import { useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useGetAppointmentsByPractitionerIdQuery,
  useGetUsersQuery,
  useRespondToAppointmentMutation,
} from '@/store/api';

const getDisplayName = (user) => {
  if (!user) {
    return 'Unknown';
  }

  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return name || user.userName || user.email || user.clerkUserId;
};

export const PractitionerAppointmentsLive = () => {
  const { user } = useUser();
  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useGetAppointmentsByPractitionerIdQuery(user?.id, { skip: !user?.id });
  const { data: users = [] } = useGetUsersQuery();
  const [respondToAppointment, { isLoading: isResponding }] = useRespondToAppointmentMutation();

  const usersByClerkId = useMemo(() => {
    const map = new Map();
    users.forEach((entry) => {
      if (entry.clerkUserId) {
        map.set(entry.clerkUserId, entry);
      }
    });
    return map;
  }, [users]);

  const assignedAppointments = appointments.filter((appointment) => appointment.status === 'assigned');
  const confirmedAppointments = appointments.filter((appointment) => appointment.status === 'confirmed');

  const handleResponse = async (appointmentId, status) => {
    try {
      await respondToAppointment({ appointmentId, status }).unwrap();
    } catch (error) {
      console.error('Failed to update appointment', error);
      alert(error?.data?.message || 'Unable to update appointment.');
    }
  };

  if (isLoading) {
    return <p className="p-8 text-sm text-slate-600">Loading appointments...</p>;
  }

  if (isError) {
    return <p className="p-8 text-sm text-red-600">Unable to load appointments.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
        <p className="mt-2 text-sm text-slate-600">
          Admin-assigned work lands here first. Confirming it finalizes the appointment and sends the update back to the referrer.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AppointmentSection
          title="Awaiting your response"
          description="Assigned by admin and waiting for confirmation."
          appointments={assignedAppointments}
          usersByClerkId={usersByClerkId}
          isResponding={isResponding}
          onRespond={handleResponse}
          allowResponse
        />
        <AppointmentSection
          title="Confirmed appointments"
          description="Appointments already accepted by you."
          appointments={confirmedAppointments}
          usersByClerkId={usersByClerkId}
          isResponding={isResponding}
          onRespond={handleResponse}
        />
      </div>
    </div>
  );
};

const AppointmentSection = ({
  title,
  description,
  appointments,
  usersByClerkId,
  isResponding,
  onRespond,
  allowResponse = false,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {appointments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          No appointments in this section.
        </div>
      ) : (
        appointments.map((appointment) => {
          const patient = usersByClerkId.get(appointment.patientClerkUserId);
          const assignedBy = usersByClerkId.get(appointment.assignedByClerkUserId);

          return (
            <div key={appointment._id} className="rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{appointment.serviceType || 'Appointment'}</h3>
                  <p className="text-sm text-slate-600">
                    Patient: {patient ? getDisplayName(patient) : appointment.patientClerkUserId}
                  </p>
                </div>
                <Badge className={appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}>
                  {appointment.status}
                </Badge>
              </div>

              <dl className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <div>
                  <dt className="font-medium text-slate-900">Referral</dt>
                  <dd>{String(appointment.referralId)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900">Assignment source</dt>
                  <dd>
                    {appointment.assignmentSource === 'admin'
                      ? `Assigned by ${assignedBy ? getDisplayName(assignedBy) : 'admin'}`
                      : 'Claimed from referral queue'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900">Created</dt>
                  <dd>{new Date(appointment.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900">Reason</dt>
                  <dd>{appointment.referralReason || '-'}</dd>
                </div>
              </dl>

              {allowResponse ? (
                <div className="mt-4 flex gap-3">
                  <Button disabled={isResponding} onClick={() => onRespond(appointment._id, 'confirmed')}>
                    Confirm appointment
                  </Button>
                  <Button disabled={isResponding} variant="outline" onClick={() => onRespond(appointment._id, 'rejected')}>
                    Reject
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </CardContent>
  </Card>
);