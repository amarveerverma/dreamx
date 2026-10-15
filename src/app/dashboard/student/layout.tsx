import React from 'react';
import { StudentDashboardShell } from '@/components/layout/StudentDashboardShell';

export const metadata = {
  title: 'Student Dashboard | DreamX',
  description: 'Manage your career readiness score, structured programs, mentorship bookings, and AI recommendations.',
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentDashboardShell>{children}</StudentDashboardShell>;
}
