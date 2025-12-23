import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Users, 
  Clock, 
  FileText, 
  Download, 
  RefreshCw,
  TrendingUp,
  UserCheck,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserInfo: React.FC = () => {
  const { user, sessions, userStats, getUserStats } = useAuth();
  const { toast } = useToast();

  // Redirect non-admin users
  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Filter out admin logins
  const filteredSessions = sessions ? sessions.filter(session => !session.user.isAdmin) : [];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const calculateDuration = (login: Date, logout?: Date) => {
    if (!logout) return 'Active';
    const diff = logout.getTime() - login.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  };

  // Function to calculate total duration per user
  const calculateTotalDuration = (email: string) => {
    const userSessions = filteredSessions.filter(s => s.user.email === email && s.logoutTime);
    const totalMinutes = userSessions.reduce((sum, s) => sum + (s.logoutTime!.getTime() - s.loginTime.getTime()) / 60000, 0);
    if (totalMinutes < 60) return `${Math.round(totalMinutes)} mins`;
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Get real user data with resume counts
  const userSessions = filteredSessions.map((session) => {
    const stats = getUserStats(session.user.email);
    return {
      ...session.user,
      resumeCount: stats.resumesCreated,
      analyzedCount: stats.resumesAnalyzed,
      totalDuration: calculateTotalDuration(session.user.email)
    };
  });

  const handleExport = () => {
    toast({
      title: "Exporting Data",
      description: "Session data is being exported to CSV.",
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Data Refreshed",
      description: "User session data has been updated.",
    });
  };

  // Calculate stats from filtered sessions
  const totalUsers = new Set(filteredSessions.map(s => s.user.email)).size;
  const activeSessions = filteredSessions.filter(s => !s.logoutTime).length;
  const completedSessions = filteredSessions.filter(s => s.logoutTime);
  const avgSessionMinutes = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.logoutTime!.getTime() - s.loginTime.getTime()) / 60000, 0) / completedSessions.length)
    : 0;

  // Calculate totals only for non-admin users (those with sessions)
  const nonAdminEmails = new Set(filteredSessions.map(s => s.user.email));
  const totalResumesCreated = userStats
    .filter(stat => nonAdminEmails.has(stat.email))
    .reduce((sum, stat) => sum + stat.resumesCreated, 0);
  const totalResumesAnalyzed = userStats
    .filter(stat => nonAdminEmails.has(stat.email))
    .reduce((sum, stat) => sum + stat.resumesAnalyzed, 0);

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers.toString(),
      change: 'Active users',
      icon: Users,
      color: 'bg-primary/10 text-primary'
    },
    {
      label: 'Active Sessions',
      value: activeSessions.toString(),
      change: 'Currently online',
      icon: UserCheck,
      color: 'bg-success/10 text-success'
    },
    {
      label: 'Avg. Session',
      value: avgSessionMinutes > 0 ? `${avgSessionMinutes} min` : '0 min',
      change: 'Average duration',
      icon: Clock,
      color: 'bg-accent/10 text-accent'
    },
    {
      label: 'Resumes Created',
      value: totalResumesCreated.toString(),
      change: 'Total created',
      icon: FileText,
      color: 'bg-warning/10 text-warning'
    },
    {
      label: 'Resumes Analyzed',
      value: totalResumesAnalyzed.toString(),
      change: 'Total analyzed',
      icon: Activity,
      color: 'bg-info/10 text-info'
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            User Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor user sessions and activity across the platform
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="gradient" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-card hover:shadow-card-hover transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-success" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sessions Table */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                User Sessions
              </CardTitle>
              <CardDescription>
                Recent login activity and session data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">User Email</TableHead>
                  <TableHead className="font-semibold">Login Time</TableHead>
                  <TableHead className="font-semibold">Logout Time</TableHead>
                  <TableHead className="font-semibold">Duration</TableHead>
                  <TableHead className="font-semibold text-right">Resumes Created</TableHead>
                  <TableHead className="font-semibold text-right">Resumes Analyzed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session, index) => (
                  <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {(session.user.email || 'U')[0].toUpperCase()}
                        </div>
                        {session.user.email || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(session.loginTime)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {session.logoutTime ? formatDate(session.logoutTime) : (
                        <span className="inline-flex items-center gap-1 text-success">
                          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                          Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-md bg-muted text-sm">
                        {calculateTotalDuration(session.user.email)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">{userSessions.find(u => u.email === session.user.email)?.resumeCount || 0}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">{userSessions.find(u => u.email === session.user.email)?.analyzedCount || 0}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination hint */}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <p>Showing 4 of 156 users</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserInfo;
