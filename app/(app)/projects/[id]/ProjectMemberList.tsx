"use client";

import { useState } from "react";
import { inviteProjectMember, removeProjectMember } from "./actions";

interface ProjectMember {
  id: string;
  role: string;
  joinedAt: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  inviter?: {
    id: string;
    name: string | null;
  } | null;
}

interface Project {
  id: string;
  name: string;
  owner?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

interface ProjectMemberListProps {
  project: Project;
  members: ProjectMember[];
  canManageMembers: boolean;
  currentUserId: string;
}

export function ProjectMemberList({ 
  project, 
  members, 
  canManageMembers, 
  currentUserId 
}: ProjectMemberListProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // Store form reference before async operation
    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
      formData.append("projectId", project.id);

      const result = await inviteProjectMember(formData);
      
      if (result.success) {
        // Reset form and close modal
        form.reset();
        setIsInviteModalOpen(false);
        // Page will refresh automatically due to revalidatePath
      } else {
        alert(result.error || "Failed to invite member");
      }
    } catch (error) {
      console.error("Failed to invite member:", error);
      alert("Failed to invite member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberUserId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove "${memberName}" from this project?`)) {
      return;
    }

    setRemovingMemberId(memberUserId);

    try {
      const formData = new FormData();
      formData.append("projectId", project.id);
      formData.append("memberUserId", memberUserId);

      const result = await removeProjectMember(formData);
      
      if (!result.success) {
        alert(result.error || "Failed to remove member");
      }
      // Page will refresh automatically due to revalidatePath on success
    } catch (error) {
      console.error("Failed to remove member:", error);
      alert("Failed to remove member");
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <>
      <div className="space-y-3">
      {/* Project Owner */}
      {project.owner && (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-accent/10">
          <div>
            <div className="font-medium">{project.owner.name || project.owner.email}</div>
            <div className="text-sm text-muted-foreground">Project Owner</div>
          </div>
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
            OWNER
          </span>
        </div>
      )}

      {/* Project Members */}
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <div className="font-medium">{member.user.name || member.user.email}</div>
            <div className="text-sm text-muted-foreground">
              {member.joinedAt ? `Joined ${member.joinedAt.toLocaleDateString()}` : 'Pending invitation'}
              {member.inviter && ` • Invited by ${member.inviter.name}`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              member.role === 'OWNER' ? 'bg-green-100 text-green-800' :
              member.role === 'EDITOR' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {member.role}
            </span>
            {canManageMembers && member.user.id !== currentUserId && (
              <button 
                onClick={() => handleRemoveMember(member.user.id, member.user.name || member.user.email || 'Unknown')}
                disabled={removingMemberId === member.user.id}
                className="text-sm text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removingMemberId === member.user.id ? 'Removing...' : 'Remove'}
              </button>
            )}
          </div>
        </div>
      ))}

      {members.length === 0 && !project.owner && (
        <div className="text-center py-4 text-muted-foreground">
          No members yet
        </div>
      )}

        {/* Add Member Button */}
        {canManageMembers && (
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="w-full p-3 border-2 border-dashed border-muted-foreground/20 rounded-lg text-muted-foreground hover:border-muted-foreground/40 hover:bg-accent/5 transition-colors"
          >
            + Invite Member
          </button>
        )}
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invite Team Member</h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-1">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="VIEWER">Viewer - Can view project data</option>
                  <option value="EDITOR">Editor - Can add and edit data</option>
                  <option value="OWNER">Owner - Full project control</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Inviting..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
