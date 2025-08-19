import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Shield, Calendar, FolderOpen, FileText, Timer, Users, Building2 } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return (
      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Settings</h1>
        <p className="text-muted-foreground">Please sign in to view your profile settings.</p>
      </main>
    );
  }

  // Fetch user details and statistics
  const [userDetails, projectsCount, journalEntriesCount, timeEntriesCount, peopleCount, companiesCount] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.project.count({ where: { userId } }),
    db.journalEntry.count({ where: { userId } }),
    db.timeEntry.count({ where: { userId } }),
    db.person.count({ where: { userId } }),
    db.company.count({ where: { userId } }),
  ]);

  if (!userDetails) {
    return (
      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Settings</h1>
        <p className="text-muted-foreground">User not found.</p>
      </main>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'EDITOR': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'VIEWER': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      
      {/* User Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </CardTitle>
          <CardDescription>
            Your account information and credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{userDetails.name || 'Not set'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{userDetails.email}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(userDetails.role)}`}>
                  {userDetails.role}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Member Since</label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatDate(userDetails.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <div className="text-xs font-mono bg-muted p-2 rounded border">
                {userDetails.id}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>
            Overview of your activity and data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <FolderOpen className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{projectsCount}</div>
              <div className="text-xs text-muted-foreground">Projects</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{journalEntriesCount}</div>
              <div className="text-xs text-muted-foreground">Journal Entries</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Timer className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{timeEntriesCount}</div>
              <div className="text-xs text-muted-foreground">Time Entries</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{peopleCount}</div>
              <div className="text-xs text-muted-foreground">People</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Building2 className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{companiesCount}</div>
              <div className="text-xs text-muted-foreground">Companies</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
              <div className="text-2xl font-bold">
                {Math.floor((Date.now() - userDetails.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-xs text-muted-foreground">Days Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Details */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Details</CardTitle>
          <CardDescription>
            Login credentials and security information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Login Method</label>
              <div className="text-sm">
                {userDetails.passwordHash ? (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Email & Password
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    OAuth Provider
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email Verified</label>
              <div className="text-sm">
                {userDetails.emailVerified ? (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Verified on {formatDate(userDetails.emailVerified)}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Not verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Features */}
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Features currently in development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <div>• Profile editing and password change</div>
            <div>• Export data to CSV/PDF</div>
            <div>• Account deletion and data export</div>
            <div>• Two-factor authentication</div>
            <div>• Activity logs and session management</div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}


